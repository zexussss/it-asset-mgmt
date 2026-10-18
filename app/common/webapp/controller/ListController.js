sap.ui.define([
  "common/controller/BaseController",
  "common/model/navIntent",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/Menu",
  "sap/m/MenuItem",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Sorter",
  "sap/m/MessageToast"
], function (BaseController, NavIntent, Filter, FilterOperator, MessageBox, Menu, MenuItem,
             JSONModel, Sorter, MessageToast) {
  "use strict";

  return BaseController.extend("common.controller.ListController", {




    configureList: function (oConfig) {
      this._oListConfig = oConfig || {};

      var oUi = this._ensurePageModel();
      oUi.setProperty("/title", this.text(oConfig.title));
      oUi.setProperty("/subtitle", this.text(oConfig.subtitle));
      oUi.setProperty("/count", null);
      oUi.setProperty("/busy", false);
      oUi.setProperty("/showBack", !!oConfig.showBack);
      oUi.setProperty("/searchQuery", "");
      oUi.setProperty("/searchFields", oConfig.searchFields || []);
      oUi.setProperty("/searchPlaceholder",
        this.text(oConfig.searchPlaceholder || "{i18n>searchPlaceholder}"));
      oUi.setProperty("/actions", (oConfig.actions || []).map(this._mapAction, this));
      oUi.setProperty("/sortFields", (oConfig.sortFields || []).map(function (oField) {
        return { key: oField.field, text: this.text(oField.label) };
      }, this));
      oUi.setProperty("/sortVisible", !!(oConfig.sortFields || []).length);
      oUi.setProperty("/sortKey", (oConfig.sortFields || []).length
        ? (oConfig.defaultSort || oConfig.sortFields[0].field) : "");
      oUi.setProperty("/sortDirection", "ASC");

      oUi.setProperty("/createVisible", !!oConfig.createEnabled);
      oUi.setProperty("/createText",
        oConfig.createEnabled ? this.text(oConfig.createText || "{i18n>create}") : "");
      oUi.setProperty("/filters", (oConfig.filters || []).map(function (oFilter) {
        return {
          key: oFilter.key,
          label: this.text(oFilter.label),
          type: oFilter.type || "select",
          selectedKey: "ALL",
          dateFrom: "",
          dateTo: "",
          width: oFilter.width || "11rem",
          items: [{ key: "ALL", text: this.text("{i18n>all}") }]
        };
      }, this));

      this.setCrumbs(oConfig.crumbs);


      var oIntent = oConfig.route ? NavIntent.consume(oConfig.route) : null;



      this.runWhenReady(function () {
        var aLookups = (oConfig.filters || []).map(this._loadFilterOptions, this);

        if (!oIntent) { return; }



        Promise.all(aLookups).then(function () {
          (oConfig.filters || []).forEach(function (oFilter, i) {
            if (oIntent[oFilter.key] !== undefined) {
              oUi.setProperty("/filters/" + i + "/selectedKey", oIntent[oFilter.key]);
            }
          });
          this._applyFiltersWhenReady();
        }.bind(this));
      });
    },

    _mapAction: function (oAction) {
      return {
        text: this.text(oAction.text),
        icon: oAction.icon || "",
        type: oAction.type || "Default",
        enabled: oAction.enabled !== false,
        action: oAction.action
      };
    },


    _loadFilterOptions: function (oFilter, iIndex) {
      var oUi = this._ensurePageModel();
      var sAll = this.text("{i18n>all}");

      var apply = function (aItems) {
        oUi.setProperty("/filters/" + iIndex + "/items",
          [{ key: "ALL", text: sAll }].concat(aItems));
      };

      if (oFilter.options && oFilter.options.length) {
        apply(oFilter.options.map(function (oOption) {
          return { key: oOption.key, text: this.text(oOption.text) };
        }, this));
        return Promise.resolve();
      }

      if (!oFilter.lookup || !oFilter.lookup.path) { return Promise.resolve(); }

      var oLookup = oFilter.lookup;
      var bDistinct = !!oLookup.distinct;
      var sKeyField = oLookup.key || "code";
      var sTextField = oLookup.text || "name";
      var oModel = this.getView().getModel();

      try {
        var oBinding = oModel.bindList(oLookup.path, null, null, null, {
          $select: bDistinct ? [sTextField] : [sKeyField, sTextField]
        });

        return oBinding.requestContexts(0, 500).then(function (aContexts) {
          var aItems;

          if (bDistinct) {
            var oSeen = {};
            aItems = [];
            aContexts.forEach(function (oCtx) {
              var vValue = oCtx.getObject()[sTextField];
              if (vValue !== undefined && vValue !== null && vValue !== "" && !oSeen[vValue]) {
                oSeen[vValue] = true;
                aItems.push({ key: vValue, text: vValue });
              }
            });
            aItems.sort(function (a, b) { return a.text.localeCompare(b.text); });
          } else {
            aItems = aContexts.map(function (oCtx) {
              var oObject = oCtx.getObject();
              return { key: oObject[sKeyField], text: oObject[sTextField] || oObject[sKeyField] };
            });
          }

          apply(aItems);
        }).catch(function () { });
      } catch (e) {

        return Promise.resolve();
      }
    },



    onSearch: function (oEvent) {
      var oUi = this._ensurePageModel();
      oUi.setProperty("/searchQuery", oEvent.getParameter("query") ||
                                     oEvent.getParameter("newValue") || "");
      this._applyFilters();
    },

    onClearSearch: function () {
      this._ensurePageModel().setProperty("/searchQuery", "");
      this._applyFilters();
    },

    onFilterChange: function (oEvent) {
      var oUi = this._ensurePageModel();
      var oFilter = oEvent.getSource().getBindingContext("ui");
      if (!oFilter) { return; }
      oUi.setProperty(oFilter.getPath() + "/selectedKey", oEvent.getParameter("selectedItem").getKey());
      this._applyFilters();
    },


    onFilterDateChange: function () {
      this._applyFilters();
    },

    onResetFilters: function () {
      var oUi = this._ensurePageModel();
      oUi.setProperty("/searchQuery", "");
      (oUi.getProperty("/filters") || []).forEach(function (oFilter, i) {
        oUi.setProperty("/filters/" + i + "/selectedKey", "ALL");
        oUi.setProperty("/filters/" + i + "/dateFrom", "");
        oUi.setProperty("/filters/" + i + "/dateTo", "");
      });
      this._applyFilters();
    },

    _applyFiltersWhenReady: function (iTries) {
      var that = this;
      var iLeft = iTries === undefined ? 20 : iTries;
      var oTable = this._getTable();

      if (oTable && oTable.getBinding("items")) {
        this._applyFilters();
        return;
      }
      if (iLeft > 0) {
        setTimeout(function () { that._applyFiltersWhenReady(iLeft - 1); }, 50);
      }
    },

    _applyFilters: function () {
      var oTable = this._getTable();
      if (!oTable) { return; }

      var oBinding = oTable.getBinding("items");
      if (!oBinding) { return; }

      var oUi = this._ensurePageModel();
      var aFilters = [];
      var sQuery = oUi.getProperty("/searchQuery");





      oBinding.changeParameters({ "$search": sQuery || undefined });

      (oUi.getProperty("/filters") || []).forEach(function (oFilter, i) {
        var oConfig = (this._oListConfig.filters || [])[i] || {};

        if (oFilter.type === "date") {
          if (oFilter.dateFrom) {
            aFilters.push(new Filter(oConfig.fieldFrom || oConfig.field,
              FilterOperator.GE, oFilter.dateFrom));
          }
          if (oFilter.dateTo) {
            aFilters.push(new Filter(oConfig.fieldTo || oConfig.field,
              FilterOperator.LE, oFilter.dateTo));
          }
          return;
        }

        var sValue = oFilter.selectedKey;
        if (!sValue || sValue === "ALL" || !oConfig.field) { return; }
        aFilters.push(new Filter(oConfig.field, FilterOperator.EQ, sValue));
      }, this);

      oBinding.filter(aFilters);
    },

    onRefresh: function () {
      var oTable = this._getTable();
      var oBinding = oTable && oTable.getBinding("items");
      if (oBinding) {
        oBinding.refresh();
      }
    },

    onUpdateFinished: function (oEvent) {
      this._ensurePageModel().setProperty("/count", oEvent.getParameter("total"));
    },

    _getTable: function () {
      var sId = (this._oListConfig && this._oListConfig.tableId) || "mainTable";
      return this.byId(sId);
    },




    onCreate: function () { },



    onSortPress: function () {
      this._openDialog("common.fragment.SortDialog");
    },

    onSortApply: function () {
      var oUi = this._ensurePageModel();
      var sField = oUi.getProperty("/sortKey");

      if (sField) {
        this._sortBy(sField, oUi.getProperty("/sortDirection") === "DESC");
      }
      this.closeDialog("sortDialog");
    },

    onSortReset: function () {
      var oTable = this._getTable();
      var oBinding = oTable && oTable.getBinding("items");

      if (oBinding) { oBinding.sort([]); }
      this.closeDialog("sortDialog");
    },

    _sortBy: function (sField, bDescending) {
      var oTable = this._getTable();
      var oBinding = oTable && oTable.getBinding("items");

      if (oBinding) {
        oBinding.sort([new Sorter(sField, bDescending)]);
      }
    },


    openCreateDialog: function (sFragmentName, oDefaults) {
      var oView = this.getView();
      var oDlg = oView.getModel("dlg") || new JSONModel({});

      oDlg.setData(oDefaults || {});
      oView.setModel(oDlg, "dlg");
      return this._openDialog(sFragmentName);
    },


    submitCreate: function (oConfig) {
      if (this._bCreating) { return; }

      var that = this;
      var oModel = this.getView().getModel();
      var oTable = this._getTable();
      var oBinding = oTable && oTable.getBinding("items");
      var oDialog = this.byId(oConfig.dialogId);

      if (!oBinding) { return; }

      this._bCreating = true;
      if (oDialog && oDialog.setBusy) { oDialog.setBusy(true); }

      var oContext = oBinding.create(oConfig.payload, true);

      return oContext.created()
        .then(function () {
          return oModel.bindContext(oConfig.action + "(...)", oContext).execute();
        })
        .then(function () {
          that._bCreating = false;
          if (oDialog && oDialog.setBusy) { oDialog.setBusy(false); }
          that.closeDialog(oConfig.dialogId);
          oBinding.refresh();
          MessageToast.show(that.i18n(oConfig.successKey || "actionDone"));
        })
        .catch(function (oError) {
          that._bCreating = false;
          if (oDialog && oDialog.setBusy) { oDialog.setBusy(false); }
          var sMessage = (oError && oError.message)
            || (oError && oError.error && oError.error.message)
            || that.i18n("createFailed");
          MessageBox.error(sMessage);
        });
    },

    onSelect: function (oEvent) {
      var oConfig = this._oListConfig || {};
      if (!oConfig.routeDetails) { return; }

      var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
      var oCtx = oItem.getBindingContext();
      var sKey;

      if (oConfig.detailKey) {
        sKey = oConfig.detailKey.call(this, oCtx);
      } else {
        var oData = oCtx.getObject();
        var sKeyField = oConfig.keyField || "ID";


        sKey = oData.IsActiveEntity !== undefined
          ? sKeyField + "=" + oCtx.getProperty(sKeyField) +
            ",IsActiveEntity=" + oData.IsActiveEntity
          : oCtx.getProperty(sKeyField);
      }

      this.navTo(oConfig.routeDetails, { key: sKey });
    },

    onExport: function () {
      var oTable = this._getTable();
      var oBinding = oTable && oTable.getBinding("items");
      var aColumns = (this._oListConfig && this._oListConfig.exportColumns) || [];

      if (!oBinding) { return; }

      if (!aColumns.length) {
        MessageBox.information(this.text("{i18n>exportNoColumns}"));
        return;
      }

      this.exportListToCsv(oBinding, aColumns,
        (this._oListConfig && this._oListConfig.exportName) || "export");
    },


    onPanelMenu: function (oEvent) {
      if (!this._oPanelMenu) {
        this._oPanelMenu = new Menu({
          items: [
            new MenuItem({ text: this.text("{i18n>refresh}"),
                           icon: "sap-icon://refresh",
                           press: this.onRefresh.bind(this) }),
            new MenuItem({ text: this.text("{i18n>export}"),
                           icon: "sap-icon://excel-attachment",
                           press: this.onExport.bind(this) }),
            new MenuItem({ text: this.text("{i18n>resetFilters}"),
                           icon: "sap-icon://clear-filter",
                           press: this.onResetFilters.bind(this) })
          ]
        });
        this.getView().addDependent(this._oPanelMenu);
      }
      this._oPanelMenu.openBy(oEvent.getSource());
    }
  });
});
