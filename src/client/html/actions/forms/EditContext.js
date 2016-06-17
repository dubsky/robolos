
class EditContextClass {

    constructor(label,returnRoute,document,fieldName)
    {
        this.label = label;
        this.returnRoute = returnRoute;
        this.document = document;
        this.fieldName = fieldName;
    }


    getLabel() {
        return this.label;
    }

    getFieldName() {
        return this.fieldName;
    }

    setFieldName(name) {
        this.fieldName=name;
    }

    getDocument() {
        return this.document;
    }

    getReturnRoute() {
        return this.returnRoute;
    }

    keepEditContextOnNextRoute() {
        console.log('will keep context on next route');
        this.keepEditContext=true;
    }

    keepContextOnNextModalClose() {
        this.keepEditContextOnModalClose=true;
    }

    static modalClosed() {
        var context=EditContext.getContext();
        if(context===undefined) return;
        if(!context.keepEditContextOnModalClose)
        {
            EditContext.setContext(undefined);
        }
        else {
            context.keepEditContextOnModalClose=false;
        }
    }

    static getContext() {
        return EditContext.current;
    }

    static setContext(context) {
        EditContext.current=context;
    }

    contextHook(params) {
        if (this.keepEditContext) {
            console.log('keeping context',params);

            this.keepEditContext=false;
            this.url=params.url;
        }
        else {
            if(this.url!==params.url) {
                console.log('deleting context',params);
                EditContext.current=undefined;
            }
            else {
                console.log('reload detected');
            }
        }
    }
}

EditContext=EditContextClass;



