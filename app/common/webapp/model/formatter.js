sap.ui.define([], function () {
  "use strict";



  function codeState(sCode) {
    switch (String(sCode || "").toUpperCase()) {
      case "OK":
      case "DONE":
      case "COMPLETED":
      case "RESOLVED":
      case "AVAILABLE":
      case "IN_STOCK":
      case "FIXED":      return "Success";
      case "BROKEN":
      case "REJECTED":
      case "LOST":       return "Error";
      case "IN_REPAIR":
      case "IN_PROGRESS":
      case "PENDING":    return "Warning";
      case "OPEN":
      case "ASSIGNED":   return "Information";
      default:           return "None";
    }
  }

  function codeStateIcon(sCode) {
    switch (codeState(sCode)) {
      case "Success":     return "sap-icon://status-positive";
      case "Error":       return "sap-icon://status-negative";
      case "Warning":     return "sap-icon://status-critical";
      case "Information": return "sap-icon://status-in-process";
      default:            return "";
    }
  }

  return {




    critState: function (i) {
      switch (Number(i)) {
        case 1: return "Error";
        case 2: return "Warning";
        case 3: return "Success";
        case 4: return "Information";
        default: return "None";
      }
    },

    critIcon: function (i) {
      switch (Number(i)) {
        case 1: return "sap-icon://status-negative";
        case 2: return "sap-icon://status-critical";
        case 3: return "sap-icon://status-positive";
        case 4: return "sap-icon://status-in-process";
        default: return "";
      }
    },


    codeState: codeState,
    codeStateIcon: codeStateIcon,



    fullName: function (sLast, sFirst) {
      if (!sLast && !sFirst) { return ""; }
      return [sFirst, sLast].filter(Boolean).join(" ");
    },

    upper: function (s) {
      return String(s || "").toUpperCase();
    },

    truncate: function (sText, iMax) {
      var s = String(sText || "");
      var iLimit = iMax || 60;
      return s.length > iLimit ? s.slice(0, iLimit - 1) + "…" : s;
    },




    price: function (vValue) {
      if (vValue === null || vValue === undefined || vValue === "") { return ""; }

      var nValue = typeof vValue === "number"
        ? vValue
        : Number(String(vValue).replace(/[^0-9.\-]/g, ""));

      if (isNaN(nValue)) { return String(vValue); }

      return nValue.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    },

    days: function (vValue) {
      if (vValue === null || vValue === undefined || vValue === "") { return "–"; }
      return vValue + " d";
    },



    countLabel: function (vCount) {
      if (vCount === null || vCount === undefined) { return ""; }
      return "(" + vCount + ")";
    },

    hasItems: function (a) {
      return !!(a && a.length);
    },

    not: function (b) {
      return !b;
    },



    iconForCategory: function (sCode) {
      switch (String(sCode || "").toUpperCase()) {
        case "LAPTOP":    return "sap-icon://laptop";
        case "DESKTOP":   return "sap-icon://desktop-mobile";
        case "MONITOR":   return "sap-icon://monitor";
        case "KEYBOARD":  return "sap-icon://keyboard-and-mouse";
        case "MOUSE":     return "sap-icon://keyboard-and-mouse";
        case "PRINTER":   return "sap-icon://print";
        case "PHONE":     return "sap-icon://iphone";
        case "TABLET":    return "sap-icon://ipad";
        case "NETWORK":   return "sap-icon://network";
        case "SERVER":    return "sap-icon://database";
        default:          return "sap-icon://product";
      }
    }
  };
});
