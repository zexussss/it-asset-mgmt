const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const registerAssetLifecycleHandlers = require('./lib/asset-lifecycle');
const { calculateResolutionDays } = require('./lib/repair-utils');

module.exports = cds.service.impl(async function () {
    const { SELECT } = cds.ql;

    registerEnsureEmployee(this);
    registerAssetLifecycleHandlers(this);

    this.before(['CREATE', 'UPDATE'], 'RepairRequests', async (req) => {
        const { resolvedDate } = req.data;
        if (!resolvedDate) return;

        let createdDate = req.data.createdDate;
        if (!createdDate && req.data.ID) {
            const existing = await SELECT.one.from('itam.RepairRequest').columns('createdDate').where({ ID: req.data.ID });
            createdDate = existing && existing.createdDate;
        }
        if (!createdDate) return;

        req.data.resolutionDays = calculateResolutionDays(createdDate, resolvedDate);
    });
});
