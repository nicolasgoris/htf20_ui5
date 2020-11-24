sap.ui.define([
    "sap/ui/model/SimpleType",
    "sap/ui/model/ValidateException"
], function (SimpleType, ValidateException) {
    "use strict";
    return SimpleType.extend("htf.Coordinate", {
        formatValue: function(sValue, sInternalValue) {
        	
        },
        parseValue: function(sValue, sInternalValue) {
        	
        },
        validateValue: function(sValue, sInternalValue) {
        	var aCoords = sValue.split(",");
        	if (aCoords[0] && aCoords[1] && parseInt(aCoords[0], 10) > 0 && parseInt(aCoords[1], 10) > 0) {
        		
        	} else {
        		throw new ValidateException("This is not a valid Coordinate");
        	}
        }
    });
});