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
  ss.getRange('B20').setValue(shifts.targetLength);
  for(var i = 0; i < guns.length; i++)
    printSweepZoneSolution(guns[i].sweepzone, shifts.solutions[i]);
}

function printSweepZoneSolution(cell, solution)
{
  str = 'Azimuth ' + solution.baseaz + ' sweep ' + solution.sweep + ' mils ' + solution.shifts + ' deflections \n' + 'Quadrant ' + solution.baseqd + ' zone ' + solution.zone + ' mils ' + solution.shifts + ' quadrants';
  ss.getRange(cell).setValue(str);
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