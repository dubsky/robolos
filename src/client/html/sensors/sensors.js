
SensorsCollection = new Mongo.Collection("sensors");

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
            return Routing.filterUnauthorizedSubscriptions(()=>{
                return [ConnectionManager.subscribe("allSensorMetadata"),ConnectionManager.subscribe("sensors"),ConnectionManager.subscribe("actions")];
            });
        }
    }
);

