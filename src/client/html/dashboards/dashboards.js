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
        if(selection!==undefined) {
            for(var i=0;i<selection.length;i++) {
                ConnectionManager.call('deleteDashboard',selection[i]);
            }
        }
        Session.set('selectedDashboards',[]);
    },

    'click .export': function(event, instance) {
        var selection=Session.get('selectedDashboards');
        if(selection!=='undefined') {
            ConnectionManager.call('exportDashboards',selection,function(err,result) {
                let blob = new Blob([result], {type: "octet/stream"});
                let a = document.createElement("a");
                a.style.display = 'none';
                document.body.append(a);
                let url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = "export.robolos";
                a.click();
                window.URL.revokeObjectURL(url);
                console.log(result);
            });
        }
    }


});

Template.dashboards.onRendered(function() {
    Session.set('selectedDashboards',[]);
    HeightController.onAreaRendered('table.reactive-table > tbody');
});

Template.dashboards.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});

Routing.routeCollection('dashboards');

// we want them to be loaded all the time
ConnectionManager.subscribeNoCaching('dashboards');


