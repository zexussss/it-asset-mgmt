sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("employee.controller.MyAssets", {

    onInit: function () {
      this.configureList({
        title: "{i18n>myAssets}",
        subtitle: "{i18n>myAssetsSubtitle}",
        crumbs: [{ text: "{i18n>myAssets}" }],
        keyField: "ID",
        entitySet: "/MyAssets",
        searchFields: ["inventoryNumber", "name", "serialNumber", "manufacturer", "model",
                       "category/name"],
        sortFields: [
          { field: "inventoryNumber", label: "{i18n>inventoryNumber}" },
          { field: "name", label: "{i18n>name}" },
          { field: "category/name", label: "{i18n>category}" },
          { field: "availabilityStatus/name", label: "{i18n>availability}" },
          { field: "repairStatus/name", label: "{i18n>repairStatus}" },
          { field: "purchaseDate", label: "{i18n>purchaseDate}" },
          { field: "warrantyEndDate", label: "{i18n>warrantyEnd}" }
        ],
        defaultSort: "inventoryNumber",

        filters: [
          { key: "category", label: "{i18n>category}", field: "category_code",
            lookup: { path: "/AssetCategories", key: "code", text: "name" } },
          { key: "availability", label: "{i18n>availability}", field: "availabilityStatus_code",
            lookup: { path: "/AssetAvailabilityStatus", key: "code", text: "name" } },
          { key: "repair", label: "{i18n>repairStatus}", field: "repairStatus_code",
            lookup: { path: "/AssetRepairStatus", key: "code", text: "name" } },
          { key: "manufacturer", label: "{i18n>manufacturer}", field: "manufacturer",
            lookup: { path: "/MyAssets", text: "manufacturer", distinct: true } },
          { key: "purchase", label: "{i18n>purchaseDate}", type: "date",
            fieldFrom: "purchaseDate", fieldTo: "purchaseDate" }
        ],
        actions: [
          { text: "{i18n>myRepairRequests}", icon: "sap-icon://wrench",
            action: "onNavRepairRequests" }
        ],
        exportName: "my-assets",
        exportColumns: [
          { label: "Inventory Number", value: "inventoryNumber" },
          { label: "Name", value: "name" },
          { label: "Category", value: "categoryName" },
          { label: "Availability", value: "availabilityStatusName" },
          { label: "Repair Status", value: "repairStatusName" },
          { label: "Serial Number", value: "serialNumber" }
        ]
      });
    },

    onNavRepairRequests: function () {
      this.navTo("repairRequests");
    },



    onReportProblem: function (oEvent) {
      oEvent.cancelBubble();
      this._openDialog("common.fragment.CreateRepairRequestDialog",
        oEvent.getSource().getBindingContext());
    },

    onSelectAsset: function (oEvent) {
      this._openDialog("common.fragment.CreateRepairRequestDialog",
        oEvent.getParameter("listItem").getBindingContext());
    },

    onConfirmCreate: function () {
      var oDialog = this.byId("createRRDialog");
      var sDescription = this.byId("rrDescription").getValue();

      if (!String(sDescription || "").trim()) {
        sap.m.MessageBox.error(this.text("{i18n>fieldRequired}"));
        return;
      }

      this.callAction("EmployeeService.createRepairRequest", {
        description: sDescription,
        priority: this.byId("rrPriority").getSelectedKey()
      }, oDialog.getBindingContext(), function () {
        oDialog.close();
      });
    },

    onCancelCreate: function () {
      this.closeDialog("createRRDialog");
    }
  });
});
