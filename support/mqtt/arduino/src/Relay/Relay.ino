#include <ESP8266WiFi.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <EEPROM.h>

#define wifi_ssid "your_ssid"
#define wifi_password "your_wifi_password"

#define mqtt_server "eman"
#define mqtt_user "your_username"
#define mqtt_password "your_password"

#define relay_pin D1

#define device_topic "Living Room/Lights/LightController-ESP"
#define sensor_id "D1"

WiFiClient espClient;
PubSubClient client(espClient);

int RelayState;

  
void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);

  EEPROM.begin(512);              // Begin eeprom to store on/off state
  pinMode(relay_pin, OUTPUT);     // Initialize the relay pin as an output  
  RelayState = EEPROM.read(0);
  Serial.print("Initial relay state:");
  Serial.println(RelayState);
  digitalWrite(relay_pin,RelayState);
}

void setup_wifi() {
  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(wifi_ssid);

  WiFi.begin(wifi_ssid, wifi_password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

char buffer[128];

void presentYourself() {
    (String(device_topic)+"/"+sensor_id+"/presentation").toCharArray(buffer,sizeof(buffer));
    client.publish(buffer,"{ 'type': 'S_LIGHT', 'comment': 'Sample relay controlling a light' }");
    (String(device_topic)+"/+/get").toCharArray(buffer,sizeof(buffer));
    client.subscribe(buffer);
    (String(device_topic)+"/+/set").toCharArray(buffer,sizeof(buffer));
    client.subscribe(buffer);
}


void sendValue() {
  char result[100]; 
  String statusPrefix=String("{ \"V_STATUS\": ");
  String statusSuffix=String(" }");
  (statusPrefix+RelayState+statusSuffix).toCharArray(result,sizeof(result));
  Serial.print("Sending message:");
  Serial.println(result);
  (String(device_topic)+"/"+sensor_id).toCharArray(buffer,sizeof(buffer));
  client.publish(buffer,result);
}


void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    // If you do not want to use a username and password, change next line to
    // if (client.connect("ESP8266Client")) {
    if (client.connect("ESP8266Client", mqtt_user, mqtt_password)) {
      Serial.println("connected");
      presentYourself();
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}



String getTopicToken(String data, int index)
{
  int found = 0;
  int strIndex[] = {0, -1};
  int maxIndex = data.length()-1;

  for(int i=0; i<=maxIndex && found<=index; i++){
    if(data.charAt(i)=='/' || i==maxIndex){
        found++;
        strIndex[0] = strIndex[1]+1;
        strIndex[1] = (i == maxIndex) ? i+1 : i;
    }
  }

  return found>index ? data.substring(strIndex[0], strIndex[1]) : "";
}

int getTokenCount(String data) {
  int maxIndex = data.length()-1;
  int count=1;
  for(int i=0; i<=maxIndex; i++){
    if(data.charAt(i)=='/'){
      count++;
    }
  }  
  return count;
}

// Callback function
void callback(char* topic, byte* payload, unsigned int length) {  
  StaticJsonBuffer<512> jsonBuffer;
  Serial.print("payload:");
  payload[length] = '\0';
  Serial.println((char*)payload);
  String s=String(topic);
  int tokenCount=getTokenCount(s);
  String term=getTopicToken(s,tokenCount-1);
  if(term=="set")
  {
     term=getTopicToken(s,tokenCount-2);
     if(term==sensor_id) {
        Serial.println(term);
        JsonObject& root = jsonBuffer.parseObject((char*)payload);
        if (!root.success()) {
          Serial.println("parseObject() failed");
          return;
        }
        if (root.containsKey("V_STATUS"))
        {
           Serial.print("V_STATUS:");
           Serial.println((int)root["V_STATUS"]);
           RelayState = root["V_STATUS"];
           digitalWrite(relay_pin,RelayState);
           EEPROM.write(0, RelayState);
           EEPROM.commit();
        }
     }
  }  
  sendValue();
}


void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

}