class UsersUIClass extends Observable {

}

UsersUI=new UsersUIClass();

Meteor.publish('userAccounts', function(filter,reactive) {
    var self = this;
    let fields={fields: { profile:1, username:1, emails:1, createdAt:1,_id:1}};
    var cursor;
    if (filter == undefined) {
        cursor = Meteor.users.find();
    }
    else {
        cursor = Meteor.users.find(filter);
    }

    cursor.forEach(
        function (user) {
            //if(user._id!=self.userId)
            self.added("userAccounts", user._id, user);
        }
    );

    self.ready();

    var userListenerId = UsersUI.addEventListener({
        onUpdate: function (user) {
            self.changed("userAccounts", user._id, user);
        },
        onCreate: function (user) {
            self.added("userAccounts", user._id, user);
        },
        onRemove: function (id) {
            self.removed("userAccounts", id);
        }
    });

    self.onStop(function () {
        UsersUI.removeEventListener(userListenerId);
    });
});


Meteor.methods({
    addUser : function(doc) {
        Accounts.checkAdminAccess(this);
        try {
            let selector={ 'emails.address': doc.email};
            if (Meteor.users.findOne(selector)!=null) throw new Exception('User with the given email address already exists');
            Accounts.createUser({
                username: doc.email,
                email : doc.email,
                password : doc.password,
                role: doc.role,
                profile  : {
                    receivesNotifications: doc.receivesNotifications
                }
            });
            //Meteor.users.update(selector,{$set : { role: doc.role}});
            let u=Meteor.users.findOne(selector);
            UsersUI.fireCreateEvent(u);
        }
        catch(e) {
            log.error('Error creating user',e);
            return e.message;
        }
    },

    updateUser : function(doc) {
        if(doc._id!==this.userId) Accounts.checkAdminAccess(this); else delete doc.role;
        let id=doc._id;
        var modifier={$set : {}};
        if(doc.role!=undefined) modifier.$set.role=doc.role;
        modifier.$set['profile.receivesNotifications']=doc.receivesNotifications;
        Meteor.users.update(id,modifier);
        if(doc.password!=undefined && doc.password!='@@@@@@') Accounts.setPassword(id,doc.password);
        let u=Meteor.users.findOne(id);
        UsersUI.fireUpdateEvent(u);
    },

    isEmailUsed: function (email) {
        "use strict";
        let used=Meteor.users.findOne({ 'emails.address': email})!=null;
        return used;
    },

    deleteUsers : function(list) {
        Accounts.checkAdminAccess(this);
        "use strict";
        for(let i in list)
        {
            Meteor.users.remove(list[i]);
            UsersUI.fireRemoveEvent(list[i]);
        }
    }
});


Accounts.checkAdminAccess=function(context) {
    let settings=Settings.get();
    if(context.userId===null) {
        if((settings.requireUserLogin===undefined || !settings.requireUserLogin) && isLocalAccess(settings,context)) return;
    }

    if(context.userId===null) throw new Meteor.Error('not-authorized');
    let user=Meteor.users.findOne(context.userId);
    if (user===null || Collections.Users.RoleKeys.administrator !== user.role) {
        log.debug('access denied');
        throw new Meteor.Error('not-authorized');
    }
}

Accounts.checkDashboardAccess=function(context) {

    let settings=Settings.get();
    if(context.userId===null) {
        if(settings.anonymousAccessToDashboards || (settings.requireUserLogin===undefined || !settings.requireUserLogin)) {
            if(!isLocalAccess(settings,context)) {
                log.error('access denied, anonymous access non local address');
                throw new Meteor.Error('not-authorized');
            }
        }
        else {
            log.error('access denied, anonymous user');
            throw new Meteor.Error('not-authorized');
        }
    }
    else {
        // even observer can see dashboards
    }
}

Accounts.onCreateUser(function(options, user) {
    if (options.role)
    {
        user.role=options.role;
    }
    else {
        if(Meteor.users.find().count()===0) {
            user.role=Collections.Users.RoleKeys.administrator;
        }
        else {
            user.role=Collections.Users.RoleKeys.observer;
        }
    }
    return user;
});
