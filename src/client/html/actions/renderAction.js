CURRENT_ACTION="currentAction";
CURRENT_ACTION_ID="currentActionID";

function getAction() {
    var action=Session.get(CURRENT_ACTION);
    return action;
}

Template.renderAction.helpers({
    action : function() {
        return getAction();
    },

    editContext : function() {
        return EditContext.getContext();
    }
});


Template.renderAction.actionEditationFinished=function(event) {
    var context=EditContext.getContext();
    console.log('Template.renderAction.actionEditationFinished',context);
    if(context!=null) {
        context.keepEditContextOnNextRoute();
        var route=context.getReturnRoute();
        context.getDocument()[context.getFieldName()]=Session.get(CURRENT_ACTION)._id;
        console.log('calling on save',context);
        route.onSave();
    }
    else {
        throw 'Assertion failed';
    }
    return false;
};

Template.renderAction.events({
    'click .editProperties' :function(event) {
        var context=EditContext.getContext();
        if(context!=undefined) context.keepEditContextOnNextRoute();
        Router.go('render.action.properties', { _id: Session.get(CURRENT_ACTION)._id });
        return false;
    },

    'click .goBack' : Template.renderAction.actionEditationFinished
});


Template.renderAction.onRendered(function() {
    var blocklyArea = document.getElementById('blocklyArea');
    var blocklyDiv = document.getElementById('blocklyDiv');
    var contentHeader = document.getElementById('content-header');
    var contentWrapper = document.getElementById('content-wrapper');
    var onresize = function(e) {
        // Compute the absolute coordinates and dimensions of blocklyArea.
        var element = blocklyArea;
        var x = 0;
        var y = 0;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while (element);
        // Position blocklyDiv over blocklyArea.
        blocklyDiv.style.left = x + 'px';
        blocklyDiv.style.top = y + 'px';
        blocklyDiv.style.width = blocklyArea.offsetWidth + 'px';
        blocklyDiv.style.height = (contentWrapper.offsetHeight-contentHeader.offsetHeight-30-55+40) + 'px';
    };
    window.addEventListener('resize', onresize, false);
    blocklyDiv.style.height = (contentWrapper.offsetHeight-contentHeader.offsetHeight-30-55+40) + 'px';

    MyBlocks();

    this.workspace = Blockly.inject(blocklyDiv,
        {
            toolbox: document.getElementById('toolbox'),
            comments:true,
            trashcan:true,
            scrollbars:true
        });

    var xml=getAction().xml;
    console.log(xml);
    if((typeof xml)==='undefined' || xml===null)
    {
        xml =
            '<xml>' +
            '  <block type="action" deletable="false" x="70" y="70">' +
            '  </block>' +
            '</xml>';
    }

    var xmlDom = Blockly.Xml.textToDom(xml);

    try {
        Blockly.Xml.domToWorkspace(this.workspace, xmlDom);
    }
    catch(e) {
        console.log(e);
    }

    var self=this;
    this.workspace.addChangeListener(function() {
        var action=getAction();
        var xml = Blockly.Xml.workspaceToDom(self.workspace);
        var xml_text = Blockly.Xml.domToText(xml);

        var code = Blockly.JavaScript.workspaceToCode(self.workspace);
        //console.log(code);

        if(xml_text!==action.xml)
        {
            Meteor.call('updateAction',{$set :{ xml: xml_text, code:code } },action._id);
        }
    });

});

Template.renderAction.onDestroyed(function () {
    this.workspace.dispose();
});



Router.route('actions/:_id',
    function () {
        var self=this;
        var params = self.params;
        var id = params._id;
        Session.set(CURRENT_ACTION_ID, id);
        var item = Collections.Actions.findOne({_id: params._id});
        if(item==null) {
            self.render('notFound');
            return;
        }
        Session.set(CURRENT_ACTION, item);
        this.render('renderAction');
    },
    {
        name: 'render.action'
        /*
         onBeforeAction: function(){
            console.log('aaa -aaaaa aaaa');
            var one = IRLibLoader.load('/blockly/blockly_compressed.js',{
                success: function(){ console.log('1 SUCCESS CALLBACK'); },
                error: function(e){ console.log(e); }
            });
            if(one.ready()){
                var two=IRLibLoader.load('/blockly/blocks_compressed.js',{
                    success: function(){ console.log('2 SUCCESS CALLBACK'); },
                    error: function(e){ console.log(e); }
                });
                if(two.ready)
                {
                    var three=IRLibLoader.load('/blockly/msg/js/en.js',{
                        success: function(){ console.log('3 SUCCESS CALLBACK'); },
                        error: function(e){ console.log(e); }
                    })
                    if(three.ready()) this.next();
                }
            }
        },
         */,
        waitOn: function() {
            // wait on just one
            return [App.subscribe('actions'),App.subscribe('variables'),App.subscribe('sensors',false)];
            //       return [IRLibLoader.load('/blockly/blockly.js',{
            //            success: function(){ console.log('3 SUCCESS CALLBACK'); },
            //            error: function(e){ console.log(e); }})];*/
        }

    }
);
