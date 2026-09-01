const cds = require('@sap/cds');
const registerAssetHandlers = require('./lib/asset-handlers');
const registerEnsureEmployee = require('./lib/ensure-employee');

module.exports = cds.service.impl(async function () {
  registerAssetHandlers(this);
  registerEnsureEmployee(this);
});
