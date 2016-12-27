//ROUTER_INITIALIZED="ROUTER_INITIALIZED";

let connection;
if(Meteor.isCordova) {
    let url=ClientConfiguration.getServerBaseUrl();
    if(url===undefined) Router.go('no-connection');
    Meteor.disconnect();
    connection=DDP.connect(url);
    connection.onReconnect=(()=>{
        console.log('reconnect:',connection.status());
    });
    Meteor.loginWithPassword=function(a,b,c) { DDP.loginWithPassword(connection,a,b,c); };
    // update collection so they are fed with data properly
    CollectionManager.onConnectionChange(connection);
    // let authentication work against the new connection
    Meteor.connection=connection;
    Accounts=new Package['accounts-base'].AccountsClient({connection:connection});
    Meteor.user=function() { return Accounts.user(); };
    Meteor.users=Accounts.users;
    Meteor.userId=function() { return Accounts.userId(); };
    Meteor.loggingIn=function() { return Accounts.loggingIn.apply(Accounts,arguments); };
    Meteor.logout=function() { return Accounts.logout.apply(Accounts,arguments); };
    Meteor.logoutOtherClients=function() { return Accounts.logoutOtherClients.apply(Accounts,arguments); };
    Meteor.subscribe= function() { return connection.subscribe.apply(connection,arguments); };
}
else {
    connection=Meteor.connection;
    CollectionManager.onConnectionChange(connection);
}


setInterval(()=> {
    if (!connection.status().connected) {
        try { Router.start(); } catch(e) {console.log(e);}
        let settings=Router.current()!==undefined && Router.current().route.getName()==='settings' && !Session.get(NO_CONNECTION_RECHECK);
        let connection=Router.current()!==undefined && Router.current().route.getName()==='no-connection';
        let changeServerURL=Router.current()!==undefined && Router.current().route.getName()==='changeServerURL';
        if( !connection && !settings & !changeServerURL) {
            console.log('not connected; redirecting to set connection');
            Router.go('no-connection');
        }
    }
}, 5000);

let subscriptionManager = new SubscriptionManager({
    connection: connection,
    // maximum number of cache subscriptions
    cacheLimit: 10,
    // any subscription will be expire after 5 minute, if it's not subscribed again
    expireIn: 5
});

/*
class DelayedSubscription {

    constructor(manager,subscriptionArguments) {
        this.subscriptionArguments=subscriptionArguments;
        this.manager=manager;
    }

    notify() {
        console.log('tracker autorun :'+this.subscriptionArguments[0]);
        if(Session.get(ROUTER_INITIALIZED)) {
            console.log('  router initialized,subscribing :'+this.subscriptionArguments[0]);
            if(this.proxyHandle===undefined) this.proxyHandle=connection.subscribe.apply(connection,this.subscriptionArguments);
        }
        if(this.dependency!==undefined) {
            console.log('  dep. changed for:'+this.subscriptionArguments[0]);
            this.dependency.changed();
        }
    }

    subscribe() {
        let self=this;
        return {
            stop() {
                self.manager.removeSubscription(self);
                if(self.proxyHandle!==undefined) self.proxyHandle.stop();
            },

            ready() {
                console.log('asked for ready:'+self.subscriptionArguments[0]);
                if(self.proxyHandle!==undefined) {
                    console.log('  forwarding to real subscription:'+self.subscriptionArguments[0]);
                    return self.proxyHandle.ready();
                }
                console.log('   creating new dependency:'+self.subscriptionArguments[0]);
                if (self.dependency!==undefined) self.dependency=new Tracker.Dependency();
                console.log('   returning false:'+self.subscriptionArguments[0]);
                return false;
            },

            subscriptionId: self.subscriptionArguments[0]
        }
    }
}

class DelayedSubscriptionManagerClass {

    constructor() {
        this.subscriptions = {};

        Tracker.autorun(() => {
            console.log('tracker autorun general');
            if(Session.get(ROUTER_INITIALIZED)) {
                for(let i in this.subscriptions)
                {
                    this.subscriptions[i].notify();
                }
            }
        });
    }

    removeSubscription(subscription) {
        delete this.subscriptions[subscription.subscriptionArguments[0]];
    }

    subscribe(subscriptionArguments) {
        let subscription=new DelayedSubscription(this, subscriptionArguments);
        this.subscriptions[subscription.subscriptionArguments[0]]=subscription;
        return subscription.subscribe();
    }
}

DelayedSubscriptionManager=new DelayedSubscriptionManagerClass();
*/

ConnectionManager = {

    getConnection() {
        return connection;
    },

    subscribeNoCaching:function(topic) {
        return connection.subscribe.apply(connection,arguments);
    },

    subscribe:function(topic) {
        /*
        console.log('subscribe requested:',topic);
        if(Session.get(ROUTER_INITIALIZED)) {
            console.log('  initalized, forwarding to direct subscribe:',topic);
            return connection.subscribe.apply(connection,arguments);
        }
        else {
            console.log('  not initalized yet, delaying',topic);
            return DelayedSubscriptionManager.subscribe(arguments);
        }*/
        //return connection.subscribe.apply(connection,arguments);
        return subscriptionManager.subscribe.apply(subscriptionManager,arguments);
    },

    call:function(topic) {
        return connection.call.apply(connection,arguments);
    },

    apply:function(topic) {
        return connection.apply.apply(connection,arguments);
    },

    reset() {
        subscriptionManager.reset();
    }
};



