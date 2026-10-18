sap.ui.define([
  "common/controller/BaseController",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (BaseController, Filter, FilterOperator) {
  "use strict";


  var COLORS = [
    "#0070f2", "#97dd40", "#ffdf72", "#fa6161", "#4db1ff",
    "#a6e0ff", "#f58baf", "#b4a0ff", "#00b8f0", "#c6ced6"
  ];

  return BaseController.extend("admin.controller.Statistics", {



    onInit: function () {
      var oUi = this._ensurePageModel();

      oUi.setProperty("/title", this.text("{i18n>technicianStatistics}"));
      oUi.setProperty("/subtitle", this.text("{i18n>technicianStatisticsSub}"));
      oUi.setProperty("/showBack", false);
      oUi.setProperty("/busy", false);
      oUi.setProperty("/technicianItems", []);
      oUi.setProperty("/selectedTechnicians", []);
      oUi.setProperty("/dateFrom", "");
      oUi.setProperty("/dateTo", "");
      oUi.setProperty("/statsRows", []);
      oUi.setProperty("/statsSummary", "");
      oUi.setProperty("/donutHtml", "");

      this.setCrumbs([
        { text: "{i18n>navOverview}", route: "home" },
        { text: "{i18n>technicianStatistics}" }
      ]);

      this.runWhenReady(function () {
        this._loadTechnicians();
        this._loadStatistics();
      });
    },



    onApply: function () {
      this._loadStatistics();
    },

    onReset: function () {
      var oUi = this._ensurePageModel();
      oUi.setProperty("/selectedTechnicians", []);
      oUi.setProperty("/dateFrom", "");
      oUi.setProperty("/dateTo", "");
      this._loadStatistics();
    },


    _buildFilters: function () {
      var oUi = this._ensurePageModel();
      var aFilters = [];
      var aTechnicians = oUi.getProperty("/selectedTechnicians") || [];

      if (aTechnicians.length) {
        aFilters.push(new Filter({
          filters: aTechnicians.map(function (sTechnician) {
            return new Filter("technician", FilterOperator.EQ, sTechnician);
          }),
          and: false
        }));
      }

      var sFrom = oUi.getProperty("/dateFrom");
      var sTo = oUi.getProperty("/dateTo");
      if (sFrom) { aFilters.push(new Filter("resolvedDate", FilterOperator.GE, sFrom)); }
      if (sTo) { aFilters.push(new Filter("resolvedDate", FilterOperator.LE, sTo)); }

      return aFilters;
    },

    _loadTechnicians: function () {
      var oUi = this._ensurePageModel();
      var oModel = this.getView().getModel();
      if (!oModel) { return; }

      try {
        oModel.bindList("/RepairRequests", null, null, null, { $select: ["technician"] })
          .requestContexts(0, 500)
          .then(function (aContexts) {
            var oSeen = {};
            var aItems = [];

            aContexts.forEach(function (oContext) {
              var sTechnician = oContext.getObject().technician;
              if (sTechnician && !oSeen[sTechnician]) {
                oSeen[sTechnician] = true;
                aItems.push({ key: sTechnician, text: sTechnician });
              }
            });

            aItems.sort(function (a, b) { return a.text.localeCompare(b.text); });
            oUi.setProperty("/technicianItems", aItems);
          })
          .catch(function () { });
      } catch (e) { }
    },



    _loadStatistics: function () {
      var that = this;
      var oUi = this._ensurePageModel();
      var oModel = this.getView().getModel();
      if (!oModel) { return; }

      oUi.setProperty("/busy", true);

      try {


        var aFilters = this._buildFilters();
        var oFilter = aFilters.length
          ? new Filter({ filters: aFilters, and: true })
          : undefined;


        if (this._oStatsBinding) { this._oStatsBinding.destroy(); }

        this._oStatsBinding = oModel.bindList(
          "/RepairRequests", null, null,
          oFilter ? [oFilter] : [],
          { $select: ["technician", "resolutionDays", "status_code", "createdDate", "resolvedDate"] });

        var oBinding = this._oStatsBinding;

        oBinding.requestContexts(0, 1000)
          .then(function (aContexts) {
            that._render(aContexts.map(function (oContext) { return oContext.getObject(); }));
            oUi.setProperty("/busy", false);
          })
          .catch(function () {
            that._render([]);
            oUi.setProperty("/busy", false);
          });
      } catch (e) {
        oUi.setProperty("/busy", false);
      }
    },

    _render: function (aRows) {
      var oUi = this._ensurePageModel();
      var sUnassigned = this.text("{i18n>unassigned}");
      var mByTechnician = {};

      aRows.forEach(function (oRow) {
        var sTechnician = oRow.technician || sUnassigned;
        var oStat = mByTechnician[sTechnician] ||
          (mByTechnician[sTechnician] = {
            technician: sTechnician, total: 0, completed: 0, daysSum: 0, daysCount: 0
          });

        oStat.total += 1;


        if (oRow.resolvedDate) { oStat.completed += 1; }

        if (oRow.resolutionDays !== null && oRow.resolutionDays !== undefined) {
          oStat.daysSum += Number(oRow.resolutionDays);
          oStat.daysCount += 1;
        }
      });

      var aStats = Object.keys(mByTechnician).map(function (sKey) {
        return mByTechnician[sKey];
      });

      aStats.forEach(function (oStat) {
        oStat.avgDays = oStat.daysCount
          ? Math.round((oStat.daysSum / oStat.daysCount) * 10) / 10
          : null;
      });

      aStats.sort(function (a, b) {
        return (b.completed - a.completed) || (b.total - a.total) ||
               a.technician.localeCompare(b.technician);
      });

      var iCompleted = aStats.reduce(function (iSum, oStat) { return iSum + oStat.completed; }, 0);

      aStats.forEach(function (oStat, iIndex) {
        oStat.color = COLORS[iIndex % COLORS.length];
        oStat.completedState = oStat.completed > 0 ? "Success" : "None";
        oStat.avgDaysText = oStat.avgDays === null
          ? "–"
          : this.i18n("daysShort", [String(oStat.avgDays)]);
      }, this);

      oUi.setProperty("/statsRows", aStats);
      oUi.setProperty("/statsSummary",
        this.i18n("statsSummaryText", [String(aRows.length), String(iCompleted)]));
      oUi.setProperty("/donutHtml", this._buildDonut(aStats, iCompleted));
    },



    _escape: function (sText) {
      return String(sText === null || sText === undefined ? "" : sText)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    },

    _buildDonut: function (aStats, iCompleted) {
      var iRadius = 72;
      var iStroke = 26;
      var fCircumference = 2 * Math.PI * iRadius;

      var sTrack = '<circle class="itamDonutTrack" cx="100" cy="100" r="' + iRadius +
        '" fill="none" stroke-width="' + iStroke + '"/>';

      if (!iCompleted) {
        return '<div class="itamDonut">' +
          '<svg class="itamDonutSvg" viewBox="0 0 200 200" width="200" height="200">' +
            sTrack +
            '<text class="itamDonutTotal" x="100" y="100" text-anchor="middle" ' +
              'dominant-baseline="middle">0</text>' +
          '</svg>' +
          '<div class="itamDonutEmpty">' + this._escape(this.text("{i18n>noCompletedRequests}")) +
          '</div></div>';
      }

      var sSlices = "";
      var aLegend = [];
      var fOffset = 0;

      aStats.forEach(function (oStat) {
        if (!oStat.completed) { return; }

        var fLength = fCircumference * oStat.completed / iCompleted;

        sSlices += '<circle cx="100" cy="100" r="' + iRadius + '" fill="none" ' +
          'stroke="' + oStat.color + '" stroke-width="' + iStroke + '" ' +
          'stroke-dasharray="' + fLength.toFixed(2) + ' ' + (fCircumference - fLength).toFixed(2) + '" ' +
          'stroke-dashoffset="' + (-fOffset).toFixed(2) + '" transform="rotate(-90 100 100)"/>';

        fOffset += fLength;

        aLegend.push('<li><span class="itamLegendDot" style="background:' + oStat.color +
          '"></span><span class="itamLegendLabel">' + this._escape(oStat.technician) +
          '</span><span class="itamLegendValue">' + oStat.completed + ' · ' +
          Math.round(oStat.completed / iCompleted * 100) + '%</span></li>');
      }, this);

      return '<div class="itamDonut">' +
        '<svg class="itamDonutSvg" viewBox="0 0 200 200" width="200" height="200" role="img">' +
          sTrack + sSlices +
          '<text class="itamDonutTotal" x="100" y="100" text-anchor="middle" ' +
            'dominant-baseline="middle">' + iCompleted + '</text>' +
        '</svg>' +
        '<ul class="itamDonutLegend">' + aLegend.join("") + '</ul>' +
        '</div>';
    }
  });
});
