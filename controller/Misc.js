Controller.Misc = {
    directFire: {
        get: function() {
            View.open('directFire', []);
        },
        post: function(object) {
            quads = CalcQuadrants(object.gun, null, parseInt(object.distance), parseInt(object.vi));
                    $('#dirCharge').html('-');
                    $('#dirQuad').html('-');
            for (var i = quads.length - 1; i >= 0; i--) {
                if(quads[i] != null) {
                    $('#dirCharge').html(quads[i].ch);
                    $('#dirQuad').html(quads[i].qd);
                    break;
                }
            }
        },
        gun: function(object) {
            gunType = $(object).attr('gun-type');
            $('#gunHidden').val(gunType);
            $('.gunSelect button').removeClass('btn-primary');
            $('.gunSelect button').removeClass('btn-success');
            $(object).addClass('btn-success');
        }
    },
}