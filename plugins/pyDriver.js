var PythonHiker = $.require("hiker://files/plugins/chaquopy/PythonHiker.js");
function initPyModule(api_url) {
    var pyModule = PythonHiker.runPy(getPyFile(api_url)).callAttr("Spider");
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
    if(!pyModule.get("getName")){
        pyModule.put("getName", PythonHiker.wrapperJsFunc(function(){
            return "";
        }));
    }
    var context = PythonHiker.getAndroidContext();
    if(!pyModule.get("setCache")){
        // 注入 setCache 方法
        pyModule.put("setCache", function(key, value) {
            var prefs = context.getSharedPreferences("py_cache", 0);
            prefs.edit().putString(key, value).apply();
        });
    }
    if(!pyModule.get("getCache")){
        // 注入 getCache 方法
        pyModule.put("getCache", function(key) {
            var prefs = context.getSharedPreferences("py_cache", 0);
            return prefs.getString(key, null);
        });
    }
    return pyModule;
}
