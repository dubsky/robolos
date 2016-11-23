import ssdp from "peer-ssdp";


class HueEmulator extends AbstractDriver {

    /* Choose a Unique ID for your driver. Will be visible in UI. */
    static getDriverID() {
        return 'Philips HUE Emulator';
    }

    static getDescription() {
        return 'Makes the system mimic philips HUE bridge. Useful for integration with Amazon Echo or Google Home';
    }

    getSensorCommandStatus(command) {
        let sensorStatus=Sensors.getSensorStatusByID(command.id);
        let object= {
            "name": command.label,
            "uniqueid": command.uuid,
            "type": "Extended color light",
            "modelid": "LCT001",
            "manufacturername": "Philips",
            "swversion": "65003148",
            "state": {
                "on": sensorStatus.value ? true:false,
                "bri": 254,
                "hue": 15823,
                "sat": 88,
                "effect": "none",
                "ct": 313,
                "alert": "none",
                "colormode": "ct",
                "reachable": true,
                "xy": [0.4255, 0.3998]
            },
            "pointsymbol": {
                "1": "none",
                "2": "none",
                "3": "none",
                "4": "none",
                "5": "none",
                "6": "none",
                "7": "none",
                "8": "none"
            }
        };
        return object;
    }

    setupRESTApi(parameters) {
        let self=this;

        Router.map(function() {
            this.route('set-state', {
                path: '/api/:label/lights/:id/:state',
                where: 'server',
                action: function () {
                    //log.debug('############################## getting control ###############');
                    //console.log(this.request.method+' '+this.params.label+' '+this.params.id+' '+ this.params.state+'  '+this.request.url);
                    let body = this.request.body;
                    let data=EJSON.parse(Object.keys(body)[0]);
                    if(this.request.method==='PUT') {
                        let headers = {
                            'Content-type': 'application/json'
                        };
                        let response='[{"success": {"/lights/'+this.params.id+'/state/on":'+data.on+'}}]' ;
                        let command=CommandRegistryInstance.getCommandByUUID(this.params.id);
                        CommandRegistryInstance.execute(command,data.on ? 1 : 0);
                        this.response.writeHead(200,"OK", headers);
                        this.response.end(response);
                    }
                    else {
                        response.statusCode = 404;
                        response.end();
                    }
                }
            });
        });

        Router.map(function() {
            this.route('get-status', {
                path: '/api/:label/lights/:id',
                where: 'server',
                action: function () {
                    //log.debug('############################## getting get ###############');
                    //console.log(this.request.method+' '+this.params.label+' '+this.params.id+' '+ '  '+this.request.url);
                    if(this.request.method==='GET') {

                        let headers = {
                            'Content-type': 'application/json'
                        };

                        let command=CommandRegistryInstance.getCommandByUUID(this.params.id);
                        let data=self.getSensorCommandStatus(command);
                        this.response.writeHead(200, headers);
                        this.response.end(EJSON.stringify(data));
                    }
                    else {
                        response.statusCode = 404;
                        response.end();
                    }
                }
            });
        });

        let getLightInfo=function () {
            //log.debug('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! getting command list !!!!!!!!!!!!!!!!!!!');
            //console.log(this.request.method+' '+this.params.label+' '+this.params.type+' '+this.request.url);

            if(this.request.method==='GET') {
                var headers = {
                    'Content-type': 'application/json',
                };
                this.response.writeHead(200, headers);

                let commands=CommandRegistryInstance.getCommands();
                let results={};
                for(let name in commands) {
                    let command=commands[name];
                    if(command.provider.getType()===CommandProviderTypes.SENSOR)
                    {
                        results[command.uuid]=self.getSensorCommandStatus(command);
                    }
                }
                let result={
                    "lights": results
                };
                //console.log(EJSON.stringify(result));
                this.response.end(EJSON.stringify(result));
            }
        };

        Router.map(function() {
            this.route('hue-control-1', {
                path: '/api/:label/:type',
                where: 'server',
                action: getLightInfo
            });
        });

        Router.map(function() {
            this.route('hue-control-2', {
                path: '/api/:label',
                where: 'server',
                action: getLightInfo
            });
        });


        Router.map(function() {
            this.route('upnp_setup.xml', {
                path: '/upnp/hue-bridge/setup.xml',
                where: 'server',
                action: function () {
                    var headers = {
                        'Content-type': 'application/xml',
                    };
                    this.response.writeHead(200, headers);
                    this.response.end(SETUP_XML);
                }
            });
        });
    }

    /** Called when the driver is started and should start reporting sensor values and listening for actor changes.
     *  All sensors should be discoverd during this stage so that the system can safely start. */
    start(parameters) {
        log.info('HUE Emulator: Starting');
        this.setupRESTApi();
        let peer = ssdp.createPeer();

        peer.on("ready",function(){
            // handle ready event
            log.info("HUE Emulator: UPNP server listening on port 1900.");
            //	// send ssdp:alive messages every 1s
            //	// {{networkInterfaceAddress}} will be replaced before
            //	// sending the SSDP message with the actual IP Address of the corresponding
            //	// Network interface. This is helpful for example in UPnP for LOCATION value
            //	interval = setInterval(function(){
            //		peer.alive({
            //			NT: "urn:schemas-upnp-org:device:basic:1",
            //			SERVER: "node.js/0.10.28 UPnP/1.1",
            //			ST: "urn:schemas-upnp-org:device:basic:1",
            //			USN: "uuid:f40c2981-7329-40b7-8b04-27f187aecfb5",
            //			LOCATION: "http://{{networkInterfaceAddress}}:8080/upnp/amazon-ha-bridge/setup.xml",
            //		});
            //	}, 1000);
            //	// shutdown peer after 10 s and send a ssdp:byebye message before
            //	setTimeout(function(){
            //		clearInterval(interval);
            //		// Close peer. After peer is closed the `close` event will be emitted.
            //		peer.close();
            //	}, 10000);
        });

        // handle SSDP NOTIFY messages.
        // param headers is JSON object containing the headers of the SSDP NOTIFY message as key-value-pair.
        // param address is the socket address of the sender
        peer.on("notify",function(headers, address){
            // handle notify event
            //console.log("NOTIFY:",headers);
        });

        // handle SSDP M-SEARCH messages.
        // param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.
        // param address is the socket address of the sender
        peer.on("search",function(headers, address){
            // handle search request
            // reply to search request
            // {{networkInterfaceAddress}} will be replaced with the actual IP Address of the corresponding
            // sending the SSDP message with the actual IP Address of the corresponding
            // Network interface.
            //log.debug("HUE Emulator: SEARCH:",headers,address);
            let url=getHueBaseUrl();
            if (headers.ST && headers.MAN=='"ssdp:discover"') {
                peer.reply({
                    NT: "urn:schemas-upnp-org:device:basic:1",
                    SERVER: "node.js/0.10.28 UPnP/1.1",
                    ST: "urn:schemas-upnp-org:device:basic:1",
                    USN: "uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**",
                    LOCATION: url+"upnp/hue-bridge/setup.xml",
                }, address);
            }
        });

        // handle SSDP HTTP 200 OK messages.
        // param headers is JSON object containing the headers of the SSDP HTTP 200 OK  message as key-value-pair.
        // param address is the socket address of the sender
        peer.on("found",function(headers, address){
            // handle found event
            log.debug("HUE Emulator: FOUND:",headers);
        });

        // handle peer close event. This event will be emitted after `peer.close()` is called.
        peer.on("close",function(){
            // handle close event
            log.debug("HUE Emulator: CLOSING.");
        });

        // Start peer. Afer peer is ready the `ready` event will be emitted.
        peer.start();
        log.info('HUE Emulator: Driver Started');
    }

    stop(parameters) {
        clearInterval(this.handle);
        log.info('Hue Emulator: Stopped');
    }

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
                id:77,
                keywords: ['Command Handler'],
                revision: '1.0',
                protocol: '1.0.0',
                type:'Command Controller',
                comment: 'Philips HUE Emulator'
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
        //this.onEventListener.onEvent(77,2,this.buildVariableObject(variable,this.demoRelayValue));
    }

    /**
     * @returns {string} meteor template name to create/update driver instance.
     */
    static getUIManagementBaseRoute() {
        return 'manageHueEmulatorConnection';
    }

    /**
     * @returns {string} path within the 'public' directory to the icon representing the driver. My return 'undefined' for an ugly icon
     */
    static getIconPath() {
        return undefined;
    }

    /**
     * @returns {boolean} true when the user is allow to create multiple instances of the driver in a single system
     */
    static allowsMultipleInstances() {
        return false;
    }

}

Drivers.registerDriver(HueEmulator);
