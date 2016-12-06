function InterpolateSlices(sliceLow, sliceHigh, factor) {
    var ret = [];
    for (i = 0; i < sliceLow.length; i++) {
        var x1 = sliceLow[i];
        var x2 = sliceHigh[i];
        ret.push(x1 + (x2 - x1) * factor);
    }
    return ret;
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
function SolutionFromATAB(ballistics, distance, hightDelta, elevRowLow, elevRowHigh) {
    var table = ballistics[0];
    var rangeMin = ballistics[1];
    var rangeMax = ballistics[2];
    var heightMin = ballistics[3];
    var heightMax = ballistics[4];
    var heightStep = ballistics[5];

    var solution = []

    // Check if height difference is within table extremes
    if (hightDelta < heightMin || hightDelta > heightMax) {
        return [];
    }

    // Find the over/under solution columns
    var heightIndexLower = Math.floor((hightDelta - heighMin) / heightStep);
    var heightIndexHigher = Math.ceil((hightDelta - heightMin) / heightStep)

    // If the solution is on a column boundry
    if (heightIndexHigher == heightIndexLower) {
        heightIndexHigher += 1;
    }

    // Interpolation factor
    var heightFactor = ((hightDelta - heightMin) - heightIndexLower * heightStep) /
                       (heightIndexHigher * heightStep - heightIndexLower * heightStep);

    var distanceNearest = 99999999;
    var elevNearestRow = -1;
    var elevNextNearestRow = -1;
    var sliceNextNearest = [];

    // Find closest elevation solution in the table
    for (var i = elevRowLow; i <= elevRowHigh; i++) {
        var prevSliceCount = (table[i-1][2]).length;
        var slices = table[i][2];
        var nextSliceCount = (table[i+1][2]).length;

        if (slices.length > heightIndexHigher && prevSliceCount > heightIndexHigher && nextSliceCount > heightIndexHigher) {
            var sliceLow = slices[heightIndexLower];
            var sliceHigh = slices[heightIndexHigher];
            var testSlice = InterpolateSlices(sliceLow, sliceHigh, heightFactor);
            var testDist = testSlice[0];

            if (Math.abs(testDist - distance) < distanceNearest) {
                distanceNearest = Math.abs(testDist - distance);
                elevNearestRow = i;
            }
        }
    }

    // Find the nearest neighboring solutions
    var sliceNearestLowerBase = table[elevNearestRow-1][2];
    var sliceNearestLower = InterpolateSlices(sliceNearestLowerBase[heightIndexLower], sliceNearestLowerBase[heightIndexHigher], heightFactor);
    var sliceNearestHigherBase = table[elevNearestRow+1][2];
    var sliceNearestHigher = InterpolateSlices(sliceNearestHigherBase[heightIndexLower], sliceNearestHigherBase[heightIndexHigher], heightFactor);

    var distanceNearestLower = sliceNearestLower[0];
    var distanceNearestHigher = sliceNearestHigher[0];
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

    var sliceNearestBase = table[elevNearestRow][2];
    var sliceNearest = InterpolateSlices(sliceNearestBase[heightIndexLower], sliceNearestBase[heightIndexHigher], heightFactor);

    var distanceFactor = (distance - sliceNearest[0]) / (sliceNextNearest[0] - sliceNearest[0]);

    // Find the actual elevations
    var elevNearest = table[elevNearestRow][0];
    var elevNextNearest = table[elevNextNearestRow][0];


    if (table[0].length >= 7) {
        // Ignore rocket stuff
        return [];
    } else {
        // Interpolate solution
        solution = InterpolateSlices(
            [elevNearest, sliceNearest[0], sliceNearest[2], sliceNearest[1], sliceNearest[3], sliceNearest[4]
            ],
            [elevNextNearest, sliceNextNearest[0], sliceNextNearest[2], sliceNextNearest[1], sliceNextNearest[3], sliceNextNearest[4]
            ],
            distanceFactor
        );
    }
    return solution;

}
