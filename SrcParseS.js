//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
var SrcParseS = {
    formatUrl: function (url, i) {
        try {
            if (url.trim() == "") {
                return "toast://解析失败，建议切换线路或更换解析方式";
            } else if(/^{/.test(url)){
                return url;
            }else {
                if (url[0] == '/') { url = 'https:' + url }
                if (i == undefined) {
                    if (/ffzy|lz-cdn/.test(url) && typeof(clearM3u8Ad) != "undefined") {
                        url = clearM3u8Ad(url, {timeout: 2000});
                    }else if (getMyVar('SrcM3U8', '1') == "1"&&url.indexOf('.m3u8')>-1) {
                        url = cacheM3u8(url, {timeout: 2000});
                    }
                    if(url.indexOf('User-Agent')==-1){
                        if (/wkfile/.test(url)) {
                            url = url + ';{User-Agent@Mozilla/5.0&&Referer@https://fantuan.tv/}';
                        } else if (/bilibili|bilivideo/.test(url)) {
                            url = url + ";{User-Agent@bili2021&&Referer@https://www.bilibili.com/}";
                        } else if (/mgtv/.test(url)) {
                            url = url + ";{User-Agent@Mozilla/5.0}";
                        }/* else {
                            url = url + ";{User-Agent@Mozilla/5.0}";
                        }*/
                    }
                } else {
                    if ((getMyVar('SrcM3U8', '1') == "1"||url.indexOf('vkey=')>-1)&&url.indexOf('.m3u8')>-1) {
                        url = cacheM3u8(url, {timeout: 2000}, 'video' + parseInt(i) + '.m3u8') + '#pre#';
                    }
                }
                if(url.indexOf('#isVideo=true#')==-1){
                    url = url + '#isVideo=true#';
                }
                return url;
            }
        } catch (e) {
            return url;
        }
    },
    mulheader: function (url) {
        if (/mgtv/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'www.mgtv.com' };
        } else if (/bilibili|bilivideo/.test(url)) {
            var header = { 'User-Agent': 'bili2021', 'Referer': 'www.bilibili.com' };
        } else if (/wkfile/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'fantuan.tv' };
        } else {
            var header = {};
        }
        return header;
    },
    嗅探: function (vipUrl, excludeurl, getparse) {
        showLoading('√视频解析中，请稍候...');
        excludeurl = excludeurl||[];
        clearVar('Srcgetparse');
        return (getMyVar('SrcXTNH', 'web') == 'x5' ? 'x5Rule://' : 'webRule://') + vipUrl + '@' + $.toString((formatUrl,vipUrl,excludeurl,getparse) => {
            if (window.c == null) {
                if (typeof (request) == 'undefined' || !request) {
                    eval(fba.getInternalJs());
                };
                window.c = 0;
            };
            window.c++;
            if (window.c * 250 >= 15 * 1000) {
                fba.clearVar('Srcgetparse');
                fba.log("嗅探失败>超过15秒未获取到");
                fba.hideLoading();
                try{
                    let videourl = vipUrl.split('url=')[1];
                    if(/^http/.test(videourl)){
                        return videourl;
                    }
                }catch(e){ }
                return "toast://解析超时，建议切换线路或更换解析方式";
            }
            //fba.log(fy_bridge_app.getUrls());
            var urls = _getUrls();
            var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8|\.css|\.js|\.gif|\.png|\.jpg|\.jpeg|html,http|m3u88.com\/admin|\.php\?v=h|\?url=h|\&url=h|\?vid=h|%253Furl%253Dh|#amp=1|\.t-ui\.cn/;//设置排除地址
            var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts\?|TG@UosVod|video\/tos\/cn\/tos|m3u8\?pt=m3u8/;//设置符合条件的正确地址
            for (var i in urls) {
                if(getparse&&!fba.getVar('Srcgetparse')&&/url=h|v=h|youku|mgtv|ixigua|qq\.com|iqiyi|migu|bilibili|sohu|pptv|\.le\.|\.1905|cctv/.test(urls[i])&&!/\/bid\?|\.gif\?|ads\?|img\.php|index\/\?|cityjson/.test(urls[i])){
                    try{
                        fba.log(urls[i].match(/http.*?=/)[0]);
                        fba.putVar('Srcgetparse','1');
                    }catch(e){}
                }
                var tc = 1;
                if(/cdn\.oss-cn-m3u8\.tv-nanjing-chengdu\.myqcloud\.com\.zh188.net/.test(urls[i])&&vipUrl.indexOf("=http")>-1){
                    var html = request(urls[i],{timeout:1500})||"";
                    if(html.indexOf("token过期了")>-1){tc = 0;}
                }
                if (!exclude.test(urls[i]) && contain.test(urls[i]) && excludeurl.indexOf(urls[i])==-1 && tc==1) {
                    fba.clearVar('Srcgetparse');
                    fba.log("嗅探成功>"+urls[i]);
                    //return urls[i]+'#isVideo=true#';
                    if(fy_bridge_app.getHeaderUrl&&vipUrl.indexOf("=http")==-1)
                        return $$$("#noLoading#").lazyRule((url) => {
                            url = base64Decode(url);
                            if (/ffzy|lz-cdn/.test(url) && typeof(clearM3u8Ad) != "undefined") {
                                return clearM3u8Ad(url.split(";{")[0], {timeout: 2000})+"#ignoreImg=true##isVideo=true#;{"+url.split(";{")[1];
                            }else if (getMyVar('SrcM3U8', '1') == "1"&&url.indexOf('.m3u8')>-1) {
                                return cacheM3u8(url.split(";{")[0], {timeout: 2000})+"#ignoreImg=true##isVideo=true#;{"+url.split(";{")[1];
                            }else{
                                return url.replace(";{", "#ignoreImg=true##isVideo=true#;{");
                            }
                        }, fy_bridge_app.base64Encode(fy_bridge_app.getHeaderUrl(urls[i])));
                    else {
                        return $$$("#noLoading#").lazyRule((url, formatUrl, vipUrl) => {
                            try{
                                vipUrl = vipUrl.split("=")[1];
                            }catch(e){
                                vipUrl = "";
                            }
                            let dm = "";
                            if(getItem('dmRoute', '0')=="1" && vipUrl.match(/youku|iqiyi|ixigua|migu|sohu|pptv|le|cctv|1905|mgtv|qq.com/)){
                                try{
                                    dm = $.require('hiker://page/dmFun?rule=dm盒子').dmRoute(vipUrl);
                                }catch(e){}
                            }
                            if(dm){
                                let playUrl = formatUrl(url);
                                let urls = [];
                                let headers= [{'User-Agent': 'Mozilla/5.0'}];
                                if(playUrl.indexOf(";{")>-1){
                                    urls.push(playUrl.split(";{")[0]);
                                }else{
                                    urls.push(playUrl);
                                }
                                return JSON.stringify({
                                    urls: urls,
                                    headers: headers,
                                    danmu: dm 
                                }); 
                            }else{
                                return formatUrl(url)+"#ignoreImg=true#";
                            }
                        }, urls[i], formatUrl, vipUrl);
                    }
                }
            }
            /*
            try {
                document.querySelector("#count-down").click()
            } catch (e) {}*/
        }, this.formatUrl, vipUrl, excludeurl, getparse)
    },
    明码: function (playUrl, ref) {
        try {
            if (ref == "") {
                var html = request(playUrl, { timeout: 5000 });
            } else {
                var html = request(playUrl, { headers: { 'Referer': ref }, timeout: 5000 });
            }
            try {
                let rurl = JSON.parse(html).url || JSON.parse(html).data;
                if (typeof (rurl) != "undefined") {
                    var url = rurl;
                }
            } catch (e) {
                var url = html.match(/urls = "(.*?)"/)[1];
            }
            return url;
        } catch (e) {
            return '';
        }
    },
    DN: function (vipUrl) {
        evalPrivateJS("OjB3OHrVodkVQlHIU8UUAC5W0ZBgTQEC4h9eUEcAT9kEM0hY/45YOxs7PDeQEnxjVhaWW2tIqO5GQimD4ssHKSka505+O0avEtQQZ9zRy6GxaBZdTHrbCPcoNIajmr3+JG22tRswOJFYDX5aYk0PfUDEFsZa2OjZbz+xTthnoUPLNm0R2g1kBFnWwGKBWUxEhEsFwFruhFSaxJi1E1WZ7WlbP0v4OpoQgn6M7UXGahP9h2fHi8UBVDGfjzIuVuJSCgICLlVGaAbT0ghic+Kfbp3TmjRhAo1DKretYp1U53apDMvO2Q+6oAyO1js5TJwx51ygFSUqVGAu0C2DLxkG0Z3+L8UPZyJa4KVDlqq/goE=")
        return aytmParse(vipUrl);
    },
    聚嗅: function (vipUrl, x5jxlist, excludeurl) {
        var jxhtml = config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJiexi.html';
        fc(jxhtml, 96);
        let libsjxjs = fetch("hiker://files/libs/" + md5(jxhtml) + ".js");
        if (x5jxlist != undefined) {
            if (x5jxlist.length > 0) {
                var a = JSON.parse(libsjxjs.match(/apiArray=(.*?);/)[1]);
                /*
                for (var i = 0; i < x5jxlist.length; i++) {
                    a.push(x5jxlist[i]);
                }
                function uniq(array) {
                    var temp = []; //一个新的临时数组
                    for (var i = 0; i < array.length; i++) {
                        if (temp.indexOf(array[i]) == -1) {
                            temp.push(array[i]);
                        }
                    }
                    return temp;
                }
                a = uniq(a);//去重
                */
                a = x5jxlist;
                libsjxjs = libsjxjs.replace(libsjxjs.match(/apiArray=(.*?);/)[1], JSON.stringify(a))
            }
        }
        let libsjxhtml = "hiker://files/libs/" + md5(jxhtml) + ".html";
        writeFile(libsjxhtml, libsjxjs);
        return this.嗅探(getPath(libsjxhtml) + '?url=' + vipUrl, excludeurl);
    },
    聚影: function (vipUrl,parseStr) {
        //聚影采用新的、独立的解析逻辑
        var cfgfile = "hiker://files/rules/Src/Juying/config.json";
        var Juyingcfg=fetch(cfgfile);
        if(Juyingcfg != ""){
            eval("var JYconfig=" + Juyingcfg+ ";");
        }else{
            var JYconfig= {printlog: 0, isdn: 0, cachem3u8: 1, parsemode: 1, appjiexinum: 50, xiutannh: 'web'};
        }
        var printlog = JYconfig.printlog||0;
        var isdn = JYconfig.isdn==0?0:1;
        if(isdn==0){
            evalPrivateJS("wPd5kY+5GJ5BmsZlzZbh4M6UMvsO/POw5Ccr79sJzidJZhtuvcJM7a2RSma0qjk0OCYh38QrsLE3Y65hZZbjbpV7Na+g+LCR2Ievu8d5D0I/MROm914q3X0lPf5PZOen1xfNlWFj/HrVGjv7kkqtoyfX1BHEh1r5PH6cp8PgZGDEM4Sb+MgHLxeO5vUnSkf39Pm3xcfIe2AYNNADLOnIiiuOKLeuLncZ50H8JRU7fCY=")
            isdn = dndn();
        }
        var parsemode = JYconfig.parsemode || 1;
        var appjiexinum = JYconfig['appjiexinum'] || 50;
        putMyVar('SrcM3U8',JYconfig.cachem3u8);
        if(JYconfig.xiutannh){putMyVar('SrcXTNH',JYconfig.xiutannh);}
        var mulnum = JYconfig.mulnum||3;
        if((MY_NAME=="海阔视界"&&getAppVersion()>=3369)||(MY_NAME=="嗅觉浏览器"&&getAppVersion()>=798)){
            JYconfig['superweb'] = JYconfig.superweb==0?0:1;
        }
        if(vipUrl.match(/youku|iqiyi|ixigua|migu|sohu|pptv|le|cctv|1905|mgtv|qq\.com/)&&vipUrl.indexOf('html?')>-1){
            vipUrl = vipUrl.split('html?')[0]+'html';
        }
        if(printlog==1){log("影片地址："+vipUrl)}; 
        var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8/;//设置排除地址
        var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts\?|TG@UosVod|video\/tos\/cn\/tos|m3u8\?pt=m3u8/;//设置符合条件的正确地址
        var needparse = /suoyo\.cc|fen\.laodi|ruifenglb/;//设置需要解析的视频地址

        if(contain.test(vipUrl)&&!exclude.test(vipUrl)&&!needparse.test(vipUrl)){
            if(printlog==1){log("直链视频地址，直接播放")}; 
            if(vipUrl.indexOf('app.grelighting.cn')>-1){vipUrl = vipUrl.replace('app.','ht.')}
            if (/ffzy|lz-cdn/.test(vipUrl) && typeof(clearM3u8Ad) != "undefined") {
                vipUrl = clearM3u8Ad(vipUrl,{timeout:3000});
            }
            return vipUrl + '#isVideo=true#';
        }else if (vipUrl.indexOf('sa.sogou') != -1) {
            if(printlog==1){log("优看视频，直接明码解析")}; 
            return unescape(request(vipUrl).match(/"url":"([^"]*)"/)[1].replace(/\\u/g, "%u"));
        }else if (/magnet|torrent/.test(vipUrl)) {
            if(printlog==1){log("磁力/BT视频地址，由海阔解析")}; 
            return vipUrl;
        }else if (/\/share\//.test(vipUrl)) {
            if(printlog==1){log("资源网云播地址")}; 
            return this.嗅探(vipUrl);
        }else if (/douyin\.com/.test(vipUrl)) {
            if(printlog==1){log("抖音视频，偿试嗅探")}; 
            return this.嗅探(vipUrl);
        }else{
            var from = "";
            try{
                if(vipUrl.indexOf('-yanaifei.html') != -1){
                    from = 'yanaifei';
                }else if(vipUrl.indexOf('suoyo.cc') != -1){
                    from = 'duoduozy';
                }else if(vipUrl.indexOf('.') != -1){
                    var host = vipUrl.replace('m.tv.','m.').match(/\.(.*?)\//)[1];
                    from = host.split('.')[0];
                }else if(vipUrl.indexOf('-') != -1){
                    from = vipUrl.split('-')[0];
                }else{
                    from = getMyVar('linecode', 'oth');
                }
            }catch(e){
                from = getMyVar('linecode', 'oth');
            }
            if(from=="qiyi"){from = "iqiyi"}
            
            if(printlog==1){log("片源标识："+from+"，需要解析")}; 
            
            function uniq(array) {
                var temp = []; //一个新的临时数组
                for (var i = 0; i < array.length; i++) {
                    if (temp.indexOf(array[i]) == -1) {
                        temp.push(array[i]);
                    }
                }
                return temp;
            }
            function removeByValue(arr, val) {
                for(var i = 0; i < arr.length; i++) {
                    if(arr[i] == val) {
                    arr.splice(i,1);
                    break;
                    }
                }
            }
            
            var Uparselist = [];//待进线程执行的解析列表
            var Wparselist = [];//web解析临时存放列表
            var appJXlist= [];//读取本地保存的app自带历史解析列表
            var myJXlist= [];//读取私有解析列表
            var recordfile = "hiker://files/rules/Src/Juying/parse.json";
            var parserecord=fetch(recordfile);
            if(parserecord!=""){
                try{
                    eval("var recordlist=" + parserecord+ ";");
                }catch(e){
                    var recordlist={};
                }
            }else{
                var recordlist={};
            }
            recordlist['from'] = recordlist['from']||[];
            if(recordlist['from'].indexOf(from)==-1){recordlist['from'].push(from)}//记录到片源标识组
            var excludeurl = recordlist.excludeurl||[];//屏蔽的播放地址
            var excludeparse = recordlist.excludeparse||[];//屏蔽的解析
            try{
                var priorparse = recordlist.priorparse[from].split(';;');//优先上次解析
            }catch(e){
                var priorparse = [];
            }
            
            if(parseStr){
                //指定解析用于测试
                let arr = {type:'test',name:parseStr.name,parse:parseStr.parse,sort:0};
                if(parseStr.header){arr['header'] = parseStr.header}
                Uparselist.push(arr);
            }else if(parsemode==1||parsemode==3){
                if(parsemode==1){
                    //读取app自带的解析，将未屏蔽的入备选
                    var appParses = getMyVar('parse_api', '');
                    if(appParses){
                        let appParselist = appParses.split(',');
                        appParselist = uniq(appParselist);//去重
                        for (var i in appParselist) {
                            if(excludeparse.indexOf(appParselist[i])==-1){
                                Uparselist.push({type:'appz',name:'appz'+i,parse:appParselist[i],sort:0});
                            }
                        }
                        if(printlog==1){log("接口自带的解析数："+Uparselist.length)}; 
                    }
                    //读取本地app保存的解析，将可用加入备选
                    var appJXfile = "hiker://files/rules/Src/Juying/appjiexi.json";
                    var appJX=fetch(appJXfile);
                    if(appJX != ""){
                        eval("var appJXlist=" + appJX+ ";");
                        var apjxnum = 0;
                        for(var j=0;j<appJXlist.length;j++){
                            if(appJXlist[j].from.indexOf(from)>-1&&excludeparse.indexOf(appJXlist[j].parse)==-1&&!Uparselist.some(item => item.parse ==appJXlist[j].parse)){
                                Uparselist.push({type:'apps',name:'apps'+j,parse:appJXlist[j].parse,sort:0});
                                var apjxnum = apjxnum + 1;
                            }
                        }
                        if(printlog==1){log("保存的可用解析数：" + apjxnum)}; 
                    }
                }
                
                //读取私有增加的解析，将可用加入备选
                var myJXfile = "hiker://files/rules/Src/Juying/myjiexi.json";
                var myJX=fetch(myJXfile);
                if(myJX != ""){
                    eval("var myJXlist=" + myJX+ ";");
                    var myjxnum = 0;
                    for(var j=0;j<myJXlist.length;j++){
                        let priorfrom = myJXlist[j].priorfrom || [];
                        let arr = {type:'myjx',name:myJXlist[j].name.replace(/,/g,''),parse:myJXlist[j].parse};
                        if(myJXlist[j].header){arr["header"] = myJXlist[j].header}

                        if(priorfrom.indexOf(from)>-1){
                            if(Uparselist.some(item => item.parse ==myJXlist[j].parse)){
                                for(var i=0;i<Uparselist.length;i++){
                                    if(Uparselist[i].parse==myJXlist[j].parse){
                                        Uparselist.splice(i,1);
                                        break;
                                    }
                                }
                            }
                            arr["sort"] = -1;
                            Uparselist.unshift(arr);
                            /*
                            if(myJXlist[j].web==1){
                                Wparselist.unshift(arr);
                            }else if(parsemode==1){
                                Uparselist.unshift(arr);
                            }
                            */
                            myjxnum = myjxnum + 1;
                        }else{
                            if(myJXlist[j].stopfrom.indexOf(from)==-1&&excludeparse.indexOf(myJXlist[j].parse)==-1&&!Uparselist.some(item => item.parse ==myJXlist[j].parse)){
                                let sort = myJXlist[j]['sort']||0;
                                arr["sort"] = sort;
                                Uparselist.push(arr);
                                /*
                                if(myJXlist[j].web==1){
                                    Wparselist.push(arr);
                                }else if(parsemode==1){
                                    Uparselist.push(arr);
                                }
                                */
                                myjxnum = myjxnum + 1;
                                //非强制优先、非排除片源、非屏蔽优先调用
                            }
                        }
                    }
                    if(printlog==1){log("私有的可用解析数：" + myjxnum)}; 
                }
            }else if(parsemode==2){
                if(printlog==1){log("开启强制断插模式，以下日志都是断插的")}; 
                eval("var config =" + fetch("hiker://files/cache/MyParseSet.json"));
                eval(fetch(config.cj));
                return aytmParse(vipUrl);
            }
            //log(Uparselist)

            var playurl = "";//视频地址
            var x5jxlist = []; //x5嗅探接口存放数组
            var x5namelist = [];//x5解析名称
            var urls = [];//多线路地址
            var names = [];//多线路名称
            var headers = [];//多线路头信息
            var danmu = "";//多线路弹幕
            var dellist = [];//需从本地解析中删除列表
            var appJXchange = 0;//app解析是否有发现新的或增加可解片源
            var myJXchange = 0;//私有解析是否排除片源
            //var appzdchange = 0;//app自带解析是否加入黑名单

            //断插线程代码
            var dnaytmParse = function(vipUrl) {
                try{
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAuto.js');
                    var rurl = aytmParse(vipUrl);
                }catch(e){
                    log("断插执行异常>"+e.message);
                    var rurl = "";
                }
                return {url: rurl, ulist: {type:"dn",name:'dn',parse:'dn',x5:0}}; 
            }
            //明码解析线程代码
            var task = function(obj) {
                if(/^function/.test(obj.ulist.parse.trim())){
                    eval('var JSparse = '+obj.ulist.parse)
                    var rurl = JSparse(obj.vipUrl);
                    if(/^toast/.test(rurl)){
                        if(printlog==1){log(obj.ulist.name+'>提示：'+rurl.replace('toast://',''))};
                        rurl = "";
                    }else if(/^http/.test(rurl)&&obj.testurl(rurl,obj.ulist.name)==0){
                        rurl = "";
                    }                    
                    obj.ulist['x5'] = 0;
                    return {url: rurl,ulist: obj.ulist}; 
                }else{            
                    let taskheader = {withStatusCode:true,timeout:8000};
                    let head = obj.ulist.header||{};
                    if(JSON.stringify(head) != "{}"){
                        taskheader['header'] = head;
                    }
                    let getjson;
                    try{
                        getjson = JSON.parse(request(obj.ulist.parse+obj.vipUrl,taskheader));
                    }catch(e){
                        getjson = {};
                        if(printlog==1){log(obj.ulist.name+'>解析地址访问失败')};
                    }
                    log(getjson);
                    if (getjson.body&&getjson.statusCode==200){
                        var gethtml = getjson.body;
                        var rurl = "";
                        var isjson = 0;
                        try {
                            rurl = JSON.parse(gethtml).url||JSON.parse(gethtml).data.url||JSON.parse(gethtml).data;
                            isjson = 1;
                        } catch (e) {
                            if(/\.m3u8|\.mp4/.test(getjson.url)&&getjson.url.indexOf('=http')==-1){
                                rurl = getjson.url;
                            }else if(/\.m3u8|\.mp4|\.flv/.test(gethtml)){
                                try {
                                    if(gethtml.indexOf('urls = "') != -1){
                                        rurl = gethtml.match(/urls = "(.*?)"/)[1];
                                    }else if(gethtml.indexOf('"url":"') != -1){
                                        rurl = gethtml.match(/"url":"(.*?)"/)[1];
                                    }else if(gethtml.indexOf('id="video" src="') != -1){
                                        rurl = gethtml.match(/id="video" src="(.*?)"/)[1];
                                    }else if(gethtml.indexOf('url: "') != -1){
                                        rurl = gethtml.match(/url: "(.*?)"/)[1];
                                    }else{
                                        //if(printlog==1){log('将日志提交给作者，帮助完善解析逻辑>>>'+gethtml)};
                                    }
                                } catch (e) {
                                    if(printlog==1){log('明码获取错误：'+e.message)};
                                }
                            }else{
                                let html = fetchCodeByWebView(obj.ulist.parse+obj.vipUrl, {
                                    blockRules: ['.m4a','.mp3','.gif','.jpg','.jpeg','.png','.ico','hm.baidu.com','/ads/*.js'],
                                    jsLoadingInject: true,
                                    checkJs: $.toString((parse) => {
                                        try{
                                            if (window.c == null) {
                                                if (typeof (request) == 'undefined' || !request) {
                                                    eval(fba.getInternalJs());
                                                };
                                                window.c = 0;
                                            };
                                            window.c++;
                                            if (window.c * 250 >= 8 * 1000) {
                                                return "1";
                                            }
                                            var urls = _getUrls();
                                            //fba.log(fy_bridge_app.getUrls());
                                            var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8|\.css|\.js|\.gif|\.png|\.jpg|\.jpeg|html,http|m3u88.com\/admin|\.php\?v=h|\?url=h|\&url=h|\?vid=h|%253Furl%253Dh|#amp=1|\.t-ui\.cn|ac=dm/;//设置排除地址
                                            var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts\?|TG@UosVod|video\/tos\/cn\/tos|m3u8\?pt=m3u8/;//设置符合条件的正确地址
                                            for (var i in urls) {
                                                if (contain.test(urls[i])&&!exclude.test(urls[i])) {
                                                    //fba.log("fbw解析到>"+urls[i]);
                                                    fba.putVar(parse, urls[i]);
                                                    return urls[i];
                                                }
                                            }
                                        }catch(e){
                                            //fba.log(e.message);
                                        }
                                    }, obj.ulist.parse)
                                })
                                rurl = getVar(obj.ulist.parse, '');
                                //log(html);
                                clearVar(obj.ulist.parse);
                                //log(rurl);
                            }
                        }
                        var x5 = 0;
                        if(rurl == ""){
                            if(!/404 /.test(gethtml)&&obj.ulist.parse.indexOf('key=')==-1&&isjson==0){
                                if(x5jxlist.length<5){
                                    x5jxlist.push(obj.ulist.parse);
                                    if(printlog==1){log(obj.ulist.name + '>加入x5嗅探列表');}
                                    x5namelist.push(obj.ulist.name);
                                }
                                x5 = 1;
                            }
                        }else{
                            if(obj.testurl(rurl,obj.ulist.name)==0){
                                rurl = "";
                            }
                        }
                        obj.ulist['x5'] = x5;
                        return {url: rurl,ulist: obj.ulist}; 
                    }else{
                        obj.ulist['x5'] = 0;
                        return {url: "",ulist: obj.ulist}; 
                    }
                }
            };

            var iscalldn = 0;//是否调用断插标识
            var recordname = []; //解析成功的作为优先解析临时组
            if(playurl==""&&!parseStr){
                if(Wparselist.length > 0){
                    Wparselist.sort((a, b) => {
                        return a.sort - b.sort
                    })
                };

                for (let i=0;i<Wparselist.length;i++) {
                    if(x5jxlist.length<5||JYconfig.superweb==1){
                        x5jxlist.push(Wparselist[i].parse);
                        x5namelist.push(Wparselist[i].name);
                    }else{
                        break;
                    }
                }

                if(parsemode==1){
                    if(Uparselist.length > 0){
                        Uparselist.sort((a, b) => {
                            return a.sort - b.sort
                        })
                    };

                    if(priorparse.length>0){
                        //优先上次成功的
                        for(let i=0; i<Uparselist.length; i++) {
                            if(priorparse.indexOf(Uparselist[i].name)>-1 || (/app/.test(Uparselist[i].type)&&priorparse.indexOf(Uparselist[i].parse)>-1)) {
                                let Uparseobj = Uparselist[i];
                                Uparselist.splice(i,1);
                                Uparselist.unshift(Uparseobj);
                            }
                        }
                    }

                    if(isdn==1&&Uparselist.length==0){
                        Uparselist.push({type:'dn',name:'断插'});
                        iscalldn = 1;
                    }
                }else{
                    Uparselist = [];
                }
            }

            for (var i=0;i<Uparselist.length;i++) {
                if(playurl!=""){break;}
                let UrlList = [];
                let Namelist = [];
                var beurls = [];//用于存储多线程返回url
                var beparses = [];//用于存储多线程解析地址
                var beerrors = [];//用于存储多线程是否有错误
                var sccess = 0;//计算成功的结果数
                let p = i + mulnum + 2;
                if(p>Uparselist.length){p=Uparselist.length}
                for(let s=i;s<p;s++){
                    UrlList.push(Uparselist[s]);
                    Namelist.push(Uparselist[s].name);
                    i=s;
                }
                if(printlog==1){log("本轮排队解析："+Namelist)};
                if(isdn==1&&iscalldn==0&&Uparselist.length>0&&!parseStr){
                    iscalldn = 1;//断插辅助只调用一轮
                    UrlList.push({type:'dn'});
                }

                let Urlparses = UrlList.map((list)=>{
                    if(list.type=="dn"){
                        return {func: dnaytmParse, param: vipUrl, id: 'dn'}
                    }else{
                        if (/^\/\//.test(list.parse)) { list.parse = 'https:' + list.parse }
                        return {
                            func: task,
                            param: {
                                ulist: list,
                                vipUrl: vipUrl,
                                testurl: this.testvideourl
                            },
                            id: list.parse
                        }
                    }
                });

                be(Urlparses, {
                    func: function(obj, id, error, taskResult) {
                        let beurl = taskResult.url;
                        if(beurl!=""&&needparse.test(beurl)&&beurl.indexOf('?')==-1){
                            beurl = "";
                        }
                        if(/cdn\.oss-cn-m3u8\.tv-nanjing-chengdu\.myqcloud\.com\.zh188.net/.test(beurl)){
                            let getbeurl = request(beurl,{timeout:1500})||"";
                            if(getbeurl.indexOf("token过期了")>-1){
                                beurl = "";
                            }
                        }
                        obj.results.push(beurl);
                        obj.parses.push(taskResult.ulist);
                        obj.errors.push(error);
                        if (contain.test(beurl)&&!exclude.test(beurl)&&excludeurl.indexOf(beurl)==-1) {
                            sccess = sccess + 1;
                            if(sccess>=mulnum){
                                if(printlog==1){log("线程中止，已捕获视频")};
                                return "break";
                            }
                        }else{
                            //if(printlog==1&&taskResult.ulist.x5==0){log(taskResult.ulist.name + '>解析失败');}
                        }
                    },
                    param: {
                        results: beurls,
                        parses: beparses,
                        errors: beerrors
                    }
                });
                
                for(let k in beparses){
                    var parseurl = beparses[k].parse;
                    if(beerrors[k]==null&&contain.test(beurls[k])&&!exclude.test(beurls[k])&&excludeurl.indexOf(beurls[k])==-1){
                        if(playurl==""){playurl = beurls[k];}
                        if(beparses[k].type=="test"){
                            //当前为测试
                            if(printlog==1){log(beparses[k].name+'>测试成功>'+beurls[k])};
                        }else if(beparses[k].type!="dn"){
                            //记录除断插线程以外最快的，做为下次优先
                            if(printlog==1){
                                if(priorparse.indexOf(beparses[k].name)>-1){
                                    log(beparses[k].name+'>优先上次解析成功>'+beurls[k]);
                                }else{
                                    log(beparses[k].name+'>解析成功>'+beurls[k]+'，记录为片源'+from+'的优先');
                                }
                            }
                            if(beparses[k].type=="myjx"){//私有解析保存解析名
                                if(recordname.indexOf(beparses[k].name)==-1){recordname.push(beparses[k].name)}
                            }else if(/app/.test(beparses[k].type)){//app接口解析保存链接
                                if(recordname.indexOf(parseurl)==-1){recordname.push(parseurl)}
                            }

                            if(!myJXlist.some(item => item.parse ==parseurl)){
                                //解析成功的且不在私有解析中的添加到本地
                                var isaddparse = 1;
                                for(var j=0;j<appJXlist.length;j++){
                                    let appjxurl = appJXlist[j].parse||"";
                                    if(appjxurl == parseurl){
                                        //判断本地记录的解析是否已存在
                                        if(appJXlist[j].from.indexOf(from)==-1){
                                            if(printlog==1){log('发现当前解析可解新片源'+from+'，自动修正')};
                                            appJXlist[j].from[appJXlist[j].from.length] = from;
                                            appJXchange = 1;
                                        }
                                        isaddparse = 0;
                                    }
                                }
                                if(isaddparse==1&&appJXlist.length<=appjiexinum){
                                    let arr  = { "parse" : parseurl, "from" : [from] };
                                    appJXlist.unshift(arr);//新解析放在前面
                                    appJXchange = 1;
                                    if(printlog==1){log('发现新解析，自动保存，当前解析数：' + appJXlist.length)};
                                }
                            }else{
                                //私有解析成功的，提升一下排序
                                for(var j=0;j<myJXlist.length;j++){
                                    if(parseurl==myJXlist[j].parse){
                                        //解析成功的,排序+1
                                        myJXlist[j]['sort'] = myJXlist[j]['sort']||0;
                                        if(myJXlist[j].sort>0){
                                            myJXlist[j].sort = myJXlist[j].sort - 1;
                                            myJXchange = 1;
                                        }
                                        break;
                                    }
                                }
                            }
                        }else{
                            if(printlog==1){log('当前播放地址通过断插解析获得')};
                        }
                        
                        //组一个多线路播放地址备用，log($.type(beurls[k]));
                        try{
                            eval('var urljson = '+ beurls[k]);
                            var urltype = $.type(urljson);
                        }catch(e){
                            var urltype = "string";
                        }
                        if(urltype == "object"){
                            try {
                                let murls = urljson.urls;
                                let mnames = urljson.names||[];
                                let mheaders = urljson.headers;
                                for(var j=0;j<murls.length;j++){
                                    if(!/yue|480/.test(mnames[j])){
                                        let MulUrl = this.formatMulUrl(murls[j].replace(/;{.*}/g,""), urls.length);
                                        urls.push(MulUrl.url);
                                        if(mnames.length>0){
                                            names.push(mnames[j]);
                                        }else{
                                            names.push(beparses[k].name || '线路'+urls.length);
                                        }
                                        headers.push(mheaders[j]);
                                    }
                                }
                                if(urljson.danmu){danmu = urljson.danmu;}
                            } catch (e) {
                                log('判断多线路地址对象有错：'+e.message);
                            }
                        }else{
                            let MulUrl = this.formatMulUrl(beurls[k].replace(/;{.*}/g,""), urls.length);
                            urls.push(MulUrl.url);
                            names.push(beparses[k].name || '线路'+urls.length);
                            headers.push(MulUrl.header);
                        }
                        //if(ismul==0){break;}
                    }else{
                        if(beparses[k].type!="test"){
                            dellist.push(beparses[k])
                        };
                    }
                }//排队解析结果循环
            }//解析全列表循环

            var failparse = [];
            //失败的解析，处理
            for(var p=0;p<dellist.length;p++){
                if(dellist[p].type=="myjx"){
                    for(var j=0;j<myJXlist.length;j++){
                        if(dellist[p].parse==myJXlist[j].parse){
                            if(dellist[p].x5==1){
                                myJXlist[j]['web'] = 1;
                                myJXlist[j]['sort'] = myJXlist[j]['sort']||0;
                                myJXlist[j].sort = myJXlist[j].sort + 1;
                            }else{
                                //解析失败的,且排序大于5次从私有中排除片源
                                myJXlist[j]['sort'] = myJXlist[j]['sort']||0;
                                myJXlist[j].sort = myJXlist[j].sort + 1;
                                //if(printlog==1){log(myJXlist[j].name+'>解析失败排序-1，当前排序'+myJXlist[j].sort)};
                                failparse.push(myJXlist[j].name);
                                if(myJXlist[j].sort>5 && myJXlist[j].stopfrom.indexOf(from)==-1){
                                    myJXlist[j].stopfrom[myJXlist[j].stopfrom.length] = from;
                                    if(printlog==1){log(myJXlist[j].name+'>解析失败大于5次，排除片源'+from)};
                                }
                            }
                            myJXchange = 1;
                            break;
                        }
                    }
                }
                if(dellist[p].type=="appz"){
                    //app自带的解析在解析失败时，直接加入黑名单
                    recordlist['excludeparse'] = recordlist['excludeparse']||[];
                    if(recordlist['excludeparse'].indexOf(dellist[p].parse)==-1){
                        recordlist['excludeparse'].push(dellist[p].parse);
                        //appzdchange = 1;
                    }
                }
                if(dellist[p].type=="apps"){
                    for(var j=0;j<appJXlist.length;j++){
                        if(dellist[p].parse==appJXlist[j].parse){
                            //解析失败的从app本地删除
                            if(appJXlist[j].from.length>1){
                                //if(printlog==1){log('发现失效app保存解析，自动删除解析片源'+from)};
                                removeByValue(appJXlist[j].from,from);
                                appJXchange = 1;
                            }else{
                                //if(printlog==1){log('发现失效app保存解析，自动删除解析')};
                                appJXlist.splice(j,1);
                                appJXchange = 1;
                            }
                            break;
                        }
                    }  
                }

            }
            
            if(!parseStr){
                //私有解析有排除片源
                if(myJXchange == 1){writeFile(myJXfile, JSON.stringify(myJXlist));}
                //app有发现或修改解析时保存本地
                if(appJXchange == 1){writeFile(appJXfile, JSON.stringify(appJXlist));}
                //私有解析失败的统一提示
                if(failparse.length>0&&printlog==1){log(failparse+'<以上私有解析失败，排序-1')}
                //记录上次优先解析和自带解析有加入黑名单的保存                
                recordlist['priorparse'] = recordlist['priorparse']||{};
                recordlist['priorparse'][from] = recordname.join(';;');
                delete recordlist['parse'];
                delete recordlist['exclude'];
                delete recordlist['name'];
                delete recordlist['head'];
                writeFile(recordfile, JSON.stringify(recordlist));
            } 

            //dm盒子弹幕
            let dm = "";
            if(getItem('dmRoute', '0')=="1" && vipUrl.match(/youku|iqiyi|ixigua|migu|sohu|pptv|le|cctv|1905|mgtv|qq.com/)){
                try{
                    dm = $.require('hiker://page/dmFun?rule=dm盒子').dmRoute(vipUrl);
                }catch(e){}
            }

            //播放
            if(playurl!=""){
                if(urls.length>1){
                    if(printlog==1){log('解析完成，进入播放2')};
                    return JSON.stringify({
                        urls: urls,
                        names: names,
                        headers: headers,
                        danmu: danmu || dm 
                    }); 
                }else{
                    if(printlog==1){log('解析完成，进入播放1')};
                    if(dm && getItem('dmRoute', '0')=="1"){
                        let MulUrl = this.formatMulUrl(playurl, 0);
                        urls = [];
                        headers= [];
                        urls.push(MulUrl.url);
                        headers.push(MulUrl.header);
                        return JSON.stringify({
                            urls: urls,
                            headers: headers,
                            danmu: dm 
                        }); 
                    }else{
                        return this.formatUrl(playurl);
                    }
                }
            }else{
                if(parseStr){
                    if(x5jxlist.length>0){
                        return this.嗅探(parseStr.parse+vipUrl,excludeurl);
                    }else{
                        return "toast://解析失败";
                    }
                }else{
                    if(printlog==1&&x5namelist.length>0){
                        log('进入嗅探解析列表：' + x5namelist)
                    }
                    
                    if(JYconfig.superweb==1&x5jxlist.length>0){
                        if(printlog==1){log('开启播放器超级嗅探模式')}
                        let weburls = x5jxlist.map(item => "video://" + item +vipUrl);
                        return JSON.stringify({
                            urls: weburls,
                            names: x5namelist,
                            danmu: dm
                        }); 
                    }else if(x5jxlist.length>0){
                        return this.聚嗅(vipUrl, x5jxlist,excludeurl);
                    }else{
                        if(printlog==1){log('没有解析，跳转原网页')}
                        return vipUrl;
                    }
                }
            }
        }
    },
    //处理多线路播放地址
    formatMulUrl: function (url,i) {
        try {
            let header = this.mulheader(url);
            if ((getMyVar('SrcM3U8', '1') == "1"||url.indexOf('vkey=')>-1)&&url.indexOf('.m3u8')>-1) {
                let name = 'video'+parseInt(i)+'.m3u8';
                url = cacheM3u8(url, {headers: header, timeout: 3000}, name)+'#pre#';
            }
            if(url.indexOf('#isVideo=true#')==-1 && i==0){
                url = url + '#isVideo=true#';
            }
            return {url:url, header:header};
        } catch (e) {
            if(config.printlog==1){log("√错误："+e.message)};
            return url;
        }   
    },
    //测试视频地址有效性
    testvideourl: function (url,name,times) {
        if(!url){return 0}
        if(!name){name = "解析"}
        if(!times){times = 120}
        try {
            if(/vkey=|banyung\.|mgtv\.com|1905\.com|qq\.com/.test(url)){
                return 1;
            }else if (/\.m3u8/.test(url)) {
                var urlcode = JSON.parse(request(url,{withStatusCode:true,timeout:2000}));
                //log(name+'url访问状态码：'+urlcode.statusCode)
                if(urlcode.statusCode==-1){
                    log(name+'>m3u8探测超时未拦载，结果未知');
                    return 1;
                }else if(urlcode.statusCode!=200){
                    //log(name+'>m3u8播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    try{
                        var tstime = urlcode.body.match(/#EXT-X-TARGETDURATION:(.*?)\n/)[1];
                        var urltss = urlcode.body.replace(/#.*?\n/g,'').replace('#EXT-X-ENDLIST','').split('\n');
                    }catch(e){
                        log(name+'>√错误：探测异常未拦截>'+e.message);
                        return 1;
                    }
                    if(parseInt(tstime)*parseInt(urltss.length) < times){
                        log(name+'>m3u8视频长度小于设置的'+times+'s，疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }else{
                        var urlts = urltss[0];
                        if(/^http/.test(urlts)&&!urlts.match(/youku|iqiyi|ixigua|migu|sohu|pptv|le|cctv|1905|mgtv|qq\.com|M3U8\.TV/)){
                            var tscode = JSON.parse(request(urlts,{headers:{'Referer':url},onlyHeaders:true,redirect:false,timeout:2000}));
                            //log(name+'ts访问状态码：'+tscode.statusCode)
                            if(tscode.statusCode==-1){
                                log(name+'>ts段探测超时未拦载，结果未知');
                                return 1;
                            }else if(tscode.statusCode!=200 && tscode.statusCode!=403){
                                log(name+'>ts段地址疑似失效或网络无法访问，不信去验证一下>'+url);
                                return 0;
                            }
                        }    
                    }
                }
            }else if (/\.mp4/.test(url)) {
                var urlheader = JSON.parse(request(url,{onlyHeaders:true,timeout:2000}));
                if(urlheader.statusCode==-1){
                    log(name+'>mp4探测超时未拦载，结果未知');
                    return 1;
                }else if(urlheader.statusCode!=200){
                    log(name+'>mp4播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    var filelength = urlheader.headers['content-length'];
                    if(parseInt(filelength[0])/1024/1024 < 30){
                        log(name+'>mp4播放地址疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }
                }
            }
            return 1;
        } catch(e) {
            log(name+'>错误：探测异常未拦截，可能是失败的>'+e.message);
            return 1;
        }
    }
}

