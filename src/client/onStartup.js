USER_ROLE="CURRENT_USER_ROLE";


var routesConfigured=false;

var settingsReady=function() {
    let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
    if(settings==undefined) { console.log('No settigs received so far !'); return; }
    Session.set(USER_ROLE,settings.role);

    AccountsTemplates._initialized = false;

    AccountsTemplates.configure({
        defaultLayout: 'layout',
        forbidClientAccountCreation: !settings.selfRegistration,
        enablePasswordChange:true,
        onLogoutHook: function() {
            Session.set(USER_ROLE,Collections.Users.RoleKeys.observer);
            Router.go('homepage');
        },
        onSubmitHook: function() {
            App.subscribeNoCaching('userSettings',false,{ onReady: function() {
                let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
                Session.set(USER_ROLE,settings.role === undefined ? Collections.Users.RoleKeys.administrator : settings.role);
            } } );
        }

    });

    if(!routesConfigured)
    {
        AccountsTemplates.configureRoute('signIn');
        AccountsTemplates.configureRoute('changePwd');
        routesConfigured=true;
    }

    if(settings.requireUserLogin)
    {
        let softPages=settings.anonymousAccessToDashboards ? ['/','homepage', 'render.dashboard.redirect', 'render.dashboard','calendar','render.schedule']: [];
        let allSoftPages=_.pluck(AccountsTemplates.routes, 'name').concat(softPages);
        Router.plugin('ensureSignedIn', {
            except: allSoftPages
        });
    }
};

let ApplicationController = RouteController.extend({
    layoutTemplate: 'layout',
    waitOn: function () {
        if(this.url!=='/setConnection') return Meteor.subscribe('userSettings', { onReady: settingsReady } );
    },
    onBeforeAction : function () {
        var context=EditContext.getContext();
        if(context!==undefined) context.contextHook(this);
        this.next();
    }
});

if(Meteor.isCordova)
{
    Meteor.disconnect();
    Meteor.reconnect({url:'http://localhost:3000', force:true});
//if(Meteor.connection!==undefined) Meteor.connection.onReconnect=()=> { Router.go('homepage'); };
    setInterval(()=> {
        if (!Meteor.status().connected) {
            Router.go('setConnection');
        }
    }, 3000);
}

Router.configure({
    loadingTemplate: 'loading',
    /* notFoundTemplate: 'notFound',*/
    layoutTemplate: 'layout',
    controller: ApplicationController
});


/*setTimeout(()=> {
    Meteor.disconnect();
},10000);*/

AutoForm.setDefaultTemplate("semanticUI");
Uploader.uploadUrl = Meteor.absoluteUrl("upload"); // Cordova needs absolute URL

