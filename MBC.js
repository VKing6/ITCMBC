adjusting = false;
function process() {
    //clearSolution();
    calculateController.clearCanvas();
    calculateController.clearResults();
    var baseEndPos = calculateController.getTarget();
    calculateController.adjust.setResultPos(baseEndPos);
    var ret = processBty(baseEndPos, true);
    addLog(ret);
    isDangerClose(baseEndPos);
    calculateController.updateAdjust(getCellValue('B5'), true);
}

function processBty(baseEndPos, print) {
    calculateController.setMapFocus(baseEndPos);
    var ret = [];
    var sheaf = calculateController.sheaf
    var sheafWidthMod = sheaf.getLength() / 2;
    sheafDir = sheaf.getDir();
    if (sheaf.getType() != 'special' && sheaf.getQuick() == 'true') {
        sheafDir = calcDirection(calculateController.getBatteryPos().mgrs, baseEndPos.mgrs) / 360 * 6400;
    }
    console.log(calculateController.guns);
    for (var i = 0; i < calculateController.guns.length; i++) {
        var endPos = baseEndPos;
        var gun = calculateController.guns[i];
        var gunPos = calculateController.guns[i].getPos();
        if (sheaf.getType() == 'parallel') {
            gunPos = calculateController.getBatteryPos();
        } else if (sheaf.getType() == 'special') {
            var guns = calculateController.guns.length;
            WidthPerGun = sheaf.getLength() / guns;
            var halfSheaf = sheaf.getLength() / 2;
            offset = (i+1) * WidthPerGun - (WidthPerGun / 2) - halfSheaf;
            console.log(offset);
            //offset = (calculateController.guns.length % 2 == 0) ? sheafWidthMod * (i-1) -0.5 : sheafWidthMod * (i-1) ;
            endPos = adjustGridToGrid(endPos, sheafDir, 0, offset, 0, 0);
        } else if (sheaf.getType() == 'linear') {
            endPos = adjustGridToGrid(endPos, sheafDir, 0, 40 * (i-1), 0, 0);
        } else if (sheaf.getType() == 'open') {
            endPos = adjustGridToGrid(endPos, sheafDir, 0, 60 * (i-1), 0, 0);
        } // else it's converged sheaf
        calculateController.drawCross(gunPos, 'multiply');
        var res = getSolutions(gunPos, endPos);
        ret[i] = res;
        if(print) {
            gun.setResults(res);
        }
    }
    return ret;
}

function startSweepZone(start, end, shape) {
    calculateController.clearResults();
    calculateController.clearCanvas();
    var shifts = setSweepZone(start, end, shape);
    calculateController.sweepZone.setDistance(shifts.targetLength);
    for(var i = 0; i < shifts.solutions.length; i++)
    {
        calculateController.guns[i].setSweepZoneResults(shifts.base[i], shifts.solutions[i]);
    }
    addLog(shifts, true);
    isDangerClose(end);
}

function isDangerClose(target) {
    dangerCloseHide();
    var keys = Object.keys(pointStores);
    noDanger = true;
    for (var i = keys.length - 1; i >= 0; i--) {
        point = pointStores[keys[i]];
        if(point.friendly == "true") {
            console.log('checking', dist, target, point);
            var dist = calcDistance(target.mgrs, point.position.mgrs);
            console.log(dist);
            if(dist < 600) {
                dangerClose(keys[i]);
                noDanger = false;
            }
        }
    }
}

/*==============================================================================================================*/

function calcDistance(start, end) {
    var diff = getGridDiff(start, end);
    var dist = Math.round(Math.sqrt(Math.pow(diff.dx, 2) + Math.pow(diff.dy, 2)));
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
        return 180- angle;
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

function calcAverage(positions) {
    totalEast = 0;
    totalNorth = 0;
    totalElev = 0;
    for (var i = positions.length - 1; i >= 0; i--) {
        var pos = positions[i];
        Math.floor(totalEast += parseInt(pos.mgrs.easting));
        Math.floor(totalNorth += parseInt(pos.mgrs.northing));
        Math.floor(totalElev += parseInt(pos.elev));
    }
    var total = positions.length;
    totalEast = Math.floor(totalEast / total);
    totalNorth = Math.floor(totalNorth / total);
    console.log(toFiveDigit(totalEast, true));
    return toPos(toFiveDigit(totalEast, true) + '' + toFiveDigit(totalNorth,true), Math.floor(totalElev / total));
}

/*==============================================================================================================*/

function getSolutions(startPos, endPos) {
    var distance = calcDistance(startPos.mgrs, endPos.mgrs);
    var azimuth = calcDirection(startPos.mgrs, endPos.mgrs);
    var solutions = calcQuadrants(distance, endPos.elev - startPos.elev);
    calculateController.drawCross(endPos, 'add');
    return {'azimuth' : azimuth / 360 * 6400, 'distance' : distance, 'quadrants' : solutions ,start: startPos, end: endPos};
}

function calcQuadrants(distance, elevDiff) {
    var charges = mortarTable.mortar_82.charges;
    var res = [];
    for (var i = charges.length - 1; i >= 0; i--) {
        var charge = charges[i];
        console.log(calculateController.options.getRangeTable());
        res[i] = QuadrantFromRange(mortarTable[calculateController.options.getRangeTable()][charge], distance, elevDiff);
    }
    return res;
}

function QuadrantFromRange(table, distance, elevDiff) {
    var low = Math.floor(distance / 50) * 50;
    var high = low + 50;
    if(table[low] != null && table[high] != null)
    {
        var substep = high - distance;
        var difference = high - low;
        var lowqd = table[low].qd;
        var highqd = table[high].qd;

        var diffqd = lowqd - highqd;
        var subqd = diffqd / difference * substep;
        var qd = Math.round(highqd + subqd);

        var lowElev = table[low].dqd;
        var highElev = table[high].dqd;
        var subElev = highElev + (lowElev - highElev) / difference * substep;
        var adjElev = subElev * (elevDiff / 100)    * -1;
        qd = qd + adjElev;
        console.log('qd', elevDiff);
        return {'qd' : Math.round(qd), 'tof' : table[low].tof};
    }else{
        return {'qd' : null, 'tof' : null};
    }            
}

/*==============================================================================================================*/

function setSweepZone(start, end, shape) {
    var result = {
        solutions: [],
        base: [],
        error: ''
    };
    var sweepzone = calculateController.sweepZone;
    var targetStartPos = (start != null) ? start : calculateController.adjust.getResultPos();
    var startSolution = processBty(targetStartPos, false);
    var startSheaf = calculateController.sheaf.toJSON();
    if(calculateController.sweepZone.getSheaf() && !shape) {
        calculateController.sheaf.setType('special');
        calculateController.sheaf.setDir(calculateController.sweepZone.getSheafDir());
        calculateController.sheaf.setLength(calculateController.sweepZone.getSheafLength());
    }
    var charge = sweepzone.getCharge();
    var shifts = sweepzone.getShifts();
    var targetEndPos = (end != null) ? end : sweepzone.getTarget();
    var endSolution = processBty(targetEndPos, false);
    calculateController.sheaf.fromJSON(startSheaf);
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

        calculateController.drawLine(startSolution[i].end, endSolution[i].end);
        var sweep = (azimuth - startAzimuth) / shifts;
        var zone = (quadrant - startQuadrant) / shifts;
        result['base'][i] = startSolution[i];
        result['solutions'][i] = {'baseaz' : Math.round(startAzimuth), 'baseqd' : startQuadrant, 'sweep' : Math.round(sweep), 'zone' : zone, 'shifts' : shifts};
    }
    return result;
}

/*=========================================adjust===============================================================*/

function adjust() {
    adjusting = true;
    calculateController.clearResults();
    var adjust = calculateController.adjust;
    var res = adjustGridToGrid(adjust.getResultPos(), adjust.getOT(), adjust.getAD(), adjust.getLR(), adjust.getUD());
    adjust.setResultPos(res);
    calculateController.setTarget(res);
    console.log(res);
    var sl = processBty(res, true);
    isDangerClose(res);
    calculateController.updateAdjust(getCellValue('B5'));
    adjusting = false;
}

function adjustGridToGrid(pos, ot, ad, lr, ud) {
    console.log('ud', ud);
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
    calculateController.sheaf.fromJSON(row.sheaf.toJSON());
    calculateController.sweepZone.fromJSON(row.sweepZone.toJSON());
}

function save()
{
    var ref = calculateController.getSaveReference();
    var row = storeController.getSaveRow(ref);
    row.setReference(ref);
    row.setPosition(calculateController.adjust.getResultPos());
    row.sheaf.fromJSON(calculateController.sheaf.toJSON());
    row.sweepZone.fromJSON(calculateController.sweepZone.toJSON());
}
