//个人学习代码
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
                    if (getMyVar('SrcM3U8', '1') == "1"&&url.indexOf('.m3u8')>-1) {
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
    嗅探: function (vipUrl) {
        showLoading('√视频解析中，请稍候...');
        return (getMyVar('SrcXTNH', 'web') == 'x5' ? 'x5Rule://' : 'webRule://') + vipUrl + '@' + $.toString((formatUrl,vipUrl) => {
            if (window.c == null) {
                if (typeof (request) == 'undefined' || !request) {
                    eval(fba.getInternalJs());
                };
                window.c = 0;
            };
            window.c++;
            if (window.c * 250 >= 15 * 1000) {
                fba.log("嗅探失改>超过15秒未获取到");
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
            var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8|\.css|\.js|\.gif|\.png|\.jpeg|api\.m3u88\.com/;//设置排除地址
            var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts/;//设置符合条件的正确地址
            for (var i in urls) {
                if (!exclude.test(urls[i]) && contain.test(urls[i]) && urls[i].indexOf('=http')==-1) {
                    //fba.log("嗅探成功>"+urls[i]);
                    //return urls[i]+'#isVideo=true#';
                    if(fy_bridge_app.getHeaderUrl&&vipUrl.indexOf("=http")==-1)
                        return $$$("#noLoading#").lazyRule((url) => {
                            url = base64Decode(url);
                            if (getMyVar('SrcM3U8', '1') == "1"&&url.indexOf('.m3u8')>-1) {
                                return cacheM3u8(url.split(";{")[0], {timeout: 2000})+"#ignoreImg=true##isVideo=true#;{"+url.split(";{")[1];
                            }else{
                                return url.replace(";{", "#ignoreImg=true##isVideo=true#;{");
                            }
                        }, fy_bridge_app.base64Encode(fy_bridge_app.getHeaderUrl(urls[i])));
                    else {
                        return $$$("#noLoading#").lazyRule((url, formatUrl) => {
                            //url = url.replace(/http.*?\?url=/, '');
                            return formatUrl(url)+"#ignoreImg=true#";
                        }, urls[i], formatUrl);
                    }
                }
            }
        }, this.formatUrl, vipUrl)
    },
    智能: function (vipUrl, input) {
        showLoading('√智能解析中，请稍候');
        var video = "";
        try {
            if (vipUrl.search(/LT-/) > -1) {
                var jxList = ["https://ltjx.jeeves.vip/home/api?type=ys&uid=461939&key=degkpqruyzACEJLORW&url=", "https://ltjx.jeeves.vip/home/api?type=ys&uid=1589472&key=aehjpzAHILOPQRU456&url=", "https://vip.legendwhb.cn/m3u8.php?url=", "https://jx.zjmiao.com/?url=", "https://09tv.top/jx/?url="];
                var keyList = ["", "", "D63D64E0EDA774E3", "63f49d21a0dccf3c", "A42EAC0C2B408472"];
                var refList = ["", "", "https://wnvod.net", "", "https://09tv.top"];
                var jxLX = ["O", "O", "M", "M", "M"];
                for (var i = 0; i < jxList.length; i++) {
                    if (jxLX[i] != "M") {
                        video = this.明码(jxList[i] + vipUrl);
                        if (video.slice(0, 4) == 'http') {
                            break;
                        } else {
                            log('线路LT：' + jxList[i] + ' 解析异常');
                        }
                    } else {
                        video = this.maoss(jxList[i] + vipUrl, refList[i], keyList[i]);
                        if (video.slice(0, 4) == 'http') {
                            break;
                        } else {
                            log('线路LT：' + jxList[i] + ' 解析异常');
                        }
                    }
                }
            } else if (/renrenmi-/.test(vipUrl)) {
                var jxList = ["https://jx.blbo.cc:4433/analysis.php?v=", "https://jx.renrenmi.cc/?url=", "https://a.dxzj88.com/jxrrm/jiami.php?url="];
                for (var i = 0; i < jxList.length; i++) {
                    video = this.明码(jxList[i] + vipUrl);
                    if (video.slice(0, 4) == 'http') {
                        break;
                    } else {
                        log('线路RR：' + jxList[i] + ' 解析异常');
                    }
                }
            } else if (/RongXingVR/.test(vipUrl)) {
                var jxList = ["https://vip.rongxingvr.top/api/?key=CMTJsEtHIzsLqZ6OGl&url=", "https://tc.yuanmajs.cn/jxplayer.php?v="];
                for (var i = 0; i < jxList.length; i++) {
                    video = this.明码(jxList[i] + vipUrl);
                    if (video.slice(0, 4) == 'http') {
                        break;
                    } else {
                        log('线路RX：' + jxList[i] + ' 解析异常');
                    }
                }
            } else if (/wuduyun-/.test(vipUrl)) {
                var jxList = ["http://jf.1080p.icu:3232/home/api?type=dsp&uid=147565&key=adilmopuBEFJNUV067&url="];
                for (var i = 0; i < jxList.length; i++) {
                    video = this.明码(jxList[i] + vipUrl);
                    if (video.slice(0, 4) == 'http') {
                        break;
                    } else {
                        log('线路WD：' + jxList[i] + ' 解析异常');
                    }
                }
            } else if (/xueren-/.test(vipUrl)) {
                var jxList = ["https://www.shangjihuoke.com/json.php/?url="];
                for (var i = 0; i < jxList.length; i++) {
                    video = this.明码(jxList[i] + vipUrl);
                    if (video.slice(0, 4) == 'http') {
                        break;
                    } else {
                        log('线路XR：' + jxList[i] + ' 解析异常');
                    }
                }
            } else if (/\.suoyo|adHuRo0dcuHoM163L1/.test(vipUrl)) {
                var apiList = ["https://p.tjomet.com/duoduo/api.php", "https://jiexi.ysgc.xyz/api.php"];
                var refList = ["https://www.ysgc.cc/", "https://www.ysgc.cc/"];
                if (/suoyo/.test(vipUrl)) {
                    //明码https://a.dxzj88.com/jxdd/dd.php?url=
                    vipUrl = 'adHuRo0dcuHoM163L1y49tM3U4LmNhY2hlLnN1b3lvLmNj' + base64Encode(vipUrl.replace('https://m3u8.cache.suoyo.cc', ''));
                }
                for (var i = 0; i < apiList.length; i++) {
                    video = this.DD(vipUrl, apiList[i], refList[i]);
                    if (video.slice(0, 4) == 'http') {
                        break;
                    } else {
                        log('线路DD：' + apiList[i] + ' 解析异常');
                    }
                }
            } else if (/ruifenglb/.test(vipUrl)) {
                var jxList = ["http://player.yjhan.com:8090/api/?key=sQWHLErduwNEmxfx3V&url=", "https://004.summ.vip/?url=", "https://shangjihuoke.com/CL4K/?url="];
                var keyList = ["", "A42EAC0C2B408472", "A42EAC0C2B408472"];
                var refList = ["", "", ""];
                var jxLX = ["O", "M", "M"];
                for (var i = 0; i < jxList.length; i++) {
                    if (jxLX[i] != "M") {
                        video = this.明码(jxList[i] + vipUrl);
                        if (video.slice(0, 4) == 'http') {
                            break;
                        } else {
                            log('线路RX：' + jxList[i] + ' 解析异常');
                        }
                    } else {
                        video = this.maoss(jxList[i] + vipUrl, refList[i], keyList[i]);
                        if (video.slice(0, 4) == 'http') {
                            break;
                        } else {
                            log('线路CL4K：' + jxList[i] + ' 解析异常');
                        }
                    }
                }
            } else if (/xfy-/.test(vipUrl)) {
                video = this.maoss("https://jx.zjmiao.com/?url=" + vipUrl, "", "63f49d21a0dccf3c");
            } else if (/\.mp4|\.m3u8/.test(vipUrl)) {
                video = vipUrl;
            } else if (/youku|mgtv|ixigua|qq\.com|iqiyi|migu|bilibili|sohu|pptv|\.le\.|\.1905|cctv/.test(vipUrl)) {
                if (getMyVar('SrcGJFS', '1') == "2") {
                    return this.DN(vipUrl);
                } else {
                    return this.嗅探(input);
                }
            }
        } catch (e) { }
        if (video == "") {
            return this.嗅探(input);
        } else {
            return this.formatUrl(video);
        }
    },
    官网: function (vipUrl, jxUrl, isDn) {
        try {
            if (getMyVar('SrcGJFS', '1') == "2" || isDn == "1") {
                return this.DN(vipUrl);
            } else {
                if (getMyVar('author') == "帅√`人才") {
                    return this.聚嗅(vipUrl);
                } else {
                    if (jxUrl == "" || jxUrl == undefined) { jxUrl = "https://jx.blbo.cc:4433/?url=" }
                    return this.嗅探(jxUrl + vipUrl);
                }
            }
        } catch (e) {
            return '';
        }
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
    maoss: function (playUrl, ref, key) {
        try {
            if (ref) {
                var html = request(playUrl, { headers: { 'Referer': ref }, timeout: 8000 });
            } else {
                var html = request(playUrl, { timeout: 8000 });
            }
            if (html.indexOf('&btwaf=') != -1) {
                html = request(playUrl + '&btwaf' + html.match(/&btwaf(.*?)"/)[1], { headers: { 'Referer': ref }, timeout: 8000 })
            }
            var iv = html.match(/_token = "(.*?)"/)[1];

            var getVideoInfo = function (text) {
                eval(getCryptoJS());
                var video = CryptoJS.AES.decrypt(text, CryptoJS.enc.Utf8.parse(key), {
                    'iv': CryptoJS.enc.Utf8.parse(iv),
                    'mode': CryptoJS.mode.CBC
                }).toString(CryptoJS.enc.Utf8);
                return video;
            };
            eval(html.match(/var config = {[\s\S]*?}/)[0]);
            if (config.url.slice(0, 4) != 'http') {
                config.url = getVideoInfo(config.url);
            }
            if (config.url != "" && config.url.slice(0, 4) != 'http') {
                config.url = decodeURIComponent(config.url);
            }
            return config.url;
        } catch (e) {
            return '';
        }
    },
    DD: function (vipUrl, apiUrl, ref) {
        try {
            if (apiUrl == "" || apiUrl == undefined) { 
                apiUrl = "https://ysgc.tjomet.com/gTko58tsjpjPcRmh.jpg" ;
            }
            var html = request("https://ysgc.tjomet.com/?url="+vipUrl,{timeout:5000});
            eval(html.match(/var config = {[\s\S]*?}/)[0] + '');
            var bod = 'url=' + config.url + "&vkey=" + config.vkey + "&token=" + config.token + "&sign=TzNHJtiW8aWDtUMS";
            var json = JSON.parse(request(apiUrl, { method: 'POST', body: bod }));
            eval(fetch("https://vkceyugu.cdn.bspapp.com/VKCEYUGU-03ee1f89-f0d4-49aa-a2b3-50e203514d8a/2e54cc42-9b4c-457d-b2de-0cdf3e2aeeaa.js"));//https://p.tjomet.com/duoduo/js/decode.js
            let url = getVideoInfo(json.url);
            return url;
        } catch (e) {
            return '';
        }
    },
    DD2: function (vipUrl, apiUrl, ref) {
        try {
            if(/youku|mgtv|ixigua|qq\.com|iqiyi|migu|bilibili|sohu|pptv|\.le\.|\.1905|cctv/.test(url)) {
                return SrcParseS.官网(url);
            } else {
                if (apiUrl == "" || apiUrl == undefined) { apiUrl = "https://bo.dd520.cc/xmplayer/duoduo.php" }
                if (ref == "" || ref == undefined) { ref = "http://www.xawqxh.net" }
                vipUrl = "ahHgRj0kceHdMc66L5y4" + base64Encode(vipUrl).slice(10);
                //var json = JSON.parse(request(apiUrl, { headers: { 'Referer': ref }, method: 'POST', body: 'url=' + vipUrl }));
                var json = JSON.parse(request(apiUrl, { method: 'POST', body: 'url=' + vipUrl }));
                eval(getCryptoJS());
                return CryptoJS.AES.decrypt(json.url, CryptoJS.enc.Utf8.parse(CryptoJS.MD5('rXjWvXl6')), {
                    'iv': CryptoJS.enc.Utf8.parse('NXbHoWJbpsEOin8b'),
                    'mode': CryptoJS.mode.CBC,
                    'padding': CryptoJS.pad.ZeroPadding
                }).toString(CryptoJS.enc.Utf8);
            }
        } catch (e) {
            return '';
        }
    },
    DN: function (vipUrl) {
        evalPrivateJS("OjB3OHrVodkVQlHIU8UUAC5W0ZBgTQEC4h9eUEcAT9kEM0hY/45YOxs7PDeQEnxjVhaWW2tIqO5GQimD4ssHKSka505+O0avEtQQZ9zRy6GxaBZdTHrbCPcoNIajmr3+JG22tRswOJFYDX5aYk0PfUDEFsZa2OjZbz+xTthnoUPLNm0R2g1kBFnWwGKBWUxEhEsFwFruhFSaxJi1E1WZ7WlbP0v4OpoQgn6M7UXGahP9h2fHi8UBVDGfjzIuVuJSCgICLlVGaAbT0ghic+Kfbp3TmjRhAo1DKretYp1U53apDMvO2Q+6oAyO1js5TJwx51ygFSUqVGAu0C2DLxkG0Z3+L8UPZyJa4KVDlqq/goE=")
        return aytmParse(vipUrl);
    },
    聚嗅: function (vipUrl, x5jxlist) {
        var jxhtml = config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJiexi.html';
        fc(jxhtml, 96);
        let libsjxjs = fetch("hiker://files/libs/" + md5(jxhtml) + ".js");
        if (x5jxlist != undefined) {
            if (x5jxlist.length > 0) {
                var a = JSON.parse(libsjxjs.match(/apiArray=(.*?);/)[1]);
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
                libsjxjs = libsjxjs.replace(libsjxjs.match(/apiArray=(.*?);/)[1], JSON.stringify(a))
            }
        }
        let libsjxhtml = "hiker://files/libs/" + md5(jxhtml) + ".html";
        writeFile(libsjxhtml, libsjxjs);
        return this.嗅探(getPath(libsjxhtml) + '?url=' + vipUrl);
    },
    
    APP: function (vipUrl) {
        var appParses = getMyVar('parse_api', '');
        var Uparselist = [];
        Uparselist = appParses.split(',');
        function uniq(array) {
            var temp = []; //一个新的临时数组
            for (var i = 0; i < array.length; i++) {
                if (temp.indexOf(array[i]) == -1) {
                    temp.push(array[i]);
                }
            }
            return temp;
        }
        Uparselist = uniq(Uparselist);//去重
        var x5jxlist = []; //x5嗅探接口存放数组
        var url = "";
        var parseurl = "";
        var urls = [];//多线路地址
        var headers = [];//多线路头信息
        var exclude = /404\.m3u8|xiajia\.mp4|余额不足\.m3u8|\.suoyo|\.ruifenglb|m3u8\.tv/;//设置排除地址
        var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4/;//设置符合条件的正确地址
        if (!exclude.test(vipUrl) && contain.test(vipUrl)) {
            url = vipUrl;
        }
        for (var i = 0; i < Uparselist.length; i++) {
            if (contain.test(url)) { break; }
            if (x5jxlist.length >= 3) { break; }
            let UrlList = [];
            let p = i + 3;
            if (p > Uparselist.length) { p = Uparselist.length }
            for (let s = i; s < p; s++) {
                parseurl = Uparselist[s];
                if (parseurl[0] == '/') { parseurl = 'https:' + parseurl }
                if (parseurl.substring(0, 4) == 'http') {
                    UrlList.push(parseurl);
                }
                i = s;
            }
            if (UrlList.length > 0) {
                let playUrls = UrlList.map((playUrl) => {
                    return {
                        url: playUrl + vipUrl,
                        options: { headers: { 'User-Agent': PC_UA }, timeout: 2000 }
                    }
                });

                let bfhtml = batchFetch(playUrls);
                for (let k in bfhtml) {
                    let gethtml = bfhtml[k];
                    parseurl = UrlList[k];
                    if (gethtml == undefined || gethtml == "" || !/<|{/.test(gethtml)) {
                        //url直链网页打不开
                    } else {
                        try {
                            try {
                                var rurl = JSON.parse(gethtml).url || JSON.parse(gethtml).data;
                            } catch (e) {
                                try {
                                    var rurl = gethtml.match(/urls = "(.*?)"/)[1];
                                } catch (e) {
                                    x5jxlist.push(parseurl);
                                }
                            }
                            if (typeof (rurl) != "undefined" && contain.test(rurl) && !exclude.test(rurl)) {
                                url = rurl;
                                urls.push(this.formatUrl(url, urls.length));
                                headers.push(this.mulheader(url));
                            }
                        } catch (e) { }
                    }
                }//批量结果循环
            }
        }

        if (url == "") {
            if (/youku|mgtv|ixigua|qq\.com|iqiyi|migu|bilibili|sohu|pptv|\.le\.|\.1905|cctv/.test(vipUrl)) {
                if (getMyVar('SrcGJFS', '1') == "2") {
                    return this.DN(vipUrl);
                } else {
                    if (getMyVar('author') == "帅√`人才") {
                        return this.聚嗅(vipUrl);
                    } else {
                        return this.聚嗅(vipUrl, x5jxlist);
                    }
                }
            } else {
                if (getMyVar('author') == "帅√`人才") {
                    return this.智能(vipUrl);
                } else {
                    return this.聚嗅(vipUrl, x5jxlist);
                }
            }
        } else {
            if (urls.length > 1) {
                return JSON.stringify({
                    urls: urls,
                    headers: headers
                });
            } else {
                return this.formatUrl(url);
            }
        }
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
        var mulnum = JYconfig.mulnum||1;
        if(printlog==1){log("影片地址："+vipUrl)}; 
        var exclude = /404\.m3u8|xiajia\.mp4|余额不足\.m3u8|\.m3u8\.tv/;//设置排除地址
        var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts/;//设置符合条件的正确地址
        var needparse = /suoyo\.cc|fen\.laodi|ruifenglb/;//设置需要解析的视频地址

        if(contain.test(vipUrl)&&!exclude.test(vipUrl)&&!needparse.test(vipUrl)){
            if(printlog==1){log("直链视频地址，直接播放")}; 
            if(vipUrl.indexOf('app.grelighting.cn')>-1){vipUrl = vipUrl.replace('app.','ht.')}
            return vipUrl + '#isVideo=true#';
        }else if (vipUrl.indexOf('sa.sogou') != -1) {
            if(printlog==1){log("优看视频，直接明码解析")}; 
            return unescape(fetch(vipUrl).match(/"url":"([^"]*)"/)[1].replace(/\\u/g, "%u"));
        }else if (/magnet|torrent/.test(vipUrl)) {
            if(printlog==1){log("磁力/BT视频地址，由视界解析")}; 
            return vipUrl;
        }else if (/\/share\//.test(vipUrl)) {
            if(printlog==1){log("资源网云播地址")}; 
            return this.嗅探(vipUrl);
        }else{
            var from = "";
            try{
                if(vipUrl.indexOf('-yanaifei.html') != -1){
                    from = 'yanaifei';
                }else if(vipUrl.indexOf('suoyo.cc') != -1){
                    from = 'duoduozy';
                }else if(vipUrl.indexOf('.') != -1){
                    var host = vipUrl.match(/\.(.*?)\//)[1];
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
                    arr.splice(i, 1);
                    break;
                    }
                }
            }
            
            var Uparselist = [];//待进线程执行的解析列表
            var Webparselist = [];//web解析临时存放列表
            var appJXlist= [];//读取本地保存的app自带历史解析列表
            var myJXlist= [];//读取私有解析列表
            var recordfile = "hiker://files/rules/Src/Juying/parse.json";
            var parserecord=fetch(recordfile);
            if(parserecord!=""){
                eval("var recordlist=" + parserecord+ ";");
            }else{
                var recordlist={};
            }
            var excludeurl = recordlist.excludeurl||[];
            var excludeparse = recordlist.excludeparse||[];
            try{
                var recordparse = recordlist.parse[from];
                var recordname = recordlist.name[from]||"***";
                var recordhead = recordlist.head[from]||{};
            }catch(e){
                var recordparse = "";
                var recordname = "***";
                var recordhead = {};
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
                        let arr = {type:'myjx',name:myJXlist[j].name,parse:myJXlist[j].parse};
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
                            if(myJXlist[j].web==1){
                                Webparselist.unshift(arr);
                            }else{
                                Uparselist.unshift(arr);
                            }
                            myjxnum = myjxnum + 1;
                        }else{
                            if(myJXlist[j].stopfrom.indexOf(from)==-1&&excludeparse.indexOf(myJXlist[j].parse)==-1&&!Uparselist.some(item => item.parse ==myJXlist[j].parse)){
                                let sort = myJXlist[j]['sort']||0;
                                arr["sort"] = sort;
                                if(myJXlist[j].web==1){
                                    Webparselist.push(arr);
                                }else{
                                    Uparselist.push(arr);
                                }
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
            var appzdchange = 0;//app自带解析是否加入黑名单

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
                    var taskheader = {withStatusCode:true,timeout:5000};
                    let head = obj.ulist.header||{};
                    if(JSON.stringify(head) != "{}"){
                        taskheader['header'] = head;
                    }
                    var getjson = JSON.parse(request(obj.ulist.parse+obj.vipUrl,taskheader));
                    if (getjson.body&&getjson.statusCode==200){
                        var gethtml = getjson.body;
                        var rurl = "";
                        try {
                            rurl = JSON.parse(gethtml).url||JSON.parse(gethtml).data.url||JSON.parse(gethtml).data;
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
                            }
                        }
                        var x5 = 0;
                        if(rurl == ""){
                            if(!/404 /.test(gethtml)&&obj.ulist.parse.indexOf('key=')==-1){
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

            if(recordparse&&mulnum<=1&&!parseStr&&parsemode==1){
                //优先上次成功的
                playurl = task({ulist:{parse:recordparse, name:recordname, header:recordhead}, vipUrl:vipUrl, testurl:this.testvideourl}).url;
                
                if(contain.test(playurl)&&!exclude.test(playurl)&&excludeurl.indexOf(playurl)==-1){
                    if(printlog==1){log("优先上次解析("+recordname+")成功>"+playurl)}; 
                }else{
                    if(printlog==1){log("优先上次解析("+recordname+")失败，无效视频地址")}; 
                    playurl = "";
                    delete recordlist.parse[from];
                    delete recordlist.name[from];
                    delete recordlist.head[from];
                    writeFile(recordfile, JSON.stringify(recordlist));
                    //失败的从待解列表中去除
                    for(var i=0;i<Uparselist.length;i++){
                        if(Uparselist[i].parse==recordparse){
                            Uparselist.splice(i,1);
                            break;
                        }
                    }
                        
                    for(var j=0;j<appJXlist.length;j++){
                        if(appJXlist[j].parse == recordparse){
                            //判断本地记录的解析是否已存在
                            if(appJXlist[j].from.length>1){
                                if(printlog==1){log('发现失效解析，自动删除解析片源')};
                                removeByValue(appJXlist[j].from,from);
                                appJXchange = 1;
                            }else{
                                if(printlog==1){log('发现失效解析，自动删除解析')};
                                appJXlist.splice(j,1);
                                j = j-1;
                                appJXchange = 1;
                            }
                        }
                    }
                }
            }
            var iscalldn = 0;
            var isrecord = 0;
            if(playurl==""&&!parseStr){
                if(Wparselist.length > 0){
                    Wparselist.sort((a, b) => {
                        return a.sort - b.sort
                    })
                };
                for (let i=0;i<Wparselist.length;i++) {
                    if(x5jxlist.length<5){
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

                    if(isdn==1&&Uparselist.length==0){
                        Uparselist.push({type:'dn',name:'断插'});
                        iscalldn = 1;
                    }
                }
            }
            for (var i=0;i<Uparselist.length;i++) {
                if(contain.test(playurl)){break;}
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
                            if(printlog==1){log(beparses[k].name+'>解析成功>'+beurls[k])};
                            if(isrecord==0){
                                if(printlog==1){log(beparses[k].name+'，记录为片源'+from+'的优先')};
                                recordlist['parse'] = recordlist['parse']||{};
                                recordlist['parse'][from] = parseurl;
                                recordlist['name'] = recordlist['name']||{};
                                recordlist['name'][from] = beparses[k].name;
                                recordlist['head'] = recordlist['head']||{};
                                recordlist['head'][from] = beparses[k].header;
                                recordlist['from']= recordlist['from']||[];
                                if(recordlist['from'].indexOf(from)==-1){recordlist['from'].push(from)}
                                writeFile(recordfile, JSON.stringify(recordlist));
                                isrecord = 1;
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
                                    let MulUrl = this.formatMulUrl(murls[j].replace(/;{.*}/g,""), urls.length);
                                    urls.push(MulUrl.url);
                                    if(mnames.length>0){
                                        names.push(mnames[j]);
                                    }else{
                                        names.push('线路'+urls.length);
                                    }
                                    headers.push(mheaders[j]);
                                }
                                if(urljson.danmu){danmu = urljson.danmu;}
                            } catch (e) {
                                log('判断多线路地址对象有错：'+e.message);
                            }
                        }else{
                            let MulUrl = this.formatMulUrl(beurls[k].replace(/;{.*}/g,""), urls.length);
                            urls.push(MulUrl.url);
                            names.push('线路'+urls.length);
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
                        appzdchange = 1;
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
                //app自带解析是否加入黑名单
                if(appzdchange==1){writeFile(recordfile, JSON.stringify(recordlist));}
                //私有解析失败的统一提示
                if(failparse.length>0&&printlog==1){log(failparse+'<以上私有解析失败，排序-1')}
            } 

            //播放
            if(playurl!=""){
                if(urls.length>1){
                    if(printlog==1){log('解析完成，进入播放2')};
                    return JSON.stringify({
                        urls: urls,
                        names: names,
                        headers: headers,
                        danmu: danmu
                    }); 
                }else{
                    if(printlog==1){log('解析完成，进入播放1')};
                    return this.formatUrl(playurl);
                }
            }else{
                if(parsemode==1&&printlog==1){
                    log('明码解析失败，转嗅探备用解析');
                    log('进入嗅探解析列表：' + x5namelist)
                }
                if(parseStr){
                    if(x5jxlist.length>0){
                        return this.嗅探(parseStr.parse+vipUrl);
                    }else{
                        return "toast://解析失败";
                    }
                }else{
                    return this.聚嗅(vipUrl, x5jxlist);
                }
            }
        }
    },
    //处理多线路播放地址
    formatMulUrl: function (url,i) {
        try {
            let header = this.mulheader(url);
            if ((getMyVar('SrcM3U8', '1') == "1"||url.indexOf('vkey=')>-1)&&url.indexOf('.m3u8')>-1) {
                var name = 'video'+parseInt(i)+'.m3u8';
                url = cacheM3u8(url, {headers: header, timeout: 2000}, name)+'#pre#';
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
            if(/vkey=/.test(url)){
                return 1;
            }else if (/\.m3u8/.test(url)) {
                var urlcode = JSON.parse(fetch(url,{withStatusCode:true,timeout:2000}));
                //log(name+'url访问状态码：'+urlcode.statusCode)
                if(urlcode.statusCode==-1){
                    log(name+'>m3u8探测超时未拦载，结果未知')
                    return 1;
                }else if(urlcode.statusCode!=200){
                    log(name+'>m3u8播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    try{
                        var tstime = urlcode.body.match(/#EXT-X-TARGETDURATION:(.*?)\n/)[1];
                        var urltss = urlcode.body.replace(/#.*?\n/g,'').replace('#EXT-X-ENDLIST','').split('\n');
                    }catch(e){
                        log(name+'>√错误：探测异常未拦截>'+e.message)
                        return 1;
                    }
                    if(parseInt(tstime)*parseInt(urltss.length) < times){
                        log(name+'>m3u8视频长度小于设置的'+times+'s，疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }else{
                        var urlts = urltss[0];
                        if(!/^http/.test(urlts)){
                            let http = urlcode.url.match(/http.*\//)[0];
                            urlts = http + urlts;
                        }    
                        var tscode = JSON.parse(fetch(urlts,{headers:{'Referer':url},onlyHeaders:true,timeout:2000}));
                        //log(name+'ts访问状态码：'+tscode.statusCode)
                        if(tscode.statusCode==-1){
                            log(name+'>ts段探测超时未拦载，结果未知')
                            return 1;
                        }else if(tscode.statusCode!=200){
                            log(name+'>ts段地址疑似失效或网络无法访问，不信去验证一下>'+url);
                            return 0;
                        }
                    }
                }
            }else if (/\.mp4/.test(url)) {
                var urlheader = JSON.parse(fetch(url,{onlyHeaders:true,timeout:2000}));
                if(urlheader.statusCode==-1){
                    log(name+'>mp4探测超时未拦载，结果未知')
                    return 1;
                }else if(urlheader.statusCode!=200){
                    log(name+'>mp4播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    var filelength = urlheader.headers['content-length'];
                    if(parseInt(filelength[0])/1024/1024 < 80){
                        log(name+'>mp4播放地址疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }
                }
            }
            return 1;
        } catch(e) {
            log(name+'>错误：探测异常未拦截，可能是失败的>'+e.message)
            return 1;
        }
    }
    
}
