Firemission = {
    new: function() {
        return {
            name: "XX0000",
            type: "", //ADJ, FFE, SUPPRESS, FPF
            target: {
                method: "grid",
                variables: {
                    //variables that decide the target position go here
                    //for example known point to shift from, and how to shift
                    //or even the initial target grid given by the FO
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