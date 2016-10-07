Collections.Uploads=new Mongo.Collection('uploads');
Schemas.Uploads=new SimpleSchema({
    name: {
        type: String,
        label: "Name",
        max: 128
    },
    folder: {
        type: String,
        label: "Folder",
        max: 10
    },
    size: {
        type: Number,
        label: "Size",
        optional: true
    }
});

Collections.Uploads.attachSchema(Schemas.Uploads);
Collections.Uploads.uploadToFilesystem=process.env.UPLOAD_TO_FILESYSTEM!=undefined;

