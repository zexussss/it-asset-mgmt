sap.ui.define(["common/controller/ListController"], function (ListController) {
  "use strict";

  return ListController.extend("inventory.controller.Categories", {

    onInit: function () {
      this.configureList({
        title: "{i18n>categories}",
        subtitle: "{i18n>categoriesSubtitle}",
        crumbs: [{ text: "{i18n>categories}" }],
        keyField: "code",
        entitySet: "/AssetCategories",
        searchFields: ["code", "name"],
        sortFields: [
          { field: "code", label: "{i18n>code}" },
          { field: "name", label: "{i18n>name}" }
        ],
        defaultSort: "code",

        exportName: "asset-categories",
        exportColumns: [
          { label: "Code", value: "code" },
          { label: "Name", value: "name" }
        ]
      });
    }
  });
});
