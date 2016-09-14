var mqtt    = require('mqtt');
//var client  = mqtt.connect('mqtt://ec2-52-39-102-127.us-west-2.compute.amazonaws.com:1883');
var client  = mqtt.connect('mqtt://localhost:1883');

// represents internal state of the relay

var D1_Value=0;
 
client.on('connect', function () {
  console.log('Client connected');

  client.subscribe('Living Room/Lights/LightController1/+/get');
  client.subscribe('Living Room/Lights/LightController1/+/set');

  client.publish('Living Room/Lights/LightController1/D1/presentation', JSON.stringify({ type: 'S_LIGHT' }));
  client.publish('Living Room/Lights/LightController1/D1', JSON.stringify({ command: 'status', 'V_STATUS': D1_Value }));

});
 
client.on('message', function (topic, message) {

  var components=topic.split('/');
  if(components[components.length-1]==='get') {
      client.publish('Living Room/Lights/LightController1/D1', JSON.stringify({ command: 'status', 'V_STATUS': D1_Value }));
  }
  if(components[components.length-1]==='set') {
      D1_Value=JSON.parse(message).V_STATUS;
      console.log('D1_Value',D1_Value);
      client.publish('Living Room/Lights/LightController1/D1', JSON.stringify({ command: 'status', 'V_STATUS': D1_Value }));
  }

});




