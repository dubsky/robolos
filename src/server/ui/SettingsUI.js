Meteor.publish("settings", function(){
    Accounts.checkAdminAccess(this);

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


isLocalAccess=function(settings,context) {
    let anonymousAccessToDashboards=settings.anonymousAccessToDashboards;
    if(settings.privateAddressPattern!==undefined) {
        let re=new RegExp(settings.privateAddressPattern);
        return re.test(context.connection.clientAddress);
    }
    return false;
};


Meteor.publish("userSettings", function(){
    // safe reference to this session
    var self = this;
    // insert a record for the first time

    let filter=function(settings) {
        let result={};

        result.selfRegistration=settings.selfRegistration;
        result.anonymousAccessToDashboards=settings.anonymousAccessToDashboards;

        if (!isLocalAccess(settings,self))
        {
            result.selfRegistration=false;
            result.anonymousAccessToDashboards=false;
        }

        let userDoc=Meteor.users.findOne(self.userId);
        result.role=userDoc==null ? Collections.Users.RoleKeys.observer : userDoc.role;
        if(result.role==null) result.role=Collections.Users.RoleKeys.administrator;
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
        Accounts.checkAdminAccess(this);
        Settings.update(settings);
    }
});
