Firemission = {
    new: function() {
        return {
            name: "XX0000",
            type: "", //ADJ, FFE, SUPPRESS, FPF
            target: {
                method: "grid",
                methodObject: null,
                processMethod: function(){
                    factory = TargetMethods[this.method];
                    this.methodObject = factory.apply(this, arguments);
                    this.position = this.methodObject.getPosition();
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