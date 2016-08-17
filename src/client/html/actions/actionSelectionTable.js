

Template.actionSelectionTable.helpers({

    actions: function () {
        return this.filter===undefined ? Collections.Actions.find() : Collections.Actions.find(this.filter);
    },

    settings: function() {
        var s={
            fields: [
                {key:'title', label:'Title'},
                {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField }
            ],
            filters: ['table-text-search']
        };

        if(!this.renderBox)
        {
            s.class='reactive-table ui celled table table-striped table-hover scrolledTable';
        }
        else
        {
            s.class='reactive-table table table-striped table-hover ui celled';
        }

        return s;
    }
});

Template.actionSelectionTable.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        Session.set('selectedActionName',this.title);
        TableSingleSelectionHandler('selectedAction', event,id);
    }
});