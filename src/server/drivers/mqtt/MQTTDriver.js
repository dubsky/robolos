import mosca from 'mosca';

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
            let keywords=components.slice(0,components.length-3);
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
                topic: components.slice(0,components.length-1).join('/') ,
                deviceId:device,
                sensorId:sensor,
                keywords: keywords,
                type: type.id,
                comment: payload.comment
            };

            MQTTSensorCollection.upsert({_id: device+'/'+sensor},{$set : sensorData });
            sensorData._id=device+'/'+sensor;

            this.drivenSensors[device+'/'+sensor]=sensorData;
            this.onEventListener.onSensorDiscovery([sensorData]);
    }

    onMessage(packet,client) {
        try {
            if(packet.topic.startsWith('$')) return;

            let result='';
            let p=packet.payload;
            for(let i=0;i<p.length;i++) {
                result+=String.fromCharCode(p[i]);
            }
            //log.debug('MQTT: Message received', result);

            let components=packet.topic.split('/');
            switch(components[components.length-1]) {
                case 'get':
                case 'set':
                    break;
                case 'presentation':
                    let self=this;
                    Fiber(function () {
                        self.sensorPresented(components,packet);
                    }).run();
                    break;
                default:
                    if(components.length<2) {
                        log.error('Invalid topic format, last two topic words must be device and sensor id');
                        break;
                    }
                    let sensor=components[components.length-1];
                    let device=components[components.length-2];

                    let payload=JSON.parse(packet.payload);
                    if ((typeof (this.onEventListener)!=='undefined')) {
                        let sensorData=this.drivenSensors[device+'/'+sensor];
                        if(sensorData==undefined) {
                            log.error('Unknown sensor:'+device+'/'+sensor);
                            break;
                        }
                        var clazz=SensorTypes[sensorData.type];
                        if(clazz==undefined) { log.error('Unknown sensor type '+sensorData.type); return; }
                        let variable=clazz.mainVariable;
                        if(variable==undefined) { log.error('Main variable for '+sensorData.type+' not defined'); return; }
                        let variableValue=payload[variable.name];
                        if(variableValue==undefined) { log.error('Required sensor variable '+SensorClasses[sensorData.type].mainVariable+' missing'); return; }
                        this.onEventListener.onEvent(device,sensor,variableValue);
                    }
            }
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
        this.drivenSensors={};
        let self=this;
        MQTTSensorCollection.find().forEach(function(s) {
            result[result.length]=s;
            self.drivenSensors[s.deviceId+'/'+s.sensorId]=s;
        });
        return result;
    }

    /** Build list of devices, called on driver instance start  */
    getDevices() {
        let result=[];
        MQTTDeviceCollection.find().forEach(function(s) {
            result[result.length]=s;
        });
        return result;
    }

    /**
     * Called when user tries to remove a device from the UI. This is important if the driver is maintaining some persistent
     * information on the device, which is not discoverable anymore and the user wants to get rid of it.
     *
     * @param id device id
     */
    removeDevice(id) {
        MQTTSensorCollection.delete({deviceId: id});
        MQTTDeviceCollection.delete({_id: id});
        let newSensors=[];
        for(let i in this.drivenSensors) {
            if(this.drivenSensors[i].deviceId!=id) {
                newSensors[newSensors.length]=this.drivenSensors[i];
            }
        }
        this.drivenSensors=newSensors;
    }

    performSetValueAction(deviceId ,sensorId, value) {
        let sensorData=this.drivenSensors[deviceId+'/'+sensorId];
        if(sensorData==undefined) {
            log.error('Sensor '+deviceId+'/'+sensorId+' does not exist anymore');
            return;
        }

        let message={};
        message[SensorTypes[sensorData.type].mainVariable.name]=value;
        this.server.ascoltatore.publish(sensorData.topic+'/set', JSON.stringify(message), {}, function() {});
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
            let sensorData=this.drivenSensors[deviceId+'/'+sensorId];
            if(sensorData!=undefined) {
                this.server.ascoltatore.publish(sensorData.topic+'/get', 'message', {}, function() {});
            }
            else {
                log.error('Sensor '+deviceId+'/'+sensorId+' does not exist anymore');
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