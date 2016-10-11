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
        }
    }
}