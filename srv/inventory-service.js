const cds = require('@sap/cds');
const registerEnsureEmployee = require('./lib/ensure-employee');
const registerMe = require('./lib/me');
const registerAssetLifecycleHandlers = require('./lib/asset-lifecycle');
const registerAutoNumbering = require('./lib/auto-numbering');

module.exports = cds.service.impl(async function () {
  const { SELECT, UPDATE, INSERT } = cds.ql;
  const { Assets, AssetAssignments } = this.entities;

  registerEnsureEmployee(this);
    registerMe(this);
  registerAssetLifecycleHandlers(this);
  registerAutoNumbering(this, ['Assets', 'Employees']);

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


  this.on('deassign', 'Assets', async (req) => {
    const { ID } = req.params[0];

    const asset = await SELECT.one.from(Assets).where({ ID });
    if (!asset) {
      return req.error(404, 'Asset not found.');
    }
    if (!asset.assignedTo_ID) {
      return req.error(400, 'This asset is not assigned to an employee.');
    }

    const today = new Date().toISOString().slice(0, 10);

    await UPDATE(AssetAssignments)
      .set({ returnedOn: today })
      .where({ asset_ID: ID, returnedOn: null });

    await UPDATE(Assets, ID).with({
      assignedTo_ID: null,
      availabilityStatus_code: 'IN_STOCK'
    });

    return await SELECT.one.from(Assets).where({ ID });
  });
});
