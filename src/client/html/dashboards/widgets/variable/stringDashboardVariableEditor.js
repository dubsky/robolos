Template.stringDashboardVariableEditor.onSave=function(formId,variableId) {
    var newValue=$('#'+formId+' .stringVariableValueSelection').dropdown('get value');

    if(newValue!==undefined && newValue!=null && newValue!='')
    {
        var auto=$('#'+formId+' .autoCheckbox');
        if(auto.length>0) {
            ConnectionManager.call('updateVariable', {$set: { stringValue: newValue, allowAutomaticControl: auto.checkbox('is checked') } },variableId);
        }
        else
        {
            ConnectionManager.call('updateVariable', {$set: { stringValue: newValue } },variableId);
        }
        $('.popupEditor').popup('hide');

    }
}

Template.stringDashboardVariableEditor.onCancel=function(formId,variableId) {
    $('.popupEditor').popup('hide');
}
