Meteor.publish('log', function(settings){
    Accounts.checkAdminAccess(this);
    var self = this;
    log.forEach(function(d) {
        self.added("log", d._id, d);
    });

    if(settings.update) {
        var id=log.addEventListener(    {
                onCreate : function(event) {
                    self.added("log",event._id,event);
                }
            }
        );

        self.onStop(function(){
            log.removeEventListener(id);
        });
    }

    self.ready();

});
