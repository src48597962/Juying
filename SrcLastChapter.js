function erji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('SrcM3U8');
        clearMyVar('SrcXTNH');
    }));
    clearMyVar('SrcJy$back');
    var d = [];
    var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': PC_UA } });
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
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
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
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
            return SrcParseS.聚影(input);
        }catch(e){
            return input;
        }
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
    var block = ['.m4a','.mp3','.flv','.avi','.3gp','.mpeg','.wmv','.mov','.rmvb','.gif','.jpg','.jpeg','.png','.ico','hm.baidu.com','/ads/*.js'];
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
                                    extra: { id: MY_URL.replace('#autoCache#','')+j, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')==1?true:false, blockRules: block },
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
                                    extra: { id: MY_URL.replace('#autoCache#','')+j, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')==1?true:false, blockRules: block },
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
                    extra: { id: MY_URL.replace('#autoCache#','')+k, jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')==1?true:false, blockRules: block  }
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
                    extra: { id: MY_URL.replace('#autoCache#',''), jsLoadingInject: true, cacheM3u8: getMyVar('superwebM3U8')==1?true:false, blockRules: block },
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