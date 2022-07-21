//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除

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
    require(config.依赖.match(/https.*\//)[0] + 'SrcJyMenu.js');
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
    var block = ['.m4a','.mp3','.mp4','.flv','.avi','.3gp','.mpeg','.wmv','.mov','.rmvb','.gif','.jpg','.jpeg','.png','hm.baidu.com','/ads/*.js','hm.baidu.com','/ads/*.js','.css'];
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
                setLastChapterRule('js:' + $.toString(param=>{ setResult('更新至：'+param) }, list[list.length-1].index))
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
            setLastChapterRule('js:' + $.toString(param=>{ setResult('更新至：'+param) }, "第" + arr[arr.length-1] + "期"))
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
            setLastChapterRule('js:' + $.toString(param=>{ setResult(param) }, ""))
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
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    if(MY_PAGE==1){
        d.push({
            title: "管理",
            url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                    require(config.依赖.match(/https.*\//)[0] + 'SrcJySet.js');
                    SRCSet();
                }),
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/129.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: JYconfig['recordentry']!=2?"历史":"收藏",
            url: JYconfig['recordentry']!=2?"hiker://history":"hiker://collection",
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
            require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
            xunmi(name);
        }, input);
    });
    
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
                require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
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


//版本检测
function Version() {
    var nowVersion = 3.1;//现在版本
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