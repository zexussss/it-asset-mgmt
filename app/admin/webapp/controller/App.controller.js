sap.ui.define(["common/controller/ShellController"], function (ShellController) {
  "use strict";

  return ShellController.extend("admin.controller.App", {

    onInit: function () {
      this.configureShell({
        title: "{i18n>appTitle}",
        subtitle: "{i18n>appSubtitle}",
        homeRoute: "home",
        notificationsRoute: "repairRequests",
        sections: [
          { key: "home", text: "{i18n>navOverview}", icon: "sap-icon://home", route: "home" },

          { caption: "{i18n>navSectionOperations}" },

          { key: "assets", text: "{i18n>assets}", icon: "sap-icon://laptop",
            route: "assets", routes: ["assetDetails"] },
          { key: "repairRequests", text: "{i18n>repairRequests}", icon: "sap-icon://wrench",
            route: "repairRequests", routes: ["requestDetails"] },
          { key: "employees", text: "{i18n>employees}", icon: "sap-icon://employee",
            route: "employees" },

          { caption: "{i18n>navSectionInsights}" },

          { key: "statistics", text: "{i18n>technicianStatistics}", icon: "sap-icon://bar-chart",
            route: "statistics" }
        ]
      });
    }
  });
});
