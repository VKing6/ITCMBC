View.bcs_options = {
    getModel: function(){ return BCS.options},
    load: function() {
        element = $('#bcs_options');
        model = this.getModel();
        element.find('.variable').each(function() {
            key = $(this).attr('key');
            $(this).val(model[key]);
        });
    }
}