Adjust = {
    new: function() {
        return {
            ot: 0,
            ad: 0,
            lr: 0,
            ud: 0,
            mof: "adj"
        }
    },
    validator: Validator.new(function(object){
            this.checkNaN(object.ot, 'OT');
            this.checkNaN(object.ad, 'AD');
            this.checkNaN(object.lr, 'LR');
            this.checkNaN(object.ud, 'UD');
    })
}