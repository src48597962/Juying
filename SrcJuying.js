//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明

//一级
function yiji() {
    /*
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
    */
    //require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyData.js');
    
    if(getMyVar('SrcJuying-VersionCheck', '0') == '0'){
        let programversion = 0;
        try{
            programversion = $.require("config").version || 0;
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
        let btnmn4 = getItem('buttonmenu4',"展示");
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

    d = d.concat(getDataList('yiji'));
    deleteItemByCls("loading_gif");
    setResult(d);
}

//获取数据
function getDataList(type) {
    if(type=='yiji'){
        return JYyiji();
    }
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

//搜索
function sousuo() {
    let sousuoms;
    let cfgfile = "hiker://files/rules/Src/Juying/config.json";
    let Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        try{
            eval("var JYconfig=" + Juyingcfg+ ";");
            sousuoms = JYconfig.sousuoms;
        }catch(e){
            var JYconfig= {};
            sousuoms==1
        }
    }

    if((!fileExist('hiker://files/rules/Src/Juying/jiekou.json')||sousuoms==1) && getItem('searchsource')!="接口"){
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyData.js');
        JYsousuo();
    }else{
        if(MY_PAGE==1){
            let name = MY_URL.split('##')[1];
            if(name == undefined){
                setResult([{
                    title: "当前小程序版本过低，需升级新版本",
                    url: "hiker://empty",
                    col_type: "text_1"
                }]);
            }else if(name.trim()){
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                xunmi(name,false,true);
            }else{
                setResult([{
                    title: "搜索关键词不能为空",
                    url: "hiker://empty",
                    col_type: "text_1"
                }]);
            }
        }else{
            setResult([]);
        }
    }
}

//版本检测
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
