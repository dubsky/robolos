
Template.variables.helpers({
    variables: function () {
        return Collections.Variables.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            { key: 'title', label:'Name', tmpl: Template.variableLink,sortOrder: 0, sortDirection: 'ascending' },
            { key: 'description', label:'Description' },
            { key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
            { key: 'type', label:'Type' },
            { key: 'value', label:'Value', tmpl: Template.variableValue }
        ],
        filters: ['table-text-search']
    },

    emptySelection : function() {
        var selection=Session.get('selectedVariables');
        return (typeof selection==='undefined') || selection.length===0;
    }
});

Template.variables.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedVariables',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedVariables');
        if((typeof selection)!=='undefined') {
            for(var i=0;i<selection.length;i++) {
                ConnectionManager.call('deleteVariable',selection[i]);
                //Collections.Variables.remove(selection[i]);
            }
            Session.set('selectedVariables',[]);
        }
    }
});


Template.variables.onRendered(function() {
    Session.set('selectedVariables',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.variables.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Routing.routeCollection('variables');


