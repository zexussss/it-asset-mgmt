const cds = require('@sap/cds');

module.exports = function registerEnsureEmployee(srv) {
  const { SELECT, INSERT } = cds.ql;

  const capitalise = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');

  srv.before('*', async (req) => {
    const email = req.user && req.user.id;
    if (!email || email === 'anonymous') return;

    try {
      const existing = await SELECT.one.from('itam.Employee').columns('ID').where({ email });
      if (existing) return;

      const localPart = email.split('@')[0] || email;
      const parts = localPart.split(/[._\-+]+/).filter(Boolean);

      const firstName = capitalise(parts[0] || localPart);
      const lastName = parts.slice(1).map(capitalise).join(' ');

      await INSERT.into('itam.Employee').entries({
        employeeNumber: `AUTO-${Date.now()}`,
        firstName,
        lastName,
        email,
        department: ''
      });
    } catch (e) { }
  });
};
