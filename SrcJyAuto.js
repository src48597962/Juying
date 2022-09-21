//============自动挡处理逻辑、仅用于个人学习使用============
//========感谢@断念大佬========

var stauts = 1;//开关
//载入断插主控js
try{
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }
    var parseRoute = JYconfig.dnfile?JYconfig.dnfile:'hiker://files/rules/DuanNian/MyParse.json';
}catch(e){
    stauts = 0;
    log('√聚影配置文件加载失败');
}
try{    
    var MyParseS = {};
    var mySet = {};
    if (/^http/.test(parseRoute)) {
        eval('var parseFile =' + fetchCache(parseRoute, 24));
    }else if (fileExist(parseRoute)) {
        eval('var parseFile =' + fetch(parseRoute));
    }
    MyParseS = parseFile.codes;
    mySet = parseFile.settings;
}catch(e){
    stauts = 0;
    log('√断插解析文件加载失败');
}

var tools = {
    MD5: function(data) {
        eval(getCryptoJS());
        return CryptoJS.MD5(data).toString(CryptoJS.enc.Hex);
    },
    AES: function(text, key, iv, isEncrypt) {
        eval(getCryptoJS());
        var key = CryptoJS.enc.Utf8.parse(key);
        var iv = CryptoJS.enc.Utf8.parse(iv);
        if (isEncrypt) {
            return CryptoJS.AES.encrypt(text, key, {
                iv: iv,
                mode: CryptoJS.mode.CBC,
                padding: CryptoJS.pad.Pkcs7
            }).toString();
        };
        return CryptoJS.AES.decrypt(text, key, {
            iv: iv,
            padding: CryptoJS.pad.Pkcs7
        }).toString(CryptoJS.enc.Utf8);
    },
    //ascii
    nextCharacter: function(asciiValue, k) {
        var s = asciiValue;
        return String.fromCharCode(s + k);
    },
    //凯撒
    caesarCipher: function(stringValue, k) {
        var newString = "";
        for (var i = 0; i < stringValue.length; i++) {
            newString += this.nextCharacter(stringValue[i].charCodeAt(), k);
        }
        return newString;
    }
};

var ParseS = {};
var originalParseS = {
    maoss: function(jxurl, ref, key) {
        try {
            var getVideoInfo = function(text) {
                return tools.AES(text, key, iv);
            };
            key = key == undefined ? 'dvyYRQlnPRCMdQSe' : key;
            if (ref) {
                var html = request(jxurl, {
                    headers: {
                        'Referer': ref
                    }
                });
            } else {
                var html = request(jxurl);
            }
            if (html.indexOf('&btwaf=') != -1) {
                html = request(jxurl + '&btwaf' + html.match(/&btwaf(.*?)"/)[1], {
                    headers: {
                        'Referer': ref
                    }
                })
            }
            var iv = html.split('_token = "')[1].split('"')[0];
            eval(html.match(/var config = {[\s\S]*?}/)[0] + '');
            if (config.url.slice(0, 4) != 'http') {
                config.url = decodeURIComponent(tools.AES(config.url, key, iv));
            }
            return config.url;
        } catch (e) {
            return '';
        }
    }
};
Object.assign(ParseS, originalParseS, MyParseS);
//覆盖顺序，第三个覆盖第二个然后覆盖第一个

//------参数设置------
var defaultconfig = {
    "printlog": 1,//是否开启打印日志：0关闭/1开启
    "x5timeout": 5,//设置X5嗅探解析超时时间：秒
    "autoselect": 1,//是否开启智能优选解析接口：0关闭/1开启
    "failcount": 3,//设置失败几次的片源剔除解析
    "fromcount": 12,//当开启自动选择解析时，失败片源达多少个，提示删除
    "multiline": 2,//设置解析多线程数
    "testcheck": 0,//进入测试检测模式：0关闭/1开启
    "disorder": 0,//是否开启乱序模式
    "parsereserve": 1,//是否强制保留用户配置的解析口
    "jstoweb": 0,//是否允许js解析中跳转x5或web
    "cachem3u8": 1,//m3u8是否使用缓存方式播放
    "iscustom": 0,//是否开启远程关怀模式，自定义解析设置开关：0关闭/1开启
    "remotepath": ""//远程在线文件地址
}
//聚影使用时默认值
var SAconfig = defaultconfig;
SAconfig.printlog = JYconfig.printlog;

var sortlist = []; //排序降权临时存放数组
var sortfile = "hiker://files/rules/Src/Auto/SrcSort.json";
if (!fileExist(sortfile)&&fileExist('hiker://files/cache/SrcSort.json')) {
    try{
        eval("var oldsort=" + fetch('hiker://files/cache/SrcSort.json'));
        writeFile(sortfile, JSON.stringify(oldsort));
    }catch(e){}
}
if (fileExist(sortfile)){
    eval("var newsort=" + fetch(sortfile));
    Object.assign(sortlist, newsort);
}

//自动解析入口
var aytmParse = function (vipUrl,parseStr) {
    if(stauts==0){return "";}
    if(SAconfig.printlog==1){
        log("√断插解析开始");
    };
    var str = "";
    var from = "";
    try {
        var host = vipUrl.match(/\.(.*?)\//)[1];
        from = host.split('.')[0];
    } catch (e) {
        from = "切片源";
    }
    if (from!=""&&from!="切片源"){
        //其他网址域名格式的地址
        switch (mySet.qju) {
            case "默认":
            case "智能优选":
            case "":
                switch (host) {
                    case "qq.com":
                        str = mySet.tx;
                        break;
                    case "iqiyi.com":
                        str = mySet.qy;
                        break;
                    case "youku.com":
                        str = mySet.yk;
                        break;
                    case "mgtv.com":
                        str = mySet.mg;
                        break;
                    case "bilibili.com":
                        str = mySet.bl;
                        break;
                    case "le.com":
                        str = mySet.le;
                        break;
                    case "sohu.com":
                        str = mySet.sh;
                        break;
                    case "pptv.com":
                        str = mySet.pp;
                        break;
                    case "ixigua.com":
                        str = mySet.xg;
                        break;
                    case "miguvideo.com":
                        str = mySet.mi;
                        break;
                    case "1905.com":
                        str = mySet.one;
                        break;
                    case "fun.tv":
                        str = mySet.fun;
                        break;
                    default:
                        str = mySet.oth;
                        break;
                }
                break;
            default:
                str = mySet.qju;
                break;
        }
    }
    if (str == undefined || str == "") {if(mySet.qju==""||mySet.qju=="默认"){str = mySet.oth;}else{if(mySet.qju!="智能优选"){str = mySet.qju;}}}
    var strlist = [];//解析口载入临时数组
    var prior = [];//处理用户手工配置项的临时数组
    if (parseStr != undefined && parseStr != "") {
        strlist = parseStr.split(/,|，/); //字符分割
    }else{
        //自动列出所有接口
        var excludeParse = ['defaultParse', 'maoss', 'CityIP', 'cacheM3u8', 'pcUA', 'parseLc', 'gparse', 'nparse', '道长仓库通免', 'defaultParseWeb', '智能优选', '默认'];
        if(mySet.qju=="智能优选"){SAconfig.autoselect=1}
        if(SAconfig.autoselect==1){
             //全局排除的追加到排除列表
            for(var j=0;j<sortlist.length;j++){
                try{
                    if(sortlist[j].Globalexclude==1){ 
                        excludeParse.push(sortlist[j].name);
                    }
                }catch(e){}
            } 

            if(str&&str!="默认"){
                //如开启了智能优先时，优先取单项指定解析
                prior = str.split(/,|，/); //字符分割
                for (var i in prior) {
                    if(excludeParse.indexOf(prior[i]) == -1){
                        //配置项接口未被排除，优先加入候选列表
                        strlist.push(prior[i]);
                    }
                }
            }
            var parsetmplist = [];//用于取配置文件的解析口临时数组
            if(SAconfig.iscustom==1){
                //远程关怀模式只取在线解析接口
                for( var key in ParseZ ){
                    if(excludeParse.indexOf(key)==-1 && prior.indexOf(key)==-1){
                        parsetmplist.push(key);
                    }
                }
            }else{
                //取本地配置文件中非隐藏解析接口
                for(var i = 0; i < parseFile.title.length; i++){
                    if(excludeParse.indexOf(parseFile.title[i])==-1 && prior.indexOf(parseFile.title[i])==-1){
                        parsetmplist.push(parseFile.title[i]);
                    }
                }
            }
            if(SAconfig.disorder==1){
                //乱序模式
                function randArr (arr) {
                    return arr.sort(() => {
                        return (Math.random() - 0.5);
                    });
                }
                randArr(parsetmplist);
            }
            strlist = strlist.concat(parsetmplist);
            parsetmplist=[];//清空临时
        }else{
            //关闭智能优选时
            if(str!=""&&str!="默认"){
                prior = str.split(/,|，/); //字符分割
                for (var i in prior) {
                    if(excludeParse.indexOf(prior[i]) == -1){
                        //配置项接口未被排除，加入候选列表
                        strlist.push(prior[i]);
                    }
                }
            }
        }
    }

    if (strlist.length==0) {
        hideLoading();
        if(SAconfig.printlog==1){
            log("√断插没有配置解析接口，解个寂寞吗");
        };
        return '';
    }
    
    
    //定义排序函数
    function sortData(a, b) {
        if(a.sort!=b.sort){
            return a.sort - b.sort
        }else{
            return a.id - b.id;
        }
    };
    //将选择的解析接口，带上类型、排序
    var parsename = "";
    var parseurl = "";
    var parselx = "";
    var parselist = [];
    var Jparsenum = 0;
    var Uparsenum = 0;
    var dellist = [];
    var faillist = [];
    var issort = 0;
    for (var i in strlist) {
        if(strlist[i].includes("http")){
            parsename = strlist[i];
            parseurl = strlist[i];
            parselx = "U";
        }else{
            if(typeof ParseS[strlist[i]] == 'string'){
                parsename = strlist[i];
                parseurl = ParseS[strlist[i]];
                parselx = "U";
            }else if(typeof ParseS[strlist[i]] == 'function'){
                parsename = strlist[i];
                parseurl = "0";
                parselx = "J";    
            }else{
                dellist.push(strlist[i]);
            }
        } 
        let sort = -2;
        let stopfrom = [];
        for(var j=0;j<sortlist.length;j++){
            if(sortlist[j].name == parsename){ 
                sort = sortlist[j].sort;
                if(sortlist[j].stopfrom == undefined){
                    sortlist[j].stopfrom = [];
                }else{
                    if(sortlist[j].stopfrom.length > 0){ Object.assign(stopfrom, sortlist[j].stopfrom); };
                }
                if(SAconfig.autoselect==1&&prior.includes(parsename)==true&&SAconfig.parsereserve==1){
                    //开启了强制优先并保留用户配置的解析
                    sort = 0;
                    stopfrom = [];
                }
                break;
            }
        } 
        //新的接口，加入到排序数组
        if(sort==-2){
            sort = 0;
            let arr  = { "sort" : sort, "name" : parsename, "stopfrom" : [] };
            if(parsename!=""){
                sortlist.push(arr);
                issort = 1;
            }
        }

        if(parsename==""||parseurl==""){
            //无效的解析，直接加入提示删除数组
            if(dellist.indexOf(strlist[i])==-1){dellist.push(strlist[i])};
        }else{
            //解析接口存在
            if(SAconfig.autoselect==1){
                if(stopfrom.indexOf(from)==-1){
                    //自动筛选模式时，sort只做排序使用，不包含停用片源的解析，则加入解析接口组
                    if(parselx=="J"){
                        let arr  = { "id": i,"sort": sort, "name": parsename, "lx": parselx };
                        parselist.push(arr); 
                        Jparsenum ++;
                    }
                    if(parselx=="U"){
                        let arr  = { "id": i,"sort": sort, "name": parsename, "url": parseurl, "lx": parselx };
                        parselist.push(arr); 
                        Uparsenum ++;
                    }
                }else{
                    if(stopfrom.length>=SAconfig.fromcount&&stopfrom.indexOf(from)>-1){
                        //此解析接口大于多少片源失败，且已排除片源，加入提示删除数组
                        dellist.push(strlist[i]);
                    }
                }
            }else{
                if(sort>=SAconfig.failcount&&stopfrom.indexOf(from)>-1){
                    //此接口已失败大于设置的次数，且已排除片源，加入提示删除数组
                    dellist.push(strlist[i]);
                }else{
                    //非自动筛选解析时按失败次数，小于设置的次数、且解析接口名有效，加入解析接口组
                    if(parselx=="J"){
                        let arr  = { "id": i,"sort": sort, "name": parsename, "lx": parselx };
                        parselist.push(arr); 
                        Jparsenum ++;
                    }
                    if(parselx=="U"){
                        let arr  = { "id": i,"sort": sort, "name": parsename, "url": parseurl, "lx": parselx };
                        parselist.push(arr); 
                        Uparsenum ++;
                    }
                }
            }
        }
    }
    if(dellist.length > 0){
        SAconfig['dellist'] = dellist;
        writeFile("hiker://files/rules/Src/Auto/config.json", JSON.stringify(SAconfig))
        if(SAconfig.printlog == 1){log("√建议删除断插解析:"+dellist);}
    }
    if(parselist.length == 0){
        if(SAconfig.printlog==1){log("√断插没有可用的解析接口，需重新配置")};
        hideLoading();
        return '';
    }else{
        //解析接口排序，将之前失败的排在后面 
        parselist.sort(sortData)
    }
    if(SAconfig.printlog==1){
        log("√断插有效解析数："+parselist.length+"  (J解析:"+Jparsenum+",U解析:"+Uparsenum+")");
    };

    var exclude = /404\.m3u8|xiajia\.mp4|余额不足\.m3u8/;//设置排除地址
    var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4/;//设置符合条件的正确地址
    var playurl = "";
    var urls = [];//用于多线路地址
    var names = [];//用于多线路名称
    var headers = [];//用于多线路头信息
    var danmu = "";//多线路弹幕
    var ismulti = SAconfig.ismulti||0;//是否开启多线程
    var multiline = SAconfig.multiline||1;//多线程数量
    var adminuser = SAconfig.adminuser||0;

    if(ismulti==0&&adminuser==0){multiline=2}else{if(multiline>5){multiline=5}}
    if(SAconfig.testcheck==1){multiline=10}

    //明码解析线程代码
    var parsetask = function(obj) {
        let rurl = "";
        let x5 = 0;
        if(obj.lx=="J"){
            try {
                rurl = ParseS[obj.name](vipUrl);
            } catch (e) {
                //if(printlog==1){log('√明码获取错误：'+e.message)};
            }
        }else if(obj.lx=="U"){
            let taskheader = {withStatusCode:true,timeout:3000};
            let getjson = JSON.parse(request(obj.url+vipUrl,taskheader));
            if (getjson.body&&getjson.statusCode==200){
                let gethtml = getjson.body;
                try {
                    rurl = JSON.parse(gethtml).url||JSON.parse(gethtml).data.url||JSON.parse(gethtml).data;
                } catch (e) {
                    if(contain.test(getjson.url)&&getjson.url.indexOf('=http')==-1){
                        rurl = getjson.url;
                    }else if(contain.test(gethtml)){
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
                            //if(printlog==1){log('√明码获取错误：'+e.message)};
                        }
                    }
                }
                
                if(rurl == ""){
                    if(!/404 /.test(gethtml)){
                        if(obj.url.indexOf('key=')==-1){
                            x5 = 1;//网页可以正常访问，偿试嗅探
                        }else{
                            x5 = 2; //网页404，标记剔除
                        }
                    }
                }
            }else{
                x5 = 2;//网页无法访问，标记剔除
            }
            obj['x5'] = x5;
        }
        if(rurl){   
            if(/^toast/.test(rurl)){
                if(SAconfig.printlog==1){log(obj.name+'>提示：'+rurl.replace('toast://',''))};
                rurl = "";
            }else if(/^http/.test(rurl)&&SrcParseS.testvideourl(rurl,obj.name)==0){
                //检测地址有效性
                rurl = "";
            }
        }
        obj['rurl'] = rurl;
        return obj;
    };
    //清理sort排序文件线程代码
    var sorttask = function(obj) {
        for(var j=0;j<sortlist.length;j++){
            if(!parselist.some(item => item.name==sortlist[j].name)){ 
                //log(sortlist[j].name+'不存在，从sort文件中删除')
                sortlist.splice(j,1);
                j = j - 1;
            }
        }
        return obj;
    };

    var cleansort = 0;
    for (var i=0;i<parselist.length;i++) {
        if(playurl){break;}
        var beresults = [];//用于存储多线程返回对象
        var beids = [];//用于存储多线程返回id lx+name
        var beerrors = [];//用于存储多线程是否有错误
        let p = i+multiline;
        if(p>parselist.length){p=parselist.length}
        let JxList = [];
        for(let s=i;s<p;s++){
            JxList.push(parselist[s]);
            i=s;
        }
        if(cleansort==0&&!parseStr&&SAconfig.autoselect==1){
            cleansort = 1;//清理sort文件只调用一轮
            JxList.push({lx:'cleansort'});
        }

        let parses = JxList.map((parse)=>{
            if(parse.lx=="cleansort"){
                return {
                    func: sorttask,
                    param: parse,
                    id: 'cleansort'
                }
            }else{
                return {
                    func: parsetask,
                    param: parse,
                    id: parse.lx+'|'+parse.name
                }
            } 
        });
        
        be(parses, {
            func: function(obj, id, error, taskResult) {
                if(id!='cleansort'){
                    obj.ids.push(id);
                    obj.results.push(taskResult);
                    obj.errors.push(error);
                    if (ismulti!=1&&SAconfig.testcheck!=1&&contain.test(taskResult.rurl) && !exclude.test(taskResult.rurl)) {
                        //toast("我主动中断了");
                        //log("√线程结束");
                        return "break";
                    }
                }
            },
            param: {
                ids: beids,
                results: beresults,
                errors: beerrors
            }
        });

        for(let k in beids){
            parsename = beids[k].split('|')[1];
            parselx = beids[k].split('|')[0];
            //if(SAconfig.printlog==1){log("√"+ parsename + ">" + parselx + "解析结果检查")};
            if(beerrors[k]==null){
                parseurl = beresults[k].rurl;
                if(SAconfig.jstoweb==1&&parselx=="J"&&parseurl.search(/x5Rule|webRule/)>-1){
                        //js中跳转x5或web嗅探
                        //if(SAconfig.printlog==1){log("√JS中跳转x5|web嗅探,解析逻辑被打断,结果自负")};  
                        return parseurl;
                }else{
                    if (contain.test(parseurl) && !exclude.test(parseurl)) {
                        if(playurl==""){playurl = parseurl;}
                        if(SAconfig.printlog==1){log("√"+parsename+">"+parselx+"解析成功>"+parseurl)};  
                        if(SAconfig.testcheck==1){
                            playurl = "";
                        }else{
                            if(ismulti==1&&multiline>1){
                                try{
                                    eval('var urljson = '+ parseurl);
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
                                            let MulUrl = SrcParseS.formatMulUrl(murls[j].replace(/;{.*}/g,""), urls.length);
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
                                        //log('判断多线路地址对象有错：'+e.message);
                                    }
                                }else{
                                    let MulUrl = SrcParseS.formatMulUrl(parseurl.replace(/;{.*}/g,""), urls.length);
                                    urls.push(MulUrl.url);
                                    names.push('线路'+urls.length);
                                    headers.push(MulUrl.header);
                                }
                            }else{
                                break;
                            }
                        }
                        for(var j=0;j<sortlist.length;j++){
                            if(sortlist[j].name == parsename){ 
                                if(sortlist[j].sort>0){
                                    sortlist[j].sort = sortlist[j].sort-1;
                                    issort = 1;
                                }
                                break;
                            }
                        }
                    } else {
                        if(beresults[k].lx=="J" || (beresults[k].lx=="U"&&beresults[k].x5==2)){
                            //JS解析失败的、非x5嗅探解析，失败排序+1
                            let failsum =0 ;
                            for(var j=0;j<sortlist.length;j++){
                                if(sortlist[j].name == parsename){ 
                                    sortlist[j].sort = sortlist[j].sort+1;
                                    issort = 1;
                                    failsum = sortlist[j].sort;
                                    if(sortlist[j].stopfrom.indexOf(from)==-1){
                                        if((SAconfig.autoselect==1&&failsum>=3)||(failsum>=SAconfig.failcount)){
                                            //自动选择接口时此接口失败大于等于3时、失败次数大于限定，此片源排除此解析接口
                                            sortlist[j].stopfrom[sortlist[j].stopfrom.length] = from
                                        };
                                    }
                                    break;
                                }
                            }
                            if(SAconfig.testcheck==1){faillist.push(parsename)};
                            //if(SAconfig.printlog==1){log("√解析失败,已失败"+failsum+"次，跳过")};   
                        }
                    }
                }
            }else{
                if(SAconfig.testcheck==1){faillist.push(parsename)};
                //if(SAconfig.printlog==1){log(beerrors[k]+" √此解析有语法错误，跳过")};
                for(var j=0;j<sortlist.length;j++){
                    if(sortlist[j].name == parsename){ 
                        sortlist[j].sort = sortlist[j].sort+1;
                        issort = 1;
                        if(sortlist[j].stopfrom.indexOf(from)==-1){
                            sortlist[j].stopfrom[sortlist[j].stopfrom.length] = from;
                        }
                        break;
                    }
                }
            }
        }//多线程结果处理
    }//循环结束

    if(issort==1&&!parseStr){writeFile(sortfile, JSON.stringify(sortlist))};
    //上面js免嗅、json、明码解析、剔除打不开网站做完了
    if(urls.length>1){
        return JSON.stringify({
            urls: urls,
            names: names,
            headers: headers,
            danmu: danmu
        });   
    }else{
        return playurl;
    }
};

var SrcParseS = {
    mulheader: function (url) {
        if (/mgtv/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'www.mgtv.com' };
        } else if (/bilibili|bilivideo/.test(url)) {
            var header = { 'User-Agent': 'bili2021', 'Referer': 'https://www.bilibili.com' };
        } else if (/wkfile/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'fantuan.tv' };
        } else {
            var header = {};
        }
        return header;
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
            //if(SAconfig.printlog==1){log("√错误："+e.message)};
            return url;
        }   
    },
    //测试视频地址有效性
    testvideourl: function (url,name,times) {
        if(!name){name = "解析"}
        if(!times){times = 120}
        try {
            if (/\.m3u8/.test(url)) {
                var urlcode = JSON.parse(fetch(url,{withStatusCode:true,timeout:2000}));
                if(urlcode.statusCode==-1){
                    //log(name+'>m3u8探测超时未拦载，结果未知')
                    return 1;
                }else if(urlcode.statusCode!=200){
                    //log(name+'>m3u8播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    try{
                        var tstime = urlcode.body.match(/#EXT-X-TARGETDURATION:(.*?)\n/)[1];
                        var urltss = urlcode.body.replace(/#.*?\n/g,'').replace('#EXT-X-ENDLIST','').split('\n');
                    }catch(e){
                        var tstime = 0;
                        var urltss = [];
                    }
                    if(parseInt(tstime)*parseInt(urltss.length) < times){
                        //log(name+'>m3u8播放地址疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }else{
                        var urlts = urltss[0];
                        if(!/^http/.test(urlts)){
                            let http = urlcode.url.match(/http.*\//)[0];
                            urlts = http + urlts;
                        }    
                        var tscode = JSON.parse(fetch(urlts,{headers:{'Referer':url},onlyHeaders:true,timeout:2000}));
                        if(tscode.statusCode==-1){
                            //log(name+'>ts段探测超时未拦载，结果未知')
                            return 1;
                        }else if(tscode.statusCode!=200){
                            //log(name+'>ts段地址疑似失效或网络无法访问，不信去验证一下>'+url);
                            return 0;
                        }
                    }
                }
                //log('test>播放地址连接正常');
            }else if (/\.mp4/.test(url)) {
                var urlheader = JSON.parse(fetch(url,{onlyHeaders:true,timeout:2000}));
                if(urlheader.statusCode==-1){
                    //log(name+'>mp4探测超时未拦载，结果未知')
                    return 1;
                }else if(urlheader.statusCode!=200){
                    //log(name+'>mp4播放地址疑似失效或网络无法访问，不信去验证一下>'+url);
                    return 0;
                }else{
                    var filelength = urlheader.headers['content-length'];
                    if(parseInt(filelength[0])/1024/1024 < 80){
                        //log(name+'>mp4播放地址疑似跳舞小姐姐或防盗小视频，不信去验证一下>'+url);
                        return 0;
                    }
                }
            }
            return 1;
        } catch(e) {
            //log(name+'>错误：探测异常未拦截，可能是失败的>'+e.message)
            return 1;
        }
    }
    
}

