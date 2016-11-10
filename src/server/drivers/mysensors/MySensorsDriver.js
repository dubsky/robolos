import Fiber from 'fibers';
import net from 'net';
import serialPort from 'serialport';

NodeCollection = new Mongo.Collection("node");
FirmwareCollection = new Mongo.Collection("firmware");


const fwSketches = [];
const fwDefaultType = 0xFFFF; // index of hex file from array above (0xFFFF

const FIRMWARE_BLOCK_SIZE = 16;
const BROADCAST_ADDRESS = 255;
const NODE_SENSOR_ID = 255;

const C_PRESENTATION = 0;
const C_SET = 1;
const C_REQ = 2;
const C_INTERNAL = 3;
const C_STREAM = 4;

const I_BATTERY_LEVEL = 0;
const I_TIME = 1;
const I_VERSION = 2;
const I_ID_REQUEST = 3;
const I_ID_RESPONSE = 4;
const I_INCLUSION_MODE = 5;
const I_CONFIG = 6;
const I_PING = 7;
const I_PING_ACK = 8;
const I_LOG_MESSAGE = 9;
const I_CHILDREN = 10;
const I_SKETCH_NAME = 11;
const I_SKETCH_VERSION = 12;
const I_REBOOT = 13;


const ST_FIRMWARE_CONFIG_REQUEST = 0;
const ST_FIRMWARE_CONFIG_RESPONSE = 1;
const ST_FIRMWARE_REQUEST = 2;
const ST_FIRMWARE_RESPONSE = 3;
const ST_SOUND = 4;
const ST_IMAGE = 5;

const P_STRING = 0;
const P_BYTE = 1;
const P_INT16 = 2;
const P_UINT16 = 3;
const P_LONG32 = 4;
const P_ULONG32 = 5;
const P_CUSTOM = 6;


function crcUpdate(old, value) {
    var c = old ^ value;
    for (var i = 0; i < 8; ++i) {
        if ((c & 1) > 0)
            c = ((c >> 1) ^ 0xA001);
        else
            c = (c >> 1);
    }
    return c;
}

function pullWord(arr, pos) {
    return arr[pos] + 256 * arr[pos + 1];
}

function pushWord(arr, val) {
    arr.push(val & 0x00FF);
    arr.push((val >> 8) & 0x00FF);
}

function pushDWord(arr, val) {
    arr.push(val & 0x000000FF);
    arr.push((val >> 8) & 0x000000FF);
    arr.push((val >> 16) & 0x000000FF);
    arr.push((val >> 24) & 0x000000FF);
}

function encode(destination, sensor, command, acknowledge, type, payload) {
    var msg = destination.toString(10) + ";" + sensor.toString(10) + ";" + command.toString(10) + ";" + acknowledge.toString(10) + ";" + type.toString(10) + ";";
    if (command == 4) {
        for (var i = 0; i < payload.length; i++) {
            if (payload[i] < 16)
                msg += "0";
            msg += payload[i].toString(16);
        }
    } else {
        msg += payload;
    }
    msg += '\n';
    return msg.toString();
}

/*
 import fs from 'fs';
 import path from 'path';
 import requestify from 'requestify';


 function loadFirmware(fwtype, fwversion, sketch) {
 var filename = path.basename(sketch);
 log.info("MySensors: compiling firmware: " + filename);
 var req = {
 files: [{
 filename: filename,
 content: fs.readFileSync(sketch).toString()
 }],
 format: "hex",
 version: "105",
 build: {
 mcu: "atmega328p",
 f_cpu: "16000000L",
 core: "arduino",
 variant: "standard"
 }
 };
 requestify.post('https://codebender.cc/utilities/compile/', req).then(function (res) {
 var body = JSON.parse(res.getBody());
 if (body.success) {
 log.info("MySensors: loading firmware: " + filename);
 fwdata = [];
 var start = 0;
 var end = 0;
 var pos = 0;
 var hex = body.output.split("\n");
 for (l in hex) {
 line = hex[l].trim();
 if (line.length > 0) {
 while (line.substring(0, 1) != ":")
 line = line.substring(1);
 var reclen = parseInt(line.substring(1, 3), 16);
 var offset = parseInt(line.substring(3, 7), 16);
 var rectype = parseInt(line.substring(7, 9), 16);
 var data = line.substring(9, 9 + 2 * reclen);
 var chksum = parseInt(line.substring(9 + (2 * reclen), 9 + (2 * reclen) + 2), 16);
 if (rectype == 0) {
 if ((start == 0) && (end == 0)) {
 if (offset % 128 > 0)
 throw new Error("error loading hex file - offset can't be devided by 128");
 start = offset;
 end = offset;
 }
 if (offset < end)
 throw new Error("error loading hex file - offset lower than end");
 while (offset > end) {
 fwdata.push(255);
 pos++;
 end++;
 }
 for (var i = 0; i < reclen; i++) {
 fwdata.push(parseInt(data.substring(i * 2, (i * 2) + 2), 16));
 pos++;
 }
 end += reclen;
 }
 }
 }
 var pad = end % 128; // ATMega328 has 64 words per page / 128 bytes per page
 for (var i = 0; i < 128 - pad; i++) {
 fwdata.push(255);
 pos++;
 end++;
 }
 var blocks = (end - start) / FIRMWARE_BLOCK_SIZE;
 var crc = 0xFFFF;
 for (var i = 0; i < blocks * FIRMWARE_BLOCK_SIZE; ++i) {
 var v = crc;
 crc = crcUpdate(crc, fwdata[i]);
 }
 FirmwareCollection.upsert({
 'type': fwtype,
 'version': fwversion
 }, {
 $set: {
 'filename': filename,
 'blocks': blocks,
 'crc': crc,
 'data': fwdata
 }
 });
 log.info("MySensors: loading firmware done. blocks: " + blocks + " / crc: " + crc);
 } else {
 log.error("MySensors: error: %j", res.body);
 }
 });
 }
 */
/*
 function decode(msg) {
 var msgs = msg.toString().split(";");
 rsender = +msgs[0];
 rsensor = +msgs[1];
 rcommand = +msgs[2];
 rtype = +msgs[3];
 var pl = msgs[4].trim();
 rpayload = [];
 for (var i = 0; i < pl.length; i+=2) {
 var b = parseInt(pl.substring(i, i + 2), 16);
 rpayload.push(b);
 }
 }
 */


/*
 function sendFirmwareConfigResponse(destination, fwtype, fwversion, gw) {
 // keep track of type/versin info for each node
 // at the same time update the last modified date
 // could be used to remove nodes not seen for a long time etc.

 try
 {
 NodeCollection.upsert({
 'id': destination
 }, {
 $set: {
 'type': fwtype,
 'version': fwversion,
 'reboot': 0
 }
 });
 }
 catch(err)
 {
 log.error("MySensors: Error writing node type and version to database",err);
 }

 if (fwtype == 0xFFFF) {
 // sensor does not know which type / blank EEPROM
 // take predefined type (ideally selected in UI prior to connection of new sensor)
 if (fwDefaultType == 0xFFFF)
 throw new Error('No default sensor type defined');
 fwtype = fwDefaultType;
 }
 var result=FirmwareCollection.findOne({
 $query: {
 'type': fwtype
 },
 $orderby: {
 'version': -1
 }}
 );
 if (!result)
 {
 log.error('MySensors: No firmware found for type ' + fwtype);
 }
 else
 {
 var payload = [];
 pushWord(payload, result.type);
 pushWord(payload, result.version);
 pushWord(payload, result.blocks);
 pushWord(payload, result.crc);
 var sensor = NODE_SENSOR_ID;
 var command = C_STREAM;
 var acknowledge = 0; // no ack
 var type = ST_FIRMWARE_CONFIG_RESPONSE;
 var td = encode(destination, sensor, command, acknowledge, type, payload);
 log.debug('MySensors: sending -> ' + td.toString());
 gw.write(td);
 }
 }

 function sendFirmwareResponse(destination, fwtype, fwversion, fwblock, gw) {
 var result;

 try
 {
 result=FirmwareCollection.findOne({
 'type': fwtype,
 'version': fwversion
 });
 }
 catch(err)
 {
 log.error('MySensors: Error finding firmware version ' + fwversion + ' for type ' + fwtype);
 }

 if(result===null) {
 log.error('MySensors: Error finding firmware version ' + fwversion + ' for type ' + fwtype);
 return;
 }
 var payload = [];
 pushWord(payload, result.type);
 pushWord(payload, result.version);
 pushWord(payload, fwblock);
 for (var i = 0; i < FIRMWARE_BLOCK_SIZE; i++)
 payload.push(result.data[fwblock * FIRMWARE_BLOCK_SIZE + i]);
 var sensor = NODE_SENSOR_ID;
 var command = C_STREAM;
 var acknowledge = 0; // no ack
 var type = ST_FIRMWARE_RESPONSE;
 var td = encode(destination, sensor, command, acknowledge, type, payload);
 log.debug('MySensors: sending -> ' + td.toString());
 gw.write(td);

 }

 */



class MySensors extends AbstractDriver {


    saveBatteryLevel(sender, payload) {
        /*
         var cn = "BatteryLevel-" + sender.toString();
         db.createCollection(cn, function (err, c) {
         c.save({
         'timestamp': new Date().getTime(),
         'value': payload
         }, function (err, result) {
         if (err)
         log.debug("Error writing battery level to database");
         });
         });
         */
    }


    sendTime(destination, sensor) {
        var payload = new Date().getTime();
        var command = C_INTERNAL;
        var acknowledge = 0; // no ack
        var type = I_TIME;
        var td = encode(destination, sensor, command, acknowledge, type, payload);
        log.debug('MySensors: sending -> ' + td.toString());
        this.gw.write(td);
    }

    sendNextAvailableSensorId() {
        log.info("MySensors: New node requested id assignment");
        var c=NodeCollection.find({
            $query: {
                'driverInstance':this.id,
            },
            $orderby: {
                'id': 1
            }
        });
        var results=[];
        c.forEach(function(d) {results.push(d);});
        var id = 1;
        for(;id<256;id++)
        {
            var conflict=false;
            for (var i = 0; i < results.length; i++) {
                if (results[i].id ==id) {
                    conflict=true;
                    break;
                }
            }
            if(!conflict) break;
        }

        if (id < 255) {
            NodeCollection.insert({
                'id': id,
                'driverInstance':this.id,
            });
            var destination = BROADCAST_ADDRESS;
            var sensor = NODE_SENSOR_ID;
            var command = C_INTERNAL;
            var acknowledge = 0; // no ack
            var type = I_ID_RESPONSE;
            var payload = id;
            var td = encode(destination, sensor, command, acknowledge, type, payload);
            log.debug('MySensors: sending -> ' + td.toString());
            this.gw.write(td);
        }
        else
        {
            log.error("MySensors: maximum number of nodes (255). delete some unused nodes to continue.");
        }
    }


    saveSensor(sender, sensor, type) {
        let node = NodeCollection.findOne(
            {
                'id': sender,
                'driverInstance':this.id
            });
        if (node !== undefined) {
            if (node.sensors === undefined) node.sensors = [];
            let found = false;
            for (let n of node.sensors) {
                if (n.id == sensor) {
                    if (n.type != type) {
                        n.type = type;
                        found = true;
                    }
                    else {
                        return;
                    }
                }
            }
            if (!found) {
                node.sensors[node.sensors.length] = {id: sensor, type: type};
            }
            NodeCollection.update({
                'id': sender,
                'driverInstance':this.id
            }, {
                $set: {
                    sensors: node.sensors
                }
            });
            if(this.onEventListener!==undefined)
            {
                let t=this.getSensorTypes()[type];
                let result={
                    driver : 'My Sensors',
                    deviceId: sender,
                    sensorId: sensor
                };
                if(t.mappedToType!==undefined) result.type=t.mappedToType.id; else result.comment=t.comment;
                this.onEventListener.onSensorDiscovery([ result ]);
            }
        }
    }

    saveValue(sender, sensor, type, payload) {
        let time = new Date().getTime();
        /*let value = this.latestValues[sender];
        if ((typeof value) == 'undefined') {
            value = [];
            this.latestValues[sender] = value;
        }
         value[sensor] = {value: payload, timestamp: time};
         */

        var n=Number(payload);
        if(!isNaN(n)) payload=n;

        if(this.onEventListener!==undefined)
        {
            let variable=MySensorsVariableTypes.get(type);
            let result=payload;
            if(variable!==undefined) {
                result={};
                result[variable]=payload;
            }
            this.onEventListener.onEvent(sender, sensor, result);
        }
    }

    fireDeviceUpdate(sender) {
        let node=NodeCollection.findOne({
            'id': sender,
            'driverInstance':this.id
        });
        if(node!==undefined) {
            if(this.onEventListener!==undefined)
            {
                this.onEventListener.onDeviceDiscovery([this.getDeviceRecordForNode(node)]);
            }
        }
    }

    saveSketchName(sender, payload) {
        NodeCollection.update({
            'id': sender,
            'driverInstance':this.id
        }, {
            $set: {
                'sketchName': payload
            }
        });
        this.fireDeviceUpdate(sender);
    }

    saveSketchVersion(sender, payload) {
        NodeCollection.update({
            'id': sender,
            'driverInstance':this.id
        }, {
            $set: {
                'sketchVersion': payload
            }
        });
        this.fireDeviceUpdate(sender);
    }

    saveProtocol(sender, payload) {
        NodeCollection.upsert({
            'id': sender,
            'driverInstance':this.id,
        }, {
            $set: {
                'protocol': payload
            }
        });

        if(this.onEventListener!==undefined)
        {
            let device={
                id : sender,
                protocol : payload,
                driver :'My Sensors'
            };
            this.onEventListener.onDeviceDiscovery([device]);
        }
    }

    sendConfig(destination) {
        var payload = "M";
        var sensor = NODE_SENSOR_ID;
        var command = C_INTERNAL;
        var acknowledge = 0; // no ack
        var type = I_CONFIG;
        var td = encode(destination, sensor, command, acknowledge, type, payload);
        log.debug('MySensors:  sending -> ' + td.toString());
        this.gw.write(td);
    }
    /*
     sendRebootMessage(destination) {
     var sensor = NODE_SENSOR_ID;
     var command = C_INTERNAL;
     var acknowledge = 0; // no ack
     var type = I_REBOOT;
     var payload = "";
     var td = encode(destination, sensor, command, acknowledge, type, payload);
     log.info('MySensors: sending reboot request -> ' + td.toString());
     this.gw.write(td);
     }

     checkRebootRequest(destination) {
     try
     {
     var item=NodeCollection.findOne({
     'id': destination
     });
     if (item.reboot === 1)
     this.sendRebootMessage(destination);
     }
     catch(err)
     {
     log.error('MySensors: Error checking reboot request',err);
     }
     }

     saveRebootRequest(destination) {
     try
     {
     NodeCollection.update({
     'id': destination
     }, {
     $set: {
     'reboot': 1
     }
     });
     }
     catch(err)
     {
     log.error("MySensors: Error writing reboot request to database");
     }
     }
     */
    rfReceived(data) {
        if ((data != null) && (data != "")) {
            log.debug('MySensors: received <- ' + data);
            // decoding message
            var datas = data.toString().split(";");
            var sender = +datas[0];
            var sensor = +datas[1];
            var command = +datas[2];
            var ack = +datas[3];
            var type = +datas[4];
            var rawpayload = "";
            if (datas[5]) {
                rawpayload = datas[5].trim();
            }
            var payload;
            if (command == C_STREAM) {
                payload = [];
                for (var i = 0; i < rawpayload.length; i += 2)
                    payload.push(parseInt(rawpayload.substring(i, i + 2), 16));
            } else {
                payload = rawpayload;
            }
            // decision on appropriate response
            switch (command) {
                case C_PRESENTATION:
                    log.debug('MySensors: Presentation message for sensor:'+sensor+' of node:'+sender);
                    if (sensor == NODE_SENSOR_ID) this.saveProtocol(sender, payload);
                    this.saveSensor(sender, sensor, type);
                    break;
                case C_SET:
                    this.saveValue(sender, sensor, type, payload);
                    break;
                case C_REQ:
                    break;
                case C_INTERNAL:
                    switch (type) {
                        case I_BATTERY_LEVEL:
                            this.saveBatteryLevel(sender, payload);
                            break;
                        case I_TIME:
                            this.sendTime(sender, sensor);
                            break;
                        case I_VERSION:
                            break;
                        case I_ID_REQUEST:
                            this.sendNextAvailableSensorId();
                            break;
                        case I_ID_RESPONSE:
                            break;
                        case I_INCLUSION_MODE:
                            break;
                        case I_CONFIG:
                            this.sendConfig(sender);
                            break;
                        case I_PING:
                            break;
                        case I_PING_ACK:
                            break;
                        case I_LOG_MESSAGE:
                            break;
                        case I_CHILDREN:
                            break;
                        case I_SKETCH_NAME:
                            this.saveSketchName(sender, payload);
                            break;
                        case I_SKETCH_VERSION:
                            this.saveSketchVersion(sender, payload);
                            break;
                        case I_REBOOT:
                            break;
                    }
                    break;
                case C_STREAM:
                    /* // not used now
                     switch (type) {
                     case ST_FIRMWARE_CONFIG_REQUEST:
                     var fwtype = pullWord(payload, 0);
                     var fwversion = pullWord(payload, 2);
                     this.sendFirmwareConfigResponse(sender, fwtype, fwversion);
                     break;
                     case ST_FIRMWARE_CONFIG_RESPONSE:
                     break;
                     case ST_FIRMWARE_REQUEST:
                     var fwtype = pullWord(payload, 0);
                     var fwversion = pullWord(payload, 2);
                     var fwblock = pullWord(payload, 4);
                     this.sendFirmwareResponse(sender, fwtype, fwversion, fwblock);
                     break;
                     case ST_FIRMWARE_RESPONSE:
                     break;
                     case ST_SOUND:
                     break;
                     case ST_IMAGE:
                     break;
                     }*/
                    break;
            }
            //this.checkRebootRequest(sender);  // not used now
        }
    }

    appendData(str) {
        let pos = 0;
        while (str.charAt(pos) != '\n' && pos < str.length) {
            this.appendedString = this.appendedString + str.charAt(pos);
            pos++;
        }
        if (str.charAt(pos) == '\n') {
            this.rfReceived(this.appendedString.trim(),  this.gw);
            this.appendedString = "";
        }
        if (pos < str.length) {
            this.appendData(str.substr(pos + 1, str.length - pos - 1));
        }
    }

    openEthernetConnection(parameters) {
        if(!this.connected) {
            log.info('MySensors: Connecting to MySensors network (ethernet)');
            this.gw = net.Socket();
            this.gw.connect(parameters.gwPort, parameters.gwAddress);
            this.gw.setEncoding('ascii');
            this.gw.on('connect', () => {
                log.info('MySensors: connected to ethernet gateway at ' + parameters.gwAddress + ":" + parameters.gwPort);
                this.connected=true;
                if (!typeof parameters.onInit == 'undefined') parameters.onInit();

            }).on('data', (rd) => {
                Fiber(() => {
                    this.appendData(rd.toString());
                }).run();
            }).on('end', () => {
                log.info('MySensors: disconnected from gateway');
            }).on('error', (e) => {
                if (this.gw!=null) {
                    log.error('MySensors: connection error ' + e + '- trying to reconnect to ' + parameters.gwAddress + ':' + parameters.gwPort);
                    this.gw=null;
                    this.connected=false;
                }
            });
        }
    }

    openSerialConnection(parameters) {
        if(!this.connected) {
            log.info('MySensors: Connecting to MySensors network (serial)');
            var SerialPort = serialPort.SerialPort;
            this.gw = new SerialPort(parameters.gwSerialPort, {baudrate: parameters.gwBaud});

            this.gw.on('error', (e) => {
                log.error('MySensors: connection error ' + e);
                this.connected=false;
            });

            this.gw.on('open',() => {
                this.connected=true;
                log.info('MySensors: connected to serial gateway at ' + parameters.gwSerialPort);
                if (parameters.onInit !== undefined) parameters.onInit();
                if(this.gw!=null) this.gw.on('data', (rd) => {
                    Fiber(() =>{
                        this.appendData(rd.toString());
                    }).run();
                });
            });
        }
    }

    connectOverEthernet(parameters) {
        this.connectionWatchHandle=Meteor.setInterval(() => {
            this.openEthernetConnection(parameters);
        }, 30000);
        this.openEthernetConnection(parameters);
    }

    connectOverSerial(parameters) {
        this.connectionWatchHandle=Meteor.setInterval(() => {
            this.openSerialConnection(parameters);
        }, 30000);
        this.openSerialConnection(parameters);
    }

    constructor(driverInstanceDocument) {
        super(driverInstanceDocument);
        this.id=driverInstanceDocument._id;
        this.latestValues = {};
        this.connected=false;
        this.appendedString = "";
    }

    static getDriverID() {
        return 'My Sensors';
    }

    getSensorTypes() {
        return MySensorsSensorTypes;
    }

    getLatestValues() {
        return this.latestValues;
    }

    start(configuration,id) {
        this.id=id;
        if(configuration.gwType==='serial')
        {
            this.connectOverSerial( configuration.serial);
        }
        else
        {
            this.connectOverEthernet(configuration.ethernet);
        }
    }

    stop() {
        if(this.connectionWatchHandle!==undefined) Meteor.clearInterval(this.connectionWatchHandle);
    }

    getDeviceRecordForNode(d) {
        return {
            id : d.id,
            protocol : d.protocol,
            type : d.sketchName,
            revision : d.sketchVersion,
            driver :'My Sensors'
        };
    }

    getDevices() {

        var nodes=NodeCollection.find({driverInstance:this.id}).fetch();
        var result=[];
        for(var s in nodes)
        {
            var d=nodes[s];
            result.push(this.getDeviceRecordForNode(d));
        }
        return result;
    }

    getSensors() {

        var sensorTypes=this.getSensorTypes();
        var latestValues=this.getLatestValues();

        var devices=NodeCollection.find({'driverInstance':this.id}).fetch();

        var results=[];
        for(let i in devices) {
            let device=devices[i];
            log.debug('Processing device:',device);
            if(device.sensors===undefined) continue;

            for(let j=0; j<device.sensors.length; j++) {
                let sensor=device.sensors[j];
                let type=sensorTypes[sensor.type];
                let result={
                    driver : 'My Sensors',
                    deviceId:device.id,
                    sensorId: sensor.id,
                    //revision:device.sketchVersion,
                    //protocol:device.protocol,
                    //deviceType:device.sketchName
                };
                if(type===undefined) {
                    log.error('Sensor '+device.id+';'+sensor.id+' does not have type property defined');
                }
                else {
                    if(type.mappedToType!==undefined) result.type=type.mappedToType.id; else result.comment=type.comment;
                    /*let nodeValues=latestValues[device.id];
                     if(nodeValues!==undefined)
                     {
                     let sensorValue=nodeValues[sensor.id];
                     if(sensorValue!==undefined) {
                     result.timestamp=sensorValue.timestamp;
                     result.value=sensorValue.value;
                     }
                     }*/
                    results.push(result);
                }
            }
        }
        return results;
    }

    /*
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
     */

    performAction(deviceId,sensorId,variable,action,parameters)
    {
        //log.debug('my sensors: perform action: '+action+' on '+deviceId+';'+sensorId+';'+variable.name);
        var sensor = sensorId;
        var command = C_SET;
        var acknowledge = 0;
        var type;

        var payload = 0;

        if(action===SENSOR_ACTIONS.GET_VALUE)
        {
            command=C_REQ;
            type = MySensorsVariableTypeToNumber.get(variable.name);
        }

        if(action===SENSOR_ACTIONS.SWITCH_OFF)
        {
            payload=0;
            type = MySensorsVariableTypeToNumber.get(variable.name);
        }
        if(action===SENSOR_ACTIONS.SWITCH_ON)
        {
            payload=1;
            type = MySensorsVariableTypeToNumber.get(variable.name);
        }
        if(action===SENSOR_ACTIONS.SET_VALUE)
        {
            payload=parameters.value;
            type = MySensorsVariableTypeToNumber.get(variable.name);
        }

        if(type===undefined) {
            throw new Exception('Unknown action/variable requested:'+action+'/'+EJSON.stringify(variable));
        }
        var destination = deviceId;

        var td = encode(destination, sensor, command, acknowledge, type, payload);
        //log.debug('MySensors: sending req. for value -> ' + td.toString());
        if(this.gw!=null) this.gw.write(td);
    }

    removeDevice(id) {
        NodeCollection.remove(
            {
                id: parseInt(id),
                driverInstance:this.id
            });
    }

    static getUIManagementBaseRoute() {
        return 'manageMySensorsConnection';
    }

    static getIconPath() {
        return '/drivers/MySensorsLogo.png';
    }

    static getDescription() {
        return "MySensors Home Automation, see <a href='http://www.mysensors.org/'>http://www.mysensors.org/</a>";
    }

    /**
     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
     */
    static allowsMultipleInstances() {
        return true;
    }

}

Drivers.registerDriver(MySensors);


