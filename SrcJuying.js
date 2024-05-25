// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');//加载公共文件
// 搜索逻辑代码
function search(name, sstype, jkdata) {
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
    let ssdata = getSsData(name, jkdata);
    if(sstype=='hkjusou'){
        ssdata = ssdata.map(it => {
            return {
                title: it.vodname,
                desc: it.voddesc,
                content: it.vodcontent,
                pic_url: it.vodpic,
                url: $("hiker://empty#immersiveTheme##autoCache#").rule(() => {
                    require(config.依赖);
                    dianboerji()
                }),
                extra: {
                    url: it.vodurl,
                    pic: it.vodpic,
                    pageTitle: it.vodname,
                    data: jkdata
                }
            }
        })
        return ssdata;
    }

}
// 软件搜索
function sousuo() {
    let k = MY_URL.split('##')[1];
    let name,surl;
    if(k.includes('||')){
        name = k.split('||')[0].trim();
        surl = k.split('||')[1];
    }else{
        name = k.trim();
    }
    setResult([{
        title: "视界聚搜",
        url: "hiker://search?s=" + name,
        extra: {
            delegateOnlySearch: true,
            rules: $.toString((name,surl) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                let datalist = getDatas('jk');
                let yxdatalist = datalist.filter(it=>{
                    return !it.stop;
                });
                if(surl){
                    yxdatalist = yxdatalist.filter(it=>{
                        return it.url==surl;
                    });
                }

                let data = [];
                yxdatalist.forEach(it=>{
                    data.push({
                        "title": it.name,
                        "search_url": "hiker://empty##fypage",
                        "searchFind": `js: require(config.依赖); let d = search('` + name + `', 'hkjusou' ,` + JSON.stringify(it) + `); setResult(d);`
                    });
                })
                return JSON.stringify(data)
            },name,surl)
        }
    }])
}

// 点播二级
function dianboerji() {
    addListener("onClose", $.toString(() => {

    }));
    let d = [];
    let jkdata = MY_PARAMS.data;
    let name = MY_PARAMS.pageTitle;
    let url = MY_PARAMS.url;
    MY_URL = url;

    let detailsmark;
    let cacheDataFile = 'hiker://files/cache/src/Juying2/Details.json';
    let cacheData = fetch(cacheDataFile);
    if (cacheData != "") {
        try{
            eval("let detailsjson=" + cacheData + ";");
            if(detailsjson.surl==jkdata.url && detailsjson.url==url){
                detailsmark = detailsjson.data;//本地缓存接口+链接对得上则取本地，用于切换排序和样式时加快
            }
        }catch(e){ }
    }
    let erdata;
    if(detailsmark){
        erdata = detailsmark;
    }else{
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
        erdata = getErData(jkdata);
        let markData = {surl: jkdata.url, url: url, data: erdata}
        writeFile(cacheDataFile, JSON.stringify(markData));
    }
    log(erdata);


    let details1 = erdata.details1;
    let details2 = erdata.details2;
    let pic = erdata.pic;
    //海报
    d.push({
        title: details1,//详情1
        desc: details2,//详情2
        pic_url: pic?pic + '@Referer=':'',//图片
        url: pic + '#noHistory#',//链接
        col_type: 'movie_1_vertical_pic_blur',
        extra: {
            gradient: true
        }
    });


    let linecodes = erdata.linecodes;
    
    // 影片标识
    let vodId = name;
    // 线路标识
    let lineId = vodId + '_线路';
    // 线路id
    let lineindex = getMyVar(lineId, '0');
    if(!getMyVar(vodId)){
        //取之前足迹记录，用于自动定位之前的线路
        try {
            eval('let SrcMark = ' + fetch("hiker://files/cache/src/Juying2/Mark.json"));
            if (SrcMark != "") {
                if (SrcMark.line[lineId]) {
                    putMyVar(lineId, SrcMark.line[lineId]);
                }
            }
        } catch (e) { }
    }
    //设置记录线路足迹的数量
    let Marksum = 30;
    //线路部份
    let Color1 = getItem('SrcJy$linecolor1','#09c11b')||'#09c11b';//#f13b66a
    let Color2 = getItem('SrcJy$linecolor2','');;//#098AC1
    let Color3 = getItem('SrcJy$playcolor','');
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
    for (let i = 0; i < 9; i++) {
        d.push({
            col_type: "blank_block"
        })
    }

    function setTabs(tabs, lineId) {
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
                if(getMyVar(lineId, '0') == i){putMyVar('linecode', linecodes[i])};
                d.push({
                    title: getMyVar(lineId, '0') == i ? getHead(tabs[i],Color1,1) : getHead(tabs[i],Color2),
                    url: $("#noLoading#").lazyRule((lineId, i, Marksum) => {
                        if (parseInt(getMyVar(lineId, '0')) != i) {
                            let markFile = 'hiker://files/cache/src/Juying2/Mark.json';
                            let SrcMark = "";
                            try {
                                eval('SrcMark = ' + markFile);
                            } catch (e) {  }
                            if (SrcMark == "") {
                                SrcMark = { lineid: {} };
                            } else if (!SrcMark.line) {
                                SrcMark.line = {};
                            }
                            SrcMark.line[lineId] = i;
                            let key = 0;
                            let one = "";
                            for (var k in SrcMark.line) {
                                key++;
                                if (key == 1) { one = k }
                            }
                            if (key > Marksum) { delete SrcMark.line[one]; }
                            writeFile(markFile, JSON.stringify(SrcMark));
                            putMyVar(lineId, i);
                            refreshPage(false);
                        }
                        return '#noHistory#hiker://empty'
                    }, lineId, i, Marksum),
                    col_type: 'scroll_button'
                })
            }
        }
    }
    setTabs(erdata.tabs, lineId);
    log(erdata.tabs);
    //选集部份
    function setLists(lists, index) {
        let type = jkdata.type;
        let list = lists[index] || [];
        function playlist(lx, col_type) {//定义选集列表生成
            if (lx == '1') {
                let playtitle = list[j].split('$')[0].trim();
                let playurl = list[j].split('$')[1].trim();
                if (/v1|app|v2|iptv|cms/.test(type)) {
                    var DTJX = $("").lazyRule(() => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcParseS.js');
                        return SrcParseS.聚影(input);
                    });
                }else if (/xpath|biubiu|XBPQ/.test(type)) {
                    if(/\.mp4|\.m3u8/.test(playurl) || (/qq\.com|douyin|youku|mgtv|ixigua|bili|iqiyi|sohu|pptv|migu|1905|le\.com/.test(playurl) && /html/.test(playurl))){
                        var DTJX = $("").lazyRule(() => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcParseS.js');
                            return SrcParseS.聚影(input);
                        });
                    }else if(playurl.indexOf('https://www.aliyundrive.com/s/')>-1){
                        var DTJX = $("").lazyRule((input) => {
                            input = input.replace('http','\nhttp');
                            return $("hiker://empty##fypage#noRecordHistory##noHistory#").rule((input) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                                aliShareUrl(input);
                            },input);
                        },playurl);
                    }else{
                        var DTJX = $("").lazyRule(() => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcParseS.js');
                            return SrcParseS.task({},input);
                        });
                    }
                }else{
                    //网页
                }

                let extra = {
                    id: playurl,
                    jsLoadingInject: true,
                    blockRules: ['.m4a', '.mp3', '.gif', '.jpeg', '.jpg', '.ico', '.png', 'hm.baidu.com', '/ads/*.js', 'cnzz.com'],
                    videoExcludeRule: ['m3u8.js','?url='],
                    cls: "loadlist"
                }
                
                if(!/qq|youku|mgtv|bili|qiyi|sohu|pptv/.test(playurl) && /html/.test(playurl)){
                    extra.referer = playurl;
                }
                if(getMyVar('superwebM3U8') == "1"){
                    extra.cacheM3u8 = true;
                }

                d.push({
                    title: getHead(playtitle.replace(/第|集|话|期|-|new|最新|新/g, ''), Color3),
                    url: playurl + DTJX,
                    extra: extra,
                    col_type: col_type
                });
            } else {
                d.push({
                    title: '当前无播放选集，点更多片源试试！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                });
            }

        }
        if (list.length == 0) {
            playlist('0');
        } else {
            try{
                let list1 = list[0].split('$')[0];
                let list2 = list[list.length-1].split('$')[0];
                if(parseInt(list1.match(/(\d+)/)[0])>parseInt(list2.match(/(\d+)/)[0])){
                    list.reverse();
                }
            }catch(e){
                //log('修正选集顺序失败>'+e.message)
            }
            let listone = list[0].split('$')[0].trim();
            let len = listone.length;
            let col_type = list.length > 4 && len < 7 ? 'text_4' : len > 20 ? 'text_1' :'text_3';
            if (getMyVar('shsort') == '1') {
                try {
                    for (var j = list.length - 1; j >= 0; j--) {
                        playlist('1', col_type);
                    }
                } catch (e) {
                    playlist('0');
                }
            } else {
                try {
                    for (var j = 0; j < list.length; j++) {
                        playlist('1', col_type);
                    }
                } catch (e) {
                    playlist('0');
                }

            }
        }
    }
    setLists(erdata.lists, lineindex);

    //底部说明
    d.push({
        desc: '‘‘’’<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1',
        extra: {
            id: "listloading",
            lineVisible: false
        }
    });
    setResult(d);
}

//点播一级
function dianboyiji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('动态加载loading');
    }));
    let d = [];
    let datalist = getDatas('jk');
    let yxdatalist = datalist.filter(it=>{
        return !it.stop;
    });
    let indexSource = Juconfig['indexSource'] || '_';
    let sourceType = indexSource.split('_')[0];
    let sourceNmae = indexSource.split('_')[1];
    let index = yxdatalist.indexOf(yxdatalist.filter(d => (d.group==sourceType || d.type==sourceType) && d.name==sourceNmae )[0]);
    let sourceData = yxdatalist[index] || {};
    let selectGroup = sourceData.group || sourceData.type;
    if(!selectGroup){
        sourceType = '';
        sourceNmae = '';
    }

    if(MY_PAGE==1){
        let groupNames = getJiekouGroups(yxdatalist);
        groupNames.forEach(it =>{
            let obj = {
                title: selectGroup==it?`““””<b><span style="color: #3399cc">`+it+`</span></b>`:it,
                url: $('#noLoading#').lazyRule((it) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                    return selectSource(it);
                }, it),
                col_type: 'scroll_button'
            }
             obj.extra = {
                longClick: [{
                    title: "快速筛选",
                    js: $.toString((it) => {
                        return $("","筛选“"+it+"”分组中指定源").input((it)=>{
                            if(input==""){
                                return 'hiker://empty';
                            }
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                            return selectSource(it, input);
                        }, it)
                    }, it)
                }]
            }
            
            d.push(obj);
        })
        d.push({
            col_type: "line_blank"
        });
        for (let i = 0; i < 9; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        if(!sourceNmae){
            d.push({
                title: "主页源不存在\n需先选择配置主页源",//\n设置-选择漫画/小说/听书/
                desc: "点上面分类按钮皆可选择",//设置长按菜单可以开启界面切换开关
                url: 'toast://点上面分类按钮',
                col_type: "text_center_1",
                extra: {
                    lineVisible: false
                }
            })
        }else{
            setPageTitle(indexSource);
            if (typeof(setPreResult)!="undefined" && getMyVar('动态加载loading')!='1') {
                d.push({
                    title: "",
                    url: "hiker://empty",
                    col_type: "text_1",
                    extra: {
                        lineVisible: false,
                        cls: "loading_gif"
                    }
                })
                d.push({
                    pic_url: "https://hikerfans.com/weisyr/img/Loading1.gif",
                    col_type: "pic_1_center",
                    url: "hiker://empty",
                    extra: {
                        cls: "loading_gif"
                    }
                })
                setPreResult(d);
                d = [];
                putMyVar('动态加载loading', '1');
            }
        }
    }
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
    d = d.concat(getYiData(sourceData));
    deleteItemByCls("loading_gif");
    setResult(d);
}

//一级
function yiji() {
    /*
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
    */
    
    
    if(getMyVar('SrcJuying-VersionCheck', '0') == '0'){
        let programversion = 0;
        try{
            programversion = $.require("config").version || MY_RULE.version || 0;
        }catch(e){}
        if(programversion<11){
            confirm({
                title: "温馨提示",
                content: "发现小程序新版本",
                confirm: $.toString(() => {
                    return "海阔视界首页频道规则【聚影√】￥home_rule_url￥http://hiker.nokia.press/hikerule/rulelist.json?id=6629"
                }),
                cancel: $.toString(() => {
                    return "toast://不升级小程序，功能不全或有异常"
                })
            });
        }
        Version();
        downloadicon();//下载图标
    }

    let d = [];
    if(MY_PAGE==1){
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyMenu.js');
        if($.type(storage0.getItem('buttonmenu1'))=="object"){
            setItem('buttonmenu1',storage0.getItem('buttonmenu1').name);
        }
        if($.type(storage0.getItem('buttonmenu2'))=="object"){
            setItem('buttonmenu2',storage0.getItem('buttonmenu2').name);
        }
        if($.type(storage0.getItem('buttonmenu3'))=="object"){
            setItem('buttonmenu3',storage0.getItem('buttonmenu3').name);
        }
        if($.type(storage0.getItem('buttonmenu4'))=="object"){
            setItem('buttonmenu4',storage0.getItem('buttonmenu4').name);
        }
        if($.type(storage0.getItem('buttonmenu5'))=="object"){
            setItem('buttonmenu5',storage0.getItem('buttonmenu5').name);
        }
        let btnmn1 = getItem('buttonmenu1',"管理");
        let btnmn2 = getItem('buttonmenu2',"收藏");
        let btnmn3 = getItem('buttonmenu3',"搜索");
        let btnmn4 = getItem('buttonmenu4',"点播");
        let btnmn5 = getItem('buttonmenu5',"直播");
        let yijimenu = [
            {
                title: btnmn1,
                url: buttonmenu[btnmn1].url,
                pic_url: buttonmenu[btnmn1].img,
                col_type: 'icon_5',
                extra: {
                    id: 'buttonmenu1',
                    longClick: [{
                        title: "♥️管理",
                        js: $.toString(() => {
                            return $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJySet.js');
                                SRCSet();
                            })
                        })
                    },{
                        title: "💠扩展中心",
                        js: $.toString(() => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                                extension();
                            })
                        })
                    },{
                        title: "💡切换按钮",
                        js: $.toString((menubtns) => {
                            return $(menubtns,2,"自定义第1个按钮功能").select(() => {
                                setItem('buttonmenu1',input);
                                refreshPage(false);
                                return 'toast://第1按钮已设置为'+input;
                            })
                        },menubtns)
                    }]
                }
            },
            {
                title: btnmn2,
                url: buttonmenu[btnmn2].url,
                pic_url: buttonmenu[btnmn2].img,
                col_type: 'icon_5',
                extra: {
                    id: 'buttonmenu2',
                    longClick: [{
                        title: "💡切换按钮",
                        js: $.toString((menubtns) => {
                            return $(menubtns,2,"自定义第2个按钮功能").select(() => {
                                setItem('buttonmenu2',input);
                                refreshPage(false);
                                return 'toast://第2按钮已设置为'+input;
                            })
                        },menubtns)
                    }]
                }
            },
            {
                title: btnmn3,
                url: buttonmenu[btnmn3].url,
                pic_url: buttonmenu[btnmn3].img,
                col_type: 'icon_5',
                extra: {
                    id: 'buttonmenu3',
                    longClick: [{
                        title: "💡切换按钮",
                        js: $.toString((menubtns) => {
                            return $(menubtns,2,"自定义第3个按钮功能").select(() => {
                                setItem('buttonmenu3',input);
                                refreshPage(false);
                                return 'toast://第3按钮已设置为'+input;
                            })
                        },menubtns)
                    }]
                }
            },
            {
                title: btnmn4,
                url: buttonmenu[btnmn4].url,
                pic_url: buttonmenu[btnmn4].img,
                col_type: 'icon_5',
                extra: {
                    id: 'buttonmenu4',
                    longClick: [{
                        title: "💡切换按钮",
                        js: $.toString((menubtns) => {
                            return $(menubtns,2,"自定义第4个按钮功能").select(() => {
                                setItem('buttonmenu4',input);
                                refreshPage(false);
                                return 'toast://第4按钮已设置为'+input;
                            })
                        },menubtns)
                    }]
                }
            },
            {
                title: btnmn5,
                url: buttonmenu[btnmn5].url,
                pic_url: buttonmenu[btnmn5].img,
                col_type: 'icon_5',
                extra: {
                    id: 'buttonmenu5',
                    longClick: [{
                        title: "💡切换按钮",
                        js: $.toString((menubtns) => {
                            return $(menubtns,2,"自定义第5个按钮功能").select(() => {
                                setItem('buttonmenu5',input);
                                refreshPage(false);
                                return 'toast://第5按钮已设置为'+input;
                            })
                        },menubtns)
                    }]
                }
            },
            {
                col_type: 'line'
            }
        ]
        yijimenu.forEach((item)=>{
            d.push(item);
        })
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        if (typeof(setPreResult)!="undefined" && getMyVar('动态加载loading')!='1') {
            d.push({
                title: "",
                url: "hiker://empty",
                col_type: "text_1",
                extra: {
                    lineVisible: false,
                    cls: "loading_gif"
                }
            })
            d.push({
                pic_url: "https://hikerfans.com/weisyr/img/Loading1.gif",
                col_type: "pic_1_center",
                url: "hiker://empty",
                extra: {
                    cls: "loading_gif"
                }
            })
            setPreResult(d);
            d = [];
            putMyVar('动态加载loading', '1');
        }
    }
    var searchurl = $('').lazyRule(() => {
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.indexOf(input)>-1){
            recordlist = recordlist.filter((item) => item !== input);
        }
        recordlist.unshift(input);
        if(recordlist.length>20){
            recordlist.splice(recordlist.length-1,1);
        }
        storage0.setItem('searchrecord', recordlist);
        return "hiker://search?rule=" + MY_RULE.title + "&s=" + input;
    });

    d.push({
        title: "搜索",
        url: $.toString((searchurl) => {
            if(input.trim() == ''){
                return "hiker://empty"
            }
            if(/www\.aliyundrive\.com|www\.alipan\.com/.test(input)){
                input = input.replace('http','\nhttp');
                return $("hiker://empty#noRecordHistory##noHistory#").rule((input) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                    aliShareUrl(input);
                },input);
            }else{
                return input + searchurl;
            }
        },searchurl),
        desc: "搜你想看的...",
        col_type: "input",
        extra: {
            titleVisible: true,
            id: "searchinput",
            onChange: $.toString((searchurl) => {
                if(input.indexOf('https://www.aliyundrive.com/s/')==-1){
                    if(input.length==0){deleteItemByCls('suggest');}
                    if(input.length>1&&input!=getMyVar('sousuo$input', '')){
                        putMyVar('sousuo$input', input);
                        deleteItemByCls('suggest');
                        var html = request("https://movie.douban.com/j/subject_suggest?q=" + input, {timeout: 3000});
                        var list = JSON.parse(html)||[];
                        let suggest = list.map((sug)=>{
                            try {
                                let sugitem = {
                                    url: sug.title + searchurl,
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                                if(sug.img!=""){
                                    sugitem.title = sug.title;
                                    sugitem.img = sug.img + '@Referer=https://www.douban.com';
                                    sugitem.desc = "年份：" + sug.year;
                                    sugitem.col_type = "movie_1_vertical_pic";
                                }else{
                                    sugitem.title = "⚡" + sug.title;
                                    sugitem.col_type = "text_1";
                                }
                                return sugitem;
                            } catch (e) {  }
                        });
                        if(suggest.length>0){
                            addItemAfter('searchinput', suggest);
                        }
                    }
                }
            }, searchurl)
        }
    });
    d.push({
        title: "📑"+(getItem('searchrecordide')=='1'?"关闭":"开启")+"记录",
        url: $('#noLoading#').lazyRule(() => {
            if(getItem('searchrecordide')=='1'){
                clearItem('searchrecordide');
            }else{
                setItem('searchrecordide','1');
            }
            refreshPage(false);
            return "toast://已切换"
        }),
        col_type: 'scroll_button'
    });
    d.push({
        col_type: "blank_block"
    });
    if(getItem('searchrecordide','0')=='1'){
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.length>0){
            d.push({
                title: '🗑清空',
                url: $('#noLoading#').lazyRule(() => {
                    clearItem('searchrecord');
                    deleteItemByCls('searchrecord');
                    return "toast://已清空";
                }),
                col_type: 'scroll_button'
            });
        }else{
            d.push({
                title: '↻无记录',
                url: "hiker://empty",
                col_type: 'scroll_button'
            });
        }
        recordlist.forEach(item=>{
            d.push({
                title: item,
                url: item + searchurl,
                col_type: 'scroll_button',
                extra: {
                    cls: 'searchrecord'
                }
            });
        })
    }

    let resoufile = "hiker://files/rules/Src/Juying/resou.json";
    let Juyingresou = fetch(resoufile);
    let JYresou = {};
    if(Juyingresou != ""){
        try{
            eval("JYresou=" + Juyingresou+ ";");
            delete JYresou['resoulist'];
        }catch(e){
            log("加载热搜缓存出错>"+e.message);
        }
    }
    let resoudata = JYresou['data'] || {};
    let fenlei = ["电视剧","电影","动漫","综艺"];
    let fenleiid = ["3","2","5","4"];
    let ids = getMyVar("热榜分类","0");
    let list = resoudata[fenlei[ids]] || [];

    let nowtime = Date.now();
    let oldtime = JYresou.updatetime || 0;
    if(list.length==0 || nowtime > (oldtime+24*60*60*1000)){
        try{
            let html = request("https://api.web.360kan.com/v1/rank?cat="+fenleiid[ids], {timeout: 3000});
            list = JSON.parse(html).data;
            resoudata[fenlei[ids]] = list;
            JYresou['data'] = resoudata;
            JYresou['updatetime'] = nowtime;
            writeFile(resoufile, JSON.stringify(JYresou));
        }catch(e){
            log("获取热搜榜出错>"+e.message);
        }
    }
    d.push({
        title: '<span style="color:#ff6600"><b>\t热搜榜\t\t\t</b></span>',
        desc: '✅'+fenlei[ids],
        url: $(fenlei, 2, '选择热榜分类').select((fenlei) => {
            putMyVar("热榜分类",fenlei.indexOf(input));
            refreshPage(false);
            return "hiker://empty";
        },fenlei),
        pic_url: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'avatar'
    });

    list.forEach((item,i)=>{
        d.push({
            title: (i=="0"?'““””<span style="color:#ff3300">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="1"?'““””<span style="color:#ff6600">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="2"?'““””<span style="color:#ff9900">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:'““””<span>' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title)+'\n<small><span style="color:#00ba99">'+item.comment+'</small>',
            url: item.title + searchurl,
            pic_url: item.cover,
            desc: item.description,
            col_type: "movie_1_vertical_pic"
        });
    })


    deleteItemByCls("loading_gif");
    setResult(d);
}

//搜索页
function sousuo2(d, disk) {
    addListener("onClose", $.toString(() => {
        clearMyVar('sousuo$input');
    }));
    var searchurl = $('').lazyRule((disk) => {
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.indexOf(input)>-1){
            recordlist = recordlist.filter((item) => item !== input);
        }
        recordlist.unshift(input);
        if(recordlist.length>20){
            recordlist.splice(recordlist.length-1,1);
        }
        storage0.setItem('searchrecord', recordlist);
        if(disk){
            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                setPageTitle('云盘搜索 | 聚影√');
                let d = [];
                d.push({
                    title: name+"-云盘聚合搜索",
                    url: "hiker://empty",
                    col_type: "text_center_1",
                    extra: {
                        id: "listloading",
                        lineVisible: false
                    }
                })
                setResult(d);
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                aliDiskSearch(name);
            }, input)
        }else{
            if(getItem('searchmode')=="hiker" || (getItem('searchsource')=="360"||getItem('searchsource')=="搜狗")){
                return "hiker://search?rule=" + MY_RULE.title + "&s=" + input;
            }else{
                return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                    xunmi(name);
                }, input);
            }
        }
    }, disk||0);
    var d = d || [];
    d.push({
        title: "🔍",
        url: $.toString((searchurl) => {
                if(/www\.aliyundrive\.com|www\.alipan\.com/.test(input)){
                    input = input.replace('http','\nhttp');
                    return $("hiker://empty#noRecordHistory##noHistory#").rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                        aliShareUrl(input);
                    },input);
                }else{
                    return input + searchurl;
                }
            },searchurl),
        desc: "搜你想看的...",
        col_type: "input",
        extra: {
            titleVisible: true,
            id: "searchinput",
            onChange: $.toString((searchurl) => {
                if(input.indexOf('https://www.aliyundrive.com/s/')==-1){
                    if(input.length==1){deleteItemByCls('suggest');}
                    if(input.length>1&&input!=getMyVar('sousuo$input', '')){
                        putMyVar('sousuo$input', input);
                        deleteItemByCls('suggest');
                        var html = request("https://movie.douban.com/j/subject_suggest?q=" + input, {timeout: 3000});
                        var list = JSON.parse(html)||[];
                        let suggest = list.map((sug)=>{
                            try {
                                let sugitem = {
                                    url: sug.title + searchurl,
                                    extra: {
                                        cls: 'suggest',
                                        longClick: [{
                                            title: "🔍快速聚搜",
                                            js: $.toString((name) => {
                                                return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                                                    xunmi(name);
                                                }, name)
                                            },sug.title)
                                        },{
                                            title: "🔎云盘搜索",
                                            js: $.toString((name) => {
                                                return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                                    let d = [];
                                                    d.push({
                                                        title: name+"-云盘聚合搜索",
                                                        url: "hiker://empty",
                                                        col_type: "text_center_1",
                                                        extra: {
                                                            id: "listloading",
                                                            lineVisible: false
                                                        }
                                                    })
                                                    setResult(d);
                                                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                                                    aliDiskSearch(name);
                                                }, name)
                                            },sug.title)
                                        },{
                                            title: "🔎Alist搜索",
                                            js: $.toString((name) => {
                                                return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                                    let d = [];
                                                    d.push({
                                                        title: name+"-Alist聚合搜索",
                                                        url: "hiker://empty",
                                                        col_type: "text_center_1",
                                                        extra: {
                                                            id: "listloading",
                                                            lineVisible: false
                                                        }
                                                    })
                                                    setResult(d);
                                                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAlist.js');
                                                    alistSearch2(name,1);
                                                }, name)
                                            },sug.title)
                                        }]
                                    }
                                }
                                if(sug.img!=""){
                                    sugitem.title = sug.title;
                                    sugitem.img = sug.img + '@Referer=https://www.douban.com';
                                    sugitem.desc = "年份：" + sug.year;
                                    sugitem.col_type = "movie_1_vertical_pic";
                                }else{
                                    sugitem.title = "⚡" + sug.title;
                                    sugitem.col_type = "text_1";
                                }
                                return sugitem;
                            } catch (e) {  }
                        });
                        if(suggest.length>0){
                            addItemAfter('searchinput', suggest);
                        }
                    }
                }
            }, searchurl)
        }
    });
    if(!disk){
        d.push({
            title: "♻"+(getItem('searchsource')=="360"?"源：360":getItem('searchsource')=="sougou"?"源：搜狗":"源：接口"),
            url: $(["接口","sougou","360"],1,"选择搜索数据源").select(()=>{
                if(input!="接口"){
                    setItem('searchmode','hiker');
                }
                setItem('searchsource',input);
                refreshPage(false);
                return "toast://已切换"
            }),
            col_type: 'scroll_button'
        });
        d.push({
            title: "💡"+(getItem('searchmode')=="hiker"?"软件层搜索":"新窗口搜索"),
            url: $('#noLoading#').lazyRule(() => {
                if(getItem('searchmode')=='hiker'){
                    clearItem('searchmode');
                    setItem('searchsource',"接口");
                }else{
                    setItem('searchmode','hiker');
                }
                refreshPage(false);
                return "toast://已切换"
            }),
            col_type: 'scroll_button'
        });
    }
    d.push({
        title: "📑"+(getItem('searchrecordide')=='1'?"关闭":"开启")+"记录",
        url: $('#noLoading#').lazyRule(() => {
            if(getItem('searchrecordide')=='1'){
                clearItem('searchrecordide');
            }else{
                setItem('searchrecordide','1');
            }
            refreshPage(false);
            return "toast://已切换"
        }),
        col_type: 'scroll_button'
    });
    if(!disk){
        d.push({
            title: "🍭模式："+(typeof(getSearchMode)!="undefined"&&getSearchMode()==1?"精准":"默认"),
            url: $('#noLoading#').lazyRule(() => {
                try{
                    let sm;
                    if(getSearchMode()==1){
                        setSearchMode(0);
                        sm = "为默认模式，结果包含关键字";
                    }else{
                        setSearchMode(1);
                        sm = "为精准模式，结果等于关键字";
                    }
                    refreshPage(false);
                    return "toast://已切换"+sm;
                }catch(e){
                    return "toast://软件版本过低，不支持此方法";
                }
            }),
            col_type: 'scroll_button'
        });
    }
    d.push({
        col_type: "blank_block"
    });
    if(getItem('searchrecordide','0')=='1'){
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.length>0){
            d.push({
                title: '🗑清空',
                url: $('#noLoading#').lazyRule(() => {
                    clearItem('searchrecord');
                    deleteItemByCls('searchrecord');
                    return "toast://已清空";
                }),
                col_type: 'scroll_button'
            });
        }else{
            d.push({
                title: '↻无记录',
                url: "hiker://empty",
                col_type: 'scroll_button'
            });
        }
        recordlist.forEach(item=>{
            d.push({
                title: item,
                url: item + searchurl,
                col_type: 'scroll_button',
                extra: {
                    cls: 'searchrecord',
                    longClick: [{
                        title: "🔍快速聚搜",
                        js: $.toString((name) => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                                xunmi(name);
                            }, name)
                        },item)
                    },{
                        title: "🔎云盘搜索",
                        js: $.toString((name) => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                let d = [];
                                d.push({
                                    title: name+"-云盘聚合搜索",
                                    url: "hiker://empty",
                                    col_type: "text_center_1",
                                    extra: {
                                        id: "listloading",
                                        lineVisible: false
                                    }
                                })
                                setResult(d);
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                                aliDiskSearch(name);
                            }, name)
                        },item)
                    },{
                        title: "🔎Alist搜索",
                        js: $.toString((name) => {
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                                let d = [];
                                d.push({
                                    title: name+"-Alist聚合搜索",
                                    url: "hiker://empty",
                                    col_type: "text_center_1",
                                    extra: {
                                        id: "listloading",
                                        lineVisible: false
                                    }
                                })
                                setResult(d);
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAlist.js');
                                alistSearch2(name,1);
                            }, name)
                        },item)
                    }]
                }
            });
        })
    }
    
    let resoufile = "hiker://files/rules/Src/Juying/resou.json";
    let Juyingresou = fetch(resoufile);
    let JYresou = {};
    if(Juyingresou != ""){
        try{
            eval("JYresou=" + Juyingresou+ ";");
            delete JYresou['resoulist'];
        }catch(e){
            log("加载热搜缓存出错>"+e.message);
        }
    }
    let resoudata = JYresou['data'] || {};
    let fenlei = ["电视剧","电影","动漫","综艺"];
    let fenleiid = ["3","2","5","4"];
    let ids = getMyVar("热榜分类","0");
    let list = resoudata[fenlei[ids]] || [];

    let nowtime = Date.now();
    let oldtime = JYresou.updatetime || 0;
    if(list.length==0 || nowtime > (oldtime+24*60*60*1000)){
        try{
            let html = request("https://api.web.360kan.com/v1/rank?cat="+fenleiid[ids], {timeout: 3000});
            list = JSON.parse(html).data;
            resoudata[fenlei[ids]] = list;
            JYresou['data'] = resoudata;
            JYresou['updatetime'] = nowtime;
            writeFile(resoufile, JSON.stringify(JYresou));
        }catch(e){
            log("获取热搜榜出错>"+e.message);
        }
    }
    d.push({
        title: '<span style="color:#ff6600"><b>\t热搜榜\t\t\t</b></span>',
        desc: '✅'+fenlei[ids],
        url: $(fenlei, 2, '选择热榜分类').select((fenlei) => {
            putMyVar("热榜分类",fenlei.indexOf(input));
            refreshPage(false);
            return "hiker://empty";
        },fenlei),
        pic_url: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'avatar'
    });

    list.forEach((item,i)=>{
        d.push({
            title: (i=="0"?'““””<span style="color:#ff3300">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="1"?'““””<span style="color:#ff6600">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="2"?'““””<span style="color:#ff9900">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:'““””<span>' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title)+'\n<small><span style="color:#00ba99">'+item.comment+'</small>',
            url: item.title + searchurl,
            pic_url: item.cover,
            desc: item.description,
            col_type: "movie_1_vertical_pic",
            extra: {
                longClick: [{
                    title: "🔍快速聚搜",
                    js: $.toString((name) => {
                        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                            xunmi(name);
                        }, name)
                    },item.title)
                },{
                    title: "🔎云盘搜索",
                    js: $.toString((name) => {
                        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                            let d = [];
                            d.push({
                                title: name+"-云盘聚合搜索",
                                url: "hiker://empty",
                                col_type: "text_center_1",
                                extra: {
                                    id: "listloading",
                                    lineVisible: false
                                }
                            })
                            setResult(d);
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                            aliDiskSearch(name);
                        }, name)
                    },item.title)
                },{
                    title: "🔎Alist搜索",
                    js: $.toString((name) => {
                        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                            let d = [];
                            d.push({
                                title: name+"-Alist聚合搜索",
                                url: "hiker://empty",
                                col_type: "text_center_1",
                                extra: {
                                    id: "listloading",
                                    lineVisible: false
                                }
                            })
                            setResult(d);
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAlist.js');
                            alistSearch2(name,1);
                        }, name)
                    },item.title)
                }]
            }
        });
    })

    setResult(d);
}
// 下载必要图标
function downloadicon() {
    try{
        if(!fileExist('hiker://files/cache/src/文件夹.svg')){
            downloadFile(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + "img/文件夹.svg", 'hiker://files/cache/src/文件夹.svg');
        }
        if(!fileExist('hiker://files/cache/src/影片.svg')){
            downloadFile("https://hikerfans.com/tubiao/movie/13.svg", 'hiker://files/cache/src/影片.svg');
        }
        if(!fileExist('hiker://files/cache/src/音乐.svg')){
            downloadFile("https://hikerfans.com/tubiao/music/46.svg", 'hiker://files/cache/src/音乐.svg');
        }
        if(!fileExist('hiker://files/cache/src/图片.png')){
            downloadFile("https://hikerfans.com/tubiao/more/38.png", 'hiker://files/cache/src/图片.png');
        }
        if(!fileExist('hiker://files/cache/src/Alist.svg')){
            downloadFile(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + "img/Alist.svg", 'hiker://files/cache/src/Alist.svg');
        }
        if(!fileExist('hiker://files/cache/src/聚影.png')){
            downloadFile(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + "img/聚影.png", 'hiker://files/cache/src/聚影.png');
        }
    }catch(e){}
}
// 版本检测
function Version() {
    var nowVersion = getItem('Version', "7.9");//现在版本 
    var nowtime = Date.now();
    var oldtime = parseInt(getItem('VersionChecktime','0').replace('time',''));
    if (getMyVar('SrcJuying-VersionCheck', '0') == '0' && nowtime > (oldtime+12*60*60*1000)) {
        try {
            eval(request(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcTmplVersion.js'))
            if (parseFloat(newVersion.SrcJuying) > parseFloat(nowVersion)) {
                //随版本更新依赖代理地址
                let delquirelist = ['https://cdn.staticaly.com/gh/', 'https://ghproxy.com/https://raw.githubusercontent.com/','https://ghps.cc/https://raw.githubusercontent.com/'];
                let requirelist = ['https://ghproxy.net/https://raw.githubusercontent.com/','https://gh.con.sh/https://raw.githubusercontent.com/','https://mirror.ghproxy.com/https://raw.githubusercontent.com/','https://github.jevons.vip/https://raw.githubusercontent.com/'];
                let requirefile = "hiker://files/rules/Src/require.json";
                if (fetch(requirefile)) {
                    try {
                        let requirelist_tmp;
                        eval("requirelist_tmp = " + fetch(requirefile) + ";");
                        requirelist.forEach(it=>{
                            let index = requirelist_tmp.indexOf(requirelist_tmp.filter(d=>d.url == it)[0]);
                            if(index==-1){
                                requirelist_tmp.push({'url': it, 'sort': 0});
                            }
                        })
                        for (let i = 0; i < requirelist_tmp.length; i++) {
                            if(delquirelist.includes(requirelist_tmp[i].url)){
                                requirelist_tmp.splice(i,1);
                                i = i - 1;
                            }
                        }
                        writeFile(requirefile, JSON.stringify(requirelist_tmp));
                    } catch (e) {
                        log("错误信息>" + e.toString() + " 错误行>" + e.lineNumber);
                    }
                }

                confirm({
                    title:'发现新版本，是否更新？', 
                    content:nowVersion+'=>'+newVersion.SrcJuying+'\n'+newVersion.SrcJuyingdesc[newVersion.SrcJuying], 
                    confirm: $.toString((nowtime,newVersion) => {
                        setItem('Version', newVersion);
                        setItem('VersionChecktime', nowtime+'time');
                        deleteCache();
                        delete config.依赖;
                        refreshPage();
                    },nowtime, newVersion.SrcJuying),
                    cancel:''
                })
                log('检测到新版本！\nV'+newVersion.SrcJuying+'版本》'+newVersion.SrcJuyingdesc[newVersion.SrcJuying]);
            }
            putMyVar('SrcJuying-Version', '-V'+newVersion.SrcJuying);
        } catch (e) { }
        putMyVar('SrcJuying-VersionCheck', '1');
    }else{
        putMyVar('SrcJuying-Version', '-V'+nowVersion);
    }
}
