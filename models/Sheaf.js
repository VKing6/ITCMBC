Sheaf = {
    new: function() {
        return {
            type: "parallel",
            quick: true,
            direction: 0,
            length: 0
        }
    },
    validator: Validator.new(function(object){
        this.checkNaN(object.direction, 'Direction');
        this.checkNaN(object.length, 'Length');
    })
}