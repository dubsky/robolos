Template.sensorNameField.helpers({
    name: function () {
        //console.log(name);
        return this.name;
    }

});

Template.sensorNameField.events({
    'click .startEditor': function(event, instance) {
        Template.modalBackup.current.set( {template : 'sensorMetaEditor', data : { sensor: this} });
    }
});