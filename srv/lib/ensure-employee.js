const cds = require('@sap/cds');


module.exports = function registerEnsureEmployee(srv) {
  const { SELECT, INSERT } = cds.ql;

  srv.before('*', async (req) => {
    const email = req.user && req.user.id;
    if (!email || email === 'anonymous') return;

    try {
      const existing = await SELECT.one.from('itam.Employee').columns('ID').where({ email });
      if (existing) return;

      const localPart = email.split('@')[0] || email;
      const guessedName = localPart.charAt(0).toUpperCase() + localPart.slice(1);

      await INSERT.into('itam.Employee').entries({
        employeeNumber: `AUTO-${Date.now()}`,
        firstName: guessedName,
        lastName: '',
        email,
        department: ''
      });
    } catch (e) {
    }
  });
};
