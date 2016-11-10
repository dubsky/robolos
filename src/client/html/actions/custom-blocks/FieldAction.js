DefineActionField =function () {

    /**
     * Class for an editable text field.
     * @param {string} text The initial content of the field.
     * @param {Function} opt_changeHandler An optional function that is called
     *     to validate any constraints on what the user entered.  Takes the new
     *     text as an argument and returns either the accepted text, a replacement
     *     text, or null to abort the change.
     * @extends {Blockly.Field}
     * @constructor
     */
    Blockly.FieldAction = function(text,filter, opt_changeHandler) {
        Blockly.FieldAction.superClass_.constructor.call(this, text, opt_changeHandler);
        this.filter=filter;
        //this.setChangeHandler(opt_changeHandler);
    };
    goog.inherits(Blockly.FieldAction, Blockly.Field);

    /**
     * Clone this FieldAction.
     * @return {!Blockly.FieldAction} The result of calling the constructor again
     *   with the current values of the arguments used during construction.
     */
    Blockly.FieldAction.prototype.clone = function() {
        return new Blockly.FieldAction(this.getText(), this.changeHandler_);
    };

    /**
     * Mouse cursor style when over the hotspot that initiates the editor.
     */
    Blockly.FieldAction.prototype.CURSOR = 'text';

    /**
     * Allow browser to spellcheck this field.
     * @private
     */
    Blockly.FieldAction.prototype.spellcheck_ = true;

    /**
     * Close the input widget if this input is being deleted.
     */
    Blockly.FieldAction.prototype.dispose = function() {
        Blockly.WidgetDiv.hideIfOwner(this);
        Blockly.FieldAction.superClass_.dispose.call(this);
    };



    Blockly.FieldAction.prototype.setValue=function(value) {
        if((typeof value)!=='undefined' && value!==null && value!=='') {
            if(value==='...')
                this.setText(value);
            else
                this.setText(EJSON.parse(value).name);
        }
        this.value=value;
    };

    Blockly.FieldAction.prototype.getValue=function(value) {
        return this.value;
    };

    /**
     * Show the inline free-text editor on top of the text.
     * @param {boolean=} opt_quietInput True if editor should be created without
     *     focus.  Defaults to false.
     * @private
     */
    Blockly.FieldAction.prototype.showEditor_ = function(opt_quietInput) {
        //SemanticUI.modal('#selectActionBlock');
        Template.modal.current.set({template: 'selectSubActionForAction',data:{renderBox:true, filter:this.filter}});
        Blockly.FieldAction.activeBlock=this;
    };


    /**
     * Check to see if the contents of the editor validates.
     * Style the editor accordingly.
     * @private
     */
    Blockly.FieldAction.prototype.validate_ = function() {
        var valid = true;
        goog.asserts.assertObject(Blockly.FieldAction.htmlInput_);
        var htmlInput = /** @type {!Element} */ (Blockly.FieldAction.htmlInput_);
        if (this.sourceBlock_ && this.changeHandler_) {
            valid = this.changeHandler_(htmlInput.value);
        }
        if (valid === null) {
            Blockly.addClass_(htmlInput, 'blocklyInvalidInput');
        } else {
            Blockly.removeClass_(htmlInput, 'blocklyInvalidInput');
        }
    };

    /**
     * Resize the editor and the underlying block to fit the text.
     * @private
     */
    Blockly.FieldAction.prototype.resizeEditor_ = function() {
        var div = Blockly.WidgetDiv.DIV;
        var bBox = this.fieldGroup_.getBBox();
        div.style.width = bBox.width + 'px';
        var xy = this.getAbsoluteXY_();
        // In RTL mode block fields and LTR input fields the left edge moves,
        // whereas the right edge is fixed.  Reposition the editor.
        if (this.sourceBlock_.RTL) {
            var borderBBox = this.borderRect_.getBBox();
            xy.x += borderBBox.width;
            xy.x -= div.offsetWidth;
        }
        // Shift by a few pixels to line up exactly.
        xy.y += 1;
        if (goog.userAgent.WEBKIT) {
            xy.y -= 3;
        }
        div.style.left = xy.x + 'px';
        div.style.top = xy.y + 'px';
    };

    /**
     * Close the editor, save the results, and dispose of the editable
     * text field's elements.
     * @return {!Function} Closure to call on destruction of the WidgetDiv.
     * @private
     */
    Blockly.FieldAction.prototype.widgetDispose_ = function() {
        var thisField = this;
        return function() {
            var htmlInput = Blockly.FieldAction.htmlInput_;
            // Save the edit (if it validates).
            var text = htmlInput.value;
            if (thisField.sourceBlock_ && thisField.changeHandler_) {
                var text1 = thisField.changeHandler_(text);
                if (text1 === null) {
                    // Invalid edit.
                    text = htmlInput.defaultValue;
                } else if (text1 !== undefined) {
                    // Change handler has changed the text.
                    text = text1;
                }
            }
            thisField.setText(text);
            thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
            Blockly.FieldAction.htmlInput_ = null;
            // Delete the width property.
            Blockly.WidgetDiv.DIV.style.width = 'auto';
        };
    };

};
