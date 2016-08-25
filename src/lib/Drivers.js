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
                    log.error('Error when starting driver',e);
                }
                // register on fail so that configuration can be updated by the user
                let driverInstance=new DriverInstance(driverInstanceConfig,classInstance);
                this.driverInstances.push(driverInstance);
                if(!failed) {
                    Devices.registerDriverListener(driverInstance);
                    try {
                        classInstance.reloadDevices();
                        classInstance.reloadSensors();
                    }
                    catch(e)
                    {
                        console.log('Error loading initial data from a driver',e);
                    }
                }
            }
        }

        stopDriverInstance(driverInstanceId) {
            var instance=this.removeDriverInstance(driverInstanceId);
            if(instance!==undefined) {
                try {
                    if(instance.getDriver().stop!==undefined) instance.getDriver().stop(instance.getConfiguration().properties);
                }
                catch(e)
                {
                    log.error('Error when stopping driver',e);
                }
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
}
