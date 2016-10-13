Position = {
    new: function() {
        return {
            mgrs: {
                easting: "00000",
                northing: "00000"
            },
            mgrs_string: "0000000000",
            elev: "0000"
        }
    },
    generate: function(mgrs, elev) {
        return {
            mgrs: this.splitGrid(mgrs),
            elev: elev + '',
            mgrs_string: mgrs
        }
    },
    splitGrid: function(grid) {
        var res = {};
        var length = grid.length;
        var half = length / 2;
        res.easting = this.toFiveDigit(grid.substr(0, half), false, length / 2);
        res.northing = this.toFiveDigit(grid.substr(half, length - 1), false, length / 2);
        return res;
    },
    toFiveDigit: function(base, pre) {
        base = base + '';
        if (base.length < 5) {
            for (var i = base.length; i < 5; i++) {
                if (pre)
                    base = '0' + base;
                else
                    base = base + '0';
            }
        }
        return base;
    },
    validator: Validator.new(function(object){
        this.handleErrorBool((object.mgrs.easting == ""), " Easting is empty");
        this.handleErrorBool((object.mgrs.northing == ""), " Northing is empty");
        this.handleErrorBool((object.mgrs_string == ""), " Mgrs is empty");
        this.handleErrorBool((object.elev == ""), " Elevation is empty");
        this.checkNaN(object.mgrs.easting, 'easting');
        this.checkNaN(object.mgrs.northing, 'northing');
        this.checkNaN(object.mgrs_string, 'mgrs_string');
        this.checkNaN(object.elev, 'elevation');

        this.handleErrorBool(
            object.mgrs_string.length % 2 == 1 || 
            object.mgrs.easting.length != object.mgrs.northing.length ||
            object.mgrs.easting.length + object.mgrs.northing.length % 2 == 1
            ,'mgrs is not even digits');
    })
}