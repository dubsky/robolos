SHARED={

    getSensorID : function (driver,device,sensor) {
        return driver+';'+device+';'+sensor;
    },

    getDeviceID : function (driver,device) {
        return driver+';'+device;
    },

    getDateString : function(stamp) {
        if((typeof stamp)==='undefined') return 'Unknown';

        var t=new Date(stamp);
        var now=new Date();

        if(t.getDate()===now.getDate() && t.getMonth()===now.getMonth() && t.getFullYear()=== now.getFullYear())
        {
            return t.toLocaleTimeString();
        }
        return t.toLocaleDateString();
    },

    printStackTrace(e) {
        console.log(e);
        if(e.stack!==undefined) {
            var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
                .replace(/^\s+at\s+/gm, '')
                .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
                .split('\n');
            console.log(stack);
            return stack;
        }
    }
};

let subscriptionManager = new SubsManager({
    // maximum number of cache subscriptions
    cacheLimit: 10,
    // any subscription will be expire after 5 minute, if it's not subscribed again
    expireIn: 5
});

App = {

    subscribeNoCaching:function(topic) {
        return Meteor.subscribe.apply(Meteor,arguments);
    },

    subscribe:function(topic) {
        return subscriptionManager.subscribe.apply(subscriptionManager,arguments);
    },

    call:function(topic) {
        return Meteor.call.apply(Meteor,arguments);
    },


    routeCollection: function(collection,additionalWaitList) {
        Router.route(collection,
            function () {
                this.render(collection);
            },
            {
                name: collection,
                waitOn: function() {
                    return [Meteor.subscribe(collection, {onReady: function() {console.log("ready:"+collection);},onStop: function(e) {console.log("stop:"+collection);} })].concat(additionalWaitList);
                }
            }
        );
    }

};

