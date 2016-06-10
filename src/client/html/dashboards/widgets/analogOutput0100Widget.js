Template.analogOutput0100Widget.helpers({
    isOn: function(sensorValue) {
        return (sensorValue.value!==0);
    },

    icon: function() {
        return Template.widgetIconSelector.getURLPathForImageID(this.widget.icon);
    }
});

Template.analogOutput0100Widget.events({
});