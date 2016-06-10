

Tracker.autorun(function () {
    Meteor.subscribe('allDashboards');
});

Template.dashboards.helpers({
    dashboards: function () {
        return Collections.Dashboards.find();
    },

    settings:
    {
        class: 'reactive-table ui celled table table-striped table-hover ',
        fields: [
            { key: 'title', label:'Name',tmpl: Template.dashboardLink,sortOrder: 1, sortDirection: 'ascending'},
            { key: 'menuPositionNumber', label:'Menu Position',sortOrder: 0, sortDirection: 'ascending'},
            { key: 'description', label:'Description'},
            { key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField }
            /*      { key: 'selected', label: '' ,  headerClass: 'reactiveSelectionColumn', sortable: false, tmpl: Template.selectMultiple}*/
        ],
        filters: ['table-text-search']
    },
    emptySelection : function() {
        var selection=Session.get('selectedDashboards');
        return (typeof selection==='undefined') || selection.length===0;
    }
});

Template.dashboards.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedDashboards',event, instance,id);
    },

    'click .remove': function(event, instance) {
        var selection=Session.get('selectedDashboards');
        if((typeof selection)!=='undefined') {
            for(var i=0;i<selection.length;i++) {
                Meteor.call('deleteDashboard',selection[i]);
                //Collections.Dashboards.remove(selection[i]);
            }
        }
        Session.set('selectedDashboards',[]);
    }
});

Template.dashboards.onRendered(function() {
    Session.set('selectedDashboards',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.dashboards.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Router.route('dashboards');
