Controller.Firemission = {
    new: {
        get: function() {
            firemission = window.Firemission.new();
            window.BCS.firemissions[firemission.id] = firemission;
            View.open('firemission_new', firemission);
        }
    },
    setup: {
        get: function(id) {
            firemission = window.BCS.firemissions[id];
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
                firemission.state = "engagement";
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
        post: function(object, source) {
            console.log(object);
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
    },
    sidebar: {
        get: function() {
            sidebar = $('.firemission_sidebar');
            sidebar.empty();
            keys = Object.keys(window.BCS.firemissions);
            for (var i = 0; i < keys.length; i++) {
                mission = window.BCS.firemissions[keys[i]];
                console.log(mission);
                sidebar.append('<li><a onClick="Get(\'Firemission.' + mission.state + '\', \'' + mission.id + '\') ">' + mission.name + '</a></li>');
            }
        }
    },
    open: {
        get: function(id) {
            firemission = window.BCS.firemissions[id];
            Controller.Firemission[firemission.state].get(id);
        }
    }
}