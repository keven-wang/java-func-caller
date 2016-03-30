'use strict';

var __java_installed__ = null;

function escape(s){
    return s.replace(/[\u0100-\uffff]/g, function(i){ 
        var code = i.charCodeAt(0).toString(16);
        return '\\u' + '0000'.slice(0, 4 - code.length) + code;
    });
}

function unescape(s){
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

module.exports = {
    escape    : escape,
    unescape  : unescape,
    hasProps  : hasProps,
    isJavaInstalled : isJavaInstalled
}