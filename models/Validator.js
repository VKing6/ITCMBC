Validator = {
    new: function(rulesClosure) {
        return {
            init: function() {
            this.errors = '';
            this.valid = true;
            },
            validate: function(object) {
                this.init();
                this.rules(object);
                return this.finish(object);
            },
            handleErrorBool(bool, error) {
                if(bool) this.handleError(error);
            },
            checkNaN: function(field, name) {
                if(isNaN(field)) {
                    this.handleError(name + ' is not a number');
                }
            },
            rules: rulesClosure,
            handleError: function(error) {
                this.errors = this.errors + error + ' ';
                this.valid = false;
            },
            finish: function(object) {
                if(debug) {
                    console.log(object, this.errors);
                }
                return this.valid;
            },
            valid: true,
            errors: ""
        }
    }
}