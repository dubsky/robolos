
class SchedulesUIClass extends Observable {

}

SchedulesUI=new SchedulesUIClass();


Meteor.publish('schedules', function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    Collections.Schedules.find().forEach(
        function(schedule) {
            schedule.nextExecutionTime=SchedulesInstance.nextExecution(schedule._id);
            self.added("schedules", schedule._id, schedule);
        });


    self.ready();

    var id=SchedulesUI.addEventListener({
        onRemove : function(scheduleId) {
            self.removed("schedules",scheduleId);
        },

        onUpdate : function(schedule) {
            schedule.nextExecutionTime=SchedulesInstance.nextExecution(schedule._id);
            self.changed("schedules",schedule._id, schedule);
        },

        onCreate : function(schedule) {
            //schedule.nextExecutionTime=SchedulesInstance.nextExecution(schedule._id);
            self.added("schedules",schedule._id, schedule);
        }
    });

    self.onStop(function(){
        SchedulesUI.removeEventListener(id);
    });
});



Meteor.methods({
    createSchedule: function(schedule) {
        var id=Collections.Schedules.upsert('',schedule).insertedId;
        var updatedSchedule=Collections.Schedules.findOne(id);
        SchedulesInstance.startSchedule(updatedSchedule);
        SchedulesUI.fireCreateEvent(updatedSchedule);
    },

    deleteSchedule: function(scheduleId) {
        SchedulesInstance.stopSchedule(scheduleId);
        Collections.Schedules.remove({_id:scheduleId});
        SchedulesUI.fireRemoveEvent(scheduleId);
    },

    updateSchedule: function(schedule,scheduleId) {
        Collections.Schedules.update(scheduleId,schedule);
        var updatedSchedule=Collections.Schedules.findOne(scheduleId);
        SchedulesInstance.stopSchedule(scheduleId);
        SchedulesInstance.startSchedule(updatedSchedule);
        SchedulesUI.fireUpdateEvent(updatedSchedule);
    }

});