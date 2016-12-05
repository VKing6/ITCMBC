Firemission = {
    new: function() {
        name = this.getNextNumber();
        return {
            name: name,
            id: name,
            type: "ffe", //ADJ, FFE, SUPPRESS, FPF,
            state: "setup",
            target: {
                methodObject: null,
                processMethod: function(object) {
                    this.methodObject = object;
                    this.position = this.methodObject.getPosition();
                    return this.position;
                },
                adjust: function(adjustment) {
                    this.position = adjustGridToGrid(this.position, adjustment.ot, adjustment.ad, adjustment.lr, adjustment.ud);
                },
                position: null
            },
            engagement: {
                moc: "amc",
                mof: "ffe",
                charge: "Auto",
                sheaf: Sheaf.new(),
                area: null //sweeps/zones will go here if relevant
            },
            adjust: {
                guns: "All",
                shell: "HE",
                fuze: "Quick",
                current: null,
                shellsFired: 0,
            },
            ffe: {
                guns: "All",
                rounds: 1,
                shell: "HE",
                fuze: "Quick",
                shellsFired: 0,
            },
            adjust_history: [],
            solutions: {},
            timers: {},
            shotstate: ''
        }
    },
    validator: Validator.new(function(object) {
        this.handleErrorBool((object.name == ""), " Name is empty");
        this.handleErrorBool(!Position.validator.validate(object.target.position), ' Position: ' + Position.validator.errors);
    }),
    getNextNumber: function() {
        keys = Object.keys(BCS.firemissions);
        highest = parseInt(BCS.options.firemissionStart) - 1;
        code = BCS.options.firemissionCode;
        for (var i = keys.length - 1; i >= 0; i--) {
            key = keys[i];
            console.log(key);
            if(key.includes(code)) {
                key = key.replace(code, "");
                num = parseInt(key);
                if(num > highest) highest = num;
            }else{
                continue;
            }
        }
        return code + pad(highest + 1, 4, true);
    }
}