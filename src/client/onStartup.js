// global session variables
USER_ROLE="CURRENT_USER_ROLE";

let routesConfigured=false;

let settingsReady=function() {
    let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
    if(settings==undefined) { console.log('No settigs received so far !'); return; }
    console.log('settings received',settings);
    Session.set(USER_ROLE,settings.role);

    AccountsTemplates._initialized = false;

    let onUserContextEstablished=function() {
        ConnectionManager.subscribeNoCaching('userSettings',false,{ onReady: function() {
            let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
            Session.set(USER_ROLE,settings.role === undefined ? Collections.Users.RoleKeys.administrator : settings.role);
        } } );

        ConnectionManager.renewPermanentSubscriptions();
    };

    AccountsTemplates.configure({
        defaultLayout: 'layout',
        forbidClientAccountCreation: !settings.selfRegistration,
        enablePasswordChange:true,
        onLogoutHook: function() {
            Session.set(USER_ROLE,Collections.Users.RoleKeys.observer);
            ConnectionManager.reset();
            Router.go('homepage');
        },
        onSubmitHook: onUserContextEstablished,
        postSignUpHook: onUserContextEstablished
    });

    if(!routesConfigured)
    {
        AccountsTemplates.configureRoute('signIn');
        AccountsTemplates.configureRoute('changePwd');
        routesConfigured=true;
    }

    if(settings.requireUserLogin)
    {
        let softPages=settings.anonymousAccessToDashboards ? ['/','homepage', 'render.dashboard.redirect', 'render.dashboard','calendar','render.schedule','no-connection']: ['no-connection'];
        let allSoftPages=_.pluck(AccountsTemplates.routes, 'name').concat(softPages);
        Routing.registerNonLoginPages(allSoftPages);
        Router.plugin('ensureSignedIn', {
            except: allSoftPages
        });

    }
    else
    {
        Routing.setAnonymousAccess(true);
    }
    Router.start();
};

let ApplicationController = RouteController.extend({
    layoutTemplate: 'layout',
    waitOn: function () {
        //if(this.url!=='/no-connection') return ConnectionManager.subscribeNoCaching('userSettings', { onReady: settingsReady } );
    },
    onBeforeAction : function () {
        var context=EditContext.getContext();
        if(context!==undefined) context.contextHook(this);
        this.next();
    }
});

Router.configure({
    loadingTemplate: 'loading',
    /* notFoundTemplate: 'notFound',*/
    layoutTemplate: 'layout',
    controller: ApplicationController,
    autoStart:false
});

ConnectionManager.subscribeNoCaching('userSettings', { onReady: settingsReady });

AutoForm.setDefaultTemplate("semanticUI");
Uploader.uploadUrl = Meteor.absoluteUrl("upload"); // Cordova needs absolute URL

/*
window.onload = function() {
    console.log('onload');
    document.body.innerHtml='Connecting...';
}*/

