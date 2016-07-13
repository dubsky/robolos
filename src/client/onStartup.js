USER_ROLE="CURRENT_USER_ROLE";

var routesConfigured=false;

var settingsReady=function() {

    let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
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
            Meteor.subscribe('userSettings',false,{ onReady: function() {
                let settings=Collections.Settings.findOne(Collections.Settings.USER_SETTINGS_DOCUMENT_ID,{reactive:false});
                Session.set(USER_ROLE,settings.role);
            } } );
        }

    });

    if(!routesConfigured)
    {
        AccountsTemplates.configureRoute('signIn');
        AccountsTemplates.configureRoute('changePwd');
        routesConfigured=true;
    }

    let softPages=settings.anonymousAccessToDashboards ? ['/','homepage', 'render.dashboard.redirect', 'render.dashboard','calendar']: [];
    let allSoftPages=_.pluck(AccountsTemplates.routes, 'name').concat(softPages);
    Router.plugin('ensureSignedIn', {
        except: allSoftPages
    });

};

let ApplicationController = RouteController.extend({
    layoutTemplate: 'layout',
    waitOn: function () { return Meteor.subscribe('userSettings', { onReady: settingsReady } ); },
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
    controller: ApplicationController
});

Meteor.startup(function() {
    AutoForm.setDefaultTemplate("semanticUI");
    Uploader.uploadUrl = Meteor.absoluteUrl("upload"); // Cordova needs absolute URL
});

