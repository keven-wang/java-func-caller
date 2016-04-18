var fs = require('fs');
var cont = JSON.stringify(fs.readFileSync(__dirname + '/data.txt', 'utf8'));

for(var i = 0; i < 5; i++){
    console.log('add unuseful content: ' + cont + '\n');
    console.log('task_line_start s' + i + ' ' +  cont + ' e' + i + ' task_line_end\n');
}