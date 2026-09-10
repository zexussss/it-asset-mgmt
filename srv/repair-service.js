const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const { calculateResolutionDays } = require('./lib/repair-utils');

module.exports = cds.service.impl(async function () {
    const { SELECT, UPDATE, INSERT } = cds.ql;
    const { RepairRequests, RepairLogs, Assets } = this.entities;

    registerEnsureEmployee(this);

    this.on('startRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { technician } = req.data;

        await UPDATE(RepairRequests, ID).with({ status_code: 'IN_PROGRESS', technician });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'InProgress',
            technician,
            note: `Repair started by ${technician || 'technician'}`
        });

        const rr = await SELECT.one.from(RepairRequests).where({ ID });
        if (rr && rr.asset_ID) {
            await UPDATE(Assets, rr.asset_ID).with({ repairStatus_code: 'IN_REPAIR' });
        }
        return rr;
    });

    this.on('completeRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { resolutionNote } = req.data;
        const today = new Date().toISOString().slice(0, 10);

        const before = await SELECT.one.from(RepairRequests).where({ ID });
        const resolutionDays = calculateResolutionDays(before && before.createdDate, today);

        await UPDATE(RepairRequests, ID).with({ status_code: 'COMPLETED', resolvedDate: today, resolutionDays });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'Fixed',
            note: resolutionNote
        });

        const rr = await SELECT.one.from(RepairRequests).where({ ID });
        if (rr && rr.asset_ID) {
            await UPDATE(Assets, rr.asset_ID).with({ repairStatus_code: 'OK' });
        }
        return rr;
    });

    this.on('rejectRepair', 'RepairRequests', async (req) => {
        const { ID } = req.params[0];
        const { reason } = req.data;

        await UPDATE(RepairRequests, ID).with({ status_code: 'REJECTED' });

        await INSERT.into(RepairLogs).entries({
            repairRequest_ID: ID,
            logDate: new Date().toISOString(),
            actionType: 'Rejected',
            note: reason
        });

        const rr = await SELECT.one.from(RepairRequests).where({ ID });
        if (rr && rr.asset_ID) {
            await UPDATE(Assets, rr.asset_ID).with({ repairStatus_code: 'OK' });
        }
        return rr;
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
