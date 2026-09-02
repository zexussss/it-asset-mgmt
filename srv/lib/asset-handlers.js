const cds = require('@sap/cds');


module.exports = function registerAssetHandlers(srv) {
  const { SELECT, UPDATE, INSERT } = cds.ql;
  const { Assets, AssetAssignments } = srv.entities;

  srv.on('assign', 'Assets', async (req) => {
    const { ID } = req.params[0];
    const { employeeID } = req.data;

    if (!employeeID) {
      return req.error(400, 'Please select an employee to assign this asset to.');
    }

    const asset = await SELECT.one.from(Assets).where({ ID });
    if (!asset) {
      return req.error(404, 'Asset not found.');
    }
    if (asset.availabilityStatus_code !== 'IN_STOCK') {
      return req.error(400, 'Only assets that are in stock can be assigned.');
    }

    const employee = await SELECT.one.from('itam.Employee').where({ ID: employeeID });
    if (!employee) {
      return req.error(404, 'Employee not found.');
    }

    const today = new Date().toISOString().slice(0, 10);

    await UPDATE(Assets, ID).with({
      assignedTo_ID: employeeID,
      availabilityStatus_code: 'ASSIGNED'
    });

    await INSERT.into(AssetAssignments).entries({
      asset_ID: ID,
      employee_ID: employeeID,
      assignedFrom: today,
      returnedOn: null
    });

    return await SELECT.one.from(Assets).where({ ID });
  });

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
    await UPDATE(AssetAssignments)
      .set({ returnedOn: today })
      .where({ asset_ID: req.data.ID, returnedOn: null });
  });
};
