const cds = require('@sap/cds');

module.exports = function registerMe(srv) {
  const { SELECT } = cds.ql;

  srv.on('READ', 'Me', async (req) => {
    const email = req.user && req.user.id;
    const anonymous = !email || email === 'anonymous';

    if (anonymous) {
      return [{
        id: 'anonymous',
        firstName: '',
        lastName: '',
        email: '',
        department: ''
      }];
    }

    const me = await SELECT.one.from('itam.Employee')
      .columns('firstName', 'lastName', 'email', 'department')
      .where({ email });

    return [{
      id: email,
      firstName: (me && me.firstName) || '',
      lastName: (me && me.lastName) || '',
      email: (me && me.email) || email,
      department: (me && me.department) || ''
    }];
  });
};
