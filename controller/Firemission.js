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
            if(firemission.type == "adj") {
                firemission.engagement.mof = "adj";
            }
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
            firemission = window.BCS.firemissions[object.id];
            firemission = $.extend(firemission, object);
            if(Firemission.validator.validate(firemission)) {
                firemission.state = "solutions";
                window.BCS.firemissions[firemission.id] = firemission;
                Controller.Firemission.solutions.get(firemission.id);
            }else{
                View.flash(Firemission.validator.errors);
            }
        }
    },
    solutions: {
        get: function(id) {
            firemission = window.BCS.firemissions[id];
            firemission = window.calculate(firemission);
            guns = window.BCS.battery.guns;
            $('#firemission_solution .solutions').empty();
            for (var i = 0; i < guns.length; i++) {
                solution = firemission.solutions[guns[i].name];
                $('#firemission_solution .solutions').append('<tr>'+
                    '<td>' + guns[i].name + '</td>' +
                    '<td>' + solution.mof + '</td>' +
                    '<td>' + solution.moc + '</td>' +
                    '<td>' + solution.rounds + '</td>' +
                    '<td>' + solution.shell + '</td>' +
                    '<td>' + solution.fuze + '</td>' +
                    '<td>' + solution.charge + '</td>' +
                    '<td>' + solution.qd + '</td>' +
                    '<td>' + solution.az + '</td>' +
                    '<td>' + solution.tof + '</td>' +
                '</tr>');
            }
            View.open('firemission_solution', firemission)
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