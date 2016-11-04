let DEMO_IMPORTED="homepage.demo.imported";

Template.homepage.renderCount=function(count) {
    if(count===undefined || count===0) return 'No'; else return count;
}

Template.homepage.helpers({

    dashboardCount: function() {
        return Template.homepage.renderCount(Collections.Dashboards.find().count());
    },

    demoDisabled: function() {
        return Session.get(DEMO_IMPORTED);
    },

    demoInvisible: function() {
        return Collections.Dashboards.find().count() > 0;
    }
});

Template.homepage.events({
    'click .importDemoData' : function() {
        Session.set(DEMO_IMPORTED, true);
        Meteor.call('importDemoData',function(e) {
            $('#demo-block').transition({animation: 'horizontal flip', duration:1000});
            setTimeout(() => { $('#demo-dashboard').transition({animation: 'horizontal flip', duration:1000}); },1000);
        });
        return false;
    }
});

var loadStats=function () {
    var item = Collections.SystemStatistics.findOne({_id: Collections.SystemStatistics.SYSTEM_STATISTICS_ID });
    if(item==null) {
        this.render('homepage');
    }
    else
    {
        this.render('homepage',{data: item });
    }
};

var wait=function() {
        return Meteor.subscribe('systemStatistics');
};

Template.homepage.onCreated(function() {
    Session.set(DEMO_IMPORTED,false);
});

Router.route('/', loadStats,{name:'/', waitOn:wait});
Router.route('homepage',loadStats,{name:'homepage', waitOn:wait});