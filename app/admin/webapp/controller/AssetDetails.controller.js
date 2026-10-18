sap.ui.define(["common/controller/DetailController"], function (DetailController) {
  "use strict";

  return DetailController.extend("admin.controller.AssetDetails", {

    onInit: function () {
      this.bindDetailRoute(
        "assetDetails",
        "/Assets",
        "category,assignedTo,availabilityStatus,repairStatus," +
        "assignmentHistory($expand=employee),repairRequests($expand=status,priority),notes",
        {
          titleFields: ["name"],
          subtitleFields: ["inventoryNumber"],
          crumbs: [
            { text: "{i18n>navOverview}", route: "home" },
            { text: "{i18n>assets}", route: "assets" },
            { text: "{i18n>loading}" }
          ]
        }
      );
    }
  });
});
