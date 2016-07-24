var ss = SpreadsheetApp.getActiveSpreadsheet();
var tableSheet = ss.getSheetByName('Tables');
var targetSheet = ss.getSheetByName('Stores');

function process() {
  clearSolution();
  var baseEndPos = calculateController.getTarget();
  calculateController.adjust.setResultPos(baseEndPos);
  processBty(baseEndPos, true);
}

function processBty(baseEndPos, print) {
  var ret = [];
  var sheaf = calculateController.sheaf
  var sheafWidthMod = sheaf.getlength() / 2;
  var basePiece = calculateController.guns[1];
  if (sheaf.getType() != 'Special' && sheaf.isQuick == 'On') {
    sheafDir = (calcDirection(basePiece.getPos, baseEndPos) + 1600) % 6400;
  }
  for (var i = 0; i < calculateController.guns.length; i++) {
    var endPos = baseEndPos;
    var gun = calculateController.guns[i];
    var gunPos = calculateController.guns[i].getPos;
    if (sheaf.getType() == 'Parallel') {
      gunPos = basePiece.getPos();
    } else if (sheaf == 'Special') {
      Logger.log(sheafWidthMod * (i-1));
      endPos.mgrs = adjustGridToGrid(endPos.mgrs, 0, sheafDir, sheafWidthMod * (i-1), 0, 0).coords;
    } else if (sheaf == 'Linear') {
      endPos.mgrs = adjustGridToGrid(endPos.mgrs, 0, sheafDir, 40 * (i-1), 0, 0).coords;
    } else if (sheaf == 'Open') {
      endPos.mgrs = adjustGridToGrid(endPos.mgrs, 0, sheafDir, 60 * (i-1), 0, 0).coords;
    } // else it's converged sheaf
    var res = getSolutions(gunPos, endPos);
    ret[i] = res;
    if(print) {
      gun.setResults(res);
    }
  }
  return ret;
}

function startSweepZone() {
  clearSweep();
  var shifts = setSweepZone();
  calculateController.sweepZone.setDistance(shifts.targetLength);
  for(var i = 0; i < shifts.solutions.length; i++)
    calculateController.guns[i].setSweepZoneResults(shifts.solutions[i]);
}

/*==============================================================================================================*/

function calcDistance(start, end) {
  var diff = getGridDiff(start, end);
  var dist =  Math.round(Math.sqrt(Math.pow(diff.dx, 2) + Math.pow(diff.dy, 2)));
  return dist;
}

function calcDirection(start, end) {
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

function getGridDiff(start, end) {
  var deltaX = getDiff(start.easting, end.easting);
  var deltaY = getDiff(start.northing, end.northing);
  return {'dx' : deltaX, 'dy' : deltaY};
}

function getDiff(i, j) {
  return Math.abs(i - j);
}

/*==============================================================================================================*/

function getSolutions(startPos, endPos) {
  var distance = calcDistance(startPos.mgrs, endPos.mgrs);
  var azimuth = calcDirection(startPos.mgrs, endPos.mgrs);
  var solutions = calcQuadrants(distance, endPos.elev - startPos.elev);
  return {'azimuth' : azimuth / 360 * 6400, 'distance' : distance, 'quadrants' : solutions};
}

function calcQuadrants(distance, elevDiff) {
  var ch0 = QuadrantFromRange(tableSheet.getRange('B3:M10'), distance, elevDiff);
  var ch1 = QuadrantFromRange(tableSheet.getRange('B13:M37'), distance, elevDiff);
  var ch2 = QuadrantFromRange(tableSheet.getRange('B40:M97'), distance, elevDiff);
  var res = [];
  if(ch0 != null)
   res[0] =  {'qd' : ch0.qd, 'tof' : ch0.tof};
  else
   res[0] =  {'qd' : null, 'tof' : null};
  if(ch1 != null)
   res[1] =  {'qd' : ch1.qd, 'tof' : ch1.tof};
  else
   res[1] =  {'qd' : null, 'tof' : null};
  if(ch2 != null)
   res[2] =  {'qd' : ch2.qd, 'tof' : ch2.tof};
  else
   res[2] =  {'qd' : null, 'tof' : null};
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
  var result = {
    solutions: [],
    error: ''
  };
  var sweepzone = calculateController.sweepZone;
  var targetStartPos = calculateController.adjust.getResultPos();
  var startSolution = processBty(targetStartPos, false);

  var charge = sweepzone.getCharge();
  var shifts = sweepzone.getShifts();
  var targetEndPos = sweepzone.getTarget();
  var endSolution = processBty(targetEndPos, false);
  var targetLength = calcDistance(targetStartPos.mgrs, targetEndPos.mgrs);
  result.targetLength = targetLength;

  for (var i = 0; i < calculateController.guns.length; i++) {
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

/*=========================================adjust===============================================================*/

function adjust() {
  var adjust = calculateController.adjust;
  var res = adjustGridToGrid(adjust.getResultPos(), adjust.getOT(), adjust.getAD(), adjust.getLR(), adjust.getUD());
  adjust.setResultPos(res);
  processBty(res, res.elev, true);
}

function adjustGridToGrid(pos, ot, ad, lr, ud) {
  var de = deltaEasting(ot, ad, lr);
  var dn = deltaNorthing(ot, ad, lr);

  var startGrid = pos.mgrs;
  de = Math.round(de); dn = Math.round(dn);
  var startElev = pos.elev;
  var endEasting = parseInt(startGrid.easting, 10) + de;
  var endNorthing = parseInt(startGrid.northing, 10) + dn;
  endEasting = toFiveDigit(endEasting + '', true);
  endNorthing = toFiveDigit(endNorthing + '', true);
  var endGrid = endEasting + '' + endNorthing;
  var endElev = parseInt(pos.elev) + parseInt(ud);
  return toPos(endGrid, endElev);
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

/*=============================preload=============================*/

function load()
{
  var ref = calculateController.getLoadReference();
  var row = storeController.getLoadRow(ref);

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
  var ref = calculateController.getSaveReference();
  var row = storeController.getSaveRow(ref);
  row.setReference(ref);
  row.setPosition(calculateController.adjust.getResultPos());
  row.setSheafJSON(calculateController.sheaf.toJSON());
  row.setShiftJSON(calculateController.sweepZone.toJSON());
}