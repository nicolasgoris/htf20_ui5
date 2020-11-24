sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
	"../htf/library"
], function (Log, Controller, Fragment, MessageBox, htf) {
	"use strict";

	return Controller.extend("com.flexso.htf.HTF2020.controller.Main", {
		onInit: function () {
			this._oBusy = new sap.m.BusyDialog();
			this.playground = this.getView().byId("playGround");
			this._logger = Log.getLogger("'MainController'");
			this.getView().setModel(this.playground.getProperty("_model"));
		},

		onRestart: function () {
			this.playground.resetGame();
			this.getView().setModel(this.playground.getProperty("_model"));
		},

		getText: function (sKey, aArray) {
			var _aArray = aArray;
			if (!_aArray) {
				_aArray = [];
			}
			return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sKey, _aArray);
		},
	});
});