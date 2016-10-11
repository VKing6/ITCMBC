StoredPoint = {
    new: function() {
        return {
            name: "new_point",
            position: Position.new(),
            friendly: false,
        }
    },
    validator: Validator.new(function(object) {
        this.handleErrorBool(!Position.validator.validate(object.position), 'Position: ' + Position.validator.errors);
    })
}