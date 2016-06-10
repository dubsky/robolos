Template.homepage.renderCount=function(count) {
    if(count===undefined || count===0) return 'No'; else return count;
}

Template.homepage.helpers({


    actionCount: function() {
        return Template.homepage.renderCount(Collections.Actions.find().count());
    },

    sensorCount: function() {
        return Template.homepage.renderCount(SensorsCollection.find().count());
    },

    dashboardCount: function() {
        return Template.homepage.renderCount(Collections.Dashboards.find().count());
    },

    scheduleCount: function() {
        return Template.homepage.renderCount(Collections.Schedules.find().count());
    }
});

Router.route('/', function () {
    this.render('homepage');
}, {
    waitOn: function() {
        return Meteor.subscribe('settings');
    }
});

Router.route('homepage',{
    waitOn: function() {
        return Meteor.subscribe('settings');
    }
});