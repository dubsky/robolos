let prepareInitialType=function(context) {
    let c=Collections.Variables.Types[0].value;
    if(context!==undefined && context.variable!==undefined && context.variable.type!==undefined) c=context.variable.type;
    return c;
}

Template.addVariable.helpers({

    collection: function() {
        return Collections.Variables
    },

    schema: Schemas.Variable,

    typeOptions: function () {
        return Collections.Variables.Types;
    },

    modificationOptions: function () {
        return Collections.Variables.ModifiedBy;
    },

    selectedType:function(type) {
        return type===Session.get("selectedType");
    },

    variable() {
        return (this.variable===undefined || this.variable.type===undefined) ? { type: prepareInitialType(this) } : this.variable;
    }
});

Template.addVariable.events({

    'change .typeSelector' : function(e) {
        Session.set("selectedType", e.target.value);
    },

    'click .cancel' :function(event) {
        EditContext.setContext(undefined);
        Router.go('variables');
        return false;
    }

});


Template.addVariable.onCreated(function() {
    Session.set("selectedType", prepareInitialType(this.data));
});

Router.route('variable-create', function () {
        var item;
        if(EditContext.getContext()===undefined) {
            item={};
            EditContext.setContext(new EditContext('Create Variable',{routeName: 'addVariable' },item));
        }
        else {
            item=EditContext.getContext().getDocument();
            AutoForm.resetForm('viewScheduleForm');
        }
        this.render('addVariable',{data: { variable: item }});
    },
    {
        name: 'addVariable',
        waitOn: function() {
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe('actions')];
            });
        }
    }
);


AutoForm.hooks({
    addVariableForm: {
        after: {
            'method-update': function() {
                Router.go('variables');
            }
        },
        formToModifier: function(modifier) {
            EditContext.getContext().modifier=modifier;
            return modifier;
        }
    }
});