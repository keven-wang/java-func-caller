'use strict';

var CALLER_JAR_PATH = __dirname + '/../jar/FuncCaller.jar';
var spawn  = require('child_process').spawn;
var Parser = require('./data-parser');
var util   = require('./util');
var INTERVAL_PERIOD = 500;
var MAX_WAIT_TIME = 10;

function Caller(conf){
    conf = conf || {};
    var extJars = conf.extend_jars instanceof Array ? conf.extend_jars : [];

    this.guid = 0;
    this.taskMap = {};
    this.taskCache = [];
    this.taskCount = 0;
    
    this.caller  = null;
    this.interval = null;
    this.extendJars = extJars;
    this.lastCallTime = null;
    this.callerIniting = false;
    
    this.autoClose    = conf.auto_close == true;
    this.maxWaitTime  = conf.max_wait_time > 0 ? conf.max_wait_time : MAX_WAIT_TIME;
    this.showJavaOutput = conf.show_java_output == true;
    
    this.parser = new Parser(this.handleTask.bind(this));
}

Caller.prototype = {
    callFunc : function(conf){
        if(!conf || !util.hasProps(conf, 'func params success error')) { 
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

            me.taskCount++;
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
            +   '"task_params":'+ util.escape(JSON.stringify(params))
            + '}\n'
        );
    },

    stopJavaCaller : function(){
        this.caller.stdin.write("exit\n"); 
        this.caller = null;
    },

    clearTaskCache : function(){
        var task, tasks = this.taskCache;
        var count = tasks.length;

        while(count-- > 0){
            task = tasks.shift();
            task();
        }
    },

    initCaller : function( callback ){
        if(this.callerIniting){
            this.taskCache.push(callback);
            return;
        }

        this.callerIniting = true;
        this.taskCache.push(callback);
        
        util.isJavaInstalled(function(isInstalled){
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

            if(me.autoClose){ me.initChecker(); }
            if(me.showJavaOutput){ caller.stdout.pipe(process.stdout); }

            me.callerIniting = false;
            me.caller = caller;
            me.clearTaskCache();
        }.bind(this));
    },

    initChecker : function(){
        if(this.interval) { return; }
        
        this.interval = setInterval(function(){
            if(this.lastCallTime == null) { return; }

            var now   = new Date().getTime();
            var spend = (now - this.lastCallTime) / 1000;
            
            if(this.taskCount == 0 && spend >= this.maxWaitTime){
                clearInterval(this.interval);
                this.lastCallTime = null;
                this.interval = null;
                this.stopJavaCaller();
            }
        }.bind(this), INTERVAL_PERIOD)
    },

    handleTask : function(taskData){
        var taskMap = this.taskMap;

        try{
            var data   = JSON.parse(util.unescape(taskData));
            var taskId = data.task_id;
            var record = taskMap[taskId];

            this.lastCallTime = new Date().getTime();
            delete taskMap[taskId];
            this.taskCount--;

            if(data && data.status == 0){
                record.success.apply(record.scope, [data]);
            }else{
                record.error.apply(record.scope, [data]);
            }

        }catch(e){
            throw "parse jar return data error! error info: " + e
        }
    },

    onData : function(data){
        this.parser.parseData(data);
    },

    onError : function(data){
        console.log('java-caller.js => error : ' + data.toString());        
    }
}

module.exports = Caller;