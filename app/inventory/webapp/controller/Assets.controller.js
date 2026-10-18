sap.ui.define([
  "common/controller/ListController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (ListController, JSONModel, MessageBox, MessageToast) {
  "use strict";

  return ListController.extend("inventory.controller.Assets", {

    onInit: function () {
      this.configureList({
        title: "{i18n>assets}",
        subtitle: "{i18n>assetsSubtitle}",
        crumbs: [{ text: "{i18n>assets}" }],
        route: "home",
        routeDetails: "assetDetails",
        keyField: "ID",
        entitySet: "/Assets",
        searchFields: ["inventoryNumber", "name", "serialNumber", "manufacturer", "model",
                       "assignedTo/firstName", "assignedTo/lastName", "category/name"],
        sortFields: [
          { field: "inventoryNumber", label: "{i18n>inventoryNumber}" },
          { field: "name", label: "{i18n>name}" },
          { field: "category/name", label: "{i18n>category}" },
          { field: "availabilityStatus/name", label: "{i18n>availability}" },
          { field: "repairStatus/name", label: "{i18n>repairStatus}" },
          { field: "assignedTo/lastName", label: "{i18n>assignedTo}" },
          { field: "purchaseDate", label: "{i18n>purchaseDate}" },
          { field: "warrantyEndDate", label: "{i18n>warrantyEnd}" }
        ],
        defaultSort: "inventoryNumber",

        filters: [
          { key: "category", label: "{i18n>category}", field: "category_code",
            lookup: { path: "/AssetCategories", key: "code", text: "name" } },
          { key: "availability", label: "{i18n>availability}", field: "availabilityStatus_code",
            lookup: { path: "/AssetAvailabilityStatuses", key: "code", text: "name" } },
          { key: "repair", label: "{i18n>repairStatus}", field: "repairStatus_code",
            lookup: { path: "/AssetRepairStatuses", key: "code", text: "name" } },
          { key: "manufacturer", label: "{i18n>manufacturer}", field: "manufacturer",
            lookup: { path: "/Assets", text: "manufacturer", distinct: true } },
          { key: "assignee", label: "{i18n>assignedTo}", field: "assignedTo/lastName",
            lookup: { path: "/Employees", text: "lastName", distinct: true } }
        ],
        createEnabled: true,
        createText: "{i18n>addAsset}",
        exportName: "inventory-assets",
        exportColumns: [
          { label: "Inventory Number", value: "inventoryNumber" },
          { label: "Name", value: "name" },
          { label: "Category", value: "category_code" },
          { label: "Availability", value: "availabilityStatus_code" },
          { label: "Repair Status", value: "repairStatus_code" },
          { label: "Serial Number", value: "serialNumber" },
          { label: "Manufacturer", value: "manufacturer" },
          { label: "Model", value: "model" }
        ]
      });
    },



    onAssign: function (oEvent) {
      oEvent.cancelBubble();
      var oCtx = oEvent.getSource().getBindingContext();
      this._openDialog("common.fragment.AssignDialog", oCtx);
    },

    onConfirmAssign: function () {
      var oDialog = this.byId("assignDialog");
      var oCtx = oDialog.getBindingContext();
      var sEmployeeId = this.byId("employeeSelect").getSelectedKey();

      if (!sEmployeeId) {
        return;
      }
      this.callAction("InventoryService.assign", { employeeID: sEmployeeId }, oCtx, function () {
        oDialog.close();
      });
    },

    onCancelAssign: function () {
      this.closeDialog("assignDialog");
    },



    onDeassign: function (oEvent) {
      oEvent.cancelBubble();
      this.deassign(oEvent.getSource().getBindingContext());
    },

    deassign: function (oCtx) {
      var that = this;
      var oData = oCtx.getObject();
      var sName = [oData.inventoryNumber, oData.name].filter(Boolean).join(" — ");

      this.confirm(
        this.i18n("deassignConfirm", [sName]),
        this.i18n("deassignAsset")
      ).then(function (bOk) {
        if (!bOk) { return; }
        that.callAction("InventoryService.deassign", {}, oCtx);
      });
    },



    onCreate: function () {
      var oView = this.getView();
      var oDlg = oView.getModel("dlg") || new JSONModel({});

      oDlg.setData({
        inventoryNumber: this.i18n("inventoryNumberAuto"),
        name: "",
        category_code: "",
        serialNumber: "",
        manufacturer: "",
        model: "",
        purchaseDate: "",
        warrantyEndDate: "",
        price: ""
      });
      oView.setModel(oDlg, "dlg");

      this._openDialog("common.fragment.AddAssetDialog");
    },

    onConfirmCreate: function () {
      if (this._bCreating) { return; }

      var oDlg = this.getView().getModel("dlg").getData();

      if (!String(oDlg.name || "").trim()) {
        MessageBox.error(this.i18n("fieldRequired"));
        return;
      }
      if (!oDlg.category_code) {
        MessageBox.error(this.i18n("fieldRequired"));
        return;
      }



      var oPayload = {
        name: String(oDlg.name).trim(),
        category_code: oDlg.category_code
      };
      ["serialNumber", "manufacturer", "model"].forEach(function (sField) {
        if (String(oDlg[sField] || "").trim()) {
          oPayload[sField] = String(oDlg[sField]).trim();
        }
      });
      ["purchaseDate", "warrantyEndDate"].forEach(function (sField) {
        if (oDlg[sField]) { oPayload[sField] = oDlg[sField]; }
      });
      if (oDlg.price !== "" && oDlg.price !== null && oDlg.price !== undefined) {
        oPayload.price = String(oDlg.price);
      }

      var that = this;
      var oModel = this.getView().getModel();
      var oTable = this.byId("mainTable");
      var oBinding = oTable.getBinding("items");
      var oDialog = this.byId("addAssetDialog");

      this._bCreating = true;
      if (oDialog && oDialog.setBusy) { oDialog.setBusy(true); }


      var oContext = oBinding.create(oPayload, true);

      oContext.created()
        .then(function () {
          return oModel.bindContext("InventoryService.draftActivate(...)", oContext).execute();
        })
        .then(function () {
          that._bCreating = false;
          if (oDialog && oDialog.setBusy) { oDialog.setBusy(false); }
          that.closeDialog("addAssetDialog");
          oBinding.refresh();
          MessageToast.show(that.i18n("assetCreated"));
        })
        .catch(function (oError) {
          that._bCreating = false;
          if (oDialog && oDialog.setBusy) { oDialog.setBusy(false); }
          var sMessage = (oError && oError.message)
            || (oError && oError.error && oError.error.message)
            || that.i18n("createFailed");
          MessageBox.error(sMessage);
        });
    },

    onCancelCreate: function () {
      this.closeDialog("addAssetDialog");
    }
  });
});
