Template.variableValue.helpers({

    value: function() {
        var fix=function(v) { return ((typeof v)==='undefined') ? 'Undefined' : v};
        switch(this.type) {
            case 'date' : return fix(((typeof this.dateValue)==='undefined') ? undefined : this.dateValue.toLocaleDateString());
            case 'boolean' :
                if(this.booleanValue===undefined) return "Undefined";
                if(this.booleanValue) {
                    return this.trueValueLabel===undefined ? 'ON' : this.trueValueLabel;
                } else {
                    return this.falseValueLabel===undefined ? 'OFF' : this.falseValueLabel;
                }
            case 'number' :
                if (this.numberValue===undefined) return "Undefined";
                if(this.unit===undefined) return v;
                return this.numberValue+this.unit;
            case 'string' : return fix(this.stringValue);
        }
    }
});