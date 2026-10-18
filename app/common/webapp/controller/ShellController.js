sap.ui.define([
  "common/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageBox",
  "sap/ui/core/Fragment"
], function (BaseController, JSONModel, MessageBox, Fragment) {
  "use strict";

  var THEME_DARK = "sap_horizon_dark";
  var THEME_LIGHT = "sap_horizon";

  return BaseController.extend("common.controller.ShellController", {




    configureShell: function (oConfig) {
      this._oShellConfig = oConfig || {};

      var sTheme = this.getStoredTheme();
      var sLaunchpadUrl = this.getLaunchpadUrl();

      var oNav = new JSONModel({
        appTitle: this.text(oConfig.title),
        appSubtitle: this.text(oConfig.subtitle),
        launchpadUrl: sLaunchpadUrl,

        brandTooltip: sLaunchpadUrl || this._isRunningInLaunchpad()
          ? this.text("{i18n>openLaunchpad}")
          : this.text("{i18n>appTitle}"),
        sections: this._buildItems(oConfig.sections || []),
        footer: this._buildItems(oConfig.footer || []),
        selectedKey: "",
        dark: sTheme === THEME_DARK,
        theme: sTheme,
        user: {
          initials: "",
          displayName: "",
          email: "",
          department: ""
        }
      });

      this.getView().setModel(oNav, "nav");



      if (this._isRunningInLaunchpad()) {
        this.applyTheme(this._launchpadTheme(), true);
        var that = this;
        sap.ui.getCore().attachThemeChanged(function () {
          that.applyTheme(that._launchpadTheme(), true);
        });



        var oHeader = this.byId("appHeader");
        if (oHeader) {
          oHeader.setVisible(false);
        }
      } else {
        this.applyTheme(sTheme);
      }


      this._mRouteToKey = {};
      (oConfig.sections || []).forEach(function (oSection) {
        this._indexRoutes(oSection, this._mRouteToKey);
      }, this);

      this.getRouter().attachRouteMatched(this._onRouteMatched, this);

      this.runWhenReady(this._loadCurrentUser);



      setTimeout(this._syncSelectionFromHash.bind(this), 0);
    },

    _indexRoutes: function (oEntry, mMap) {
      if (oEntry.route) {
        mMap[oEntry.route] = oEntry.key || oEntry.route;
      }
      (oEntry.routes || []).forEach(function (sRoute) {
        mMap[sRoute] = oEntry.key || oEntry.route;
      });
      (oEntry.items || []).forEach(function (oChild) {
        this._indexRoutes(oChild, mMap);
      }, this);
    },

    _buildItems: function (aEntries) {
      return aEntries.map(function (oEntry) {
        var sKey = oEntry.key || oEntry.route || oEntry.caption;


        if (oEntry.caption) {
          return {
            key: "__caption__" + sKey,
            text: this.text(oEntry.caption),
            enabled: false,
            hasExpander: false,
            expanded: true,
            icon: "",
            items: []
          };
        }

        var aItems = this._buildItems(oEntry.items || []);

        return {
          key: sKey,
          text: this.text(oEntry.text),
          icon: oEntry.icon || "",
          enabled: true,

          hasExpander: aItems.length > 0,
          expanded: oEntry.expanded !== false,
          route: oEntry.route || "",
          items: aItems
        };
      }, this);
    },




    _loadCurrentUser: function () {
      var oView = this.getView();
      var oModel = oView.getModel();
      var oNav = oView.getModel("nav");
      if (!oModel || !oNav) { return; }

      var sFallbackText = this.text("{i18n>unknownUser}");

      var applyFallback = function () {
        oNav.setProperty("/user", {
          initials: "?",
          displayName: sFallbackText,
          email: "",
          department: ""
        });
      };

      var sDisplayFromMail = function (sMail) {
        var sLocal = String(sMail || "").split("@")[0] || String(sMail || "");
        return sLocal.split(/[._\-+]+/).filter(Boolean).map(function (s) {
          return s.charAt(0).toUpperCase() + s.slice(1);
        }).join(" ");
      };

      try {
        oModel.bindList("/Me").requestContexts(0, 1).then(function (aContexts) {
          if (!aContexts.length) { return applyFallback(); }

          var oMe = aContexts[0].getObject();
          var sFirst = oMe.firstName || "";
          var sLast = oMe.lastName || "";
          var sMail = oMe.email || "";
          var sDisplay = [sFirst, sLast].filter(Boolean).join(" ") || sDisplayFromMail(sMail);

          oNav.setProperty("/user", {
            initials: ((sFirst.charAt(0) || sMail.charAt(0) || "?") +
                       (sLast.charAt(0) || "")).toUpperCase(),
            displayName: sDisplay || sFallbackText,
            email: sMail,
            department: oMe.department || ""
          });
        }).catch(applyFallback);
      } catch (e) {
        applyFallback();
      }
    },



    _onRouteMatched: function (oEvent) {
      this._selectNavKey(this._mRouteToKey[oEvent.getParameter("name")]);
    },

    _selectNavKey: function (sKey) {
      if (!sKey) { return; }
      var oNav = this.getView().getModel("nav");
      if (oNav && oNav.getProperty("/selectedKey") !== sKey) {
        oNav.setProperty("/selectedKey", sKey);
      }
    },


    _syncSelectionFromHash: function () {
      var sHash = this.getRouter().getHashChanger().getHash() || "";
      sHash = decodeURIComponent(sHash.split("?")[0]);
      if (!sHash) {
        this._selectNavKey(this._mRouteToKey[this._oShellConfig.homeRoute] ||
                           this._mRouteToKey.home);
        return;
      }

      var aRoutes = this.getOwnerComponent()
        .getManifestEntry("/sap.ui5/routing/routes") || [];

      for (var i = 0; i < aRoutes.length; i++) {
        var sPattern = aRoutes[i].pattern;
        if (this._patternMatches(sPattern, sHash) && this._mRouteToKey[aRoutes[i].name]) {
          this._selectNavKey(this._mRouteToKey[aRoutes[i].name]);
          return;
        }
      }
    },

    _patternMatches: function (sPattern, sHash) {
      if (sPattern === "") { return sHash === ""; }
      var sRegExp = "^" + sPattern
        .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\\\{[^}]+\\\}/g, "[^/]+") + "$";
      return new RegExp(sRegExp).test(sHash);
    },



    onNavItemSelect: function (oEvent) {
      var oItem = oEvent.getParameter("item");
      if (!oItem) { return; }

      var sKey = oItem.getKey();
      var oEntry = this._findNavEntry(sKey);

      if (oEntry && oEntry.action === "theme") {
        this.onToggleTheme();
        return;
      }
      if (oEntry && oEntry.route) {
        this.navTo(oEntry.route, oEntry.params || {});
      }
    },

    _findNavEntry: function (sKey) {
      var aStack = (this._oShellConfig.sections || [])
        .concat(this._oShellConfig.footer || []);

      while (aStack.length) {
        var oEntry = aStack.shift();
        if ((oEntry.key || oEntry.route) === sKey) { return oEntry; }
        if (oEntry.items) { aStack = aStack.concat(oEntry.items); }
      }
      return null;
    },

    onToggleSideNav: function () {
      var oToolPage = this.byId("toolPage");
      if (oToolPage) {
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      }
    },


    getLaunchpadUrl: function () {
      var sUrl = "";

      try {
        sUrl = this.getOwnerComponent().getManifestEntry("/sap.ui5/config/launchpadUrl") || "";
      } catch (e) { }

      try {
        sUrl = window.localStorage.getItem("itam.launchpad") || sUrl;
      } catch (e) { }

      return sUrl;
    },


    _launchpadTheme: function () {
      var oConfig = sap.ui.getCore().getConfiguration();
      return (oConfig && oConfig.getTheme && oConfig.getTheme()) || "sap_horizon";
    },


    _isRunningInLaunchpad: function () {
      var oContainer = window.sap && window.sap.ushell && window.sap.ushell.Container;
      return !!(oContainer && typeof oContainer.getServiceAsync === "function");
    },


    onBrandPress: function () {
      var oContainer = window.sap && window.sap.ushell && window.sap.ushell.Container;

      if (oContainer && typeof oContainer.getServiceAsync === "function") {
        oContainer.getServiceAsync("CrossApplicationNavigation").then(function (oCrossAppNav) {
          oCrossAppNav.toExternal({ target: { shellHash: "#Shell-home" } });
        });
        return;
      }

      var sUrl = this.getLaunchpadUrl();
      if (sUrl) {
        window.location.assign(sUrl);
        return;
      }

      this.navTo(this._oShellConfig.homeRoute || "home");
    },



    onProfilePress: function (oEvent) {
      var that = this;

      if (!this._pUserPopover) {
        this._pUserPopover = Fragment.load({
          id: this.getView().getId(),
          name: "common.fragment.UserPopover",
          controller: this
        }).then(function (oPopover) {
          that.getView().addDependent(oPopover);
          return oPopover;
        });
      }

      this._pUserPopover.then(function (oPopover) {
        oPopover.openBy(oEvent.getSource());
      });
    },

    onCloseUserPopover: function () {
      if (this._pUserPopover) {
        this._pUserPopover.then(function (oPopover) { oPopover.close(); });
      }
    },


    onLogout: function () {
      var that = this;
      MessageBox.confirm(this.text("{i18n>logOutConfirm}"), {
        title: this.text("{i18n>logOut}"),
        onClose: function (sAction) {
          if (sAction === MessageBox.Action.OK) {
            that.onCloseUserPopover();
            window.location.assign("/logout");
          }
        }
      });
    }
  });
});
