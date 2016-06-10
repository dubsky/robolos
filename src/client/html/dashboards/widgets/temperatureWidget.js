Template.temperatureWidget.helpers({

    value: function() {
        return this.sensorData.value.toFixed(1);
    },

    icon: function() {
        return Template.widgetIconSelector.getURLPathForImageID(this.widget.icon);
    },

    sensorID: function() {
        return this.sensorData._id;
    }
});

Template.temperatureWidget.onCreated(function () {

});

Template.temperatureWidget.events({
    'click .widgetContent' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            Template.modal.current.set({template: 'renderTimeSeries', data: {sensor: this.sensorData._id}});
        }
    }
});

