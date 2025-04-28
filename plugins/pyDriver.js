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
        // 1. 获取必要的Java类
        var Integer = java.lang.Integer;
        var Context = java.lang.Class.forName("android.content.Context");
        var activity = getCurrentActivity();

        // 2. 转换模式常量
        var MODE_PRIVATE = Integer.valueOf(Context.MODE_PRIVATE);
        pyModule.put("setCache", PythonHiker.wrapperJsFunc(function(key, vaule){
            try {
                var prefs = activity.getSharedPreferences("py_cache", MODE_PRIVATE);
                prefs.edit().putString(key, JSON.stringify(value)).apply();
                return true;
            } catch(e) {
                console.error("Cache write failed:", e);
                return false;
            }
        }));
    }
    if(!pyModule.get("getCache")){
        // 注入 getCache 方法
        pyModule.put("getCache", PythonHiker.wrapperJsFunc(function(key){
            try {
                var prefs = activity.getSharedPreferences("py_cache", MODE_PRIVATE);
                var value = prefs.getString(key, null);
                return value ? JSON.parse(value) : null;
            } catch(e) {
                console.error("Cache read failed:", e);
                return null;
            }
        }));
    }

    return pyModule;
}
