let RemoteControlType={ BOOLEAN:'BOOLEAN',ANALOG_0_100:'ANALOG_0_100', ANALOG:'ANALOG' };


SensorCommandProvider=class SensorCommandProviderClass extends CommandProvider {

    listCommands() {
        let result=[];
        Sensors.forEachSensor((sensor)=>{
            let meta=SensorMetadata.getSensorMetadata(sensor._id);
            if(meta!==undefined && meta.remoteControlLabel) {
                if(sensor.class===SensorClasses.BINARY_OUTPUT) {
                    result.push({
                        id: sensor._id,
                        uuid: meta.uuid,
                        label: meta.remoteControlLabel===undefined ? sensor.name : meta.remoteControlLabel,
                        type: RemoteControlType.BOOLEAN
                    });
                }
            }
        });
        return result;
    }

    execute(commandRecord,parameter) {
        let sensor=Sensors.getSensorIdComponents(commandRecord.id);
        Sensors.performAction(sensor[0],sensor[1],sensor[2],Sensors.getMainVariable(sensor[0],sensor[1],sensor[2]),SENSOR_ACTIONS.SET_VALUE,parameter);
    }

    getType() {
        return CommandProviderTypes.SENSOR;
    }
}