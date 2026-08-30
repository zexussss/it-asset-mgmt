const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { SELECT, UPDATE } = cds.ql;
    const { Assets, AssetAssignments } = this.entities;


    this.after('READ', 'Assets', async (assets) => {
        const list = Array.isArray(assets) ? assets : [assets];
        for (const asset of list) {
            if (!asset || !asset.ID) continue;

            const requests = await SELECT.from('itam.RepairRequest')
                .columns('createdDate', 'resolvedDate')
                .where({ asset_ID: asset.ID, status_code: 'COMPLETED' });

            const durations = requests
                .filter(r => r.createdDate && r.resolvedDate)
                .map(r => (new Date(r.resolvedDate) - new Date(r.createdDate)) / (1000 * 60 * 60 * 24));

            asset.averageRepairDays = durations.length
                ? Math.round((durations.reduce((a, b) => a + b, 0) / durations.length) * 10) / 10
                : null;
        }
    });


    this.before(['CREATE', 'UPDATE'], 'Assets', (req) => {
        const { warrantyEndDate, availabilityStatus_code } = req.data;
        if (warrantyEndDate && availabilityStatus_code === 'ASSIGNED') {
            const expired = new Date(warrantyEndDate) < new Date();
            if (expired) {
                req.info(199, `Asset ${req.data.inventoryNumber || ''} is out of warranty.`);
            }
        }
    });

    this.before('UPDATE', 'Assets', async (req) => {
        if (req.data.availabilityStatus_code !== 'DECOMMISSIONED') return;

        req.data.assignedTo_ID = null;

        const today = new Date().toISOString().slice(0, 10);
        await UPDATE(AssetAssignments)
            .set({ returnedOn: today })
            .where({ asset_ID: req.data.ID, returnedOn: null });
    });

    this.before(['CREATE', 'UPDATE'], 'RepairRequests', async (req) => {
        const { resolvedDate } = req.data;
        if (!resolvedDate) return;

        let createdDate = req.data.createdDate;
        if (!createdDate && req.data.ID) {
            const existing = await SELECT.one.from('itam.RepairRequest').columns('createdDate').where({ ID: req.data.ID });
            createdDate = existing && existing.createdDate;
        }
        if (!createdDate) return;

        req.data.resolutionDays = Math.max(0, Math.round((new Date(resolvedDate) - new Date(createdDate)) / 86400000));
    });
});
