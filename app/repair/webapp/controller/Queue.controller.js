sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("repair.controller.Queue", {

    onInit: function () {
      this.configureList({
        title: "{i18n>repairQueue}",
        subtitle: "{i18n>repairQueueSubtitle}",
        crumbs: [{ text: "{i18n>repairQueue}" }],
        routeDetails: "requestDetails",
        keyField: "ID",
        entitySet: "/RepairRequests",
        searchFields: ["description", "assetInventoryNumber", "assetName", "technician",
                       "requestedBy/firstName", "requestedBy/lastName"],
        sortFields: [
          { field: "createdDate", label: "{i18n>createdDate}" },
          { field: "status_code", label: "{i18n>status}" },
          { field: "priority_code", label: "{i18n>priority}" },
          { field: "technician", label: "{i18n>technician}" },
          { field: "assetInventoryNumber", label: "{i18n>asset}" }
        ],
        defaultSort: "createdDate",

        filters: [
          { key: "status", label: "{i18n>status}", field: "status_code",
            lookup: { path: "/RepairRequestStatuses", key: "code", text: "name" } },
          { key: "priority", label: "{i18n>priority}", field: "priority_code",
            lookup: { path: "/Priorities", key: "code", text: "name" } },
          { key: "technician", label: "{i18n>technician}", field: "technician",
            lookup: { path: "/RepairRequests", text: "technician", distinct: true } },
          { key: "asset", label: "{i18n>asset}", field: "assetInventoryNumber",
            lookup: { path: "/RepairRequests", text: "assetInventoryNumber", distinct: true } },
          { key: "period", label: "{i18n>period}", type: "date",
            fieldFrom: "createdDate", fieldTo: "createdDate" }
        ],
        actions: [
          { text: "{i18n>onlyOpen}", icon: "sap-icon://filter", action: "onShowOpenOnly" }
        ],
        exportName: "repair-queue",
        exportColumns: [
          { label: "Asset", value: "assetInventoryNumber" },
          { label: "Asset Name", value: "assetName" },
          { label: "Description", value: "description" },
          { label: "Priority", value: "priority_code" },
          { label: "Status", value: "status_code" },
          { label: "Technician", value: "technician" },
          { label: "Created", value: "createdDate" }
        ]
      });
    },


    onShowOpenOnly: function () {
      var oUi = this._ensurePageModel();
      var aFilters = oUi.getProperty("/filters") || [];
      var iIndex = aFilters.findIndex(function (oFilter) { return oFilter.key === "status"; });

      if (iIndex >= 0) {
        oUi.setProperty("/filters/" + iIndex + "/selectedKey", "OPEN");
        this._applyFilters();
      }
    }
  });
});
