View.Firemission = {
    setMethod: function(element) {
        element = $(element).parents('.buttonTarget');
        object = View.helpers.formToModel(element);
        target = this.current.target.processMethod(object);
        if(this.current.target.position != null) {

        }
    },
    current: Firemission.new()
}