var RESTRICTED_KEYS = ['time', 'timeInexact', 'level', 'file', 'line',
    'program', 'originApp', 'satellite', 'stderr'];


class Logger extends Observable {


    getStack() {
        // We do NOT use Error.prepareStackTrace here (a V8 extension that gets us a
        // pre-parsed stack) since it's impossible to compose it with the use of
        // Error.prepareStackTrace used on the server for source maps.
        var err = new Error;
        var stack = err.stack;
        return stack;
    }

// @returns {Object: { line: Number, file: String }}
    getCallerDetails () {
        var stack = this.getStack();

        if (!stack) return {};

        var lines = stack.split('\n');

        // looking for the first line outside the logging package (or an
        // eval if we find that first)
        var line;
        for (var i = 1; i < lines.length; ++i) {
            line = lines[i];
            if (line.match(/^\s*at eval \(eval/)) {
                return {file: "eval"};
            }
            if (!line.match(/Logger.js/))
                break;
        }

        var details = {};

        // The format for FF is 'functionName@filePath:lineNumber'
        // The format for V8 is 'functionName (packages/logging/logging.js:81)' or
        //                      'packages/logging/logging.js:81'
        var match = /(?:[@(]| at )([^(]+?):([0-9:]+)(?:\)|$)/.exec(line);
        if (!match)
            return details;
        // in case the matched block here is line:column
        details.line = match[2].split(':')[0];

        // Possible format: https://foo.bar.com/scripts/file.js?random=foobar
        // XXX: if you can write the following in better way, please do it
        // XXX: what about evals?
        details.file = match[1].split('/').slice(-1)[0].split('?')[0];

        return details;
    }


    constructor() {
        super();
        this.logEventsEnabled=true;
        this.messages=[];
        this.count=0;
        this.pointer=0;
        this.maxMessages=300;
        this.idGenerator=0;
    }

    addMessage(message) {
        this.messages[this.pointer]=message;
        if(this.count<this.maxMessages) this.count++;
        this.pointer=(this.pointer+1) % this.maxMessages;
    }

    forEach(f) {
        let base=this.pointer-this.count+this.maxMessages;
        for(let i=0;i<this.count;i++) {
            let c=(base+i)%this.maxMessages;
            f(this.messages[c]);
        }
    }

    logMessage(level,text,object,consoleOutput) {
        var obj={ message: text+(object==undefined ? '': ' '+EJSON.stringify(object)), time: new Date(), level: level};
        obj = _.extend(this.getCallerDetails(), obj);
        if(consoleOutput) {
            if (Meteor.isDevelopment) {
                console.log(EJSON.stringify(obj));
            }
            else {
                console.log(obj.time.toISOString()+' '+obj.level+' '+obj.file+':'+obj.line+' '+obj.message);
            }
        }
        obj.data=object;
        obj._id=''+this.idGenerator++;
        obj.message=text;
        this.addMessage(obj);
        this.fireCreateEvent(obj);
    }

    info(text,object) {
        this.logMessage('info',text,object,true);
    }

    debug(text,object) {
        if(this.debugLoggingEnabled) this.logMessage('debug',text,object,true);
    }

    event(f,params) {
        if(this.logEventsEnabled) {
            let result=f(params);
            this.logMessage('event',result[0],result[1],false);
        }
    }

    error(text,object) {
        var obj={ message: text, time: new Date(), level: 'error'};
        if(object!=undefined) {
            if(object instanceof Error) {
                obj.stderr=object.stack;
                console.log('stack trace:'+object.stack);
            }
            else {
                console.log(object);
                obj.stderr=EJSON.stringify(object);
            }
        }
        obj = _.extend(this.getCallerDetails(), obj);
        console.log(EJSON.stringify(obj));
        obj.data=object;
        obj._id=''+this.idGenerator++;
        this.addMessage(obj);
        this.fireCreateEvent(obj);
    }

    logEvents(state) {
        this.logEventsEnabled=state;
    }

    applySettings(settings) {
        this.logEventsEnabled=settings.enableEventLogging;
        this.debugLoggingEnabled=settings.debugLoggingEnabled;
        if(this.maxMessages!=settings.logCapacity)
        {
            this.messages=[];
            this.count=0;
            this.pointer=0;
            this.maxMessages=settings.logCapacity;
            this.idGenerator=0;
            this.info('Log reset, max. messages '+this.maxMessages);
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

log=new Logger();

