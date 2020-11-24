sap.ui.define([
	"sap/ui/core/Control"
], function (Control) {
	"use strict";
	return Control.extend("htf.Monster", {
		metadata: {
			properties: {
				GameId: "string",
				Step: "int",
				LocX:"int",
				LocY: "int"
			}
		},
		init: function () {},
		renderer: function (oRm, oControl) {},
		onAfterRendering: function () {}
	});
});