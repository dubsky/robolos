Template.homepage.renderCount=function(count) {
    if(count===undefined || count===0) return 'No'; else return count;
}

Template.homepage.helpers({

    dashboardCount: function() {
        return Template.homepage.renderCount(Collections.Dashboards.find().count());
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

var wait={
    waitOn: function() {
        return Meteor.subscribe('systemStatistics');
    }
};

Router.route('/', loadStats, wait);
Router.route('homepage',loadStats,wait);