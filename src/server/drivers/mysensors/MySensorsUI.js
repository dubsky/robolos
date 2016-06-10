Meteor.methods({

    'mysensors-listSerialPorts' : function() {
        var serialPort = Meteor.npmRequire('serialport');
        let results=[];
        let listSynchronously=Meteor.wrapAsync(serialPort.list);

        var ports=listSynchronously();

        ports.forEach(function(port) {
            results[results.length]=({ label: port.comName+' ['+port.manufacturer+']', value:port.comName});
        });

        return results;
    }

});

