if(Meteor.isServer) {

    class DriverInstance {

        constructor(configuration,driver) {
            this.configuration=configuration;
            this.driver=driver;
        }

        getId() {
            return this.configuration._id;
        }

        getConfiguration() {
            return this.configuration;
        }

        getDriver() {
            return this.driver;
        }

        getDriverID() {
            return this.configuration.driver;
        }
    }

    class DriversClass {

        constructor() {
            this.drivers=[];
            this.driverInstances=[];
        }

        getDriverClass(type) {
            for(var i in this.drivers) {
                if(this.drivers[i].getDriverID()===type) {
                    return this.drivers[i];
                }
            }
        }

        getDriverInstance(instanceID) {
            for(var i in this.driverInstances) {
                if(this.driverInstances[i].getId()===instanceID) {
                    return this.driverInstances[i];
                }
            }
        }

        removeDriverInstance(instanceID) {
            for(var i in this.driverInstances) {
                if(this.driverInstances[i].getId()===instanceID) {
                    var a=this.driverInstances[i];
                    delete this.driverInstances[i];
                    return a;
                }
            }
        }

        getDrivers() {
            return this.drivers;
        }

        getDriverInstances() {
            return this.driverInstances;
        }

        registerDriver(driver) {
            this.drivers.push(driver);
        }

        startDriverInstance(driverInstanceConfig) {
            var driverClass=this.getDriverClass(driverInstanceConfig.driver);
            if(driverClass!==undefined) {
                let classInstance=new driverClass(driverInstanceConfig);
                let failed=false;
                try {
                    classInstance.start(driverInstanceConfig.properties);
                }
                catch(e)
                {
                    failed=true;
                    console.log('Error when starting driver',e);
                }
                // register on fail so that configuration can be updated by the user
                let driverInstance=new DriverInstance(driverInstanceConfig,classInstance);
                this.driverInstances.push(driverInstance);
                if(!failed) {
                    Devices.registerDriverListener(driverInstance);
                    classInstance.reloadDevices();
                    classInstance.reloadSensors();
                }
            }
        }

        stopDriverInstance(driverInstanceId) {
            var instance=this.removeDriverInstance(driverInstanceId);
            if(instance!==undefined) {
                if(instance.getDriver().stop!==undefined) instance.getDriver().stop(instance.getConfiguration().properties);
            }
        }

        start() {
            var self=this;
            Collections.DriverInstances.find().forEach(
                function(driverInstance) {
                        self.startDriverInstance(driverInstance);
                });
        }
    }

    Drivers=new DriversClass();
/*
    startDrivers=function() {

        DemoDriver.start();

        var mySensorsConfiguration = {
            gwType: 'ethernet',
            //
            //
            // gwType: 'serial',
            serialParameters: {
                gwPort: 'COM6',
                //gwPort : '/dev/ttyAMA0',
                gwBaud: 115200
            },
            ethernetParameters: {
                gwAddress: '192.168.1.219',
                gwPort: 5003
            }
        };
        MySensors.start(mySensorsConfiguration);

        DemoDriver.start();

        CFoxInelsDriver.start({ip:'192.168.1.1', exportPub:'C:\\Files\\doc\\dum\\miluska.pub', exportExp:'C:\\Files\\doc\\dum\\miluska.exp'});

    }*/
}
