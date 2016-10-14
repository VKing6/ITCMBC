Controller.Firemission = {
    new: {
        get: function() {
            firemission = window.Firemission.new();
            window.BCS.firemissions[firemission.id] = firemission;
            Controller.Firemission.current = firemission.id;
            View.open('firemission_new', firemission);
        }
    },
    setup: {
        get: function(id) {
            Controller.Firemission.current = id;
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
        },
        delete: function(id) {
            delete window.BCS.firemissions[id];
            Controller.BCS.battery.get();
        }
    },
    engagement: {
        get: function(id) {
            Controller.Firemission.current = id;
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
            Controller.Firemission.current = id;
            firemission = window.BCS.firemissions[id];
            firemission = window.calculate(firemission);
            guns = window.BCS.battery.guns;
            $('#firemission_solution .solutions').empty();
            for (var i = 0; i < guns.length; i++) {
                solution = firemission.solutions[guns[i].name];
                $('#firemission_solution .solutions').append('<tr>'+
                    '<td>' + guns[i].name + '</td>' +
                    '<td>' + solution.mof.toUpperCase() + '</td>' +
                    '<td>' + solution.moc.toUpperCase() + '</td>' +
                    '<td>' + solution.rounds + '</td>' +
                    '<td>' + solution.shell + '</td>' +
                    '<td>' + solution.fuze + '</td>' +
                    '<td>' + solution.displayCharge + '</td>' +
                    '<td>' + solution.qd + '</td>' +
                    '<td>' + solution.az + '</td>' +
                    '<td>' + solution.tof + '</td>' +
                '</tr>');
            }
            View.open('firemission_solution', firemission);
        },
        post: function() {

        }
    },
    adjust: {
        get: function() {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            View.open('firemission_adjust', firemission);
        },
        post: function(object) {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            firemission.target.adjust(object);
            console.log(object);
            firemission.engagement.mof = object.mof;
            Controller.Firemission.solutions.get(id);
        }
    },
    eom: {
        get: function() {
            id = Controller.Firemission.current;

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
                sidebar.append(
                    '<li><span onClick="Get(\'Firemission.' + 
                    mission.state + '\', \'' + mission.id + '\') ">' + mission.name + '</a>' +
                    '<span class="btn btn-danger" onClick="Delete(\'Firemission.setup\', \''+mission.id+'\')"><i class="fa fa-minus"></i></span>' +
                    '</li>');
            }
        }
    },
    open: {
        get: function(id) {
            Controller.Firemission.current = id;
            firemission = window.BCS.firemissions[id];
            Controller.Firemission[firemission.state].get(id);
        }
    },
    current: null
}