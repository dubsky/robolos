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

    getEmailAddress(user) {
        if(user.emails==undefined || user.emails[0]==undefined ||user.emails[0].address==undefined) return;
        return Meteor.user().emails[0].address;
    }

    sendTestEmail() {
        try {
            let user=Meteor.user();
            if(user===undefined) throw new Exception('Not logged-in');
            let address=this.getEmailAddress(user);
            if(address===undefined) throw new Exception('User doesn\'t have an email address');
            Email.send({
                to: address,
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

    getRecipientList() {
        let results=[];
        Meteor.users.find({'profile.receivesNotifications' : true}).forEach((u)=> {
            let address=this.getEmailAddress(u);
            if(address!==undefined) results[results.length]=address;
        });
        return results;
    }


    sendNotification(severity,urgency,subject,body) {
        if(urgency===Collections.Notifications.Urgency.immediately) {
            let recipients=this.getRecipientList();
            if(recipients.length>0) {
                try {
                    Email.send({
                        to: recipients,
                        from: "do-not-reply@robolos.org",
                        subject: "[robolos][" + Collections.Notifications.SeverityLabels[severity] + "] " + subject,
                        html: SSR.render('immediate-notification', { severity:severity,timestamp:new Date(),subject:subject,body:body})
                    });
                }
                catch(e)
                {
                    log.error('Unexpected error distributing notifications',e);
                }
            }
        }
        else {
            let notificationsDocument=Collections.Notifications.findOne(Collections.Notifications.NOTIFICATIONS_DOCUMENT_ID);
            if(notificationsDocument===undefined) {
                notificationsDocument={_id:Collections.Notifications.NOTIFICATIONS_DOCUMENT_ID,pendingNotifications: []};
            }
            notificationsDocument.pendingNotifications[notificationsDocument.pendingNotifications.length]={
                timestamp: new Date(),
                severity:severity,
                subject:subject,
                body:body
            };
            Collections.Notifications.upsert(notificationsDocument._id,notificationsDocument);
        }
    }

    sendDailyNotifications(notifications) {
        let recipients=this.getRecipientList();
        if(recipients.length>0 && notifications.length>0) {
            try {
                Email.send({
                    to: recipients,
                    from: "do-not-reply@robolos.org",
                    subject: "[robolos] Daily event summary",
                    html: SSR.render('daily-notification', {notifications: notifications})
                });
            }
            catch(e)
            {
                log.error('Unexpected error distributing notifications',e);
            }
        }
    }

    prepareDailyJob() {
        SyncedCron.add({
            name: 'notification-sender',
            schedule: function(parser) {
                // parser is a later.js.parse object
                return parser.recur().on('18:00:00').time();
            },
            job: function() {
                try {
                    log.event(
                        function() {
                            return ['Daily notifications distribution job'];
                        }
                    );
                    let notificationsDocument=Collections.Notifications.findOne(Collections.Notifications.NOTIFICATIONS_DOCUMENT_ID);
                    if(notificationsDocument!==undefined) {
                        this.sendDailyNotifications(notificationsDocument.pendingNotifications);
                        Collections.Notifications.remove(Collections.Notifications.NOTIFICATIONS_DOCUMENT_ID)
                    }
                }
                catch(e)
                {
                    log.error('Error sending notification emails',e);
                }
            }
        });
    }

    start() {
        SSR.compileTemplate('daily-notification', Assets.getText('daily-notification.html'))
        SSR.compileTemplate('immediate-notification', Assets.getText('immediate-notification.html'))
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