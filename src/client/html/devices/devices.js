
DevicesCollection = new Mongo.Collection("devices");

Tracker.autorun(function () {
    Meteor.subscribe('allDevices');
});

Template.devices.helpers({
    devices: function () {
        return DevicesCollection.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
        {key: 'id', label:'ID'},
        {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
        {key:'driver', label:'Driver'},
        {key:'type', label:'Type'},
        {key:'revision', label:'Version'},
        {key:'protocol', label:'Protocol'}
      ],
      filters: ['table-text-search']
    },

    emptySelection : function() {
        var selection=Session.get('selectedDevices');
        return (typeof selection==='undefined') || selection.length===0;
    }
});


Template.devices.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedDevices',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedDevices');
        if((typeof selection)!=='undefined') {
            Meteor.call('deleteDevices',selection);
        }
    },

    'click .configureHardware': function(event, instance) {
        Router.go('driverInstances');
    }

});


Template.devices.onRendered(function() {
    Session.set('selectedDevices',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.devices.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});


Router.route('devices',
    function () {
        this.render('devices');
    },
    {
        name: 'devices',
        waitOn: function() {
            return Meteor.subscribe('settings');
        }
    }
);

