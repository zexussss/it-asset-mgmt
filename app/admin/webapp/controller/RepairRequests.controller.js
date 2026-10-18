sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("admin.controller.RepairRequests", {

    onInit: function () {
      this.configureList({
        title: "{i18n>repairRequests}",
        subtitle: "{i18n>repairRequestsSubtitle}",
        crumbs: [
          { text: "{i18n>navOverview}", route: "home" },
          { text: "{i18n>repairRequests}" }
        ],
        route: "repairRequests",
        routeDetails: "requestDetails",
        keyField: "ID",
        entitySet: "/RepairRequests",
        searchFields: ["description", "technician", "asset/inventoryNumber", "asset/name",
                       "requestedBy/firstName", "requestedBy/lastName"],
        sortFields: [
          { field: "createdDate", label: "{i18n>createdDate}" },
          { field: "status_code", label: "{i18n>status}" },
          { field: "priority_code", label: "{i18n>priority}" },
          { field: "technician", label: "{i18n>technician}" },
          { field: "asset/inventoryNumber", label: "{i18n>asset}" }
        ],
        defaultSort: "createdDate",

        filters: [
          { key: "status", label: "{i18n>status}", field: "status_code",
            lookup: { path: "/RepairRequestStatuses", key: "code", text: "name" } },
          { key: "priority", label: "{i18n>priority}", field: "priority_code",
            lookup: { path: "/Priorities", key: "code", text: "name" } },
          { key: "period", label: "{i18n>createdDate}", type: "date",
            fieldFrom: "createdDate", fieldTo: "createdDate" },
          { key: "technician", label: "{i18n>technician}", field: "technician",
            lookup: { path: "/RepairRequests", text: "technician", distinct: true } },
          { key: "asset", label: "{i18n>asset}", field: "asset/inventoryNumber",
            lookup: { path: "/Assets", text: "inventoryNumber", distinct: true } }
        ],
        exportName: "repair-requests",
        exportColumns: [
          { label: "Asset", value: function (o) { return o.asset && o.asset.inventoryNumber; } },
          { label: "Description", value: "description" },
          { label: "Priority", value: "priority_code" },
          { label: "Status", value: "status_code" },
          { label: "Technician", value: "technician" },
          { label: "Created", value: "createdDate" },
          { label: "Resolved", value: "resolvedDate" }
        ]
      });
    }
  });
});
