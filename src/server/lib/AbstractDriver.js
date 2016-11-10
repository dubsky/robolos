
class AbstractDriverClass {


    getSensors() {
        throw new Exception('This method must be implemented by all drivers');
    }

    getDevices() {
        throw new Exception('This method must be implemented by all drivers');
    }

    /**
     * A helper function building objects like { V_TEMP : 23.7} in a single statement
     * @param variable one of the values of SensorVariables object
     * @param value value for the variable
     * @returns objects like { V_TEMP : 23.7}
     */
    buildVariableObject(variable,value) {
        let r={};
        r[variable.name]=value;
        return r;
    }

    /**
     * Called by the controller to register a call back this driver will call on sensor status change
     * @param listener function with a onEvent function with parameters (deviceId,sensorId,value)
     */
    registerEventListener(listener) {
        //log.debug("registerEventListener called");
        this.onEventListener=listener;
    }

    /**
     * Called on driver start to list known sensors
     */
    reloadSensors() {
        /**
         * Call this.onEventListener.onSensorDiscovery any time later when new sensor is discovered by the driver
         */
        this.onEventListener.onSensorDiscovery(this.getSensors());
    }

    /**
     * Called on driver start to list known devices
     */
    reloadDevices() {
        /**
         * Call this.onEventListener.onDeviceDiscovery any time later when new device is discovered by the driver
         */
        this.onEventListener.onDeviceDiscovery(this.getDevices());
    }

    /**
     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
     */
    static allowsMultipleInstances() {
        return true;
    }

}

AbstractDriver=AbstractDriverClass;