sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("admin.controller.Assets", {

    onInit: function () {
      this.configureList({
        title: "{i18n>assets}",
        subtitle: "{i18n>assetsSubtitle}",
        crumbs: [
          { text: "{i18n>navOverview}", route: "home" },
          { text: "{i18n>assets}" }
        ],
        route: "assets",
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
        exportName: "assets",
        exportColumns: [
          { label: "Inventory Number", value: "inventoryNumber" },
          { label: "Name", value: "name" },
          { label: "Category", value: "category_code" },
          { label: "Availability", value: "availabilityStatus_code" },
          { label: "Repair Status", value: "repairStatus_code" },
          { label: "Serial Number", value: "serialNumber" },
          { label: "Manufacturer", value: "manufacturer" },
          { label: "Model", value: "model" },
          { label: "Warranty End", value: "warrantyEndDate" }
        ]
      });
    }
  });
});
