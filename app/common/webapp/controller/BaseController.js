sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/routing/History",
  "sap/ui/core/Fragment",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "common/model/formatter"
], function (Controller, History, Fragment, Filter, FilterOperator, JSONModel,
             MessageBox, MessageToast, formatter) {
  "use strict";

  var THEME_STORAGE_KEY = "itam.theme";

  return Controller.extend("common.controller.BaseController", {

    formatter: formatter,



    getRouter: function () {
      return this.getOwnerComponent().getRouter();
    },

    getBundle: function () {
      var oModel = this.getOwnerComponent().getModel("i18n");
      return oModel && oModel.getResourceBundle();
    },


    text: function (sValue) {
      if (typeof sValue !== "string") { return sValue; }
      var aMatch = /^\{i18n>([^}]+)\}$/.exec(sValue);
      if (!aMatch) { return sValue; }
      var oBundle = this.getBundle();
      return oBundle ? oBundle.getText(aMatch[1]) : aMatch[1];
    },


    i18n: function (sKey, aArgs) {
      var oBundle = this.getBundle();
      return oBundle ? oBundle.getText(sKey, aArgs || []) : sKey;
    },


    confirm: function (sMessage, sTitle) {
      return new Promise(function (resolve) {
        MessageBox.confirm(sMessage, {
          title: sTitle || "",
          onClose: function (sAction) {
            resolve(sAction === MessageBox.Action.OK);
          }
        });
      });
    },

    navTo: function (sRoute, oParams) {
      if (!sRoute) { return; }
      this.getRouter().navTo(sRoute, oParams || {});
    },

    onNavBack: function () {
      var oHistory = History.getInstance();
      if (oHistory.getPreviousHash()) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("home", {}, true);
      }
    },




    runWhenReady: function (fn) {
      var oView = this.getView();
      if (oView.getModel()) {
        fn.call(this);
        return;
      }
      var that = this;
      var oDelegate = {
        onBeforeRendering: function () {
          oView.removeEventDelegate(oDelegate);
          fn.call(that);
        }
      };
      oView.addEventDelegate(oDelegate);
    },

    _ensurePageModel: function () {
      var oView = this.getView();
      var oModel = oView.getModel("ui");
      if (oModel) { return oModel; }

      oModel = new JSONModel({
        title: "",
        subtitle: "",
        count: null,
        crumbs: [],
        showBack: false,
        boundTitle: false,
        actions: [],
        searchQuery: "",
        searchPlaceholder: "Search",
        filters: [],
        columns: null
      });
      oView.setModel(oModel, "ui");
      return oModel;
    },


    setCrumbs: function (aCrumbs) {
      var oUi = this._ensurePageModel();
      var aAll = (aCrumbs || []).map(function (vCrumb) {
        var oCrumb = typeof vCrumb === "string" ? { text: vCrumb } : vCrumb;
        return Object.assign({}, oCrumb, { text: this.text(oCrumb.text) });
      }, this);
      var oCurrent = aAll.length ? aAll[aAll.length - 1] : { text: "" };

      oUi.setProperty("/crumbs", aAll.slice(0, -1));
      oUi.setProperty("/currentCrumb", oCurrent.text || "");
    },


    onCrumbPress: function (oEvent) {
      var oCtx = oEvent.getSource().getBindingContext("ui");
      if (!oCtx) { return; }
      var oData = oCtx.getObject();
      if (oData.route) {
        this.navTo(oData.route, oData.params || {});
      }
    },


    onBoundAction: function (oEvent) {
      var oSource = oEvent.getSource();
      var sAction = oSource.data("action");
      if (sAction && typeof this[sAction] === "function") {
        this[sAction](oEvent);
      }
    },


    setActions: function (aActions) {
      var oUi = this._ensurePageModel();
      oUi.setProperty("/actions", (aActions || []).map(function (oAction) {
        return {
          text: this.text(oAction.text),
          icon: oAction.icon || "",
          type: oAction.type || "Default",
          enabled: oAction.enabled !== false,
          action: oAction.action
        };
      }, this));
    },



    getStoredTheme: function () {
      try {
        return window.localStorage.getItem(THEME_STORAGE_KEY) || "sap_horizon_dark";
      } catch (e) {
        return "sap_horizon_dark";
      }
    },


    applyTheme: function (sTheme, bFollowShell) {
      if (!bFollowShell) {
        var oTheming = sap.ui.require("sap/ui/core/Theming");
        if (oTheming && typeof oTheming.setTheme === "function") {
          oTheming.setTheme(sTheme);
        } else if (sap.ui.getCore().applyTheme) {
          sap.ui.getCore().applyTheme(sTheme);
        }
        try {
          window.localStorage.setItem(THEME_STORAGE_KEY, sTheme);
        } catch (e) { }
      }

      document.documentElement.setAttribute(
        "data-itam-theme", sTheme === "sap_horizon" ? "light" : "dark");
      var oNav = this.getView() && this.getView().getModel("nav");
      if (oNav) {
        oNav.setProperty("/dark", sTheme === "sap_horizon_dark");
        oNav.setProperty("/theme", sTheme);
      }



      setTimeout(function () {
        window.dispatchEvent(new Event("resize"));
      }, 250);
    },

    onToggleTheme: function () {
      var sNext = this.getStoredTheme() === "sap_horizon_dark"
        ? "sap_horizon"
        : "sap_horizon_dark";
      this.applyTheme(sNext);
    },



    callAction: function (sAction, oParams, oContext, fnOk) {
      var oModel = this.getView().getModel();
      var oBinding = oModel.bindContext(sAction + "(...)", oContext || null);

      Object.keys(oParams || {}).forEach(function (sKey) {
        if (oParams[sKey] !== undefined) {
          oBinding.setParameter(sKey, oParams[sKey]);
        }
      });

      return oBinding.execute()
        .then(function () {
          MessageToast.show(this.text("{i18n>actionDone}"));
          oModel.refresh();


          if (typeof this._getTable === "function") {
            var oTable = this._getTable();
            var oListBinding = oTable && oTable.getBinding("items");
            if (oListBinding) { oListBinding.refresh(); }
          }

          if (fnOk) { fnOk(oBinding.getBoundContext()); }
        }.bind(this))
        .catch(function (oError) {
          var sMessage = oError && oError.message ? oError.message : "Action failed";
          MessageBox.error(sMessage);
        });
    },

    _openDialog: function (sFragmentName, oContext) {
      var that = this;
      var sKey = "_p_" + sFragmentName.replace(/[^\w]/g, "_");

      if (!this[sKey]) {
        this[sKey] = Fragment.load({
          id: this.getView().getId(),
          name: sFragmentName,
          controller: this
        }).then(function (oDialog) {
          that.getView().addDependent(oDialog);
          return oDialog;
        });
      }

      return this[sKey].then(function (oDialog) {
        if (oContext) { oDialog.setBindingContext(oContext); }
        oDialog.open();
        return oDialog;
      });
    },


    askForText: function (oConfig, fnConfirm) {
      var that = this;
      var oView = this.getView();
      var oModel = oView.getModel("dlg") || new JSONModel({});

      oModel.setData({
        title: this.text(oConfig.title),
        label: this.text(oConfig.label),
        placeholder: this.text(oConfig.placeholder || "")
      });
      oView.setModel(oModel, "dlg");

      this._fnTextConfirm = function () {
        var sValue = that.byId("reasonInput").getValue();

        if (oConfig.required && !String(sValue || "").trim()) {
          MessageBox.error(that.text("{i18n>fieldRequired}"));
          return;
        }
        that.byId("reasonDialog").close();
        fnConfirm(sValue);
      };

      this._openDialog("common.fragment.ReasonDialog").then(function () {
        var oInput = that.byId("reasonInput");
        if (oInput) { oInput.setValue(""); }
      });
    },

    onReasonConfirm: function () {
      if (this._fnTextConfirm) { this._fnTextConfirm(); }
    },

    onReasonCancel: function () {
      this.closeDialog("reasonDialog");
    },

    closeDialog: function (sId) {
      var oDialog = this.byId(sId);
      if (oDialog) { oDialog.close(); }
    },




    exportListToCsv: function (oBinding, aColumns, sFileName) {
      var aContexts = oBinding.getContexts();
      var aRows = aContexts.map(function (oCtx) { return oCtx.getObject(); });

      var esc = function (v) {
        var s = v === null || v === undefined ? "" : String(v);
        return /[",;\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      };

      var aLines = [aColumns.map(function (c) { return esc(c.label); }).join(";")];
      aRows.forEach(function (oRow) {
        aLines.push(aColumns.map(function (c) {
          var v = typeof c.value === "function" ? c.value(oRow) : oRow[c.value];
          return esc(v);
        }).join(";"));
      });

      var sCsv = "\uFEFF" + aLines.join("\r\n");
      var oBlob = new Blob([sCsv], { type: "text/csv;charset=utf-8" });
      var sUrl = URL.createObjectURL(oBlob);
      var oLink = document.createElement("a");
      oLink.href = sUrl;
      oLink.download = (sFileName || "export") + ".csv";
      document.body.appendChild(oLink);
      oLink.click();
      document.body.removeChild(oLink);
      URL.revokeObjectURL(sUrl);
      MessageToast.show(this.text("{i18n>exportDone}"));
    }
  });
});
