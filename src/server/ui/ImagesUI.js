import fs from 'fs';
import path from 'path';
import os from 'os';
import mongo from 'mongodb';

const GridStore=mongo.GridStore;

let uploadToFilesystem=Collections.Uploads.uploadToFilesystem;

let CFOX_FOLDER='cfox/';
let ICON_FOLDER='icons/';
let FLOOR_PLAN_FOLDER='floorPlans/';
let UPLOAD_FOLDER='/uploads/';


function getApplicationRoot() {
    var meteor_root = fs.realpathSync( process.cwd() + '/../' );
    var application_root = fs.realpathSync( meteor_root + '/../' );
    if( path.basename( fs.realpathSync( meteor_root + '/../../../' ) ) == '.meteor' ) {
        application_root = fs.realpathSync(meteor_root + '/../../../../');
    }
    return application_root+'/..';
}

LOCAL_ICON_DIRECTORY=getApplicationRoot()+'/uploads/icons';
LOCAL_FLOORPLAN_DIRECTORY=getApplicationRoot()+'/uploads/floorPlans';

BUILT_IN_PREFIX="built-in-";


getUploadRoot=function getUploadRoot() {
    return getApplicationRoot() + '/uploads'
}

function getResourceBase() {
    var meteor_root = fs.realpathSync( process.cwd() + '/../' );
    var application_root = fs.realpathSync( meteor_root + '/../' );
    // if running on dev mode
    var resourcesLocation;
    if( path.basename( fs.realpathSync( meteor_root + '/../../../' ) ) == '.meteor' ){
        application_root =  fs.realpathSync( meteor_root + '/../../../../' );
        resourcesLocation='/public';
    }
    else {
        resourcesLocation='/programs/web.browser/app';
    }
    return application_root+resourcesLocation;
}


class Uploads extends Observable {
    constructor(collection) {
        super();
        Meteor.publish(collection, function(){

            Accounts.checkDashboardAccess(this);
            var self = this;

            function isImage(f) {
                return f.toLowerCase().endsWith('.jpg')||f.toLowerCase().endsWith('.png');
            }
            function processDirectory(path,idPrefix,decorator) {
                var files=fs.readdirSync(path);
                for(var file in files) {
                    var f=files[file];
                    var id=idPrefix+'-'+f;
                    let object={ _id: id, name: f };
                    decorator(object);
                    if (isImage(f)) self.added(collection, id, object);
                }
            }

            processDirectory(getResourceBase()+'/sensors',BUILT_IN_PREFIX+'icon',function(o) { o.icon=true; });
            processDirectory(getResourceBase()+'/floorPlans',BUILT_IN_PREFIX+'plan',function(o) { o.floorPlan=true; });

            if(uploadToFilesystem) {
                try {
                    processDirectory(LOCAL_ICON_DIRECTORY,'icon',function(o) { o.icon=true; o.custom=true; });
                    processDirectory(LOCAL_FLOORPLAN_DIRECTORY,'floor-plan',function(o) { o.floorPlan=true; o.custom=true; });
                }
                catch(e)
                {
                    log.error('error processing icon images',e);
                }
            }
            else {
                Collections.Uploads.find().forEach(function(f) {
                    if(isImage(f.name)) {
                        let idPrefix='floor-plan';
                        if (f.folder===ICON_FOLDER) idPrefix='icon';
                        let id=idPrefix+'-'+f.name;
                        self.added(collection,id,{_id:id, name: f.name, custom:true, icon:f.folder===ICON_FOLDER,floorPlan:f.folder===FLOOR_PLAN_FOLDER});
                    }
                });
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
                        let name=path.substring(ICON_FOLDER.length+1);
                        let id='icon-'+name;
                        self.added(collection,id, { _id : id, name: name, custom : true, icon:true });
                    }
                    if(path.startsWith('floorPlans')) {
                        let name=path.substring(FLOOR_PLAN_FOLDER.length+1);
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
        Accounts.checkAdminAccess(this);
        if(file==null) return;
        if(file._id.indexOf('/')>=0||file._id.indexOf('\\')>=0) return;
        if(uploadToFilesystem) {
            if(file.icon) {
                fs.unlinkSync(LOCAL_ICON_DIRECTORY+'/'+file.name);
            }
            else {
                fs.unlinkSync(LOCAL_FLOORPLAN_DIRECTORY+'/'+file.name);
            }
            UploadedIconsInstance.fireRemoveEvent(file._id);
        }
        else {
            let fileId=(file.icon ? ICON_FOLDER : FLOOR_PLAN_FOLDER)+ file.name
            GridStore.unlink(Collections.Uploads.rawDatabase(), fileId, function(err, result) {
                if(err==null) {
                    UploadedIconsInstance.fireRemoveEvent(file._id);
                }
                else {
                    log.error(err);
                }
            });
            Collections.Uploads.remove(fileId);
        }
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

                function sendHeaders(response,size) {
                    var contentType='image/png';
                    if(path.endsWith('jpg')) contentType='image/jpeg';
                    var headers = {
                        'Content-type': contentType,
                        'Content-Disposition': "attachment; filename=" + path
                    };
                    if(size!==undefined) headers['Content-Length']=size;
                    response.writeHead(200, headers);
                }

                if(uploadToFilesystem)
                {
                    //log.debug('fname:'+fs.realpathSync(basedir+pathParam + path));
                    var file = fs.realpathSync(basedir+'/'+pathParam + path);
                    var stat = null;
                    try {
                        stat = fs.statSync(file);
                    } catch (_error) {
                        return fail(this.response);
                    }
                    sendHeaders(this.response,stat.size);
                    fs.createReadStream(file).pipe(this.response);
                }
                else {
                    let fileId=pathParam.substring(UPLOAD_FOLDER.length-1)+path;
                    var gridStore = new GridStore(Collections.Uploads.rawDatabase(), fileId, 'r');
                    GridStore.exist(Collections.Uploads.rawDatabase(), fileId, (err, result) => {
                        if(!result) {
                            return fail(this.response);
                        }
                        gridStore.open((err, gs) => {
                            var stream = gs.stream(true);
                            sendHeaders(this.response);
                            stream.pipe(this.response);
                        });
                    });
                }
            }
        });
    }
    routeDirectory('uploads/'+ICON_FOLDER);
    routeDirectory('uploads/'+FLOOR_PLAN_FOLDER);
});


UploadsInitialization=function () {
    let uploadDir=getUploadRoot();
    if(uploadToFilesystem) fs.mkdir(uploadDir);
    let tmpDir=os.tmpdir();

    MongoUploadServer.init({
        tmpDir:  tmpDir,
        uploadDir: getUploadRoot(),
        checkCreateDirectories: true, //create the directories for you
        maxFileSize: 2000000,
        maxPostSize: 4000000,
        overwrite:true,
        uploadToFileSystem: uploadToFilesystem,
        getDirectory: function(fileInfo, formData) {
            // create a sub-directory in the uploadDir based on the content type (e.g. 'images')
            if (formData.type==='cfoxPubFile') return CFOX_FOLDER;
            if (formData.type==='cfoxExpFile') return CFOX_FOLDER;
            if(formData!==undefined && formData.type==='icon') return ICON_FOLDER;
            return FLOOR_PLAN_FOLDER;
        },
        getFileName: function(fileInfo, formData) {
            if (formData.type==='cfoxPubFile') return 'cfox.pub';
            if (formData.type==='cfoxExpFile') return 'cfox.exp';
            return /*new Date().getTime()+'-'+*/fileInfo.name;
        },
        finished: function(fileInfo, formFields) {
            UploadedIconsInstance.fireCreateEvent(fileInfo.path);
        }
    });
};

