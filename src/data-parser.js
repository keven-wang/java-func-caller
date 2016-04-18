'use strict';

var splitReg  = /(js-data-(?:start|end))/;
var lineStart = 'js-data-start';
var lineEnd   = 'js-data-end';

function Parser(handler){
    this.handler    = handler;
    this.lineCache  = [];
}

Parser.prototype = {
    /**
     * parse the response data by java, if find a whole data line then  
     * send it to handler, otherwise save the line parts to line cache. 
     * @param {String}data.
     * @public
     */
    parseData : function(data){
        var lineCache = this.lineCache;
        var cont = lineCache.length > 0 
                 ? lineCache.join('') + data 
                 : data;
        
        var parts = cont.split(splitReg);
        if(parts.length == 0){ 
            lineCache.push(cont);
            return;
        }

        var i, j, part, lineCont, count = parts.length;

        // clear line cache
        lineCache.length = 0;

        for(i = 0; i < count; i++){
            part = parts[i];

            // skip unuseful part
            if(part != lineStart){ continue; }

            // handle the whole task line
            if(i + 2 < count && parts[i + 2] == lineEnd){
                this.handler(parts[i + 1]);
                i += 2;
                continue;
            }
            
            // save the parts of line to the line cache
            lineCache.push.apply(lineCache, parts.slice(i));
            i = count;
        }        
    }
};

module.exports = Parser;