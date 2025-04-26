let d = [];
d.push({
    col_type: "input",
    desc: "code",
    extra: {
        type: "textarea",
        height: 5,
        highlight: true,
        onChange: $.toString(() => {
            putMyVar("pycode", input);
        }),
        defaultValue: getMyVar("pycode", ""),
        titleVisible: false,
    }
});
d.push({
    title: "启动",
    col_type: "text_center_1",
    url: $("#noLoading#").lazyRule((configc) => {
        let code = getMyVar("pycode", "");
        const PythonHiker = $.require("hiker://files/plugins/chaquopy/PythonHiker.js");
        PythonHiker.execCode(code);
        return "toast://开始运行";
    })
});

setResult(d);
//其他小程序调用请用"hiker://files/plugins/chaquopy/PythonHiker.js"
const PythonHiker = $.require("hiker://files/plugins/chaquopy/PythonHiker.js");
const pyfile = "https://ghproxy.net/https://raw.githubusercontent.com/JJBJJ/PyramidStore/refs/heads/main/plugin/app/%E5%A5%87%E8%BF%B9APP.py";
let testModule = PythonHiker.runPy(pyfile).callAttr(Spider);
//let sp = testModule.Spider();
//let formatJo = sp.init([]);
//PythonHiker.callFunc(testModule, "init", [])
let formatJo = testModule.homeContent(False);
log(formatJo);
//从指定路径加载py模块并返回模块句柄
/*let testModule = PythonHiker.runPy(getPath("hiker://files/plugins/chaquopy/libs_py/test.py").slice(7), "__main__");
//给模块注入一个全局函数
testModule.put("jsFun", PythonHiker.wrapperJsFunc(function(arr, obj, pyfun){
    log(Array.isArray(arr))
    
    log(obj)
    log(typeof pyfun)
    //js返回的非基本类型数据需要用PythonHiker.fromJs进行包装
    return PythonHiker.fromJs(()=>{
        log("你好")
    })
    
    //return "ckck";
}));

//通过callAttr(funcName, ...args)调用模块里的py方法
//PythonHiker.pyToJs将返回的py基本类型转为Js类型
log(PythonHiker.pyToJs(testModule.callAttr("main")))
//PythonHiker.callFunc调用函数会自动转换类型。
//指定参数名传参PythonHiker.Kwarg
log(PythonHiker.callFunc(testModule,"my_function", 1, 2, PythonHiker.Kwarg("c", 7)))
log(PythonHiker.callFunc(testModule,"my_function", 1, 2, PythonHiker.Kwarg("c", 7)))

PythonHiker.callFunc(testModule,"my_function2", {k:"kooo"})

//对于大型json请用PythonHiker.toPyJson包装，性能会更好
PythonHiker.callFunc(testModule,"my_function2", PythonHiker.toPyJson({k:"k"}))

//运行py文件

let test = PythonHiker.runPy(getPath("hiker://files/plugins/chaquopy/libs_py/test.py").slice(7));


//创建一个字典接收结果
let dict = PythonHiker.Builtins.callAttr("dict");
//执行py代码片段
PythonHiker.execCode(String.raw `
from base.hiker import *
import json as JSON
#dc = JSON.loads(fetch("http://hiker.nokia.press/hikerule/notice/get"));
dc={"name":"LoyDgIk"}
`, dict)

//注意执行完成的结果都是PyObject对象不能直接使用，需要用asMap,asList,asSet,toString,toInt...等方法进行转换
//log(PythonHiker.toJson(dict.asMap().get("dc")));
log(PythonHiker.pyToJs(dict).dc)
let phModule = PythonHiker.runPy("/storage/emulated/0/easybox/drpy_dzlive/drpy_py/胖虎.py", "__main__");
setResult([{
    title:"详细请查看代码",
    col_type:"text_center_1"
}])
*/
/*
PythonHiker.execCode(String.raw `
from base.hiker import *

setHomeResult([{"title":"ok", "col_type":"text_center_1"}])
`)

*/