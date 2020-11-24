sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/library"
], function (jQuery, library) {

	"use strict";

	sap.ui.getCore().initLibrary({
		name: "htf",
		noLibraryCSS: true,
		version: "${version}",
		dependencies: ["sap.ui.core", "sap.m"],
		types: [
			"htf.Difficulty"
		],
		interfaces: [],
		controls: [
			"htf.PlayGround",
			"htf.Monster"
		],
		elements: []
	});
	/* eslint-disable no-undef */
	htf.Difficulty = {
		EASY: "E",
		MEDIUM: "M",
		DIFFICULT: "D",
		EXTREME: "X"
	};

	htf.GameStatus = {
		INIT_PLAYER: "1",
		INIT_MONSTERS: "2",
		INIT_PLAYGROUND: "3",
		WAIT_KEY_STROKE: "4",
		EXECUTE_KEY_STROKE: "5",
		WAIT_CHECK_MONSTERS: "6",
		WAIT_CONFIRMATION: "10",
		WIN: "20",
		RULE: "30"
	};

	return htf;

}, /* bExport= */ false);