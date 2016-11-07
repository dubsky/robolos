MyBlocks=function() {

    DefineSensorField();
    DefineVariableField();
    DefineScheduleField();

    function getValue(v) {
        let value={id: null, name:null};
        if(v!=undefined && v!='') {
            if(v==='...')
                value=v;
            else
                value=EJSON.parse(v);
        }
        return value;
    }

    function getSensorValue(block) {
        let v=block.getFieldValue('selectedSensor');
        return getValue(v);
    }

    function getScheduleValue(block) {
        let v=block.getFieldValue('selectedSchedule');
        return getValue(v);
    }

    function getVariableValue(block) {
        var v=block.getFieldValue('selectedVariable');
        return getValue(v);
    }

    function getParam(p) {
        if(p==null) return 'null';
        return '"'+p+'"';
    }

    Blockly.Blocks['get_value'] = {
        init: function() {
            let filter={class: {$in :[SensorClasses.ANALOG_INPUT,SensorClasses.ANALOG_INPUT_0_100,SensorClasses.BINARY_INPUT,SensorClasses.STRING]}};
            this.appendDummyInput()
                .appendField("Get Value")
                .appendField(new Blockly.FieldSensor('...',filter),'selectedSensor');
            this.setOutput(true, null);
            this.setColour(330);
            this.setTooltip('Return value of a specified sensor');
        }
    };

    Blockly.JavaScript['get_value'] = function(block) {
        var value=getSensorValue(block);
        var code = 'context.getValue('+getParam(value.id)+','+getParam(value.name)+')';
        return [code, Blockly.JavaScript.ORDER_NONE];
    };


    Blockly.Blocks['get_control_variable'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Get Variable")
                .appendField(new Blockly.FieldControlVariable('...'),'selectedVariable');
            this.setOutput(true, null);
            this.setColour(120);
            this.setTooltip('Return value of a specified variable');
        }
    };

    Blockly.JavaScript['get_control_variable'] = function(block) {
        var value=getVariableValue(block);
        var code = 'context.getVariableValue('+getParam(value.id)+','+getParam(value.name)+')';
        return [code, Blockly.JavaScript.ORDER_NONE];
    };

    Blockly.Blocks['set_control_variable'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Set Variable")
                .appendField(new Blockly.FieldControlVariable('...'),'selectedVariable')
                .appendField("to");
            this.appendValueInput("value")
                .setCheck(null)
                .setAlign(Blockly.ALIGN_RIGHT);
            this.setInputsInline(true);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(120);
            this.setTooltip('Return value of a specified variable');
        }
    };

    Blockly.JavaScript['set_control_variable'] = function(block) {
        var value=getVariableValue(block);
        console.log(Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC));
        var code = 'context.setVariableValue('+getParam(value.id)+','+getParam(value.name)+','+Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC)+');';
        return code;
    };

    Blockly.Blocks['set_value'] = {
        init: function() {

            let filter={class: {$in :[SensorClasses.ANALOG_OUTPUT,SensorClasses.ANALOG_OUTPUT_0_100,SensorClasses.BINARY_OUTPUT,SensorClasses.RGB,SensorClasses.RGBW,SensorClasses.STRING]}};
            this.appendValueInput("value")
                .setCheck("Number")
                .appendField("Set Value");

            this.appendDummyInput()

                .appendField("on")
                .appendField(new Blockly.FieldSensor('...',filter),'selectedSensor');
                ////deprecated:.appendField(new Blockly.FieldDropdown([["in one step", "oneStep"], ["and fade in", "fade"]]), "operation");
            this.setInputsInline(true);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(330);
            this.setTooltip('Set value of an output, a dimmer for example');
        }
    };

    Blockly.JavaScript['set_value'] = function(block) {
        var text_value = Blockly.JavaScript.valueToCode(block, 'value', Blockly.JavaScript.ORDER_ATOMIC);
        var value=getSensorValue(block);
        var dropdown_operation = 'unused';//deprecated: block.getFieldValue('operation');
        // TODO: Assemble JavaScript into code variable.
        var code = 'context.setValue(\"'+dropdown_operation+'\",'+getParam(value.id)+','+getParam(value.name)+','+text_value+');\n';
        return code;
    };


    Blockly.Blocks['schedule'] = {
        init: function() {
            this.appendValueInput("schedule")
                .setCheck(null)
                .appendField("Set Schedule")
                .appendField(new Blockly.FieldSchedule('...',{type:'one-time'}),'selectedSchedule')
                .appendField("in");
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown([["second(s)", "SECOND"], ["minute(s)", "MINUTE"], ["hour(s)", "HOUR"]]), "unit")
                .appendField("from")
                .appendField(new Blockly.FieldDropdown([["now", "NOW"], ["it's original date", "ORIGIN"]]), "base");

            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(65);
            this.setTooltip('Plan execution of selected schedule in after spevified ammount in time');
            //this.setHelpUrl('http://www.example.com/');
        }
    };

    Blockly.JavaScript['schedule'] = function(block) {
        var value_schedule = Blockly.JavaScript.valueToCode(block, 'schedule', Blockly.JavaScript.ORDER_ATOMIC);
        var dropdown_unit = block.getFieldValue('unit');
        var dropdown_base = block.getFieldValue('base');

        var multiplier;
        switch(dropdown_unit) {
            case 'HOUR':
                multiplier=60000*24;
                break;
            case 'MINUTE':
                multiplier=60000;
                break;
            case 'SECOND':
                multiplier=1000;
                break;
            default:
                multiplier=1;
        }

        var schedule=getScheduleValue(block);
        var code = 'context.schedule('+getParam(schedule.id)+','+getParam(schedule.name)+', '+multiplier+'*('+value_schedule+'),"'+dropdown_base+'");\n';
        return code;
    };


    Blockly.Blocks['cancel_schedule'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Cancel Schedule")
                .appendField(new Blockly.FieldSchedule('...',{type:'one-time'}),'selectedSchedule');
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(65);
            this.setTooltip('The specified schedule will not get executed as planned and will be disabled');
            //this.setHelpUrl('http://www.example.com/');
        }
    };

    Blockly.JavaScript['cancel_schedule'] = function(block) {
        var schedule=getScheduleValue(block);
        var code = 'context.cancelSchedule('+getParam(schedule.id)+','+getParam(schedule.name)+');\n';
        return code;
    };

    Blockly.Blocks['follow_schedule'] = {
        init: function() {

            this.appendDummyInput()
                .appendField("Follow schedule")
                .appendField(new Blockly.FieldSchedule('...',{type:'value'}),'selectedSchedule');

            this.appendDummyInput()
                .appendField("on")
                .appendField(new Blockly.FieldSensor('...',{class: {$in :[SensorClasses.ANALOG_OUTPUT,SensorClasses.ANALOG_OUTPUT_0_100]}}),'selectedSensor')
            this.setInputsInline(true);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(330);
            this.setTooltip('Force output to follow analog value schedule');
        }
    };

    Blockly.JavaScript['follow_schedule'] = function(block) {
        var value=getSensorValue(block);
        var schedule=getScheduleValue(block);
        var code = 'context.followSchedule('+getParam(schedule.id)+','+getParam(schedule.name)+','+getParam(value.id)+','+getParam(value.name)+');\n';
        return code;
    };


    Blockly.Blocks['switch'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Switch")
                .appendField(new Blockly.FieldDropdown([["on", SENSOR_ACTIONS.SWITCH_ON], ["off", SENSOR_ACTIONS.SWITCH_OFF], ["over", SENSOR_ACTIONS.SWITCH_OVER]]), "operation")
                .appendField(new Blockly.FieldSensor('...'),'selectedSensor');
            this.setInputsInline(true);
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(330);
            this.setTooltip('Switch an output (relay, dimmer etc.)');
        }
    };


    Blockly.JavaScript['switch'] = function(block) {
        var dropdown_operation = block.getFieldValue('operation');
        switch(dropdown_operation) {
            case SENSOR_ACTIONS.SWITCH_ON: dropdown_operation='SENSOR_ACTIONS.SWITCH_ON';break;
            case SENSOR_ACTIONS.SWITCH_OFF: dropdown_operation='SENSOR_ACTIONS.SWITCH_OFF';break;
            case SENSOR_ACTIONS.SWITCH_OVER: dropdown_operation='SENSOR_ACTIONS.SWITCH_OVER';break;
        }
        var value=getSensorValue(block);
        var code = 'context.switchOutput('+dropdown_operation+','+getParam(value.id)+','+getParam(value.name)+');\n';
        return code;
    };


    Blockly.Blocks['waitFor'] = {
        init: function() {
            this.appendValueInput("condition")
                .setCheck("Boolean")
                .appendField("Wait for");
            this.appendDummyInput()
                .appendField("to become true");
            this.setInputsInline(true);
            this.appendStatementInput("statements")
                .appendField("then");
            this.setPreviousStatement(true);
            this.setNextStatement(false);
            this.setColour(65);
            this.setTooltip('Execute included blocks after a condition is met');
            this.setMutator(new Blockly.Mutator(['onCancelMutator','onPauseMutator','onContinueMutator']));
        },

        mutationToDom: function() {
            var container = document.createElement('mutation');
            container.setAttribute('hasContinue', this.hasContinue==true);
            container.setAttribute('hasPause', this.hasPause==true);
            container.setAttribute('hasCancel', this.hasCancel==true);
            return container;
        },

        domToMutation: function(xmlElement) {
            this.hasPause = xmlElement.getAttribute('haspause')=='true';
            if(this.hasPause) this.appendStatementInput("pause_statement")
                .appendField("on pause");
            this.hasContinue = xmlElement.getAttribute('hascontinue')=='true';
            if(this.hasContinue) this.appendStatementInput("continue_statement")
                .appendField("on continue");
            this.hasCancel = xmlElement.getAttribute('hascancel')=='true';
            if(this.hasCancel) this.appendStatementInput("cancel_statement")
                .appendField("on cancel or timeout of").appendField(new Blockly.FieldTextInput("30"), "timeout").appendField("minutes");
        },

        decompose: function(workspace) {
            var containerBlock = Blockly.Block.obtain(workspace, 'waitForMutator');
            containerBlock.initSvg();
            var connection = containerBlock.getInput('STACK').connection;
            if (this.hasPause===true) {
                var pauseBlock = Blockly.Block.obtain(workspace, 'onPauseMutator');
                pauseBlock.initSvg();
                connection.connect(pauseBlock.previousConnection);
                connection=pauseBlock.nextConnection;
            }
            if (this.hasContinue===true) {
                var continueBlock = Blockly.Block.obtain(workspace, 'onContinueMutator');
                continueBlock.initSvg();
                connection.connect(continueBlock.previousConnection);
                connection=continueBlock.nextConnection;
            }
            if (this.hasCancel===true) {
                var cancelBlock = Blockly.Block.obtain(workspace, 'onCancelMutator');
                cancelBlock.initSvg();
                connection.connect(cancelBlock.previousConnection);
            }
            return containerBlock;
        },

        compose: function(containerBlock) {

            // Disconnect the else input blocks and remove the inputs.
            if (this.hasCancel) this.removeInput('cancel_statement');
            this.hasCancel = false;
            if (this.hasPause) this.removeInput('pause_statement');
            this.hasPause = false;
            if (this.hasContinue) this.removeInput('continue_statement');
            this.hasContinue = false;

            // Rebuild the block's optional inputs.
            var clauseBlock = containerBlock.getInputTargetBlock('STACK');
            while (clauseBlock) {
                switch (clauseBlock.type) {
                    case 'onPauseMutator':
                        this.hasPause=true;
                        var elseInput = this.appendStatementInput('pause_statement');
                        elseInput.appendField("on pause");
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    case 'onContinueMutator':
                        this.hasContinue=true;
                        var elseInput = this.appendStatementInput('continue_statement');
                        elseInput.appendField("on continue");
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    case 'onCancelMutator':
                        this.hasCancel=true;
                        var elseInput = this.appendStatementInput('cancel_statement');
                        elseInput.appendField("on cancel or timeout of").appendField(new Blockly.FieldTextInput("30"), "timeout").appendField("minutes");
                        // Reconnect any child blocks.
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    default:
                        throw 'Unknown block type.';
                }
                clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
            }
        },
    };

    Blockly.Blocks['waitForMutator'] = {
        init: function() {
            this.setColour(Blockly.Blocks.logic.HUE);
            this.appendDummyInput()
                .appendField('Wait for');
            this.appendStatementInput('STACK').setCheck(["cancel","init"]);
            this.contextMenu = false;
        }
    };

    Blockly.JavaScript['waitFor'] = function(block) {
        var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
        var cancel_statements = Blockly.JavaScript.statementToCode(block, 'cancel_statement');
        var pause_statements = Blockly.JavaScript.statementToCode(block, 'pause_statement');
        var continue_statements = Blockly.JavaScript.statementToCode(block, 'continue_statement');
        var timeout = parseInt(block.getFieldValue('timeout'));
        if(isNaN(timeout) || timeout<0) timeout=5;
        if(timeout===0) timeout=Infinity;
        timeout*=60000;
        // TODO: Assemble JavaScript into code variable.
        var condition = 'function (context) { return '+Blockly.JavaScript.valueToCode(block, 'condition', Blockly.JavaScript.ORDER_ATOMIC)+'; }';
        if(condition.length===0) condition='false';

        return code;

        let pause=pause_statements==='' ? 'undefined,\n' :
            ('function(context, whenDone) {\n      var callCompletion=true;\n  '+pause_statements+      '    if (callCompletion) whenDone(context);\n   },\n');
        let cont=continue_statements==='' ? 'undefined,\n' :
            ('function(context, whenDone) {\n      var callCompletion=true;\n  '+continue_statements+      '    if (callCompletion) whenDone(context);\n   },\n');
        let cancel=cancel_statements==='' ? 'undefined, whenDone);\n' :
            ('   function(context,whenDone) {\n      var callCompletion=true;\n'+cancel_statements+   '      if (callCompletion) whenDone(context);\n   },\n   whenDone);')
        var code = 'callCompletion=false;\ncontext.waitFor( '+timeout+','+condition+
            ',function(context, whenDone) {\n      var callCompletion=true;\n  '+statements_statements+'    if (callCompletion) whenDone(context);\n   },\n' +
            pause +
            cont +
            cancel;
        return code;

    };

    Blockly.Blocks['after'] = {
        init: function() {

            this.appendValueInput("delay")
                .setCheck("Number")
                .appendField("After");
            this.appendDummyInput()
                .appendField(new Blockly.FieldDropdown([["minutes", "MINUTES"], ["seconds", "SECONDS"], ["miliseconds", "MILISECONDS"]]), "unit");
            this.setInputsInline(true);
            this.appendStatementInput("statements")
                .appendField("do");
            this.setPreviousStatement(true);
            this.setNextStatement(false);
            this.setColour(65);
            this.setTooltip('Execute included blocks after a specified delay');
            this.setMutator(new Blockly.Mutator(['onCancelMutator','onPauseMutator','onContinueMutator']));
        },

        mutationToDom: function() {
            var container = document.createElement('mutation');
            container.setAttribute('hasPause', this.hasPause==true);
            container.setAttribute('hasContinue', this.hasContinue==true);
            container.setAttribute('hasCancel', this.hasCancel==true);
            return container;
        },

        domToMutation: function(xmlElement) {
            this.hasPause = xmlElement.getAttribute('haspause')=='true';
            if(this.hasPause) this.appendStatementInput("pause_statement")
                .appendField("on pause");
            this.hasContinue = xmlElement.getAttribute('hascontinue')=='true';
            if(this.hasContinue) this.appendStatementInput("continue_statement")
                .appendField("on continue");
            this.hasCancel = xmlElement.getAttribute('hascancel')=='true';
            if(this.hasCancel) this.appendStatementInput("cancel_statement")
                .appendField("on cancel");
        },

        decompose: function(workspace) {
            var containerBlock = Blockly.Block.obtain(workspace, 'afterMutator');
            containerBlock.initSvg();
            var connection = containerBlock.getInput('STACK').connection;
            if (this.hasPause===true) {
                var pauseBlock = Blockly.Block.obtain(workspace, 'onPauseMutator');
                pauseBlock.initSvg();
                connection.connect(pauseBlock.previousConnection);
                connection=pauseBlock.nextConnection;
            }
            if (this.hasContinue===true) {
                var continueBlock = Blockly.Block.obtain(workspace, 'onContinueMutator');
                continueBlock.initSvg();
                connection.connect(continueBlock.previousConnection);
                connection=continueBlock.nextConnection;
            }
            if (this.hasCancel===true) {
                var cancelBlock = Blockly.Block.obtain(workspace, 'onCancelMutator');
                cancelBlock.initSvg();
                connection.connect(cancelBlock.previousConnection);
            }
            return containerBlock;
        },

        compose: function(containerBlock) {
            // Disconnect the else input blocks and remove the inputs.
            if (this.hasCancel) this.removeInput('cancel_statement');
            this.hasCancel = false;
            if (this.hasPause) this.removeInput('pause_statement');
            this.hasPause = false;
            if (this.hasContinue) this.removeInput('continue_statement');
            this.hasContinue = false;

            // Rebuild the block's optional inputs.
            var clauseBlock = containerBlock.getInputTargetBlock('STACK');
            while (clauseBlock) {
                switch (clauseBlock.type) {
                    case 'onPauseMutator':
                        this.hasPause=true;
                        var elseInput = this.appendStatementInput('pause_statement');
                        elseInput.appendField("on pause");
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    case 'onContinueMutator':
                        this.hasContinue=true;
                        var elseInput = this.appendStatementInput('continue_statement');
                        elseInput.appendField("on continue");
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    case 'onCancelMutator':
                        this.hasCancel=true;
                        var elseInput = this.appendStatementInput('cancel_statement');
                        elseInput.appendField("on cancel");
                        // Reconnect any child blocks.
                        if (clauseBlock.statementConnection_) {
                            elseInput.connection.connect(clauseBlock.statementConnection_);
                        }
                        break;
                    default:
                        throw 'Unknown block type.';
                }
                clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
            }
        },
    };

    Blockly.Blocks['afterMutator'] = {
        init: function() {
            this.setColour(Blockly.Blocks.logic.HUE);
            this.appendDummyInput()
                .appendField('After');
            this.appendStatementInput('STACK').setCheck(["cancel","init"]);
            this.contextMenu = false;
        }
    };

    Blockly.Blocks['onCancelMutator'] = {
        init: function() {
            this.setColour(Blockly.Blocks.logic.HUE);
            this.appendDummyInput()
                .appendField('On cancel');
            this.setPreviousStatement(true);
            this.setTooltip("Executed when the action is canceled while waiting");
            this.contextMenu = false;
        }
    };

    Blockly.Blocks['onPauseMutator'] = {
        init: function() {
            this.setColour(Blockly.Blocks.logic.HUE);
            this.appendDummyInput()
                .appendField('On pause');
            this.setPreviousStatement(true,'init');
            this.setNextStatement(true,'pause');
            this.setTooltip("Executed when the action processing is paused");
            this.contextMenu = false;
        }
    };

    Blockly.Blocks['onContinueMutator'] = {
        init: function() {
            this.setColour(Blockly.Blocks.logic.HUE);
            this.appendDummyInput()
                .appendField('On continue');
            this.setPreviousStatement(true,'pause');
            this.setNextStatement(true,'cancel');
            this.setTooltip("Executed when the action is resumed before it has been paused previously");
            this.contextMenu = false;
        }
    };

    Blockly.JavaScript['after'] = function(block) {
        var dropdown_unit = block.getFieldValue('unit');
        var statements_statements = Blockly.JavaScript.statementToCode(block, 'statements');
        var pause_statements = Blockly.JavaScript.statementToCode(block, 'pause_statement');
        var continue_statements = Blockly.JavaScript.statementToCode(block, 'continue_statement');
        var cancel_statements = Blockly.JavaScript.statementToCode(block, 'cancel_statement');
        // TODO: Assemble JavaScript into code variable.
        var value_delay = Blockly.JavaScript.valueToCode(block, 'delay', Blockly.JavaScript.ORDER_ATOMIC);
        var multiplier;
        switch(dropdown_unit) {
            case 'MINUTES':
                multiplier=60000;
                break;
            case 'SECONDS':
                multiplier=1000;
                break;
            default:
                multiplier=1;
        }

        let pause=pause_statements==='' ? 'undefined,\n' :
            ('function(context, whenDone) {\n      var callCompletion=true;\n  '+pause_statements+      '    if (callCompletion) whenDone(context);\n   },\n');
        console.log(pause);

        let cont=continue_statements==='' ? 'undefined,\n' :
            ('function(context, whenDone) {\n      var callCompletion=true;\n  '+continue_statements+      '    if (callCompletion) whenDone(context);\n   },\n');
        let cancel=cancel_statements==='' ? 'undefined, whenDone);\n' :
            ('   function(context,whenDone) {\n      var callCompletion=true;\n'+cancel_statements+   '      if (callCompletion) whenDone(context);\n   },\n   whenDone);')
        var code = 'callCompletion=false;\ncontext.setTimeout( ('+value_delay+')*'+multiplier+
            ',function(context, whenDone) {\n      var callCompletion=true;\n  '+statements_statements+'    if (callCompletion) whenDone(context);\n   },\n' +
               pause +
               cont +
               cancel;
        return code;
    };

    Blockly.Blocks['action_status'] = {
        init: function() {
            this.appendDummyInput()
                .appendField("Set Action Status")
                .appendField(new Blockly.FieldTextInput("In progress..."), "status");
            this.setPreviousStatement(true);
            this.setNextStatement(true);
            this.setColour(120);
            this.setTooltip('Sets a message visible on the dashboard during the action execution');
        }
    };

    Blockly.JavaScript['action_status'] = function(block) {
        var text_status = block.getFieldValue('status');
        var code = 'context.status='+EJSON.stringify(text_status)+';\n';
        return code;
    };

    Blockly.Blocks['action'] = {
            init: function() {
                this.appendDummyInput()
                    .appendField("Action");
                this.appendStatementInput("NAME");
                this.setColour(230);
                this.setTooltip('Execute the contained statements when the action is launched');
//                this.setHelpUrl('http://www.example.com/');
                this.setDeletable(false);
            }
    };


    Blockly.JavaScript['action'] = function(block) {
        var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
        var code = 'function(context,whenDone) {\n  var callCompletion=true;\n'+statements_name+'\n  if (callCompletion) whenDone(context); \n}';
        return code;
    };

    Blockly.Blocks['notify'] = {
        init: function() {
            this.appendValueInput("subject")
                .setCheck("String")
                .appendField("Send ")
                .appendField(new Blockly.FieldDropdown([["info",Collections.Notifications.Severity.info], ["warning", Collections.Notifications.Severity.warning], ["emergency", Collections.Notifications.Severity.emergency]]), "severity")
                .appendField("notification with subject");
            this.appendValueInput("body")
                .setCheck("String")
                .appendField("         ")
                .appendField(new Blockly.FieldDropdown([["immediately", Collections.Notifications.Urgency.immediately], ["in a daily summary", Collections.Notifications.Urgency.daily]]), "urgency")
                .appendField("with body");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(Blockly.Blocks.texts.HUE);
            this.setTooltip('Send notification (email) so that you can put the system back on tracks');
        }
    };

    Blockly.JavaScript['notify'] = function(block) {
        var dropdown_severity = block.getFieldValue('severity');
        var value_subject = Blockly.JavaScript.valueToCode(block, 'subject', Blockly.JavaScript.ORDER_ATOMIC);
        var dropdown_urgency = block.getFieldValue('urgency');
        var value_body = Blockly.JavaScript.valueToCode(block, 'body', Blockly.JavaScript.ORDER_ATOMIC);

        var code = 'context.sendNotification('+EJSON.stringify(dropdown_severity)+','+EJSON.stringify(dropdown_urgency)+','+value_subject+','+value_body+');\n';
        return code;
    };



}