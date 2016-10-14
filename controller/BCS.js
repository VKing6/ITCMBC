Controller.BCS = {
    options: {
        get: function() {
            View.open('bcs_options', window.BCS.options);
        },
        post: function(object) {
            window.BCS.options = object;
        }
    },
    battery: {
        get: function() {
            View.open('bty_setup', window.BCS.battery);
            $('#bty_setup').find('.object.object-nested.gun').not('#gun_template').each(function(){$(this).remove();});
            for (var i = 0; i < window.BCS.battery.guns.length; i++) {
                gun = window.BCS.battery.guns[i];
                this.printGun(gun);
            }
        },
        post: function(object, source) {
            parent = $(source).parents('.object').not('.object-nested');
            guns = [];
            parent.find('.object-nested.gun').not('#gun_template').each(function() {
                gun = Gun.new();
                gunForm = View.helpers.formToModel(this, true, true);
                gun.name = gunForm.name;
                gun.type = gunForm.type;
                console.log(gunForm);
                gun.position = Position.generate(gunForm.position.mgrs_string, gunForm.position.elev);
                if(Gun.validator.validate(gun)) {
                    guns.push(gun);
                }else{
                    View.flash(Gun.validator.errors);
                    return;
                }
            });
            object.guns = guns;
            window.BCS.battery = object;
            $('select.gun-select').each(function(){
                $(this).empty();
                $(this).append('<option value="All">Battery</option>');
                for (var i = 0; i < guns.length; i++) {
                    $(this).append('<option value="'+guns[i].name+'">Piece ' + guns[i].name + '</option>');
                }
            });
        },
        printGun: function(sourceGun) {
            console.log('printing');
            gun = $('#gun_template').clone();
            gun.attr('id','');
                console.log('populate with', sourceGun);
            if(sourceGun != null)
            {
                View.populate(gun, sourceGun);
            }
            $('#gun_list').append(gun);
            gun.show();
        },
        deleteGun: function(gun) {
            parent = $(gun).parents('.object.object-nested.gun');
            console.log(gun, parent);
            parent.remove();
        }
    }
}

BCS = {
    options: {
        alertToSplash: 10,
        windResistance: "",
        firemissionCode: "FM",
        firemissionStart: "0001"
    },
    battery: {
        callsign: "",
        guns: []
    },
    locations: {

    },
    firemissions: {
    },
    currentMission: null,
    knownPoints: {
        "FO 12" : Position.new()
    }
}