const cds = require('@sap/cds');

module.exports = function registerAssetLifecycleHandlers(srv) {
  const { SELECT, UPDATE } = cds.ql;
  const { Assets } = srv.entities;



  const { AssetAssignment } = cds.entities('itam');

  srv.after('READ', 'Assets', async (assets) => {
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

  srv.before(['CREATE', 'UPDATE'], 'Assets', (req) => {
    const { warrantyEndDate, availabilityStatus_code } = req.data;
    if (warrantyEndDate && availabilityStatus_code === 'ASSIGNED') {
      const expired = new Date(warrantyEndDate) < new Date();
      if (expired) {
        req.info(199, `Asset ${req.data.inventoryNumber || ''} is out of warranty.`);
      }
    }
  });

  srv.before('UPDATE', 'Assets', async (req) => {
    if (req.data.availabilityStatus_code !== 'DECOMMISSIONED') return;

    req.data.assignedTo_ID = null;

    const today = new Date().toISOString().slice(0, 10);
    const assetID = req.data.ID || (req.params && req.params[0] && req.params[0].ID);

    await UPDATE(AssetAssignment)
      .set({ returnedOn: today })
      .where({ asset_ID: assetID, returnedOn: null });
  });
};
