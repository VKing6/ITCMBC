var storeController = {
    getSaveRow: function(reference) {
        var data = targetSheet.getDataRange().getValues();
        for(n=1;n<data.length;++n){
            if(data[n][0].toString() == "" || data[n][0].toString() == reference){
                return storeController.getRow(n + 1);
            }
        }
    },
    getLoadRow: function(reference) {
        var data = targetSheet.getDataRange().getValues();
        for(n=0;n<data.length;++n){
            if(data[n][0].toString() == reference){
                return storeController.getRow(n + 1);
            }
        }
    },
    getRow: function(n) {
        var row = {
            rowNum: n,
            getReference: function() {return storeController.getCellValue(n, 1)},
            setReference: function(ref) {storeController.setCellValue(n, 1, ref)},
            getPosition: function() {return toPos(storeController.getCellValue(n, 2), storeController.getCellValue(n, 3))},
            setPosition: function(pos) {storeController.setCellValue(n, 2, pos.mgrs_string); storeController.setCellValue(n, 3, pos.elev)},

            sheaf: {
                init: function() {
                    generateObject(storeController, this, [['Type', n, 5], ['Dir', n, 6], ['Length', n, 7], ['Quick', n, 8]]);
                },
                fromJSON: function(sheaf) {setSheafJSON(this, sheaf);},
                toJSON: function() {return getSheafJSON(this);}
            },

            sweepZone: {
                init: function() {
                    generateObject(storeController, this, [['Charge', n, 12], ['Num', n, 13]]);
                },
                fromJSON: function(sweepZone) {setSweepZoneJSON(this, sweepZone);},
                toJSON: function() {return getSweepZoneJSON(this);},
                getPos: function() {return toPos(storeController.getCellValue(n, 10), storeController.getCellValue(n, 11))},
                setPos: function(pos) {storeController.setCellValue(n, 10, pos.mgrs_string); storeController.setCellValue(n, 11, pos.elev)}
            }
        }
        row.sheaf.init();
        row.sweepZone.init();
        return row;
    },
    getCellValue: function(row, column) {
        return targetSheet.getRange(row, column).getValue() + '';
    },
    setCellValue: function(row, column, value) {
        targetSheet.getRange(row, column).setValue(value);
    }
};

function getSheafJSON(object) {
    return {
        type: object.getType(),
        dir: object.getDir(),
        length: object.getLength(),
        quick: object.getQuick()
    }
}

function setSheafJSON(object, sheaf) {
    object.setType(sheaf.type);
    object.setDir(sheaf.dir);
    object.setLength(sheaf.length);
    object.setQuick(sheaf.quick);
}

function getSweepZoneJSON(object) {
    return {
        target: object.getPos(),
        charge: object.getCharge(),
        shifts: object.getNum()
    }
}

function setSweepZoneJSON(object, sweepzone) {
    object.setPos(sweepzone.target);
    object.setCharge(sweepzone.charge);
    object.setNum(sweepzone.shifts);
}
