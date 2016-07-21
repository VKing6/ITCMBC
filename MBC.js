var ss = SpreadsheetApp.getActiveSpreadsheet();
var tableSheet = ss.getSheetByName('Tables');
var targetSheet = ss.getSheetByName('Stores');

var guns = [
  {'coords' : 'B2', 'elev' : 'D2', 'results' : ['F3', 'F4', 'F5'], 'sweepzone' : 'G16'},
  {'coords' : 'B3', 'elev' : 'D3', 'results' : ['F7', 'F8', 'F9'], 'sweepzone' : 'G17'},
  {'coords' : 'B4', 'elev' : 'D4', 'results' : ['F11', 'F12', 'F13'], 'sweepzone' : 'G18'}
];
var target = {'coords' : 'B5', 'elev' : 'D5'};

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

function process() {
  clearSolution();
  var baseEndGrid = ss.getRange(target.coords).getValue() + '';
  var baseEndElev = ss.getRange(target.elev).getValue() + '';
  ss.getRange('D10').setValue(baseEndGrid);
  ss.getRange('D11').setValue(baseEndElev);
  processBty(baseEndGrid, baseEndElev, true);
}

function processBty(baseEndGrid, baseEndElev, print) {
  var ret = [];
  var sheaf = ss.getRange('B6').getValue() + '';
  var sheafDir = ss.getRange('B7').getValue();
  var sheafWidth = ss.getRange('B8').getValue();
  var sheafWidthMod = sheafWidth / 2;
  var basePiece = getGunData(guns[1]);
  var quickSheaf = ss.getRange('D6').getValue() + '';
  if (sheaf != 'Special' && quickSheaf == 'On') {
    sheafDir = (calcDirection(basePiece.coords, baseEndGrid) + 1600) % 6400;
  }
  for (var i = 0; i < guns.length; i++) {
    var endGrid = baseEndGrid;
    var endElev = baseEndElev;
    var gun = getGunData(guns[i]);
    if (sheaf == 'Parallel') {
      gun.coords = basePiece.coords;
      gun.elev = basePiece.elev;
    } else if (sheaf == 'Special') {
      Logger.log(sheafWidthMod * (i-1));
      endGrid = adjustGridToGrid(endGrid, 0, sheafDir, sheafWidthMod * (i-1), 0, 0).coords;
    } else if (sheaf == 'Linear') {
      endGrid = adjustGridToGrid(endGrid, 0, sheafDir, 40 * (i-1), 0, 0).coords;
    } else if (sheaf == 'Open') {
      endGrid = adjustGridToGrid(endGrid, 0, sheafDir, 60 * (i-1), 0, 0).coords;
    } // else it's converged sheaf
    var res = calcMission(gun.coords, gun.elev, endGrid, endElev);
    ret[i] = res;
    if(print) {
      for(var j = 0; j < 3; j++) {
        printSolution(gun.results[j], res, 'Charge' + j);
      }
    }
  }
  return ret;
}

function calcMission(startGrid, startElev, endGrid, endElev) {
  return getSolutions(startGrid, endGrid, startElev, endElev);
}

function startSweepZone() {
  clearSweep();
  var shifts = setSweepZone();
  ss.getRange('B20').setValue(shifts.targetLength);
  for(var i = 0; i < guns.length; i++)
    printSweepZoneSolution(guns[i].sweepzone, shifts.solutions[i]);
}

function printSolution(cell, solution, charge)
{
  str = charge + ': ' + ' Azimuth: ' + Math.round(solution.azimuth) + ', Quadrant: ' + solution.quadrants[charge].qd + ', tof: ' + solution.quadrants[charge].tof + ', distance: ' + solution.distance;
  ss.getRange(cell).setValue(str);
}

function printSweepZoneSolution(cell, solution)
{
  str = 'Azimuth ' + solution.baseaz + ' sweep ' + solution.sweep + ' mils ' + solution.shifts + ' deflections \n' + 'Quadrant ' + solution.baseqd + ' zone ' + solution.zone + ' mils ' + solution.shifts + ' quadrants';
  ss.getRange(cell).setValue(str);
}

/*==============================================================================================================*/

function calcDistance(start, end) {
  var diff = getGridDiff(splitGrid(start), splitGrid(end));
  var dist =  Math.round(Math.sqrt(Math.pow(diff.dx, 2) + Math.pow(diff.dy, 2)));
  /*
  if(start.length == 6)
  {
    return dist * 100;
  }else if(start.length == 8) {
    return dist * 10;
  }
  */
  return dist;
}

function calcDirection(start, end) {
  var start = splitGrid(start);
  var end = splitGrid(end);
  var diff = getGridDiff(start, end);
  var angle = Math.atan(diff.dx / diff.dy) / (Math.PI / 180);
  if(start.easting > end.easting && start.northing < end.northing)
    return 360 - angle;
  else if(start.easting > end.easting)
    return 180 + angle;
  else if(start.northing > end.northing)
    return 90 + angle;
  else
    return angle;
}

function splitGrid(grid) {
  var res = {};
  var length = grid.length;
  var half = length / 2;
  res.easting = toFiveDigit(grid.substr(0, half), false);
  res.northing = toFiveDigit(grid.substr(half, length - 1), false);

  return res;
}

function getGridDiff(start, end) {
  var deltaX = getDiff(start.easting, end.easting);
  var deltaY = getDiff(start.northing, end.northing);
  return {'dx' : deltaX, 'dy' : deltaY};
}

/*==============================================================================================================*/

function getSolutions(startGrid, endGrid, startElev, endElev) {
  var distance = calcDistance(startGrid, endGrid);
  var azimuth = calcDirection(startGrid, endGrid);
  var solutions = calcQuadrants(distance, endElev - startElev);
  return {'azimuth' : azimuth / 360 * 6400, 'distance' : distance, 'quadrants' : solutions};
}

function calcQuadrants(distance, elevDiff) {
  var ch0 = QuadrantFromRange(tableSheet.getRange('A3:L10'), distance, elevDiff);
  var ch1 = QuadrantFromRange(tableSheet.getRange('N3:Y37'), distance, elevDiff);
  var ch2 = QuadrantFromRange(tableSheet.getRange('AA3:AL60'), distance, elevDiff);
  var res = {};
  if(ch0 != null)
   res['Charge0'] =  {'qd' : ch0.qd, 'tof' : ch0.tof};
  else
   res['Charge0'] =  {'qd' : null, 'tof' : null};
  if(ch1 != null)
   res['Charge1'] =  {'qd' : ch1.qd, 'tof' : ch1.tof};
  else
   res['Charge1'] =  {'qd' : null, 'tof' : null};
  if(ch2 != null)
   res['Charge2'] =  {'qd' : ch2.qd, 'tof' : ch2.tof};
  else
   res['Charge2'] =  {'qd' : null, 'tof' : null};
  return res;
}

function QuadrantFromRange(tableCols, distance, elevDiff) {
  for (var i = 1; i < tableCols.getHeight() - 1; i++) {
    var low = tableCols.getCell(i,1).getValue();
    var high = tableCols.getCell(i + 1,1).getValue();
    if (distance >= low && distance <= high) {
      var substep = high - distance;
      var difference = high - low;
      var lowqd = tableCols.getCell(i, 2).getValue();
      var highqd = tableCols.getCell(i + 1, 2).getValue();

      var diffqd = lowqd - highqd;
      var subqd = diffqd / difference * substep;
      var qd = Math.round(highqd + subqd);

      var lowElev = tableCols.getCell(i, 3).getValue();
      var highElev = tableCols.getCell(i +1, 3).getValue();
      var subElev = highElev + (lowElev - highElev) / difference * substep;
      var adjElev = subElev * (elevDiff / 100)  * -1;
      qd = qd + adjElev;

      return {'qd' : Math.round(qd), 'tof' : tableCols.getCell(i, 5).getValue()};
    }
  }
}

/*==============================================================================================================*/

function setSweepZone() {
  var result = {};
  result['solutions'] = [];
  var error = '';
  var charge = ss.getRange('B17').getValue();
  var targetStartGrid = ss.getRange('D10').getValue();
  var baseEndElev = ss.getRange('D11').getValue();
  var startSolution = processBty(targetStartGrid, baseEndElev, false);

  var shifts = ss.getRange('B18').getValue();
  var targetEnd = ss.getRange('B16').getValue() + '';
  var targetEndElev = ss.getRange('D16').getValue() + '';
  var endSolution = processBty(targetEnd, targetEndElev, false);
  var targetLength = calcDistance(targetStartGrid, targetEnd);
  result['targetLength'] = targetLength;

  for (var i = 0; i < guns.length; i++) {
    var startQuadrant = startSolution[i].quadrants[charge].qd;
    var quadrant = endSolution[i].quadrants[charge].qd;
    if (quadrant == null) {
      result['error'] = 'this charge does not cover the target area';
    }
    var startAzimuth = startSolution[i].azimuth;
    var azimuth = endSolution[i].azimuth;

    var sweep = (azimuth - startAzimuth) / shifts;
    var zone = (quadrant - startQuadrant) / shifts;
    result['solutions'][i] = {'baseaz' : Math.round(startAzimuth), 'baseqd' : startQuadrant, 'sweep' : Math.round(sweep), 'zone' : zone, 'shifts' : shifts};
  }
  return result;
}

function getChargeSolution(charge) {
  var range = ss.getRangeByName(charge);
  return {'az' : range.getCell(1,1).getValue(), 'qd' : range.getCell(1,3).getValue()};
}

/*=========================================adjust===============================================================*/

function adjust() {
  var data = readSheet();
  var startGrid = ss.getRange('B2').getValue() + '';
  var startElev = ss.getRange('D2').getValue() + '';
  var res = adjustGridToGrid(data.grid, data.elev, data.ot, data.ad, data.lr, data.ud);
  ss.getRange('D10').setValue(res.coords);
  ss.getRange('D11').setValue(res.elev);
  processBty(res.coords, res.elev, true);
}

function adjustGridToGrid(grid, elev, ot, ad, lr, ud) {
  var de = deltaEasting(ot, ad, lr);
  var dn = deltaNorthing(ot, ad, lr);
  var grid = splitGrid(grid);

  var startGrid = grid;
  /*
  if(startGrid.easting.length == 3)
  {
   de = de / 100; dn = dn / 100;
  }else if (startGrid.easting.length == 4)
  {
   de = de / 10; dn = dn / 10;
  }
  */
  de = Math.round(de); dn = Math.round(dn);
  var startElev = elev;
  var endEasting = parseInt(grid.easting, 10) + de;
  var endNorthing = parseInt(grid.northing, 10) + dn;
  endEasting = toFiveDigit(endEasting + '', true);
  endNorthing = toFiveDigit(endNorthing + '', true);
  var endGrid = endEasting + '' + endNorthing;
  var endElev = parseInt(elev) + parseInt(ud);
  return {'coords' : endGrid, 'elev' : endElev}
}

function readSheet() {
  var res = {};

  if (ss.getRange('D10').getValue() == '') {
    ss.getRange('D10').setValue(ss.getRange('B5').getValue());
    ss.getRange('D11').setValue(ss.getRange('D5').getValue());
  }

  res['ot'] = ss.getRange('B10').getValue();
  res['lr'] = ss.getRange('B11').getValue();
  res['ad'] = ss.getRange('B12').getValue();
  res['ud'] = ss.getRange('B13').getValue();
  res['grid'] = ss.getRange('D10').getValue();
  res['elev'] = ss.getRange('D11').getValue();
  clearSolution();
  return res;
}

function deltaEasting(ot, ad, lr) {
  var offAD = Math.sin((ot / 6400 * 360) * (Math.PI / 180)) * ad;
  var offLR = Math.cos((ot / 6400 * 360) * (Math.PI / 180)) * lr;
  return Math.round(offAD + offLR);
}

function deltaNorthing(ot, ad, lr) {
  var offAD = Math.cos((ot / 6400 * 360) * (Math.PI / 180)) * ad;
  var offLR = Math.sin((ot / 6400 * 360) * (Math.PI / 180)) * -lr;
  return Math.round(offAD + offLR);
}

/*=========================================simple stuff==========================================================*/

function getDiff(i, j) {
  return Math.abs(i - j);
}

function getGunData(gun) {
  var res = {};
  res.coords = ss.getRange(gun.coords).getValue() + '';
  res.elev = ss.getRange(gun.elev).getValue() + '';
  res.results = gun.results;
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

/*=============================preload=============================*/

function load()
{
  var reference = ss.getRange('B25').getValue() + '';

  var data = targetSheet.getDataRange().getValues();
  for(n=0;n<data.length;++n){
    if(data[n][0].toString() == reference){
      Logger.log(data[n][0].toString());
      var resultData = targetSheet.getRange(n + 1, 1, 1, 13);
      var mgrs = resultData.getCell(1, 2).getValue();
      var elev = resultData.getCell(1, 3).getValue();

      var sheaf = resultData.getCell(1, 5).getValue();
      var sheaf_dir = resultData.getCell(1, 6).getValue();
      var sheaf_length = resultData.getCell(1, 7).getValue();
      var quick_sheaf = resultData.getCell(1, 8).getValue();

      var shift_mgrs = resultData.getCell(1, 10).getValue();
      var shift_elev = resultData.getCell(1, 11).getValue();
      var shift_charge = resultData.getCell(1, 12).getValue();
      var shift_shifts = resultData.getCell(1, 13).getValue();

      ss.getRange('B5').setValue(mgrs);
      ss.getRange('D5').setValue(elev);

      ss.getRange('B6').setValue(sheaf);
      ss.getRange('B7').setValue(sheaf_dir);
      ss.getRange('B8').setValue(sheaf_length);
      ss.getRange('D6').setValue(quick_sheaf);

      ss.getRange('B16').setValue(shift_mgrs);
      ss.getRange('B17').setValue(shift_charge);
      ss.getRange('B18').setValue(shift_shifts);
      ss.getRange('D16').setValue(shift_elev);
      break;
    };
  }
}

function save()
{

  var reference = ss.getRange('B29').getValue();

  var mgrs = ss.getRange('D10').getValue();
  if(mgrs == '')
    mgrs = ss.getRange('B5').getValue();
  var elev = ss.getRange('D5').getValue();
  if(elev == '')
    elev = ss.getRange('D11').getValue();

  var sheaf = ss.getRange('B6').getValue();
  var sheaf_dir = ss.getRange('B7').getValue();
  var sheaf_length = ss.getRange('B8').getValue();
  var quick_sheaf = ss.getRange('D6').getValue();

  var shift_mgrs = ss.getRange('B16').getValue();
  var shift_elev = ss.getRange('B17').getValue();
  var shift_charge = ss.getRange('B18').getValue();
  var shift_shifts = ss.getRange('D16').getValue();
  var data = targetSheet.getDataRange().getValues();

  for(n=1;n<data.length;++n){
    if(data[n][0].toString() != ""&& data[n][0].toString() != reference){
      continue;
    }else{
      targetSheet.getRange(n+1,1).setValue(reference);
      targetSheet.getRange(n+1,2).setValue(mgrs);
      targetSheet.getRange(n+1,3).setValue(elev);

      targetSheet.getRange(n+1,5).setValue(sheaf);
      targetSheet.getRange(n+1,6).setValue(sheaf_dir);
      targetSheet.getRange(n+1,7).setValue(sheaf_length);
      targetSheet.getRange(n+1,8).setValue(quick_sheaf);

      targetSheet.getRange(n+1,10).setValue(shift_mgrs);
      targetSheet.getRange(n+1,11).setValue(shift_charge);
      targetSheet.getRange(n+1,12).setValue(shift_elev);
      targetSheet.getRange(n+1,13).setValue(shift_shifts);

      break;
    }
  }
}

/*===============================SHOT===================================*/

function shot()
{
  var cell = targetSheet.getRange('G25');
  startTimer(200, cell);
}

function startTimer(duration, cell) {
  var timer = duration;
    setInterval(function () {

      cell.setValue(timer);
        if (--timer < 0) {
            timer = duration;
          return;
        }
    }, 1000);
}

function clear()
{
  clearSolution();
  clearSweep();
  clearInput();
}
