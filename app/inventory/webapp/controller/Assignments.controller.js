sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("inventory.controller.Assignments", {

    onInit: function () {
      this.configureList({
        title: "{i18n>assignments}",
        subtitle: "{i18n>assignmentsSubtitle}",
        crumbs: [{ text: "{i18n>assignments}" }],
        keyField: "ID",
        entitySet: "/AssetAssignments",
        searchFields: ["asset/inventoryNumber", "asset/name", "employee/firstName",
                       "employee/lastName", "employee/employeeNumber"],
        sortFields: [
          { field: "assignedFrom", label: "{i18n>assignedFrom}" },
          { field: "returnedOn", label: "{i18n>returnedOn}" },
          { field: "asset/inventoryNumber", label: "{i18n>asset}" },
          { field: "employee/lastName", label: "{i18n>employee}" }
        ],
        defaultSort: "assignedFrom",

        filters: [
          { key: "period", label: "{i18n>period}", type: "date",
            fieldFrom: "assignedFrom", fieldTo: "assignedFrom" }
        ],
        exportName: "asset-assignments",
        exportColumns: [
          { label: "Inventory Number", value: function (o) { return o.asset && o.asset.inventoryNumber; } },
          { label: "Asset", value: function (o) { return o.asset && o.asset.name; } },
          { label: "Employee", value: function (o) { return o.employee && o.employee.lastName; } },
          { label: "Department", value: function (o) { return o.employee && o.employee.department; } },
          { label: "Assigned From", value: "assignedFrom" },
          { label: "Returned On", value: "returnedOn" }
        ]
      });
    }
  });
});
