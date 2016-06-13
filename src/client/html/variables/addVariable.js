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
    }
});

Template.addVariable.events({

    'change .typeSelector' : function(e) {
        console.log(e.target.value);
        Session.set("selectedType", e.target.value);
    },

    'click .cancel' :function(event) {
        Router.go('variables');
        return false;
    }

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
            return [App.subscribe('actions')];
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