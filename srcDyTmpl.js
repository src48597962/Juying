//一级
function yiji() {
    Version();
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));

    var d = [];
    var author = MY_RULE.author;
    var SrcQJJX = getItem('SrcQJJX', '1');
    var SrcGJFS = getItem('SrcGJFS', '3');
    var SrcXTNH = getItem('SrcXTNH', 'web');
    var SrcM3U8 = getItem('SrcM3U8', '1');
    try {
        var isAPP = 是否APP;
    } catch (e) {
        var isAPP = 0;
    }

    if (isAPP != 1) {
        var list = parseDomForArray(getResCode(), 列表);
        if (config.debug == "1") { log(list) }
        for (var i in list) {
            try {
                d.push({
                    title: parseDomForHtml(list[i], 标题),
                    desc: parseDomForHtml(list[i], 描述),
                    pic_url: 图片.indexOf('@') == -1 ? parseDom(list[i], 图片) + "@Referer=" : 图片.split('@')[1] == "-" ? parseDom(list[i], 图片.split('@')[0]) : parseDom(list[i], 图片.split('@')[0]) + "@" + 图片.split('@')[1],
                    url: "hiker://empty##" + parseDom(list[i], 链接) + "#immersiveTheme#",
                    extra: {
                        pic: parseDom(list[i], 图片.split('@')[0]),
                        author: author,
                        SrcQJJX: SrcQJJX,
                        SrcGJFS: SrcGJFS,
                        SrcXTNH: SrcXTNH,
                        SrcM3U8: SrcM3U8
                    }
                });
            } catch (e) { }
        }
    } else {
        //APP
        try {
            var url_api = 接口API;
        } catch (e) {
            var url_api = MY_RULE.sort_url;
        }
        var urls = MY_URL.split('##');
        if (url_api == "" || !/^http/.test(url_api)) {
            url_api = urls[1];
        }

        if (url_api.indexOf('v1.vod') > -1) {
            var url = url_api + '/detail?vod_id=';
            MY_URL = url_api + urls[2].replace('video?tid=', '?type=');// + '?type=fyclass&pg=fypage&page=fypage&limit=20&area=fyarea&lass=&year=fyyear';//v1
        } else {
            var url = url_api + 'video_detail?id=';
            MY_URL = url_api + urls[2];// + 'video?tid=fyclass&pg=fypage&page=fypage&limit=20&area=fyarea&lass=&year=fyyear';//app
        }

        try {
            var MYUA = 指定UA;
        } catch (e) {
            var MYUA = 'Dalvik/2.1.0';//Dart/2.13(dart:io)
        }
        try {
            var html = JSON.parse(request(MY_URL, { headers: { 'User-Agent': MYUA } }));
        } catch (e) {
            d.push({
                title: 'APP接口访问出错，可通过编辑小程序，修改接口API地址<br>目前支持V1和app类型<br>比如：http://xxxxxxx/api.php/v1.vod',
                col_type: 'rich_text'
            });
            var html = { data: { list: [] } };
        }
        try {
            var list = html.data.list;
        } catch (e) {
            try {
                var list = html.list;
            } catch (e) {
                var list = html.data;
            }
        }
        if (config.debug == "1") { log(list) }
        try {
            for (var i in list) {
                d.push({
                    title: list[i].vod_name,
                    desc: list[i].vod_remarks,
                    pic_url: list[i].vod_pic + "@Referer=",
                    url: 'hiker://empty##' + url + list[i].vod_id + "#immersiveTheme#",
                    col_type: 'movie_3',
                    extra: {
                        pic: list[i].vod_pic,
                        author: author,
                        SrcQJJX: SrcQJJX,
                        SrcGJFS: SrcGJFS,
                        SrcXTNH: SrcXTNH,
                        SrcM3U8: SrcM3U8
                    }
                });
            }
        } catch (e) { }
    }
    putMyVar('author', author);
    setResult(d);
}
//二级
function erji() {
    var d = [];
    //加载本地自定义变量缓存文件
    var configfile = config.依赖.match(/https.*\//)[0] + 'srcconfig.js';
    require(configfile);
    addListener("onClose", $.toString(() => {
        clearMyVar('是否APP');
    }));
    try {
        var isAPP = 是否APP;
    } catch (e) {
        var isAPP = 0;
    }

    //自动判断是否需要更新请求
    if (getMyVar('myurl', '0') != MY_URL || !configvar.详情1 || configvar.标识 != MY_URL) {
        if (MY_URL.indexOf('hiker://empty##') > -1) {
            if (isAPP == 0) {
                try {
                    var MYUA = 指定UA;
                } catch (e) {
                    var MYUA = MY_RULE.ua=="pc"?PC_UA:MOBILE_UA;
                }
                var html = request(MY_URL.split('##')[1], {
                    headers: {
                        'User-Agent': MYUA
                    }
                });
            } else {
                try {
                    var MYUA = 指定UA;
                } catch (e) {
                    var MYUA = 'Dalvik/2.1.0';
                }
                var html = JSON.parse(request(MY_URL.split('##')[1], { headers: { 'User-Agent': MYUA } }));
            }
        } else {
            if (isAPP == 0) {
                var html = getResCode();
            } else {
                var html = JSON.parse(getResCode());
            }
        }
        var zt = 1;
        putMyVar('myurl', MY_URL);
    } else {
        var zt = 0;
    }

    //影片详情
    if (zt == 1) {
        var details1 = "";
        var details0 = "";
        var details2 = "";
        var pic = "";
        var filter = "";

        if (isAPP == 0) {
            try {
                if (项目值 == '') { var itemValue = 1 } else { var itemValue = 项目值 }
            } catch (e) { var itemValue = 1 }
            try {
                if (项目1 != "") {
                    if (itemValue == 1) {
                        if(项目2 != ""){
                            details1 = parseDomForHtml(html, 项目1).substr(0, 15) + '\n'
                        }else{
                            details1 = parseDomForHtml(html, 项目1)
                        }
                    } else {
                        details1 = 项目1 + '\n';
                    }
                }
            } catch (e) { details1 = '项目1，获取失败\n' }
            try {
                if (项目2 != "") {
                    if (itemValue == 1) {
                        details1 += parseDomForHtml(html, 项目2).substr(0, 15) + '\n'
                    } else {
                        details1 += 项目2 + '\n';
                    }
                }
            } catch (e) { details1 += '项目2，获取失败\n' }
            try {
                if (项目3 != "") {
                    if (itemValue == 1) {
                        details0 += parseDomForHtml(html, 项目3) + ' '
                    } else {
                        details0 += 项目3 + ' '
                    }
                }
            } catch (e) { details1 += '项目3，获取失败'; if (项目4 == "") { details1 += '\n' } }
            try {
                if (项目4 != "") {
                    if (itemValue == 1) {
                        if (details0 != "" && details0.length <= 10) { details0 += parseDomForHtml(html, 项目4) } else if (项目5 == "") { details2 += parseDomForHtml(html, 项目4).substr(0, 15) + '\n' }
                    } else {
                        if (details0 != "" && details0.length <= 10) { details0 += 项目4 } else if (项目5 == "") { details2 += 项目4 + '\n' }
                    }
                }
            } catch (e) { details1 += '项目4，获取失败\n' }
            try {
                if (项目5 != "") {
                    if (itemValue == 1) {
                        details2 += parseDomForHtml(html, 项目5) + '\n'
                    } else {
                        details2 += 项目5 + '\n'
                    }
                }
            } catch (e) { details2 += '项目5，获取失败\n' }
            try {
                if (项目6 != "") {
                    if (itemValue == 1) {
                        details2 += parseDomForHtml(html, 项目6)
                    } else {
                        details2 += 项目6
                    }
                }
            } catch (e) { details2 += '项目6，获取失败' }
            try {
                if (图片 != "") {
                    if (itemValue == 1) {
                        pic = parseDom(html, 图片)
                    } else {
                        pic = 图片
                    }
                } else {
                    pic = MY_PARAMS.pic
                }
            } catch (e) { pic = MY_PARAMS.pic }
            try {
                if (过虑 != "") {
                    filter = "/" + 过虑 + "/g";
                }
            } catch (e) {
                filter = "";
            }
            if (details0 != "") { details1 += details0.substr(0, 15) };
            details1 = details1.replace(eval(filter), '');
            details2 = details2.replace(eval(filter), '');
            if (config.debug == "1") {
                log(details1);
                log(details2);
            }
        } else {
            //app
            let actor = html.data.vod_actor || "空白";
            let director = html.data.vod_director || "空白";
            let area = html.data.vod_area || "空白";
            let year = html.data.vod_year || "空白";
            let remarks = html.data.vod_remarks || "";
            let pubdate = html.data.vod_pubdate || html.data.vod_class || "";
            details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
            details2 = remarks + '\n' + pubdate;
            pic = html.data.vod_pic || MY_PARAMS.pic;
        }

    } else {
        var details1 = configvar.详情1;
        var details2 = configvar.详情2;
        var pic = configvar.图片;
        try {
            if (过虑 != "") {
                filter = "/" + 过虑 + "/g";
            }
        } catch (e) {
            filter = "";
        }
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
    //简介详情
    if (zt == 1) {
        try {
            if (isAPP == 0) {
                if (itemValue == 1) {
                    var desc = parseDomForHtml(html, 简介).replace(eval(filter), '') || "";
                } else {
                    var desc = 简介;
                }
            } else {
                var desc = html.data.vod_blurb;
            }
            if (desc == '' || desc == undefined) { desc = '...' }
        } catch (e) {
            var desc = '...';
        }
    } else {
        var desc = configvar.简介
    }
    d.push({
        title: '‘‘’’<small><font color="#ff148e8e">简介：' + desc.substr(0, 65) + '......</font><small><font color="red">查看详情</font></small></small>',
        url: $('hiker://empty#noHistory#').rule(param => {
            setHomeResult([{
                title: '影片简介：\n' + param,
                col_type: 'long_text'
            }]);
        }, desc),
        col_type: 'text_1'
    });

    //线路数组定位
    if (zt == 1) {
        if (isAPP == 0) {
            var arts = parseDomForArray(html, 线路列表);
        } else {
            //var arts = eval(线路列表);
            var arts = html.data.vod_url_with_player || html.data.vod_play_list;

        }
    } else {
        var arts = configvar.线路;
    }

    var tabs = [];
    for (var i in arts) {
        if (isAPP == 0) {
            tabs.push(parseDomForHtml(arts[i], 单个线路).replace(//g, '').replace(/ /g, '').replace(/ /g, '').replace(eval(filter), ''))
        } else {
            let line = arts[i].name || arts[i].player_info.show;
            tabs.push(line);

            if (getMyVar(MY_URL, '0') == i) {
                var parse_api = "";
                try {
                    let parse1 = arts[i].player_info.parse;
                    let parse2 = arts[i].player_info.parse2;
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
                //log(parse_api);
            }
        }
    }

    //选集数组定位
    if (zt == 1) {
        if (isAPP == 0) {
            var conts = parseDomForArray(html, 影片列表);
        } else {
            var conts = arts;
        }
        var newconfig = { 详情1: details1, 详情2: details2, 图片: pic, 简介: desc, 线路: arts, 影片: conts, 标识: MY_URL };
        var libsfile = 'hiker://files/libs/' + md5(configfile) + '.js';
        writeFile(libsfile, 'var configvar = ' + JSON.stringify(newconfig));
    } else {
        var conts = configvar.影片;
    }

    var lists = [];
    for (var i in conts) {
        if (isAPP == 0) {
            lists.push(parseDomForArray(conts[i], 单个影片))
        } else {
            let single = conts[i].url;
            lists.push(single.split('#'));
            putMyVar('是否APP','1');
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

    //动态解析处理
    try {
        if (typeof (lazy) == "undefined") {
            putMyVar('islazy', '0');//模板解析
        } else {
            putMyVar('islazy', '1');
            if (lazy.indexOf('.官网(') > -1 || lazy.indexOf('.智能(') > -1) {
                putMyVar('官网', '1');
            }
        }
        //初始参数
        let SrcQJJX = getMyVar('islazy') == "0" ? "2" : MY_PARAMS.SrcQJJX;
        let SrcGJFS = getMyVar('islazy') == "1" && getMyVar('官网') == "1" ? "1" : MY_PARAMS.SrcGJFS;
        let SrcXTNH = MY_PARAMS.SrcXTNH;
        let SrcM3U8 = MY_PARAMS.SrcM3U8;
        let author = MY_PARAMS.author;
        if (SrcQJJX != undefined && getMyVar('SrcQJJX') == "") { putMyVar('SrcQJJX', SrcQJJX) };
        if (SrcGJFS != undefined && getMyVar('SrcGJFS') == "") { putMyVar('SrcGJFS', SrcGJFS) };
        if (SrcXTNH != undefined && getMyVar('SrcXTNH') == "") { putMyVar('SrcXTNH', SrcXTNH) };
        if (SrcM3U8 != undefined && getMyVar('SrcM3U8') == "") { putMyVar('SrcM3U8', SrcM3U8) };
        if (author != undefined && getMyVar('author') == "") { putMyVar('author', author) };

        if (getMyVar('islazy') == "0" || getMyVar('SrcQJJX', '1') == "2") {//调用模板自带嗅探
            if (isAPP == 0) {
                var DTJX = $("").lazyRule(() => {
                    require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                    return SrcParseS.嗅探(input);
                });
            } else {
                putMyVar('parse_api', parse_api);
                var DTJX = $("").lazyRule(() => {
                    require(config.依赖);
                    return SrcParseS.APP(input);
                });
            }
        } else {
            var DTJX = lazy;
        }
    } catch (e) { }

    evalPrivateJS("AkyT29hQhE2hj4xfBSaOzESMpZFDqEdZ2Xu0kej8K51ytFeKHIxV46v8CHrJJGPAduhW7VMUV64WbjMOom5QpEBJQLQhmp0bJIMGysk+i/4xl6mkiLKsEu3B02ciwUk4acBiZ8Uk9ZTs9Xmfg4gLHsuLhG0mWRN7mLi08sJdFAgPFEGPBxeUOTHTPU7hSbwuZn5OQ3gXavGrZmxBztmFtEzNW1tZDX+gGjSQGWpDLxwv5jQN/ALzFkfVCl0Yw1MmhqjWKvunyflUuEJytDIelchqs9EBesQANq6QQSIbtESG/yD7SENPjo3TGAwE2x2TGf1Nl+qm3A2XmEQbe44L2hepCpN3ToVBVOexrW+BTjQ=")

    function setTabs(tabs, vari) {
        d.push({
            title: '‘‘♥’’',
            url: $("#noHistory##noRecordHistory#hiker://empty").rule((SRCSet, setupPages) => {
                SRCSet(setupPages);
            }, SRCSet, setupPages),
            col_type: 'scroll_button'
        });
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
    setTabs(tabs, MY_URL);

    //选集部份
    if (getMyVar('shsort') == '1') { var sx = '‘‘’’<font color="#0aa344">排序</font><font color="#0aa344">↓</font><font color="#ff4c00">↑</font>'; } else { var sx = '‘‘’’<font color="#0aa344">排序</font><font color="#ff4c00">↓</font><font color="#0aa344">↑</font>'; }
    function setLists(lists, index) {
        d.push({
            title: '‘‘’’<small><font color="' + Color1 + '">选集列表</font>' + '\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t' + sx + '</small>',
            url: $("#noLoading#").lazyRule(() => {
                if (getMyVar('shsort') == '1') { putMyVar('shsort', '0'); } else { putMyVar('shsort', '1') };
                refreshPage(false);
                return 'toast://切换排序成功'
            }),
            col_type: 'text_center_1'
        })

        var list = lists[index];
        function playlist(lx, len) {//定义选集列表生成
            if (lx == '1') {
                if (isAPP == 0) {
                    var playtitle = parseDomForHtml(list[j], 'a&&Text');
                    var playurl = parseDom(list[j], 'a&&href');
                } else {
                    var playtitle = list[j].split('$')[0];
                    var playurl = list[j].split('$')[1];
                }
                d.push({
                    title: playtitle.replace(/第|集|话|期|-/g, ''),
                    url: playurl + DTJX,
                    extra: { id: playurl, referer: playurl, ua: PC_UA, jsLoadingInject: true, blockRules: ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', '.css'] },
                    col_type: list.length > 4 && len < 7 ? 'text_4' : 'text_3'
                });
            } else {
                d.push({
                    title: '此影片无播放选集！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                });
            }

        }
        if (list == undefined || list.length == 0) {
            playlist('0');
        } else {
            if (isAPP == 1) {
                var listone = list[0].split('$')[0];
            } else {
                var listone = parseDomForHtml(list[0], 'a&&Text');
            }
            if (listone != "") {
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

//搜索
function sousuo(isverify,verifylx,waittime) {
    var d = [];
    var author = getMyVar('author', '0');
    var SrcQJJX = getItem('SrcQJJX', '1');
    var SrcGJFS = getItem('SrcGJFS', '2');
    var SrcXTNH = getItem('SrcXTNH', 'web');
    var SrcM3U8 = getItem('SrcM3U8', '1');
    try {
        var isAPP = 是否APP;
    } catch (e) {
        var isAPP = 0;
    }

    if (isAPP != 1) {
        if(MY_URL.indexOf('empty##') > -1){
            var empty = 1;
        }else{
            var empty = 0;
        }
        MY_URL = MY_URL.replace('hiker://empty##','');

        try {
            var MYUA = 指定UA;
        } catch (e) {
            var MYUA = MY_RULE.ua=="pc"?PC_UA:MOBILE_UA;
        }
        let headers = {
            "User-Agent": MYUA
        };
        verifylx = verifylx||(typeof (验证码) != "undefined"?"B":"A");
        waittime = (waittime*1000)||200;
        var cookiename = MY_RULE.title+'cookie';
        if(getVar("SrcCookie")){
            putMyVar(cookiename,getVar("SrcCookie"));
            clearVar("SrcCookie");
        }
        
        if(isverify==true&&!getMyVar(cookiename)){
            if(verifylx == "A"){
                log('网站有验证：进入手动过验证1');
                putMyVar('isverifyA','1');
                d.push({
                    title:waittime>=1000?'点击前往验证，完成后过'+waittime/1000+'秒下拉刷新':'点击前往验证，完成后下拉刷新',
                    url: $("hiker://empty#noRecordHistory##noHistory#").rule((verify,url,headers,time)=>{
                            verify(url, headers, time, 1);
                        },verify.A,MY_URL,JSON.stringify(headers),waittime),
                    extra: { id: "sousuo_verify" }
                })
            }else{
                let cook = fetchCookie(验证码, {
                    headers: headers
                });
                let cookie = JSON.parse(cook||'[]');
                putMyVar(cookiename, cookie.join(';'));
                headers.Cookie = getMyVar(cookiename);
                if(verify.B(验证码,认证链接,JSON.stringify(headers))=="ok"){
                    log('网站有验证：自动过验证成功1');
                    java.lang.Thread.sleep(waittime);
                }else{
                    log('网站有验证：自动过验证失败1');
                }
            }
        }

        if(getMyVar(cookiename)){
            headers.Cookie = getMyVar(cookiename);
        }

        if(empty == 1){
            var html = request(MY_URL, {
                headers: headers
            });
        }else{
            var html = getResCode();
        }
        
        if (html.indexOf('检测中') != -1) {
            html = request(MY_URL + '?btwaf' + html.match(/btwaf(.*?)\"/)[1], {
                headers: headers
            });
        }

        if (getMyVar('isverifyA','0')=="0"&&html.indexOf('系统安全验证') > -1) {
            if(!isverify || verifylx == "A"){
                clearMyVar('isverifyA');
                log('网站有验证：进入手动过验证2');
                d.push({
                    title:waittime>=1000?'点击前往验证，完成后过'+waittime/1000+'秒下拉刷新':'点击前往验证，完成后下拉刷新',
                    url: $("hiker://empty#noRecordHistory##noHistory#").rule((verify,url,headers,time)=>{
                            verify(url, headers, time, 1);
                        },verify.A,MY_URL,JSON.stringify(headers),waittime)
                })
                
            }else{
                if(verify.B(验证码,认证链接,JSON.stringify(headers))=="ok"){
                    log('网站有验证：自动过验证成功2');
                    java.lang.Thread.sleep(waittime);
                    html = fetch(MY_URL, {
                        headers: headers
                    });
                }else{
                    log('网站有验证：自动过验证失败2');
                    d.push({
                        title:'验证码自动识别出错，下拉刷新再次偿试',
                        url: "toast://验证码自动识别出错，下拉刷新再次偿试"
                    })
                }
            }
        }
        if(/搜索时间间隔/.test(html)){
            d.push({
                title:'搜索有时间间隔，过几秒后再下拉刷新',
                url: "toast://搜索有时间间隔，过几秒后再下拉刷新"
            })
        }

        //log(html);
        var list = parseDomForArray(html, 列表);
        for (var i in list) {
            try {
                d.push({
                    title: parseDomForHtml(list[i], 标题),
                    desc: parseDomForHtml(list[i], 描述),
                    content: parseDomForHtml(list[i], 内容),
                    pic_url: parseDom(list[i], 图片) + "@Referer=",
                    url: "hiker://empty##" + parseDom(list[i], 链接) + "#immersiveTheme#",
                    extra: {
                        pic: parseDom(list[i], 图片),
                        author: author,
                        SrcQJJX: SrcQJJX,
                        SrcGJFS: SrcGJFS,
                        SrcXTNH: SrcXTNH,
                        SrcM3U8: SrcM3U8
                    }
                });
            } catch (e) { }
        }
    } else {
        //APP
        try {
            var url_api = 接口API;
        } catch (e) {
            var url_api = "";
        }
        var urls = MY_URL.split('##');
        if (url_api == "" || !/^http/.test(url_api)) {
            url_api = urls[1];
        }
        if (url_api.indexOf('v1.vod') > -1) {
            var url = url_api + '/detail?vod_id=';
            MY_URL = url_api + urls[2].replace('search?text=', '?wd=');//http://lanmao.lanmaoymw.cn/ruifenglb_api.php/v1.vod?wd=**&page=fypage&limit=10//v1
        } else {
            var url = url_api + 'video_detail?id=';
            MY_URL = url_api + urls[2];//http://television.wkfile.com/api.php/app/search?text=**&pg=fypage&limit=10//app
        }
        try {
            var MYUA = 指定UA;
        } catch (e) {
            var MYUA = 'Dalvik/2.1.0';
        }
        try {
            var html = JSON.parse(request(MY_URL, { headers: { 'User-Agent': MYUA } }));
        } catch (e) {
            d.push({
                title: 'APP接口访问出错，无法获取数据',
                col_type: 'rich_text'
            });
            var html = { data: { list: [] } };
        }
        try {
            var list = html.data.list;
        } catch (e) {
            try {
                var list = html.list;
            } catch (e) {
                var list = html.data;
            }
        }

        try {
            for (var i in list) {
                d.push({
                    title: list[i].vod_name,
                    desc: list[i].type_name + ' ' + list[i].vod_remarks + ' ' + list[i].vod_year,
                    content: list[i].vod_content,
                    pic_url: list[i].vod_pic + "@Referer=",
                    url: 'hiker://empty##' + url + list[i].vod_id + "#immersiveTheme#",
                    extra: {
                        pic: list[i].vod_pic,
                        author: author,
                        SrcQJJX: SrcQJJX,
                        SrcGJFS: SrcGJFS,
                        SrcXTNH: SrcXTNH,
                        SrcM3U8: SrcM3U8
                    }
                });
            }
        } catch (e) { }
    }
    setResult(d)
}

//最新章节
function zuixin() {
    try {
        var isAPP = 是否APP;
    } catch (e) {
        var isAPP = 0;
    }

    if (MY_URL.indexOf('hiker://empty##') > -1) {
        if (isAPP == 0) {
            try {
                var MYUA = 指定UA;
            } catch (e) {
                var MYUA = MY_RULE.ua=="pc"?PC_UA:MOBILE_UA;
            }
            var html = request(MY_URL.split('##')[1], {
                headers: {
                    'User-Agent': MYUA
                }
            });
        } else {
            var html = JSON.parse(request(MY_URL.split('##')[1], { headers: { 'User-Agent': 'Dalvik/2.1.0' } }));
        }
    } else {
        if (isAPP == 0) {
            var html = getResCode();
        } else {
            var html = JSON.parse(getResCode());
        }
    }

    if (isAPP == 1) {
        var conts = html.data.vod_url_with_player || html.data.vod_play_list;//影片列表
        var list = conts[0].url.split('#');//影片定位
        var title = list[list.length - 1].split('$')[0];
    } else {
        var conts = parseDomForArray(html, 影片列表)[0];//影片列表
        var list = parseDomForArray(conts, 单个影片);//影片定位
        var title = parseDomForHtml(list[list.length - 1], 'a&&Text');
    }

    setResult("更新至: " + title);
}

//一级动态分类
function yijidtfl(isverify,verifylx,waittime) {
    Version();
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
    var d = d || []
    var author = MY_RULE.author;
    var SrcQJJX = getItem('SrcQJJX', '1');
    var SrcGJFS = getItem('SrcGJFS', '3');
    var SrcXTNH = getItem('SrcXTNH', 'web');
    var SrcM3U8 = getItem('SrcM3U8', '1');
    var 分类颜色 = '#3399cc';
    var page = MY_PAGE;
    var true_url = getMyVar('header.url', MY_URL);
    let 链接处理工具 = require(config.依赖.match(/https.*\//)[0] + 'plugins/UrlProcessor.js')
    true_url = 链接处理工具
        .链接(true_url)
        .页码(page)
        .获取处理结果();
    MY_URL = true_url;
    try {
        var MYUA = 指定UA;
    } catch (e) {
        var MYUA = MY_RULE.ua=="pc"?PC_UA:MOBILE_UA;
    }
    let headers = {
        "User-Agent": MYUA
    };

    verifylx = verifylx||(typeof (验证码) != "undefined"?"B":"A");
    waittime = (waittime*1000)||200;
    var cookiename = MY_RULE.title+'cookie';
    if(getVar("SrcCookie")){
        putMyVar(cookiename,getVar("SrcCookie"));
        clearVar("SrcCookie");
    }
    if(isverify==true&&!getMyVar(cookiename)){
        if(verifylx == "A"){
            if(getMyVar('verifyA','0')=="0"){
                putMyVar('verifyA','1');
                log('网站有验证：进入手动过验证1');
                verify.A(MY_URL, JSON.stringify(headers), waittime);
            }
        }else{
            let cook = fetchCookie(验证码, {
                headers: headers
            });
            let cookie = JSON.parse(cook||'[]');
            putMyVar(cookiename, cookie.join(';'));
            headers.Cookie = getMyVar(cookiename);
            if(verify.B(验证码,认证链接,JSON.stringify(headers))=="ok"){
                log('网站有验证：自动过验证成功1');
                java.lang.Thread.sleep(waittime);
            }else{
                log('网站有验证：自动过验证失败1');
            }
        }
    }

    if(getMyVar(cookiename)){
        headers.Cookie = getMyVar(cookiename);
    }

    var html = fetch(MY_URL, {
        headers: headers
    })
    if (html.indexOf('检测中') != -1) {
        html = fetch(MY_URL + '?btwaf' + html.match(/btwaf(.*?)\"/)[1], {
            headers: headers
        });
    }
    if (html.indexOf('系统安全验证') > -1) {
        if(!isverify || verifylx == "A"){
            if(getMyVar('verifyA','0')=="0"){
                putMyVar('verifyA','1');
                log('网站有验证：进入手动过验证2');
                verify.A(MY_URL, JSON.stringify(headers), waittime);
            }
        }else{
            if(verify.B(验证码,认证链接,JSON.stringify(headers))=="ok"){
                log('网站有验证：自动过验证成功2');
                java.lang.Thread.sleep(waittime);
                html = fetch(MY_URL, {
                    headers: headers
                });
            }else{
                log('网站有验证：自动过验证失败2');
                d.push({
                    title:'验证码自动识别出错，下拉刷新再次偿试',
                    url: $("#noLoading#").lazyRule(() => {
                            refreshPage(false);
                            return 'toast://已刷新';
                        }),
                    col_type: "text_1"
                })
            }
        }
    }

    // '0' 为默认不折叠，'1' 为默认折叠
    const 当前折叠状态 = getMyVar('header.fold', '1')

    // 引入动态分类依赖
    // 框架已经稳定，使用 require 更佳
    let htmlCategories = require(config.依赖.match(/https.*\//)[0] + 'plugins/categories-header.js')
    htmlCategories.界面(d)
        .分类链接(true_url)
        .源码(html)
        .页码(page)
        .添加分类定位(定位列表)
        .开启内置折叠功能() // 必须
        .折叠按钮样式({
            title: 当前折叠状态 == "1" ? "‘‘️▼’’" : "‘‘▲’’"
        }) // 可选
        .折叠(当前折叠状态) // 必须
        .选中的分类颜色(分类颜色)
        .开始打造分类();
    var list = pdfa(html, 列表);
    for (var i in list) {
        try {
            d.push({
                title: parseDomForHtml(list[i], 标题),
                desc: parseDomForHtml(list[i], 描述),
                pic_url: 图片.indexOf('@') == -1 ? parseDom(list[i], 图片) + "@Referer=" : 图片.split('@')[1] == "-" ? parseDom(list[i], 图片.split('@')[0]) : parseDom(list[i], 图片.split('@')[0]) + "@" + 图片.split('@')[1],
                url: "hiker://empty##" + parseDom(list[i], 链接) + "#immersiveTheme#",
                extra: {
                    pic: parseDom(list[i], 图片.split('@')[0]),
                    author: author,
                    SrcQJJX: SrcQJJX,
                    SrcGJFS: SrcGJFS,
                    SrcXTNH: SrcXTNH,
                    SrcM3U8: SrcM3U8
                }
            });
        } catch (e) { }
    }
    setResult(d);    
}

function setupPages(type) {
    switch (type) {
        case "设置":
            return $("hiker://empty#noRecordHistory#").rule(() => {
                this.d = [];
                eval(fetch('hiker://files/cache/fileLinksᴰⁿ.txt'));
                if (!getVar('jxItemV')) {
                    require(fLinks.jxItUrl);
                }
                d.push({
                    desc: 'auto',
                    url: fLinks.x5Route + 'Parse_Dn.html',
                    col_type: 'x5_webview_single'
                });
                var jxItNewV = getVar('jxItNewV', ''),
                    jxItemV = getVar('jxItemV', '');
                var versionTips = jxItNewV == '' ? '‘‘' : '‘‘' + jxItNewV + '\n';
                var pics = [
                    'https://tva1.sinaimg.cn/large/9bd9b167gy1fwri56wjhqj21hc0u0arr.jpg',
                    'https://cdn.seovx.com/img/seovx-20-10%20(92).jpg',
                    'https://cdn.seovx.com/img/mom2018%20(207).jpg',
                    'https://tva4.sinaimg.cn/large/9bd9b167gy1fwrh5xoltdj21hc0u0tax.jpg',
                    'https://tva1.sinaimg.cn/large/005BYqpggy1fwreyu4nl6j31hc0u0ahr.jpg',
                    'https://s3.bmp.ovh/imgs/2021/10/d7e60b990742093d.jpeg',
                    'https://s3.bmp.ovh/imgs/2021/10/91ad6d6538bf8689.jpg',
                    'https://tva1.sinaimg.cn/large/005BYqpggy1fwresl5pmlj31hc0xcwka.jpg',
                    'https://tva3.sinaimg.cn/large/005BYqpggy1fwrgjdk74oj31hc0u0dqn.jpg',
                    'https://cdn.seovx.com/img/mom2018%20(803).jpg'
                ];
                d.push({
                    img: pics[Math.floor(Math.random() * 10)],
                    title: versionTips + '’’<small><span style="color:#6EB897">　　点击此处查看操作指引<br>点击上方头像进入编辑',
                    desc: '当前版本: ' + jxItemV,
                    url: fLinks.czzy,
                    col_type: 'movie_1'
                });
                setResult(d);
            })
            break;
        case "编辑":
            return $("hiker://empty#noRecordHistory#").rule(() => {
                this.d = [];
                eval(fetch('hiker://files/cache/fileLinksᴰⁿ.txt'));
                require(fLinks.jxItUrl);
                jxItem.jxList();
                setResult(d);
            })
            break;
        default:
            return 'toast://需要传入正确参数'
            break;
    }
}

var SrcParseS = {
    formatUrl: function (url, i) {
        try {
            if (url.trim() == "") {
                return "toast://解析失败，建议切换线路或更换解析方式";
            } else {
                if (url[0] == '/') { url = 'https:' + url }
                if (i == undefined) {
                    if (getMyVar('SrcM3U8', '1') == "1") {
                        url = cacheM3u8(url);
                    }
                    if (/wkfile/.test(url)) {
                        url = url + ';{User-Agent@Mozilla/5.0&&Referer@https://fantuan.tv/}';
                    } else if (/bilibili|bilivideo/.test(url)) {
                        url = url + ";{User-Agent@Mozilla/5.0&&Referer@https://www.bilibili.com/}";
                    } else if (/shenglinyiyang\.cn/.test(url)) {
                        url = url + ";{User-Agent@Mozilla/5.0&&Referer@https://zyz.sdljwomen.com}";
                    }
                    /* else {
                        url = url + ";{User-Agent@Mozilla/5.0}";
                    }*/
                } else {
                    if (getMyVar('SrcM3U8', '1') == "1") {
                        url = cacheM3u8(url, {}, 'video' + parseInt(i) + '.m3u8') + '#pre#';
                    }
                }
                return url + '#isVideo=true#';
            }
        } catch (e) {
            return url;
        }
    },
    嗅探: function (vipUrl) {
        showLoading('√嗅探解析中，请稍候');
        return (getMyVar('SrcXTNH', 'web') == 'x5' ? 'x5Rule://' : 'webRule://') + vipUrl + '@' + $.toString((formatUrl) => {
            if (typeof (request) == 'undefined' || !request) {
                eval(fba.getInternalJs());
            };
            if (window.c == null) {
                window.c = 0;
            };
            window.c++;
            if (window.c * 250 >= 15 * 1000) {
                fba.hideLoading();
                return "toast://解析超时，建议切换线路或更换解析方式";
            }
            //fba.log(fy_bridge_app.getUrls());
            var urls = _getUrls();
            var exclude = /m3u8\.tv/;
            var contain = /\.mp4|\.m3u8|\.flv|\.avi|\.mpeg|\.wmv|\.mov|\.rmvb|\.dat|qqBFdownload|mime=video%2F|video_mp4/;
            for (var i in urls) {
                if (!exclude.test(urls[i]) && contain.test(urls[i])) {
                    //fba.log(urls[i]);
                    if(fy_bridge_app.getHeaderUrl)
                        //return fy_bridge_app.getHeaderUrl(urls[i]).replace(";{", "#isVideo=true#;{");
                        return $$$("#noLoading#").lazyRule((url) => {
                            return cacheM3u8(url.split(";{")[0])+"#isVideo=true#;{"+url.split(";{")[1];
                        }, fy_bridge_app.getHeaderUrl(urls[i]));
                    else {
                        return $$$("#noLoading#").lazyRule((url, formatUrl) => {
                            //url = url.replace(/http.*?\?url=/, '');
                            return formatUrl(url);
                        }, urls[i], formatUrl);
                    }
                }
            }
        }, this.formatUrl)
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
                /*
                if(getMyVar('ddfrom', '')=="duoduozy"){
                    apiUrl = "https://player.tjomet.com/ysgc/qa9ty92aTSGHwn3X.jpg" 
                }else{
                    apiUrl = "https://ysgc.tjomet.com/qa9ty92aTSGHwn3X.jpg" 
                }
                clearMyVar('ddfrom');
                */
                apiUrl = "https://ysgc.tjomet.com/qa9ty92aTSGHwn3X.jpg" ;
            }
            var html = request("https://ysgc.tjomet.com/?url="+vipUrl,{timeout:5000});
            eval(html.match(/var config = {[\s\S]*?}/)[0] + '');
            var bod = 'url=' + config.url + "&vkey=" + config.vkey + "&token=" + config.token + "&sign=bKvCXSsVjPyTNr9R";
            var json = JSON.parse(request(apiUrl, { method: 'POST', body: bod }));
            eval(fetch("https://vkceyugu.cdn.bspapp.com/VKCEYUGU-03ee1f89-f0d4-49aa-a2b3-50e203514d8a/2e54cc42-9b4c-457d-b2de-0cdf3e2aeeaa.js"));//https://p.tjomet.com/duoduo/js/decode.js
            let url = getVideoInfo(json.url);
            if(/^http/.test(url)){
                return url;
            }else{
                var jsonstr = JSON.parse(request("https://p.tjomet.com/lff/api.php", { headers: { 'Referer': ref }, method: 'POST', body: 'url=' + vipUrl }));
                eval(getCryptoJS());
                return CryptoJS.AES.decrypt(jsonstr.url, CryptoJS.enc.Utf8.parse(CryptoJS.MD5('rXjWvXl6')), {
                    'iv': CryptoJS.enc.Utf8.parse('NXbHoWJbpsEOin8b'),
                    'mode': CryptoJS.mode.CBC,
                    'padding': CryptoJS.pad.ZeroPadding
                }).toString(CryptoJS.enc.Utf8);
            }
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
        var jxhtml = config.依赖.match(/https.*\//)[0] + 'SrcJiexi.html';
        fc(jxhtml, 48);
        let libsjxjs = fetch("hiker://files/libs/" + md5(jxhtml) + ".js");
        if (x5jxlist != undefined) {
            if (x5jxlist.length > 0) {
                libsjxjs = libsjxjs.replace(libsjxjs.match(/apiArray=(.*?);/)[1], JSON.stringify(x5jxlist))
            }
        }
        let libsjxhtml = "hiker://files/libs/" + md5(jxhtml) + ".html";
        writeFile(libsjxhtml, libsjxjs);
        return this.嗅探(getPath(libsjxhtml) + '?url=' + vipUrl);
    },
    mulheader: function (url) {
        if (/mgtv/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'www.mgtv.com' };
        } else if (/bilibili|bilivideo/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'www.bilibili.com' };
        } else if (/wkfile/.test(url)) {
            var header = { 'User-Agent': 'Mozilla/5.0', 'Referer': 'fantuan.tv' };
        } else {
            var header = { 'User-Agent': 'Mozilla/5.0' };
        }
        return header;
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
    }
}

function SRCSet(setupPages) {
    addListener("onClose", $.toString(() => {
        //clearMyVar('官网');
        refreshPage(false);
    }));
    setPageTitle("♥设置");

    function getTitle(title, Color) {
        return '<font color="' + Color + '">' + title + '</font>';
    }
    var d = [];
    //if(getMyVar('islazy', '0') =="1"){    
    d.push({
        title: '↓按需求修改此小程序的相关设置↓',
        col_type: "rich_text"
    });
    d.push({
        col_type: "line_blank"
    });

    //全局解析设置：1为自行编写动态解析，2为帅模板的通用嗅探解析
    var QJJX = getMyVar('SrcQJJX', '1');
    putMyVar('SrcQJJX', QJJX);
    var islazy = getMyVar('islazy', '0');
    d.push({
        title: islazy == "1" && QJJX == '1' ? `‘‘’’<span style="color:red">全局解析方式：‘‘’’<span style="color:#f13b66a">小程序的解析规则` : `‘‘’’<span style="color:red">全局解析方式：‘‘’’<span style="color:#f13b66a">帅模板的嗅探逻辑`,
        url: islazy == "0" ? 'toast://规则没有lazy解析，使用模板解析' : $('#noLoading#').lazyRule((QJJX) => {
            if (QJJX == '1') {
                setItem('SrcQJJX', '2');
                putMyVar('SrcQJJX', '2');
                var sm = "帅模板的嗅探规则";
            } else {
                setItem('SrcQJJX', '1');
                putMyVar('SrcQJJX', '1');
                var sm = "小程序的解析规则";
            }
            refreshPage(false);
            return 'toast://全局解析方式：' + sm;
        }, QJJX),
        col_type: "text_1"
    });
    for (let i = 0; i < 10; i++) {
        d.push({
            col_type: "blank_block"
        })
    }
    d.push({
        col_type: "line_blank"
    });
    //设置针对官网资源的默认解析方式：1为规则自定义解析，2为断插解析，3为嗅探解析

    var GJFSsm = getTitle('官方资源解析方式：', '#098AC1');
    var GJFS = islazy == '1' ? getMyVar('SrcGJFS', '1') : getMyVar('SrcGJFS', '3');
    putMyVar('SrcGJFS', GJFS);
    d.push({
        title: islazy == '1' && GJFS == '1' ? GJFSsm + getTitle('规则的动态解析', '#f13b66a') : GJFS == '2' ? GJFSsm + getTitle('调用断插解析', '#f13b66a') : GJFSsm + getTitle('模板嗅探解析', '#f13b66a'),
        col_type: "rich_text"
    });
    d.push({
        col_type: 'line'
    });
    if (islazy == '1' && QJJX == '1') {
        d.push({
            title: GJFS == '1' ? getTitle('规则', '#f13b66a') : '规则',
            url: `#noLoading#@lazyRule=.js:setItem('SrcGJFS','1');putMyVar('SrcGJFS','1');refreshPage(false);'toast://官方资源解析方式：规则lazy自定义';`,
            img: "https://lanmeiguojiang.com/tubiao/ke/23.png",
            col_type: "icon_small_3"
        });
    }
    if (getMyVar('官网', '0') == "1" || getMyVar('是否APP','0') == "1") {
        d.push({
            title: GJFS == '2' ? getTitle('断插', '#f13b66a') : '断插',
            url: `#noLoading#@lazyRule=.js:setItem('SrcGJFS','2');putMyVar('SrcGJFS','2');refreshPage(false);'toast://官方资源解析方式：调用断插解析';`,
            img: "https://lanmeiguojiang.com/tubiao/ke/24.png",
            col_type: "icon_small_3"
        });
        d.push({
            title: GJFS == '3' ? getTitle('嗅探', '#f13b66a') : '嗅探',
            url: `#noLoading#@lazyRule=.js:setItem('SrcGJFS','3');putMyVar('SrcGJFS','3');refreshPage(false);'toast://官方资源解析方式：模板嗅探解析';`,
            img: "https://lanmeiguojiang.com/tubiao/ke/25.png",
            col_type: "icon_small_3"
        });
    }
    for (let i = 0; i < 10; i++) {
        d.push({
            col_type: "blank_block"
        })
    }
    d.push({
        col_type: "line_blank"
    });
    if (GJFS == '2') {
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        d.push({
            title: '断插接口设置',
            url: fileExist('hiker://files/cache/fileLinksᴰⁿ.txt') ? setupPages("设置") : "hiker://page/Route?rule=MyFieldᴰⁿ&type=设置#noHistory#",
            img: "https://lanmeiguojiang.com/tubiao/messy/30.svg",
            col_type: "icon_2"
        });
        d.push({
            title: '解析接口管理',
            url: fileExist('hiker://files/cache/fileLinksᴰⁿ.txt') ? setupPages("编辑") : "hiker://page/Route?rule=MyFieldᴰⁿ&type=编辑#noRecordHistory#",
            img: "https://lanmeiguojiang.com/tubiao/messy/17.svg",
            col_type: "icon_2"
        });
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        d.push({
            col_type: "line_blank"
        });
    }

    if (GJFS == '3' || QJJX == '2') {
        var XTNH = getMyVar('SrcXTNH', 'web');
        putMyVar('SrcXTNH', XTNH);
        d.push({
            title: XTNH == 'web' ? getTitle('通用嗅探内核：', '#098AC1') + getTitle('webview内核', '#f13b66a') : getTitle('通用嗅探内核：', '#098AC1') + getTitle('腾讯x5内核', '#f13b66a'),
            col_type: "rich_text"
        });
        d.push({
            col_type: 'line'
        });
        d.push({
            title: '使用x5内核',
            url: `#noLoading#@lazyRule=.js:setItem('SrcXTNH','x5');putMyVar('SrcXTNH','x5');refreshPage(false);'toast://通用嗅探内核：腾讯x5内核';`,
            img: "https://lanmeiguojiang.com/tubiao/ke/127.png",
            col_type: "icon_2"
        });
        d.push({
            title: '使用web内核',
            url: `#noLoading#@lazyRule=.js:setItem('SrcXTNH','web');putMyVar('SrcXTNH','web');refreshPage(false);'toast://通用嗅探内核：webview内核';`,
            img: "https://lanmeiguojiang.com/tubiao/more/251.png",
            col_type: "icon_2"
        });
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        d.push({
            col_type: "line_blank"
        });
    }
    var M3U8 = getMyVar('SrcM3U8', '1');
    putMyVar('SrcM3U8', M3U8);
    d.push({
        title: M3U8 == '1' ? `‘‘’’<span style="color:red">m3u8播放连接方式：‘‘’’<span style="color:#f13b66a">通过缓存m3u8文件` : `‘‘’’<span style="color:red">m3u8播放连接方式：‘‘’’<span style="color:#f13b66a">直接在线访问`,
        url: $('#noLoading#').lazyRule((M3U8) => {
            if (M3U8 == '1') {
                setItem('SrcM3U8', '2');
                putMyVar('SrcM3U8', '2');
                var sm = "直接在线访问，有可能会失效，但兼容通用性好";
            } else {
                setItem('SrcM3U8', '1');
                putMyVar('SrcM3U8', '1');
                var sm = "通过缓存m3u8文件，避免可能失效，但某些场景不支持";
            }
            refreshPage(false);
            return 'toast://m3u8播放连接方式：' + sm;
        }, M3U8),
        col_type: "text_1"
    });
    for (let i = 0; i < 10; i++) {
        d.push({
            col_type: "blank_block"
        })
    }
    d.push({
        col_type: "line_blank"
    });
    //}
    d.push({
        title: '恢复设置',
        url: `#noLoading#@lazyRule=.js:clearItem('SrcQJJX');clearMyVar('SrcQJJX');clearItem('SrcGJFS');clearMyVar('SrcGJFS');clearItem('SrcXTNH');clearMyVar('SrcXTNH');clearItem('SrcM3U8');clearMyVar('SrcM3U8');refreshPage(false);'toast://已恢复小程序默认设置';`,
        img: "https://lanmeiguojiang.com/tubiao/ke/56.png",
        col_type: "icon_4"
    });
    d.push({
        title: '清除缓存',
        url: `#noLoading#@lazyRule=.js:deleteCache();back(true);'toast://已清除小程序所有依赖缓存';`,
        img: "https://lanmeiguojiang.com/tubiao/more/334.png",
        col_type: "icon_4"
    });
    setResult(d);
}
//验证
var verify = {
    A: function (yurl, headers, waittime, isss) {//手动过验证
        //log(yurl);log(headers);log(ua);log(timeout);
        var d = [];
        headers = JSON.parse(headers)||{};
        d.push({
            desc: '100%&&float',
            url: yurl,
            extra: {
                ua: headers,
                js: $.toString((time,isss) => {
                    var cook = document.cookie;
                    var html = document.documentElement.outerHTML;
                    if (!/系统安全验证/.test(html)){
                        fba.showLoading('验证中，请稍候');
                        fba.putVar("SrcCookie", cook);
                        if(isss==1){
                            setTimeout("fba.back()",200);
                        }else{
                            fba.setTimeout(fba.parseLazyRule(`hiker://empty@lazyRule=.js:refreshX5WebView('');refreshPage(true);hideLoading();`), time);
                        }
                    }
                },waittime,isss),
                jsLoadingInject: true
            },
            col_type: 'x5_webview_single'
        });
        setResult(d);
    },
    B: function (verifyimg,verifyapi,headers) {//自动过字母数字验证
        //log(verifyimg);log(verifyapi);log(headers);
        headers = JSON.parse(headers)||{};
        const File = java.io.File;
        let javaImport = new JavaImporter();
        javaImport.importPackage(
            Packages.com.example.hikerview.utils
        );
        var bsimg = "";
        with(javaImport) {
            let png = "hiker://files/cache/SrcVerify.png";
            downloadFile(verifyimg, png, headers);
            let path = getPath(png).replace("file://", "");
            bsimg = _base64.encodeToString(FileUtil.fileToBytes(path), _base64.NO_WRAP);
            new File(path).delete();
        }
        evalPrivateJS("aHTJW8GUqk24nqdf1KutpXLSQxxUqCopcaSjWa/1BqbspogsD9sqzzRKQ0/eY1cbHWXKqK/7SmE36413GhDw1/LB4qZbC87N46M3cbGebQKVsuA+wqokqyn1sWZEySrRyJHtbzpZgnEP0XYECOKzPs0qEDbm2B+3gV+JGJA37bwIqwzm/veCOIIpZgmIiRR++Nd7tnLMDBM+/vxyS+MXfE2IYkez6NE1hioj8TQ9X7UxWHZGX1PS2hc8lotTz+2qqC3Kwy5Jx6cr8zh4grgoykYsrWLjm4wLbAoSHl3Oe6QNNx+Tloen/mKR5K8c2B7xsnPja73djQkKloPGX+pCQHx8DJHZqptu2ObISfk3jBqUk2o06nxPvcT1geVKM4Sz")

        let vcode = ocr(bsimg,config.依赖);
        //log(vcode);
        let result = fetch(verifyapi + vcode, {
            headers: headers,
            method: 'POST'
        });
        try {
            return JSON.parse(result).msg;
        } catch (e) {
            return "";
        }
    }
}
//版本检测
function Version() {
    var nowVersion = 5.4;//现在版本
    if (getVar('srcDyTmpl-VersionCheck', '0') == '0') {
        try {
            eval(fetch(config.依赖.match(/https.*\//)[0] + 'SrcTmplVersion.js'))
            if (newVersion.srcDyTmpl > nowVersion) {
                deleteCache();
                require(config.依赖);
                log('检测到新依赖文件，已更新！');
            }
        } catch (e) { }
        putVar('srcDyTmpl-VersionCheck', '1');
    }
}