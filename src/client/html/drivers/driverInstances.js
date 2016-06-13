Template.driverInstances.helpers({
    driverInstances: function () {
        return Collections.DriverInstances.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            { key: 'title', label:'Name',tmpl: Template.driverInstanceLink,sortOrder: 0, sortDirection: 'ascending'},
            { key: 'driver', label:'Driver'},
            { key: 'description', label:'Description'}
            /*{ key: 'type', label:'Execution Time',tmpl: Template.cronEntryTableField},*/
        ],
        filters: ['table-text-search']
    },
    emptySelection : function() {
        var selection=Session.get('selectedDriverInstances');
        return (typeof selection==='undefined') || selection.length===0;
    }
});

Template.driverInstances.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedDriverInstances',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedDriverInstances');
        if((typeof selection)!=='undefined') {
            for(var i=0;i<selection.length;i++) {
                Meteor.call('deleteDriverInstance',selection[i]);
                //Collections.DriverInstances.remove(selection[i]);
            }
            Session.set('selectedDriverInstances',[]);
        }
    }
});


Template.driverInstances.onRendered(function() {
    Session.set('selectedDriverInstances',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.driverInstances.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

App.routeCollection('driverInstances',[App.subscribe('drivers')]);
