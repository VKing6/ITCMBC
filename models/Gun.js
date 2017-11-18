Gun = {
    new: function() {
        return {
            name: "new_gun",
            position: Position.new(),
            type: "mortar_82",
            direction: null
        }
    },
    validator: Validator.new(function(object) {
        this.handleErrorBool(!Position.validator.validate(object.position), 'Position: ' + Position.validator.errors);
        //this.handleErrorBool(!Gun.types.includes(object.type), 'Gun type is not valid');
    }),
    //types: "mortar_82"
}