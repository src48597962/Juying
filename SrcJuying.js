//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除


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
            }else{

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
                    
                    if(list.length>0&&obj.type=="cms"){
                        if(list[0].vod_name.indexOf(name)==-1){
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
                                                require(config.依赖);
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
            }
            //网页
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
        }else{
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
            let actor = json.vod_actor || "内详";
            let director = json.vod_director || "内详";
            let area = json.vod_area || "未知";
            let year = json.vod_year || "未知";
            let remarks = json.vod_remarks || "";
            let pubdate = json.vod_pubdate || json.vod_class || "";
            var details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
            var details2 = remarks + '\n' + pubdate;
            var pic = MY_PARAMS.pic || json.vod_pic;
            var desc = json.vod_blurb || '...';
        }else if (/iptv/.test(type)) {
            let actor = html.actor.join(",") || "内详";
            let director = html.director.join(",") || "内详";
            let area = html.area.join(",") || "未知";
            let year = html.pubtime || "未知";
            let remarks = html.trunk || "";
            let pubdate = html.type.join(",") || "";
            var details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
            var details2 = remarks + '\n' + pubdate;
            var pic = MY_PARAMS.pic || html.img_url;
            var desc = html.intro || '...';
            var arts = html.videolist;
            var conts = arts;
        }else{
            //网页
        }
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
                    extra: { id: playurl, referer: playurl, ua: PC_UA, jsLoadingInject: true, blockRules: ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', '.css'] },
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

//二级
function erji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('SrcM3U8');
    }));
    var d = [];
    var html = fetch(MY_URL.split('##')[1]);
    var json = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).detail.itemData;
    var plays = json.play.item_list;
    //log(plays);
    var shows = json.play_from_open_index;
    //log(shows);
    
    let actor = json.starring?'演员：'+json.starring : json.emcee?'主持：'+json.emcee:'内详';
    let director = json.director?'导演：'+json.director : json.tv_station?json.tv_station:'内详';
    let area = json.zone?'地区：'+json.zone:'';
    let year = json.year?'   年代：' + json.year:'';
    let remarks = json.style ? json.style : '';
    let pubdate = json.update_wordstr ? json.update_wordstr : '';

    var details1 = director.substring(0, 15) + '\n' + actor.substring(0, 15) + '\n' + area + year;
    var details2 = remarks + '\n' + pubdate;
    var pic = MY_PARAMS.pic;
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
    for(var i in erjimenu){
        d.push(
            erjimenu[i]
        )
    }

    var tabs = [];
    var lists = [];

    for (var i in plays) {
        lists.push(plays[i].info);
        tabs.push(plays[i].sitename[0]);
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
    try{
        var playsinfo = plays[0].info;
    }catch(e){
        var playsinfo = "";
    }
    if(playsinfo||shows){
        setTabs(tabs, MY_URL);
    }else{
        d.push({
            col_type: "line"
        })
        for (let i = 0; i < 8; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
    }
    var easy = $("").lazyRule(() => {
        try{
            input=fetch(input,{}).split("('")[1].split("'")[0];

            if(input.match(/ixigua|iqiyi|qq.com|mgtv|le\.com|bili|sohu|youku|pptv|cctv|1905\.com/)){
                input=input.split("?")[0];
            }else if(input.match(/huanxi/)){
                input=input.split("&")[0];
            }else if(input.match(/migu/)){
                input = "https://m.miguvideo.com/mgs/msite/prd/detail.html" + input.replace(/\\?.*cid/, '?cid').split("&")[0] + "&mgdbid=";
            }
            
            if(!/^http/.test(input)){
                return "toast://本集无播放地址，可从更多片源中寻找";
            }
            //log(input)
            require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
            return SrcParseS.聚影(input);
        }catch(e){
            return input;
        }
    });
    var block = ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', '.css'];
    //选集部份
    function setLists(lists, index) {
        var list = lists[index];
        
        function nolist() {
            d.push({
                title: '此影片无播放选集！',
                url: '#noHistory#hiker://empty',
                col_type: 'text_center_1'
            });
        }
        
        if(list){
            if (list.length == 0) {
                nolist();
            } else {
                if (getMyVar('shsort') == '1') {
                    try {
                        for (var j = list.length - 1; j >= 0; j--) {
                            let url = 'https://v.sogou.com' + list[j].url;
                            if (!list[j].index == '0') {
                                d.push({
                                    title: list[j].index + '',
                                    url: url + easy,
                                    extra: { id: MY_URL+j, jsLoadingInject: true, blockRules: block },
                                    col_type: 'text_4'
                                });
                            }
                        }
                    } catch (e) {
                        nolist();
                    }
                } else {
                    try {
                        for (var j = 0; j < list.length; j++) {
                            let url = 'https://v.sogou.com' + list[j].url;
                            if (!list[j].index == '0') {
                                d.push({
                                    title: list[j].index + '',
                                    url: url + easy,
                                    extra: { id: MY_URL+j, jsLoadingInject: true, blockRules: block },
                                    col_type: 'text_4'
                                });
                            }
                        }
                    } catch (e) {
                        nolist();
                    }
                }
            }
        }else if (shows&&plays.length>0) {
            var arr = [];
            var zy = shows.item_list[index];
            for (var ii in zy.date) {
                date = zy.date[ii];
                day = zy.date[ii].day;
                for (j in day) {
                    dayy = day[j][0] >= 10 ? day[j][0] : "0" + day[j][0];
                    Tdate = date.year + date.month + dayy;
                    arr.push(Tdate);
                    if (getMyVar('shsort') == '1') {
                        arr.sort(function(a, b) {
                            return a - b
                        })
                    } else {
                        arr.sort(function(a, b) {
                            return b - a
                        })
                    }
                }
            }
            for (var k = 0; k < arr.length; k++) {
                let url = "https://v.sogou.com/vc/eplay?query=" + arr[k] + "&date=" + arr[k] + "&key=" + json.dockey + "&st=5&tvsite=" + plays[index].site;
                d.push({
                    title: "第" + arr[k] + "期",
                    col_type: "text_2",
                    url: url + easy,
                    extra: {
                        id: MY_URL+k, jsLoadingInject: true, blockRules: block
                    }
                });
            }
        } else if (plays.length==0) {
            nolist();
        } else {
            for (var m in plays) {
                let url = "https://v.sogou.com" + plays[m].url;
                d.push({
                    title: plays[m].flag_list.indexOf('trailer') == -1?plays[m].sitename[0]:plays[m].sitename[0] + '—预告',
                    img: 'http://dlweb.sogoucdn.com/video/wap/static/img/logo/' + plays[m].sitename[1],
                    url: url + easy,
                    col_type: "icon_2",
                    extra: { id: MY_URL, jsLoadingInject: true, blockRules: block },
                })
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


//一级
function yiji() {
    Version();
    /*
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
*/

    var d = [];
    const Color = "#3399cc";
    const categorys = ['电视剧','电影','动漫','综艺','纪录片'];
    const listTabs = ['teleplay','film','cartoon','tvshow','documentary'];
    const fold = getMyVar('SrcJuying$fold', "0");
    const 类型 = getMyVar('SrcJuying$类型', '');
    const 地区 = getMyVar('SrcJuying$地区', '');
    const 年代 = getMyVar('SrcJuying$年代', '');
    const 资源 = getMyVar('SrcJuying$资源', '');
    const 明星 = getMyVar('SrcJuying$明星', '');
    const 排序 = getMyVar('SrcJuying$排序', '');
    MY_URL = "https://waptv.sogou.com/napi/video/classlist?abtest=0&iploc=CN1304&spver=&listTab=" + getMyVar('SrcJuying$listTab', 'teleplay') + "&filter=&start="+ (MY_PAGE-1)*15 +"&len=15&fr=filter";

    if(类型 != ""){
        MY_URL = MY_URL + "&style=" + 类型;
    }
    if(地区 != ""){
        MY_URL = MY_URL + "&zone=" + 地区;
    }
    if(年代 != ""){
        MY_URL = MY_URL + "&year=" + 年代;
    }
    if(资源 != ""){
        MY_URL = MY_URL + "&fee=" + 资源;
    }
    if(明星 != ""){
        MY_URL = MY_URL + "&emcee=" + 明星;
    }
    if(排序 != ""){
        MY_URL = MY_URL + "&order=" + (排序=="最新"?"time":"score");
    }

    if(MY_PAGE==1){
        d.push({
            title: "管理",
            url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                    require(config.依赖);
                    SRCSet();
                }),
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/129.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "历史",
            url: "hiker://history",
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/109.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "搜索",
            url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                    require(config.依赖);
                    sousuo2();
                }),
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/101.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "筛选",
            url: $('#noLoading#').lazyRule((fold) => {
                    putMyVar('SrcJuying$fold', fold === '1' ? '0' : '1');
                    refreshPage(false);
                    return "hiker://empty";
                }, fold),
            pic_url: fold === '1'?'https://lanmeiguojiang.com/tubiao/more/213.png':'https://lanmeiguojiang.com/tubiao/more/172.png',
            col_type: 'icon_small_4'
        });
        d.push({
            col_type: 'line'
        });
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }

        for (var i in categorys) {
            d.push({
                title: getMyVar('SrcJuying$listTab', 'teleplay') === listTabs[i] ? '““””<b><span style="color:' + Color + '">' + categorys[i] + '</span></b>' : categorys[i],
                url: $('#noLoading#').lazyRule((listTab) => {
                        putMyVar('SrcJuying$listTab', listTab);
                        refreshPage(false);
                        return "hiker://empty";
                    }, listTabs[i]),
                col_type: 'scroll_button'
            });
        }
        d.push({
            col_type: "blank_block"
        });
        
        var html = JSON.parse(request(MY_URL));

        if(fold==='1'){
            var filter = html.listData.list.filter_list;
            for (var i in filter) {
                d.push({
                    title: filter[i].name=="排序"?排序==""?'““””<span style="color:red">最热</span>':"最热":(类型==""&&filter[i].name=="类型")||(地区==""&&filter[i].name=="地区")||(年代==""&&filter[i].name=="年代")||(资源==""&&filter[i].name=="资源")||(明星==""&&filter[i].name=="明星")?'““””<span style="color:red">全部</span>':"全部",
                    url: $('#noLoading#').lazyRule((name) => {
                            putMyVar('SrcJuying$'+name, '');
                            refreshPage(false);
                            return "hiker://empty";
                        }, filter[i].name),
                    col_type: 'scroll_button',
                })
                let option_list = filter[i].option_list;
                for (var j in option_list) {
                    d.push({
                        title: getMyVar('SrcJuying$'+filter[i].name, '')==option_list[j]?'““””<span style="color:red">'+option_list[j]+'</span>':option_list[j],
                        url: $('#noLoading#').lazyRule((name,option) => {
                                putMyVar('SrcJuying$'+name, option);
                                refreshPage(false);
                                return "hiker://empty";
                            }, filter[i].name, option_list[j]),
                        col_type: 'scroll_button'
                    });
                }
                d.push({
                    col_type: "blank_block"
                });
            }
        }
    }else{
        var html = JSON.parse(request(MY_URL));
    }
    var seachurl = $('').lazyRule(() => {
        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖);
            xunmi(name);
        }, input);
    });
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    var list = html.listData.results;
    for (var i in list) {
        d.push({
            title: list[i].name,
            img: list[i].v_picurl + '@Referer=',
            url: JYconfig['erjimode']!=2?"hiker://empty##https://v.sogou.com" + list[i].url.replace('teleplay', 'series').replace('cartoon', 'series') + "#immersiveTheme#":list[i].name + seachurl,
            desc: list[i].ipad_play_for_list.finish_episode?list[i].ipad_play_for_list.episode==list[i].ipad_play_for_list.finish_episode?"全集"+list[i].ipad_play_for_list.finish_episode:"连载"+list[i].ipad_play_for_list.episode+"/"+list[i].ipad_play_for_list.finish_episode:"",
            extra: {
                pic: list[i].v_picurl,
                name: list[i].name
            }
        });
    }

    setResult(d);
    if(getMyVar('jydingyue','0')=="0"&&JYconfig['codeid2']){
        putMyVar('jydingyue','1');
        try{
            var nowtime = Date.now();
            var oldtime = parseInt(getItem('dingyuetime','0').replace('time',''));
            if(nowtime > (oldtime+6*60*60*1000)){
                let pasteurl = JYconfig['codeid2'];
                let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', pasteurl));
                if(pasteurl&&!/^error/.test(text)){
                    let pastedata = JSON.parse(base64Decode(text));
                    var jkfilepath = "hiker://files/rules/Src/Juying/jiekou.json";
                    var jkdatalist = pastedata.jiekou;
                    if(jkdatalist.length>0){
                        writeFile(jkfilepath, JSON.stringify(jkdatalist));
                    }
                    var jxfilepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                    var jxdatalist = pastedata.jiexi;
                    if(jxdatalist.length>0){
                        writeFile(jxfilepath, JSON.stringify(jxdatalist));
                    }
                    log("自动订阅同步完成");
                }else{
                    log("自动订阅同步口令错误或已失效");
                }
                setItem('dingyuetime',nowtime+"time");
            }
        } catch (e) {
            log('自动订阅更新失败：'+e.message); 
        }
    }
}

//搜索页
function sousuo2() {
    addListener("onClose", $.toString(() => {
        clearMyVar('sousuo$input');
    }));
    var seachurl = $('').lazyRule(() => {
            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                require(config.依赖);
                xunmi(name);
            }, input);
        });
    var d = [];
    d.push({
        title: "🔍",
        url: $.toString((seachurl) => {
                return input + seachurl;
            },seachurl),
        desc: "搜你想看的...",
        col_type: "input",
        extra: {
            titleVisible: true,
            id: "input",
            onChange: $.toString((seachurl) => {
                if(input.length==1){deleteItemByCls('suggest');}
                if(input.length>1&&input!=getMyVar('sousuo$input', '')){
                    putMyVar('sousuo$input', input);
                    deleteItemByCls('suggest');
                    var html = request("https://movie.douban.com/j/subject_suggest?q=" + input, {timeout: 3000});
                    var list = JSON.parse(html)||[];
                    let suggest = list.map((sug)=>{
                        try {
                            if(sug.img!=""){
                                return {
                                    title: sug.title,
                                    img: sug.img + '@Referer=',
                                    url: sug.title + seachurl,
                                    desc: "年份：" + sug.year,
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }else{
                                return {
                                    title: "⚡" + sug.title,
                                    url: sug.title + seachurl,
                                    col_type: "text_1",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }
                        } catch (e) {  }
                    });
                    if(suggest.length>0){
                        addItemAfter('input', suggest);
                    }
                }
            }, seachurl)
        }
    });

    d.push({
        title: '<span style="color:#ff6600"><b>\t热搜榜\t\t\t</b></span>',
        url: "hiker://empty",
        pic_url: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'icon_small_3'
    });
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    try{
        if(JYconfig.resoulist){
            delete JYconfig['resoulist'];
            writeFile(cfgfile, JSON.stringify(JYconfig));
        }
    }catch(e){
        //过几个版本后删除
    }
    var resoufile = "hiker://files/rules/Src/Juying/resou.json";
    var Juyingresou=fetch(resoufile);
    if(Juyingresou != ""){
        eval("var JYresou=" + Juyingresou+ ";");
        var list = JYresou['resoulist'] || [];
    }else{
        var JYresou= {};
        var list = [];
    }
    var nowtime = Date.now();
    var oldtime = JYresou.updatetime||0;
    if(list.length==0||nowtime > (oldtime+24*60*60*1000)){
        var html = request("https://waptv.sogou.com/hotsugg");
        var list = pdfa(html, "body&&.hot-list&&li");
        JYresou['resoulist'] = list;
        JYresou['updatetime'] = nowtime;
        writeFile(resoufile, JSON.stringify(JYresou));
    }

    for (var i in list) {
        d.push({
            title: i=="0"?'““””<span style="color:#ff3300">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):i=="1"?'““””<span style="color:#ff6600">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):i=="2"?'““””<span style="color:#ff9900">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):'““””<span>' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"),
            url: pdfh(list[i], "a&&Text") + seachurl,
            col_type: "text_1"
        }, );
    }

    setResult(d);
}

//搜索
function sousuo() {
    var d = [];
    var html = getResCode();
    try {
        var list = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).result.longVideo.results;
        for (var i = 0; i < list.length; i++) {
            if (list[i].play.item_list){
                d.push({
                    title: list[i].name.replace(/|/g,''),
                    url: 'hiker://empty##https://v.sogou.com' + list[i].tiny_url + "#immersiveTheme#",
                    desc: list[i].list_category.join(','),
                    content: list[i].introduction,
                    pic_url: list[i].v_picurl,
                    extra: {
                        pic: list[i].v_picurl,
                        name: list[i].name.replace(/|/g,'')
                    }
                })
            }
        }
    } catch (e) { }
    setResult(d);
}

//二级统一菜单
var erjimenu = [
        {
        title: "剧情简介",
        url: /\.sogou\./.test(MY_URL)?$('hiker://empty#noRecordHistory##noHistory#').rule((url) => {
                var d=[];
                var html = fetch(url.split('##')[1]);
                var story=parseDomForHtml(html, 'body&&.srch-result-info&&Html').replace(/<\/a><a/g,',</a><a');
                for(let i = 0;;i++){
                    try{
                        d.push({
                            title:parseDomForHtml(story, 'div,' +i+ '&&Text').replace('更多',''),
                            col_type: 'rich_text'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }catch(e){
                        break;
                    }
                };

                try{
                    var photos=parseDomForArray(html, '#photoList&&.sort_lst_bx&&a');
                    if(photos.length>0){
                        d.push({
                            title: '剧照：',
                            col_type: 'rich_text'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }
                    for(var i in photos){
                        d.push({
                            pic_url: parseDomForHtml(photos[i], 'img&&data-src'),
                            url: 'hiker://empty',
                            col_type: 'pic_1_full'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }
                }catch(e){};
                setHomeResult(d);
            }, MY_URL): $('hiker://empty#noHistory#').rule(() => {
                setHomeResult([{
                    title: '影片简介：\n' + getMyVar('moviedesc',''),
                    col_type: 'long_text'
                }]);
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/32.svg',
        col_type: 'icon_small_3'
    },
    {
        title: "观影设置",
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                setPageTitle("♥个性化设置");
                var d = [];
                var cfgfile = "hiker://files/rules/Src/Juying/config.json";
                var Juyingcfg=fetch(cfgfile);
                if(Juyingcfg != ""){
                    eval("var JYconfig=" + Juyingcfg+ ";");
                }else{
                    var JYconfig= {};
                }

                d.push({
                    title: '功能开关',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: JYconfig['printlog']==1?'打印日志(开)':'打印日志(关)',
                    url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['printlog'] != 1){
                                JYconfig['printlog'] = 1;
                            }else{
                                JYconfig['printlog'] = 0;
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功';
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: JYconfig['cachem3u8']!=0?'m3u8缓存(开)':'m3u8缓存(关)',
                    url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['cachem3u8'] == 0){
                                JYconfig['cachem3u8'] = 1;
                            }else{
                                JYconfig['cachem3u8'] = 0;
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功';
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    col_type: "line"
                });
                if(fileExist('hiker://files/cache/MyParseSet.json')&&fileExist('hiker://files/rules/DuanNian/MyParse.json')){var isDn = 1}else{var isDn = 0};
                d.push({
                    title: isDn==1&&JYconfig['isdn']!=0?'断插辅助(开)':'断插辅助(关)',
                    url: isDn==0?'toast://没有断插？无法开启！':$('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['isdn'] == 0){
                                JYconfig['isdn'] = 1;
                                var sm = "开启断插同步并发解析";
                            }else{
                                JYconfig['isdn'] = 0;
                                var sm = "只走程序自身的解析";
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功：' + sm;
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: isDn==1&&JYconfig['forcedn']==1?'强制断插(开)':'强制断插(关)',
                    url: isDn==0?'toast://没有断插？无法开启！':$('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['forcedn'] != 1){
                                JYconfig['forcedn'] = 1;
                                var sm = "开启强制断插，仅走断插解析";
                            }else{
                                JYconfig['forcedn'] = 0;
                                var sm = "关闭强制断插，程序智能解析";
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功：' + sm;
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: '屏蔽操作',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: '无效播放地址',
                    url: $("","屏蔽无效播放地址\n多数为跳舞小姐姐播放链接").input(()=>{
                            var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                            var recordparse=fetch(recordfile);
                            if(recordparse != ""){
                                eval("var recordlist=" + recordparse+ ";");
                            }else{
                                var recordlist = {};
                            }
                            recordlist['excludeurl'] = recordlist['excludeurl']||[];
                            let url = input.split(';{')[0].replace('file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8##','').replace('#isVideo=true#','');
                            if(recordlist['excludeurl'].indexOf(url)==-1){
                                recordlist['excludeurl'].push(url);
                            }
                            writeFile(recordfile, JSON.stringify(recordlist));
                            return 'toast://屏蔽无效播放地址成功';
                        }),
                    col_type: "text_2"
                });
                var parsefrom = [];
                var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                var recordparse=fetch(recordfile);
                if(recordparse != ""){
                    eval("var recordlist=" + recordparse+ ";");
                    try{
                        for(var key in recordlist.parse){
                            parsefrom.push(key);
                        }
                    }catch(e){ }
                }
                d.push({
                    title: '屏蔽优先解析',
                    url: parsefrom.length==0?'toast://没有优先解析，无需操作':$(parsefrom,3,"选择片源屏蔽优先解析").select(()=>{
                        var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                        var recordparse=fetch(recordfile);
                        eval("var recordlist=" + recordparse+ ";");
                        var parseurl = recordlist.parse[input];
                        var parsename = recordlist.name[input];
                        delete recordlist.parse[input];
                        

                        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                        var datafile = fetch(filepath);
                        if(datafile != ""){
                            eval("var datalist=" + datafile+ ";");
                        }else{
                            var datalist = [];
                        }
                        if(datalist.some(item => item.parse == parseurl)){
                            //私有解析在屏蔽优先时，仅排除片源
                            for(var j=0;j<datalist.length;j++){
                                if(datalist[j].parse==parseurl&&datalist[j].stopfrom.indexOf(input)==-1){
                                    datalist[j].stopfrom[datalist[j].stopfrom.length] = input;
                                }
                                break;
                            }
                            writeFile(filepath, JSON.stringify(datalist));
                            var sm = '私有解析('+parsename+')>排除片源>'+input;
                        }else{
                            //app自带的解析在屏蔽优先时，直接加入黑名单
                            recordlist['excludeparse'] = recordlist['excludeparse']||[];
                            if(recordlist['excludeparse'].indexOf(recordlist.parse[input])==-1){
                                recordlist['excludeparse'].push(recordlist.parse[input]);
                            }
                            var sm = parsename+'>加入全局黑名单';
                        }

                        writeFile(recordfile, JSON.stringify(recordlist));   
                        refreshPage(false);
                        log('已屏蔽'+input+' 优先解析：'+sm);
                        return 'toast://已屏蔽'+input+'优先解析';
                    }),
                    col_type: "text_2"
                });

                d.push({
                    title: '反悔回退',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: '清除拦截记录',
                    url: $(["播放地址","优先解析"],2,"选择需清除记录的项").select(()=>{
                            if(input=="播放地址"){
                                return $("清除拦截跳舞小姐姐视频记录？").confirm(()=>{
                                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                                    var recordparse=fetch(recordfile);
                                    if(recordparse != ""){
                                        eval("var recordlist=" + recordparse+ ";");
                                        recordlist['exclude'] = [];
                                        writeFile(recordfile, JSON.stringify(recordlist));
                                        return 'toast://已清除跳舞小姐姐视频拦截记录';
                                    }else{
                                        return 'toast://无记录';
                                    }
                                })
                            }else if(input=="优先解析"){
                                return $("清除app自带解析拦截黑名单记录？").confirm(()=>{
                                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                                    var recordparse=fetch(recordfile);
                                    if(recordparse != ""){
                                        eval("var recordlist=" + recordparse+ ";");
                                        recordlist['excludeparse'] = [];
                                        writeFile(recordfile, JSON.stringify(recordlist));
                                        refreshPage(false);
                                        return 'toast://已清除app自带解析拦截黑名单记录';
                                    }else{
                                        return 'toast://无记录';
                                    }
                                })
                            }
                            
                            
                        }),
                    col_type: "text_2"
                });
                setHomeResult(d);
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/37.svg',
        col_type: 'icon_small_3'
    },
    {
        title: "更多片源",
        url: !fileExist('hiker://files/rules/Src/Juying/jiekou.json')?"toast://分享页面或没有接口，无法扩展更多片源":getMyVar('moviemore','0')=="0"?$('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖);
            xunmi(name);
        }, MY_PARAMS.name):`#noLoading#@lazyRule=.js:back(false);'hiker://empty'`,
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/25.svg',
        col_type: 'icon_small_3'
    }
]
//版本检测
function Version() {
    var nowVersion = 2.1;//现在版本
    var nowtime = Date.now();
    var oldtime = parseInt(getItem('VersionChecktime','0').replace('time',''));
    if (getVar('SrcJuying-VersionCheck', '0') == '0' && nowtime > (oldtime+6*60*60*1000)) {
        try {
            eval(fetch(config.依赖.match(/https.*\//)[0] + 'SrcTmplVersion.js'))
            if (newVersion.SrcJuying > nowVersion) {
                confirm({
                    title:'发现新版本，是否更新？', 
                    content:nowVersion+'=>'+newVersion.SrcJuying+'\n'+newVersion.SrcJuyingdesc[eval(newVersion.SrcJuying)], 
                    confirm:`deleteCache();refreshPage();`, 
                    cancel:''
                })
                log('检测到新版本！\nV'+newVersion.SrcJuying+'版本》'+newVersion.SrcJuyingdesc[eval(newVersion.SrcJuying)]);
            }
            putVar('SrcJuying-Version', '-V'+newVersion.SrcJuying);
        } catch (e) { }
        putVar('SrcJuying-VersionCheck', '1');
        setItem('VersionChecktime',nowtime+"time");
    }else{
        putVar('SrcJuying-Version', '-V'+nowVersion);
    }
}