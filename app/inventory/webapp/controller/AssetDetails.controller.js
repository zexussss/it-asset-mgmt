sap.ui.define(["common/controller/DetailController"], function (DetailController) {
  "use strict";

  return DetailController.extend("inventory.controller.AssetDetails", {

    onInit: function () {
      this.bindDetailRoute(
        "assetDetails",
        "/Assets",
        "category,assignedTo,availabilityStatus,repairStatus," +
        "assignmentHistory($expand=employee),repairRequests,notes",
        {
          titleFields: ["name"],
          subtitleFields: ["inventoryNumber"],
          actions: [
            { text: "{i18n>assignAsset}", icon: "sap-icon://employee",
              action: "onAssign", enabledFrom: "isAssignable" },
            { text: "{i18n>deassignAsset}", icon: "sap-icon://undo",
              action: "onDeassign", enabledFrom: "isAssigned" }
          ],
          crumbs: [
            { text: "{i18n>assets}", route: "home" },
            { text: "{i18n>loading}" }
          ]
        }
      );
    },



    onAssign: function () {
      this._openDialog("common.fragment.AssignDialog", this.getView().getBindingContext());
    },

    onConfirmAssign: function () {
      var oDialog = this.byId("assignDialog");
      var sEmployeeId = this.byId("employeeSelect").getSelectedKey();

      if (!sEmployeeId) { return; }

      this.callAction("InventoryService.assign", { employeeID: sEmployeeId },
        oDialog.getBindingContext(), function () {
          oDialog.close();
        });
    },

    onCancelAssign: function () {
      this.closeDialog("assignDialog");
    },

    onDeassign: function () {
      var that = this;
      var oData = this.getView().getBindingContext().getObject();
      var sName = [oData.inventoryNumber, oData.name].filter(Boolean).join(" — ");

      this.confirm(
        this.i18n("deassignConfirm", [sName]),
        this.i18n("deassignAsset")
      ).then(function (bOk) {
        if (!bOk) { return; }
        that.callAction("InventoryService.deassign", {},
          that.getView().getBindingContext(), function () {
            that.getView().getElementBinding().refresh();
          });
      });
    }
  });
});
