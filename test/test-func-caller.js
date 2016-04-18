var FuncCaller = require('../src/func-caller');
var savePath = __dirname + '/my.png';
var svgCode  = (''
    + "<svg width='64' height='64' " 
    +      "viewBox='0 0 64 64' version='1.1' "
    +      "xmlns='http://www.w3.org/2000/svg'>"
    +     "<g id='g1'>"
    +         "<circle cx='32' cy='32' r='27' style='stroke:#fe3b3f; stroke-width:5; fill:none;'/>"    
    +         "<circle cx='32' cy='16' r='4'  style='stroke:#fe3b3f; stroke-width:3; fill:none;'/>"    
    +         "<circle cx='32' cy='48' r='4'  style='stroke:#fe3b3f; stroke-width:3; fill:none;'/>"
    +         "<circle cx='16' cy='32' r='4'  style='stroke:#fe3b3f; stroke-width:3; fill:none;'/>"    
    +         "<circle cx='48' cy='32' r='4'  style='stroke:#fe3b3f; stroke-width:3; fill:none;'/>"
    +         "<circle cx='32' cy='32' r='3'  style='fill:#fe3b3f;'/>"     
    +     "</g>" 
    + "</svg>"
);

var extJars = [__dirname + '/../jar/org.myless.func.FooFunc.jar'];

var caller = new FuncCaller({ 
    max_wait_time: 2,
    auto_close  : true,
    extend_jars : extJars
});

// test call unsuported method.
caller.callFunc({
    func    : 'org.myless.func.FooFunc1',
    params  : [1, 2, 3, 4, 5],
    success : function(data){
        console.log('FooFunc    success => task id:' + data.task_id + ' value:' + data.value);
    },
    error   : function(data){
        console.log('FooFunc    error => ' + data.error_msg);
    }
});

// call two java function then stop caller.
caller.callFunc({
    func    : 'org.myless.func.FooFunc',
    params  : [1, 2, 3, 4, 5],
    success : function(data){
        console.log('FooFunc    success => task id:' + data.task_id + ' value:' + data.value);
    },
    error   : function(data){
        console.log('FooFunc    error => ' + data.error_msg);
    }
});

caller.callFunc({
    func    : 'org.myless.func.SvgToPng',
    params  : [svgCode, savePath],
    success : function(data){
        console.log('SvgToPng   success => task id:' + data.task_id + ' value:' + data.value);
    },
    error   : function(data){
        console.log('SvgToPng   error   => ' + data.exception);
    }
});

// test restart caller to handle the task and then close
setTimeout(function() {
    caller.callFunc({
        func    : 'org.myless.func.SvgToPng',
        params  : [svgCode, savePath],
        success : function(data){
            console.log('SvgToPng   success => task id:' + data.task_id + ' value:' + data.value);
        },
        error   : function(data){
            console.log('SvgToPng   error   => ' + data.exception);
        }
    });
}, 5000);
