import fs from 'fs';
import readline from 'readline';
import dgram from 'dgram';
import mongo from 'mongodb';


const GridStore=mongo.GridStore;


var REGISTER_SPACES = {
    'X': 0,
    'Y': 1,
    'S': 2,
    'R': 3
};


var SD1 = 0x10;
var SD2 = 0x68;
var SD4 = 0xdc;
var ED = 0x16;
var SAC = 0xe5;

var incomingMessageHandler=[];

class CFoxInelsDriver extends AbstractDriver {

    static getDriverID() {
        return 'INELS2/CFox';
    }

    static getDescription() {
        return "Tecomat INELS2/CFox Home Automation, see <a href='http://www.tecomat.com'>http://www.tecomat.com</a>";
    }

    // this driver acts as a single device
    getDeviceID() {
        return 0;
    }

    checksum(data, start, end) {
        var sum = 0;
        for (var i = start; i < end; i++) {
            var c = data[i];
            sum += c;
        }
        return sum % 256;
    }

    constructor() {
        super();
        this.packet=0;
        this.drivenSensors={};
        this.addresses={};
        this.sensorsInUpdate={};
        this.DASA = Math.floor(Math.random()*126+1); //0x00ee;

    }

    printBuffer(data, msg) {
        var s = '';
        for (var i = 0; i < data.length; i++) {
            var d = data[i].toString(16);
            s += d;
            if (i === 5) s += ' - ';
            else if (i + 1 < data.length) s += ',';
        }
        log.debug('buffer:' + msg + ':' + s);
    }

    send(message) {
        var m = new Buffer(message.length + 6);
        m.writeUInt16BE(this.packet % 65536, 0);
        this.packet += 1;
        m.writeUInt8(0x02, 2);
        m.writeUInt8(0x00, 3);
        m.writeUInt16BE(message.length, 4);
        message.copy(m, 6);

        //this.printBuffer(m,'sending');

        this.client.send(m, 0,
            m.length, 61682,
            this.ip, function (err, bytes) {
                if (err) {
                    throw err;
                }
            }
        );
    }

    setMessageHandler(handler) {
        if(incomingMessageHandler.length>8) incomingMessageHandler=[];
        var currentPacket=this.packet % 65536;
        incomingMessageHandler[currentPacket] = function(response) {
            delete incomingMessageHandler[currentPacket];
            handler(response);
        }
    }

    resetMessageHandler() {
    }

    writeb(register, index, bit, value, whenDone) {
        var message = new Buffer(14);
        message.writeUInt8(SD2, 0);
        message.writeUInt16BE(0x0808, 1);
        message.writeUInt8(SD2, 3);
        message.writeUInt16BE(this.DASA, 4);
        message.writeUInt8(0x63, 6);
        message.writeUInt8(0x10, 7);
        message.writeUInt8(register, 8);
        message.writeUInt16LE(index, 9);
        if (value) {
            message.writeUInt8(128 + bit, 11);
        }
        else {
            message.writeUInt8(bit, 11);
        }


        message.writeUInt8(this.checksum(message, 4, 12), 12);
        message.writeUInt8(ED, 13);
        var self = this;
        this.setMessageHandler(function (response) {
            log.debug('received:', response);
            if (response.length > 6 && response[6] == SAC) {
                log.debug('ok');
            }
            else {
                log.debug('writeb() failed');
            }

            self.resetMessageHandler();
            if ((typeof whenDone) !== 'undefined') whenDone();
        });

        this.send(message);
    }


    writeFloat(register, index, value, whenDone) {
        var message = new Buffer(18);
        message.writeUInt8(SD2, 0);
        message.writeUInt8(0x08 + 4, 1);
        message.writeUInt8(0x08 + 4, 2);
        message.writeUInt8(SD2, 3);
        message.writeUInt16BE(this.DASA, 4);


        message.writeUInt8(0x63, 6);
        message.writeUInt8(0x0C, 7);
        message.writeUInt8(register, 8);
        message.writeUInt16LE(index, 9);
        message.writeUInt8(4, 11);

        message.writeFloatLE(value, 12);

        message.writeUInt8(this.checksum(message, 4, 16), 16);
        message.writeUInt8(ED, 17);
        var self=this;

        this.setMessageHandler(function (response) {
            //log.debug('received:', response);
            if (response.length > 6 && response[6] == SAC) {
                //log.debug('ok');
            }
            else {
                log.error('writen() failed');
            }

            self.resetMessageHandler();
            if ((typeof whenDone) !== 'undefined') whenDone();
        });

        this.send(message);
    }


    readen(register, index, whenDone) {
        var message = new Buffer(14);
        message.writeUInt8(SD2, 0);
        message.writeUInt16BE(0x0808, 1);
        message.writeUInt8(SD2, 3);
        message.writeUInt16BE(this.DASA, 4);
        message.writeUInt8(0x6C, 6);
        message.writeUInt8(0x0B, 7);
        message.writeUInt8(register, 8);
        message.writeUInt16LE(index, 9);
        message.writeUInt8(4, 11);
        message.writeUInt8(this.checksum(message, 4, 12), 12);
        message.writeUInt8(ED, 13);
        log.debug(message);
        this.setMessageHandler(function (response) {
            log.debug('received:', response);
            if (response.length > 6 + 8) {

                log.debug(response.readFloatLE(6 + 8 - 1));
                log.debug('ok');
            }
            else {
                log.error('readn() failed');
            }

            self.resetMessageHandler();
            if ((typeof whenDone) !== 'undefined') whenDone();
        });

        this.send(message);
    }

    getsw() {
        var message = new Buffer(10);
        message.writeUInt8(SD2, 0);
        message.writeUInt16BE(0x0404, 1);
        message.writeUInt8(SD2, 3);
        message.writeUInt16BE(this.DASA, 4);
        message.writeUInt8('l'.charCodeAt(0), 6);
        message.writeUInt8(0x0A, 7);
        message.writeUInt8(this.checksum(message, 4, 8), 8);
        message.writeUInt8(ED, 9);

        var self = this;
        this.setMessageHandler(function (response) {
                //log.debug('received:',response);
                if (response.length > 5) {
                    var swh = response[6 + 9];
                    var status = swh & 128 ? 'RUN' : 'HALT';
                    status += ' ';
                    status += swh & 64 ? 'BLO' : 'NOBLO';
                    status += ' ';
                    status += swh & 8 ? 'ERS' : 'NOERS';
                    status += ' ';
                    status += swh & 1 ? 'ERH' : 'NOERH';
                    log.info('Status:' + status);
                }
                else {
                    log.error('getsw() failed');
                }
                self.resetMessageHandler();
                self.startDataHarvesting();
                //self.readen(1, 16, function() {});
            }
        );
        this.send(message);
    }

    ident() {
        var message = new Buffer(6);
        message.writeUInt8(SD1, 0);
        message.writeUInt16BE(this.DASA, 1);
        message.writeUInt8('n'.charCodeAt(0), 3);
        message.writeUInt8(this.checksum(message, 1, 4), 4);
        message.writeUInt8(ED, 5);
        var self = this;
        this.setMessageHandler(function (response) {
            //self.printBuffer(response,'ident response');

            if (response.length > 6 + 8 + 4) {
                if (response[6] !== SD2) throw new Exception('No data received');
                var lis = response[6 + 8 - 1];
                var lip = response[6 + 8 - 1 + 1];
                var lst = response[6 + 8 - 1 + 2];
                var lsw = response[6 + 8 - 1 + 3];
                var id = response.toString('UTF-8', 6 + 8 + 4 - 1, 6 + 8 - 1 + 4 + lis);
                var version = response.toString('UTF-8', 6 + 8 + 4 - 1 + lis + lip + lst, 6 + 8 - 1 + 4 + lis + lip + lst + lsw);
                this.unit = id;
                this.version = version;
                log.info('INELS/Tecomat Unit:' + id + ' Version: ' + version);
            }
            else {
                log.error('ident() failed');
            }

            self.resetMessageHandler();
            self.getsw();
        });

        this.send(message);
    }


    connect() {
        var message = new Buffer(6);
        message.writeUInt8(SD1, 0);
        message.writeUInt16BE(this.DASA, 1);
        message.writeUInt8(0x69, 3);
        message.writeUInt8(this.checksum(message, 1, 4), 4);
        message.writeUInt8(ED, 5);
        var self = this;
        this.setMessageHandler(function (response) {
            //self.printBuffer(response,'connect response');
            if (response.length > 4 && response[3] == 0) {
                log.info('PLC Connected.');
            }

            self.resetMessageHandler();
            self.ident();
        });
        this.send(message);
    }


    getAddress(space, address) {
        return address + (REGISTER_SPACES[space] << 16);
    }

    mergeSensorComments(sensor) {
        let comments=this.sensorComments[sensor.sensorId];
        if(comments!==undefined) {
            sensor.keywords=comments.keywords;
            sensor.name=comments.name;
            sensor.deviceId=comments.deviceId;
        }
    }

    analyzePubLine(line) {
        var l = line.trim().split(' ');
        var name = l[0];
        var registerSpace = l[1];
        var type = l[2]
        var index = parseInt(l[3]);
        var address = this.getAddress(registerSpace, index);

        if (name.startsWith('state_')) name = name.substring('state_'.length);
        if (type === 'B' && l[5] === 'BOOL') {
            if (l[4].charAt(0) === '.') {
                var bit = l[4].substring(1);
                //log.debug(l[0]+' '+type+' '+registerSpace+' '+address+' '+bit);
                // binary inputs
                if (registerSpace == 'X') {
                    var sensor = {
                        bit: parseInt(bit),
                        registerSpace: REGISTER_SPACES[registerSpace],
                        index: index,
                        type: SensorTypes.BINARY_INPUT.id,
                        deviceId: this.getDeviceID(),
                        sensorId: name,
                        timestamp: new Date().getTime(),
                        comment: 'Generic Binary Input',
                        driver: CFoxInelsDriver.getDriverID(),
                        deviceType: 'Generic Binary Input'
                    };
                    this.mergeSensorComments(sensor);
                    this.drivenSensors[name] = sensor;
                    var a = this.addresses[address];
                    if ((typeof a) === 'undefined') {
                        this.addresses[address] = a = [];
                    }
                    a.push(sensor);
                }
                // binary outputs
                else if (registerSpace == 'Y') {
                    if (name.endsWith('_ON') || name.endsWith('_OFF') || name.endsWith('_TRIG')) return;
                    var sensor = {
                        bit: parseInt(bit),
                        registerSpace: REGISTER_SPACES[registerSpace],
                        index: index,
                        type: SensorTypes.BINARY_OUTPUT.id,
                        deviceId: this.getDeviceID(),
                        sensorId: name,
                        value: 1,
                        timestamp: new Date().getTime(),
                        comment: 'Generic Binary Output',
                        driver: CFoxInelsDriver.getDriverID(),
                        deviceType: 'Generic Binary Output'
                    };
                    this.mergeSensorComments(sensor);
                    this.drivenSensors[name] = sensor;
                    var a = this.addresses[address];
                    if ((typeof a) === 'undefined') {
                        this.addresses[address] = a = [];
                    }
                    else
                        for (var i = 0; i < a.length; i++) {
                            if (a[i].bit === sensor.bit) {
                                address += 1;
                                sensor.index++;
                                //log.debug("Fixing bug in data export from FoxTool - wrong address for units with more than 8 outputs for:"+name+" in conflict with "+a[i].sensorId+" new address estimate:"+address);
                                a = this.addresses[address];
                                if ((typeof a) === 'undefined') {
                                    this.addresses[address] = a = [];
                                }
                                break;
                            }

                        }
                    a.push(sensor);
                }
            }
            else {
                log.info('inconsistent definition:' + line);
            }
        }
        else {
            if (type === 'F') {
                if (registerSpace == 'X') {
                    var sensor = {
                        registerSpace: REGISTER_SPACES[registerSpace],
                        index: index,
                        type: SensorTypes.S_TEMP.id,
                        deviceId: this.getDeviceID(),
                        sensorId: name,
                        timestamp: new Date().getTime(),
                        comment: 'Thermometer',
                        driver: CFoxInelsDriver.getDriverID(),
                        deviceType: 'Thermometer'
                    };
                    this.mergeSensorComments(sensor);
                    this.drivenSensors[name] = sensor;
                    if (typeof this.addresses[address] !== 'undefined') throw 'Unexpected mismatch in input data at address:' + index;
                    if (this.addresses < 0) throw 'Inconsistent data';
                    this.addresses[address] = sensor;
                    this.addresses[address + 1] = -1;
                    this.addresses[address + 2] = -2;
                    this.addresses[address + 3] = -3;
                }
                else if (registerSpace == 'R') {
                    var sensor = {
                        registerSpace: REGISTER_SPACES[registerSpace],
                        index: index,
                        type: SensorTypes.S_ANALOG_OUTPUT_0_100.id,
                        deviceId: this.getDeviceID(),
                        sensorId: name,
                        timestamp: new Date().getTime(),
                        comment: 'Generic Analog Output',
                        driver: CFoxInelsDriver.getDriverID(),
                        deviceType: 'Generic Analog Output'
                    };
                    this.mergeSensorComments(sensor);
                    this.drivenSensors[name] = sensor;
                    if (typeof this.addresses[address] !== 'undefined') throw 'Unexpected mismatch in input data at address:' + index;
                    if (this.addresses < 0) throw 'Inconsistent data';
                    this.addresses[address] = sensor;
                    this.addresses[address + 1] = -1;
                    this.addresses[address + 2] = -2;
                    this.addresses[address + 3] = -3;
                }
            }
        }
    }

    getRegisterSpaceForAddress(address) {
        return address >> 16;
    }

    getSensorsForAddress(address) {
        return this.addresses[address];
    }

    initializeLookupTables() {
        var indexes = [];
        var i = 0;

        for (var a in this.addresses) {
            indexes[i++] = parseInt(a);
        }

        if (indexes.length === 0) {
            this.dataRequests = [];
            return;
        }
        indexes.sort(function(a, b){return a-b});
        var request = [];
        var sensorMap = [];
        var requests = [{request: request, sensorMap: sensorMap}];
        var limitPerRequest = 8;
        var entriesInRequest = 0;
        var previousIndex = null;
        var blockStart = indexes[0];
        var responseDataIndex = 0;

        for (var j = 0; j < indexes.length; j++) {
            var index = indexes[j];
            var sensors = this.getSensorsForAddress(index);
            //log.debug('index:'+index+' prev:'+previousIndex+' '+((index-1))+'  '+((index-1)!=previousIndex));
            var isLastIndex = (j == indexes.length - 1);
            if ((previousIndex !== null && ((index - 1) != previousIndex)) || isLastIndex) {
                request.push(this.getRegisterSpaceForAddress(blockStart));
                request.push(blockStart & 255);
                request.push((blockStart & 65535) >> 8);
                var length = previousIndex - blockStart + 1;
                if (isLastIndex) {
                    if (((index - 1) != previousIndex)) {
                        // finish the block
                        request.push(length);
                        // create block for the last byte
                        request.push(this.getRegisterSpaceForAddress(index));
                        request.push(index & 255);
                        request.push((index & 65535) >> 8);
                        request.push(1);
                    }
                    else {
                        // enlarge the last block with an additional byte
                        request.push(length + 1);
                    }
                }
                else {
                    request.push(length);
                }
                blockStart = index;

                if (entriesInRequest > limitPerRequest && ((typeof sensors) !== 'number') && (!isLastIndex)) {
                    request = [];
                    sensorMap = [];
                    requests.push({request: request, sensorMap: sensorMap});
                    responseDataIndex = 0;
                    entriesInRequest = 0;
                    //previousIndex=null;
                }
                entriesInRequest++;
            }
            sensorMap[responseDataIndex++] = sensors;
            previousIndex = index;
        }
        this.dataRequests = requests;
    }

    readData(index) {
        var self = this;

        if (index === 0) self.startOfRead = new Date().getTime();

        var whenDone = function () {
            if (self.dataRequests.length > index + 1) self.readData(index + 1); else this.readTime = new Date().getTime() - self.startOfRead;
        };

        var requestData = this.dataRequests[index].request;
        //if (index==1) log.debug(requestData);
        if (requestData.length === 0) return;

        var message = new Buffer(10 + requestData.length);
        message.writeUInt8(SD2, 0);
        var LE = 4 + 4 * requestData.length / 4;
        message.writeUInt8(LE, 1);
        message.writeUInt8(LE, 2);
        message.writeUInt8(SD2, 3);
        message.writeUInt16BE(this.DASA, 4);
        message.writeUInt8(0x6C, 6);
        message.writeUInt8(0x0B, 7);

        var j = 8;
        for (var i = 0; i < requestData.length; i++) {
            message.writeUInt8(requestData[i], j++);
        }

        message.writeUInt8(this.checksum(message, 4, j), j);
        message.writeUInt8(ED, j + 1);

        this.setMessageHandler(function (response) {
            //self.printBuffer(response,'received');
            var previousValuesAvailable = (typeof self.dataRequests[index].lastRequestResponse) !== 'undefined';
            var previousValues = self.dataRequests[index].lastRequestResponse;

            var map = self.dataRequests[index].sensorMap;

            if (response.length === (6 + 7 + map.length + 2)) {
                //log.debug("input:"+map);
                for (var i = 0; i < map.length;) {

                    var value = response[6 + 7 + i];

                    var previousValue = ((typeof previousValues) === 'undefined') ? null : previousValues[6 + 7 + i];

                    if (previousValuesAvailable && previousValue === value) {
                        i += 1;
                        continue;
                    }

                    var sensor = map[i];

                    function processObject(indexOfChange) {
                        var sensor = map[indexOfChange];
                        if (typeof sensor === 'undefined') throw 'Unexpected mismatch in input data at address:' + indexOfChange + ' / ' + sensor + ' / ' + i+' / '+index;

                        let variable;
                        value = response.readFloatLE(indexOfChange + 6 + 7);
                        sensor.value = value;

                        switch (sensor.type) {
                            case SensorTypes.S_TEMP.id :
                                variable=self.buildVariableObject(SensorVariables.V_TEMP,value);
                                break;
                            case SensorTypes.S_ANALOG_OUTPUT_0_100.id :
                                variable=self.buildVariableObject(SensorVariables.V_PERCENTAGE,value);
                                break;
                            case SensorTypes.S_ANALOG_OUTPUT.id :
                                // log.debug('fire:'+value+ ' i:'+indexOfChange+' sensor:'+sensor.sensorId);
                                variable=self.buildVariableObject(SensorVariables.V_VAR1,value);
                                break;
                            default:
                                log.error('assertion failed: unknown sensor type to handle:' + sensor.type + ' of ' + sensor,sensor);
                                return indexOfChange + 1;
                        }
                        self.onEventListener.onEvent(sensor.deviceId, sensor.sensorId, variable);
                        return indexOfChange + 4;
                    }

                    if ((typeof sensor) === 'number') {
                        var indexOfChange = i + sensor;
                        log.error('Unexpected mismatch in input data at address:' + indexOfChange + ' / ' + sensor + ' / ' + i);
                        i = processObject(indexOfChange);
                    }
                    else if (Object.prototype.toString.call(sensor) === '[object Array]') {
                        value = response.readUInt8(i + 6 + 7);
                        for (var j = 0; j < sensor.length; j++) {
                            var bitSensor = sensor[j];
                            var bit = 1 << bitSensor.bit;
                            if (previousValue !== null && ((value & bit) === (previousValue & bit))) continue;
                            switch (sensor[j].type) {
                                case SensorTypes.BINARY_OUTPUT.id :
                                case SensorTypes.BINARY_INPUT.id :
                                    //log.debug('fire');
                                    var val = (value & bit) ? 1 : 0;
                                    //if(sensor[j].sensorId=='WSB2_20_Pracovna_2NP_Pracovna_Svetlo_2np_tl_DOWN_wsb2_20_')
                                    // log.debug('value:'+value+' bit:'+bit+' index:'+index);
                                    bitSensor.value = val;
                                    self.onEventListener.onEvent(bitSensor.deviceId, bitSensor.sensorId, self.buildVariableObject(SensorVariables.V_STATUS,val));
                                    break;
                            }
                        }
                        i++;
                    }
                    else if ((typeof sensor) === 'object') {
                        i = processObject(i);
                    }
                    else {
                        log.error('assertion failed: invalid lookup tables');
                        i++;
                    }
                }

                self.dataRequests[index].lastRequestResponse = response;
            }
            else {
                log.error('readn() failed, got:' + response.length + ' instead of:' + (6 + 7 + map.length + 2));
            }

            self.resetMessageHandler();
            whenDone();
        });
        this.send(message);
    }

    startDataHarvesting() {
        var self = this;
        log.info('Scheduling data harvesting thread');
        self.readData(0);

        setInterval(function () {
            //log.debug('Data Poll Started');
            self.readData(0);
        }, 1000);
    }


    analyzeExpLine(line,regexp) {
        let tokens=line.split(' ');
        let id=tokens[1];
        if(tokens.length>4 && tokens[2]==='AT' && (tokens[4]==='BOOL;' || tokens[4]==='REAL;')) {
            try {
                let results=line.match(regexp);
                if(results.length>1) {
                    let comment=results[1];
                    let commentTokens=comment.split('~');
                    let deviceData=commentTokens[0].trim();
                    let t=deviceData.trim().split(' ');
                    let deviceType=t[0];
                    let deviceName=deviceData.substring(deviceType.length).trim();
                    let keywords=[];
                    let description=undefined;
                    if(commentTokens.length>1) {
                        let s=commentTokens[1];
                        let descriptionSplit=s.split('\(');
                        description=descriptionSplit[0].trim();
                        if(descriptionSplit.length>1)
                        {
                            let i=descriptionSplit[1].indexOf(')');
                            if(i>0) {
                                let rawKeywords=descriptionSplit[1].substring(0,i).trim().split(/[ |,]/);
                                for(let j in rawKeywords) {
                                    if(rawKeywords[j]!=='') {
                                        let k=rawKeywords[j].replace('.',' ').trim();
                                        k=k.toLowerCase();
                                        if(k==='bin') k='binary';
                                        if(k==='tl') k='button';
                                        if(k==='therm') continue;
                                        keywords[keywords.length]=k;
                                    }
                                }
                            }
                        }
                    }
                    let deviceId=deviceType.replace('-','_')+'_'+deviceName.replace(' ','_').replace('-','_');
                    let device=this.devices[deviceId];
                    if(device===undefined) {
                        device={
                            id: deviceId,
                            type:deviceType,
                            name:deviceName,
                            driver: CFoxInelsDriver.getDriverID(),
                            revision: this.version,
                            protocol: 'epsnet'
                        };
                        this.devices[deviceId]=device;
                    }

                    this.sensorComments[id]={
                        keywords: keywords,
                        name: description,
                        deviceId:deviceId
                    };
                }
            }
            catch(e) {
                log.error('error analyzing line:'+line,e);
                console.log('unexpected error',e);
            }

        }
    }


    readKeywordsFromExp(exportExp, whenDone) {
        this.sensorComments={};
        if(Collections.Uploads.uploadToFilesystem) {
            let raw=fs.createReadStream(exportExp);
            raw.on('error', function(err) {
                log.error('error reading file:'+exportExp,err);
                whenDone();
            });
            var rd = readline.createInterface({
                input: raw,
                output: process.stdout,
                terminal: false
            });

            var self = this;
            rd.on('line', function (line) {
                var r=/\(\*(.*)\*\)/;
                self.analyzeExpLine(line,r);
            });
            rd.on('close', function () {
                whenDone();
            });
        }
        else {
            let gridStore;
            let name='cfox/cfox.exp';
            gridStore = new GridStore(Collections.Uploads.rawDatabase(), name, 'r');
            GridStore.exist(Collections.Uploads.rawDatabase(), name, (err, result) => {
                if(!result) {
                    log.error('uploads/cfox.exp is missing');
                    whenDone();
                    return;
                }
                gridStore.open(()=> {
                    gridStore.readlines('\n',(err,lines) => {
                        var r=/\(\*(.*)\*\)/;
                        for(let line of lines) this.analyzeExpLine(line,r);
                        whenDone();
                    });
                });
            });
        }
    }

    readConfiguration(exportPub, whenDone) {
        if(Collections.Uploads.uploadToFilesystem) {
            let raw=fs.createReadStream(exportPub);
            raw.on('error', function(err) {
                log.error('error reading file:'+exportPub,err);
                return;
            });
            var rd = readline.createInterface({
                input: raw,
                output: process.stdout,
                terminal: false
            });

            var self = this;
            rd.on('line', function (line) {
                self.analyzePubLine(line);
            });

            rd.on('close', function () {
                whenDone();
            });
        }
        else {
            let gridStore;
            let name='cfox/cfox.pub';
            gridStore = new GridStore(Collections.Uploads.rawDatabase(), name, 'r');
            GridStore.exist(Collections.Uploads.rawDatabase(), name, (err, result) => {
                if(!result) {
                    log.error('uploads/cfox.pub is missing');
                    return;
                }
                gridStore.open(()=> {
                    gridStore.readlines('\n',(err,lines) => {
                        var r=/\(\*(.*)\*\)/;
                        for(let line of lines) this.analyzePubLine(line,r);
                        whenDone();
                    });
                });
            });
        }
    }


    start(configuration) {

        this.ip = configuration.address;
        var self = this;

        this.devices={'Central Unit': {
            id: 0,
            revision: this.version,
            protocol: 'epsnet',
            type: this.unit,
            driver: CFoxInelsDriver.getDriverID()
        }};

        var e=Meteor.wrapAsync(this.readKeywordsFromExp,this);
        e(getUploadRoot()+'/cfox/cfox.exp');

        var f=Meteor.wrapAsync(this.readConfiguration,this);
        f(getUploadRoot()+'/cfox/cfox.pub');

        self.initializeLookupTables();

        var client = dgram.createSocket("udp4", function (result, err) {
            try {
                var handler=incomingMessageHandler[result.readUInt16BE(0)];
                if((typeof handler)!=='undefined') handler(result);
            }
            catch(e)
            {
                log.error('Uexpected error in CFox communication',e);
            }
        });

        client.on('error', function (e) {
            log.error('Error creating socket', e);
        });

        client.on('listening', function (e) {
            log.info('Listening for incoming messages...');
        });

        client.bind();
        self.client = client;
        self.connect();
    }


    getSensors() {
        var array = [];
        var i = 0;
        for (var key in this.drivenSensors) {
            array[i++] = this.drivenSensors[key];
        }
        return array;
    }

    getDevices() {
        var array = [];
        var i = 0;
        for (var key in this.devices) {
            array[i++] = this.devices[key];
        }
        return array;
    }

    /**
     * Called when user tries to remove a device
     * @param id device id
     */
    removeDevice(id) {
    }

    /**
     * Called when actor status change is requested
     * @param deviceId device id
     * @param sensorId sensor id
     * @param action @see SENSOR_ACTIONS
     * @param parameters @see SENSOR_ACTIONS
     */
    performAction(deviceId, sensorId, variable, action, parameters) {
        var sensor = this.drivenSensors[sensorId];
        if (action === SENSOR_ACTIONS.SWITCH_OFF) {
            if ((typeof sensor.bit) === 'undefined') return;
            this.writeb(sensor.registerSpace, sensor.index, sensor.bit, false, function () {});
        }
        if (action === SENSOR_ACTIONS.SWITCH_ON) {
            //log.debug('perform action: ' + sensor.registerSpace + " " + sensor.index);
            if ((typeof sensor.bit) === 'undefined') return;
            this.writeb(sensor.registerSpace, sensor.index, sensor.bit, true, function () {});
        }
        if (action === SENSOR_ACTIONS.SET_VALUE) {

            var updateRecord=this.sensorsInUpdate[sensorId];

            // do not send requests on change to the same sensor in parallel

            if(updateRecord!==undefined) {
                log.debug('just changing/adding  update record to '+parameters);
                if (new Date().getTime()-updateRecord.age > 1000) {
                    log.debug(' but it was too old !');
                    delete this.sensorsInUpdate[sensorId];
                    updateRecord=undefined;
                }
                else {
                    updateRecord[0]={space: sensor.registerSpace, index: sensor.index, params: parameters };
                }
            }

            if(updateRecord===undefined) {
                var updateRecord=[];
                this.sensorsInUpdate[sensorId]=updateRecord;
                updateRecord.age=new Date().getTime();
                var self=this;
                var onFinish=function () {
                    var sensorUpdateRecord=self.sensorsInUpdate[sensorId];

                    if (sensorUpdateRecord!==undefined)
                    {
                        sensorUpdateRecord.age=new Date().getTime();
                        if(sensorUpdateRecord[0]===undefined) {
                            delete self.sensorsInUpdate[sensorId];
                        }
                        else
                        {
                            clearTimeout(updateRecord.timeoutHandle);
                            var r=sensorUpdateRecord[0];
                            delete sensorUpdateRecord[0];
                            self.writeFloat(r.space,r.index,r.params,onFinish);
                            updateRecord.timeoutHandle=setTimeout(onFinish,200);
                        }
                    }
                };

                this.writeFloat(sensor.registerSpace, sensor.index, parameters, onFinish);
                updateRecord.timeoutHandle=setTimeout(onFinish,200);
            }
        }

    }

    static getIconPath() {
        return '/drivers/TecoLogo.png';
    }

    static getUIManagementBaseRoute() {
        return 'manageInelsCFoxConnection';
    }

    static allowsMultipleInstances() {
        return false;
    }
}


Drivers.registerDriver(CFoxInelsDriver);
