var mosca = Meteor.npmRequire('mosca');

MQTTSensorCollection = new Mongo.Collection("mqttSensors");
MQTTDeviceCollection = new Mongo.Collection("mqttDevices");

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

    sensorPresented(components,packet) {
        if(components.length<3) {
            log.error('Invalid topic format, last two topic words must be device and sensor id');
            return;
        }
        let sensor=components[components.length-2];
        let device=components[components.length-3];
        let keywords=splice(components.length-3,3);
        let payload=JSON.parse(packet.payload);
        let type=SensorTypes[payload.type];
        if(type==undefined) {
            log.error('unknown type presented:'+payload.type);
            return;
        }

        let deviceDocument=MQTTDeviceCollection.findOne({_id:device});
        if(deviceDocument==undefined) {
            let deviceData={_id:device, id:device, comments: 'Automatically detected device based on topic structure'};
            MQTTDeviceCollection.insert(deviceData);
            this.onEventListener.onDeviceDiscovery(deviceData);
        }

        let sensorData={
            _id: device+'/'+sensor,
            topic: components.splice(components.length-1,1).join('/') ,
            deviceId:device,
            sensorId:sensor,
            keywords: keywords,
            type: type,
            comment: payload.comment
        };

        MQTTSensorCollection.upsert({$set : sensorData });
        this.sensors[device+'/'+sensor]=sensorData;
        this.onEventListener.onSensorDiscovery([sensorData]);
    }

    onMessage(packet,client) {
        try {
            if(packet.topic.startsWith('$')) return;

            let components=packet.topic.split('/');
            switch(components[components.length]) {
                case 'get':
                    log.error('Not supported');
                    break;
                case 'set':
                    if(components.length<3) {
                        log.error('Invalid topic format, last two topic words must be device and sensor id');
                        break;
                    }
                    let sensor=components[components.length-2];
                    let device=components[components.length-3];
                    let payload=JSON.parse(packet.payload);
                    if ((typeof (self.onEventListener)!=='undefined')) {
                        let sensorData=this.sensors[device+'/'+sensor];
                        var clazz=SensorClasses[sensorData.type];
                        if(clazz==undefined) { log.error('Unknown sensor type '+sensorData.type); return; }
                        let variable=clazz.mainVariable;
                        if(variable==undefined) { log.error('Main variable for '+sensorData.type+' not defined'); return; }
                        let variableValue=payload[variable];
                        if(variableValue==undefined) { log.error('Required sensor variable '+SensorClasses[sensorData.type].mainVariable+' missing'); return; }
                        self.onEventListener.onEvent(device,sensor,variableValue);
                    }
                    break;
                case 'presentation':
                    this.sensorPresented(components,packet);
                default:
            }

            log.debug('MQTT: Message received', packet);
        }
        catch(e)
        {
            log.error('Unexpected error handling a message',e);
        }
    }

    onSubscribe(topic,client) {
        log.info('MQTT: Client ' + client.id + ' subscribed to '+topic);
    }

    onUnsubscribe(topic,client) {
        log.info('MQTT: Client ' + client.id + ' unsubscribed from '+topic);
    }

    onClientDisconnected(client) {
        log.info('MQTT: Client disconnected', client.id);
    }

    /** Called when the driver is started and should start reporting sensor values and listening for actor changes */
    start(parameters) {
        if(parameters==undefined) parameters={};
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

        this.server.on('subscribed', function(topic,client) {
            self.onSubscribe(topic,client);
        });

        this.server.on('unsubscribed', function(topic,client) {
            self.onUnsubscribe(topic,client);
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
            self.onClientDisconnected(client);
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
        let result=[];
        this.sensors={};
        MQTTSensorCollection.find().forEach(function(s) {
            result.result.length=s;
            this.sensors[s.deviceId+'/'+s.sensorId]=s;
        });
        return result;
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

    performSetValueAction(deviceId ,sensorId, value) {
        let sensorData=this.sensors[deviceId+'/'+sensorId];
        if(sensorData==undefined) {
            log.error('Sensor '+deviceId+'/'+sensorId+' does not exist anymore');
            return;
        }

        let message={};
        message[SensorTypes[sensorData.type].mainVariable.name]=value;
        //this.server.ascolatore(topic, payload, options, done);
        this.server.ascolatore.publish(sensorData.topic+'/set', JSON.stringify(message), {}, function() {});
    }

    /**
     * Called when actor status change is requested
     * @param deviceId device id
     * @param sensorId sensor id
     * @param action @see SENSOR_ACTIONS
     * @param parameters @see SENSOR_ACTIONS
     */
    performAction(deviceId ,sensorId,action,parameters) {
        if (action == SENSOR_ACTIONS.SWITCH_ON) {
            value = 1;
            this.performSetValueAction(deviceId, sensorId, value);
        }
        if (action == SENSOR_ACTIONS.SWITCH_OFF) {
            value = 0;
            this.performSetValueAction(deviceId, sensorId, value);
        }
        if (action == SENSOR_ACTIONS.SET_VALUE) {
            value = parameters.value;
            this.performSetValueAction(deviceId, sensorId, value);
        }
        if (action == SENSOR_ACTIONS.GET_VALUE) {
            let sensorData=this.sensors[deviceId+'/'+sensorId];
            if(sensorData==undefined) {
                log.error('Sensor '+deviceId+'/'+sensorId+' does not exist anymore');
                this.server.ascolatore.publish(sensorData.topic+'/get', '', {}, function() {});
            }
        }
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

Drivers.registerDriver(MQTTDriver);