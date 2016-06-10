/*
var imageStore = new FS.Store.FileSystem("images", {path: "public/sensors"});

Images = new FS.Collection('images', {
    stores: [imageStore]
});
*/

Template.widgetIconSelector.rebuildPicker = function (template) {
    $("#icon").imagepicker(
        {
            changed: function(oldValue,newValue) {
                let val=null;
                if (newValue!=null && newValue.length!=0) val=newValue[0].substring(newValue[0].lastIndexOf('/')+1);
                template.selectedImage.set(val);
            }
        });
};

Template.widgetIconSelector.getURLPathForImage=function(image) {
    var path='/';
    if(image.custom) {
        path='/uploads/'
    }
    if(image.icon) image.custom ? path+='icons/' : path+='sensors/';
    if(image.floorPlan) path+='floorPlans/';
    path+=image.name;
    return path;
}

Template.widgetIconSelector.getURLPathForImageID=function(id) {
    let icon=BuiltinWidgetIconsCollection.findOne({_id:id});
    if(icon==undefined) return '/icons/Action.png';
    return Template.widgetIconSelector.getURLPathForImage(icon);
}

Template.widgetIconSelector.helpers({
    images : function() {
        if(this.type==='floorPlan')
            return BuiltinWidgetIconsCollection.find({floorPlan:true});
        else
            return BuiltinWidgetIconsCollection.find({icon:true});
    },

    getImagePath: function() {
        return Template.widgetIconSelector.getURLPathForImage(this);
    },

    isSelected : function(params) {
        if(params.selectedIcon==null) return false;
        return params.selectedIcon===this._id;
    },

    isDeleteable : function() {
        var selected=Template.instance().selectedImage.get();
        if(selected==null) return false;
        var query=BuiltinWidgetIconsCollection.findOne({_id:selected, custom:true});
        return query!=null;
    },

    formData : function() {
        if(this.type==='floorPlan')
            return { type: 'floorPlan' };
        else
            return { type: 'icon' };
    },

    uploadCallbacks: function() {
        var template=Template.instance();
        return {
            formData: function() {  },
            finished: function(index, fileInfo, context) {
                Template.widgetIconSelector.rebuildPicker(template);
                $('.iconSelectorDimmer').dimmer('hide');
            }
        }
    }
});

Template.widgetIconSelector.events({
    'change .image-picker': function(event, instance) {
        //console.log('image input changed');
    },

    'click .cancel': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);
        Router.go('render.dashboard',{_id: dashboard._id});
    },

    'click .uploadDimmer': function(event, instance) {
        $('.iconSelectorDimmer').dimmer({closable:true, opacity:0.9}).dimmer('show');
    },

    'click .closeUploadDimmer': function(event, instance) {
        $('.iconSelectorDimmer').dimmer('hide');
    },

    'click .deleteFile': function(event, instance) {
        var template=Template.instance();
        var selected=template.selectedImage.get();
        if(selected==null) return false;
        var query=BuiltinWidgetIconsCollection.findOne({_id:selected, custom:true});
        Meteor.call('deleteFile', query,function() {
            //$("#icon").data('picker').sync_picker_with_select(); does not work :-(
            Template.widgetIconSelector.rebuildPicker(template);
        });
    }
});

BuiltinWidgetIconsCollection = new Mongo.Collection('builtinWidgetIcons');
Meteor.subscribe('builtinWidgetIcons');

Template.widgetIconSelector.onCreated(function() {
    var template=Template.instance();
    template.selectedImage=new ReactiveVar(this.data.selectedIcon);
});

Template.widgetIconSelector.onRendered(function() {
    Template.widgetIconSelector.rebuildPicker(Template.instance());
});

