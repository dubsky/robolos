Router.configure({
//    loadingTemplate: 'loading',
    /* notFoundTemplate: 'notFound',*/
    layoutTemplate: 'layout',
//    controller: ApplicationController
});

AccountsTemplates.configure({
    defaultLayout: 'layout',
    forbidClientAccountCreation: false,
    enablePasswordChange:true,
    onLogoutHook: function() {
        Router.go('homepage');
    },
    onSubmitHook: function() {
    }

});

AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('changePwd');

Router.plugin('ensureSignedIn');
//AutoForm.setDefaultTemplate("semanticUI");
