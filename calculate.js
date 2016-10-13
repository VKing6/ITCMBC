/*======================================Semi-controller======================================*/

function processBty(guns, sheaf, target, sweepZone) {

}

/*======================================Functional======================================*/

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



/*=========================================BTY========================================*/

/**
 * Calculates a target for each gun based on the sheaf
 * parameter: guns key value json list
 * parameter: sheaf json object
 * returns json object {gunName: targetPos, gunName: targetPos}
 */
function getSheafTargets(guns, sheaf, target) {

}

/**
 * Gets battery position
 * parameter: guns key value json list
 */
function getBatteryPosition(guns) {
    var positions = [];
    var keys = Object.keys(positions);
    for (var i = keys.length - 1; i >= 0; i--) {
        positions.push(guns[keys[i]].getPos());
    }
    return calcAverage(positions);
}

/**
 * Gets solution for a gun with a round between two positions
 */
function getSolutions(gun, round, startPos, endPos) {
    var distance = calcDistance(startPos.mgrs, endPos.mgrs);
    var azimuth = calcDirection(startPos.mgrs, endPos.mgrs);
    var solutions = calcQuadrants(gun, round, distance, endPos.elev - startPos.elev);
    calculateController.drawCross(endPos, 'add');
    return {'azimuth' : azimuth / 360 * 6400, 'distance' : distance, 'quadrants' : solutions ,start: startPos, end: endPos};
}

/*======================================Quadrant======================================*/

/**
 * gun: which gun to take from the tables, example: mortar_82
 * round: which table to take from the gun: all or all_nwr for the mortar_82, this will later be used for different shell types with different tables
 * distance: distance in m
 * elevDiff: elev Difference in m
 */
function calcQuadrants(gun, round, distance, elevDiff) {
    var charges = tables[gun][round].charges;
    var res = [];
    for (var i = charges.length - 1; i >= 0; i--) {
        var charge = charges[i];
        console.log(calculateController.options.getRangeTable());
        res[i] = QuadrantFromRange(tables[gun][round][charge], distance, elevDiff);
    }
    return res;
}

/**
 * table: json table of charge
 * 
 */
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

/*======================================Adjust======================================*/

function adjustGridToGrid(pos, ot, ad, lr, ud) {
    var de = deltaEasting(ot, ad, lr);
    var dn = deltaNorthing(ot, ad, lr);

    var startGrid = pos.mgrs;
    de = Math.round(de); dn = Math.round(dn);
    var startElev = pos.elev;
    var endEasting = parseInt(startGrid.easting, 10) + de;
    var endNorthing = parseInt(startGrid.northing, 10) + dn;
    endEasting = Position.toFiveDigit(endEasting + '', true);
    endNorthing = Position.toFiveDigit(endNorthing + '', true);
    var endGrid = endEasting + '' + endNorthing;
    var endElev = parseInt(pos.elev) + parseInt(ud);
    return Position.generate(endGrid, endElev);
}

/*======================================General======================================*/
//here be all the math type shit used, don't touch unless broken

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

function getGridDiff(start, end) {
    var deltaX = getDiff(start.easting, end.easting);
    var deltaY = getDiff(start.northing, end.northing);
    return {'dx' : deltaX, 'dy' : deltaY};
}

function getDiff(i, j) {
    return Math.abs(i - j);
}

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

function isInRange(target, positions, distance) {
    dangerCloseHide();
    var keys = Object.keys(positions);
    noDanger = true;
    for (var i = keys.length - 1; i >= 0; i--) {
        point = positions[keys[i]];
        if(point.friendly == "true") {
            console.log('checking', dist, target, point);
            var dist = calcDistance(target.mgrs, point.position.mgrs);
            console.log(dist);
            if(dist < distance) {
                dangerClose(keys[i]);
                noDanger = false;
            }
        }
    }
}

function pad(base, length, before) {
    base = base + '';
    if (base.length < length) {
        for (var i = base.length; i < length; i++) {
            if (before)
                base = '0' + base;
            else
                base = base + '0';
        }
    }
    return base;
}