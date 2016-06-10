
Router.route('sensors',
    function () {
        var context=EditContext.getContext();
        if(context!==undefined) {
            // returning back to edited document
            var item=context.getDocument();
            AutoForm.resetForm('sensorMetaForm');
            this.render('sensors');
            Template.modalBackup.current.set( {template : 'sensorMetaEditor', data : { sensor: item } });
        }
        else {
            this.render('sensors');
        }
    },
    {
        name: 'sensors',
        waitOn: function() {
            // subscribe to just the current one!!!!
            return [Meteor.subscribe("allSensorMetadata"),Meteor.subscribe("allSensors")];
        }
    }
);

