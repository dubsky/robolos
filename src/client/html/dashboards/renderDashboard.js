/* Session */
CURRENT_DASHBOARD="currentDashboard";
CURRENT_DASHBOARD_ID="currentDashboardID";
DASHBOARD_EDIT_MODE='DASHBOARD_EDIT_MODE';

function getDashboard() {
    var dashboard=Session.get(CURRENT_DASHBOARD);
    return dashboard;
}

Template.renderDashboard.helpers({
      dashboard : function() {
          return getDashboard();
      },

      widgets : function() {
          var results=[];
          var dashboard=getDashboard();
          if ((typeof dashboard)==='undefined') return results;
          if ((typeof dashboard.widgets)==='undefined') return results;
          for(var i=0;i<dashboard.widgets.length;i++) {
              var geometry={size_x:1,size_y:1,col:1, row:1};
              if(typeof dashboard.geometry!=='undefined')
              {
                  for (var j = 0; j < dashboard.geometry.length; j++) {
                      var g = dashboard.geometry[j];
                      if (g.id === dashboard.widgets[i].id) {
                          geometry=g;
                          break;
                      }
                  }
              }
              results.push( {
                  widget: dashboard.widgets[i],
                  geometry: geometry
              } );
          }
          return results;
      },

      widgetType(type) {
          return this.widget.type===type;
      },

      isInEditMode() {
          return (true===Session.get(DASHBOARD_EDIT_MODE));
      },

      isEditPermitted() {
          return Session.get(USER_ROLE)!==Collections.Users.RoleKeys.observer || !requireUserLogin();
      }
});


Template.renderDashboard.editProperties=function(widget) {
    switch(widget.type) {
        case 'variable':
            Template.modal.current.set({template : 'editVariableWidgetProperties', data : {widget: widget }});
            break;
        case 'action':
            Template.modal.current.set({template : 'editActionWidgetProperties', data : {widget: widget }});
            break;
        case 'sensor':
            Template.modalBackup.current.set({template : 'editSensorWidgetProperties', data : {widget: widget }});
            break;
        case 'floorPlan':
            Template.modal.current.set({template : 'editFloorPlanWidgetProperties', data : {widget: widget }});
            break;
    }
};


Template.renderDashboard.events({
    'click .switchToEditMode': function() {
        Session.set(DASHBOARD_EDIT_MODE,true);
        GRIDSTER.enable_resize();
        GRIDSTER.enable();
    },

    'click .switchOffEditMode': function() {
        Session.set(DASHBOARD_EDIT_MODE,false);
        GRIDSTER.disable_resize();
        GRIDSTER.disable();
    },

    'click .switchToProperties':function() {
        EditContext.setContext(new EditContext());
        EditContext.getContext().keepEditContextOnNextRoute();
        Router.go('render.dashboard.properties', { _id: Session.get(CURRENT_DASHBOARD)._id });
    },

    'click .addWidget' : function() {
        Session.set(Template.addWidgetSelectWidgetType.FLOOR_PLAN_MODE,false);
        Template.modal.current.set({template : 'addWidgetSelectWidgetType', data : {}});
    },

    'click .configureWidget': function(event, instance) {
        Template.renderDashboard.editProperties(this);
    },

    'click .removeWidget': function(event, instance) {
        var dashboard=Session.get(CURRENT_DASHBOARD);

        var result=dashboard.widgets.slice();
        for(var i=0;i<dashboard.widgets.length;i++)
        {
            if(dashboard.widgets[i].id===this.id) {
                result.splice(i,1);
                break;
            }
        }

        if((typeof dashboard.geometry)!=='undefined') {
            var geometryResult=dashboard.geometry.slice();
            for(var i=0;i<dashboard.geometry.length;i++)
            {
                if(dashboard.geometry[i].id===this.id) {
                    geometryResult.splice(i,1);
                    break;
                }
            }
        }

        GRIDSTER.remove_widget($('#'+this.id));
        Meteor.call('updateDashboard',{$set : {widgets: result,geometry: geometryResult }},dashboard._id,function() {
            Router.go('render.dashboard.redirect',{_id: dashboard._id});
        });
        return false;
    }
});



Template.renderDashboard.onRendered(function() {
    GRIDSTER=$(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [200, 220],
        avoid_overlapped_widgets: true,
        autogrow_cols: true,
        autoscroll:true,
        resize : {
            enabled: true,
            stop: function(e, ui, $widget) {
                var dashboard=Session.get(CURRENT_DASHBOARD);
                Meteor.call('updateDashboard',{$set : {geometry: GRIDSTER.serialize()}},dashboard._id);
            }
        },
        draggable : {
            stop: function(event, ui) {
                var dashboard=Session.get(CURRENT_DASHBOARD);
                Meteor.call('updateDashboard',{$set : {geometry: GRIDSTER.serialize()}},dashboard._id);
            }
        },
        serialize_params:  function(widget, wgd) {
            return { id: widget.attr('id'), col: wgd.col, row: wgd.row, size_x: wgd.size_x, size_y: wgd.size_y }
        },

    }).data('gridster');

    if (!Session.get(DASHBOARD_EDIT_MODE)) {
        GRIDSTER.disable_resize();
        GRIDSTER.disable();
    }

    if(!TOUCH_DEVICE)
    {
        HeightController.onAreaRendered('.gridsterWrapper',{
            theme: "dark-thick",
            axis:'yx',
            //alwaysShowScrollbar:2,
            autoHideScrollbar: true,
            scrollbarPosition: 'outside',
            scrollButtons: {enable: true}
        });
    }

});


SensorStatusCollection = new Mongo.Collection('sensorStatusCollection');

Template.renderDashboard.onCreated(function(){
        var dashboardId=Session.get(CURRENT_DASHBOARD_ID);
        this.subscription=App.subscribeNoCaching('sensorStatusCollection',{id: dashboardId });
        console.log('created subscription id:'+this.subscription.subscriptionId);
});

Template.renderDashboard.onDestroyed(function(){
    console.log('dropped subscription id:'+this.subscription.subscriptionId);
    this.subscription.stop();
});


Router.route('dashboards/:_id',
    function () {
        var id = this.params._id;
        Session.set(CURRENT_DASHBOARD_ID, id);
        var item = Collections.Dashboards.findOne({_id: id });
        if(item==null) {
            this.render('notFound');
            return;
        }
        Session.set(CURRENT_DASHBOARD, item);
        this.render('renderDashboard',{data: { dashboard: item }});
    },
    {
        name: 'render.dashboard',
        waitOn: function() {
            return App.subscribe('dashboards');
        }
    }
);

Template.renderDashboardRedirect.onCreated(function(){
    var dashboardId=Session.get(CURRENT_DASHBOARD_ID);
    Router.go('render.dashboard',{_id: dashboardId});
});

Router.route('dashboard/:_id',
    function () {
        Session.set(CURRENT_DASHBOARD_ID, this.params._id);
        this.render('renderDashboardRedirect');
    },
    {
        name: 'render.dashboard.redirect'
    }
);
