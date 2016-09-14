/*
 * Dependencies:
 * https://github.com/adafruit/Adafruit-BMP085-Library
 */
#include <Adafruit_BMP085.h>


#include <ESP8266WiFi.h>
#include <Wire.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define wifi_ssid "your_ssid"
#define wifi_password "your_wifi_password"

#define mqtt_server "eman"
#define mqtt_user "your_username"
#define mqtt_password "your_password"

#define device_topic "Living Room/Barometer"
#define pressure_sensor_id "pressure"
#define temperature_sensor_id "temperature"

WiFiClient espClient;

PubSubClient client(espClient);

Adafruit_BMP085 bmp;

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  if (!bmp.begin()) {
    Serial.println("Could not find BMP180 or BMP085 sensor at 0x77");
    while (1) {}
  }
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
    (String(device_topic)+"/"+pressure_sensor_id+"/presentation").toCharArray(buffer,sizeof(buffer));
    client.publish(buffer,"{ \"type\": \"S_BARO\", \"comment\": \"Atmospheric pressure measurement\" }");
    (String(device_topic)+"/"+temperature_sensor_id+"/presentation").toCharArray(buffer,sizeof(buffer));
    client.publish(buffer,"{ \"type\": \"S_TEMP\", \"comment\": \"Temperature measurement\" }");
}


void sendPressureValue(float value) {
  char result[100];
  String statusPrefix=String("{ \"V_PRESSURE\": ");
  String statusSuffix=String(" }");
  (statusPrefix+value+statusSuffix).toCharArray(result,sizeof(result));
  Serial.print("Sending message:");
  Serial.println(result);
  (String(device_topic)+"/"+pressure_sensor_id).toCharArray(buffer,sizeof(buffer));
  client.publish(buffer,result);
}

void sendTemperatureValue(float value) {
  char result[100];
  String statusPrefix=String("{ \"V_TEMP\": ");
  String statusSuffix=String(" }");
  (statusPrefix+value+statusSuffix).toCharArray(result,sizeof(result));
  Serial.print("Sending message:");
  Serial.println(result);
  (String(device_topic)+"/"+temperature_sensor_id).toCharArray(buffer,sizeof(buffer));
  client.publish(buffer,result);
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    // If you do not want to use a username and password, change next line to
    // if (client.connect("ESP8266Client")) {
    if (client.connect("ESP8266Client-pressure", mqtt_user, mqtt_password)) {
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




bool checkBound(float newValue, float prevValue, float maxDiff) {
  return !isnan(newValue) &&
         (newValue < prevValue - maxDiff || newValue > prevValue + maxDiff);
}


long lastMsg = 0;
float pressure = 0.0;
float temp;
float diff = 1.0;

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();


  long now = millis();
  if (now - lastMsg > 1000) {
    lastMsg = now;


    float newPressure = bmp.readPressure()/100.0;
    if (checkBound(newPressure, pressure, diff)) {
      pressure = newPressure;
      Serial.print("New pressure:");
      Serial.println(String(pressure).c_str());
      sendPressureValue(pressure);
    }

    float newTemperature = bmp.readTemperature();
    if (checkBound(newTemperature, temp, diff)) {
      temp = newTemperature;
      Serial.print("New temperature:");
      Serial.println(String(temp).c_str());
      sendTemperatureValue(temp);
    }
  }

}