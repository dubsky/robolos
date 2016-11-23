class CommandRegistry {

    constructor() {
        this.sensorCommandProvider=new SensorCommandProvider();
    }

    getCommands() {
        let result={};
        this.cache={};
        let provider=this.sensorCommandProvider;
        let commands=provider.listCommands();
        for(let command of commands) {
            command.provider=provider;
            if (command.label===undefined) {
                log.error('Assertion failed; command without label',command);
            } else {
                if(result[command.label]!==undefined) log.error('Duplicate call name:'+command.label);
                result[command.label]=command;
            }
            this.cache[command.uuid]=command;
        }
        return result;
    }

    getCommandByUUID(uuid) {
        if(this.cache===undefined) this.getCommands();
        return this.cache[uuid];
    }

    execute(command,parameters) {
        command.provider.execute(command,parameters);
    }
}

CommandRegistryInstance=new CommandRegistry();