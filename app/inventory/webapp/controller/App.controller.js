sap.ui.define(["common/controller/ShellController"], function (ShellController) {
  "use strict";

  return ShellController.extend("inventory.controller.App", {

    onInit: function () {
      this.configureShell({
        title: "{i18n>appTitle}",
        subtitle: "{i18n>appSubtitle}",
        homeRoute: "home",
        sections: [
          { caption: "{i18n>navSectionInventory}" },
          { key: "assets", text: "{i18n>assets}", icon: "sap-icon://laptop",
            route: "home", routes: ["assetDetails"] },

          { caption: "{i18n>navSectionOrganization}" },
          { key: "employees", text: "{i18n>employees}", icon: "sap-icon://employee",
            route: "employees", routes: ["employeeDetails"] },
          { key: "categories", text: "{i18n>categories}", icon: "sap-icon://tags",
            route: "categories" },

          { caption: "{i18n>navSectionActivity}" },
          { key: "assignments", text: "{i18n>assignments}", icon: "sap-icon://history",
            route: "assignments" }
        ]
      });
    }
  });
});
