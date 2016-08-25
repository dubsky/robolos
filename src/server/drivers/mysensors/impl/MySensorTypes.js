
MySensorsSensorTypes={
    0 : { type: 'S_DOOR', comment:'Door and window sensors', mappedToType: SensorTypes.S_DOOR },
    1 : { type: 'S_MOTION', comment:'Motion sensors',mappedToType: SensorTypes.S_MOTION },
    2 : { type: 'S_SMOKE', comment:'Smoke sensor',mappedToType: SensorTypes.S_SMOKE},
    3 : { type: 'S_LIGHT', comment:'Relay (on/off)',mappedToType: SensorTypes.S_LIGHT},
    4 : { type: 'S_DIMMER', comment:'Dimmable device of some kind',mappedToType: SensorTypes.S_DIMMER,},
    5 : { type: 'S_COVER', comment:'Window covers or shades',mappedToType: SensorTypes.S_COVER},
    6 : { type: 'S_TEMP', comment:'Temperature sensor', mappedToType: SensorTypes.S_TEMP},
    7 : { type: 'S_HUM', comment:'Humidity sensor', mappedToType: SensorTypes.S_HUM},
    8 : { type: 'S_BARO', comment:'Barometer sensor (Pressure)', mappedToType: SensorTypes.S_BARO},
    9 : { type: 'S_WIND', comment:'Wind sensor', mappedToType: SensorTypes.S_WIND},
    10 : { type: 'S_RAIN', comment:'Rain sensor', mappedToType: SensorTypes.S_RAIN},
    11 : { type: 'S_UV', comment:'UV sensor', mappedToType: SensorTypes.S_UV},
    12 : { type: 'S_WEIGHT', comment:'Weight sensor for scales etc.', mappedToType: SensorTypes.S_WEIGHT},
    13 : { type: 'S_POWER', comment:'Power measuring device, like power meters',mappedToType: SensorTypes.S_POWER},
    14 : { type: 'S_HEATER', comment:'Heater device',mappedToType: SensorTypes.S_HEATER},
    15 : { type: 'S_DISTANCE', comment:'Distance sensor', mappedToType: SensorTypes.S_DISTANCE},
    16 : { type: 'S_LIGHT_LEVEL', comment:'Light sensor', mappedToType: SensorTypes.S_LIGHT_LEVEL},
    17 : { type: 'S_ARDUINO_NODE', comment:'Arduino node device',mappedToType: SensorTypes.S_ARDUINO_NODE},
    18 : { type: 'S_ARDUINO_REPEATER_NODE', comment:'Arduino repeating node device',mappedToType: SensorTypes.S_ARDUINO_REPEATER_NODE},
    19 : { type: 'S_LOCK', comment:'Lock device'},
    20 : { type: 'S_IR', comment:'Ir sender/receiver device'},
    21 : { type: 'S_WATER', comment:'Water meter', mappedToType: SensorTypes.S_WATER},
    22 : { type: 'S_AIR_QUALITY', comment:'Air quality sensor e.g. MQ-2'},
    23 : { type: 'S_CUSTOM', comment:'custom sensors where no other fits.'},
    24 : { type: 'S_DUST', comment:'Dust level sensor'},
    25 : { type: 'S_SCENE_CONTROLLER', comment:'Scene controller device'},
    26 : { type: 'S_RGB_LIGHT', comment:'RGB light'},
    27 : { type: 'S_RGBW_LIGHT', comment:'RGBW light (with separate white component)'},
    28 : { type: 'S_COLOR_SENSOR', comment:'Color sensor'},
    29 : { type: 'S_HVAC', comment:'Thermostat/HVAC device'},
    30 : { type: 'S_MULTIMETER', comment:'Multimeter device'},
    31 : { type: 'S_SPRINKLER', comment:'Sprinkler device'},
    32 : { type: 'S_WATER_LEAK', comment:'Water leak sensor'},
    33 : { type: 'S_SOUND', comment:'Sound sensor'},
    34 : { type: 'S_VIBRATION', comment:'Vibration sensor'},
    35 : { type: 'S_MOISTURE', comment:'Moisture sensor'},
    36 : { type: 'S_INFO', comment:'LCD text device'},
    37 : { type: 'S_GAS', comment:'	Gas meter'},
    38 : { type: 'S_GPS', comment:'GPS Sensor'},
    39 : { type: 'S_WATER_QUALITY', comment:'Water quality sensor',mappedToType: SensorTypes.S_PH}

};

MySensorsVariableTypes=new Map();
MySensorsVariableTypeToNumber=new Map();

let mapVariable=function(variable,number) {
    MySensorsVariableTypes.set(number,variable);
    MySensorsVariableTypeToNumber.set(variable,number);
};

mapVariable('V_TEMP',0);
mapVariable('V_HUM',1);
mapVariable('V_LIGHT',2);
mapVariable('V_STATUS',2);
mapVariable('V_DIMMER',3);
mapVariable('V_PERCENTAGE',3);
mapVariable('V_PRESSURE',4);
mapVariable('V_FORECAST',5);
mapVariable('V_RAIN',6);
mapVariable('V_RAINRATE',7);
mapVariable('V_WIND',8);
mapVariable('V_GUST',9);
mapVariable('V_DIRECTION',10);
mapVariable('V_UV',11);
mapVariable('V_WEIGHT',12);
mapVariable('V_DISTANCE',13);
mapVariable('V_IMPEDANCE',14);
mapVariable('V_ARMED',15);
mapVariable('V_TRIPPED',16);
mapVariable('V_WATT',17);
mapVariable('V_KWH',18);
mapVariable('V_SCENE_ON',19);
mapVariable('V_SCENE_OFF',20);
mapVariable('V_HEATER',21);
mapVariable('V_HEATER_SW',22);
mapVariable('V_LIGHT_LEVEL',23);
mapVariable('V_VAR1',24);
mapVariable('V_VAR2',25);
mapVariable('V_VAR3',26);
mapVariable('V_VAR4',27);
mapVariable('V_VAR5',28);
mapVariable('V_UP',29);
mapVariable('V_DOWN',30);
mapVariable('V_STOP',31);
mapVariable('V_IR_SEND',32);
mapVariable('V_IR_RECEIVE',33);
mapVariable('V_FLOW',34);
mapVariable('V_VOLUME',35);
mapVariable('V_LOCK_STATUS',36);
mapVariable('V_LEVEL',37);
mapVariable('V_VOLTAGE',38);
mapVariable('V_CURRENT',39);
mapVariable('V_RGB',40);
mapVariable('V_RGBW',41);
mapVariable('V_ID',42);
mapVariable('V_UNIT_PREFIX',43);
mapVariable('V_HVAC_SETPOINT_COOL',44);
mapVariable('V_HVAC_SETPOINT_HEAT',45);
mapVariable('V_HVAC_FLOW_MODE',46);
mapVariable('V_TEXT',47);
mapVariable('V_CUSTOM',48);
mapVariable('V_POSITION',49);
mapVariable('V_IR_RECORD',50);
mapVariable('V_PH',51);
mapVariable('V_ORP',52);
mapVariable('V_EC',53);
mapVariable('V_VAR',54);
mapVariable('V_VA',55);
mapVariable('V_POWER_FACTOR',56);

