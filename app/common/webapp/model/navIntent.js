sap.ui.define([], function () {
  "use strict";


  var mIntents = {};

  return {


    set: function (sRoute, oValues) {
      if (sRoute) { mIntents[sRoute] = oValues || {}; }
    },

    consume: function (sRoute) {
      var oValues = sRoute ? mIntents[sRoute] : null;
      if (sRoute) { delete mIntents[sRoute]; }
      return oValues || null;
    }
  };
});
