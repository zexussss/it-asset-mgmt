sap.ui.define([
  "common/controller/ListController",
  "sap/m/MessageBox"
], function (ListController, MessageBox) {
  "use strict";

  return ListController.extend("admin.controller.Employees", {

    onInit: function () {
      this.configureList({
        title: "{i18n>employees}",
        subtitle: "{i18n>employeesSubtitle}",
        crumbs: [
          { text: "{i18n>navOverview}", route: "home" },
          { text: "{i18n>employees}" }
        ],
        route: "employees",
        routeDetails: "employeeDetails",
        keyField: "ID",
        entitySet: "/Employees",
        searchFields: ["firstName", "lastName", "employeeNumber", "email", "department"],
        sortFields: [
          { field: "lastName", label: "{i18n>lastName}" },
          { field: "firstName", label: "{i18n>firstName}" },
          { field: "employeeNumber", label: "{i18n>employeeNumber}" },
          { field: "department", label: "{i18n>department}" },
          { field: "email", label: "{i18n>email}" }
        ],
        defaultSort: "lastName",

        filters: [
          { key: "department", label: "{i18n>department}", field: "department",
            lookup: { path: "/Employees", text: "department", distinct: true } }
        ],
        createEnabled: true,
        createText: "{i18n>addEmployee}",
        exportName: "employees",
        exportColumns: [
          { label: "Employee Number", value: "employeeNumber" },
          { label: "First Name", value: "firstName" },
          { label: "Last Name", value: "lastName" },
          { label: "Department", value: "department" },
          { label: "Email", value: "email" }
        ]
      });
    },



    onCreate: function () {
      this.openCreateDialog("common.fragment.AddEmployeeDialog", {
        employeeNumber: this.i18n("employeeNumberAuto"),
        firstName: "",
        lastName: "",
        email: "",
        department: ""
      });
    },

    onConfirmCreate: function () {
      var oDlg = this.getView().getModel("dlg").getData();
      var oData = {};

      ["firstName", "lastName", "email"].forEach(function (sField) {
        oData[sField] = String(oDlg[sField] || "").trim();
      }, this);

      if (!oData.firstName || !oData.lastName || !oData.email) {
        MessageBox.error(this.i18n("fieldRequired"));
        return;
      }

      var oPayload = {
        firstName: oData.firstName,
        lastName: oData.lastName,
        email: oData.email
      };
      if (String(oDlg.department || "").trim()) {
        oPayload.department = String(oDlg.department).trim();
      }

      this.submitCreate({
        payload: oPayload,
        action: "AdminService.draftActivate",
        dialogId: "addEmployeeDialog",
        successKey: "employeeCreated"
      });
    },

    onCancelCreate: function () {
      this.closeDialog("addEmployeeDialog");
    }
  });
});
