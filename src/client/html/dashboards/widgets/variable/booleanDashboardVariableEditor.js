
Template.booleanDashboardVariableEditor.onSave=function(formId,variableId) {
        var newValue=$('#'+formId+' .valueCheckbox').checkbox('is checked');
        var auto=$('#'+formId+' .autoCheckbox');
        ConnectionManager.call('updateVariable', {$set: { booleanValue: newValue, allowAutomaticControl: auto.checkbox('is checked') } },variableId);
        $('.popupEditor').popup('hide');
}

Template.booleanDashboardVariableEditor.onCancel=function(formId,variableId) {
        $('.popupEditor').popup('hide');
}
