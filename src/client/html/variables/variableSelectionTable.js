Template.variableSelectionTable.helpers({

    variables: function () {
        return Collections.Variables.find();
    },

    settings: function() {
        var s={
            fields: [
                {key:'title', label:'Title'},
                {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
                {key:'type', label:'Type'}
            ],
            filters: ['table-text-search']
        };

        if(!this.renderBox)
        {
            s.class='reactive-table table table-striped table-hover ui celled';
        }
        else
        {
            s.class='reactive-table table table-striped table-hover ui celled';
        }

        return s;
    }
});

Template.variableSelectionTable.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        Session.set('selectedVariableName',this.title);
        TableSingleSelectionHandler('selectedVariable', event,id);
    }
});