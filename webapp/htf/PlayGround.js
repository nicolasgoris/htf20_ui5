sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/Control",
	"sap/ui/layout/form/SimpleForm",
	"./library"
], function (Log, Control, Form, htf) {
	return Control.extend("PlayGround", {
		metadata: {
			library: "htf",
			properties: {
				canvasElement: { type: "object" },
				canvas: { type: "object" },
				fieldSize: { type: "int", defaultValue: 5 },
				difficulty: { type: "htf.Difficulty", defaultValue: htf.Difficulty.EASY },
				gameId: { type: "string" },
				gameStatus: { type: "htf.GameStatus", defaultValue: htf.GameStatus.INIT_PLAYER },
				step: { type: "int", defaultValue: 0 },
				playerLocX: { type: "int", defaultValue: 0 },
				playerLocY: { type: "int", defaultValue: 0 },
				startLoc: { type: "string", defaultValue: "0;0" },
				endLoc: { type: "string", defaultValue: "0;0" },
				backgroundColor: { type: "string", defaultValue: "#08A107" },
				borderColor: { type: "string", defaultValue: "#FFFFFF" },
				borderWidth: { type: "int", defaultValue: 1 },
				squareSize: { type: "int", defaultValue: 50 },
				spotSize: { type: "string", defaultValue: 20 },
				_logger: { type: "object" },
				_model: { type: "sap.ui.model.json.JSONModel" }
			},
			aggregations: {
				monsters: {
					type: "htf.Monster",
					multiple: true,
					singularName: "monster"
				},
				_step: { type: "sap.m.Text", multiple: false }
			},
			events: {
				initiatePlayer: {
					parameters: {
						difficulty: "htf.Difficulty"
					}
				},
				initiateMonsters: {
					parameters: {
						difficulty: "htf.Difficulty",
						gameId: "string",
						fieldSize: "int",
						player: {
							x: "int",
							y: "int"
						}
					}
				},
				changePlayerLocX: {
					parameters: {
						newLocation: {
							type: "int"
						}
					}
				},
				changePlayerLocY: {
					parameters: {
						newLocation: {
							type: "int"
						}
					}
				},
				keyStroke: {
					parameters: {
						direction: {
							type: "string"
						}
					}
				},
				afterKeyStroke: {
					parameters: {
						difficulty: "htf.Difficulty",
						gameId: "string",
						fieldSize: "int",
						step: "int"
					}
				},
				afterCheckMonsters: {},
				requestConfirmation: {}
			}
		},

		init: function () {
			this._logger = Log.getLogger("'PlayGround'");
			this._logger.setLevel(Log.Level.DEBUG);
			if (!this.hasListeners("keyStroke")) this._logger.warning("keyStroke", "No Listener has been attached to the 'keyStroke' event");
			if (!this.hasListeners("changePlayerLocX")) this._logger.warning("changePlayerLocX",
				"No Listener has been attached to the 'changePlayerLocX' event");
			if (!this.hasListeners("changePlayerLocY")) this._logger.warning("changePlayerLocY",
				"No Listener has been attached to the 'changePlayerLocY' event");
			this._initNewGame();
		},

		renderer: {
			render: function (oRM, oControl) {
				oRM.write("<canvas id='canvas'></canvas>");
			}
		},

		onBeforeRendering: function () { },

		onAfterRendering: function () {
			if (sap.ui.core.Control.prototype.onAfterRendering) {
				sap.ui.core.Control.prototype.onAfterRendering.apply(this, arguments);
				this._initPlayGround();
			}
		},

		/* Set Methods */
		setGameStatus: function (iNewStatus) {
			var iCurrStatus = parseInt(this.getGameStatus());
			if (iNewStatus - iCurrStatus > 1 && iNewStatus < htf.GameStatus.WAIT_CONFIRMATION) {
				this._logger.error("gameStatus", "You cannot increase the Game Status more than one.");
			} else {
				this.setProperty("gameStatus", iNewStatus, true);
				switch (iNewStatus) {
					case htf.GameStatus.INIT_PLAYER:
						this.fireEvent("initiatePlayer", {
							difficulty: "htf.Difficulty"
						});
						break;
					case htf.GameStatus.INIT_MONSTERS:
						this._drawPlayer();
						this._drawEndLocation();
						this.fireEvent("initiateMonsters", {
							difficulty: this.getDifficulty(),
							gameId: this.getGameId(),
							fieldSize: this.getFieldSize(),
							player: {
								LocX: this.getPlayerLocX(),
								LocY: this.getPlayerLocY()
							}
						});
						break;
					case htf.GameStatus.INIT_PLAYGROUND:
						this._initListenToKeyStrokes();
						this.setGameStatus(htf.GameStatus.WAIT_KEY_STROKE);
						break;
					case htf.GameStatus.WAIT_KEY_STROKE:
						this._drawEndLocation();
						this._drawMonsters();
						break;
					case htf.GameStatus.EXECUTE_KEY_STROKE:
						// this.fireEvent("");
						break;
					case htf.GameStatus.WAIT_CHECK_MONSTERS:
						this._removeMonsters();
						this.fireEvent("afterKeyStroke", {
							difficulty: this.getDifficulty(),
							gameId: this.getGameId(),
							fieldSize: this.getFieldSize(),
							step: this.getStep()
						});
						break;
					case htf.GameStatus.WAIT_CONFIRMATION:
						this.fireEvent("requestConfirmation");
						break;
					case htf.GameStatus.WIN:
						this._endGame(true);
						break;
					case htf.GameStatus.RULE:
						this._endGame(false);
						break;
				}
			}
		},

		setPlayerLocX: function (iNewLoc) {
			if (this.getGameStatus() === htf.GameStatus.EXECUTE_KEY_STROKE) {
				if (this.hasListeners("changePlayerLocX")) {
					this._logger.debug("changePlayerLocX", "Use the method changePlayerLoc(sDirection, iLocation) to change the location of the player.");
					this.fireEvent("changePlayerLocX", {
						newLocation: iNewLoc
					});
				} else {
					this._logger.error("changePlayerLocX", "No Listener has been attached to the 'changePlayerLocX' event");
				}
			} else {
				this._logger.error("setPlayerLocX", "You cannot set the player location in this Game Status.");
			}
		},

		setPlayerLocY: function (iNewLoc) {
			if (this.getGameStatus() === htf.GameStatus.EXECUTE_KEY_STROKE) {
				if (this.hasListeners("changePlayerLocY")) {
					this._logger.debug("changePlayerLocY", "Use the method changePlayerLoc(sDirection, iLocation) to change the location of the player.");
					this.fireEvent("changePlayerLocY", {
						newLocation: iNewLoc
					});
				} else {
					this._logger.error("changePlayerLocY", "No Listener has been attached to the 'changePlayerLocY' event");
				}
			} else {
				this._logger.error("setPlayerLocY", "You cannot set the player location in this Game Status.");
			}
		},

		setMonsters: function () {
			this._logger.error("setMonsters", "Please use either 'initMonsters' or 'updateMonsters'. They do have a different impact on the Game Status!");
		},

		setStartLoc: function () {
			this.setProperty("playerLocX", this.getStartLocation()[0], true);
			this.setProperty("playerLocY", this.getStartLocation()[1], true);
		},

		/* Public functions */
		initLocations: function (sStartLoc, sEndLoc) {
			this.setStartLoc(sStartLoc);
			this.setEndLoc(sEndLoc);
			this.setGameStatus(htf.GameStatus.INIT_MONSTERS);
		},

		initMonsters: function (aMonsters) {
			this.removeAllAggregation("monsters");
			aMonsters.forEach(function (oMonster) {
				var monster = new htf.Monster(oMonster);
				this.addAggregation("monsters", monster);
			}.bind(this));
			this.setGameStatus(htf.GameStatus.INIT_PLAYGROUND);
		},

		changePlayerLoc: function (sDirection, iNewLoc) {
			if (sDirection === "X" || sDirection === "Y") {
				this.setProperty("playerLoc" + sDirection, iNewLoc, true);
				if ((this.getPlayerLocX() + ";" + this.getPlayerLocY() === this.getEndLoc())) {
					this.setGameStatus(htf.GameStatus.WAIT_CONFIRMATION);
				} else {
					this.setGameStatus(htf.GameStatus.WAIT_CHECK_MONSTERS);
				}
			} else {
				this._logger.error("changePlayerLoc", "Unknown direction, please use \"X\" or \"Y\".");
			}
		},

		updateMonsters: function (aMonsters) {
			this.removeAllAggregation("monsters");
			aMonsters.forEach(function (oMonster) {
				var monster = new htf.Monster(oMonster);
				this.addAggregation("monsters", monster);
			}.bind(this));
			this.setGameStatus(htf.GameStatus.WAIT_KEY_STROKE);
		},

		couldNotMovePlayer: function () {
			this.setGameStatus(htf.GameStatus.WAIT_KEY_STROKE);
		},

		getEndLocation: function () {
			return this.getProperty("endLoc").split(";").map(function (sLoc) { return parseInt(sLoc); });
		},

		getStartLocation: function () {
			return this.getProperty("startLoc").split(";").map(function (sLoc) { return parseInt(sLoc); });
		},

		increaseStep: function () {
			if (this.getGameStatus() === htf.GameStatus.WAIT_CHECK_MONSTERS) {
				this.setStep(this.getStep() + 1);
				this.getProperty("_model").setProperty("/step", this.getStep());
			} else {
				this._logger.error("increaseStep", "You cannot increase the Step in this Game Status.");
			}
		},

		resetGame: function () {
			this._initNewGame();
			this._initPlayGround();
		},

		/* Internal functions */
		_initNewGame: function () {
			this.setProperty("gameId", this._generateUUID(), true);
			this.setProperty("_model", new sap.ui.model.json.JSONModel({ difficulty: this.getDifficulty(), gameId: this.getGameId(), step: this.getStep() }));
			this.setProperty("gameStatus", htf.GameStatus.INIT_PLAYER, true);
		},

		_initPlayGround: function () {
			this.canvasElement = document.getElementById("canvas");
			this.canvasElement.height = this.getFieldSize() * this.getSquareSize();
			this.canvasElement.width = this.getFieldSize() * this.getSquareSize();
			this.canvas = this.canvasElement.getContext("2d");
			this.canvas.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this._initSquares();
			setTimeout(this._fireInitPlayer.bind(this), 1000);
		},

		_fireInitPlayer: function() {
			this.fireEvent("initiatePlayer", { difficulty: "htf.Difficulty" })
		},

		_initSquares: function () {
			var nFieldSize = this.getFieldSize();
			for (var i = 0; i < nFieldSize; i++) {
				for (var j = 0; j < nFieldSize; j++) {
					this._drawBackground(i, j);
				}
			}
		},

		_drawPlayer: function () {
			var img = new Image();
			img.onload = function () {
				this.canvas.drawImage(img, this.getPlayerLocX() * this.getSquareSize(), this.getPlayerLocY() * this.getSquareSize(), this.getSquareSize(),
					this.getSquareSize());
			}.bind(this);
			img.src = "./htf/player.svg";
		},

		_drawEndLocation: function () {
			var img = new Image();
			img.onload = function () {
				aEndLocation = this.getEndLocation();
				this.canvas.drawImage(img, aEndLocation[0] * this.getSquareSize(), aEndLocation[1] * this.getSquareSize(), this.getSquareSize(),
					this.getSquareSize());
			}.bind(this);
			img.src = "./htf/finish.svg";
		},

		_removePlayer: function () {
			this._drawRectangle(this.getPlayerLocX(), this.getPlayerLocY());
		},

		_drawMonsters: function () {
			var img = new Image(),
				aMonsters = this.getAggregation("monsters");
			img.onload = function () {
				if (aMonsters) {
					aMonsters.forEach(function (oMonster) {
						this.canvas.drawImage(img, oMonster.getLocX() * this.getSquareSize(), oMonster.getLocY() * this.getSquareSize(), this.getSquareSize(),
							this.getSquareSize());
					}.bind(this));
				}
			}.bind(this);
			img.src = "./htf/monster.svg";
		},

		_removeMonsters: function () {
			var img = new Image(),
				aMonsters = this.getAggregation("monsters");
			img.onload = function () {
				if (aMonsters) {
					aMonsters.forEach(function (oMonster) {
						this._drawRectangle(oMonster.getLocX(), oMonster.getLocY());
					}.bind(this));
				}
			}.bind(this);
			img.src = "./htf/monster.svg";
		},

		_initListenToKeyStrokes: function () {
			document.addEventListener("keydown", function (oEvent) {
				if (this.getGameStatus() === htf.GameStatus.WAIT_KEY_STROKE) {
					if (oEvent.key === "ArrowUp" || oEvent.key === "ArrowDown" || oEvent.key === "ArrowLeft" || oEvent.key === "ArrowRight") {
						this._removePlayer();
						if (this.hasListeners("keyStroke")) {
							if (this.hasListeners("afterKeyStroke")) {
								this.setGameStatus(htf.GameStatus.EXECUTE_KEY_STROKE);
								this.fireEvent("keyStroke", {
									direction: oEvent.key.replace("Arrow", "")
								});
							} else {
								this._logger.error("keyStroke", "No Listener has been attached to the 'afterKeyStroke' event");
							}
						} else {
							this._logger.error("keyStroke", "No Listener has been attached to the 'keyStroke' event");
						}
						this._drawPlayer();
					}
				} else {
					this._logger.debug("keyStroke", "You are not in the right GameStatus (" + this.getGameStatus() + ") to move the player.");
				}
			}.bind(this));
		},

		_movePlayer: function (sDirection) {
			var iNewLoc;
			this._removePlayer();
			switch (sDirection) {
				case "Up":
					iNewLoc = this.getPlayerLocY() - 1;
					this.setPlayerLocY(iNewLoc);
					break;
				case "Down":
					iNewLoc = this.getPlayerLocY() + 1;
					this.setPlayerLocY(iNewLoc);
					break;
				case "Left":
					iNewLoc = this.getPlayerLocX() - 1;
					this.setPlayerLocX(iNewLoc);
					break;
				case "Right":
					iNewLoc = this.getPlayerLocX() + 1;
					this.setPlayerLocX(iNewLoc);
					break;
			}
		},

		_drawSpot: function (iX, iY, sColor) {
			this.canvas.beginPath();
			this.canvas.arc((iX + 1) * this.getSquareSize() / 2, (iY + 1) * this.getSquareSize() / 2, this.getSpotSize(), 0, 2 * Math.PI);
			this.canvas.fillStyle = sColor;
			this.canvas.fill();
			this.canvas.lineWidth = this.getBorderWidth();
			this.canvas.strokeStyle = this.getBorderColor();
			this.canvas.stroke();
		},

		_drawBackground: function (iX, iY) {
			var img = new Image();
			img.onload = function () {
				this.canvas.drawImage(img, iX * this.getSquareSize(), iY * this.getSquareSize(), this.getSquareSize(),
					this.getSquareSize());
			}.bind(this);
			img.src = "./htf/background.svg";
		},

		_generateUUID: function () {
			var dt = new Date().getTime();
			var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
				var r = (dt + Math.random() * 16) % 16 | 0;
				dt = Math.floor(dt / 16);
				return (c === "x" ? r : (r & 0x3 | 0x8)).toString(16);
			});
			return uuid;
		}
	});
});