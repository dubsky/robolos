MessagesCollection = new Mongo.Collection("log");

Template.log.helpers({
    messages: function () {
        return MessagesCollection.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            {key: 'time', label:'Time',cellClass:'half-size', headerClass:'half-size',sortDirection: 'descending',tmpl: Template.dateField},
            {key: 'level', label:'Level',cellClass:'half-size', headerClass:'half-size',tmpl: Template.severityField},
            {key:'message', label:'Message',cellClass:'double-size', headerClass:'double-size'},
            {key:'data', label:'Keywords'}
        ],
        filters: ['table-text-search']
    },

    subscribed: function() {
        return Template.log.subscribed.get();
    }
});


Template.log.events({
    'click .stopLogUpdate' : function() {
        if (Template.log.subscribed.get()) {
            Template.log.handle.stop();
            Template.log.handle=App.subscribeNoCaching('log',{update:false});
            Template.log.subscribed.set(false);
        }
    },
    'click .startLogUpdate' : function() {
        if (!Template.log.subscribed.get()) {
            Template.log.handle.stop();
            Template.log.handle=App.subscribeNoCaching('log',{update:true});
            Template.log.subscribed.set(true);
        }
    }
});


Template.log.onRendered(function() {
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.log.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Router.route('log',{
    name: 'log',
    subscriptions: function() {
        var handle=App.subscribeNoCaching('log',{update:false});
        Template.log.subscribed=new ReactiveVar(false);
        Template.log.handle=handle;
        return handle;
    }
});

