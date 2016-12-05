View = {
    open:function(id, object) {
        //window.location.hash = '#open=' + id; //THIS NEEDS TO BE CHANGED
        $('.flash').html('');
        $('#content .page').hide();
        this.populate($('#'+id), object);
        $('#content #' + id).show();
    },
    flash: function(message) {
        $('.flash').html(message);
    },
    init: function() {
        var hash = window.location.hash;
        if(hash == "") return;
        hash = hash.replace('#','');
        params = hash.split("&");
        for (var i = params.length - 1; i >= 0; i--) {
            param = params[i];
            kv = param.split('=');
            this[kv[0]](kv[1]);
        }
    },
    save: function(element) {
        element = $(element).parents('.page');
        id = element.attr('id');
        obj = View[id].getModel();
        element.find('.variable').each(function() {
            key = $(this).attr('key');
            val = $(this).val();
            if($(this).attr('type') == "bool") {
                obj[key] = (val == "true");
            }else {
                obj[key] = val;
            }
        });
    },
    populate: function(element, object) {
        element.find('.variable').not('.targetMethods.variable').each(function() {
            key = $(this).attr('key');
            val = window.objectFinder(object, key);
            if(val != null) {
                if($(this).attr('type') == "bool") {
                    $(this).val(val.toString());
                }else {
                    $(this).val(val);
                }
                if($(this).is("span")) $(this).html(val);
            }
        });
        element.find('.variable').not('.targetMethods.variable').each(function() {

        });
        element.find('.loop').each(function() {
            baseElement = $(this);
            baseElement.find('.element').not('.template').remove();
            loopKey = $(this).attr('key');
            loopBase = objectFinder(object, loopKey);
            $.each(loopBase ,function(index, value) {
                console.log(index, value);
                row = baseElement.find('.template').clone();
                row.attr('class', row.attr('class').replace('template', ''));
                row.find('.variable').each(function(){
                    key = $(this).attr('key');
                    $(this).attr('key', loopKey + '.' + index + '.' + key);
                    $(this).val(value[key]);
                });
                baseElement.append(row);
                row.show();
            });
        });
        element.find('.knownpoint').each(function() {
            baseElement = $(this);
            baseElement.empty();
            $.each(window.BCS.knownPoints, function(){
                baseElement.append($('<option />').val(this.name).text(this.name));
            });
        });
    },
    helpers: {
        viewChanger: function(element, target) {
            $(target + " .changer").hide();
            $(target + " ." + $(element).val()).show();
        },
        formToModel: function(element, noParent, nested) {
            element = $(element);
            if(!noParent) {
                element = $(element).parents('.object');
            }
            type = element.attr('object-class');
            obj = {};
            if(type != "" && type != null) {
                var types = type.split('.');
                obj = window;
                for (var i = 0; i < types.length; i++) {
                    obj = obj[types[i]];
                }
                obj = obj.new();
            }
            selector = (nested) ? '.template .variable' : '.template .variable';
            element.find('.variable').not(selector).each(function() {
                key = $(this).attr('key');
                val = null;
                if($(this).attr('type') == "bool") {
                    val = ($(this).val() == "true");
                }else {
                    val = $(this).val();
                }
                nestedPut(obj, key, val);
                //obj[key] = val;
            });
            element.find('select.knownpoint').each(function() {
                kp = BCS.knownPoints[$(this).val()];
                key = $(this).attr('key');
                obj[key] = kp;
            });
            return obj;
        },
        updateVariable: function(target, element) {
            var types = target.split('.');
            obj = window;
            for (var i = 0; i < types.length - 1; i++) {
                obj = obj[types[i]];
            }
            obj[types[types.length - 1]] = $(element).val();
        },
        loadPos: function(element) {
            base = $(element);
            if(base.is('select')) {
                valfield = base;
            } else {
                valfield = base.siblings('.' + $(element).attr('target')).eq(0);
            }
            pointRef = valfield.val();
            point = BCS.knownPoints[pointRef];
            parent = $(element).parents('.object, .object-nested');
            console.log(point.position.mgrs_string);
            parent.find('.mgrs').eq(0).val(point.position.mgrs_string);
            parent.find('.elevation').eq(0).val(point.position.elev);
        }
    }
}

function objectFinder(start, path) {
    var routes = path.split('.');
    obj = start;
    for (var i = 0; i < routes.length; i++) {
        if(obj != null)
        {
            obj = obj[routes[i]];
        }else {
            return null;
        }
    }
    return obj;
}

function nestedPut(object, key, value) {
    if(!key.includes('.')) {
        object[key] = value;
        return;
    }
    var routes = key.split('.');
    current = object;
    subKey = null;
    for (var i = 0; i < routes.length; i++) {
        subKey = routes[i];
        if(i < routes.length - 1)
        {
            if(current[subKey] == null) {
                current[subKey] = {};
            }
            current = current[subKey];
        }else {
            current[subKey] = value;
        }
    }
}

timers = {};
function startTimer(ref, source) {
    console.log(source);
    if(timers[ref] != null) {
        clearInterval(timers[ref].counter);
    }
    timer = {
    }
    timer.parent = $(source).parent('.shot-timer');
    timer.clock = timer.parent.find('.shot-clock');
    timer.splash = timer.parent.find('.shot-splash');
    timer.tmin = timer.parent.find('.shot-t');
    timer.splash.hide();
    console.log(parseInt(BCS.options.alertToSplash));
    tof = BCS.firemissions[Controller.Firemission.current].solutions['bty'].tof;
    var count=tof * 100;
    var messaged = false;
    var counter = setInterval(
        function() {
            count--;
            if(count <= 0)
            {
                timers[ref].tmin.hide();
                clearInterval(timers[ref].counter);
                return;
            }else if(count <= parseInt(BCS.options.alertToSplash) * 100 && !messaged) {
                timers[ref].tmin.html('T-' + Math.round(count / 100))
                timers[ref].splash.show();
                messaged = true;
            }
            timers[ref].clock.html(count / 100);
        }
    , 10, ref);
    timer.counter = counter;
    timers[ref] = timer;
}