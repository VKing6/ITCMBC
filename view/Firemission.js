View.Firemission = {
    setMethod: function(element) {
        element = $(element).parents('.buttonTarget');
        object = View.helpers.formToModel(element);
        console.log(object);
        this.getCurrent().target.processMethod(object);
        View.firemission_new.save();
        if(Firemission.validator.validate(this.getCurrent())) {
            BCS.firemissions[model.name] = model;
            View.open("firemission_engagement");
        }
    },
    new: function() {
        this.setCurrent(window.Firemission.new());
        View.open("firemission_new");
    },
    getCurrent: function() {
        return BCS.currentMission;
    },
    setCurrent: function(firemission) {
        BCS.currentMission = firemission;
    }
}

View.firemission_new = {
    getModel: function(){ return BCS.currentMission},
    getView: function() { return $('#firemission_new')},
    load: function(){
        element = this.getView();
        model = this.getModel();

        element.find('.variable').not('.targetMethods .variable').each(function() {
            key = $(this).attr('key');
            $(this).val(model[key]);
        });
    },
    save: function(){
        element = this.getView();
        model = this.getModel();
        element.find('.variable').not('.targetMethods .variable').each(function() {
            key = $(this).attr('key');
            val = $(this).val();
            obj[key] = val;
        });
    }
}

View.firemission_engagement = {
    getModel: function(){ return BCS.currentMission},
    getView: function() { return $('#firemission_engagement')},
    load: function(){
        element = this.getView();
        model = this.getModel();

        element.find('.variable').not('.targetMethods .variable').each(function() {
            key = $(this).attr('key');
            $(this).val(model[key]);
        });
    }
}