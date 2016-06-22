var mosca = Meteor.npmRequire('mosca');

class MQTTDriver extends AbstractDriver {

    static getDriverID() {
        return 'MQTT Driver';
    }

    static getDescription()  {
        return 'Support for MQTT connected devices ';
    }


    onClientConnected(client) {
        log.info('MQTT: Client connected', client.id);
    }

    onMessage(packet,client) {
        log.debug('MQTT: Message received', packet.payload);
    }
    onClientDisconnected(packet,client) {
        log.info('MQTT: Client disconnected', client.id);
    }

    /** Called when the driver is started and should start reporting sensor values and listening for actor changes */
    start(parameters) {

        // simulate updates from Temp sensor
        var self=this;

        var config = {
          /*  type: 'mongo',
            url: 'mongodb://localhost:27017/mqtt',
            pubsubCollection: 'mosca',
            mongo: {}*/
        };

        var settings = {
            port: parameters.port == undefined ? 1883 : parameters.port,
            backend: config
        };

        this.server = new mosca.Server(settings);

        this.server.on('clientConnected', function(client) {
            self.onClientConnected(client);
        });

        // fired when a message is received
        this.server.on('published', function(packet, client) {
            self.onMessage(packet,client);
        });

        this.server.on('ready', function() {
            log.info('MQTT: Broker ready');
        });

        // fired when a client disconnects
        this.server.on('clientDisconnected', function(client) {
            self.onClientDisonnected(packet,client);
        });
        log.info('MQTT: Driver Started');
    }


    stop(parameters) {
        if(this.server!=undefined) this.server.close(function () {
            log.info('MQTT: Stopped');
        });
    }

    /* For simplicity, there is only one virtual relay in this demo. This variable holds it's value */
    constructor(driverInstanceDocument) {
        super();
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