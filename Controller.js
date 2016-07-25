
//Setup
var spreadSheet =  SpreadsheetApp.getActiveSpreadsheet();
var calcSheet = spreadSheet.getSheetByName('Calculator');
var tableSheet = spreadSheet.getSheetByName('Tables');
var targetSheet = spreadSheet.getSheetByName('Stores');

var calculateController = {
	constructor: function() {
		this.guns = [];
		this.guns[0] = generateGun('B2', 'D2', ['F3', 'F4', 'F5'], 'G16');
		this.guns[1] = generateGun('B3', 'D3', ['F7', 'F8', 'F9'], 'G17');
		this.guns[2] = generateGun('B4', 'D4', ['F11', 'F12', 'F13'], 'G18');
		this.sheaf.init();
		this.adjust.init();
		this.sweepZone.init();
	},
	getTarget: function() {return toPos(getCellValue('B5'),getCellValue('D5'))},
	sheaf: {
		init: function() {
			generateObject(calculateController, this, [['Type', 'B6', null], ['Dir', 'B7', null], ['Length', 'B8', null], ['Quick', 'D6', null]]);
		},
		toJSON: function() {return getSheafJSON(this);},
		fromJSON: function(sheaf) {return setSheafJSON(this, sheaf);}
	},
	adjust: {
		init: function() {
			generateObject(calculateController, this, [['OT', 'B10', null], ['LR', 'B11', null], ['AD', 'B12', null], ['UD', 'B13', null]]);
		},
		getResultPos: function() {
			return cellFilled('D10') ? 
				toPos(getCellValue('D10'), getCellValue('D11')) :
				toPos(getCellValue('B5'), getCellValue('D5'))
		},
		setResultPos: function(pos) { 
			setCellValue('D10', pos.mgrs_string);
			setCellValue('D11', pos.elev);
		}
	},
	sweepZone: {
		init: function() {
			generateObject(calculateController, this, [['Charge', 'B17', null], ['Num', 'B18', null], ['Distance', 'B20', null]]);
		},
		getPos: function() {return toPos(getCellValue('B16'), getCellValue('D16'))},
		setPos: function(pos) {calculateController.setCellValue('B16', null, pos.mgrs_string); calculateController.setCellValue('D16', null, pos.elev);},
		toJSON: function() {return getSweepZoneJSON(this);},
		fromJSON: function(sweepZone) {return setSweepZoneJSON(this, sweepZone);}
	},
	getSaveReference: function() { return getCellValue('B29')},
	getLoadReference: function() { return getCellValue('B25')},
	getCellValue: function(ref, ref2) {
		return calcSheet.getRange(ref).getValue() + '';
	},
	setCellValue: function(ref, ref2, value) {
		calcSheet.getRange(ref).setValue(value + '');
	}
}

calculateController.constructor();

//Generic methods to reduce code complexity
function getCellValue(cell)
{
	return spreadSheet.getRange(cell).getValue() + '';
}

function setCellValue(cell, value)
{
	return spreadSheet.getRange(cell).setValue(value);
}

function cellFilled(cell)
{
	return (spreadSheet.getRange(cell) != '');
}

function toPos(mgrs, elev)
{
	return {
		mgrs: splitGrid(mgrs),
		elev: elev,
		mgrs_string: mgrs
	}
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
  res.getPos = function() {return toPos(getCellValue(coords), getCellValue(elev))};
  res.setResults = function(solution) {
    Logger.log(solution.quadrants);
  	for (var i = 0; i < solution.quadrants.length; i++) {
  		var str = 'charge ' + i + ': ' + ' Azimuth: ' + Math.round(solution.azimuth) + ', Quadrant: ' + solution.quadrants[i].qd + ', tof: ' + solution.quadrants[i].tof + ', distance: ' + solution.distance;
  		setCellValue(results[i], str);
  	}
  };
  res.setSweepZone = function(sweepzoneData) {
  	setCellValue(sweepzone, sweepzoneData);
  }
  res.setSweepZoneResults = function(solution) {
  	setCellValue(sweepzone, 'Azimuth ' + solution.baseaz + ' sweep ' + solution.sweep + ' mils ' + solution.shifts + ' deflections \n' + 'Quadrant ' + solution.baseqd + ' zone ' + solution.zone + ' mils ' + solution.shifts + ' quadrants');
  }
  return res;
}


function toFiveDigit(base, pre) {
  if (base.length < 5) {
    for (var i = base.length; i < 5; i++) {
      if(pre)
        base = '0' + base;
      else
        base = base + '0';
    }
  }
  return base;
}

function generateObject(controller, object, array) {
	for (var i = array.length - 1; i >= 0; i--) {
		var variable = array[i];
		generateGetSet(controller, object, variable[0], variable[1], variable[2]);
	}
}

function generateGetSet(controller, object, name, ref, ref2) {
	object['get' + name] = function(value){
		return controller.getCellValue(ref, ref2, value) + '';
	};
	object['set' + name] = function(value){
		return controller.setCellValue(ref, ref2, value);
	};
}

/*======================================NEEDS TO BE UPDATED WITH CONTROLLER CODE==========================================*/


function clear()
{
  clearSolution();
  clearSweep();
  clearInput();
}

function clearInput() {
  ss.getRange('B16').setValue(null);
  ss.getRange('D16').setValue(null);
  ss.getRange('B18').setValue(null);;
  ss.getRange('B20').setValue(null);
  
  ss.getRange('B5').setValue(null);
  ss.getRange('D5').setValue(null);
  ss.getRange('B7:B8').setValue(null);
  ss.getRange('B10:B13').setValue(null);
}

function clearSolution() {
  ss.getRange('F3:F5').setValue(null);
  ss.getRange('F7:F9').setValue(null);
  ss.getRange('F11:F13').setValue(null);
  ss.getRange('D10:D11').setValue(null);
}

function clearSweep() {
  ss.getRange('G16:G18').setValue(null);
}