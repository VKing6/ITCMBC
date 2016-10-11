Firemission = {
    new: function() {
        return {
            name: "XX0000",
            type: "ffe", //ADJ, FFE, SUPPRESS, FPF
            target: {
                methodObject: null,
                processMethod: function(object){
                    this.methodObject = object;
                    this.position = this.methodObject.getPosition();
                    return this.position;
                },
                position: Position.new(), //this will be updated with every adjust
            },
            engagement: {
                moc: "AMC",
                mof: "FFE",
                charge: "auto",
                sheaf: Sheaf.new(),
                area: null //sweeps/zones will go here if relevant
            },
            adjust: {
                gun: "All",
                shell: "HE",
                fuze: "Quick"
            },
            ffe: {
                guns: [],
                rounds: 1,
                shell: "HE",
                fuze: "Quick"
            },
            adjust_history: [],
            solutions: {}
        }
    },
    validator: Validator.new(function(object) {
    })
}