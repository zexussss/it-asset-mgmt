sap.ui.define(["common/controller/ShellController"], function (ShellController) {
  "use strict";

  return ShellController.extend("repair.controller.App", {

    onInit: function () {
      this.configureShell({
        title: "{i18n>appTitle}",
        subtitle: "{i18n>appSubtitle}",
        homeRoute: "home",
        sections: [
          { caption: "{i18n>navSectionRepair}" },
          { key: "queue", text: "{i18n>repairQueue}", icon: "sap-icon://wrench",
            route: "home", routes: ["requestDetails"] }
        ]
      });
    }
  });
});
