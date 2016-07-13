class Notifications {

    applySettings(settings) {
        let server=settings.smtpServer;
        if(server==undefined){ this.mailURL=undefined; return; }
        let url='';
        if(settings.smtpUserName!=undefined) {
            url=settings.smtpUserName;
            if(settings.smtpPassword!=undefined) {
                url+=':'+settings.smtpPassword;
            }
        }
        url=url.replace('@','%40');
        url='smtp://'+url+(url=='' ? '':'@')+server;
        if(server.indexOf(':')<0) {
            let tls=settings.smtpTLS;
            if(tls) url+=':465';
        }
        this.mailURL=process.env.MAIL_URL=url;
    }

    sendTestEmail() {
        try {
            Email.send({
                to: "v.dubsky@gmail.com",
                from: "do-not-reply@robolos.org",
                subject: "[Robolos] Test Email",
                text: "Great, you will now receive email notifications from Robolos !",
            });
            return 'Successful !';
        }
        catch(e) {
            return e+'';
        }

    }

    start() {
        var settings=Settings.get();
        this.applySettings(settings);
        var self=this;
        Settings.addEventListener({
            onUpdate: function (settings) {
                self.applySettings(settings);
            }
        });
    }

}

NotificationsInstance=new Notifications();