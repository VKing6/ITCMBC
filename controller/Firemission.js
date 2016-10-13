Controller.Firemission = {
    new: {
        get: function() {
            firemission = window.Firemission.new();
            window.BCS.firemissions[firemission.id] = firemission;
            View.open('firemission_new', firemission);
        },
        post: function(object, source) {
            firemission = window.BCS.firemissions[object.id];
            firemission.name = object.name;
            firemission.type = object.type;

            methodFields = $(source).parents('.' + object.targetMethod);
            method = View.helpers.formToModel(methodFields, true, true);
            firemission.target.processMethod(method);
            name = object.name;

            if(Firemission.validator.validate(firemission)) {
                delete window.BCS.firemissions[firemission.id];
                firemission.id = object.name;
                window.BCS.firemissions[firemission.id] = firemission;
                Controller.Firemission.engagement.get(firemission.id);
            }else{
                View.flash(Firemission.validator.errors);
            }
        }
    },
    engagement: {
        get: function(id) {
            firemission = window.BCS.firemissions[id];
            View.open('firemission_engagement', firemission);
        },
        post: function() {

        }
    },
    solutions: {
        get: function() {

        },
        post: function() {

        }
    },
    adjust: {
        get: function() {

        },
        post: function() {

        }
    },
    eom: {
        get: function() {

        },
        post: function() {

        }
    }
}