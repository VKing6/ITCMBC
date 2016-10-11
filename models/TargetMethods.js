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
        return object;
    },
    Grid: {
        new: function(variables) {
            return TargetMethods.generic(variables, function() {
                position = Position.generate(this.grid, this.elevation);
                return position;
            });
        }
    },
    Polar: {
        new: function(variables) {
            return TargetMethods.generic(variables, function() {
                return adjustGridToGrid(this.position, this.direction, this.distance, 0, this.vi);
            });
        }
    },
    Shift: {
        new: function(variables) {
            return TargetMethods.generic(variables, function() {
                return adjustGridToGrid(this.position, this.ot, this.ad, this.lr, this.ud);
            });
        }
    }
}