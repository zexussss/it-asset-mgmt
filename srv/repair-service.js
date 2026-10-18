const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const registerMe = require('./lib/me');
const { calculateResolutionDays } = require('./lib/repair-utils');

module.exports = cds.service.impl(async function () {
    const { SELECT, UPDATE, INSERT } = cds.ql;
    const { RepairRequests, RepairLogs } = this.entities;



    const { Asset } = cds.entities('itam');

    registerEnsureEmployee(this);
    registerMe(this);







    async function lookupTechnicianName(req) {
        const email = req.user && req.user.id;
        const employee = email
            ? await SELECT.one.from('itam.Employee').columns('lastName').where({ email })
            : null;

        return (employee && employee.lastName) || null;
    }

    async function resolveTechnicianName(req) {
        const name = await lookupTechnicianName(req);

        if (!name) {
            req.error(400, 'Could not determine the technician from the logged-in user.');
            return null;
        }
        return name;
    }




    this.after('READ', 'RepairRequests', (data) => {
        const list = Array.isArray(data) ? data : [data];
        for (const rr of list) {
            if (!rr) continue;
            const status = rr.status_code;
            rr.canStartRepair    = status === 'OPEN';
            rr.canCompleteRepair = status === 'IN_PROGRESS';
            rr.canRejectRepair   = status === 'OPEN' || status === 'IN_PROGRESS';
            rr.canAddLog         = status === 'OPEN' || status === 'IN_PROGRESS';
        }
    });

    this.on('startRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];

        const current = await SELECT.one.from(RepairRequests).where({ ID });
        if (!current) return req.error(404, 'Repair request not found.');
        if (current.status_code !== 'OPEN') {
            return req.error(400, `Cannot start repair: request is already "${current.status_code}".`);
        }

        const technician = await resolveTechnicianName(req);
        if (!technician) return;

        await UPDATE(RepairRequests, ID).with({ status_code: 'IN_PROGRESS', technician });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'InProgress',
            technician,
            note: `Repair started by ${technician}`
        });

        await UPDATE(Asset, current.asset_ID).with({ repairStatus_code: 'IN_REPAIR' });
        return SELECT.one.from(RepairRequests).where({ ID });
    });

    this.on('completeRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { resolutionNote } = req.data;
        const today = new Date().toISOString().slice(0, 10);

        const current = await SELECT.one.from(RepairRequests).where({ ID });
        if (!current) return req.error(404, 'Repair request not found.');
        if (current.status_code !== 'IN_PROGRESS') {
            return req.error(400, `Cannot complete repair: request is "${current.status_code}", not "IN_PROGRESS".`);
        }

        const technician = await resolveTechnicianName(req);
        if (!technician) return;

        const resolutionDays = calculateResolutionDays(current.createdDate, today);
        await UPDATE(RepairRequests, ID).with({
            status_code: 'COMPLETED',
            resolvedDate: today,
            resolutionDays,
            technician
        });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'Fixed',
            technician,
            note: resolutionNote
        });

        await UPDATE(Asset, current.asset_ID).with({ repairStatus_code: 'OK' });
        return SELECT.one.from(RepairRequests).where({ ID });
    });

    this.on('rejectRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { reason } = req.data;

        const current = await SELECT.one.from(RepairRequests).where({ ID });
        if (!current) return req.error(404, 'Repair request not found.');
        if (!['OPEN', 'IN_PROGRESS'].includes(current.status_code)) {
            return req.error(400, `Cannot reject: request is already "${current.status_code}".`);
        }

        const technician = await resolveTechnicianName(req);
        if (!technician) return;


        await UPDATE(RepairRequests, ID).with({
            status_code: 'REJECTED',
            technician: current.technician || technician
        });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'Rejected',
            technician,
            note: reason
        });

        await UPDATE(Asset, current.asset_ID).with({ repairStatus_code: 'OK' });
        return SELECT.one.from(RepairRequests).where({ ID });
    });




    this.on('addLog', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { note } = req.data;

        const current = await SELECT.one.from(RepairRequests).where({ ID });
        if (!current) return req.error(404, 'Repair request not found.');
        if (!['OPEN', 'IN_PROGRESS'].includes(current.status_code)) {
            return req.error(400, 'Cannot add a log entry to a closed repair request.');
        }
        if (!note || !note.trim()) {
            return req.error(400, 'Please enter a note for the log entry.');
        }

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'Note',
            technician: current.technician || await lookupTechnicianName(req),
            note
        });

        return SELECT.one.from(RepairRequests).where({ ID });
    });

    this.after('CREATE', 'RepairRequests', async (rr) => {
        if (!rr || !rr.ID) return;
        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: rr.ID,
            logDate: new Date().toISOString(),
            actionType: 'Diagnosis',
            note: 'Request received by repair team.'
        });
    });
});
