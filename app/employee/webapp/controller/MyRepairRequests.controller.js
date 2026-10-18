sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("employee.controller.MyRepairRequests", {

    onInit: function () {
      this.configureList({
        title: "{i18n>myRepairRequests}",
        subtitle: "{i18n>myRepairRequestsSubtitle}",
        crumbs: [{ text: "{i18n>myRepairRequests}" }],
        routeDetails: "repairRequest",
        keyField: "ID",
        entitySet: "/MyRepairRequests",
        searchFields: ["description", "assetInventoryNumber", "assetName"],
        sortFields: [
          { field: "createdDate", label: "{i18n>createdDate}" },
          { field: "status_code", label: "{i18n>status}" },
          { field: "priority_code", label: "{i18n>priority}" },
          { field: "assetInventoryNumber", label: "{i18n>asset}" }
        ],
        defaultSort: "createdDate",

        filters: [
          { key: "status", label: "{i18n>status}", field: "status_code",
            lookup: { path: "/RepairRequestStatuses", key: "code", text: "name" } },
          { key: "priority", label: "{i18n>priority}", field: "priority_code",
            lookup: { path: "/Priorities", key: "code", text: "name" } }
        ],
        exportName: "my-repair-requests",
        exportColumns: [
          { label: "Asset", value: "assetInventoryNumber" },
          { label: "Asset Name", value: "assetName" },
          { label: "Description", value: "description" },
          { label: "Priority", value: "priority_code" },
          { label: "Status", value: "status_code" },
          { label: "Created", value: "createdDate" },
          { label: "Resolved", value: "resolvedDate" }
        ]
      });
    }
  });
});
