CommandProviderTypes={  ACTION: 'ACTION', SENSOR:'SENSOR', VARIABLE:'VARIABLE'};

CommandProvider=class CommandProvider {

    listCommands() {
        throw new Exception("Must be implemented");
    }

    execute(command, parameter) {
        throw new Exception("Must be implemented");
    }

    getType() {
        throw new Exception("Must be implemented");
    }

}