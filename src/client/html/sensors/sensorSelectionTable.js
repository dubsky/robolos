

Template.sensorSelectionTable.helpers({
    sensors: function () {
        return this.filter===undefined ? SensorsCollection.find() : SensorsCollection.find(this.filter);
    },

    settings: function() {
        var s={
            fields: [
                {key:'name', label:'Name', cellClass:'double-size', headerClass:'double-size',tmpl: Template.renderSensorName},
                /*{key:'class', label:'Class', tmpl: Template.renderSensorClass},*/
                {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
                {key:'comment', label:'Comment'}
            ],
            filters: ['table-text-search']
        };
        return s;
    }
});


Template.sensorSelectionTable.events({
    'click .reactive-table tbody tr': function(event, instance) {
        var id=this._id;
        Session.set('selectedSensorName',this.name);
        TableSingleSelectionHandler('selectedSensor', event,id);
    }
});