/*=========================================BTY========================================*/

function calculate(firemission) {
    bty = window.BCS.battery;
    for (var i = bty.guns.length - 1; i >= 0; i--) {
        gun = bty.guns[i];
        solution = {
            piece: gun.name,
            targetPos:null,
            type: bty.type,
            mof: firemission.engagement.mof,
            moc: firemission.engagement.moc,
            rounds: firemission.ffe.rounds,
            shell: firemission.ffe.shell,
            fuze: firemission.ffe.fuze,
            charge: firemission.engagement.charge,
            az:null,
            qd:null,
            tof:null
        }
        if(firemission.engagement.mof == "adj") {
            if(firemission.adjust.guns == gun.name || firemission.adjust.guns == "All")
            {
                $.extend(solution, {
                    rounds: 1,
                    shell: firemission.adjust.shell,
                    fuze: firemission.adjust.fuze
                });
            } else {
                $.extend(solution, {
                    moc: "dnl"
                });
            }
        }
        if(solution.type == "mortar_82" || solution.type == "mortar_81") {
            solution.calcShell = "all";
        } else {
            solution.calcShell = solution.shell;
        }
        firemission.solutions[gun.name] = solution;
        if(i == 1 || bty.guns.length == 1) {
            firemission.solutions.bty = solution;
            firemission.solutions.bty.piece = "bty"
            firemission.solutions.bty.targetPos = firemission.target.position;
        }
    }

    calcBatteryPosition(firemission);
    setSheafTargets(firemission);
    fillSolutions(firemission);
    isDangerClose(firemission);
    //console.log(firemission);
    return firemission;
}


function calcBatteryPosition(firemission) {
    positions = [];
    bty = window.BCS.battery;
    for (var i = bty.guns.length - 1; i >= 0; i--) {
        gun = bty.guns[i];
        positions.push(gun.position);
    }
    pos = calcAverage(positions);
    firemission.solutions.bty.position = pos;
}

function setSheafTargets(firemission) {
    sheaf = firemission.engagement.sheaf;
    sheafWidthMod = sheaf.length / 2;
    sheafDir = sheaf.direction;
    batteryPos = firemission.solutions.bty.position;
    target = firemission.target.position;
    if (sheaf.quick == 'true') {
        sheafDir = calcDirection(batteryPos.mgrs, target.mgrs) / 360 * 6400;
        //console.log(sheafDir);
    }

    bty = window.BCS.battery;
    for (var i = bty.guns.length - 1; i >= 0; i--) {
        gun = bty.guns[i];
        var gunTarget = target;
        var sourcePosition = gun.position;
        switch(sheaf.type) {
            case "parallel":
                sourcePosition = batteryPos;
                break;
            case "special":
                {
                    var guns = bty.guns.length;
                    WidthPerGun = sheaf.length / guns;
                    var halfSheaf = sheaf.length / 2;
                    offset = (i+1) * WidthPerGun - (WidthPerGun / 2) - halfSheaf;
                    gunTarget = adjustGridToGrid(gunTarget, sheafDir, 0, offset, 0, 0);
                }
                break;
            case "linear":
                gunTarget = adjustGridToGrid(gunTarget, sheafDir, 0, 40 * (i-1), 0, 0);
                break;
            case "open":
                gunTarget = adjustGridToGrid(gunTarget, sheafDir, 0, 60 * (i-1), 0, 0);
                break;
        }
        firemission.solutions[gun.name].sourcePos = sourcePosition;
        firemission.solutions[gun.name].targetPos = gunTarget;
    }
}

function fillSolutions(firemission) {
    keys = Object.keys(firemission.solutions);
    for (var i = 0; i < keys.length; i++) {
        solution = firemission.solutions[keys[i]];
        results = getSolutions(solution);
        quads = null;
        if(solution.charge == "Auto") {
            for (var j = results.quadrants.length - 1; j >= 0; j--) {
                res = results.quadrants[j];
                if(res != null && res.qd != null)
                {
                    quads = res;
                    solution.displayCharge = j;
                }
            }
        } else {
            quads = results.quadrants[parseInt(solution.charge)];
            solution.displayCharge = solution.charge;
        }
        solution.az = Math.round(results.azimuth);
        solution.qd = Math.round(quads.qd);
        solution.tof = Math.round(quads.tof);
        solution.impAngle = Math.round(quads.impactAngle);
        solution.maxOrd = Math.round(quads.maxOrd);
        //console.log('PROCESSED', solution);
    }
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
function getSolutions(solutionBase) {
    //console.log(solutionBase);
    var distance = calcDistance(solutionBase.sourcePos.mgrs, solutionBase.targetPos.mgrs);
    var azimuth = calcDirection(solutionBase.sourcePos.mgrs, solutionBase.targetPos.mgrs);
    var solutions = CalcQuadrants(solutionBase.type, solutionBase.calcShell, distance, solutionBase.targetPos.elev - solutionBase.sourcePos.elev);
    return {'azimuth' : azimuth / 360 * 6400, 'distance' : distance, 'quadrants' : solutions};
}

/*======================================Quadrant======================================*/

/**
 * gun: which gun to take from the tables, example: mortar_82
 * round: which table to take from the gun: all or all_nwr for the mortar_82, this will later be used for different shell types with different tables
 * distance: distance in m
 * elevDiff: elev Difference in m
 */
function alcQuadrantsRTAB(gun, round, distance, elevDiff) {
    var charges = weapons[gun].roundTypes[round].charges;
    var res = [];
    for (var i = charges.length - 1; i >= 0; i--) {
        var charge = charges[i];
        qds = QuadrantFromRange(weapons[gun], round, distance, elevDiff);
        if(qds != null) res[i] = qds;
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
        //console.log('qd', elevDiff);
        return {'qd' : Math.round(qd), 'tof' : table[low].tof};
    }else{
        return null;
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
    return Position.generate(Position.toFiveDigit(totalEast, true) + '' + Position.toFiveDigit(totalNorth,true), Math.floor(totalElev / total));
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
            //console.log('checking', dist, target, point);
            var dist = calcDistance(target.mgrs, point.position.mgrs);
            //console.log(dist);
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


function isDangerClose(firemission) {
    $('.danger-close-units').html('');
    $('.danger-close').hide();
    //console.log("DC CHECK");
    target = firemission.target.position;
    pointStores = window.BCS.knownPoints;
    var keys = Object.keys(pointStores);
    noDanger = true;
    for (var i = keys.length - 1; i >= 0; i--) {
        ////console.log(i, point.friendly);
        point = pointStores[keys[i]];
        if(point.friendly == true || point.friendly == "true") {
            var dist = calcDistance(target.mgrs, point.position.mgrs);
            if(dist < 600) {
                $('.danger-close-units').html($('.danger-close-units').html() + ' ' + keys[i]);
                $('.danger-close').show();
                noDanger = false;
            }
        }
    }
}
