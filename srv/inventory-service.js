const cds = require('@sap/cds');
const registerAssetHandlers = require('./lib/asset-handlers');
const registerEnsureEmployee = require('./lib/ensure-employee');

module.exports = cds.service.impl(async function () {
    const { SELECT, INSERT } = cds.ql;
    const { MyAssets, MyRepairRequests } = this.entities;

    registerEnsureEmployee(this);
    registerAssetHandlers(this);

    this.before('READ', 'MyAssets', (req) => {
        req.query.where([{ ref: ['assignedTo', 'email'] }, '=', { val: req.user.id }]);
    });

    this.before('READ', 'MyRepairRequests', (req) => {
        req.query.where([{ ref: ['requestedBy', 'email'] }, '=', { val: req.user.id }]);
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