const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const registerMe = require('./lib/me');

module.exports = cds.service.impl(async function () {
    const { SELECT, INSERT } = cds.ql;
    const { MyAssets, MyRepairRequests } = this.entities;

    registerEnsureEmployee(this);
    registerMe(this);


    async function currentEmployeeID(req) {
        const employee = await SELECT.one.from('itam.Employee').columns('ID').where({ email: req.user.id });
        return employee && employee.ID;
    }

    this.before('READ', 'MyAssets', async (req) => {
        req.query.where({ assignedTo_ID: (await currentEmployeeID(req)) || null });
    });

    this.before('READ', 'MyRepairRequests', async (req) => {
        req.query.where({ requestedBy_ID: (await currentEmployeeID(req)) || null });
    });

    this.on('createRepairRequest', 'MyAssets', async (req) => {
        const { ID: assetID } = req.params[0];
        const { description, priority } = req.data;

        const employee = await SELECT.one.from('itam.Employee').where({ email: req.user.id });
        if (!employee) {
            return req.error(403, 'No employee master record found for the current user.');
        }

        const asset = await SELECT.one.from('itam.Asset').where({ ID: assetID, assignedTo_ID: employee.ID });
        if (!asset) {
            return req.error(404, 'Asset not found or not assigned to you.');
        }

        const { ID } = await INSERT.into('itam.RepairRequest').entries({
            asset_ID: assetID,
            requestedBy_ID: employee.ID,
            description,
            priority_code: priority || 'MEDIUM',
            status_code: 'OPEN',
            createdDate: new Date().toISOString().slice(0, 10)
        });

        return await SELECT.one.from(MyRepairRequests).where({ ID });
    });
});
