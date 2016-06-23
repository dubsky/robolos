SensorClasses = {

    BINARY_OUTPUT : 'BINARY_OUTPUT',
    BINARY_INPUT : 'BINARY_INPUT',
    ANALOG_OUTPUT_0_100 : 'ANALOG_OUTPUT_0_100',
    ANALOG_INPUT_0_100 : 'ANALOG_INPUT_0_100',
    ANALOG_INPUT : 'ANALOG_INPUT',
    ANALOG_OUTPUT : 'ANALOG_OUTPUT',
    STRING : 'STRING',
    RGB : 'RGB',
    RGBW : 'RGBW',
    UNKNOWN : 'UNKNOWN',

    isAnalog:function(clazz) {
        return (clazz!==SensorClasses.BINARY_INPUT ) && (clazz!==SensorClasses.BINARY_OUTPUT );
    }
};

SensorClassNames = {

    BINARY_OUTPUT : 'Binary Output',
    BINARY_INPUT : 'Binary Input',
    ANALOG_OUTPUT_0_100 : 'Analog Output 0-100',
    ANALOG_INPUT_0_100 : 'Analog Input 0-100',
    ANALOG_INPUT : 'Analog Input',
    ANALOG_OUTPUT : 'Analog Output',
    UNKNOWN : 'Unidentified sensor'

};