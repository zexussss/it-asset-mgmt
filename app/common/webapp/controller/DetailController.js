sap.ui.define([
  "common/controller/BaseController"
], function (BaseController) {
  "use strict";

  return BaseController.extend("common.controller.DetailController", {


    bindDetailRoute: function (sRouteName, sEntitySet, sExpand, oConfig) {
      var oUi = this._ensurePageModel();
      oConfig = oConfig || {};

      oUi.setProperty("/showBack", true);
      this._oDetailConfig = oConfig;
      this.setActions(oConfig.actions);
      this.setCrumbs(oConfig.crumbs);

      this.getRouter().getRoute(sRouteName).attachPatternMatched(function (oEvent) {
        this._bindDetail(oEvent.getParameter("arguments").key, sEntitySet, sExpand, oConfig);
      }, this);
    },

    _bindDetail: function (sKey, sEntitySet, sExpand, oConfig) {
      var oUi = this._ensurePageModel();
      var oView = this.getView();

      oUi.setProperty("/busy", true);
      oUi.setProperty("/title", this.text(oConfig.placeholderTitle || "{i18n>loading}"));
      oUi.setProperty("/subtitle", "");

      var oParams = sExpand ? { $expand: sExpand } : {};


      if (oConfig.updateGroupId) { oParams.$$updateGroupId = oConfig.updateGroupId; }

      oView.bindElement({
        path: sEntitySet + "(" + sKey + ")",
        parameters: oParams,
        events: {
          dataReceived: function () {
            var oCtx = oView.getBindingContext();
            oUi.setProperty("/busy", false);
            if (!oCtx) { return; }
            this._updateDetailHeader(oCtx.getObject(), oConfig);
            this._refreshActionStates(oCtx, oConfig);
          }.bind(this),
          dataRequested: function () {
            oUi.setProperty("/busy", true);
          }
        }
      });
    },


    _refreshActionStates: function (oCtx, oConfig) {
      var oUi = this._ensurePageModel();
      var aNeeded = [];

      (oConfig.actions || []).forEach(function (oAction) {
        if (oAction.enabledFrom && aNeeded.indexOf(oAction.enabledFrom) < 0) {
          aNeeded.push(oAction.enabledFrom);
        }
      });

      if (!aNeeded.length) { return; }

      Promise.all(aNeeded.map(function (sProperty) {
        return oCtx.requestProperty(sProperty).catch(function () { return undefined; });
      })).then(function (aValues) {
        var mValues = {};
        aNeeded.forEach(function (sProperty, i) { mValues[sProperty] = aValues[i]; });

        (oConfig.actions || []).forEach(function (oAction, i) {
          if (oAction.enabledFrom) {
            oUi.setProperty("/actions/" + i + "/enabled", !!mValues[oAction.enabledFrom]);
          }
        });
      });
    },

    _updateDetailHeader: function (oData, oConfig) {
      var oUi = this._ensurePageModel();
      var aTitleFields = oConfig.titleFields || ["name", "description", "inventoryNumber", "ID"];
      var aSubtitleFields = oConfig.subtitleFields || [];

      var pickFirst = function (aFields) {
        for (var i = 0; i < aFields.length; i++) {
          var vValue = aFields[i].split(/[./]/).reduce(function (o, sPart) {
            return o ? o[sPart] : undefined;
          }, oData);
          if (vValue !== undefined && vValue !== null && vValue !== "") {
            return vValue;
          }
        }
        return "";
      };

      var sTitle = oConfig.titleFormatter
        ? oConfig.titleFormatter(oData, this)
        : pickFirst(aTitleFields);

      var sSubtitle = oConfig.subtitleFormatter
        ? oConfig.subtitleFormatter(oData, this)
        : pickFirst(aSubtitleFields);

      oUi.setProperty("/title", sTitle);
      oUi.setProperty("/subtitle", sSubtitle);


      (oConfig.actions || []).forEach(function (oAction, i) {
        if (!oAction.enabledFrom) { return; }
        oUi.setProperty("/actions/" + i + "/enabled", !!oData[oAction.enabledFrom]);
      });


      var oCounts = {};
      Object.keys(oData).forEach(function (sKey) {
        if (Array.isArray(oData[sKey])) { oCounts[sKey] = oData[sKey].length; }
      });
      oUi.setProperty("/counts", oCounts);


      if (oUi.getProperty("/currentCrumb")) {
        oUi.setProperty("/currentCrumb", sTitle);
      }
    }
  });
});
