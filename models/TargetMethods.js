TargetMethods = {
    generic: function(variables, calculation) {
        object = {
            calculate: calculation,
            getPosition: function() {
                position = this.calculate();
                return (Position.validator.validate(position)) ? position : null;
            }
        };
        $.extend(object, variables);
        console.log('object', object);
        return object;
    },
    Grid: {
        new: function(variables) {
            variables = {'class': 'Grid'};
            return TargetMethods.generic(variables, function() {
                position = Position.generate(this.grid, this.elevation);
                return position;
            });
        }
    },
    Polar: {
        new: function(variables) {
            variables = {'class': 'Polar'};
            return TargetMethods.generic(variables, function() {
                return adjustGridToGrid(this.point.position, this.direction, this.distance, 0, this.vi);
            });
        }
    },
    Shift: {
        new: function(variables) {
            variables = {'class': 'Shift'};
            return TargetMethods.generic(variables, function() {
                return adjustGridToGrid(this.point.position, this.ot, this.ad, this.lr, this.ud);
            });
        }
    },
    QuickLay: {
        new: function(variables) {
            variables = {'class': 'QuickLay'}
            return TargetMethods.generic(variables, function() {
                pos = calcBatteryPosition(null);
                return adjustGridToGrid(pos, this.direction, this.distance, 0, this.vi);
            });
        }
    }
}