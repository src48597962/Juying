//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
let recordfile = "hiker://files/rules/Src/Juying2/parse.json";//取解析设置、上次成功、手工屏蔽的
let record = fetch(recordfile);
let parseRecord = {};
if(record!=""){
    try{
        eval("parseRecord =" + record + ";");
    }catch(e){
        parseRecord = {};
    }
}

let excludeurl = parseRecord.excludeurl||[];//屏蔽的播放地址
let excludeparse = parseRecord.excludeparse||[];//屏蔽的解析
let lastparse = parseRecord.lastparse?(parseRecord.lastparse[from] || ""):"";//对应的片源上次解析
let jxconfig = {printlog: parseRecord['printlog']||0, cachem3u8: parseRecord['cachem3u8']||1, parsemode: parseRecord['parsemode']||1, xiutannh: parseRecord['xiutannh']||'web', mulnum: 2};
if(!jxconfig.printlog){
    log = function (msg) {
        //未开启打印解析日志>不打印
    }
}
let exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8/;//设置排除地址
let contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts\?|TG@UosVod|video\/tos\/cn\/tos|m3u8\?pt=m3u8/;//设置符合条件的正确地址
let needparse = /suoyo\.cc|fen\.laodi|ruifenglb/;//设置需要解析的视频地址

//数组去重
function uniq(array) {
    var temp = []; //一个新的临时数组
    for (var i = 0; i < array.length; i++) {
        if (temp.indexOf(array[i]) == -1) {
            temp.push(array[i]);
        }
    }
    return temp;
}
//去除指定数组元素
function removeByValue(arr, val) {
    for(var i = 0; i < arr.length; i++) {
        if(arr[i] == val) {
        arr.splice(i,1);
        break;
        }
    }
}

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
            var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8|\.css|\.js|\.gif|\.png|\.jpg|\.jpeg|html,http|m3u88.com\/admin|\.php\?v=h|\?url=h|\?vid=h|%253Furl%253Dh|#amp=1|\.t-ui\.cn/;//设置排除地址
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
                            if (getMyVar('SrcM3U8', '1') == "1"&&url.indexOf('.m3u8')>-1) {
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
    聚嗅: function (vipUrl, jxlist, excludeurl) {
        var jxhtml = config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJiexi.html';
        fc(jxhtml, 96);
        let libsjxjs = fetch("hiker://files/libs/" + md5(jxhtml) + ".js");
        if (jxlist != undefined) {
            if (jxlist.length > 0) {
                var a = JSON.parse(libsjxjs.match(/apiArray=(.*?);/)[1]);
                /*
                for (var i = 0; i < jxlist.length; i++) {
                    a.push(jxlist[i]);
                }
                a = uniq(a);//去重
                */
                a = jxlist;
                libsjxjs = libsjxjs.replace(libsjxjs.match(/apiArray=(.*?);/)[1], JSON.stringify(a))
            }
        }
        let libsjxhtml = "hiker://files/libs/" + md5(jxhtml) + ".html";
        writeFile(libsjxhtml, libsjxjs);
        return this.嗅探(getPath(libsjxhtml) + '?url=' + vipUrl, excludeurl);
    },
    聚影: function (vipUrl, dataObj) {
        //聚影采用新的、独立的解析逻辑
        parseRecord['from'] = parseRecord['from']||[];
        if(parseRecord['from'].indexOf(from)==-1){parseRecord['from'].push(from)}//记录到片源标识组
        
        let isVip = 0;
        log("影片地址："+vipUrl); 
        if (/magnet|torrent/.test(vipUrl)) {
            log("磁力/BT视频地址，由海阔解析"); 
            return vipUrl;
        }else if(contain.test(vipUrl)&&!exclude.test(vipUrl)&&!needparse.test(vipUrl)){
            log("直链视频地址，直接播放"); 
            if(vipUrl.indexOf('app.grelighting.cn')>-1){vipUrl = vipUrl.replace('app.','ht.')}
            return vipUrl + '#isVideo=true#';
        }else if (vipUrl.indexOf('sa.sogou') != -1) {
            log("优看视频，直接明码解析"); 
            return unescape(request(vipUrl).match(/"url":"([^"]*)"/)[1].replace(/\\u/g, "%u"));
        }else if (/\/share\//.test(vipUrl)) {
            log("cms资源网云播地址，嗅探播放"); 
            return this.嗅探(vipUrl);
        }else if (/douyin\.com/.test(vipUrl)) {
            log("抖音视频，偿试嗅探"); 
            return this.嗅探(vipUrl);
        }else if(!needparse.test(vipUrl)){
            log("网页嗅探播放"); 
            return this.嗅探(vipUrl);
        }
        if(vipUrl.match(/youku|iqiyi|ixigua|migu|sohu|pptv|le\.|cctv|1905|mgtv|qq\.com/)){
            if(vipUrl.indexOf('html?')>-1){
                vipUrl = vipUrl.split('html?')[0]+'html';
            }
            isVip = 1;
        }

        dataObj = dataObj || {};
        let from;
        if(dataObj.flag){
            from = dataObj.flag;
        }else{
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
                    from = 'other';
                }
            }catch(e){
                from = 'other';
            }
        }
        log("片源标识："+from+"，需要解析"); 

        let parsemode = jxconfig.parsemode || 1;//解析模式
        let mulnum = jxconfig.mulnum || 1;//多线程数
        let jxfile = "hiker://files/rules/Src/Juying2/jiexi.json";//解析存放文件
        let parselist = [];//待进线程执行的解析列表
        let jxList= [];//读取解析列表

        if(dataObj.parse){
            //指定解析用于测试
            parselist.push(dataObj.parse);
        }else{
            if(parsemode==1){
                //读取app自带的解析，将未屏蔽的入备选
                let appParses = dataObj.parse_api || [];
                appParses = uniq(appParses);//去重
                if(appParses.length>0){
                    for (let i in appParses) {
                        if(excludeparse.indexOf(appParses[i])==-1){
                            parselist.push({stype:'app',type:1,name:'app'+i,url:appParses[i],sort:0});
                        }
                    }
                    log("接口自带的解析数："+appParses.length); 
                }
            }
            
            //读取解析，将可用加入备选
            if(fetch(jxfile)){
                try{
                    eval("jxList=" + fetch(jxfile)+ ";");
                }catch(e){}
                jxList = jxList.filter(v => !v.stop);
                for(let j=0;j<jxList.length;j++){
                    jxList[j].ext = jxList[j].ext||{};
                    let flag = jxList[j].ext.flag || [];
                    if(flag.length==0 || flag.indexOf(from)>-1){
                        parselist.push(jxList[j]);
                    }
                }
                log("可用解析数：" + jxList.length); 
            }
        }
        //log(parselist)

        var playurl = "";//视频地址
        var urls = [];//多线路地址
        var names = [];//多线路名称
        var headers = [];//多线路头信息
        var danmu = "";//多线路弹幕
        var dellist = [];//需从本地解析中删除列表
        var myJXchange = 0;//私有解析是否有变化需要保存
        var x5jxlist = [];
        var x5namelist = [];

    
        //解析线程代码
        var task = this.解析;

        //修正排序
        parselist.sort((a, b) => {
            return a.sort - b.sort
        })
        if(lastparse){
            //优先上次成功的
            for(let i=0; i<parselist.length; i++) {
                if(parselist[i].name==lastparse) {
                    let Uparseobj = parselist[i];
                    parselist.splice(i,1);
                    parselist.unshift(Uparseobj);
                    break;
                }
            }
        }
        
        for (var i=0;i<parselist.length;i++) {
            if(playurl!=""){break;}
            let UrlList = [];
            let Namelist = [];
            var beurls = [];//用于存储多线程返回url
            var beparses = [];//用于存储多线程解析地址
            var beerrors = [];//用于存储多线程是否有错误
            var sccess = 0;//计算成功的结果数
            let p = i + mulnum + 2;
            if(p>parselist.length){p=parselist.length}
            for(let s=i;s<p;s++){
                UrlList.push(parselist[s]);
                Namelist.push(parselist[s].name);
                i=s;
            }
            log("本轮排队解析："+Namelist);

            let Urlparses = UrlList.map((list)=>{

                    if (/^\/\//.test(list.parse)) { list.parse = 'https:' + list.parse }
                    return {
                        func: task,
                        param: {
                            ulist: list,
                            vipUrl: vipUrl,
                            testurl: this.testvideourl,
                            parsemode: 1
                        },
                        id: list.parse
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
                            log("线程中止，已捕获视频");
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
                        log(beparses[k].name+'>测试成功>'+beurls[k]);
                    }else{
                        //记录除断插线程以外最快的，做为下次优先
                        if(beparses[k].name==lastparse){
                            log(beparses[k].name+'>优先上次解析成功>'+beurls[k]);
                        }else{
                            log(beparses[k].name+'>解析成功>'+beurls[k]+'，记录为片源'+from+'的优先');
                            lastparse = beparses[k].name;
                        }

                        //私有解析成功的，提升一下排序
                        for(var j=0;j<jxList.length;j++){
                            if(parseurl==jxList[j].parse){
                                //解析成功的,排序+1
                                jxList[j]['sort'] = jxList[j]['sort']||0;
                                if(jxList[j].sort>0){
                                    jxList[j].sort = jxList[j].sort - 1;
                                    myJXchange = 1;
                                }
                                break;
                            }
                        }
                        
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
                                if(!/yue|480/.test(mnames[j])){//屏蔽全全-优酷的不必要线路
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
                for(var j=0;j<jxList.length;j++){
                    if(dellist[p].parse==jxList[j].parse){
                        if(dellist[p].x5==1){
                            jxList[j]['type'] = 0;
                        }
                        jxList[j]['sort'] = jxList[j]['sort']||0;
                        jxList[j].sort = jxList[j].sort + 1;
                        /*
                        //解析失败的,且排序大于5次从私有中排除片源
                        failparse.push(jxList[j].name);//加入提示失败列表，仅提示
                        if(jxList[j].sort>5 && jxList[j].stopfrom.indexOf(from)==-1){
                            jxList[j].stopfrom[jxList[j].stopfrom.length] = from;
                            log(jxList[j].name+'>解析失败大于5次，排除片源'+from);
                        }
                        */
                        myJXchange = 1;
                        break;
                    }
                }
            }

            

        }
        
        if(!dataObj.parse){
            //私有解析有排除片源
            if(myJXchange == 1){writeFile(jxfile, JSON.stringify(jxList));}
            //私有解析失败的统一提示
            if(failparse.length>0&&printlog==1){log(failparse+'<以上私有解析失败，排序-1')}
            //记录上次优先解析和自带解析有加入黑名单的保存                
            parseRecord['lastparse'] = parseRecord['lastparse']||{};
            parseRecord['lastparse'][from] = lastparse;
            writeFile(recordfile, JSON.stringify(parseRecord));
        } 

        //dm盒子弹幕
        let dm = "";
        if(getItem('dmRoute', '0')=="1" && isVip){
            try{
                dm = $.require('hiker://page/dmFun?rule=dm盒子').dmRoute(vipUrl);
            }catch(e){}
        }

        //播放
        if(playurl){
            if(urls.length>1){
                log('解析完成，进入播放2');
                return JSON.stringify({
                    urls: urls,
                    names: names,
                    headers: headers,
                    danmu: danmu || dm 
                }); 
            }else{
                log('解析完成，进入播放1');
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
            if(dataObj.parse){
                if(x5jxlist.length>0){
                    return this.嗅探(dataObj.parse.url+vipUrl,excludeurl);
                }else{
                    return "toast://解析失败";
                }
            }else{
                if(x5namelist.length>0){
                    log('进入嗅探解析列表：' + x5namelist)
                }
                
                if(JYconfig.superweb==1&x5jxlist.length>0){
                    log('开启播放器超级嗅探模式');
                    let weburls = x5jxlist.map(item => "video://" + item +vipUrl);
                    return JSON.stringify({
                        urls: weburls,
                        names: x5namelist,
                        danmu: dm
                    }); 
                }else if(x5jxlist.length>0){
                    return this.聚嗅(vipUrl, x5jxlist,excludeurl);
                }else{
                    log('没有解析，跳转原网页');
                    return vipUrl;
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
            log("√错误："+e.message);
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
    },
    解析: function(obj,webUrl) {
        function geturl(gethtml) {
            let rurl = "";
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
                    log('将日志提交给作者，帮助完善解析逻辑>>>'+gethtml);
                }
            } catch (e) {
                log('明码获取错误：'+e.message);
            }
            //let rurl = JSON.parse(html).url || JSON.parse(html).data;
            return rurl;
        }
        function exeWebRule(exewebUrl) {
            return executeWebRule(exewebUrl, $.toString(() => {
                    try{
                        if (typeof (request) == 'undefined' || !request) {
                            eval(fba.getInternalJs());
                        };
                        var urls = _getUrls();
                        //fba.log(fy_bridge_app.getUrls());
                        var exclude = /\/404\.m3u8|\/xiajia\.mp4|\/余额不足\.m3u8|\.css|\.js|\.gif|\.png|\.jpg|\.jpeg|html,http|m3u88.com\/admin|\.php\?v=h|\?url=h|\?vid=h|%253Furl%253Dh|#amp=1|\.t-ui\.cn|ac=dm/;//设置排除地址
                        var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4|\.ts\?|TG@UosVod|video\/tos\/cn\/tos|m3u8\?pt=m3u8/;//设置符合条件的正确地址
                        for (var i in urls) {
                            if (contain.test(urls[i])&&!exclude.test(urls[i])) {
                                //fba.log("exeweb解析到>"+urls[i]);
                                return urls[i];
                            }
                        }
                    }catch(e){
                        //fba.log(e.message);
                    }
                }), {
                    blockRules: ['.m4a','.mp3','.gif','.jpg','.jpeg','.png','.ico','hm.baidu.com','/ads/*.js','/klad/*.php','layer.css'],
                    jsLoadingInject: true,
                    checkTime: 100,
                    timeout: 8000
                }
            )
        }
        if(webUrl){
            let rurl = "";
            let gethtml = request(webUrl, {timeout:3000});
            try{
                if (/player_.*?=/.test(gethtml)) {
                    let  html = JSON.parse(gethtml.match(/r player_.*?=(.*?)</)[1]);
                    rurl = html.url;
                    if (html.encrypt == '1') {
                        rurl = unescape(rurl);
                    } else if (html.encrypt == '2') {
                        rurl = unescape(base64Decode(rurl));
                    }
                    if (!/\.m3u8|\.mp4|\.flv/.test(rurl)) {
                        rurl = "";
                    }
                }
                if(!rurl && /\.m3u8|\.mp4|\.flv/.test(gethtml) && geturl(gethtml)){
                    rurl = geturl(gethtml);
                }
            }catch(e){
            }
            if(rurl){
                return rurl;
            }else{
                if(getMyVar('superweb')=="1"){// && getMyVar('pushboxplay')!="1"){
                    return 'video://'+webUrl;
                }else{
                    if((MY_NAME=="海阔视界"&&getAppVersion()>=4094)||(MY_NAME=="嗅觉浏览器"&&getAppVersion()>=1359)){
                        return exeWebRule(webUrl) || "";
                    }else{
                        return this.嗅探(webUrl,[],1);
                    }
                }
            }
        }else if(/^function/.test(obj.ulist.parse.trim())){
            obj.ulist['x5'] = 0;
            let rurl = "";
            try{
                eval('var JSparse = '+obj.ulist.parse)
                rurl = JSparse(obj.vipUrl);
            }catch(e){
                //log("解析有错误"+e.message)
            }
            if(/^toast/.test(rurl)){
                log(obj.ulist.name+'>提示：'+rurl.replace('toast://',''));
                rurl = "";
            }else if(obj.parsemode==1 && /^http/.test(rurl) && obj.testurl(rurl,obj.ulist.name)==0){
                rurl = "";
            }
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
                log(obj.ulist.name+'>解析地址访问失败');
            }
            //log(getjson);
            if (getjson.body&&getjson.statusCode==200){
                //log("0");
                var gethtml = getjson.body;
                var rurl = "";
                var isjson = 0;
                try {
                    let json =JSON.parse(gethtml);
                    isjson = 1;
                    rurl = json.url||json.data.url||json.data;
                } catch (e) {
                    if(/\.m3u8|\.mp4/.test(getjson.url)&&getjson.url.indexOf('=http')==-1){
                        rurl = getjson.url;
                    }else if(/\.m3u8|\.mp4|\.flv/.test(gethtml) && geturl(gethtml)){
                        rurl = geturl(gethtml);
                    }else if((MY_NAME=="海阔视界"&&getAppVersion()>=4094)||(MY_NAME=="嗅觉浏览器"&&getAppVersion()>=1359)){
                        rurl = exeWebRule(obj.ulist.parse+obj.vipUrl) || "";
                    }
                }
                var x5 = 0;
                if(obj.parsemode==1){//智能解析模式下
                    if(!rurl){
                        if(!/404 /.test(gethtml)&&obj.ulist.parse.indexOf('key=')==-1&&isjson==0){
                            if(x5jxlist.length<5){
                                x5jxlist.push(obj.ulist.parse);
                                log(obj.ulist.name + '>加入x5嗅探列表');
                                x5namelist.push(obj.ulist.name);
                            }
                            x5 = 1;
                        }
                    }else{
                        if(obj.testurl(rurl,obj.ulist.name)==0){
                            rurl = "";
                        }
                    }
                }
                obj.ulist['x5'] = x5;
                return {url: rurl,ulist: obj.ulist}; 
            }else{
                obj.ulist['x5'] = 0;
                return {url: "",ulist: obj.ulist}; 
            }
        }
    }
}

