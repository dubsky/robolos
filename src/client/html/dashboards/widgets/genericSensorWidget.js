Template.genericSensorWidget.helpers({

    icon: function() {
        return Template.widgetIconSelector.getURLPathForImageID(this.widget.icon);
    }
});

Template.genericSensorWidget.events({
    'click .widgetContent' : function(e) {
        if (!Session.get(DASHBOARD_EDIT_MODE)) {
            Template.modal.current.set({template: 'renderTimeSeries', data: {sensor: this.sensorData._id}});
        }
    }
});