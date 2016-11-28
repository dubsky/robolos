
class VariablesUIClass {
    upsertVariable(id, variable) {
        let v=VariablesInstance.getVariable(id);
        if(v===undefined) {
            VariablesInstance.createVariable(variable,id);
        }
        else {
            VariablesInstance.updateVariable(variable,id);
        }
    }
}

VariablesUI=new VariablesUIClass();


Meteor.publish('variables', function(filter,reactive){
    Accounts.checkAdminAccess(this);
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
                console.log('sending value update');
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


function nonDashboardVariablesModification(variable) {

    function checkKeys(keys) {
        for(let key of keys) {
            if(!Collections.Variables.DashboardAccessibleFields[key]) return true;
        }
    }
    for(let key of Object.keys(variable)) {
        checkKeys(Object.keys(variable[key]));

    }
    return false;
}

Meteor.methods({
    createVariable: function(variable) {
        Accounts.checkAdminAccess(this);
        VariablesInstance.createVariable(variable);
    },

    deleteVariable: function(variableId) {
        Accounts.checkAdminAccess(this);
        VariablesInstance.removeVariable(variableId);
    },

    updateVariable: function(variable,variableId) {
        if(nonDashboardVariablesModification(variable)) Accounts.checkAdminAccess(this); else Accounts.checkDashboardAccess(this);
        VariablesInstance.updateVariable(variable,variableId);
    },

    setBooleanVariable: function(variableId,value) {
        Accounts.checkDashboardAccess(this);
        VariablesInstance.setValue(variableId,value);
    }
});