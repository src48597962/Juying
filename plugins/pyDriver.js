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
    if(!pyModule.get("setCache")){
        // 注入 setCache 方法
        pyModule.put("setCache", PythonHiker.wrapperJsFunc(function(key, value) {
            // 这里可以用 Android 的 SharedPreferences 或其他方式存储缓存
            // 例如：
            var prefs = com.chaquo.python.Python.getPlatform().getApplication().getSharedPreferences("py_cache", 0);
            prefs.edit().putString(key, value).apply();
            return true; // 返回是否成功
        }));
    }
    if(!pyModule.get("getCache")){
        // 注入 getCache 方法
        pyModule.put("getCache", PythonHiker.wrapperJsFunc(function(key) {
            var prefs = com.chaquo.python.Python.getPlatform().getApplication().getSharedPreferences("py_cache", 0);
            return prefs.getString(key, null); // 如果 key 不存在，返回 null
        }));
    }
    return pyModule;
}
