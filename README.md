# java-func-caller

use spawn call the java method which the jar support. 
if want the java method can be called by node, the jar file
must be meet three conditions.

 * first, the jar must be a runableble jar file and the name of
   the jar must be the main class full name. for example
   your jar's main class is : your.foo.Main, then your 
   jar name must be : your.foo.Main.jar。 

 * sencod, the main class of the jar must has a public static method:
   **public static Map<String, Object> run(List<String> args)**

 * the map which run method return must contains the following keys
   * **status**, must, 0 sucess, negative value failed.
   * **value**,  optional, the value return to the node function when successed.
   * **error_msg**, optional, if failed please set it.
   * **exception**, optional, if failed please set it.

if the jar meet the two onditions, the your can call the method
use the following code:

```js
var FuncCaller = require('java-func-caller');
var caller = new FuncCaller([__dirname + './your.foo.Main.jar']);

caller.callFunc({
    func    : 'your.foo.Main',
    params  : [1, 2, 3, 4, 5],
    success : function(data){
        console.log('success => task id:' + data.task_id + ' value:' + data.value);
    },
    error   : function(data){
        console.log('error => ' + data.error_msg);
    }
});
```

## A Foo main class

```java
package org.myless.func;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FooFunc {
    public static void main(String... args){}
    
    public static Map<String, Object> run(List<String> args){
        Map<String, String> result = new HashMap<String, String>();
        
        result.put("status", String.valueOf(0));
        result.put("value", "join result: " + join(args));
        
        return result;
    }
    
    public static String join(List<String> args){
        if(args == null || args.size() == 0) { return ""; }
        
        StringBuffer buff = new StringBuffer();
        
        for(String i : args){
            buff.append(i);
        }
        
        return buff.toString();
    }
}
```
