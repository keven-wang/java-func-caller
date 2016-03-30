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
   * **status**, must, status == 0 means success, status < 0 failed.
   * **value**,  optional, the value return to the node function when successed.
   * **error_msg**, optional, if failed please set it.
   * **exception**, optional, if failed please set it.

if the jar meet the top conditions, then your can call the method
use the following code:

```js
var FuncCaller = require('java-func-caller');
var caller = new FuncCaller([__dirname + './your.foo.Main.jar']);

caller.callFunc({
    func    : 'your.foo.Main',
    params  : [1, 2, 3, 4, 5],
    success : function(data){
        console.log('success => task id:' + data.task_id + ', value:' + data.value);
    },
    error   : function(data){
        console.log('error => ' + data.error_msg);
    }
});
```
## the return of callback
  * status, must, the mean of the value as follows:
     * 0   success
     * -1  parse command error
     * -2  a exception occured when execute java function
     * -3  execute java function failed.
     * -99 unknown error
  * value, optional, the java return value when success.
  * error_code, optional, come from the **"status"** property of the java function return.
  * error_msg, optional, come from the **"error_msg"** property of the java function return.
  * exception, optional, the exception object when a exception occured, come from the **exception"** property of the java function return.

## methods the FuncCaller.jar has supported 
 * SvgToPng, generate a png file by svg code. the first paramater is svg code, and the second is the save path.

## A Foo main class

```java
package org.myless.func;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class FooFunc {
  public static void main(String... args){}
  
  public static Map<String, Object> run(List<String> args){
    Map<String, Object> result = new HashMap<String, Object>();
    
    if(args.size() > 0){
      result.put("status", String.valueOf(0));
      result.put("value", "join result: " + join(args));
    }else{
      result.put("status", "-1");
      result.put("error_msg", "empty list!");
    }
    
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
