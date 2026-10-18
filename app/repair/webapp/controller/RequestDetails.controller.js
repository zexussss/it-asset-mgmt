sap.ui.define([
  "common/controller/DetailController",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (DetailController, MessageBox, MessageToast) {
  "use strict";

  return DetailController.extend("repair.controller.RequestDetails", {

    onInit: function () {
      this.bindDetailRoute(
        "requestDetails",
        "/RepairRequests",
        "asset($expand=assignedTo),repairLogs,status,priority,requestedBy",
        {
          titleFields: ["assetName"],
          titleFormatter: function (oData, oController) {
            return oData.assetName || oData.assetInventoryNumber ||
                   oController.text("{i18n>requestDetails}");
          },
          subtitleFormatter: function (oData) {
            return oData.assetInventoryNumber || "";
          },

          actions: [
            { text: "{i18n>startRepair}", icon: "sap-icon://begin", type: "Emphasized",
              action: "onStartRepair", enabledFrom: "canStartRepair" },
            { text: "{i18n>completeRepair}", icon: "sap-icon://accept", type: "Accept",
              action: "onCompleteRepair", enabledFrom: "canCompleteRepair" },
            { text: "{i18n>reject}", icon: "sap-icon://decline", type: "Reject",
              action: "onRejectRepair", enabledFrom: "canRejectRepair" },
            { text: "{i18n>addLog}", icon: "sap-icon://add-document",
              action: "onAddLog", enabledFrom: "canAddLog" }
          ],
          crumbs: [
            { text: "{i18n>repairQueue}", route: "home" },
            { text: "{i18n>loading}" }
          ]
        }
      );
    },



    _context: function () {
      return this.getView().getBindingContext();
    },

    onStartRepair: function () {
      this.callAction("RepairService.startRepair", {}, this._context());
    },

    onCompleteRepair: function () {
      this.askForText({
        title: "{i18n>completeRepair}",
        label: "{i18n>resolutionNote}",
        placeholder: "{i18n>resolutionNotePlaceholder}"
      }, function (sNote) {
        this.callAction("RepairService.completeRepair",
          { resolutionNote: sNote }, this._context());
      }.bind(this));
    },

    onRejectRepair: function () {
      this.askForText({
        title: "{i18n>reject}",
        label: "{i18n>rejectReason}",
        placeholder: "{i18n>rejectReasonPlaceholder}"
      }, function (sReason) {
        this.callAction("RepairService.rejectRepair",
          { reason: sReason }, this._context());
      }.bind(this));
    },

    onAddLog: function () {
      this._openDialog("common.fragment.AddLogDialog");
    },

    onConfirmAddLog: function () {
      var oDialog = this.byId("addLogDialog");
      var sNote = this.byId("noteInput").getValue();

      if (!String(sNote || "").trim()) {
        MessageBox.error(this.text("{i18n>fieldRequired}"));
        return;
      }

      this.callAction("RepairService.addLog", { note: sNote }, this._context(), function () {
        oDialog.close();
      });
    },

    onCancelAddLog: function () {
      this.closeDialog("addLogDialog");
    }
  });
});
