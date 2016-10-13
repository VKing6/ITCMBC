View = {
    open:function(id, object) {
        //window.location.hash = '#open=' + id; //THIS NEEDS TO BE CHANGED
        $('.flash').html('');
        console.log(id, object);
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
            obj[key] = val;
        });
    },
    populate: function(element, object) {
        element.find('.variable').not('.targetMethods.variable').each(function() {
            key = $(this).attr('key');
            val = window.objectFinder(object, key);
            if(val != null) {
                console.log(key, val);
                $(this).val(val);
                if($(this).is("span")) $(this).html(val);
            }
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
            selector = (nested) ? '' : '.object-nested .variable';
            element.find('.variable').not(selector).each(function() {
                key = $(this).attr('key');
                val = $(this).val();
                obj[key] = val;
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
        }
    }
}

function objectFinder(start, path) {
    var routes = path.split('.');
    obj = start;
    for (var i = 0; i < routes.length; i++) {
        obj = obj[routes[i]];
    }
    return obj;
}