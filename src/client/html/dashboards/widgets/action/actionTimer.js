Template.actionTimer.helpers({

    time: function () {

        var reactive=Template.instance().wait;
        reactive.get();

        var expired=(new Date().getTime()-this.wait.since);
        if(expired>this.wait.duration) expired=this.wait.duration;

        var percent=Math.floor(expired/this.wait.duration*100);
        if(percent>100) percent=100;

        var left=this.wait.duration-expired;

        if(left>100) Meteor.setTimeout(function() {
            reactive.set(left);
        },500);

        var hours=Math.floor(left/3600000);
        var minutes=Math.floor((left-hours*3600000)/60000);
        var seconds=Math.floor(((left-hours*3600000-minutes*60000)/1000));

        return {
            percent:percent,
            eta: ("0" + hours).slice(-2)+':'+("0" + minutes).slice(-2)+':'+("0" + seconds).slice(-2)
        };
    }

});

Template.actionTimer.onCreated(function () {
    // set up local reactive variables
    this.wait = new ReactiveVar(null);
});