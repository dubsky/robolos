
Template.sensorTable.helpers({

    sensors: function () {
        return SensorsCollection.find();
    },

    settings: function() {
        return Template.instance().tableSettings;
    }
});

TABLE_STATUS_KEY='TABLE_STATUS_';

function prepareField(result,table,fieldName,defaultValue) {
    var key=TABLE_STATUS_KEY+table+'_'+fieldName;
    var initialValue=Session.get(key);
    if(initialValue===undefined) initialValue=defaultValue;
    var fieldValue = new ReactiveVar(initialValue);
    result[fieldName] = fieldValue;
    Template.instance().autorun(function () {
        Session.set(key, fieldValue.get());
    });
}

setupSessionConfiguredTable=function(tableName,tableSettings) {
    var status={ fields:[]};
    prepareField(status,tableName,'currentPage',0);
    tableSettings.currentPage=status.currentPage;

    for(let i in tableSettings.fields) {
        var fieldStatus={};
        status.fields[i]=fieldStatus;
        var keyName=tableName+'.'+tableSettings.fields[i].key;
        prepareField(fieldStatus,keyName,'sortDirection',tableSettings.fields[i].sortDirection);
        if(fieldStatus.sortDirection.get()!==undefined) tableSettings.fields[i].sortDirection=fieldStatus.sortDirection;
        prepareField(fieldStatus,keyName,'sortOrder',tableSettings.fields[i].sortDirection);
        if(fieldStatus.sortOrder.get()!==undefined) tableSettings.fields[i].sortOrder=fieldStatus.sortOrder;
    }
};


Template.sensorTable.onCreated(function () {
    var clazz='reactive-table ui celled  table table-striped table-hover';
    var nameField={key:'name', label:'Name', cellClass:'double-size', headerClass:'double-size'};

    if(this.data!=undefined && this.data.allowSelection) clazz+=" multiselectTable"; else nameField['tmpl']=Template.sensorNameField;

    this.tableSettings={
        class : clazz,
        fields: [
            nameField,
            {key:'ID', label:'Unique ID', hidden:true, tmpl: Template.renderSensorId },
            {key: 'keywords', label:'Keywords', tmpl: Template.keywordTableField },
            {key:'driver', label:'Driver', cellClass:'half-size', headerClass:'half-size'},
            {key:'deviceId', label:'Device Id', cellClass:'half-size', headerClass:'half-size'},
            {key:'sensorId', label:'Sensor Id'},
            {key:'class', label:'Class', cellClass:'half-size', headerClass:'half-size'/*,tmpl: Template.renderSensorClass */,
                fn: function(c) {
                    if((typeof c)==='undefined'|| c===null || c==='') return "N/A";
                    return SensorClassNames[c];
                }
            },
            {key:'comment', label:'Comment'},
            {key:'value', label:'Value', cellClass:'half-size', headerClass:'half-size', tmpl: Template.renderSensorValue}
        ],
        filters: ['table-text-search']
        //showColumnToggles:true
    };

    setupSessionConfiguredTable('sensorTable',this.tableSettings);
});

Template.sensorTable.events({
    'click .multiselectTable tbody tr': function(event, instance) {
        var id=this._id;
        TableSelectionHandler('selectedSensors', event, instance,id);
    }
});

Template.sensorTable.onRendered(function() {
    HeightController.onAreaRendered('table.reactive-table > tbody');
    HeightController.maintainPosition('sensorTable');
});

Template.sensorTable.onDestroyed(function() {
    HeightController.onAreaDestroyed();
});