//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
var cfgfile = "hiker://files/rules/Src/Juying/config.json";
var Juyingcfg=fetch(cfgfile);
if(Juyingcfg != ""){
    eval("var JYconfig=" + Juyingcfg+ ";");
}else{
    var JYconfig= {};
}

let yijimenu = [
    {
        title: "管理",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                SRCSet();
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/more/129.png',
        col_type: 'icon_5'
    },
    {
        title: JYconfig['recordentry']!=2?"历史":"收藏",
        url: JYconfig['recordentry']!=2?"hiker://history":"hiker://collection",
        pic_url: 'https://lanmeiguojiang.com/tubiao/more/109.png',
        col_type: 'icon_5',
        extra: {
            id: "lishishoucang",
            longClick: [{
                title: "切换为历史按钮",
                js: $.toString((JYconfig,cfgfile) => {
                    updateItem("lishishoucang", {
                        title: "历史",
                        url: "hiker://history"
                    });
                    JYconfig['recordentry'] = 1;
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    return "toast://已切换按钮为历史"
                },JYconfig,cfgfile)
            }, {
                title: "切换为收藏按钮",
                js: $.toString((JYconfig,cfgfile) => {
                    updateItem("lishishoucang", {
                        title: "收藏",
                        url: "hiker://collection"
                    });
                    JYconfig['recordentry'] = 2;
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    return "toast://已切换按钮为收藏"
                },JYconfig,cfgfile)
            }]
        }
    },
    {
        title: "搜索",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                require(config.依赖);
                sousuo2();
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/more/101.png',
        col_type: 'icon_5',
        extra: {
            longClick: [{
                title: "🔍切换为"+(getItem('searchmode')=="hiker"?"聚合搜索":"视界搜索"),
                js: $.toString(() => {
                    if(getItem('searchmode')=="hiker"){
                        clearItem('searchmode');
                    }else{
                        setItem('searchmode','hiker');
                    }
                    refreshPage(false);
                    return "toast://已切换";
                })
            },{
                title: "📑"+(getItem('searchrecordide')=='1'?"关闭":"开启")+"搜索记录",
                js: $.toString(() => {
                    if(getItem('searchrecordide')=='1'){
                        clearItem('searchrecordide');
                    }else{
                        setItem('searchrecordide','1');
                    }
                    refreshPage(false);
                    return "toast://已切换"
                })
            },{
                title: "🍭搜索模式："+(typeof(getSearchMode)!="undefined"&&getSearchMode()==1?"精准":"默认"),
                js: $.toString(() => {
                    try{
                        if(getSearchMode()==1){
                            setSearchMode(0);
                        }else{
                            setSearchMode(1);
                        }
                        refreshPage(false);
                        return "toast://已切换";
                    }catch(e){
                        return "toast://软件版本过低，不支持此方法";
                    }
                })
            }]
        }
    },
    {
        title: getItem('zhanshibutton')=="history"?"历史":"展示",
        url: getItem('zhanshibutton')=="history"?"hiker://history":$("hiker://empty##fypage#noRecordHistory##noHistory#").rule(() => {
                require(config.依赖);
                jiekouyiji();
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/more/105.png',
        col_type: 'icon_5',
        extra: {
            id: "zhanshibutton",
            longClick: [{
                title: "切换按钮功能",
                js: $.toString(() => {
                    if(getItem('zhanshibutton')=="history"){
                        clearItem('zhanshibutton');
                        updateItem("zhanshibutton", {
                            title: "展示",
                            url: $("hiker://empty##fypage#noRecordHistory##noHistory#").rule(() => {
                                require(config.依赖);
                                jiekouyiji();
                            })
                        });
                    }else{
                        setItem('zhanshibutton','history');
                        updateItem("zhanshibutton", {
                            title: "历史",
                            url: "hiker://history"
                        });
                    }
                    return "toast://已切换"
                },JYconfig,cfgfile)
            }]
        }
    },
    {
        title: "直播",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                Live();
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/more/87.png',
        col_type: 'icon_5'
    },
    {
        col_type: 'line'
    }
]
function JYsousuo(){
    let datasource = getItem('JYdatasource', 'sougou');
    var d = [];
    if(!/^hiker/.test(MY_URL)){
        var html = getResCode();
        datasource = 'sougou';
    }else{
        let wd = MY_URL.split('##')[1];
        let page = MY_URL.split('##')[2];
        MY_URL = datasource=='sougou'?('https://v.sogou.com/v?query='+wd+'&typemask=6&p=&dp=&dr=&_asf=v.sogou.com&enter=1&ie=utf8'):('https://api.so.360kan.com/index?force_v=1&kw='+wd+'&pageno='+page+'&v_ap=1&tab=all');
        if((datasource=='sougou'&&page==1)||datasource=='360'){
            var html = request(MY_URL, { headers: { 'User-Agent': PC_UA } });
        }else{
            var html = "";
        }
    }
    try {
        var list = datasource=='sougou'?JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).result.longVideo.results:JSON.parse(html).data.longData.rows;
        list.forEach(item => {
            try{
                d.push({
                    title: datasource=='sougou'?item.name.replace(/|/g,''):item.titleTxt,
                    url: 'hiker://empty##'+(datasource=='sougou'?('https://v.sogou.com' + item.tiny_url):('https://api.web.360kan.com/v1/detail?cat=' + item.cat_id + '&id=' + item.en_id)) + '#immersiveTheme##autoCache#',
                    desc: datasource=='sougou'?item.list_category.join(','):(item.year+','+item.area+','+(item.coverInfo.txt||item.tag)),
                    content: datasource=='sougou'?item.introduction:item.description,
                    img: datasource=='sougou'?(item.v_picurl + '@Referer='):(item.cover + '@Referer='),
                    extra: {
                        pic: datasource=='sougou'?item.v_picurl:item.cover,
                        name: datasource=='sougou'?item.name.replace(/|/g,''):item.titleTxt,
                        datasource: getItem('JYdatasource', 'sougou')
                    }
                })
            }catch(e){}
        })
    } catch (e) { }
    setResult(d);
}
function JYerji(){
    let datasource = MY_PARAMS.datasource||getItem('JYdatasource', 'sougou');
    MY_URL = MY_URL.replace('#immersiveTheme##autoCache#','').split('##')[1];

    //取之前足迹记录，用于自动定位之前的线路
    try {
        eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
        if (SrcMark != "") {
            if (SrcMark.route[MY_URL] != undefined) {
                var SrcMarkline = SrcMark.route[MY_URL];
                putMyVar(MY_URL, SrcMarkline);
            }
        }
    } catch (e) { }
    var Marksum = 30;//设置记录线路足迹数量

    var lineindex = getMyVar(MY_URL, typeof(SrcMarkline) != "undefined"?SrcMarkline:'0');
    var d = [];
    var html = request(MY_URL, { headers: { 'User-Agent': PC_UA } });

    let json = datasource=="sougou"?JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).detail.itemData:JSON.parse(html).data;
    let plays = datasource=="sougou"?json.play.item_list:[];
    let shows = datasource=="sougou"?json.play_from_open_index:'';
    let actor = datasource=="sougou"?(json.starring?'主演：'+json.starring : json.emcee?'主持：'+json.emcee:'内详'):(json.actor?'主演：'+json.actor:'内详');
    let director = json.director?'导演：'+json.director : datasource=="sougou"&&json.tv_station?json.tv_station:'内详';
    let area = datasource=="sougou"?(json.zone?'地区：'+json.zone:''):(json.area?'地区：'+json.area:'');
    let year = datasource=="sougou"&&json.year?'   年代：' + json.year:'';
    let remarks = datasource=="sougou"?(json.style ? json.style : ''):json.moviecategory;
    let pubdate = datasource=="sougou"?(json.update_wordstr ? json.update_wordstr : ''):json.pubdate;   

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
    if(datasource=="360"){
        var desc = json.description;
        putMyVar('moviedesc',desc);
    }
    //二级统一菜单
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
    for(var i in erjimenu){
        d.push(
            erjimenu[i]
        )
    }

    var tabs = [];
    var lists = [];
    if(datasource=='sougou'){
        for (var i in plays) {
            lists.push(plays[i].info);
            tabs.push(plays[i].sitename[0]);
        }
    }else{
        let sitelist = json.allupinfo;
        let playlist = [];
        tabs = json.playlink_sites;
        for(let i in tabs){
            let sitename = tabs[i];
            if(json.allepidetail){
                if(parseInt(lineindex)==i){
                    let urllist = [];
                    let listlength = sitelist[sitename];
                    let onenum = 50;
                    let fornum = Math.ceil(listlength/onenum);
                    for(let j=0;j<fornum;j++){
                        let start = 1 + (onenum * j);
                        let end = onenum + (onenum * j);
                        if(end>listlength){end = listlength;}
                        try{
                            for(let k=0;k<3;k++){
                                var getjson = JSON.parse(request(MY_URL+'&start='+start+'&end='+end+'&site='+sitename, { headers: { 'User-Agent': PC_UA } })).data;
                                if(getjson==null){
                                    end--;
                                }else{
                                    break;
                                }
                            }
                            let forlist = getjson.allepidetail[sitename];
                            forlist = forlist.map(item=>{
                                return item.playlink_num+'$'+item.url;
                            })
                            urllist = urllist.concat(forlist);
                        }catch(e){
                        }
                    }
                    lists.push(urllist);
                }else{
                    lists.push([]);
                }
                var isline = 1;
            }else if(json.defaultepisode){
                if(parseInt(lineindex)==i){
                    if(i==0){
                        var urllist = json.defaultepisode;
                    }else{
                         try {
                            var getjson = JSON.parse(request(MY_URL + '&start=1&end=' + (json.upinfo > 200 ? 200 : json.upinfo) + '&year=' + tag + '&site=' + sitename, { headers: { 'User-Agent': PC_UA } })).data;
                         }catch(e){
                             var getjson = JSON.parse(request(MY_URL+'&site='+sitename, { headers: { 'User-Agent': PC_UA } })).data;
                         }
                        var urllist = getjson.defaultepisode;
                    }
                    urllist = urllist.map(item=>{
                        return item.period+'$'+item.url;
                    })
                    lists.push(urllist);
                }else{
                    lists.push([]);
                }
                var isline = 1;
            }else{
                let urllist = json.playlinksdetail[sitename];
                urllist = sitename+'$'+urllist.default_url
                playlist.push(urllist);
                var isline = 0;
            }
        }
        if(isline==0){
            lists.push(playlist);
            if(getItem('enabledpush', '') == '1'){
                tabs = [];
                isline = 1;
            }
        }
    }
    
    //线路部份
    var Color1 = getItem('SrcJy$linecolor1','#09c11b')||'#09c11b';
    var Color2 = getItem('SrcJy$linecolor2','');
    var Color3 = getItem('SrcJy$playcolor','');
    function getHead(title,Color,strong) {
        if(Color){
            if(strong){
                return '‘‘’’<strong><font color="' + Color + '">' + title + '</front></strong>';
            }else{
                return '‘‘’’<font color="' + Color + '">' + title + '</front>';
            }
        }else{
            return title;
        }
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
                    title: getMyVar(vari, '0') == i ? getHead(tabs[i],Color1,1) : getHead(tabs[i],Color2),
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
        //推送tvbox
        if(getItem('enabledpush', '') == '1' && datasource == "360"){
            let push = {
                "name": MY_PARAMS.name||'聚影',
                "pic": pic.split('@')[0],
                "content": desc,
                "director": details1.split('\n')[0].replace('导演：',''),
                "actor": details1.split('主演：')[1].split('\n')[0],
                "from": tabs.length>0?tabs[lineindex]:'360'
            };
            let tvip = getItem('hikertvboxset', '');
            d.push({
                title: '推送至TVBOX',
                url: $("#noLoading#").lazyRule((push,lists,tvip) => {
                    if(tvip==""){
                        return 'toast://观影设置中设置TVBOX接收端ip地址，完成后回来刷新一下';
                    }
                    let urls = [];
                    for(let i in lists){
                        let list = lists[i];
                        if (getMyVar('shsort') == '1') {
                            list = list.reverse();
                        }
                        if(list.length>0){
                            urls.push(list.join('#').replace(/\&/g, '＆＆'));
                        }
                    }

                    if(urls.length>0){
                        push['url'] = urls.join('$$$');
                        var state = request(tvip + '/action', {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                                //'X-Requested-With': 'XMLHttpRequest',
                                'Referer': tvip
                            },
                            timeout: 2000,
                            body: 'do=push&url=' + JSON.stringify(push),
                            method: 'POST'
                        });
                        //log(push);
                        //log(state);
                        if (state == 'ok') {
                            return 'toast://推送成功，如果tvbox显示“没找到数据”可能是该链接需要密码或者当前的jar不支持。';
                        } else {
                            return 'toast://推送失败'
                        }
                    }
                    return 'toast://所有线路均不支持推送列表';
                }, push, lists, tvip),
                col_type: 'scroll_button'
            })
        }
    }

    try{
        var playsinfo = datasource=='sougou'?plays[0].info:isline;
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
    var easy = datasource=="sougou"?$("").lazyRule(() => {
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
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
            return SrcParseS.聚影(input);
        }catch(e){
            return input;
        }
    }):$("").lazyRule(() => {
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
        return SrcParseS.聚影(input);
    });
    if(!getMyVar('superwebM3U8')){
        try{
            var cfgfile = "hiker://files/rules/Src/Juying/config.json";
            var Juyingcfg=fetch(cfgfile);
            if(Juyingcfg != ""){
                eval("var JYconfig=" + Juyingcfg+ ";");
            }
            putMyVar('superwebM3U8',JYconfig.cachem3u8!=0&&JYconfig.superweb==1?'1':'0');
        }catch(e){}
    }
    var block = ['.m4a','.mp3','.gif','.jpg','.jpeg','.png','.ico','hm.baidu.com','/ads/*.js'];
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
                    list = list.reverse();
                }
                try {
                    let listonename = datasource=="sougou"?list[0].index:list[0].split('$')[0];
                    for (var j = 0; j < list.length; j++) {
                        let name = datasource=="sougou"?list[j].index:list[j].split('$')[0];
                        let url = datasource=="sougou"?'https://v.sogou.com' + list[j].url:list[j].split('$')[1];
                        let urlid = datasource=="sougou"?MY_URL+j:url;
                        if (name != '0') {
                            d.push({
                                title: getHead(name + '', Color3),
                                url: url + easy,
                                extra: { id: urlid, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')=="1"?true:false, blockRules: block },
                                col_type: listonename.length>6?'text_2':'text_4'
                            });
                        }
                    }
                } catch (e) {
                    nolist();
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
                    title: getHead("第" + arr[k] + "期", Color3),
                    col_type: "text_2",
                    url: url + easy,
                    extra: { id: MY_URL+k, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')=="1"?true:false, blockRules: block  }
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
                    extra: { id: MY_URL, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')=="1"?true:false, blockRules: block },
                })
            }
        }
    }
    setLists(lists, lineindex);

    //底部说明
    d.push({
        desc: '‘‘’’<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1'
    });
    setResult(d);
}
function JYyiji(){    
    let datasource = getItem('JYdatasource', 'sougou');
    var d = [];
    const Color = "#3399cc";
    const categorys = datasource=="sougou"?['电视剧','电影','动漫','综艺','纪录片']:['电视剧','电影','动漫','综艺'];
    const listTabs = datasource=="sougou"?['teleplay','film','cartoon','tvshow','documentary']:['2','1','4','3'];//['/dianshi/list','/dianying/list','/dongman/list','/zongyi/list'];
    const fold = getMyVar('SrcJuying$fold', "0");
    const 类型 = getMyVar('SrcJuying$类型', '');
    const 地区 = getMyVar('SrcJuying$地区', '');
    const 年代 = getMyVar('SrcJuying$年代', '');
    const 资源 = getMyVar('SrcJuying$资源', '');
    const 明星 = getMyVar('SrcJuying$明星', '');
    const 排序 = getMyVar('SrcJuying$排序', '');
    if(datasource=="sougou"){
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
    }else{
        MY_URL = "https://api.web.360kan.com/v1/filter/list?catid=" + getMyVar('SrcJuying$listTab', '2') + "&size=36&pageno=" + MY_PAGE;
        if(排序 != ""){
            MY_URL = MY_URL + "&rank=" + 排序;
        }
        if(类型 != ""){
            MY_URL = MY_URL + "&cat=" + 类型;
        }
        if(地区 != ""){
            MY_URL = MY_URL + "&area=" + 地区;
        }
        if(年代 != ""){
            MY_URL = MY_URL + "&year=" + 年代;
        }
        if(明星 != ""){
            MY_URL = MY_URL + "&act=" + 明星;
        }
    }

    if(MY_PAGE==1){
        for(var i in yijimenu){
            d.push(
                yijimenu[i]
            )
        }
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        d.push({
            title: fold === '1' ? '““””<b><span style="color: #F54343">∨</span></b>' : '““””<b><span style="color:' + Color + '">∧</span></b>',
            url: $('#noLoading#').lazyRule((fold) => {
                putMyVar('SrcJuying$fold', fold === '1' ? '0' : '1');
                refreshPage(false);
                return "hiker://empty";
            }, fold),
            col_type: 'scroll_button',
        })
        for (var i in categorys) {
            d.push({
                title: getMyVar('SrcJuying$listTab', '2'||'teleplay') === listTabs[i] ? '““””<b><span style="color:' + Color + '">' + categorys[i] + '</span></b>' : categorys[i],
                url: $('#noLoading#').lazyRule((listTab) => {
                        putMyVar('SrcJuying$listTab', listTab);
                        clearMyVar('SrcJuying$类型');
                        clearMyVar('SrcJuying$地区');
                        clearMyVar('SrcJuying$年代');
                        clearMyVar('SrcJuying$资源');
                        clearMyVar('SrcJuying$明星');
                        clearMyVar('SrcJuying$排序');
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
            if(datasource=="sougou"){
                let filter = html.listData.list.filter_list;
                for (let i in filter) {
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
                    for (let j in option_list) {
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
            }else{
                try{
                    let filterjs = fetchCache('https://s.ssl.qhres2.com/static/3deb65e2c118233e.js',360,{timeout:2000});
                    let filters = filterjs.split(`defaultId:"rankhot"},`);//filterjs.match(/defaultId:\"rankhot\"\},(.*?),o=i/)[1];
                    filters.splice(0,1);
                    filters = filters.map(item=>{
                        return '['+(item.split(',o=i')[0].split(',r=i')[0])
                    })
                    let filterstr = filters[listTabs.indexOf(getMyVar('SrcJuying$listTab', '2'))];
                    if(getMyVar('SrcJuying$listTab', '2')=='1' || getMyVar('SrcJuying$listTab', '2')=='2'){
                        eval('var acts = ' + filterstr.split(',d=')[1]);
                        filterstr = filterstr.split(',d=')[0];
                    }
                    eval('var filter = ' + filterstr);
                }catch(e){
                    log(e.message);
                    var filter = [];
                }

                for(let i in filter){
                    let option_list = filter[i].data;
                    for (let j in option_list) {
                        let optionname = option_list[j].id?option_list[j].id:option_list[j].title;
                        d.push({
                            title: getMyVar('SrcJuying$'+filter[i].label, '全部')==optionname?'““””<span style="color:red">'+(optionname=="lt_year"?"更早":optionname)+'</span>':(optionname=="lt_year"?"更早":optionname),
                            url: $('#noLoading#').lazyRule((name,option) => {
                                    if(option==''){
                                        clearMyVar('SrcJuying$'+name); 
                                    }else{
                                        putMyVar('SrcJuying$'+name, option);
                                    }
                                    refreshPage(false);
                                    return "hiker://empty";
                                }, filter[i].label, option_list[j].id),
                            col_type: 'scroll_button'
                        });
                    }

                    if(typeof(acts) != "undefined" && filter[i].label=='明星'){
                        let act = acts[getMyVar('SrcJuying$地区', '全部')]||acts['中国'+getMyVar('SrcJuying$地区', '全部')]||acts['全部'];
                        act.forEach(item => {
                            if($.type(item)!='string'){
                                item = item.id;
                            }
                            d.push({
                                title: getMyVar('SrcJuying$明星', '全部')==item?'““””<span style="color:red">'+item+'</span>':item,
                                url: $('#noLoading#').lazyRule((option) => {
                                        if(option==''){
                                            clearMyVar('SrcJuying$明星'); 
                                        }else{
                                            putMyVar('SrcJuying$明星', option);
                                        }
                                        refreshPage(false);
                                        return "hiker://empty";
                                    }, item),
                                col_type: 'scroll_button'
                            });
                        })
                    }
                    d.push({
                        col_type: "blank_block"
                    });
                }

                let ranks = [{title:"最近热映",id:"rankhot"},{title:"最近上映",id:"ranklatest"},{title:"最受好评",id:"rankpoint"}];
                for (let i in ranks) {
                    if(i<2||(getMyVar('SrcJuying$listTab', '2')=='1' || getMyVar('SrcJuying$listTab', '2')=='2')){
                        d.push({
                            title: getMyVar('SrcJuying$排序', 'rankhot')==ranks[i].id?'““””<span style="color:red">'+ranks[i].title+'</span>':ranks[i].title,
                            url: $('#noLoading#').lazyRule((id) => {
                                    putMyVar('SrcJuying$排序', id);
                                    refreshPage(false);
                                    return "hiker://empty";
                                }, ranks[i].id),
                            col_type: 'scroll_button'
                        });
                    }
                    
                }
            }
        }
    }else{
        var html = JSON.parse(request(MY_URL));
    }
    var seachurl = $('').lazyRule(() => {
        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
            xunmi(name);
        }, input);
    });

    if(datasource=="sougou"){
        var list = html.listData.results;
        for (var i in list) {
            d.push({
                title: list[i].name,
                img: list[i].v_picurl + '@Referer=',
                url: JYconfig['erjimode']!=2?"hiker://empty##https://v.sogou.com" + list[i].url.replace('teleplay', 'series').replace('cartoon', 'series') + "#immersiveTheme##autoCache#":list[i].name + seachurl,
                desc: list[i].ipad_play_for_list.finish_episode?list[i].ipad_play_for_list.episode==list[i].ipad_play_for_list.finish_episode?"全集"+list[i].ipad_play_for_list.finish_episode:"连载"+list[i].ipad_play_for_list.episode+"/"+list[i].ipad_play_for_list.finish_episode:"",
                extra: {
                    pic: list[i].v_picurl,
                    name: list[i].name,
                    datasource: getItem('JYdatasource', 'sougou'),
                    longClick: [{
                        title: "🔍快速聚搜",
                        js: $.toString((name) => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                xunmi(name);
                            }, name)
                        },list[i].name)
                    }]
                }
            });
        }
    }else{
        var list = html.data?html.data.movies:[];
        for (var i in list) {
            let img = /^http/.test(list[i].cdncover)?list[i].cdncover:'https:'+list[i].cdncover;
            d.push({
                title: list[i].title,
                img: img + '@Referer=',
                url: JYconfig['erjimode']!=2?"hiker://empty##https://api.web.360kan.com/v1/detail?cat="+getMyVar('SrcJuying$listTab', '2')+"&id=" + list[i].id + "#immersiveTheme##autoCache#":list[i].title + seachurl,
                desc: list[i].total?list[i].total==list[i].upinfo?list[i].total+'集全':'连载'+list[i].upinfo+"/"+list[i].total:list[i].tag?list[i].tag:list[i].doubanscore?list[i].doubanscore:"",
                extra: {
                    pic: img,
                    name: list[i].title,
                    datasource: getItem('JYdatasource', 'sougou'),
                    longClick: [{
                        title: "🔍快速聚搜",
                        js: $.toString((name) => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                xunmi(name);
                            }, name)
                        },list[i].title)
                    }]
                }
            });
        }
    }
    setResult(d);
}