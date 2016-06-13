Template.actions.helpers({
    actions: function () {
        return Collections.Actions.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            { key: 'title', label:'Name',tmpl: Template.actionLink,sortOrder: 0, sortDirection: 'ascending'},
            { key: 'description', label:'Description'},
            { key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
            { key: 'status', label: 'Status' , tmpl: Template.actionStatus },
            { key: 'lastExecution', label: 'Last Execution Time' , tmpl:  Template.actionExecutionTime}
        ],
        filters: ['table-text-search']
    },
    emptySelection : function() {
        var selection=Session.get('selectedActions');
        return (typeof selection==='undefined') || selection.length==0;
    }
});

Template.actions.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedActions',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedActions');
        if((typeof selection)!=='undefined') {
            for(var i in selection) {
                Meteor.call('deleteAction',selection[i]);
            }
        }
        Session.set('selectedActions',[]);
    }
});

Template.actions.onRendered(function() {
    Session.set('selectedActions',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
    HeightController.maintainPosition('actions');

});

Template.actions.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

App.routeCollection('actions');
