Template.scheduleSelectionTable.helpers({
    schedules: function () {
        return this.filter===undefined ? Collections.Schedules.find(): Collections.Schedules.find(this.filter);
    },

    settings: function() {
        var s={
            fields: [
                { key: 'title', label:'Name', sortOrder: 0, sortDirection: 'ascending'},
                {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField }
            ],
            filters: ['table-text-search']
        };
        return s;
    }
});


Template.scheduleSelectionTable.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        Session.set('selectedScheduleName',this.title);
        TableSingleSelectionHandler('selectedSchedule', event,id);
    }
});