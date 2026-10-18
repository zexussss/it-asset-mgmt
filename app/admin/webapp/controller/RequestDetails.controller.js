sap.ui.define(["common/controller/DetailController"], function (DetailController) {
  "use strict";

  return DetailController.extend("admin.controller.RequestDetails", {

    onInit: function () {
      this.bindDetailRoute(
        "requestDetails",
        "/RepairRequests",
        "asset($expand=assignedTo),repairLogs,status,priority,requestedBy",
        {
          titleFields: ["asset/inventoryNumber"],
          subtitleFields: [],
          titleFormatter: function (oData, oController) {
            return (oData.asset && oData.asset.inventoryNumber) ||
                   oController.text("{i18n>requestDetails}");
          },
          subtitleFormatter: function (oData) {
            return (oData.asset && oData.asset.name) || "";
          },
          crumbs: [
            { text: "{i18n>navOverview}", route: "home" },
            { text: "{i18n>repairRequests}", route: "repairRequests" },
            { text: "{i18n>loading}" }
          ]
        }
      );
    }
  });
});
