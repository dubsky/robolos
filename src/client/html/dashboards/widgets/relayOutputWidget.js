Template.relayOutputWidget.helpers({
    isOn: function(sensorValue) {
        return (sensorValue.value===1);
    },

    icon: function() {
        return Template.widgetIconSelector.getURLPathForImageID(this.widget.icon);
    }
});

Template.relayOutputWidget.events({
   'click .button' : function() {
       if (!Session.get(DASHBOARD_EDIT_MODE)) {
           Meteor.call('actionSwitchOver', this.widget.driver, this.widget.device, this.widget.sensor);
       }
   }
});


