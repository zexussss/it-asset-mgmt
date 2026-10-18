sap.ui.define(["common/controller/DetailController"], function (DetailController) {
  "use strict";

  return DetailController.extend("employee.controller.RepairRequestDetails", {

    onInit: function () {
      this.bindDetailRoute(
        "repairRequest",
        "/MyRepairRequests",
        "asset,repairLogs,status,priority",
        {
          titleFields: ["assetInventoryNumber"],
          titleFormatter: function (oData, oController) {
            return oData.assetInventoryNumber || oController.text("{i18n>requestDetails}");
          },
          subtitleFormatter: function (oData) {
            return oData.assetName || "";
          },
          crumbs: [
            { text: "{i18n>myRepairRequests}", route: "repairRequests" },
            { text: "{i18n>loading}" }
          ]
        }
      );
    }
  });
});
