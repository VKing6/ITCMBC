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
    grid: function(grid, elevation) {
        return TargetMethods.generic({grid: grid, elevation: elevation}, function() {
            position = Position.generate(this.grid, this.elevation);
            return position;
        });
    },
    polar: function(position, direction, distance, vi) {
        return TargetMethods.generic({position: position, direction:direction, distance: distance, vi:vi}, function() {
            return adjustGridToGrid(position, direction, distance, 0, vi);
        });
    },
    shift: function(position, ot, ad, lr, ud) {
        return TargetMethods.generic({position: position, ot:ot, ad:ad, lr:lr, ud:ud}, function() {
            return adjustGridToGrid(position, ot, ad, lr, ud);
        });
    }
}