View = {
    open:function(id) {
        window.location.hash = '#open=' + id; //THIS NEEDS TO BE CHANGED
        $('#content .page').hide();
        $('#content #' + id).show();
    },
    init: function() {
        var hash = window.location.hash;
        hash = hash.replace('#','');
        params = hash.split("&");
        for (var i = params.length - 1; i >= 0; i--) {
            param = params[i];
            kv = param.split('=');
            this[kv[0]](kv[1]);
        }
    },
    helpers: {
        viewChanger: function(element, target) {
            $(target + " .changer").hide();
            $(target + " ." + $(element).val()).show();
        },
        formToModel: function(element) {
            type = $(element).attr('object-class');
            var types = type.split('.');
            obj = window;
            for (var i = 0; i < types.length; i++) {
                obj = obj[types[i]];
            }
            obj = obj.new();
            element.find('.variable').each(function() {
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