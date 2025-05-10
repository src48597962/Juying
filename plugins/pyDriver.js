var PythonHiker = $.require("hiker://files/plugins/chaquopy/PythonHiker.js");
// py源获取本地文件路径
function getPyFile(url) {
    if(url.startsWith('hiker')){
        url = getPath(url).slice(7);
    }else if(url.startsWith('file://')){
        url = url.slice(7);
    }
    return url;
}
// 初始化py源修正相关模块方法
function initPyModule(api_url) {
    log("aaa");
    log(Object.keys(PythonHiker.runPy(getPyFile(api_url))));
    log($.type(PythonHiker.runPy(getPyFile(api_url)).get("getName")));
    log($.type(PythonHiker.runPy(getPyFile(api_url)).get("detailContent")));
    log($.type(PythonHiker.runPy(getPyFile(api_url)).getClass("detailContent")));
    var pyModule = PythonHiker.runPy(getPyFile(api_url)).callAttr("Spider");
    log("bbb");
    
    if(!pyModule.get("getName")){
        log("add getName");
        pyModule.put("getName", PythonHiker.wrapperJsFunc(function(){
            return "";
        }));
    }
    
    if(!pyModule.get("setCache")){
        // 注入 setCache 方法
        pyModule.put("setCache", PythonHiker.wrapperJsFunc(function(key, value){
            putMyVar("py_"+key, value);
            return true;
        }));
    }

    if(!pyModule.get("getCache")){
        // 注入 getCache 方法
        pyModule.put("getCache", PythonHiker.wrapperJsFunc(function(key){
            return getMyVar("py_"+key, "");
        }));
    }

    return pyModule;
}
