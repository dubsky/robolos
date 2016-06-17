
var routesConfigured=false;

var settingsReady=function() {

    let settings=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
    AccountsTemplates._initialized = false;

    AccountsTemplates.configure({
        defaultLayout: 'layout',
        forbidClientAccountCreation: !settings.selfRegistration,
        enablePasswordChange:true,
        onLogoutHook: function() {
            Router.go('homepage');
        }
    });

    if(!routesConfigured)
    {
        AccountsTemplates.configureRoute('signIn');
        AccountsTemplates.configureRoute('changePwd');
        routesConfigured=true;
    }

    let softPages=settings.anonymousAccessToDashboards ? ['homepage', 'render.dashboard.redirect', 'render.dashboard','calendar']: [];
    console.log('anonymousAccessToDashboards',settings.anonymousAccessToDashboards);
    Router.plugin('ensureSignedIn', {
        except: _.pluck(AccountsTemplates.routes, 'name').concat(softPages)
    });

};

let ApplicationController = RouteController.extend({
    layoutTemplate: 'layout',
    waitOn: function () { return Meteor.subscribe('settings', { onReady: settingsReady } ); },
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

/*
Router.onBeforeAction(function () {
 var context=EditContext.getContext();
 if(context!==undefined) context.contextHook(this);
 this.next();
});
*/