sap.ui.define([
  "common/controller/DetailController",
  "sap/m/MessageBox",
  "sap/m/MessageToast"
], function (DetailController, MessageBox, MessageToast) {
  "use strict";



  var UPDATE_GROUP = "employeeDraft";

  return DetailController.extend("inventory.controller.EmployeeDetails", {

    onInit: function () {
      this.bindDetailRoute("employeeDetails", "/Employees", "assets", {
        updateGroupId: UPDATE_GROUP,
        titleFields: ["lastName"],
        subtitleFields: ["employeeNumber"],
        titleFormatter: function (oData, oController) {
          return [oData.firstName, oData.lastName].filter(Boolean).join(" ") ||
                 oController.text("{i18n>employee}");
        },
        subtitleFormatter: function (oData) {
          return [oData.employeeNumber, oData.department].filter(Boolean).join(" · ");
        },
        crumbs: [
          { text: "{i18n>employees}", route: "employees" },
          { text: "{i18n>loading}" }
        ]
      });


      this.getRouter().getRoute("employeeDetails").attachPatternMatched(function (oEvent) {
        this._sActiveKey = oEvent.getParameter("arguments").key;
        this._sDraftKey = String(this._sActiveKey).replace("IsActiveEntity=true", "IsActiveEntity=false");
        this._setMode(false);
      }, this);
    },



    _setMode: function (bEdit) {
      this._ensurePageModel().setProperty("/editMode", bEdit);

      this.setActions(bEdit
        ? [
            { text: "{i18n>save}", icon: "sap-icon://accept", type: "Emphasized",
              action: "onSave" },
            { text: "{i18n>cancel}", icon: "sap-icon://decline",
              action: "onCancelEdit" }
          ]
        : [
            { text: "{i18n>edit}", icon: "sap-icon://edit", action: "onEdit" }
          ]);
    },

    _bindPath: function (sPath) {
      var that = this;
      var oUi = this._ensurePageModel();

      oUi.setProperty("/busy", true);
      this.getView().bindElement({
        path: sPath,
        parameters: { $$updateGroupId: UPDATE_GROUP },
        events: {
          dataReceived: function () {
            var oCtx = that.getView().getBindingContext();
            oUi.setProperty("/busy", false);
            if (oCtx) { that._updateDetailHeader(oCtx.getObject(), that._oDetailConfig); }
          },
          dataRequested: function () { oUi.setProperty("/busy", true); }
        }
      });
    },



    onEdit: function () {
      var that = this;
      var oView = this.getView();
      var oModel = oView.getModel();
      var oContext = oView.getBindingContext();

      if (!oContext) { return; }

      this._ensurePageModel().setProperty("/busy", true);

      oModel.bindContext("InventoryService.draftEdit(...)", oContext).execute()
        .then(function () {
          that._setMode(true);
          that._bindPath("/Employees(" + that._sDraftKey + ")");
        })
        .catch(function (oError) {
          var sMessage = (oError && oError.message) || "";


          if (oError && oError.status === 409 ||
              /draft .*already exists/i.test(sMessage)) {
            that._setMode(true);
            that._bindPath("/Employees(" + that._sDraftKey + ")");
            return;
          }

          that._ensurePageModel().setProperty("/busy", false);
          MessageBox.error(sMessage || "Could not start editing.");
        });
    },

    onSave: function () {
      var that = this;
      var oView = this.getView();
      var oModel = oView.getModel();
      var oContext = oView.getBindingContext();

      if (!oContext) { return; }

      this._ensurePageModel().setProperty("/busy", true);


      oModel.submitBatch(UPDATE_GROUP)
        .then(function () {
          return oModel.bindContext("InventoryService.draftActivate(...)", oContext).execute();
        })
        .then(function () {
          MessageToast.show(that.text("{i18n>actionDone}"));
          that._setMode(false);
          that._bindPath("/Employees(" + that._sActiveKey + ")");
        })
        .catch(function (oError) {
          that._ensurePageModel().setProperty("/busy", false);
          MessageBox.error((oError && oError.message) || "Could not save the changes.");
        });
    },

    onCancelEdit: function () {
      var that = this;
      var oView = this.getView();
      var oContext = oView.getBindingContext();

      var finish = function () {
        that._setMode(false);
        that._bindPath("/Employees(" + that._sActiveKey + ")");
      };

      if (!oContext) { return finish(); }

      this._ensurePageModel().setProperty("/busy", true);


      try { oView.getModel().resetChanges(UPDATE_GROUP); } catch (e) { }

      Promise.resolve(oContext.delete("$direct")).then(finish).catch(finish);
    }
  });
});
