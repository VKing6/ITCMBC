Controller.BCS = {
    options: {
        get: function() {
            View.open('bcs_options', window.BCS.options);
        },
        post: function(object) {
            window.BCS.options = object;
        }
    },
    bty: {
        get: function() {
            View.open('bty_setup');
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