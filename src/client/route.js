

Meteor.subscribe('settings',{
    onReady: function() {

        let settings=Collections.Settings.findOne(Collections.Settings.SETTINGS_DOCUMENT_ID);
        AccountsTemplates._initialized = false;

        Router.configure({
            /* loadingTemplate: 'loading',
             notFoundTemplate: 'notFound',*/
            layoutTemplate: 'layout'
        });

        Router.onBeforeAction(function () {
            var context=EditContext.getContext();
            if(context!==undefined) context.contextHook(this);
            this.next();
        });


        AccountsTemplates.configure({
            defaultLayout: 'layout',
            forbidClientAccountCreation: !settings.selfRegistration,
            enablePasswordChange:true,
            onLogoutHook: function() {
                Router.go('homepage');
            }
        });

        AccountsTemplates.configureRoute('signIn');
        AccountsTemplates.configureRoute('changePwd');

        let softPages=settings.anonymousAccessToDashboards ? ['homepage', 'render.dashboard.redirect', 'render.dashboard','calendar']: [];
        Router.plugin('ensureSignedIn', {
            except: _.pluck(AccountsTemplates.routes, 'name').concat(softPages)
        });
        //Router.go('homepage');
    }
});

/*
Router.onBeforeAction(function () {
    let self=this;
    Meteor.subscribe('settings',{
        onReady: function() {
            self.next();
        }
    });
});
*/