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
        const Context = java.lang.Class.forName("android.content.Context");
        const activity = getCurrentActivity();
        pyModule.put("setCache", PythonHiker.wrapperJsFunc(function(key, vaule){
            const prefs = activity.getSharedPreferences("py_cache", Context.MODE_PRIVATE);
            prefs.edit().putString(key, JSON.stringify(value)).apply();
            return true;
        }));
    }
    if(!pyModule.get("getCache")){
        // 注入 getCache 方法
        pyModule.put("getCache", PythonHiker.wrapperJsFunc(function(key){
            const prefs = activity.getSharedPreferences("py_cache", Context.MODE_PRIVATE);
            const value = prefs.getString(key, null);
            return value ? JSON.parse(value) : null;
        }));
    }

    return pyModule;
}
