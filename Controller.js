
//Setup
var spreadSheet =  SpreadsheetApp.getActiveSpreadsheet();
var tableSheet = spreadSheet.getSheetByName('Tables');
var targetSheet = spreadSheet.getSheetByName('Stores');

var calculateController = {
	constructor: function() {
		this.gun1 = generateGun('B2', 'D2', ['F3', 'F4', 'F5'], 'G16');
		this.gun2 = generateGun('B3', 'D3', ['F7', 'F8', 'F9'], 'G17');
		this.gun3 = generateGun('B4', 'D4', ['F11', 'F12', 'F13'], 'G18');
	},
	getTarget: function() {
		return {'mgrs': splitGrid(getCellValue('B5')), 'elev': getCellValue('D5')}
	},
	sheaf: {
		getType: function() {return getCellValue('B6')},
		getDir: function() {return getCellValue('B7')},
		getlength: function() {return getCellValue('B8')},
		isQuick: function() {return getCellValue('D6')}
	},
	adjust: {
		getOT: function() {return getCellValue('B10')},
		getLR: function() {return getCellValue('B11')},
		getAD: function() {return getCellValue('B12')},
		getUD: function() {return getCellValue('B13')},
		getResultCoordinates: function() {
			return {'mgrs': splitGrid(getCellValue('D10')), 'elev': getCellValue('D11')}
		}
	},
	sweepZone: {
		getTarget: function() {
			return {'mgrs': splitGrid(getCellValue('B16')), 'elev': getCellValue('D16')}
		},
		getCharge: function() {return getCellValue('B17')},
		getShifts: function() {return getCellValue('B18')}
	}
}

calculateController.constructor();

//Generic methods to reduce code complexity
function getCellValue(cell)
{
	return spreadSheet.getRange(cell).getValue();
}
function setCellValue(cell, value)
{
	return spreadSheet.getRange(cell).setValue(value);
}

function splitGrid(grid) {
  var res = {};
  var length = grid.length;
  var half = length / 2;
  res.easting = toFiveDigit(grid.substr(0, half), false);
  res.northing = toFiveDigit(grid.substr(half, length - 1), false);

  return res;
}

//construction methods
function generateGun(coords, elev, results, sweepzone)
{
  var res = {};
  res.getCoords = function() {return splitGrid(getCellValue(coords))};
  res.getElev = function() {return splitGrid(getCellValue(elev))};
  res.setResults = function(resultsData) {
  	for (var i = results.length - 1; i >= 0; i--) {
  		setCellValue(results[i], resultsData[i]);
  	}
  };
  res.setSweepZone = function(sweepzoneData) {
  	setCellValue(sweepzone, sweepzoneData);
  }
  return res;
}