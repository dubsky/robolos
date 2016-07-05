var fs = Npm.require('fs');

function getApplicationRoot() {
    var meteor_root = fs.realpathSync( process.cwd() + '/../' );
    var application_root = fs.realpathSync( meteor_root + '/../' );
    if( Npm.require('path').basename( fs.realpathSync( meteor_root + '/../../../' ) ) == '.meteor' ) {
        application_root = fs.realpathSync(meteor_root + '/../../../../');
    }
    return application_root+'/..';
}

getUploadRoot=function getUploadRoot() {
    return getApplicationRoot() + '/uploads'
}

function getResourceBase() {
    var meteor_root = fs.realpathSync( process.cwd() + '/../' );
    var application_root = fs.realpathSync( meteor_root + '/../' );
    // if running on dev mode
    var resourcesLocation;
    if( Npm.require('path').basename( fs.realpathSync( meteor_root + '/../../../' ) ) == '.meteor' ){
        application_root =  fs.realpathSync( meteor_root + '/../../../../' );
        resourcesLocation='/public';
    }
    else {
        resourcesLocation='/programs/web.browser/app';
    }
    return application_root+resourcesLocation;
}

ICON_DIRECTORY=getApplicationRoot()+'/uploads/icons';
FLOORPLAN_DIRECTORY=getApplicationRoot()+'/uploads/floorPlans';

class Uploads extends Observable {
    constructor(collection) {
        super();
        Meteor.publish(collection, function(){

            var self = this;

            function processDirectory(path,idPrefix,decorator) {
                var files=fs.readdirSync(path);
                for(var file in files) {
                    var f=files[file];
                    var id=idPrefix+'-'+f;
                    let object={ _id: id, name: f };
                    decorator(object);
                    if (f.toLowerCase().endsWith('.jpg')||f.toLowerCase().endsWith('.png')) self.added(collection, id, object);
                }
            }

            processDirectory(getResourceBase()+'/sensors','built-in-icon',function(o) { o.icon=true; });
            processDirectory(getResourceBase()+'/floorPlans','built-in-floor-plan',function(o) { o.floorPlan=true; });

            try {
                processDirectory(ICON_DIRECTORY,'icon',function(o) { o.icon=true; o.custom=true; });
                processDirectory(FLOORPLAN_DIRECTORY,'floor-plan',function(o) { o.floorPlan=true; o.custom=true; });
            }
            catch(e)
            {
                log.error('error processing icon images',e);
            }

            self.ready();

            var id=UploadedIconsInstance.addEventListener({
                onRemove : function(path) {
                    self.removed(collection,path);
                },

                onUpdate : function(path) {
                },

                onCreate : function(path) {
                    if(path.startsWith('icons')) {
                        let name=path.substring('icons/'.length+1);
                        let id='icon-'+name;
                        self.added(collection,id, { _id : id, name: name, custom : true, icon:true });
                    }
                    if(path.startsWith('floorPlans')) {
                        let name=path.substring('floorPlans/'.length+1);
                        let id='floor-plan-'+name;
                        self.added(collection,id, { _id : id, name: name,custom : true, floorPlan:true });
                    }

                }
            });

            self.onStop(function(){
                UploadedIconsInstance.removeEventListener(id);
            });
        });
    }
}

UploadedIconsInstance=new Uploads("builtinWidgetIcons");

Meteor.methods({
    deleteFile: function (file) {


        if(file==null) return;
        if(file._id.indexOf('/')>=0||file._id.indexOf('\\')>=0) return;
        if(file.icon) {
            fs.unlinkSync(ICON_DIRECTORY+'/'+file.name);
        }
        else {
            fs.unlinkSync(FLOORPLAN_DIRECTORY+'/'+file.name);
        }
        UploadedIconsInstance.fireRemoveEvent(file._id);
    }
});

Router.map(function() {
    var self=this;
    function routeDirectory(pathParam) {
        self.route(pathParam, {
            path: '/'+pathParam+':path',
            where: 'server',
            action: function() {
                var path = this.params.path;
                var basedir = getApplicationRoot();

               //log.debug('will serve static content @ '+ path);

                var fail = function(response) {
                    response.statusCode = 404;
                    response.end();
                };

                //log.debug('fname:'+fs.realpathSync(basedir+pathParam + path));
                var file = fs.realpathSync(basedir+'/'+pathParam + path);
                var stat = null;
                try {
                    stat = fs.statSync(file);
                } catch (_error) {
                    return fail(this.response);
                }

                var contentType='image/png';
                if(path.endsWith('jpg')) contentType='image/jpeg';
                var headers = {
                    'Content-type': contentType,
                    'Content-Length': stat.size,
                    'Content-Disposition': "attachment; filename=" + path
                };

                this.response.writeHead(200, headers);
                fs.createReadStream(file).pipe(this.response);
            }
        });
    }
    routeDirectory('uploads/icons/');
    routeDirectory('uploads/floorPlans/');
});


UploadsInitialization=function () {
    UploadServer.init({
        tmpDir: getApplicationRoot() + '/uploads/tmp',
        uploadDir: getUploadRoot(),
        checkCreateDirectories: true, //create the directories for you
        maxFileSize: 4000000,
        maxPostSize: 4000000,
        overwrite:true,
        getDirectory: function(fileInfo, formData) {
            // create a sub-directory in the uploadDir based on the content type (e.g. 'images')
            if (formData.type==='cfoxPubFile') return 'cfox/';
            if (formData.type==='cfoxExpFile') return 'cfox/';
            if(formData!==undefined && formData.type==='icon') return 'icons/';
            return 'floorPlans/';
        },
        getFileName: function(fileInfo, formData) {
            if (formData.type==='cfoxPubFile') return 'cfox.pub';
            if (formData.type==='cfoxExpFile') return 'cfox.exp';
            return new Date().getTime()+'-'+fileInfo.name;
        },
        finished: function(fileInfo, formFields) {
            UploadedIconsInstance.fireCreateEvent(fileInfo.path);
        }
    });
};

