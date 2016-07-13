Meteor.publish("settings", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    self.added("settings",Collections.Settings.SETTINGS_DOCUMENT_ID, Settings.get());
    self.ready();

    var id=Settings.addEventListener({
        onUpdate : function(settings) {
            self.changed("settings",Collections.Settings.SETTINGS_DOCUMENT_ID, settings);
        }
    });

    self.onStop(function(){
        Settings.removeEventListener(id);
    });
});


Meteor.publish("userSettings", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    let filter=function(settings) {
        let result={};

        result.selfRegistration=settings.selfRegistration;
        result.anonymousAccessToDashboards=settings.anonymousAccessToDashboards;

        if(settings.privateAddressPattern!==undefined) {
            let re=new RegExp(settings.privateAddressPattern);
            if (!re.test(self.connection.clientAddress))
            {
                result.selfRegistration=false;
                result.anonymousAccessToDashboards=false;
            }
        }

        let userDoc=Meteor.users.findOne(self.userId);
        result.role=userDoc==null ? Collections.Users.RoleKeys.observer : Meteor.users.findOne(self.userId).role;
        return result;
    }

    self.added("settings",Collections.Settings.USER_SETTINGS_DOCUMENT_ID, filter(Settings.get()));
    self.ready();

    var id=Settings.addEventListener({
        onUpdate : function(settings) {
            self.changed("settings",Collections.Settings.USER_SETTINGS_DOCUMENT_ID, filter(settings));
        }
    });

    self.onStop(function(){
        Settings.removeEventListener(id);
    });
});


Meteor.methods({
    updateSettings: function(settings) {
       Settings.update(settings);
    }
});
