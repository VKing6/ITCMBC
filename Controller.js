
//Setup
var spreadSheet =  SpreadsheetApp.getActiveSpreadsheet();
var tableSheet = spreadSheet.getSheetByName('Tables');
var targetSheet = spreadSheet.getSheetByName('Stores');

var calculateController = {
	constructor: function() {
		this.guns = [];
		this.guns[0] = generateGun('B2', 'D2', ['F3', 'F4', 'F5'], 'G16');
		this.guns[1] = generateGun('B3', 'D3', ['F7', 'F8', 'F9'], 'G17');
		this.guns[2] = generateGun('B4', 'D4', ['F11', 'F12', 'F13'], 'G18');
	},
	getTarget: function() {return toPos(getCellValue('B5'),getCellValue('D5'))},
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
		getTarget: function() {return toPos(getCellValue('B16'), getCellValue('D16'))},
		getCharge: function() {return getCellValue('B17')},
		getShifts: function() {return getCellValue('B18')},
		getDistance: function() {return getCellValue('B20')},
		setDistance: function(distance) {setCellValue('B20', distance)}
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