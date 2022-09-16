//============自动挡处理逻辑、仅用于个人学习使用============
//========感谢@断念大佬========

//载入断插主控js
var cfgfile = "hiker://files/rules/Src/Juying/config.json";
var Juyingcfg=fetch(cfgfile);
if(Juyingcfg != ""){
    eval("var JYconfig=" + Juyingcfg+ ";");
}
var parseRoute = JYconfig.dnfile?JYconfig.dnfile:'hiker://files/rules/DuanNian/MyParse.json';
var MyParseS = {};
var mySet = {};
if (fileExist(parseRoute)) {
    eval('var parseFile =' + (/^http/.test(parseRoute)?fetchCache(parseRoute, 24):fetch(parseRoute)));
    MyParseS = parseFile.codes;
    mySet = parseFile.settings;
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
    "disorder": 1,//是否开启乱序模式
    "parsereserve": 0,//是否强制保留用户配置的解析口
    "jstoweb": 0,//是否允许js解析中跳转x5或web
    "cachem3u8": 1,//m3u8是否使用缓存方式播放
    "iscustom": 0,//是否开启远程关怀模式，自定义解析设置开关：0关闭/1开启
    "remotepath": ""//远程在线文件地址
}
eval(fetch('hiker://files/cache/SrcSet.js'));//加载用户参数
if(!userconfig){var config = defaultconfig}else{var config = userconfig}//没有取到用户参数时调用默认参数
if(getMyVar('Stitle','0').indexOf("帅助手") == -1){config.testcheck=0}

//加载远程自定义设置
if(config.iscustom==1){
    try{
        let remotefile = fetchCache(config.remotepath, 24);
        if(remotefile.indexOf("ParseZ") != -1){
            eval(remotefile);
            Object.assign(ParseS, ParseZ);
        }else{
            if(config.printlog==1){log("√远程关怀自定义解析为空，走本地配置文件")};
            config.iscustom = 0;        
        }
    }catch(e){
        if(config.printlog==1){log("√远程关怀自定义加载失败，走本地配置文件")};
        config.iscustom = 0;
    }
}else{var resetsort = 0};

var sortlist = []; //排序降权临时存放数组
var isresetsort = resetsort || 0;
if (isresetsort==0){
    var sortfile=fetch("hiker://files/cache/SrcSort.json");
    if(sortfile != ""){
        eval("var newsort=" + sortfile+ ";");
        Object.assign(sortlist, newsort);
    }
}

//自动解析入口
var aytmParse = function (vipUrl,parseStr) {
    if(config.printlog==1){
        log("√影片地址："+vipUrl);
        if(config.iscustom==1){log("√已开启远程关怀模式")};  
        if(parseStr != undefined && parseStr != ""){
            log("√指定解析：");
        }else{
            if(config.autoselect==1){log("√开启智能优选")}else{log("√关闭智能优选")};  
            if(config.disorder==1){log("√开启乱序模式")}else{log("√关闭乱序模式")}; 
            if(config.parsereserve==1){log("√开启强制优先断插配置")}; 
        }
        if(config.testcheck==1){log("√检测模式")};  
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
    var isparse = 0;
    if (parseStr != undefined && parseStr != "") {
        strlist = parseStr.split(/,|，/); //字符分割
        isparse = 1;
        //config.autoselect = 0;
    }else{
        //自动列出所有接口
        var excludeParse = ['defaultParse', 'maoss', 'CityIP', 'cacheM3u8', 'pcUA', 'parseLc', 'gparse', 'nparse', '道长仓库通免', 'defaultParseWeb', '智能优选', '默认'];
        if(mySet.qju=="智能优选"){config.autoselect=1}
        if(config.autoselect==1){
             //全局排除的追加到排除列表
            for(var j=0;j<sortlist.length;j++){
                try{
                    if(sortlist[j].Globalexclude==1){ 
                        excludeParse.push(sortlist[j].name);
                    }
                }catch(e){}
            } 

            if(str!=""&&str!="默认"){
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
            if(config.iscustom==1){
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
            if(config.disorder==1){
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

    if (strlist.length==0) {hideLoading();return 'toast://好像没有配置解析接口，解个寂寞吗';}
    if(config.printlog==1){
        log("√选择的解析接口组："+strlist);
        log("√影片来源标识："+from)
    };
    
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
    var lx = "";
    var parselist = [];
    //var Jparselist = [];
    //var Uparselist = [];
    var Jparsenum = 0;
    var Uparsenum = 0;
    var x5jxlist = []; //x5嗅探接口存放数组
    var x5nmlist = []; //x5嗅探接口存放数组
    var dellist = [];
    var faillist = [];
    var issort = 0;
    for (var i in strlist) {
        if(strlist[i].includes("http")){
            parsename = strlist[i];
            parseurl = strlist[i];
            lx = "U";
        }else{
            if(typeof ParseS[strlist[i]] == 'string'){
                parsename = strlist[i];
                parseurl = ParseS[strlist[i]];
                lx = "U";
            }else if(typeof ParseS[strlist[i]] == 'function'){
                parsename = strlist[i];
                parseurl = "0";
                lx = "J";    
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
                if(config.autoselect==1&&prior.includes(parsename)==true&&config.parsereserve==1){
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
            if(config.autoselect==1){
                if(stopfrom.indexOf(from)==-1){
                    //自动筛选模式时，sort只做排序使用，不包含停用片源的解析，则加入解析接口组
                    if(lx=="J"){
                        //let parsearr  = { "id" : i,"sort" : sort, "name" : parsename };
                        //Jparselist.push(parsearr); 
                        let arr  = { "id": i,"sort": sort, "name": parsename, "lx": "J" };
                        parselist.push(arr); 
                        Jparsenum ++;
                    }
                    if(lx=="U"){
                        //let urlarr  = { "id" : i,"sort" : sort, "name" : parsename, "url" : parseurl };
                        //Uparselist.push(urlarr); 
                        let arr  = { "id": i,"sort": sort, "name": parsename, "url": parseurl, "lx": "U" };
                        parselist.push(arr); 
                        Uparsenum ++;
                    }
                }else{
                    if(stopfrom.length>=config.fromcount&&stopfrom.indexOf(from)>-1){
                        //此解析接口大于多少片源失败，且已排除片源，加入提示删除数组
                        dellist.push(strlist[i]);
                    }
                }
            }else{
                if(sort>=config.failcount&&stopfrom.indexOf(from)>-1){
                    //此接口已失败大于设置的次数，且已排除片源，加入提示删除数组
                    dellist.push(strlist[i]);
                }else{
                    //非自动筛选解析时按失败次数，小于设置的次数、且解析接口名有效，加入解析接口组
                    if(lx=="J"){
                        //let parsearr  = { "id" : i,"sort" : sort, "name" : parsename };
                        //Jparselist.push(parsearr); 
                        let arr  = { "id": i,"sort": sort, "name": parsename, "lx": "J" };
                        parselist.push(arr); 
                        Jparsenum ++;
                    }
                    if(lx=="U"){
                        //let urlarr  = { "id" : i,"sort" : sort, "name" : parsename, "url" : parseurl };
                        //Uparselist.push(urlarr); 
                        let arr  = { "id": i,"sort": sort, "name": parsename, "url": parseurl, "lx": "U" };
                        parselist.push(arr); 
                        Uparsenum ++;
                    }
                }
            }
        }
    }
    if(dellist.length > 0){
        config['dellist'] = dellist;
        writeFile("hiker://files/cache/SrcSet.js", 'var userconfig = ' + JSON.stringify(config))
        if(config.printlog == 1){log("√建议删除解析口:"+dellist);}
    }
    //if(Jparselist.length == 0 && Uparselist.length == 0){
    if(parselist.length == 0){
        if(config.printlog==1){log("√没有可用的解析接口，需重新配置")};
        hideLoading();
        return 'toast://解析口全部无效了，重新配置吧';
    }else{
        //解析接口排序，将之前失败的排在后面 
        parselist.sort(sortData)
    }
    //解析接口排序，将之前失败的排在后面 
    //if(Jparselist.length > 0){Jparselist.sort(sortData)};
    //if(Uparselist.length > 0){Uparselist.sort(sortData)};
    //if(config.printlog==1){log("√有效解析接口数："+(Jparselist.length+Uparselist.length))};
    if(config.printlog==1){
        log("√有效解析数："+parselist.length+"，JS解析："+Jparsenum+"，URL解析："+Uparsenum);
    };

    var exclude = /404\.m3u8|xiajia\.mp4|余额不足\.m3u8/;//设置排除地址
    var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4/;//设置符合条件的正确地址
    var url = "";
    var urls = [];//用于多线路地址存储
    var names = [];//用于多线路名称存储
    var headers = [];//用于多线路头信息存储
    var ismulti = config.ismulti||0;
    var multiline = config.multiline||1;
    var adminuser = config.adminuser||0;

    if(ismulti==0&&adminuser==0){multiline=2}else{if(multiline>5){multiline=5}}
    if(config.testcheck==1){multiline=10}
    require(config.依赖.match(/https.*\//)[0] + 'SrcJyAuto.js');
    //明码解析线程代码
    var parsetask = function(obj) {
        var rurl = "";
        if(obj.lx=="J"){
            rurl = ParseS[obj.name](vipUrl);
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
                            if(printlog==1){log('明码获取错误：'+e.message)};
                        }
                    }
                }
                let x5 = 0;
                if(rurl == ""){
                    if(!/404 /.test(gethtml)&&obj.url.indexOf('key=')==-1){
                        if(x5jxlist.length<=5){
                            x5jxlist.push(obj.url);
                            x5nmlist.push(obj.name);
                            if(printlog==1){log(obj.name + '>加入x5嗅探列表');}
                        }
                        x5 = 1;
                    }
                }else{
                    if(obj.testurl(rurl,obj.name)==0){
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
    if(config.testcheck==1){showLoading('JS免嗅解析列表，检测中')};

    for (var i=0;i<parselist.length;i++) {
        if(contain.test(url)){break;}
        var beurls = [];//用于存储多线程返回地址
        var benames = [];//用于存储多线程名称
        var beerrors = [];//用于存储多线程是否有错误
        
        let p = i+multiline;
        if(p>parselist.length){p=parselist.length}
        let JxList = [];
        for(let s=i;s<p;s++){
            JxList.push(parselist[s]);
            i=s;
        }
        let parses = JxList.map((parse)=>{
            return {
                func: parsetask,
                param: parse,
                id: parse.id
            }
        });

        be(parses, {
            func: function(obj, id, error, taskResult) {
                obj.results.push(taskResult);
                obj.names.push(id);
                obj.errors.push(error);

                if (ismulti!=1&&config.testcheck!=1&&contain.test(taskResult)&&!exclude.test(taskResult)) {
                    //toast("我主动中断了");
                    log("√线程中止");
                    return "break";
                }
            },
            param: {
                results: beurls,
                names: benames,
                errors: beerrors
            }
        });

        for(let k in benames){
            parsename = benames[k];
            if(config.printlog==1){log("√正在调用js解析：" + parsename)};
            if(beerrors[k]==null){
                if(config.jstoweb==1&&beurls[k].search(/x5Rule|webRule/)>-1){
                        //js中跳转x5或web嗅探
                        if(config.printlog==1){log("√JS中跳转x5|web嗅探,帅助手逻辑被打断,结果自负")};  
                        return beurls[k];
                }else{
                    if (contain.test(beurls[k]) && !exclude.test(beurls[k])) {
                        url = beurls[k];
                        if(config.printlog==1){log("√JS解析成功>" + url)};  
                        if(config.testcheck==1){url=""}else{
                            if(ismulti==1&&multiline>1){
                                let rurl = url.replace(/;{.*}/,'');
                                let head = format.urlJoinUa(rurl,1);
                                urls.push(format.urlCacheM3u8(rurl,head,urls.length)+'#pre#');
                                names.push(parsename);
                                headers.push(head);
                            }else{
                                break;
                            }
                        }
                    } else {
                        //JS解析失败了，排序+1
                        let failsum =0 ;
                        for(var j=0;j<sortlist.length;j++){
                            if(sortlist[j].name == parsename){ 
                                sortlist[j].sort = sortlist[j].sort+1;
                                issort = 1;
                                failsum = sortlist[j].sort;
                                if(sortlist[j].stopfrom.indexOf(from)==-1){
                                    if((config.autoselect==1&&failsum>2)||(failsum>=config.failcount)){
                                        //自动选择接口时此接口失败大于2时、失败次数大于限定，此片源排除此解析接口
                                        sortlist[j].stopfrom[sortlist[j].stopfrom.length] = from
                                    };
                                }
                                break;
                            }
                        }
                        if(config.testcheck==1){faillist.push(parsename)};
                        if(config.printlog==1){log("√解析失败,已失败"+failsum+"次，更换下一个解析")};
                    }
                }
            }else{
                if(config.testcheck==1){faillist.push(parsename)};
                if(config.printlog==1){log(beerrors[k]+" √此接口有语法错误，更换下一个解析")};
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

    /*
    if(Jparselist.length>0){ 
        if(config.testcheck==1){showLoading('JS免嗅解析列表，检测中')};
        if(config.printlog==1){log("√进入JS列表，接口数:"+Jparselist.length)};
        for (var i=0;i<Jparselist.length;i++) {
            if(contain.test(url)){break;}
            var beurls = [];//用于存储多线程返回地址
            var benames = [];//用于存储多线程名称
            var beerrors = [];//用于存储多线程是否有错误
            var task = function(obj) {
                return ParseS[obj.parsename](obj.vipUrl);
            };
            
            let p = i+multiline;
            if(p>Jparselist.length){p=Jparselist.length}
            let JsList = [];
            for(let s=i;s<p;s++){
                parsename = Jparselist[s].name;
                JsList.push(parsename);
                i=s;
            }
            let Jsparses = JsList.map((parse)=>{
                return {
                    func: task,
                    param: {
                        parsename: parse,
                        vipUrl: vipUrl
                    },
                    id: parse
                }
            });

            be(Jsparses, {
                func: function(obj, id, error, taskResult) {
                    obj.results.push(taskResult);
                    obj.names.push(id);
                    obj.errors.push(error);

                    if (ismulti!=1&&config.testcheck!=1&&contain.test(taskResult)&&!exclude.test(taskResult)) {
                        //toast("我主动中断了");
                        log("√线程中止");
                        return "break";
                    }
                },
                param: {
                    results: beurls,
                    names: benames,
                    errors: beerrors
                }
            });

            for(let k in benames){
                parsename = benames[k];
                if(config.printlog==1){log("√正在调用js解析：" + parsename)};
                if(beerrors[k]==null){
                    if(config.jstoweb==1&&beurls[k].search(/x5Rule|webRule/)>-1){
                            //js中跳转x5或web嗅探
                            if(config.printlog==1){log("√JS中跳转x5|web嗅探,帅助手逻辑被打断,结果自负")};  
                            return beurls[k];
                    }else{
                        if (contain.test(beurls[k]) && !exclude.test(beurls[k])) {
                            url = beurls[k];
                            if(config.printlog==1){log("√JS解析成功>" + url)};  
                            if(config.testcheck==1){url=""}else{
                                if(ismulti==1&&multiline>1){
                                    let rurl = url.replace(/;{.*}/,'');
                                    let head = format.urlJoinUa(rurl,1);
                                    urls.push(format.urlCacheM3u8(rurl,head,urls.length)+'#pre#');
                                    names.push(parsename);
                                    headers.push(head);
                                }else{
                                    break;
                                }
                            }
                        } else {
                            //JS解析失败了，排序+1
                            let failsum =0 ;
                            for(var j=0;j<sortlist.length;j++){
                                if(sortlist[j].name == parsename){ 
                                    sortlist[j].sort = sortlist[j].sort+1;
                                    issort = 1;
                                    failsum = sortlist[j].sort;
                                    if(sortlist[j].stopfrom.indexOf(from)==-1){
                                        if((config.autoselect==1&&failsum>2)||(failsum>=config.failcount)){
                                            //自动选择接口时此接口失败大于2时、失败次数大于限定，此片源排除此解析接口
                                            sortlist[j].stopfrom[sortlist[j].stopfrom.length] = from
                                        };
                                    }
                                    break;
                                }
                            }
                            if(config.testcheck==1){faillist.push(parsename)};
                            if(config.printlog==1){log("√解析失败,已失败"+failsum+"次，更换下一个解析")};
                        }
                    }
                }else{
                    if(config.testcheck==1){faillist.push(parsename)};
                    if(config.printlog==1){log(beerrors[k]+" √此接口有语法错误，更换下一个解析")};
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
    }

    if(Uparselist.length>0 && url==""){  
        if(config.testcheck==1){showLoading('URL直链解析列表，检测中')};
        if(config.printlog==1){log("√进入URL列表，接口数:"+Uparselist.length)}   
        for (var i=0;i<Uparselist.length;i++) {
            if(x5jxlist.length>=5){break;}
            if(contain.test(url)){break;}

            let UrlList = [];
            var behtmls = [];//用于存储多线程返回html
            var beparses = [];//用于存储多线程名称|url地址
            var beerrors = [];//用于存储多线程是否有错误
            var task = function(obj) {
                return request(obj.playUrl,{timeout:2000});
            };

            let p = i+multiline;
            if(p>Uparselist.length){p=Uparselist.length}
            for(let s=i;s<p;s++){
                UrlList.push(Uparselist[s].name+'|'+Uparselist[s].url);
                i=s;
            }

            let Urlparses = UrlList.map((parse)=>{
                return {
                    func: task,
                    param: {
                        playUrl: parse.split('|')[1]+vipUrl
                    },
                    id: parse
                }
            });

            be(Urlparses, {
                func: function(obj, id, error, taskResult) {
                    obj.results.push(taskResult);
                    obj.parses.push(id);
                    obj.errors.push(error);
                    
                    if (ismulti!=1&&config.testcheck!=1&&contain.test(taskResult)&&!exclude.test(taskResult)) {
                        log("√线程中止");
                        return "break";
                    }
                },
                param: {
                    results: behtmls,
                    parses: beparses,
                    errors: beerrors
                }
            });
            
            for(let k in beparses){
                let gethtml = behtmls[k];
                parsename = beparses[k].split('|')[0];
                parseurl = beparses[k].split('|')[1];
                if(beerrors[k]==null){
                    if (gethtml == undefined || gethtml == "" || gethtml == null){
                        //url直链网页打不开，排序+1
                        let failsum =0 ;
                        for(let j=0;j<sortlist.length;j++){
                            if(sortlist[j].name == parsename){ 
                                sortlist[j].sort = sortlist[j].sort+1;
                                issort = 1;
                                failsum = sortlist[j].sort;
                                if(failsum>2&&sortlist[j].stopfrom.indexOf(from)==-1){
                                    //网站打不开的情况，失败次数>2，此片源排除此解析接口
                                    sortlist[j].stopfrom[sortlist[j].stopfrom.length] = from
                                };
                                break;
                            }
                        }
                        if(config.testcheck==1){faillist.push(parsename)};
                        if(config.printlog==1){log(parsename+"-√网站疑似打不开,已失败"+failsum+"次，跳过")}; 
                    }else{
                        var rurl = "";
                        var rjxlx = "";
                        try {
                            rurl = JSON.parse(gethtml).url||JSON.parse(gethtml).data.url||JSON.parse(gethtml).data;
                            rjxlx = "O";
                        } catch (e) {
                            //if(config.printlog==1){log(parsename+"-√URL直链-JSON解析失败，转网页明码偿试")}; 
                            if(/\.m3u8|\.mp4|\.flv/.test(gethtml)){
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
                                        //log('√将日志提交给帅，帮助完善解析逻辑 '+gethtml);
                                    }
                                } catch (e) {
                                    log('√明码获取错误：'+e.message);
                                }
                            }
                            if(rurl !=""){
                                rjxlx = "U"
                            }else{
                                if(config.printlog==1){log(parsename+"-√URL直链-明码解析失败，加入嗅探解析组偿试")};  
                                x5jxlist.push(parseurl);
                                x5nmlist.push(parsename);
                            }
                        }
                        if (typeof(rurl)!="undefined" && contain.test(rurl) && !exclude.test(rurl)){
                            url = rurl;
                            if(rjxlx=="O"){
                                for(var j=0;j<sortlist.length;j++){
                                    if(sortlist[j].name == parsename){ 
                                        if(sortlist[j].sort>=0){
                                            sortlist[j].sort = -1;
                                            issort = 1;
                                        }
                                        break;
                                    }
                                }
                                if(config.printlog==1){log(parsename+"-√URL直链-JSON解析成功>" + url)};
                            }else if(rjxlx == "U"){
                                if(config.printlog==1){log(parsename+"-√URL直链-明码解析成功>" + url)};
                            }

                            if(config.testcheck==1){url=""}else{
                                if(ismulti==1&&multiline>1){
                                    let head = format.urlJoinUa(url,1);
                                    urls.push(format.urlCacheM3u8(url,head,urls.length));
                                    names.push(parsename);
                                    headers.push(head);
                                }else{
                                    break;
                                }
                            }
                        } else {
                            let failsum = 0;
                            for(var j=0;j<sortlist.length;j++){
                                if(sortlist[j].name == parsename){ 
                                    sortlist[j].sort = sortlist[j].sort+1;
                                    issort = 1;
                                    failsum = sortlist[j].sort;
                                    if(failsum==0){failsum=1}
                                    break;
                                }
                            }
                            if(config.testcheck==1){faillist.push(parsename)};
                            if(config.printlog==1){log(parsename+"-√URL直链-解析失败"+failsum+"次，跳过")};
                        }
                    }
                }else{
                    if(config.testcheck==1){faillist.push(parsename)};
                    if(config.printlog==1){log(beerrors[k]+" √此接口有语法错误，更换下一个解析")};
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
            }//批量结果循环
        }
    }*/
    if(issort==1&&isparse==0){writeFile("hiker://files/cache/SrcSort.json", JSON.stringify(sortlist))};

    //上面js免嗅、json解析、剔除打不开网站做完了
    try {
        if (url==''||url==null) {
            function uniq(array){
                var temp = []; //一个新的临时数组
                for(var i = 0; i < array.length; i++){
                    if(temp.indexOf(array[i]) == -1){
                        temp.push(array[i]);
                    }
                }
                return temp;
            }
            uniq(faillist);//去除重复
            if (x5jxlist.length == 0) { 
                hideLoading();
                if(config.printlog==1){if(config.testcheck==1){log('√检测结束');log('√解析失败的>'+faillist);refreshPage(false);}else{log('√JS免嗅和URL明码接口失败、网页嗅探未取到解析口，需重新配置插件')}};
                if(config.testcheck==1){
                    if (parseStr == undefined) {
                        if(faillist.length>0){
                            return $("检测结束,是否处理失败的解析？").confirm((faillist,helper)=>{
                                return $("#noHistory##noRecordHistory#hiker://empty").rule((faillist,helper)=>{
                                    requireCache(helper, 48);
                                    faildeal(faillist)
                                },faillist,helper);     
                            },faillist,getMyVar('helper','0'));
                        }else{
                            return "toast://检测结束";
                        }
                    }else{
                        initConfig({faillist:faillist});
                        refreshPage(false);
                        return "toast://〖"+parseStr+"〗解析失败";
                    }
                }else{
                    return "toast://未找到可用的解析口"
                }
            } else {
                if(config.printlog==1){if(config.testcheck==1){log("√JS免嗅和URL明码检测结束，转网页嗅探检测接口数："+x5jxlist.length)}else{log("√JS免嗅和URL明码失败，转网页嗅探解析接口数："+x5jxlist.length)}};
                if(config.printlog==1){log("√嗅探调用解析口："+x5nmlist[0])};
                if(config.testcheck==1){showLoading('嗅探解析列表，检测中')}else{showLoading('√嗅探解析中，请稍候')};
                let parmset = {"issort":0,"printlog":config.printlog,"timeout":config.x5timeout,"autoselect":config.autoselect,"failcount":config.failcount,"from":from,"testcheck":config.testcheck,"parseStr":parseStr,"helper":getMyVar('helper','0'),"Sversion":parseInt(getMyVar('Sversion','0'))};
                for(var i = 0; i < x5nmlist.length; i++) {
                    faillist.push(x5nmlist[i]);
                }
                config['x5scslist'] = [];
                writeFile("hiker://files/cache/SrcSet.js", 'var userconfig = ' + JSON.stringify(config));
                return x5Player(x5jxlist,x5nmlist,vipUrl,sortlist,parmset,faillist,format);
            }
        } else {
            if(urls.length>1){
                return JSON.stringify({
                            urls: urls,
                            names: names,
                            //danmu: "hiker://files/cache/danmu.json",
                            headers: headers
                        });   
            }else{
                return format.urlJoinUa(format.urlCacheM3u8(url,format.urlJoinUa(url,1))) + '#isVideo=true#'; 
            }
        }
    } catch (e) {
        if(config.printlog==1){log("√语法错误")};
        return 'toast://解析失败，语法错误';
    }
    
};

//x5嗅探通用免嗅函数、自动多层嵌套
function x5Player(x5jxlist, x5nmlist, vipUrl, sortlist, parmset, faillist, format) {
    return 'x5Rule://' + x5jxlist[0] + vipUrl + '@' + (typeof $$$ == 'undefined' ? $ : $$$).toString((x5jxlist, x5nmlist, vipUrl, sortlist, parmset, faillist, format, x5Player) => {
        if(typeof(request)=='undefined'||!request){
            eval(fba.getInternalJs());
        };
        if (window.c == null) {
            window.c = 0;
            if(parmset.testcheck==1){fba.showLoading('嗅探解析列表，检测中')}else{fba.showLoading('√嗅探解析中，请稍候')};
        };
        window.c++;
        if (window.c * 250 >= parmset.timeout*1000) {
            if (x5jxlist.length == 1) { 
                //最后一个X5解析失败了，排序+1
                let failsum = 0;
                for(var j=0;j<sortlist.length;j++){
                    if(sortlist[j].name == x5nmlist[0]){ 
                        sortlist[j].sort = sortlist[j].sort+1;
                        failsum = sortlist[j].sort;
                        if(sortlist[j].stopfrom.indexOf(parmset.from)==-1){
                            if((parmset.autoselect==1&&failsum>2)||(failsum>=parmset.failcount)){
                                //自动选择接口时此接口失败大于2时、失败次数大于限定，此片源排除此解析接口
                                sortlist[j].stopfrom[sortlist[j].stopfrom.length] = parmset.from;
                            };
                        }
                        break;
                    }
                }
                fba.writeFile("hiker://files/cache/srcsort.json", JSON.stringify(sortlist));
                fba.hideLoading();

                eval(request("hiker://files/cache/SrcSet.js"));
                for(var i = 0; i < userconfig.x5scslist.length; i++) {
                    faillist.splice(faillist.indexOf(userconfig.x5scslist[i]),1);
                }
                if(parmset.printlog==1){
                    if(parmset.testcheck==1){
                        fba.log("√检测结束");
                        fba.log('√解析失败的>'+faillist);
                    }else{
                        fba.log("√超过"+window.c * 250+"毫秒还未成功,此接口已失败"+failsum+"次，全部嗅探解析口都失败了");
                    }
                };
                if(parmset.testcheck==1){
                    if (parmset.parseStr == undefined) {
                        if(faillist.length>0){
                            return $$$("检测结束,是否处理失败的解析？").confirm((faillist,helper) => $("hiker://empty#noHistory##noRecordHistory#").rule((faillist,helper) => {
                                    requireCache(helper, 48);
                                    faildeal(faillist);
                                }, faillist, helper), faillist, parmset.helper)
                        }else{
                            return "toast://检测结束";
                        }
                    }else{
                        initConfig({faillist:faillist});
                        refreshPage(false);
                        return "toast://〖"+parmset.parseStr+"〗解析失败";
                    }
                }else{
                    return "toast://所有解析接口失败了，请重新配置断插解析接口";
                };
            } else {
                //X5解析失败了，排序+1
                let failsum = 0;
                for(var j=0;j<sortlist.length;j++){
                    if(sortlist[j].name == x5nmlist[0]){ 
                        sortlist[j].sort = sortlist[j].sort+1;
                        parmset.issort = 1;
                        failsum = sortlist[j].sort;
                        if(sortlist[j].stopfrom.indexOf(parmset.from)==-1){
                            if((parmset.autoselect==1&&failsum>2)||(failsum>=parmset.failcount)){
                                //自动选择接口时此接口失败大于2时、失败次数大于限定，此片源排除此解析接口
                                sortlist[j].stopfrom[sortlist[j].stopfrom.length] = parmset.from;
                            };
                        }
                        break;
                    }
                }
                if(parmset.printlog==1){ if(parmset.testcheck==1){fba.log("√检测下一个嗅探接口："+x5nmlist.slice(1)[0]);}else{fba.log("√超过"+window.c * 250+"毫秒还未成功,此接口已失败"+failsum+"次，跳转下一个嗅探接口："+x5nmlist.slice(1)[0])}};
                return x5Player(x5jxlist.slice(1), x5nmlist.slice(1), vipUrl, sortlist, parmset, faillist, format);
            }
        }
        //fba.log(fy_bridge_app.getUrls());
        var urls = _getUrls();
        var exclude = /playm3u8|m3u8\.tv|404\.m3u8|xiajia\.mp4|余额不足\.m3u8/;
        var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4/;
        for (var i in urls) {
            if (!exclude.test(urls[i]) && contain.test(urls[i])) {
                if(parmset.printlog==1){fy_bridge_app.log("√嗅探解析成功>"+urls[i])};
                if(parmset.issort==1){fy_bridge_app.writeFile("hiker://files/cache/SrcSort.json", JSON.stringify(sortlist))};
                if(parmset.testcheck==1){
                    eval(request("hiker://files/cache/SrcSet.js"));
                    userconfig.x5scslist.push(x5nmlist[0]);
                    fy_bridge_app.writeFile("hiker://files/cache/SrcSet.js", "var userconfig = " + JSON.stringify(userconfig));
                    window.c = 100;
                }else{
                    return $$$("#noLoading#").lazyRule((url,format)=>{
                        return format.urlJoinUa(format.urlCacheM3u8(url,format.urlJoinUa(url,1))) + '#isVideo=true#'; 
                    }, urls[i], format);
                    /*
                    let url = "";
                    if (/bilibili|bilivideo/.test(urls[i])) {
                        url = urls[i] + ';{User-Agent@Mozilla/5.0&&Referer@https://www.bilibili.com/}';
                    } else if (/mgtv|sohu/.test(urls[i])) {
                        url = urls[i] + ';{User-Agent@Mozilla/5.0 (Windows NT 10.0)}';
                    } else {
                        url = urls[i];
                    }
                    return url + '#isVideo=true#';
                    */
                }
            }
        } 
    }, x5jxlist, x5nmlist, vipUrl, sortlist, parmset, faillist, format, x5Player)
};

//加载视频url地址处理函数
var format = {
    //定义url-UA处理函数
    urlJoinUa: function (url,ismul) {
        try {
            if(ismul==1){//多线路ua头
                if (/mgtv/.test(url)) {
                    var header = {'User-Agent': 'Mozilla/5.0','Referer': 'www.mgtv.com'};
                }else if(/bilibili|bilivideo/.test(url)) {
                    var header = {'User-Agent': 'Mozilla/5.0','Referer': 'www.bilibili.com'};
                }else if (/wkfile/.test(url)) {
                    var header = {'User-Agent': 'Mozilla/5.0','Referer': 'fantuan.tv'};
                }else{
                    var header = {'User-Agent': 'Mozilla/5.0'};
                }
                return header;
            }else{
                if (url[0] == '/') { url = 'https:' + url }
                if (/wkfile/.test(url)) {
                        url = url + ';{User-Agent@Mozilla/5.0&&Referer@https://fantuan.tv/}';
                }else if(/bilibili|bilivideo/.test(url)){
                    url = url + ";{User-Agent@Mozilla/5.0&&Referer@https://www.bilibili.com/}";
                }else if(/mgtv/.test(url)){
                    url = url + ';{User-Agent@Mozilla/5.0}';
                }
                return url;    
            }
        } catch (e) {
            if(config.printlog==1){log("√错误："+e.message)};
            return url;
        }   
    },
    //定义url是否需要存本地处理函数
    urlCacheM3u8: function (url,header,i) {
        try {
            if(i==undefined||i==""){
                var name = 'video.m3u8';
            }else{
                var name = 'video'+parseInt(i)+'.m3u8';
            }
            if(header==undefined||header==""){header = {}}
            if (config.cachem3u8==1) {
                url = cacheM3u8(url, header, name);
            }
            return url;
        } catch (e) {
            if(config.printlog==1){log("√错误："+e.message)};
            return url;
        }    
    }
};
