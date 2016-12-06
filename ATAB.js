function InterpolateSlices(sliceLow, sliceHigh, factor) {
    var ret = [];
    for (i = 0; i < sliceLow.length; i++) {
        var x1 = sliceLow[i];
        var x2 = sliceHigh[i];
        ret.push(x1 + (x2 - x1) * factor);
    }
    return ret;
}


function CalcQuadrants(gun, round, distance, heightDelta) {
    var weapon = weapons[gun];
    if (weapon.tableType == "ATAB") {

        if (Object.keys(weapon.roundTypes).length == 1) {
            round = "all";
        }

        var tables = weapon.roundTypes[round].tables
        var charges = Object.keys(tables);
        var angles = weapon.angles;
        var solutions = [];
        // Assume only mortars. TODO: Add low angle support
        for (var i = charges.length - 1; i >= 0; i--) {
            var ballistics = tables[i];
            var solution = (SolutionFromATAB(ballistics, distance, heightDelta, angles["high"][0], angles["high"][1]));
            if (solution == []) {
                solutions.push(null);
            } else {
                solutions.push(solution);
            }
        }
        return solutions;
    } else if (weapon.tableType == "RTAB") {
        return CalcQuadrantsRTAB(gun, round, distance, heightDelta);
    } else {
        // Throw error: tableType Undefined
    }
}

/**
 * Find quadrant from ACE-style BTAB (ATAB) for a certain charge
 * (depending on which ballistics table is given)
 *
 * Parameters
 * 0: Ballistics table
 * 1: Target distance
 * 2: Target elevation difference
 * 3: Minimum gun elevation row (not sure why this is used instead of angle. ~4 degrees higher than gun angle)
 * 4: Maximum ditto
 *
 *
 * Returns: Array
 * 0:  Gun elevation (deg)
 * 1:  Distance
 * 2:  TOF
 * 3:  Elevation difference
 * 4:  Impact velocity
 * 5:  Impact angle
 *
 **/
function SolutionFromATAB(ballistics, distance, heightDelta, elevRowLow, elevRowHigh) {
    table = ballistics["btab"];
    rangeMin = ballistics["minRange"];
    rangeMax = ballistics["maxRange"];
    heightMin = ballistics["minHeight"];
    heightMax = ballistics["maxHeight"];
    heightStep = ballistics["hstep"];

    var solution = []

    // Check if height difference is within table extremes
    if (heightDelta < heightMin || heightDelta > heightMax) {
        return [];
    }

    // Find the over/under solution columns
    heightIndexLower = Math.floor((heightDelta - heightMin) / heightStep);
    heightIndexHigher = Math.ceil((heightDelta - heightMin) / heightStep)

    // If the solution is on a column boundry
    if (heightIndexHigher == heightIndexLower) {
        heightIndexHigher += 1;
    }

    // Interpolation factor
   heightFactor = ((heightDelta - heightMin) - heightIndexLower * heightStep) /
                  (heightIndexHigher * heightStep - heightIndexLower * heightStep);

   distanceNearest = 99999999;
   elevNearestRow = -1;
   elevNextNearestRow = -1;
   sliceNextNearest = [];

    // Find closest elevation solution in the table
    for (var i = elevRowLow + 1; i <= elevRowHigh - 1; i++) {
        prevSliceCount = (getSlice(table, i-1)[2]).length;
        slices = getSlice(table, i)[2];
        nextSliceCount = (getSlice(table, i+1)[2]).length;

        if (slices.length > heightIndexHigher && prevSliceCount > heightIndexHigher && nextSliceCount > heightIndexHigher) {
            sliceLow = slices[heightIndexLower];
            sliceHigh = slices[heightIndexHigher];
            testSlice = InterpolateSlices(sliceLow, sliceHigh, heightFactor);
            testDist = testSlice[0];

            if (Math.abs(testDist - distance) < distanceNearest) {
                distanceNearest = Math.abs(testDist - distance);
                elevNearestRow = i;
            }
        }
    }

    // Find the nearest neighboring solutions
    sliceNearestLowerBase = getSlice(table, elevNearestRow-1)[2];
    sliceNearestLower = InterpolateSlices(sliceNearestLowerBase[heightIndexLower], sliceNearestLowerBase[heightIndexHigher], heightFactor);
    sliceNearestHigherBase = getSlice(table, elevNearestRow+1)[2];
    sliceNearestHigher = InterpolateSlices(sliceNearestHigherBase[heightIndexLower], sliceNearestHigherBase[heightIndexHigher], heightFactor);

    distanceNearestLower = sliceNearestLower[0];
    distanceNearestHigher = sliceNearestHigher[0];
    if (Math.abs(distanceNearestLower - distance) < Math.abs(distanceNearestHigher - distance)) {
        elevNextNearestRow = elevNearestRow - 1;
        sliceNextNearest = sliceNearestLower;
    } else {
        elevNextNearestRow = elevNearestRow + 1;
        sliceNextNearest = sliceNearestHigher;
    }

    // Check that solution is within range
    if ((distance < distanceNearestLower && distance < distanceNearestHigher) ||
       (distance > distanceNearestLower && distance > distanceNearestHigher)) {
        return [];
    }

    sliceNearestBase = getSlice(table,elevNearestRow)[2];
    sliceNearest = InterpolateSlices(sliceNearestBase[heightIndexLower], sliceNearestBase[heightIndexHigher], heightFactor);

    distanceFactor = (distance - sliceNearest[0]) / (sliceNextNearest[0] - sliceNearest[0]);

    // Find the actual elevations
    elevNearest = getSlice(table,elevNearestRow)[0];
    elevNextNearest = getSlice(table,elevNextNearestRow)[0];

    // Find maximum ordnance
    maxOrdNearest = getSlice(table,elevNearestRow)[1];
    maxOrdNextNearest = getSlice(table,elevNextNearestRow)[1];


    if (table[0].length >= 7) {
        // Ignore rocket stuff
        return [];
    } else {
        // Interpolate solution
        solution = InterpolateSlices(
            [elevNearest, sliceNearest[0], sliceNearest[2], sliceNearest[1], sliceNearest[3], sliceNearest[4], maxOrdNearest
            ],
            [elevNextNearest, sliceNextNearest[0], sliceNextNearest[2], sliceNextNearest[1], sliceNextNearest[3], sliceNextNearest[4], maxOrdNextNearest
            ],
            distanceFactor
        );
    }
    return {"qd": Math.round(solution[0]*17.77777778), "tof": solution[2], "impactVel": solution[4], "impactAngle": solution[5], "maxOrd": solution[6]};

}

function getSlice(table, angle) {
    for (var i = table.length - 1; i >= 0; i--) {
        if(table[i][0] == angle) return table[i];
    }
}