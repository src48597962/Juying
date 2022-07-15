
//寻觅片源
function xunmi(name,data) {
    addListener("onClose", $.toString(() => {
        clearMyVar('moviemore');
    }));
    putMyVar('moviemore','1');
    
    if(data){
        var datalist = data;
    }else{
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
    }
    var count = datalist.length;

    var d = [];
    let grouplist = datalist.map((list)=>{
        return list.group||list.type;
    })
    //去重复
    function uniq(array){
        var temp = []; //一个新的临时数组
        for(var i = 0; i < array.length; i++){
            if(temp.indexOf(array[i]) == -1){
                temp.push(array[i]);
            }
        }
        return temp;
    }
    grouplist = uniq(grouplist);
    for(var i in grouplist){
        var lists = datalist.filter(item => {
            return item.group==grouplist[i] || item.type==grouplist[i];
        })
        d.push({
            title: grouplist[i]+'('+lists.length+')',
            url: $('#noLoading#').lazyRule((bess,datalist,name,count)=>{
                    let beresults = [];
                    deleteItemByCls('xunmilist');
                    bess(datalist,beresults,name,count);
                    return'hiker://empty';
                },bess,lists,name,lists.length),
            col_type: "scroll_button",
            extra: {
                id: "grouplist"
            }
        });
    }
    d.push({
        title: count>0?'加载中...':'没有接口，无法搜索',
        url: "hiker://empty",
        col_type: "text_center_1",
        extra: {
            id: "loading"
        }
    });
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    });
    setHomeResult(d);

    var beresults = [];

    function bess(datalist,beresults,name,count) {
        var beerrors = [];
        var success = 0;
        var num = 0;
        var cfgfile = "hiker://files/rules/Src/Juying/config.json";
        var Juyingcfg=fetch(cfgfile);
        if(Juyingcfg != ""){
            eval("var JYconfig=" + Juyingcfg+ ";");
            var xunminum = JYconfig['xunminum'] || 10;
            var xunmitimeout = JYconfig['xunmitimeout'] || 5;
        }else{
            var xunmitimeout = 5;
        }
        var task = function(obj) {
            let url_api = obj.url;
            if (obj.type=="v1") {
                let date = new Date();
                let mm = date.getMonth()+1;
                let dd = date.getDate();
                let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
                //mm<10?"0"+mm+""+dd:mm+""+dd;
                /*
                if(url_api.substr(url_api.length-1,1)=="/"){
                    url_api = url_api.substr(0,url_api.length-1);
                }*/
                var url = url_api + '/detail?&key='+key+'&vod_id=';
                var ssurl = url_api + '?ac=videolist&limit=10&wd='+name+'&key='+key;
                var lists = "html.data.list";
            } else if (obj.type=="app") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var lists = "html.list";
            } else if (obj.type=="v2") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var lists = "html.data";
            } else if (obj.type=="iptv") {
                var url = url_api + '?ac=detail&ids=';
                var ssurl = url_api + '?ac=list&zm='+name+'&wd='+name; 
                var lists = "html.data";
            } else if (obj.type=="cms") {
                var url = url_api + '?ac=detail&ids=';
                var ssurl = url_api + '?ac=videolist&wd='+name;
                var lists = "html.list";
            } else if (obj.type=="xpath") {
                eval("var xpfile = " + fetchCache(url_api,48))
            } else {
                log('api类型错误')
            }
            updateItem('loading', {
                title: beresults.length+'/'+count+'，加载中...',
                url: "hiker://empty",
                col_type: "text_center_1",
                extra: {
                    id: "loading"
                }
            });
            var urlua = obj.ua=="MOBILE_UA"?MOBILE_UA:obj.ua=="PC_UA"?PC_UA:obj.ua;
            if(/v1|app|iptv|v2|cms/.test(obj.type)){
                try {
                    var gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 });
                    if(!/{|}/.test(gethtml)&&gethtml!=""){
                        var decfile = "hiker://files/rules/Src/Juying/appdec.js";
                        var Juyingdec=fetch(decfile);
                        if(Juyingdec != ""){
                            eval(Juyingdec);
                            var html = JSON.parse(xgdec(gethtml));
                        }
                    }else{
                        var html = JSON.parse(gethtml);
                    }
                } catch (e) {
                    var html = { data: [] };
                }
                try{
                    try{
                        var list = eval(lists)||html.list||html.data.list||html.data||[];
                    } catch (e) {
                        var list = html.list||html.data.list||html.data||[];
                    }
                    
                    if(list.length==0&&obj.type=="iptv"){
                        try {
                            ssurl = ssurl.replace('&zm='+name,'');
                            html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                            list = html.data||[];
                        } catch (e) {
                            list = [];
                        }
                    }
                    
                    if(obj.type=="cms"){
                        if((list.length>0&&list[0].vod_name.indexOf(name)==-1)||html.code=="0"){
                            try {
                                ssurl = ssurl.replace('videolist','list');
                                html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                                list = html.list||[];
                            } catch (e) {
                                list = [];
                            }
                        }
                    }
                    
                    if(list.length>0){
                        try {
                            let search = list.map((list)=>{
                                let vodname = list.vod_name||list.title;
                                if(vodname.indexOf(name)>-1){
                                    let vodpic = list.vod_pic||list.pic;
                                    let voddesc = list.vod_remarks||list.state||"";
                                    let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>';
                                    let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                                    return {
                                        title: vodname,
                                        desc: voddesc + '\n\n' + appname + ' ('+obj.type+')'+(obj.group?' ['+obj.group+']':''),
                                        pic_url: vodpic?vodpic + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif",
                                        url: $("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                                require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
                                                xunmierji(type,ua)
                                            },obj.type, urlua),
                                        col_type: "movie_1_vertical_pic",
                                        extra: {
                                            pic: vodpic,
                                            name: vodname,
                                            title: vodname+'-'+obj.name,
                                            cls: 'xunmilist'
                                        }
                                    }
                                }
                            });
                            search = search.filter(n => n);
                            if(search.length>0){
                                return {result:1, apiurl:url_api, add:search};
                            }
                        } catch (e) {
                            log(obj.name+'>'+e.message);
                        }
                    }
                    return {result:0, url:ssurl, apiurl:url_api};
                } catch (e) {
                    log(obj.name+'>'+e.message);
                    return {result:0, url:ssurl, apiurl:url_api};
                }
            }else if(obj.type=="xpath"){
                try {
                    var ssurl = xpfile.searchUrl.replace('{wd}',name);
                    if(xpfile.scVodNode=="json:list"){
                        var html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                        var list = html.list||[];
                    }
                        
                } catch (e) {
                    log(e.message);
                    var list = [];
                }
                if(list.length>0){
                    try {
                        let search = list.map((list)=>{
                            let vodname = list.name;
                            if(vodname.indexOf(name)>-1){
                                let vodpic = list.pic;
                                let voddesc = "";
                                let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>';
                                let vodurl = xpfile.dtUrl.replace('{vid}',list.id);
                                return {
                                    title: vodname,
                                    desc: voddesc + '\n\n' + appname + ' ('+obj.type+')'+(obj.group?' ['+obj.group+']':''),
                                    pic_url: vodpic?vodpic + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif",
                                    url: $("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                            require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
                                            xunmierji(type,ua)
                                        },obj.type, urlua),
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        pic: vodpic,
                                        name: vodname,
                                        title: vodname+'-'+obj.name,
                                        api: url_api,
                                        cls: 'xunmilist'
                                    }
                                }
                            }
                        });
                        search = search.filter(n => n);
                        if(search.length>0){
                            return {result:1, apiurl:url_api, add:search};
                        }
                    } catch (e) {
                        log(obj.name+'>'+e.message);
                    }
                }
                return {result:0, url:ssurl, apiurl:url_api};
            }else{

            }
        };

        let Jklist = datalist.map((parse)=>{
            return {
                func: task,
                param: {
                    name: parse.name,
                    url: parse.url,
                    ua: parse.ua,
                    type: parse.type,
                    group: parse.group||""
                },
                id: parse.name
            }
        });
        
        be(Jklist, {
            func: function(obj, id, error, taskResult) {
                num = num + 1;
                let i = taskResult.result;
                if(i==1){
                    success = success + i;
                    addItemBefore('loading', taskResult.add);
                }else{
                    obj.errors.push({name:id,url:taskResult.url,apiurl:taskResult.apiurl});
                }
                if(obj.results.indexOf(taskResult.apiurl)==-1){obj.results.push(taskResult.apiurl);}
                
                updateItem('loading', {
                    title: obj.results.length+'/'+count+'，加载中...',
                    url: "hiker://empty",
                    col_type: "text_center_1",
                    extra: {
                        id: "loading"
                    }
                });
                
                if (success>=xunminum) {
                    //toast("我主动中断了");
                    //log("√线程中止");
                    return "break";
                }
                if(error){log(id+"-错误信息："+error);}
            },
            param: {
                results: beresults,
                errors: beerrors
            }
        });

        for (let k in beerrors) {
            addItemBefore('loading', {
                title: beerrors[k].name,
                desc: "加载失败，点击操作",
                url: $(["查看原网页","删除此接口"],2).select((name,url,api)=>{
                    if(input=="查看原网页"){
                        return url;
                    }else{
                        return $("确定删除接口："+name).confirm((dataurl)=>{
                            var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                            var datafile = fetch(filepath);
                            eval("var datalist=" + datafile+ ";");
                            for(var i=0;i<datalist.length;i++){
                                if(datalist[i].url==dataurl){
                                    datalist.splice(i,1);
                                    break;
                                }
                            }
                            writeFile(filepath, JSON.stringify(datalist));
                            deleteItem('xumi-'+dataurl);
                            return "toast://已删除";
                        }, api)
                    }
                }, beerrors[k].name, beerrors[k].url, beerrors[k].apiurl),
                col_type: "text_1",
                extra: {
                    id: 'xumi-'+beerrors[k].apiurl,
                    cls: 'xunmilist'
                }
            });
        }
        updateItem('loading', {
            title: beresults.length+'/'+count+',我是有底线的',
            url: beresults.length==count?"hiker://empty":$('#noLoading#').lazyRule((bess,datalist,beresults,name,count)=>{
                    for (let j = 0; j < beresults.length; j++) {
                        for(var i = 0; i < datalist.length; i++){
                            if(beresults[j] == datalist[i].url){
                                datalist.splice(i,1);
                                break;
                            }
                        }
                    }
                    //var arr3 = datalist.filter(list => !beresults.includes(list.url));
                    bess(datalist,beresults,name,count);
                    return "hiker://empty";
                },bess,datalist,beresults,name,count),
            col_type: "text_center_1",
            extra: {
                id: "loading"
            }
        });
    }
    if(count>0){bess(datalist,beresults,name,count);}
}

function xunmierji(type,ua) {
    addListener("onClose", $.toString(() => {
        clearMyVar('parse_api');
        clearMyVar('moviedesc');
        clearMyVar('SrcM3U8');
        clearMyVar('linecode');
    }));

    var d = [];
    setPageTitle(MY_PARAMS.title);
    //加载本地自定义变量缓存文件
    var configfile = config.依赖.match(/https.*\//)[0] + 'srcconfig.js';
    require(configfile);

    //自动判断是否需要更新请求
    if (getMyVar('myurl', '0') != MY_URL || !configvar.详情1 || configvar.标识 != MY_URL) {
        if (/v1|app|v2|iptv|cms/.test(type)) {
            try{
                var html = JSON.parse(request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } }));
            } catch (e) {
                var html = "";
            }
        } else if (/xpath/.test(type)) {
            try{
                var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } });
            } catch (e) {
                var html = "";
            }
        } else {
            //后续网页类
        }
        var zt = 1;
        putMyVar('myurl', MY_URL);
    } else {
        var zt = 0;
    }
    //影片详情
    if (zt == 1) {
        if (/v1|app|v2|cms/.test(type)) {
            if (/cms/.test(type)) {
                try{
                    var json = html.list[0];
                }catch(e){
                    var json = html.data.list[0];
                }
                
                var arts = json.vod_play_from.split('$$$');
                var conts = json.vod_play_url.split('$$$');
            }else{
                if($.type(html.data)=="array"){
                    var json = html.data[0];
                }else{
                    var json = html.data;
                }
                if(json&&json.vod_info){
                    json = json.vod_info;
                }
                var arts = json.vod_play_list || json.vod_url_with_player;
                var conts = arts;
            }
            var actor = json.vod_actor || "内详";
            var director = json.vod_director || "内详";
            var area = json.vod_area || "未知";
            var year = json.vod_year || "未知";
            var remarks = json.vod_remarks || "";
            var pubdate = json.vod_pubdate || json.vod_class || "";
            var pic = MY_PARAMS.pic || json.vod_pic;
            var desc = json.vod_blurb || '...';
        }else if (/iptv/.test(type)) {
            var actor = html.actor.join(",") || "内详";
            var director = html.director.join(",") || "内详";
            var area = html.area.join(",") || "未知";
            var year = html.pubtime || "未知";
            var remarks = html.trunk || "";
            var pubdate = html.type.join(",") || "";
            var pic = MY_PARAMS.pic || html.img_url;
            var desc = html.intro || '...';
            var arts = html.videolist;
            var conts = arts;
        }else if (/xpath/.test(type)) {
            log(html)
            eval("var xpfile = " + fetchCache(MY_PARAMS.api,48))
            log(xpfile)
            var actor = xpath(html, xpfile.dtActor) || "内详";
            log(xpfile.dtActor)
            log(xpath(html, xpfile.dtActor))
            var director = xpath(html, xpfile.dtDirector) || "内详";
            var area = xpath(html, xpfile.dtArea) || "未知";
            var year = xpath(html, xpfile.dtYear) || "未知";
            var remarks = xpath(html, xpfile.dtCate) || "";
            var pubdate = xpath(html, xpfile.dtMark) || "";
            var pic = MY_PARAMS.pic || xpath(html, xpfile.dtImg);
            var desc = xpath(html, xpfile.dtDesc) || '...';
            var arts = [];
            var conts = [];
        }else{
            //网页
        }
        var details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
        var details2 = remarks + '\n' + pubdate;
        var newconfig = { 详情1: details1, 详情2: details2, 图片: pic, 简介: desc, 线路: arts, 影片: conts, 标识: MY_URL };
        var libsfile = 'hiker://files/libs/' + md5(configfile) + '.js';
        writeFile(libsfile, 'var configvar = ' + JSON.stringify(newconfig));
    } else {
        var details1 = configvar.详情1;
        var details2 = configvar.详情2;
        var pic = configvar.图片;
        var desc = configvar.简介;
        var arts = configvar.线路;
        var conts = configvar.影片;
    }
    d.push({
        title: details1,//详情1
        desc: details2,//详情2
        pic_url: pic + '@Referer=',//图片
        url: pic + '#noHistory#',//链接
        col_type: 'movie_1_vertical_pic_blur',
        extra: {
            gradient: true
        }
    });

    //二级统一菜单
    require(config.依赖.match(/https.*\//)[0] + 'SrcJyMenu.js');
    putMyVar('moviedesc',desc)
    for(var i in erjimenu){
        d.push(
            erjimenu[i]
        )
    }
    var parse_api = "";
    var tabs = [];
    var linecodes = [];
    for (var i in arts) {
        if (/v1|app|v2/.test(type)) {
            let line = arts[i].name || arts[i].player_info.show;
            tabs.push(line);
            var linecode = arts[i].code || arts[i].player_info.from;

            if (getMyVar(MY_URL, '0') == i) {
                try {
                    if(type=="v2"){
                        var parse1 = arts[i].parse_api;
                        var parse2 = arts[i].extra_parse_api;
                    }else{
                        var parse1 = arts[i].player_info.parse;
                        var parse2 = arts[i].player_info.parse2;
                    }
                    if (parse2.indexOf('//') == -1) {
                        parse_api = parse1;
                    } else if (parse1.indexOf('//') == -1) {
                        parse_api = parse2;
                    } else {
                        parse_api = parse2 + ',' + parse1;
                    }
                } catch (e) {
                    parse_api = arts[i].parse_api;
                }
                if (parse_api != "" && parse_api != undefined) {
                    parse_api = parse_api.replace(/\.\./g, '.').replace(/。\./g, '.');
                }
            }
        }else if (/iptv/.test(type)) {
            let line = i;
            tabs.push(line);
            var linecode = i;
        }else if (/cms/.test(type)) {
            tabs.push(arts[i]);
            var linecode = arts[i];
        }else{
            var linecode = "";
            //网页
        }
        linecodes.push(linecode);
    }

    var lists = [];
    for (var i in conts) {
        if (/v1|app|v2/.test(type)) {
            if(conts[i].url){
                let single = conts[i].url||"";
                if(single){lists.push(single.split('#'))};
            }else{
                let single = conts[i].urls||[];
                if(single.length>0){
                    var si = [];
                    for (let j = 0; j < single.length; j++) {
                        si.push(single[j].name+"$"+single[j].url);
                    }
                    lists.push(si);
                };
            }
        }else if (/iptv/.test(type)) {
            let single = conts[i]||[];
            if(single.length>0){
                var si = [];
                for (let j = 0; j < single.length; j++) {
                    si.push(single[j].title+"$"+single[j].url);
                }
                lists.push(si);
            };
        }else if (/cms/.test(type)) {
            let single = conts[i]||"";
            if(single){lists.push(single.split('#'))};
        }else{
            //网页
        }
    }

    //取之前足迹记录，用于自动定位之前的线路
    try {
        eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
        if (SrcMark != "") {
            if (SrcMark.route[MY_URL] != undefined) {
                putMyVar(MY_URL, SrcMark.route[MY_URL]);
            }
        }
    } catch (e) { }
    var Marksum = 30;//设置记录线路足迹数量

    //线路部份
    var Color = "#f13b66a";
    var Color1 = "#098AC1";
    function getHead(title) {
        return '‘‘’’<strong><font color="' + Color + '">' + title + '</front></strong>';
    }
    for (let i = 0; i < 9; i++) {
        d.push({
            col_type: "blank_block"
        })
    }

    function setTabs(tabs, vari) {
        d.push({
            title: getMyVar('shsort') == '1'?'““””<b><span style="color: #FF0000">∨</span></b>' : '““””<b><span style="color: #1aad19">∧</span></b>',
            url: $("#noLoading#").lazyRule(() => {
                if (getMyVar('shsort') == '1') { putMyVar('shsort', '0'); } else { putMyVar('shsort', '1') };
                refreshPage(false);
                return 'toast://切换排序成功'
            }),
            col_type: 'scroll_button'
        })
        for (var i in tabs) {
            if (tabs[i] != "") {
                if(getMyVar(vari, '0') == i){putMyVar('linecode', linecodes[i])};
                d.push({
                    title: getMyVar(vari, '0') == i ? getHead(tabs[i] + '↓') : tabs[i],
                    url: $("#noLoading#").lazyRule((vari, i, Marksum) => {
                        if (parseInt(getMyVar(vari, '0')) != i) {
                            try {
                                eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
                            } catch (e) {
                                var SrcMark = "";
                            }
                            if (SrcMark == "") {
                                SrcMark = { route: {} };
                            } else if (SrcMark.route == undefined) {
                                SrcMark.route = {};
                            }
                            SrcMark.route[vari] = i;
                            var key = 0;
                            var one = "";
                            for (var k in SrcMark.route) {
                                key++;
                                if (key == 1) { one = k }
                            }
                            if (key > Marksum) { delete SrcMark.route[one]; }
                            writeFile("hiker://files/cache/SrcMark.json", JSON.stringify(SrcMark));
                            putMyVar(vari, i);
                            refreshPage(false);
                            return 'toast://切换成功'
                        } else {
                            return '#noHistory#hiker://empty'
                        }
                    }, vari, i, Marksum),
                    col_type: 'scroll_button'
                })
            }
        }
    }
    setTabs(tabs, MY_URL);

    //选集部份
    function setLists(lists, index) {
        var list = lists[index];
        function playlist(lx, len) {//定义选集列表生成
            if (lx == '1') {
                if (/v1|app|v2|iptv|cms/.test(type)) {
                    var playtitle = list[j].split('$')[0];
                    if (/iptv/.test(type)) {
                        var playurl = list[j].split('$')[1].split('url=')[1];
                        parse_api = list[j].split('$')[1].split('url=')[0]+"url=";
                    }else{
                        var playurl = list[j].split('$')[1];
                    }
                    putMyVar('parse_api', parse_api);
                    var DTJX = $("").lazyRule(() => {
                        require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(input);
                    });
                }else{
                    //网页
                }
                d.push({
                    title: playtitle.replace(/第|集|话|期|-/g, ''),
                    url: playurl + DTJX,
                    extra: { id: playurl, referer: playurl, ua: PC_UA, jsLoadingInject: true, blockRules: ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', 'hm.baidu.com', '/ads/*.js', '.css'] },
                    col_type: list.length > 4 && len < 7 ? 'text_4' : 'text_3'
                });
            } else {
                d.push({
                    title: '当前无播放选集，点更多片源试试！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                });
            }

        }
        if (list == undefined || list.length == 0) {
            playlist('0');
        } else {
            if (/v1|app|v2|iptv/.test(type)) {
                var listone = list[0].split('$')[0];
            }else{
                //cms
            }
            if (listone) {
                var len = listone.length;
            }
            if (getMyVar('shsort') == '1') {
                try {
                    for (var j = list.length - 1; j >= 0; j--) {
                        playlist('1', len);
                    }
                } catch (e) {
                    playlist('0');
                }
            } else {
                try {
                    for (var j = 0; j < list.length; j++) {
                        playlist('1', len);
                    }
                } catch (e) {
                    playlist('0');
                }

            }
        }
    }
    setLists(lists, getMyVar(MY_URL, '0'));
    //底部说明
    d.push({
        desc: '‘‘’’<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1'
    });
    setResult(d);
}