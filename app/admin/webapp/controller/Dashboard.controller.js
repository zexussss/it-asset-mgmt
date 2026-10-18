sap.ui.define([
  "common/controller/BaseController",
  "common/model/navIntent",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (BaseController, NavIntent, Filter, FilterOperator) {
  "use strict";

  return BaseController.extend("admin.controller.Dashboard", {

    onInit: function () {
      var oUi = this._ensurePageModel();

      oUi.setProperty("/title", this.text("{i18n>adminDashboard}"));
      oUi.setProperty("/subtitle", this.text("{i18n>dashboardSubtitle}"));
      oUi.setProperty("/showBack", false);
      oUi.setProperty("/kpi", {
        assets: "–",
        open: "–",
        inRepair: "–",
        employees: "–"
      });

      this.setCrumbs([{ text: "{i18n>navOverview}" }]);
      this.setActions([
        { text: "{i18n>assets}", icon: "sap-icon://laptop", action: "onNavAssets" },
        { text: "{i18n>repairRequests}", icon: "sap-icon://wrench",
          type: "Emphasized", action: "onNavRepairRequests" }
      ]);

      this.runWhenReady(this._loadKpis);
    },



    _loadKpis: function () {
      var oUi = this._ensurePageModel();

      this._count("/Assets").then(function (iCount) {
        oUi.setProperty("/kpi/assets", iCount === null ? "–" : iCount);
      });

      this._count("/Assets",
        [new Filter("repairStatus_code", FilterOperator.EQ, "IN_REPAIR")])
        .then(function (iCount) {
          oUi.setProperty("/kpi/inRepair", iCount === null ? "–" : iCount);
        });

      this._count("/RepairRequests",
        [new Filter("status_code", FilterOperator.EQ, "OPEN")])
        .then(function (iCount) {
          oUi.setProperty("/kpi/open", iCount === null ? "–" : iCount);
        });

      this._count("/Employees").then(function (iCount) {
        oUi.setProperty("/kpi/employees", iCount === null ? "–" : iCount);
      });
    },


    _count: function (sPath, aFilters) {
      var oModel = this.getView().getModel();
      var oBinding = oModel.bindList(sPath, null, null, aFilters || [], { $count: true });

      return oBinding.requestContexts(0, 500).then(function (aContexts) {
        var iCount = oBinding.getCount();
        return typeof iCount === "number" ? iCount : aContexts.length;
      }).catch(function () {
        return null;
      });
    },



    onNavAssets: function () { this.navTo("assets"); },
    onNavRepairRequests: function () { this.navTo("repairRequests"); },


    onNavOpenRequests: function () {
      NavIntent.set("repairRequests", { status: "OPEN" });
      this.navTo("repairRequests");
    },


    onNavInRepair: function () {
      NavIntent.set("assets", { repair: "IN_REPAIR" });
      this.navTo("assets");
    },
    onNavEmployees: function () { this.navTo("employees"); },
    onNavStatistics: function () { this.navTo("statistics"); },

    onRequestSelect: function (oEvent) {
      var oCtx = oEvent.getParameter("listItem").getBindingContext();
      this.navTo("requestDetails", { key: oCtx.getProperty("ID") });
    }
  });
});
