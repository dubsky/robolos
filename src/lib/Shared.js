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

App = {

    subscribeNoCaching:function(topic) {
        return Meteor.subscribe.apply(undefined,arguments);
    },

    subscribe:function(topic) {
        return Meteor.subscribe.apply(undefined,arguments);
    },

    call:function(topic) {
        return Meteor.call.apply(undefined,arguments);
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

