class DemoDriver extends AbstractDriver {

    /* Choose a Unique ID for your driver. Will be visible in UI. */
    static getDriverID() {
        return 'Demo Driver';
    }

    static getDescription() {
        return 'Sample driver to use as a template to build your own drivers';
    }

    /** Called when the driver is started and should start reporting sensor values and listening for actor changes.
     *  All sensors should be discoverd during this stage so that the system can safely start. */
    start(parameters) {
        // simulate updates from Temp sensor
        var self=this;

        this.handle=setInterval(function() {
                // for demo purposes generate a temperature change event every 10 seconds
                if ((typeof (self.onEventListener)!=='undefined'))
                    self.onEventListener.onEvent(77,1,self.buildVariableObject(SensorVariables.V_TEMP,Math.random()+23));
        } ,10000);

        log.info('Demo Driver: Driver Started');
    }

    stop(parameters) {
        clearInterval(this.handle);
        log.info('Demo Driver: Stopped');
    }

    /* For simplicity, there is only one virtual relay in this demo. This variable holds it's value */
    constructor(driverInstanceDocument) {
        super();
        this.demoRelayValue=1;
    }


    /** Build list of sensors, called on driver instance start */
    getSensors() {
        var result=[
            {
                deviceId:77,
                sensorId:1,
                keywords: ['Demo'],
                type: SensorTypes.S_TEMP.id,
                value: this.buildVariableObject(SensorVariables.V_TEMP,23.7),
                // time of the measurement
                timestamp:new Date().getTime(),
                // UI hint
                comment: 'Demo Temperature Sensor',
                // UI hint
                deviceType:'Thermometer'
            },
            {
                deviceId:77,
                sensorId:2,
                keywords: ['Demo'],
                type: SensorTypes.S_LIGHT.id,
                value: this.buildVariableObject(SensorVariables.V_STATUS,this.demoRelayValue),
                // time of the measurement
                timestamp:new Date().getTime(),
                // UI hint
                comment: 'Demo Relay',
                // UI hint
                deviceType:'Relay'
            }

        ];
        return result;
    }

    /** Build list of devices, called on driver instance start  */
    getDevices() {
        var result=[
            {
                id:77,
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
    performAction(deviceId,sensorId,variable,action,parameters)
    {
        if(action===SENSOR_ACTIONS.SWITCH_OFF)
        {
            this.demoRelayValue=0;
            // report back the value set (this might be reported later on when the driver can confirm it successfuly switched the destination output)
            this.onEventListener.onEvent(77,2,this.buildVariableObject(variable,this.demoRelayValue));
            log.debug('DEMO_RELAY_VALUE:',this.demoRelayValue);
        }
        if(action===SENSOR_ACTIONS.SWITCH_ON)
        {
            this.demoRelayValue=1;
            // report back the value set (this might be reported later on when the driver can confirm it successfuly switched the destination output)
            this.onEventListener.onEvent(77,2,this.buildVariableObject(variable,this.demoRelayValue));
            log.debug('DEMO_RELAY_VALUE:',this.demoRelayValue);
        }
        if(action===SENSOR_ACTIONS.GET_VALUE)
        {
            // server requested a sensor value
            this.onEventListener.onEvent(77,2,this.buildVariableObject(variable,this.demoRelayValue));
        }
    }

    /**
     * @returns {string} meteor template name to create/update driver instance.
     */
    static getUIManagementBaseRoute() {
        return 'manageDemoConnection';
    }

    /**
     * @returns {string} path within the 'public' directory to the icon representing the driver. May return 'undefined' for a default one.
     */
    static getIconPath() {
        return undefined;
    }

    /**
     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
     */
    static allowsMultipleInstances() {
        return true;
    }

}

Drivers.registerDriver(DemoDriver);