class MQTTDriver extends AbstractDriver {

    static getDriverID() {
        return 'MQTT Driver';
    }

    static getDescription()  {
        return 'Support for MQTT connected devices ';
    }

    /** Called when the driver is started and should start reporting sensor values and listening for actor changes */
    start(parameters) {
        // simulate updates from Temp sensor
        var self=this;
        log.info('Demo Driver: Driver Started');
    }

    stop(parameters) {
        log.info('Demo Driver: Stopped');
    }

    /* For simplicity, there is only one virtual relay in this demo. This variable holds it's value */
    constructor(driverInstanceDocument) {
        //super();
    }

    /** Build list of sensors, called on driver instance start */
    getSensors() {
        return [];
    }

    /** Build list of devices, called on driver instance start  */
    getDevices() {
        var result=[
            {
                id:0,
                keywords: ['Demo'],
                revision: '1.5',
                protocol: '1.2.1',
                type:'Thermometer',
                comment: 'Demo device'
            }
        ];
        return result;
    }

    /**
     * Called when user tries to remove a device from the UI. This is important if the driver is maintaining some persistent
     * information on the device, which is not discoverable anymore and the user wants to get rid of it.
     *
     * @param id device id
     */
    removeDevice (id) {
    }

    /**
     * Called when actor status change is requested
     * @param deviceId device id
     * @param sensorId sensor id
     * @param action @see SENSOR_ACTIONS
     * @param parameters @see SENSOR_ACTIONS
     */
    performAction(deviceId ,sensorId,action,parameters)
    {

    }

    /**
     * @returns {string} meteor template name to create/update driver instance.
     */
    static getUIManagementBaseRoute()  {
        return 'manageMQTTConnection';
    }

    /**
     * @returns {string} path within the 'public' directory to the icon representing the driver. My return 'undefined' for an ugly icon
     */
    static getIconPath()  {
        return '/drivers/MQTTLogo.png';
    }

    /**
     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
     */
    static allowsMultipleInstances()  {
        return true;
    }



}