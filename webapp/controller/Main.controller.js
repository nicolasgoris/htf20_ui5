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

		onInitiatePlayer: function (oEvent) {
			this.playground.initLocations("0;0", "4;3");
		},

		onInitiateMonsters: function (oEvent) {
			this._oBusy.open();
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify(oEvent.getParameters()),
				dataType: 'json',
				success: function (data) {
					if (data.status === 'ok') {
						setTimeout(this._retrieveMonsters.bind(this), 1500);
					}
				}.bind(this),
				error: function (jqXHR, textStatus, error) {
					console.error(error);
					this._oBusy.close();
				},
				type: 'POST',
				url: 'http://localhost:3001/api/initiatemonsters'
			});
		},

		onKeyStroke: function (oEvent) {
			var iNewLoc,
				oPlayGround = oEvent.getSource();
			switch (oEvent.getParameter("direction")) {
				case "Up":
					iNewLoc = oPlayGround.getPlayerLocY() - 1;
					oPlayGround.setPlayerLocY(iNewLoc);
					break;
				case "Down":
					iNewLoc = oPlayGround.getPlayerLocY() + 1;
					oPlayGround.setPlayerLocY(iNewLoc);
					break;
				case "Left":
					iNewLoc = oPlayGround.getPlayerLocX() - 1;
					oPlayGround.setPlayerLocX(iNewLoc);
					break;
				case "Right":
					iNewLoc = oPlayGround.getPlayerLocX() + 1;
					oPlayGround.setPlayerLocX(iNewLoc);
					break;
			}
		},

		onAfterKeyStroke: function (oEvent) {
			this._oBusy.open();
			$.ajax({
				contentType: 'application/json',
				data: JSON.stringify(oEvent.getParameters()),
				dataType: 'json',
				success: function (data) {
					if (data.status === 'ok') {
						this.playground.increaseStep();
						setTimeout(this._retrieveMonsters.bind(this), 1500);
					}
				}.bind(this),
				error: function (jqXHR, textStatus, error) {
					console.error(error);
					this._oBusy.close();
				},
				type: 'POST',
				url: 'http://localhost:3001/api/movemonsters'
			});
		},

		onChangePlayerLocX: function (oEvent) {
			var iNewLoc = oEvent.getParameter("newLocation"),
				oPlayGround = oEvent.getSource();
			if (iNewLoc >= 0 && iNewLoc < oPlayGround.getFieldSize()) {
				var aMonsters = oPlayGround.getAggregation("monsters");
				if (aMonsters) {
					var bClear = aMonsters.every(function (oMonster) {
						/* Check fields X +1 and -1 for newLocX */
						if (oMonster.getLocY() === oPlayGround.getPlayerLocY()) {
							if (oMonster.getLocX() === iNewLoc - 1 || oMonster.getLocX() === iNewLoc + 1) {
								return false;
							}
						}
						if (oMonster.getLocX() === iNewLoc) {
							if (oMonster.getLocY() === oPlayGround.getPlayerLocY() - 1 || oMonster.getLocY() === oPlayGround.getPlayerLocY() + 1) {
								return false;
							}
						}
						return true;
					});
					if (bClear) {
						oPlayGround.changePlayerLoc("X", iNewLoc);
						// oPlayGround.setProperty("playerLocX", iNewLoc, true);
					} else {
						oPlayGround.couldNotMovePlayer();
					}
				} else {
					oPlayGround.changePlayerLoc("X", iNewLoc);
					// oPlayGround.setProperty("playerLocX", iNewLoc, true);
				}
			} else {
				oPlayGround.couldNotMovePlayer();
			}
		},

		onChangePlayerLocY: function (oEvent) {
			var iNewLoc = oEvent.getParameter("newLocation"),
				oPlayGround = oEvent.getSource();
			if (iNewLoc >= 0 && iNewLoc < oPlayGround.getFieldSize()) {
				var aMonsters = oPlayGround.getAggregation("monsters");
				if (aMonsters) {
					var bClear = aMonsters.every(function (oMonster) {
						/* Check fields X +1 and -1 for newLocX */
						if (oMonster.getLocX() === oPlayGround.getPlayerLocX()) {
							if (oMonster.getLocY() === iNewLoc - 1 || oMonster.getLocY() === iNewLoc + 1) {
								return false;
							}
						}
						if (oMonster.getLocY() === iNewLoc) {
							if (oMonster.getLocX() === oPlayGround.getPlayerLocX() - 1 || oMonster.getLocX() === oPlayGround.getPlayerLocX() + 1) {
								return false;
							}
						}
						return true;
					});
					if (bClear) {
						oPlayGround.changePlayerLoc("Y", iNewLoc);
						// oPlayGround.setProperty("playerLocY", iNewLoc, true);
					} else {
						oPlayGround.couldNotMovePlayer();
					}
				} else {
					oPlayGround.changePlayerLoc("Y", iNewLoc);
					// oPlayGround.setProperty("playerLocY", iNewLoc, true);
				}
			} else {
				oPlayGround.couldNotMovePlayer();
			}
		},

		onRequestConfirmation: function () {
			if (!this._oDialog) {
				Fragment.load({
					name: "com.flexso.htf.HTF2020.view.Confirm",
					controller: this
				}).then(function (oDialog) {
					this._oDialog = oDialog;
					this._oDialog.setModel(this.getView().getModel());
					this.getView().addDependent(this._oDialog);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._oDialog.open();
			}
		},

		onYes: function () {
			MessageBox.success(this.getText("win"));
			this._oDialog.close();
		},

		onNo: function () {
			MessageBox.warning(this.getText("rule"));
			this._oDialog.close();
		},

		onRestart: function () {
			this.playground.resetGame();
			this.getView().setModel(this.playground.getProperty("_model"));
		},

		_retrieveMonsters: function () {
			$.ajax({
				contentType: 'application/json',
				dataType: 'json',
				success: function (data) {
					var monsters = data.filter(measure => measure.measure.GameId === this.playground.getGameId() && measure.measure.Step === this.playground.getStep()).map(measure => measure.measure);
					if (monsters.length === 0) {
						this._logger.error("_retrieveMonsters", "No monsters could be found, retrieving again.");
						setTimeout(this._retrieveMonsters.bind(this), 1500);
					} else {
						if (this.playground.getStep() === 0) {
							this.playground.initMonsters(monsters);
						} else {
							this.playground.updateMonsters(monsters);
						}
					}
					this._oBusy.close();
				}.bind(this),
				error: function (jqXHR, textStatus, error) {
					console.error(error);
					this._oBusy.close();
				},
				type: 'GET',
				url: 'http://localhost:3001/api/getmonsters'
			});
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