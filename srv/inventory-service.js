const cds = require('@sap/cds');
const registerAssetHandlers = require('./lib/asset-handlers');

module.exports = cds.service.impl(async function () {
  registerAssetHandlers(this);
});
