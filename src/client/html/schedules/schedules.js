Template.schedules.helpers({
    schedules: function () {
        return Collections.Schedules.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            { key: 'title', label:'Name',tmpl: Template.scheduleLink,sortOrder: 0, sortDirection: 'ascending'},
            { key: 'description', label:'Description'},
            { key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
            { key: 'cron', label:'Execution Time',tmpl: Template.cronEntryTableField},
            { key: 'nextExecutionTime', label:'Next Execution Time',tmpl: Template.nextExecutionTableField}
        ],
        filters: ['table-text-search']
    },
    emptySelection : function() {
        var selection=Session.get('selectedSchedules');
        return (typeof selection==='undefined') || selection.length===0;
    }
});

Template.schedules.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedSchedules',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedSchedules');
        if((typeof selection)!=='undefined') {
            for(var i=0;i<selection.length;i++) {
                Meteor.call('deleteSchedule',selection[i]);
                //Collections.Schedules.remove(selection[i]);
            }
            Session.set('selectedSchedules',[]);

        }
    }
});


Template.schedules.onRendered(function() {
    Session.set('selectedSchedules',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
    HeightController.maintainPosition('schedules');
});

Template.schedules.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

App.routeCollection('schedules');


