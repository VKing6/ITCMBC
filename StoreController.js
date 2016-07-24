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
    			return storeController.getRow(n);
    		}
    	}
	},
	getRow: function(n) {
		return{
			getReference: function() {return storeController.getCellValue(n, 1)},
			setReference: function(ref) {storeController.setCellValue(n, 1, ref)},
			getPosition: function() {return toPos(storeController.getCellValue(n, 2), storeController.getCellValue(n, 3))},
			setPosition: function(pos) {storeController.setCellValue(n, 2, pos.mgrs_string); storeController.setCellValue(n, 3, pos.elev)},

			setSheafJSON: function(sheaf) { this.setSheafType(sheaf.type); this.setSheafDir(sheaf.dir); this.setSheafLength(sheaf.length); this.setSheafQuick(sheaf.quick);},
			getSheafType: function() {return storeController.getCellValue(n, 5)},
			setSheafType: function(type) {return storeController.setCellValue(n, 5, type)},
			getSheafDir: function() {return storeController.getCellValue(n, 6)},
			setSheafDir: function(dir) {return storeController.setCellValue(n, 6, dir)},
			getSheafLength: function() {return storeController.getCellValue(n, 7)},
			setSheafLength: function(length) {return storeController.setCellValue(n, 7, length)},
			getSheafQuick: function() {return storeController.getCellValue(n, 8)},
			setSheafQuick: function(quick) {return storeController.setCellValue(n, 8, quick)},

			setShiftJSON: function(shift) {this.setShiftPos(shift.target); this.setShiftCharge(shift.charge); this.setShiftNum(shift.shifts);},		
			getShiftPos: function() {return toPos(storeController.getCellValue(n, 10), storeController.getCellValue(n, 11))},
			setShiftPos: function(pos) {storeController.setCellValue(n, 10, pos.mgrs_string); storeController.setCellValue(n, 11, pos.elev)},
			getShiftCharge: function() {return storeController.getCellValue(n, 12)},
			setShiftCharge: function(charge) {return storeController.setCellValue(n, 12, charge)},
			getShiftNum: function() {return storeController.getCellValue(n, 13)},
			setShiftNum: function(num) {return storeController.setCellValue(n, 13, num)}
		}
	},
	getCellValue: function() {
		return targetSheet.getRange(row, column).getValue() + '';
	},
	setCellValue: function(row, column, value) {
		targetSheet.getRange(row, column).setValue(value);
	}
};