var spawn  = require('child_process').spawn;
var params = [__dirname + '/send-large-string.js'];
var me = this, sub = spawn('node', params);

var splitReg  = /(task_line_(?:start|end))/;
var lineStart = 'task_line_start';
var lineEnd   = 'task_line_end';
var lineCache = [];
var eidx = 0;

function handleTask(taskCont){
    console.log(
        'find a task line: %s...%s',
        taskCont.slice(0, 20),
        taskCont.slice(-20, -1)
    );
}

sub.stdout.on('data', function (data) { 
    console.log('\n%sth data event fired!', ++eidx);

    data = data.toString();
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
            handleTask(parts[i + 1]);
            i += 2;
            continue;
        }
        
        // save the parts of line to the line cache
        lineCache.push.apply(lineCache, parts.slice(i));
        i = count;
    }
});

