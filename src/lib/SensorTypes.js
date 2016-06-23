SensorVariablesList={

    V_TEMP : SensorClasses.ANALOG_INPUT,
    V_HUM : SensorClasses.ANALOG_INPUT,
    V_LIGHT : SensorClasses.BINARY_INPUT,
    V_STATUS : SensorClasses.BINARY_INPUT,
    V_DIMMER : SensorClasses.ANALOG_OUTPUT_0_100,
    V_PERCENTAGE : SensorClasses.ANALOG_OUTPUT_0_100,
    V_PRESSURE : SensorClasses.ANALOG_INPUT,
    V_FORECAST : SensorClasses.STRING,
    V_RAIN : SensorClasses.ANALOG_INPUT,
    V_RAINRATE : SensorClasses.ANALOG_INPUT,
    V_WIND : SensorClasses.ANALOG_INPUT,
    V_GUST : SensorClasses.ANALOG_INPUT,
    V_DIRECTION : SensorClasses.ANALOG_INPUT,
    V_UV : SensorClasses.ANALOG_INPUT,
    V_WEIGHT : SensorClasses.ANALOG_INPUT,
    V_DISTANCE : SensorClasses.ANALOG_INPUT,
    V_IMPEDANCE : SensorClasses.ANALOG_INPUT,
    V_ARMED : SensorClasses.BINARY_INPUT,
    V_TRIPPED : SensorClasses.BINARY_INPUT,
    V_WATT : SensorClasses.ANALOG_INPUT,
    V_KWH : SensorClasses.ANALOG_INPUT,
    V_SCENE_ON : SensorClasses.STRING,
    V_SCENE_OFF : SensorClasses.STRING,
    V_HVAC_FLOW_STATE: SensorClasses.STRING,
    V_LIGHT_LEVEL: SensorClasses.ANALOG_INPUT_0_100,
    V_VAR1 : SensorClasses.ANALOG_INPUT,
    V_VAR2 : SensorClasses.ANALOG_INPUT,
    V_VAR3 : SensorClasses.ANALOG_INPUT,
    V_VAR4 : SensorClasses.ANALOG_INPUT,
    V_VAR5 : SensorClasses.ANALOG_INPUT,
    V_UP : SensorClasses.BINARY_OUTPUT,
    V_DOWN : SensorClasses.BINARY_OUTPUT,
    V_STOP : SensorClasses.BINARY_OUTPUT,
    V_IR_SEND : SensorClasses.STRING,
    V_IR_RECEIVE : SensorClasses.STRING,
    V_FLOW : SensorClasses.ANALOG_INPUT,
    V_VOLUME : SensorClasses.ANALOG_INPUT,
    V_LOCK_STATUS : SensorClasses.BINARY_INPUT,
    V_LEVEL : SensorClasses.ANALOG_INPUT,
    V_VOLTAGE : SensorClasses.ANALOG_INPUT,
    V_CURRENT : SensorClasses.ANALOG_INPUT,
    V_RGB : SensorClasses.RGB,
    V_RGBW : SensorClasses.RGBW,
    V_ID : SensorClasses.STRING,
    V_UNIT_PREFIX : SensorClasses.ANALOG_INPUT,
    V_HVAC_SETPOINT_COOL : SensorClasses.ANALOG_OUTPUT,
    V_HVAC_SETPOINT_HEAT : SensorClasses.ANALOG_OUTPUT,
    V_HVAC_FLOW_MODE : SensorClasses.STRING,
    V_HVAC_SPEED : SensorClasses.ANALOG_INPUT
};

SensorVariables={};

for(let i in SensorVariablesList) {
    SensorVariables[i]={ name: i, class: SensorVariablesList[i]};
}

SensorTypes={

    S_DOOR: { id:'S_DOOR', comment:'Door and window sensors', class: SensorClasses.BINARY_INPUT, mainVariable: SensorVariables.V_TRIPPED, variables: [ SensorVariables.V_ARMED, SensorVariables.V_TRIPPED ] },
    S_MOTION: { id:'S_MOTION', comment:'Motion sensors',class: SensorClasses.BINARY_INPUT, mainVariable: SensorVariables.V_TRIPPED, variables: [ SensorVariables.V_ARMED, SensorVariables.V_TRIPPED ] },
    S_SMOKE: { id:'S_SMOKE', comment:'Smoke sensor',class: SensorClasses.BINARY_INPUT,mainVariable: SensorVariables.V_TRIPPED, variables: [ SensorVariables.V_ARMED, SensorVariables.V_TRIPPED ]},
    S_LIGHT: { id:'S_LIGHT', comment:'Light Actuator (on/off)',class: SensorClasses.BINARY_OUTPUT, mainVariable: SensorVariables.V_STATUS, variables: [ SensorVariables.V_STATUS, SensorVariables.V_WATT ]},
    S_DIMMER: { id:'S_DIMMER', comment:'Dimmable device of some kind',class: SensorClasses.ANALOG_OUTPUT_0_100,mainVariable: SensorVariables.V_DIMMER, variables: [ SensorVariables.V_DIMMER,SensorVariables.V_STATUS, SensorVariables.V_WATT ]},
    S_COVER: { id:'S_COVER', comment:'Window covers or shades',class: SensorClasses.BINARY_OUTPUT,mainVariable: SensorVariables.V_PERCENTAGE, variables:[ SensorVariables.V_UP,  SensorVariables.V_DOWN,  SensorVariables.V_STOP,  SensorVariables.V_PERCENTAGE]},
    S_TEMP: { id:'S_TEMP', comment:'Temperature sensor', class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_TEMP, variables: [ SensorVariables.V_TEMP, SensorVariables.V_ID ]},
    S_HUM: { id:'S_HUM', comment:'Humidity sensor', class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_HUM, variables: [ SensorVariables.V_HUM ]},
    S_BARO: { id:'S_BARO', comment:'Barometer sensor (Pressure)', class: SensorClasses.ANALOG_INPUT},mainVariable: SensorVariables.V_PRESSURE, variables: [ SensorVariables.V_PRESSURE,SensorVariables.V_FORECAST ],
    S_WIND: { id:'S_WIND', comment:'Wind sensor', class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_WIND, variables: [ SensorVariables.V_WIND,SensorVariables.V_GUST ]},
    S_RAIN: { id:'S_RAIN', comment:'Rain sensor', class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_RAIN, variables: [ SensorVariables.V_RAIN,SensorVariables.V_RAINRATE ]},
    S_UV: { id:'S_UV', comment:'UV sensor', class: SensorClasses.ANALOG_INPUT, mainVariable: SensorVariables.V_UV, variables: [ SensorVariables.V_UV ]},
    S_WEIGHT: { id:'S_WEIGHT', comment:'Weight sensor for scales etc.', class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_WEIGHT, variables: [ SensorVariables.V_WEIGHT,SensorVariables.V_IMPEDANCE ]},
    S_POWER: { id:'S_POWER', comment:'Watt Meter',class: SensorClasses.ANALOG_INPUT, mainVariable: SensorVariables.V_KWH, variables: [ SensorVariables.V_KWH,SensorVariables.V_WATT ] },
    S_HEATER: { id:'S_HEATER', comment:'Heater device',class: SensorClasses.BINARY_OUTPUT,mainVariable: SensorVariables.V_HVAC_FLOW_STATE, variables: [ SensorVariables.V_HVAC_SETPOINT_HEAT,SensorVariables.V_TEMP,SensorVariables.V_HVAC_FLOW_STATE ]},
    S_DISTANCE: { id:'S_DISTANCE', comment:'Distance sensor', class: SensorClasses.ANALOG_INPUT, mainVariable: SensorVariables.V_DISTANCE, variables: [ SensorVariables.V_DISTANCE,SensorVariables.V_UNIT_PREFIX ]},
    S_LIGHT_LEVEL: { id:'S_LIGHT_LEVEL', comment:'Light sensor', class: SensorClasses.ANALOG_INPUT, mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LIGHT_LEVEL,SensorVariables.V_LEVEL ]},
    S_ARDUINO_NODE: { id:'S_ARDUINO_NODE', comment:'Arduino node device'},
    S_ARDUINO_REPEATER_NODE: { id:'S_ARDUINO_REPEATER_NODE', comment:'Arduino repeating node device'},
    S_LOCK: { id:'S_LOCK', comment:'Lock device',class: SensorClasses.BINARY_OUTPUT, mainVariable: SensorVariables.V_LOCK_STATUS, variables: [ SensorVariables.V_LOCK_STATUS ]},
    S_IR: { id:'S_IR', comment:'Ir sender/receiver device', variables: [ SensorVariables.V_IR_SEND,SensorVariables.V_IR_RECEIVE ]},
    S_WATER: { id:'S_WATER', comment:'Water meter', class: SensorClasses.ANALOG_INPUT, mainVariable: SensorVariables.V_VOLUME, variables: [ SensorVariables.V_VOLUME,SensorVariables.V_FLOW ]},
    S_AIR_QUALITY: { id:'S_AIR_QUALITY', comment:'Air quality sensor e.g. MQ-2', mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL,SensorVariables.V_UNIT_PREFIX ]},
    S_CUSTOM: { id:'S_CUSTOM', comment:'Custom sensors where no other fits.'},
    S_DUST: { id:'S_DUST', comment:'Dust level sensor',class: SensorClasses.BINARY_INPUT,mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL,SensorVariables.V_UNIT_PREFIX ]},
    S_SCENE_CONTROLLER: { id:'S_SCENE_CONTROLLER', comment:'Scene controller device', variables: [ SensorVariables.V_SCENE_ON,SensorVariables.V_SCENE_OFF ]},
    S_RGB_LIGHT: { id:'S_RGB_LIGHT', comment:'RGB light', mainVariable: SensorVariables.V_RGB, variables: [ SensorVariables.V_RGB,SensorVariables.V_WATT ]},
    S_RGBW_LIGHT: { id:'S_RGBW_LIGHT', comment:'RGBW light (with separate white component)', mainVariable: SensorVariables.V_RGBW, variables: [ SensorVariables.V_RGBW,SensorVariables.V_WATT ]},
    S_COLOR_SENSOR: { id:'S_COLOR_SENSOR', comment:'Color sensor', mainVariable: SensorVariables.V_RGB, variables: [ SensorVariables.V_RGB]},
    S_HVAC: { id:'S_HVAC', comment:'Thermostat/HVAC device', mainVariable: SensorVariables.V_HVAC_FLOW_STATE, variables: [ SensorVariables.V_HVAC_FLOW_STATE,SensorVariables.V_HVAC_FLOW_MODE,SensorVariables.V_HVAC_SPEED,SensorVariables.V_HVAC_SETPOINT_HEAT,SensorVariables.V_HVAC_SETPOINT_COOL ]},
    S_MULTIMETER: { id:'S_MULTIMETER', comment:'Multimeter instrument (Current, Voltage)', mainVariable: SensorVariables.V_VOLTAGE, variables: [ SensorVariables.V_VOLTAGE,SensorVariables.V_CURRENT,SensorVariables.V_IMPEDANCE]},
    S_SPRINKLER: { id:'S_SPRINKLER', comment:'Sprinkler device', mainVariable: SensorVariables.V_STATUS , variables: [ SensorVariables.V_TRIPPED ,SensorVariables.V_STATUS ]},
    S_WATER_LEAK: { id:'S_WATER_LEAK', comment:'Sound sensor', mainVariable: SensorVariables.V_TRIPPED, variables: [ SensorVariables.V_TRIPPED,SensorVariables.V_ARMED ]},
    S_SOUND: { id:'S_SOUND', comment:'Sound sensor', mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL,SensorVariables.V_TRIPPED,SensorVariables. V_ARMED ]},
    S_VIBRATION: { id:'S_VIBRATION', comment:'Vibration sensor', mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL,SensorVariables.V_TRIPPED,SensorVariables.V_ARMED ]},
    S_MOISTURE: { id:'S_MOISTURE', comment:'Moisture sensor', mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL, SensorVariables. V_TRIPPED,SensorVariables. V_ARMED ]},
    S_PH: { id:'S_PH', comment:'Water pH',class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL] },
    S_ANALOG_INPUT: { id:'S_ANALOG_INPUT', comment: 'Unspecified analog input',class: SensorClasses.ANALOG_INPUT,mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL] },
    S_ANALOG_OUTPUT: { id:'S_ANALOG_OUTPUT', comment: 'Unspecified analog output',class: SensorClasses.ANALOG_OUTPUT,mainVariable: SensorVariables.V_LEVEL, variables: [ SensorVariables.V_LEVEL] },
    S_ANALOG_INPUT_0_100: { id:'S_ANALOG_INPUT_0_100', comment: 'Unspecified analog input with value 0-100',class: SensorClasses.ANALOG_INPUT_0_100,mainVariable: SensorVariables.V_PERCENTAGE, variables: [ SensorVariables.V_PERCENTAGE] },
    S_ANALOG_OUTPUT_0_100: { id:'S_ANALOG_OUTPUT_0_100', comment: 'Unspecified analog output with value 0-100',class: SensorClasses.ANALOG_OUTPUT_0_100,mainVariable: SensorVariables.V_PERCENTAGE, variables: [ SensorVariables.V_PERCENTAGE] },
    BINARY_OUTPUT : { id:'BINARY_OUTPUT', comment: 'Unspecified binary output',class: SensorClasses.BINARY_OUTPUT, mainVariable: SensorVariables.V_STATUS, variables: [ SensorVariables.V_STATUS]},
    BINARY_INPUT : { id:'BINARY_INPUT', comment: 'Unspecified binary input',class: SensorClasses.BINARY_INPUT, mainVariable: SensorVariables.V_STATUS, variables: [ SensorVariables.V_STATUS]}
};