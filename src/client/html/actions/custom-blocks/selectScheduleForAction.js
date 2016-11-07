Template.selectScheduleForAction.helpers({
    emptySelection : function() {
        var selection=Session.get('selectedSchedule');
        return (typeof selection==='undefined') || selection===null;
    }
});

Template.selectScheduleForAction.events({

    'click .selectSchedule': function(event, instance) {
        var schedule=Session.get('selectedSchedule');
        var scheduleName=Session.get('selectedScheduleName');
        Blockly.FieldSchedule.activeBlock.setText(scheduleName);
        //console.log(EJSON.stringify({ id: schedule, name: scheduleName}));
        if((typeof scheduleName)==='undefined') scheduleName=schedule;
        Blockly.FieldSchedule.activeBlock.setValue(EJSON.stringify({ id: schedule, name: scheduleName}));
    }
});

Template.selectScheduleForAction.rendered=function() {
    Session.set('selectedSchedule',null);
    SemanticUI.modal('#selectScheduleBlock');

}