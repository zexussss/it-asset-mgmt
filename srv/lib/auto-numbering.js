const cds = require('@sap/cds');

const RULES = {
  Assets:    { field: 'inventoryNumber', prefix: 'INV-', digits: 4, table: 'Asset' },
  Employees: { field: 'employeeNumber',  prefix: 'E',    digits: 4, table: 'Employee' }
};

module.exports = function registerAutoNumbering(srv, aEntities) {
  const { SELECT } = cds.ql;
  const db = cds.entities('itam');

  function nextNumber(oRule, iMax) {
    return oRule.prefix + String(iMax + 1).padStart(oRule.digits, '0');
  }

  async function currentMax(oRule) {
    const rows = await SELECT.from(db[oRule.table]).columns(oRule.field);
    const re = new RegExp('^' + oRule.prefix.replace(/-/g, '\\-') + '(\\d+)$', 'i');
    let max = 0;
    for (const row of rows) {
      const m = re.exec((row && row[oRule.field]) || '');
      if (m) { max = Math.max(max, Number(m[1])); }
    }
    return max;
  }

  function isDraftTarget(req) {
    const sName = (req.target && req.target.name) || '';
    return /\.drafts$/i.test(sName);
  }

  for (const sEntity of aEntities || []) {
    const oRule = RULES[sEntity];
    if (!oRule || !srv.entities[sEntity]) { continue; }

    const assign = async function (req) {
      const data = req.data || {};


      if (isDraftTarget(req)) {
        if (!data[oRule.field]) {
          data[oRule.field] = nextNumber(oRule, await currentMax(oRule));
        }
        return;
      }



      if (data[oRule.field]) {
        const where = {};
        where[oRule.field] = data[oRule.field];
        const taken = await SELECT.one.from(db[oRule.table]).columns(oRule.field).where(where);
        if (!taken) { return; }
      }
      data[oRule.field] = nextNumber(oRule, await currentMax(oRule));
    };

    srv.before(['NEW', 'CREATE'], sEntity + '.drafts', assign);
    srv.before('CREATE', sEntity, assign);
  }
};
