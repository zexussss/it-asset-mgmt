sap.ui.define(["common/controller/ShellController"], function (ShellController) {
  "use strict";

  return ShellController.extend("employee.controller.App", {

    onInit: function () {
      this.configureShell({
        title: "{i18n>appTitle}",
        subtitle: "{i18n>appSubtitle}",
        homeRoute: "home",
        sections: [
          { caption: "{i18n>navSectionWorkspace}" },
          { key: "myAssets", text: "{i18n>myAssets}", icon: "sap-icon://laptop",
            route: "home" },
          { key: "myRepairRequests", text: "{i18n>myRepairRequests}", icon: "sap-icon://wrench",
            route: "repairRequests", routes: ["repairRequest"] }
        ]
      });
    }
  });
});
