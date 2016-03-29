'use strict';

var CALLER_JAR_PATH = __dirname + '/jar/FuncCaller.jar';
var DATA_PRE = 'for js:', PRE_LEN = DATA_PRE.length;
var spawn = require('child_process').spawn;
var __java_installed__ = null;

function estr(s){
    return s.replace(/[\u0100-\uffff]/g, function(i){ 
        var code = i.charCodeAt(0).toString(16);
        return '\\u' + '0000'.slice(0, 4 - code.length) + code;
    });
}

function unestr(s){
    return s.replace(/\\u([0-9a-f]{4})/gi, function(m, n){ 
        return String.fromCharCode(parseInt(n, 16));
    });    
}

function hasProps(o, props){
    props = typeof props == 'string' 
          ? props.trim().split(/\s+/) 
          : props;

    return props.every(function(i){ 
        return o.hasOwnProperty(i.trim()); 
    });
}

function isJavaInstalled(callback){
    if(__java_installed__ != null){
        return callback(__java_installed__);    
    }

    var spawn  = require('child_process').spawn('java', ['-version']);
    var result = [];
    
    spawn.on('error', function(err){ 
        __java_installed__ = false;
        callback(false); 
    })
    
    spawn.stderr.on('data', function(ret) {
        result.push(ret.toString());
    }); 

    spawn.stderr.on('end', function(ret) {
        var data = result.join('');
        var isInstalled = data.search(/java\s+version/i) != -1;
        __java_installed__ = isInstalled
        callback(isInstalled);
    });       
}

function Caller(extJars){
    this.guid = 0;
    this.taskMap = {};
    this.caller  = null;
    this.extendJars = extJars instanceof Array ? extJars : [];
}

Caller.prototype = {
    callFunc : function(conf){
        if(!conf || !hasProps(conf, 'func params success error')) { 
            throw "callJarFunc => inalid paramaters must has the follow properties: func params success error!";
        }

        if(!conf.params instanceof Array){
            throw 'the properti "params" must be array!';
        }

        var me = this;
        var taskId  = this.guid++;
        var command = this.getCommand(taskId, conf.func, conf.params);
        var doTask  = function(){
            me.taskMap[taskId] = {
                taskId  : taskId,
                scope   : conf.scope,
                error   : conf.error,
                success : conf.success
            };

            me.caller.stdin.write(command);   
        };

        if(this.caller == null){ 
            this.initCaller( doTask ); 
        }else{
            doTask();
        }
    },

    getCommand : function(taskId, func, params){
        return ('for FuncCaller:'
            + '{'
            +   '"task_id":'    + taskId    + ','
            +   '"task_name":"' + func + '",'
            +   '"task_params":'+ estr(JSON.stringify(params))
            + '}\n'
        );
    },

    initCaller : function( callback ){
        isJavaInstalled(function(isInstalled){
            if( !isInstalled ){
                throw ("java-func-caller.js => please install java runtime!");
            }            

            var params = ['-jar', CALLER_JAR_PATH].concat(this.extendJars);
            var me = this, caller = spawn('java', params, {encoding:'utf8'});    
            
            caller.stdout.on('data', function (data) {  
                if(data) { 
                    me.onData(data.toString());
                }
            });

            caller.stderr.on('data', function(data){
                if(data){
                    me.onError(data.toString());
                }
            });

            //caller.stdout.pipe(process.stdout); 
            //caller.stderr.pipe(process.stdout); 

            me.caller = caller;
            callback();
        }.bind(this));
    },

    onData : function(data){
        var taskMap = this.taskMap;

        data.split('\n').forEach(function(i){
            if(!i) { return; }

            var posi = i.indexOf(DATA_PRE);
            if(posi == -1) { return; }

            try{
                var start  = posi + PRE_LEN;
                var data   = JSON.parse(unestr(i.slice(start)));
                var taskId = data.task_id;
                var record = taskMap[taskId];

                delete taskMap[taskId];

                if(data && data.status == 0){
                    record.success.apply(record.scope, [data]);
                }else{
                    record.error.apply(record.scope, [data]);
                }

            }catch(e){
                throw "parse jar return data error! error info: " + e
            }
        });
    },

    onError : function(data){
        console.log('java-caller.js => error : ' + data.toString());        
    }
}

module.exports = Caller;