class Variables  extends Observable {

    constructor() {
        super();
        this.cache={};
    }

    createVariable(variable) {
        var id=Collections.Variables.upsert('',variable).insertedId;
        var updatedVariable=Collections.Variables.findOne(id);
        this.cache[id]=updatedVariable;
        this.fireCreateEvent(updatedVariable);
        return updatedVariable;
    }

    updateVariable(variable,variableId) {
        Collections.Variables.update(variableId,variable);
        var updatedVariable=Collections.Variables.findOne(variableId);
        this.cache[variableId]=updatedVariable;
        if (updatedVariable.onChangeAction!==undefined) ActionsInstance.startAction(ActionsInstance.getAction(updatedVariable.onChangeAction));
        this.fireUpdateEvent(updatedVariable);
        return updatedVariable;
    }

    removeVariable(variableId) {
        Collections.Variables.remove({_id:variableId});
        delete this.cache[variableId];
        this.fireRemoveEvent(variableId);

    }

    getVariable(variableId) {
        return this.cache[variableId];
    }

    getValue(variableId) {
        var v=this.getVariable(variableId);
        if(v===undefined) throw 'variable no longer exists';
        var s;
        switch(v.type) {
            case 'number':
                return v.numberValue;
            case 'string':
                return v.stringValue;
            case 'date':
                return v.dateValue;
            case 'boolean':
                return v.booleanValue;
        }
    }

    setValue(variableId,value,automation) {
        var v=this.getVariable(variableId);
        if(v===undefined) throw 'variable no longer exists';
        var uiChange=automation===undefined || !automation;
        if(uiChange || ((v.modifiedBy==='auto' || v.modifiedBy==='both') && v.allowAutomaticControl))
        {
            var s;
            switch(v.type) {
                case 'number':
                    s={ numberValue: value };
                case 'string':
                    s={ stringValue: value };
                case 'date':
                    s={ dateValue: value };
                case 'boolean':
                    s={ booleanValue: value };
            }
            Collections.Variables.update(variableId,{ $set : s });
            var updatedVariable=Collections.Variables.findOne(variableId);
            this.cache[variableId]=updatedVariable;

            if(v.onChangeAction!==undefined) {
                var action=ActionsInstance.getAction(v.onChangeAction)
                ActionsInstance.startAction(action);
            }
            log.info('Action: Setting variable '+v.title+' to '+value);
            this.fireUpdateEvent(updatedVariable);
            return updatedVariable;
        }
        else
            log.info('Action: Setting variable '+v.title+' to '+value+' ignored - automatic changes are disabled');{
            return v;
        }
    }

    nextExecution(variableId) {
        return SyncedCron.nextVariabledAtDate(variableId).getTime();
    }

    start() {
        var self=this;
        Collections.Variables.find().forEach(
            function(variable) {
                self.cache[variable._id]=variable;
            });
    }

}

VariablesInstance=new Variables();

Meteor.startup(function() {
    VariablesInstance.start();
});
