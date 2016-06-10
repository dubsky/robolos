var CURRENT_VARIABLE="CURRENT_VARIABLE";

Template.viewVariable.helpers({

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

    selectedType: function(type) {
      return this.type===type;
    }
});


Router.route('variables/:_id',
    function () {
        var self=this;
        var params = self.params;

        if(EditContext.getContext()===undefined) {
            item = Collections.Variables.findOne({_id: params._id });
            EditContext.setContext(new EditContext('Edit Variable',{routeName: 'render.variable', _id:params._id },item));
            Session.set(CURRENT_VARIABLE, item);
        }
        else {
            // returning back to edited document
            item=EditContext.getContext().getDocument();
            AutoForm.resetForm('viewScheduleForm');
        }
        self.render('viewVariable',{data: { variable: item }});

    },
    {
        name: 'render.variable',
        waitOn: function() {
            // subscribe to just the current one!!!!
            return Meteor.subscribe('variables');
        }
    }
);

Template.viewVariable.events({

    'click .cancel' :function(event) {
        EditContext.setContext(undefined);
        return false;
    }

});

AutoForm.hooks({
    viewVariableForm: {
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