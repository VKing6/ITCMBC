Controller.Firemission = {
    new: {
        get: function() {
            firemission = window.Firemission.new();
            window.BCS.firemissions[firemission.id] = firemission;
            Controller.Firemission.current = firemission.id;
            $('.targetMethods .variable').not('.mgrs').val('0');
            $('.targetMethods .variable.mgrs').val('');
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
            firemission = $.extend(true, firemission, object);
            if(Firemission.validator.validate(firemission)) {
            //    try {
                    window.BCS.firemissions[firemission.id] = firemission;
                    Controller.Firemission.solutions.get(firemission.id);
                    firemission.state = "solutions";
            //    } catch(err) {
            //        View.flash(err);
            //    }
            }else{
                View.flash(Firemission.validator.errors);
            }
        }
    },
    datalink: {
        post: function() {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];

            $.post("/api/itcmbc", {'ref':window.BCS.battery.callsign, 'data':JSON.stringify(firemission)}, function(data) {
                console.log(data);
            });
        },
        get: function() {

        }
    },
    solutions: {
        get: function(id) {
            Controller.Firemission.current = id;
            firemission = window.BCS.firemissions[id];
            firemission = window.calculate(firemission);
            guns = window.BCS.battery.guns;
            this.printSolution(firemission.solutions.bty.firstCharge);

            firemission.state = 'solutions';
            View.open('firemission_solution', firemission);
        },
        printSolution: function(num) {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            firemission.solutions.bty.curCharge = num;
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
                    '<td>' + solution.quadrants[num].displayCharge + '</td>' +
                    '<td>' + solution.az + '</td>' +
                    '<td>' + solution.quadrants[num].qd + '</td>' +
                    '<td>' + solution.quadrants[num].tof + '</td>' +
                '</tr>');
            }
            $('#firemission_solution .maxOrd').html(firemission.solutions.bty.quadrants[num].maxOrd);
            $('#firemission_solution .impAngle').html(firemission.solutions.bty.quadrants[num].impAngle);
        },
        post: function() {

        },
        prev: {
            get: function() {
                id = Controller.Firemission.current;
                firemission = window.BCS.firemissions[id];
                num = firemission.solutions.bty.curCharge;
                if(firemission.solutions.bty.quadrants[num - 1] != null)
                {
                    Controller.Firemission.solutions.printSolution(num - 1);
                }
            }
        },
        next: {
            get: function() {
                id = Controller.Firemission.current;
                firemission = window.BCS.firemissions[id];
                num = firemission.solutions.bty.curCharge;
                if(firemission.solutions.bty.quadrants[num + 1] != null)
                {
                    Controller.Firemission.solutions.printSolution(num + 1);
                }
            }
        }
    },
    adjust: {
        get: function() {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            firemission.state = 'adjust';
            $('.adjustvars .variable').not('input[key="ot"]').val('0');
            View.open('firemission_adjust', firemission);
        },
        post: function(object) {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            firemission.target.adjust(object);
            console.log(object);
            firemission.engagement.mof = object.mof;
            firemission.state = 'solutions';
            firemission.shotState = '';
            Controller.Firemission.solutions.get(id);
        }
    },
    eom: {
        get: function() {
            id = Controller.Firemission.current;
            firemission.state = 'eom';
            View.open('firemission_eom', firemission);
        },
        post: function(object, source) {
            id = Controller.Firemission.current;
            firemission = window.BCS.firemissions[id];
            if(object.action == "record") {
                window.BCS.knownPoints[firemission.name] = StoredPoint.generate(firemission.name, firemission.target.position, false);
            }
            firemission.state = "finished";
            Controller.Firemission.current = null;
            Controller.BCS.ammo.process(object);
            Get('BCS.ammo');
        }
    },
    sidebar: {
        get: function() {
            console.log('UPDATING SIDEBAR');
            sidebar = $('.firemission_sidebar');
            sidebar.empty();
            keys = Object.keys(window.BCS.firemissions);
            for (var i = 0; i < keys.length; i++) {
                mission = window.BCS.firemissions[keys[i]];
                status = "";
                missionEntry = $('<li></li>');
                missionEntry.removeClass('shot'); missionEntry.removeClass('splash');
                if(mission.state != "finished")
                {
                    if(mission.state == 'solutions') {
                        if(mission.shotState == '' || mission.shotState == null) {
                            status = mission.engagement.mof.toUpperCase() + ' '  + mission.engagement.moc.toUpperCase();
                        } else {
                            status = mission.engagement.mof.toUpperCase() + ' '  + mission.shotState;
                            missionEntry.addClass(mission.shotState);
                        }
                    }
                    sidebar.append(missionEntry.append('<span onClick="Get(\'Firemission.open\', \'' + mission.name + '\') ">' + mission.name + ' ' + status + '</a>'));
                }
            }
        }
    },
    back: {
        get: function(id) {
            states = ['setup','engagement','solutions','eom', 'adjust'];
            firemission = window.BCS.firemissions[Controller.Firemission.current];
            console.log(firemission);
            for (var i = 1; i < states.length; i++) {
                state = states[i];
                if(state == firemission.state) {
                    firemission.state = (firemission.state == 'adjust' || firemission.state == 'eom') ? 'solutions' : states[i - 1];
                    console.log('setting state of', firemission.id ,' to', firemission.state);
                    Get('Firemission.' + firemission.state, firemission.id);
                    break;
                }
            }
        }
    },
    open: {
        get: function(id) {
            Controller.Firemission.current = id;
            //alert(id);
            firemission = window.BCS.firemissions[id];
            //Controller.Firemission[firemission.state].get(id);
            Get('Firemission.' + firemission.state, id);
        }
    },
    tabs: {
        get: function(state) {
            firemission = window.BCS.firemissions[Controller.Firemission.current];
            Get('Firemission.' + state, firemission.id);
        },
        enable: function() {

        }
    },
    roundsComplete: {
        get: function() {
            Controller.Firemission.shot.timer('rc', firemission);
        }
    },
    shot: {
        get: function() {
            firemission = window.BCS.firemissions[Controller.Firemission.current];
            type = firemission.engagement.mof;
            gunsCount = window.BCS.battery.guns.length;
            console.log(gunsCount);
            if(type == "ffe") {
                modifier = (firemission.ffe.guns == "All") ? gunsCount : 1;
                firemission.ffe.shellsFired = firemission.ffe.shellsFired + (parseInt(firemission.ffe.rounds) * modifier);
            } else if(type == "adj") {
                modifier = (firemission.adjust.guns == "All") ? gunsCount : 1;
                console.log(firemission.adjust.shellsFired + (1 * modifier));
                console.log(firemission.adjust.shellsFired);
                firemission.adjust.shellsFired = firemission.adjust.shellsFired + (1 * modifier);
            }
            this.timer('shot', firemission);
        },
        timer: function(ref, firemission) {
            if(firemission.timers[ref] != null) {
                clearInterval(firemission.timers[ref].counter);
            }
            id = $('#firemission_solution').find('input[key="id"]').val();
            timer = {
                id: firemission.id,
                isOpen: function() {return ($('#firemission_solution').find('input[key="id"]').val() == this.id); }
            }
            timer.parent = $('#firemission_solution').find('.' + ref + '-timer');
            timer.clock = $('#firemission_solution').find('.' + ref + '-clock');
            timer.splash = $('#firemission_solution').find('.' + ref + '-splash');
            timer.tmin = $('#firemission_solution').find('.' + ref + '-t');
            timer.splash.hide();
            if(ref == 'shot') firemission.shotState = 'SHOT';
            Get('Firemission.sidebar');
            console.log(parseInt(BCS.options.alertToSplash));
            tof = BCS.firemissions[Controller.Firemission.current].solutions['bty'].tof;
            var count=tof * 100;
            var messaged = false;
            var counter = setInterval(
                function(firemission, ref) {
                    count--;
                    if(count <= 0)
                    {
                        if($('#firemission_solution').find('input[key="id"]').val() == timer.id) firemission.timers[ref].tmin.hide();
                        clearInterval(firemission.timers[ref].counter);
                        //firemission.shotState = '';
                        Get('Firemission.sidebar');
                        return;
                    }else if(count <= parseInt(BCS.options.alertToSplash) * 100 && !messaged) {
                        if(ref == 'shot') firemission.shotState = 'SPLASH';
                        Get('Firemission.sidebar');
                        if($('#firemission_solution').find('input[key="id"]').val() == timer.id)
                        {
                            firemission.timers[ref].tmin.html('T-' + Math.round(count / 100))
                            firemission.timers[ref].splash.show();
                        }
                        messaged = true;
                    }
                    if($('#firemission_solution').find('input[key="id"]').val() == firemission.timers[ref].id)
                    {
                        firemission.timers[ref].clock.html(count / 100);
                    }
                    console.log($('#firemission_solution').find('input[key="id"]').val(), firemission.shotState, timer.id, count, ref);
                }
            , 10, firemission, ref);
            timer.counter = counter;
            firemission.timers[ref] = timer;
        }
    },
    current: null
}