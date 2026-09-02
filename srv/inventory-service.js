const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const registerAssetLifecycleHandlers = require('./lib/asset-lifecycle');

module.exports = cds.service.impl(async function () {
  const { SELECT, UPDATE, INSERT } = cds.ql;
  const { Assets, AssetAssignments } = this.entities;

  registerEnsureEmployee(this);
  registerAssetLifecycleHandlers(this);

  this.on('assign', 'Assets', async (req) => {
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
});
