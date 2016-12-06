class RoutingClass  {

    constructor() {
        this.nonLoginPages={};
    }

    setAnonymousAccess(value) {
        this.anonymousAccess=value;
    }

    routeCollection(collection,additionalWaitList) {
        let self=this;
        Router.route(collection,
            function () {
                this.render(collection);
            },
            {
                name: collection,
                subscriptions: function() {
                    console.log('subscribing');
                    if(self.nonLoginPages[Router.current().route.getName()] || Meteor.userId()!=null || self.anonymousAccess)
                    {
                        let subscriptions=[ConnectionManager.subscribe(collection, { onReady: function() {
                            console.log("ready:"+collection);},onStop: function(e) {console.log("stop:"+collection,e);} })];
                        if(additionalWaitList!==undefined) subscriptions.concat(additionalWaitList());
                        return subscriptions;
                    }
                    else
                    {
                        return [];
                    }
                }
            }
        );
    }

    filterUnauthorizedSubscriptions(f) {
        if(this.nonLoginPages[Router.current().route.getName()] || Meteor.userId()!=null || this.anonymousAccess) {
            return f();
        }
        else
        {
            return [];
        }
    }

    registerNonLoginPages(list) {
        for(let p of list) {
            this.nonLoginPages[p]=true;
        }
    }

}

Routing=new RoutingClass();
