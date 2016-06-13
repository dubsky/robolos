
class VariablesUIClass {

}

VariablesUI=new VariablesUIClass();


Meteor.publish('variables', function(filter,reactive){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    var cursor;
    if(filter==undefined) {
        cursor=Collections.Variables.find();
    }
    else {
        cursor=Collections.Variables.find(filter);
    }

    cursor.forEach(
        function(variable) {
            self.added("variables", variable._id, variable);
        }
    );

    self.ready();

    if(reactive!==false) {
        var id=VariablesInstance.addEventListener({
            onRemove : function(variableId) {
                self.removed("variables",variableId);
            },

            onUpdate : function(variable) {
                self.changed("variables",variable._id, variable);
            },

            onCreate : function(variable) {
                self.added("variables",variable._id, variable);
            }
        });

        self.onStop(function(){
            VariablesInstance.removeEventListener(id);
        });
    }
});



Meteor.methods({
    createVariable: function(variable) {
        VariablesInstance.createVariable(variable);
    },

    deleteVariable: function(variableId) {
        VariablesInstance.removeVariable(variableId);
    },

    updateVariable: function(variable,variableId) {
        VariablesInstance.updateVariable(variable,variableId);
    },

    setBooleanVariable: function(variableId,value) {
        VariablesInstance.setValue(variableId,value);
    }
});