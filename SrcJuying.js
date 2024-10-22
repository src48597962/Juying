// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');//加载公共文件

// 搜索逻辑代码
function search(name, sstype, jkdata) {
    require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyData.js');
    let ssdata;
    if(sstype=='hkjusou'){
        ssdata = getSsData(name, jkdata, MY_PAGE).vodlists.map(it => {
            return {
                title: it.vod_name,
                desc: it.vod_desc,
                content: it.vod_content,
                pic_url: it.vod_pic,
                url: $("hiker://empty#immersiveTheme##autoCache#").rule(() => {
                    require(config.依赖);
                    dianboerji();
                }),
                extra: {
                    url: it.vod_url,
                    pic: it.vod_pic,
                    pageTitle: it.vod_name,
                    data: jkdata
                }
            }
        })
    }else if(sstype=='dianboyiji'){
        ssdata = getSsData(name, jkdata, 1).vodlists.map(it => {
            return {
                title: it.vod_name,
                desc: it.vod_desc,
                pic_url: it.vod_pic,
                url: $("hiker://empty#immersiveTheme##autoCache#").rule(() => {
                    require(config.依赖);
                    dianboerji()
                }),
                col_type: 'movie_3',
                extra: {
                    cls: 'dianbosousuolist',
                    url: it.vod_url,
                    pic: it.vod_pic,
                    pageTitle: it.vod_name,
                    data: jkdata
                }
            }
        })
    }else if(sstype=='dianboerji'){
        ssdata = getSsData(name, jkdata, 1).vodlists.map(it => {
            let extra = {
                cls: "Juloadlist grouploadlist",
                url: it.vod_url,
                pic: it.vod_pic,
                data: jkdata
            }
            return {
                title: it.vod_desc||"正片",
                desc: jkdata.name,
                pic_url: it.vod_pic,
                url: "hiker://empty##"+ it.vod_url + $().lazyRule((extra) => {
                    delete extra['cls'];
                    storage0.putMyVar('二级附加临时对象', extra);
                    refreshPage(false);
                    return "toast://已切换源：" + extra.data.name;
                }, extra),
                col_type: 'avatar',
                extra: extra
            }
        })
    }
    return ssdata;
}
// 软件搜索
function sousuo() {
    let k = MY_URL.split('##')[1];
    let name = k.trim();

    setResult([{
        title: "点我一下，视界聚搜",
        url: "hiker://search?s=" + name,
        extra: {
            delegateOnlySearch: true,
            rules: $.toString((name) => {
                let ssdatalist = [];
                if(storage0.getMyVar('搜索临时搜索数据')){
                    ssdatalist.push(storage0.getMyVar('搜索临时搜索数据'));
                    clearMyVar('搜索临时搜索数据');
                }else{
                    require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
                    let group = getMyVar('搜索临时搜索分组','');
                    ssdatalist = getSearchLists(group);
                    clearMyVar('搜索临时搜索分组');
                }

                let judata = [];
                ssdatalist.forEach(it=>{
                    judata.push({
                        "title": it.name,
                        "search_url": "hiker://empty##fypage",
                        "searchFind": `js: require(config.依赖); let d = search('` + name + `', 'hkjusou' ,` + JSON.stringify(it) + `); setResult(d);`
                    });
                })
                return JSON.stringify(judata);
            },name)
        }
    }])
}
//二级切源搜索
function erjisousuo(name,group,datas,num) {
    let updateItemid = group + "_" +name + "_loading";
    let searchMark = storage0.getMyVar('SrcJu_searchMark') || {};//二级换源缓存
    let markId = group+'_'+name;
    if(!datas && searchMark[markId]){
        addItemBefore(updateItemid, searchMark[markId]);
        updateItem(updateItemid, {
            title: "‘‘’’<small>当前搜索为缓存</small>",
            url: $("确定删除“"+name+"”搜索缓存吗？").confirm((markId)=>{
                let searchMark = storage0.getMyVar('SrcJu_searchMark') || {};
                delete searchMark[markId];
                storage0.putMyVar('SrcJu_searchMark', searchMark);
                refreshPage(true);
                return "toast://已清除";
            },markId)
        });
        let i = 0;
        let one = "";
        for (var k in searchMark) {
            i++;
            if (i == 1) { one = k }
        }
        if (i > 30) { delete searchMark[one]; }
        hideLoading();
    }else{
        showLoading('搜源中，请稍后...');
        updateItem(updateItemid, {
            title: "搜源中..."
        });

        let ssdatalist = datas || getSearchLists(group);
        let nosousuolist = storage0.getMyVar('nosousuolist') || [];
        if (nosousuolist.length>0){
            ssdatalist = ssdatalist.filter(it => {
                return nosousuolist.indexOf(it.url) == -1;
            })
        }

        let task = function (obj) {
            try {
                let lists = obj.fun(obj.name, "dianboerji", obj.data);
                return {result:lists, success:1};
            } catch (e) {
                log(obj.data.name + '>搜索失败>' + e.message);
                return {result:[], success:0};
            }
        }
        let list = ssdatalist.map((item) => {
            return {
                func: task,
                param: {"data":item,"name":name,"fun":search},
                id: item.url
            }
        });
        let failsort = [];
        let beidlist = [];
        let success = 0;
        if (list.length > 0) {
            be(list, {
                func: function (obj, id, error, taskResult) {
                    beidlist.push(id);

                    if(getMyVar("SrcJu_停止搜索线程")=="1"){
                        return "break";
                    }else if(taskResult.success==1){
                        let data = taskResult.result;
                        if(data.length>0){
                            success++;
                            searchMark[markId] = searchMark[markId] || [];
                            searchMark[markId] = searchMark[markId].concat(data);
                            addItemBefore(updateItemid, data);
                            hideLoading();
                            if(success>=20){
                                return "break";
                            }
                        }else{
                            failsort.push(id);
                        }
                    }else if(taskResult.success==0){
                        failsort.push(id);
                        nosousuolist.push(id);
                        storage0.putMyVar('nosousuolist', nosousuolist);
                    }
                },
                param: {
                }
            });
            hideLoading();
            if(beidlist.length<ssdatalist.length){
                let pdatalist = ssdatalist.filter(v=>beidlist.indexOf(v.url)==-1);
                addItemBefore(updateItemid, {
                    title: "剩余"+(ssdatalist.length-beidlist.length)+"，点击继续",
                    url: $("#noLoading#").lazyRule((name,group,datas,num) => {
                        deleteItem("erjisousuopage");
                        require(config.依赖);
                        erjisousuo(name, group, datas, num);
                        return "hiker://empty";
                    }, name,group,pdatalist,list.length),
                    col_type: 'text_center_1',
                    extra: {
                        id: "erjisousuopage",
                        cls: "Juloadlist grouploadlist",
                        lineVisible: false
                    }
                });
            }
            if(getMyVar("SrcJu_停止搜索线程")!="1"){
                storage0.putMyVar('SrcJu_searchMark', searchMark);
                setJkSort(failsort);
            }
            clearMyVar("SrcJu_停止搜索线程");
            let sousuosm = "‘‘’’<small><font color=#f13b66a>" + success + "</font>/" + (num || list.length) + "，搜索完成</small>";
            updateItem(updateItemid, { title: sousuosm });
        } else {
            hideLoading();
            clearMyVar("SrcJu_停止搜索线程");
            updateItem(updateItemid, { title: '' });
            toast("无接口");
        }
    }
}


// 点播二级
function dianboerji() {
    addListener("onClose", $.toString((getHistory) => {
        clearMyVar('二级附加临时对象');
        
        if(getItem('historyEnable')=='1'){
            deleteItemByCls('historylist');
            let h = getHistory();
            addItemAfter("historyid", h);
        }
    },getHistory));

    let sextra = storage0.getMyVar('二级附加临时对象') || {};//二级换源时临时extra数据

    MY_URL = sextra.url || MY_PARAMS.url;
    let jkdata = sextra.data || MY_PARAMS.data;
    let name = MY_PARAMS.pageTitle;
    let sgroup = jkdata.group||jkdata.type;
    let sname = jkdata.name;
    let updateItemid = sgroup + "_" + name + "_loading";

    if(sextra.url){
        updateItemid = updateItemid + '2';
        clearMyVar('二级附加临时对象');
    }
    
    let detailsmark;
    let cacheDataFile = cachepath + "SrcJuying_details.json";
    let cacheData = fetch(cacheDataFile);
    if (cacheData != "") {
        try{
            eval("let detailsjson=" + cacheData + ";");
            if(detailsjson.surl==jkdata.url && detailsjson.url==MY_URL){
                detailsmark = detailsjson.data;//本地缓存接口+链接对得上则取本地，用于切换排序和样式时加快
            }
        }catch(e){ }
    }
    let erdata;
    if(jkdata.type=="yundisk"){
        erdata = {lists: MY_PARAMS.lists};
    }else if(detailsmark){
        erdata = detailsmark;
    }else{
        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyData.js');
        log('开始获取二级数据');
        let t1 = new Date().getTime();
        erdata = getErData(jkdata);
        let t2 = new Date().getTime();
        log('获取二级数据完成，耗时：' + (t2-t1) + 'ms');
        if(erdata.lists.length>0){//只有二级选集列表获取到时才缓存
            let markData = {surl: jkdata.url, url: MY_URL, data: erdata}
            writeFile(cacheDataFile, JSON.stringify(markData));
        }else if(erdata.lists==0 && jkdata.name.includes("老白")){
            log("老白获取选集失败，自动刷新");
            java.lang.Thread.sleep(1000);
            refreshPage(false);
        }
    }

    //log(erdata);
    let details1 = erdata.details1 || "";
    let details2 = erdata.details2 || "";
    let pic = sextra.pic || MY_PARAMS.pic || erdata.pic;//优先一级图片
    if(pic.includes("404.jpg") && erdata.pic){
        pic = erdata.pic;
    }
    let updateParams = 0;
    let d = [];
    //海报
    let detailpic = pic?/^http/.test(pic)&&!pic.includes('@')?pic+'@Referer=':pic:'';
    d.push({
        title: details1,//详情1
        desc: "站源："+sname+"  ““””<small><font color=grey>("+sgroup+")</font></small>\n"+details2,//详情2
        pic_url: detailpic,//图片
        url: MY_URL.startsWith("http")?MY_URL + '#noHistory#':detailpic,//链接
        col_type: 'movie_1_vertical_pic_blur',
        extra: {
            gradient: true,
            id: "detailid"
        }
    });

    //线路部份
    let Color1 = getItem("主题颜色", "#6dc9ff")||'#09c11b';//#f13b66a
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
    //二级统一菜单
    require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyMenu.js');
    erjimenu(erdata.desc, name, sgroup).forEach(it=>{
        d.push(it);
    })
    
    if(jkdata.type=="yundisk"){
        d = d.concat(erdata.lists);
    }else{
        //取之前足迹记录，用于自动定位之前的线路和分页
        let smark = {};
        try {
            eval('SrcMark = ' + fetch(rulepath + "Mark.json"));
            if (SrcMark[MY_URL]) {
                smark.line = SrcMark[MY_URL].line;
                smark.page = SrcMark[MY_URL].page;
            }
        } catch (e) { }
        // 标识
        let lineid = parseInt(getMyVar(MY_URL+"_line", (smark.line||0).toString()));//线路index
        let pageid = parseInt(getMyVar(MY_URL+"_page", (smark.page||0).toString()));//分页index
        //设置记录线路足迹的数量
        let Marksum = 100;
        //生成线路
        d.push({
            title: getMyVar('shsort') == '1'?'““””<b><span style="color: #FF0000">∨</span></b>' : '““””<b><span style="color: #1aad19">∧</span></b>',
            url: $("#noLoading#").lazyRule(() => {
                if (getMyVar('shsort') == '1') { putMyVar('shsort', '0'); } else { putMyVar('shsort', '1') };
                refreshPage(false);
                return 'toast://切换排序成功'
            }),
            col_type: 'scroll_button',
            extra: {
                cls: "Juloadlist"
            }
        })

        erdata.tabs.forEach((it,i)=>{
            it = it.replace(/|||/g, '').trim();
            if(it && !/播放错误会自动换源/.test(it)){
                d.push({
                    title: lineid == i ? getHead(it,Color1,1) : getHead(it,Color2),
                    url: $("#noLoading#").lazyRule((url, nowid, newid, Marksum) => {
                        if (nowid != newid) {
                            let markFile = globalMap0.getVar('Jy_gmParams').rulepath + "Mark.json";
                            let SrcMark = "";
                            try {
                                eval('SrcMark = ' + markFile);
                            } catch (e) {  }
                            if (SrcMark == "") {
                                SrcMark = {};
                            }
                            SrcMark[url] = SrcMark[url] || {};
                            SrcMark[url].line = newid;
                            let key = 0;
                            let one = "";
                            for (var k in SrcMark) {
                                key++;
                                if (key == 1) { one = k }
                            }
                            if (key > Marksum) { delete SrcMark[one]; }
                            writeFile(markFile, JSON.stringify(SrcMark));
                            putMyVar(url+"_line", newid);
                            refreshPage(false);
                        }
                        return '#noHistory#hiker://empty'
                    }, MY_URL, lineid, i, Marksum),
                    col_type: 'scroll_button',
                    extra: {
                        cls: "Juloadlist",
                        backgroundColor: lineid == i?"#20" + Color1.replace('#',''):""
                    }
                })
            }
        })

        //生成选集
        let 列表 = erdata.lists.length>lineid?erdata.lists[lineid].filter(v=>v):[];
        if(列表.length>0){
            function checkAndReverseArray(arr) {
                const numbers = [];
                arr.slice(0, 50).forEach(it=>{
                    const digits = it.split('$')[0].match(/\d+/);
                    if (digits) {
                        numbers.push(parseInt(digits[0]));
                    }
                })

                if (numbers.length < 3) {
                    return arr;
                }
                let increasingCount = 0;
                let decreasingCount = 0;
                for (let i = 1; i < numbers.length; i++) {
                    if (numbers[i] > numbers[i - 1]) {
                        increasingCount++;
                    } else if (numbers[i] < numbers[i - 1]) {
                        decreasingCount++;
                    }
                }
                if (increasingCount > decreasingCount) {
                    return arr;
                } else {
                    return arr.reverse();
                }
            }
            try{
                列表 = checkAndReverseArray(列表);
            }catch(e){
                //xlog('强制修正选集顺序失败>'+e.message)
            }
        }

        //分页定义
        let partpage = storage0.getItem('partpage') || {};
        if(partpage.ispage){//启用分页
            let 每页数量 = partpage.pagenum || 40; // 分页的每页数量       
            let 翻页阀值 = partpage.partnum || 100; // 分页的翻页阀值，超过多少才显示翻页
            
            if (列表.length > 翻页阀值) { 
                let 最大页数 = Math.ceil(列表.length / 每页数量);  
                let 分页页码 = pageid + 1; //当前页数
                if (分页页码 > 最大页数) { //防止切换线路导致页数数组越界
                    分页页码 = 最大页数;
                }
                let 分页链接 = [];
                let 分页名 = [];
                function getNewArray(array, subGroupLength) {
                    let index = 0;
                    let newArray = [];
                    while(index < array.length) {
                        newArray.push(array.slice(index, index += subGroupLength));
                    }
                    return newArray;
                }
                let 分页s = getNewArray(列表, 每页数量);//按每页数据切割成小数组

                分页s.forEach((it,i)=>{
                    分页链接.push($("#noLoading#").lazyRule((url,nowid,newid,Marksum) => {
                        if(nowid != newid){
                            let markFile = globalMap0.getVar('Jy_gmParams').rulepath + "Mark.json";
                            let SrcMark = "";
                            try {
                                eval('SrcMark = ' + markFile);
                            } catch (e) {  }
                            if (SrcMark == "") {
                                SrcMark = {};
                            }
                            SrcMark[url] = SrcMark[url] || {};
                            SrcMark[url].page = newid;
                            let key = 0;
                            let one = "";
                            for (var k in SrcMark) {
                                key++;
                                if (key == 1) { one = k }
                            }
                            if (key > Marksum) { delete SrcMark[one]; }
                            writeFile(markFile, JSON.stringify(SrcMark));
                            putMyVar(url+"_page", newid);
                            refreshPage(false);
                        }
                        return 'hiker://empty'
                    }, MY_URL, pageid, i, Marksum))
                    let start = i * 每页数量 + 1;
                    let end = i * 每页数量 + it.length;
                    let title = start + ' - ' + end;
                    分页名.push(pageid==i?'““””<span style="color: ' + Color1 + '">'+title:title);
                })
                d.push({
                    col_type: "blank_block",
                    extra: {
                        cls: "Juloadlist"
                    }
                });
                d.push({
                    title: 分页页码==1?"↪️尾页":"⏮️上页",
                    url: 分页页码==1?分页链接[分页名.length-1]:分页链接[pageid-1],
                    col_type: 'text_4',
                    extra: {
                        cls: "Juloadlist"
                    }
                })
                d.push({
                    title: 分页名[pageid],
                    url: $(分页名, 2).select((分页名,分页链接) => {
                        return 分页链接[分页名.indexOf(input)];
                    },分页名,分页链接),
                    col_type: 'text_2',
                    extra: {
                        cls: "Juloadlist"
                    }
                })
                d.push({
                    title: 分页页码==分页名.length?"首页↩️":"下页⏭️",
                    url: 分页页码==分页名.length?分页链接[0]:分页链接[pageid+1],
                    col_type: 'text_4',
                    extra: {
                        cls: "Juloadlist"
                    }
                })
                列表 = 分页s[pageid];//取当前分页的选集列表
            }
        }
        if (getMyVar('shsort') == '1') {
            列表.reverse();
        }
        if(列表.length==0){
            d.push({
                title: '当前无播放选集，可切换站源试试！',
                url: '#noHistory#hiker://empty',
                col_type: 'text_center_1',
                extra: {
                    cls: "Juloadlist"
                }
            });
        }else{
            let flag = erdata.flags.length>lineid?erdata.flags[lineid]:erdata.tabs.length>lineid?erdata.tabs[lineid]:"";
            let dataObj = {};
            if(erdata.parse_api&&erdata.parse_api.length>0){
                dataObj.parse_api = erdata.parse_api;
            }
            if(flag){
                dataObj.flag = flag;
            }
            let lazy;
            if(/hipy_/.test(jkdata.type)){
                dataObj.stype = jkdata.type;
                dataObj.sname = jkdata.name;
                dataObj.surl = jkdata.url;
                dataObj.sext = jkdata.ext;
            }
            let novel = erdata.detailtype=="小说";
            /*
            if(novel){
                lazy = $("#readTheme##autoPage#").rule((dataObj)=>{
                    let vipUrl = MY_URL.split('##')[1].split('#')[0];
                    let play;
                    if(dataObj.stype=="hipy_t3"){
                        let sdata = {name: dataObj.sname, url: dataObj.surl, ext: dataObj.sext}
                        let drpy = GM.defineModule("SrcJyDrpy", config.依赖.replace(/[^/]*$/,'') + "SrcJyDrpy.js").get(sdata);
                        play = JSON.parse(drpy.play(dataObj.flag, vipUrl, []));
                    }else if(dataObj.stype=="hipy_t4"){
                        play = JSON.parse(request(dataObj.surl+'&flag='+dataObj.sname+"&extend="+dataObj.sext+'&play='+vipUrl));
                    }
                    let data = JSON.parse(play.url.replace('novel://',''));
                    let d = [];
                    d.push({
                        title: '<big>' + data.title + '</big>',
                        col_type: 'rich_text',
                        extra: {
                            click: true
                        }
                    });
                    d.push({
                        title: "　　" + data.content.replace(/(&nbsp;){1,}/g, '　　').replace(/\n/g, "<p>　　"),
                        col_type: "rich_text",
                        extra: {
                            textSize: 18,
                            click: true
                        }
                    });
                    setResult(d)
                }, dataObj);
            }else{
                */
                lazy = $("").lazyRule((dataObj) => {
                    return $("#readTheme##autoPage#").rule((dataObj)=>{
                        let vipUrl = MY_URL.split('##')[1].split('#')[0];
                        let play;
                        if(dataObj.stype=="hipy_t3"){
                            let sdata = {name: dataObj.sname, url: dataObj.surl, ext: dataObj.sext}
                            let drpy = GM.defineModule("SrcJyDrpy", config.依赖.replace(/[^/]*$/,'') + "SrcJyDrpy.js").get(sdata);
                            play = JSON.parse(drpy.play(dataObj.flag, vipUrl, []));
                        }else if(dataObj.stype=="hipy_t4"){
                            play = JSON.parse(request(dataObj.surl+'&flag='+dataObj.sname+"&extend="+dataObj.sext+'&play='+vipUrl));
                        }
                        let data = JSON.parse(play.url.replace('novel://',''));
                        let d = [];
                        d.push({
                            title: '<big>' + data.title + '</big>',
                            col_type: 'rich_text',
                            extra: {
                                click: true
                            }
                        });
                        d.push({
                            title: "　　" + data.content.replace(/(&nbsp;){1,}/g, '　　').replace(/\n/g, "<p>　　"),
                            col_type: "rich_text",
                            extra: {
                                textSize: 18,
                                click: true
                            }
                        });
                        setResult(d)
                    }, dataObj);
                    //require(config.依赖.replace(/[^/]*$/,'') + 'SrcParseS.js');
                    //return SrcParseS.聚影(input, dataObj);
                }, dataObj);
            //}
            
            let playSet = storage0.getItem('playSet') || {};
            let len = 列表.slice(0, 10).concat(列表.slice(-10)).reduce((max, str) => Math.max(max, str.split('$')[0].replace(name,"").trim().length), 0);
            let col_type = 列表.length > 4 && len < 5 ? 'text_4' : len > 10 ? 'text_1' : len>4&&len<7 ? 'text_3' :'text_2';
            let sniffer = erdata["sniffer"];

            require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyMethod.js');
            for(let i=0; i<列表.length; i++) {
                let playtitle = 列表[i].split('$')[0];
                playtitle = playtitle==name?'正片':playtitle.replace(name+" - ","").replace(name+"_","").replace(name,"").replace("《》","").replace("<>","").replace("[]","").trim();
                playtitle = decodeURIComponent(playtitle);
                let playurl = (novel?"hiker://empty##":"")+列表[i].split('$')[1].trim();

                let obj = {
                    id: name + "_选集_" + (pageid?pageid+"_":"") + i,
                    playUrl: playurl,
                    sniffer: sniffer,
                    cachem3u8: playSet.cachem3u8
                }
                let extra = getPlayExtra(obj);

                d.push({
                    title: "““””<small>"+playtitle.replace(/第|集|话|期|new|最新|新/g, '')+"</small>",
                    url: playurl + lazy,
                    col_type: col_type,
                    extra: extra
                });
            }
            updateParams = 1;
        }
    }
    
    //底部说明
    d.push({
        desc: '‘‘’’<small><small><font color=#bfbfbf>本规则为空壳小程序，仅供学习交流使用，不提供任何内容。</font></small></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1',
        extra: {
            id: updateItemid,
            lineVisible: false
        }
    });
    setResult(d);
    if(pic && pic!=MY_PARAMS.pic && !/^hiker/.test(pic)){
        setPagePicUrl(pic);
    }
    if(updateParams){
        //判断是否从收藏或历史进入二级，且接口文件还在data目录的，更新到rule目录
        if(typeof(isFromHistoryPage)!="undefined"){
            if(isFromHistoryPage() && jkdata.url.startsWith(libspath)){
                jkdata.url = jkfilespath + jkdata.url.substr(jkdata.url.lastIndexOf('/')+1);         
            } 
        }
        //保存换源数据进MY_PARAMS
        if(sextra.url && (sextra.url!=MY_PARAMS.url || MY_PARAMS.data.url!=jkdata.url)){
            setPageParams({
                url: sextra.url,
                pic: pic,
                pageTitle: name,
                data: jkdata
            });
        }
        //设置二级收藏更新最新章节
        setLastChapterRule('js:' + $.toString((url,jkdata)=>{
            require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyData.js');
            setLastChapter(url,jkdata);
        }, MY_URL, jkdata))
    }
}

//点播一级
function dianboyiji(testSource) {
    addListener("onClose", $.toString(() => {
        clearMyVar('点播动态加载loading');
        clearMyVar('点播一级jkdata');
    }));
    let d = [];
    let jkdata = {};
    if(testSource){
        log("接口测试模式");
        jkdata = testSource;
    }else if(storage0.getMyVar('点播一级jkdata')){
        jkdata = storage0.getMyVar('点播一级jkdata');
    }else{
        let yxdatalist = getDatas('jk', 1);
        let index = yxdatalist.indexOf(yxdatalist.filter(d => d.type==sourceType && d.name==sourceName )[0]);
        jkdata = yxdatalist[index] || {};
        if(jkdata.name){
            setPageTitle(jkdata.name);
        }
    }
    let sname = jkdata.name;
    if(getMyVar('currentSname') != sname){
        clearMyVar('SrcJu_dianbo$分类');
        clearMyVar('SrcJu_dianbo$fold');
        clearMyVar('SrcJu_dianbo$classCache');
        clearMyVar('SrcJu_dianbo$flCache');
        putMyVar('currentSname', sname);
    }

    if(MY_PAGE==1){
        let longClick = [{
            title: "分享当前源",
            js: $.toString((data) => {
                if(!data.url){
                    return "toast://当前源无效，无法分享";
                }
                require(config.依赖.replace(/[^/]*$/,'') + 'SrcJySet.js');
                return JYshare('jk', getItem("sharePaste",""), data);
            },jkdata)
        }];
        if(!testSource){
            longClick.push({
                title: "删除当前源",
                js: $.toString(() => {
                    require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
                    deleteData('jk', homeSource);
                    return "toast://已处理";
                })
            },{
                title: "编辑当前源",
                js: $.toString((data) => {
                    return $('hiker://empty#noRecordHistory##noHistory#').rule((data) => {
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJySet.js');
                        return jiekou(data);
                    }, data)
                },jkdata)
            })
        }
        
        d.push({
            title: "换主页源",
            url: testSource?"toast://测试模式下不能更换主页源":$('#noLoading#').lazyRule(() => {
                require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
                return selectSource();
            }),
            pic_url: getIcon("点播-主页.svg"),
            col_type: "icon_3_round_fill",
            extra: {
                longClick: longClick
            }
        })
        let searchModeS = ["代理聚搜","分组接口","当前接口","当前页面"].map(v=>{
            return v==getItem("接口搜索方式","当前接口")?`‘‘’’<strong><font color="`+getItem('主题颜色','#6dc9ff')+`">`+v+`√</front></strong>`:v+'  ';
        });

        d.push({
            title: "搜索方式",
            url: $(searchModeS,1).select(()=>{
                input = input.replace(/[’‘]|<[^>]*>| |√/g, "");
                setItem("接口搜索方式",input);
                refreshPage();
                return "toast://搜索方式设置为："+input+(input=="当前页面"?"，只能搜索1页":"");
            }),
            pic_url: getIcon("点播-搜索.svg"),
            col_type: "icon_3_round_fill"
        })
        d.push({
            title: "管理设置",
            url: testSource?"toast://测试模式下不能更换主页源":$(["接口管理","解析管理","资源管理","站源切换","资源码订阅"],1).select(()=>{
                if(input=="接口管理"){
                    if(getItem("sourceMode")=="2"){
                        return "toast://订阅文件模式，无法管理本地接口";
                    }
                    putMyVar('guanli','jk');
                    return $("hiker://empty#noRecordHistory##noHistory##noRefresh#").rule(() => {
                        setPageTitle('接口管理');
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJySet.js');
                        SRCSet();
                    })
                }else if(input=="解析管理"){
                    if(getItem("sourceMode")=="2"){
                        return "toast://订阅文件模式，无法管理本地解析";
                    }
                    putMyVar('guanli','jx');
                    return $("hiker://empty#noRecordHistory##noHistory##noRefresh#").rule(() => {
                        setPageTitle('解析管理');
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJySet.js');
                        SRCSet();
                    })
                }else if(input=="资源管理"){
                    return $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                        setPageTitle('资源管理');
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJySet.js');
                        resource();
                    })
                }else if(input=="站源切换"){
                    let sm;
                    if(getItem("sourceMode")=="2"){
                        clearItem("sourceMode");
                        sm = "本地接口模式";
                    }else{
                        setItem("sourceMode","2");
                        sm = "订阅文件模式";
                    }
                    return "toast://站源获取设置为："+sm;
                }else if(input=="资源码订阅"){
                    return $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
                        setPageTitle("资源码订阅管理");
                        subResource();
                    })
                }
            }),
            pic_url: getIcon("点播-设置.svg"),
            col_type: "icon_3_round_fill",
            extra: {
                longClick: [{
                    title: "切换列表样式",
                    js: $.toString(() => {
                        let sm;
                        if(getItem("点播一级样式","")==""){
                            setItem("点播一级样式", "movie_3_marquee");
                            sm = "movie_3_marquee";
                            
                        }else{
                            clearItem("点播一级样式");
                            sm = "movie_3";
                        }
                        refreshPage(false);
                        return "toast://已切换为" + sm;
                    })
                }]
            }
        })

        if(!sname){
            d.push({
                col_type: "line_blank"
            });
            d.push({
                title: "主页源不存在\n需先选择配置主页源",
                desc: "前提是本地有接口或订阅未失效",
                url: 'toast://点上面换主页源按源',
                col_type: "text_center_1",
                extra: {
                    lineVisible: false
                }
            })
        }else{
            if (typeof(setPreResult)!="undefined" && getMyVar('点播动态加载loading')!='1') {
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
                putMyVar('点播动态加载loading', '1');
            }
            /*
                    return $('hiker://empty#noRecordHistory##noHistory#').rule((name,data) => {
                        require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyData.js');
                        let ssdata = getSsData(name,data).vodlists;
                        setResult(ssdata);
                    }, input, data);
            */
            let searchurl = $('').lazyRule((jkdata) => {
                if(getItem('接口搜索方式','当前接口')=="当前接口"){
                    if(jkdata){
                        storage0.putMyVar('搜索临时搜索数据', jkdata);
                        return 'hiker://search?s='+input+'&rule='+MY_RULE.title;
                    }else{
                        return 'toast://未找到接口数据'
                    }
                }else if(getItem('接口搜索方式')=="分组接口"){
                    putMyVar('搜索临时搜索分组', jkdata.group||jkdata.type);
                    return 'hiker://search?s='+input+'&rule='+MY_RULE.title;
                }else if(getItem('接口搜索方式')=="代理聚搜"){
                    return 'hiker://search?s='+input+'&rule='+MY_RULE.title;
                }else if(getItem('接口搜索方式')=="当前页面"){
                    require(config.依赖); 
                    let d = search(input, 'dianboyiji' , jkdata);
                    if(d.length>0){
                        deleteItemByCls('dianbosousuolist');
                        addItemAfter('dianbosousuoid', d);
                    }else{
                        return 'toast://无结果';
                    }
                    return 'hiker://empty';
                }
            },jkdata);
            
            d.push({
                title: "搜索",
                url: $.toString((searchurl) => {
                    input = input.trim();
                    if(input == ''){
                        return "hiker://empty"
                    }
                    return input + searchurl;
                },searchurl),
                desc: "搜你想看的...",
                col_type: "input",
                extra: {
                    id: 'dianbosousuoid',
                    titleVisible: true,
                    onChange: $.toString(() => {
                        if(input==""){
                            deleteItemByCls('dianbosousuolist');
                        }
                    })
                }
            });
            for (let i = 0; i < 4; i++) {
                d.push({
                    col_type: "blank_block"
                })
            }
        }
    }
    if(sname){
        try{
            require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyData.js');
            let yidata = getYiData(jkdata);
            let fllists = yidata.fllists;
            if(fllists){
                d = d.concat(fllists);
            }else if(yidata.error['fl']){
                d.push({
                    title: "分类获取失败",
                    desc: '无法访问或源失效，点击查看网页',
                    url: MY_URL + '#noHistory#',
                    col_type: 'text_center_1'
                }); 
            }

            let vodlists = yidata.vodlists;

            if(vodlists && vodlists.length>0){
                let sniffer = yidata["sniffer"] || {};
                let videocontain = sniffer["contain"] || undefined;
                let videoexclude = sniffer["exclude"] || ['m3u8.js','?url='];
                let video_col_type = getItem("点播一级样式", "movie_3");
                vodlists.forEach(list=>{
                    let vodname = list.vod_name;
                    let vodurl = list.vod_url;
                    if(vodname){
                        vodname = vodname.replace(/<[^>]+>/g, '').replace(/在线观看/g,'').replace('&middot;','·');
                        let voddesc = list.vod_desc || "";
                        let vodpic = list.vod_pic;
                        vodpic = vodpic.replace('/img.php?url=', '').replace('/tu.php?tu=', '');
                        
                        let regex = /url\(['"]?([^'"]+)['"]?\)/;
                        let match = vodpic.match(regex);
                        if (match && match[1]) {
                            vodpic = match[1];
                        }
                        
                        if(vodpic.startsWith("//")){
                            vodpic = "https:" + vodpic;
                        }
                        if(!/^http|^hiker/.test(vodpic)){
                            vodpic = getHome(vodurl) + '/' + vodpic;
                        }
                        let dataObj = {};
                        if(/hipy_/.test(jkdata.type)){
                            dataObj.stype = jkdata.type;
                            dataObj.sname = jkdata.name;
                            dataObj.surl = jkdata.url.startsWith('hiker://')?getPath(jkdata.url):jkdata.url;
                            dataObj.sext = jkdata.ext;
                        }

                        d.push({
                            title: vodname,
                            desc: voddesc.replace(/<\/?.+?\/?>/g,''),
                            pic_url: vodpic + (vodpic.includes('@')?"":"@Referer="),
                            url: vodurl=="no_data"?"toast://无数据":/^hiker/.test(vodurl)?vodurl:list.vod_play?$("hiker://empty").lazyRule((dataObj, vod_play) => {
                                require(config.依赖.replace(/[^/]*$/,'') + 'SrcParseS.js');
                                return SrcParseS.聚影(vod_play, dataObj);
                            }, dataObj, list.vod_play):$("hiker://empty#immersiveTheme##autoCache#").rule(() => {
                                require(config.依赖);
                                dianboerji()
                            }),
                            col_type: yidata.coltype || video_col_type,
                            extra: list.vod_play?{
                                id: vodurl,
                                url: /pan\.quark\.cn|drive\.uc\.cn/.test(vodurl)?undefined:vodurl,
                                jsLoadingInject: true,
                                blockRules: ['.m4a', '.mp3', '.gif', '.jpeg', '.jpg', '.ico', '.png', 'hm.baidu.com', '/ads/*.js', 'cnzz.com'],
                                videoRules: videocontain,
                                videoExcludeRules: videoexclude
                            }:{
                                url: vodurl,
                                pic: vodpic,
                                pageTitle: vodname,
                                data: jkdata
                            }
                        })
                    }
                })
            }else if(yidata.error['vod'] && MY_PAGE==1){
                d.push({
                    title: "列表获取失败",
                    desc: '无法访问或源失效，点击查看网页',
                    url: (yidata.listurl?yidata.listurl:MY_URL) + '#noHistory#',
                    col_type: 'text_center_1'
                }); 
            }else if(vodlists && vodlists.length == 0 && MY_PAGE==1){
                d.push({
                    title: '列表为空',
                    desc: '点击查看网页',
                    url: (yidata.listurl?yidata.listurl:MY_URL) + '#noHistory#',
                    col_type: 'text_center_1'
                });
            }
        }catch(e){
            d.push({
                title: '源接口异常了，请更换',
                desc: '调用一级数据异常>' + e.message + ' 错误行#' + e.lineNumber,
                url: MY_URL + '#noHistory#',
                col_type: 'text_center_1'
            });
            log(jkdata.name+'>调用一级数据异常>' + e.message + ' 错误行#' + e.lineNumber);
        }
    }
    deleteItemByCls("loading_gif");
    setResult(d);
}

//一级
function yiji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('SrcJu_homeHistory');
    }));
    addListener('onRefresh', $.toString(() => {
        clearMyVar('SrcJu_homeHistory');
    }));

    if(MY_RULE.title=="聚影✓"){
        toast("此小程序已停用，请重新导入聚影");
    }
    if(getMyVar('SrcJuying-VersionCheck', '0') == '0'){
        let programversion = 0;
        try{
            programversion = $.require("config").version || MY_RULE.version || 0;
        }catch(e){}
        if(programversion<8){
            confirm({
                title: "温馨提示",
                content: "发现小程序新版本\n预留本地库依赖切换逻辑",
                confirm: $.toString(() => {
                    return "海阔视界首页频道规则【聚影】￥home_rule_url￥http://hiker.nokia.press/hikerule/rulelist.json?id=6996"
                }),
                cancel: $.toString(() => {
                    return "toast://不升级小程序，功能不全或有异常"
                })
            });
        }
        Version();
        downloadFiles();//下载必要的依赖文件
        putMyVar('SrcJuying-VersionCheck', '1');
    }

    let d = [];
    if(MY_PAGE==1){
        require(config.依赖.replace(/[^/]*$/,'').replace('/Ju/','/master/') + 'SrcJyMenu.js');
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
        let btnmn3 = getItem('buttonmenu3',"点播");
        let btnmn4 = getItem('buttonmenu4',"直播");
        let btnmn5 = getItem('buttonmenu5',"云盘");
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
                                require(config.依赖.replace(/[^/]*$/,'').replace('/Ju/','/master/') + 'SrcJySet.js');
                                manageSet();
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
    let filterJk = getItem('主页搜索接口范围','');
    d.push({
        title: "搜索",
        url: $.toString((searchurl) => {
            input = input.trim();
            if(input == ''){
                return "hiker://empty"
            }
            if(/www\.aliyundrive\.com|www\.alipan\.com/.test(input)){
                input = input.replace('http','\nhttp');
                return $("hiker://empty#noRecordHistory##noHistory#").rule((input) => {
                    require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyAliDisk.js');
                    aliShareUrl(input);
                },input);
            }else{
                return input + searchurl;
            }
        },searchurl),
        desc: "搜索接口范围，" + (filterJk==""?"全部接口":filterJk.includes('[')?"TAG："+filterJk:"分组："+filterJk),
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
        title: "📑"+(getItem('searchrecordide')=='1'?"关":"开")+"搜索记录",
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
        title: "🎥"+(getItem('historyEnable')=='1'?"关":"开")+"观看记录",
        url: $('#noLoading#').lazyRule(() => {
            if(getItem('historyEnable')=='1'){
                clearItem('historyEnable');
            }else{
                setItem('historyEnable','1');
            }
            refreshPage(false);
            return "toast://已切换"
        }),
        col_type: 'scroll_button'
    });
    d.push({
        title: "🔍搜索接口",
        url: $('#noLoading#').lazyRule(() => {
            require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
            let datalist = getDatas("jk", 1);
            let groupNames = getJiekouGroups(datalist);
            groupNames.unshift("全部");
            let selectkeys = getJkTags(datalist);
            groupNames = groupNames.concat(selectkeys);
            return $(groupNames, 3).select(() => {
                if(input=='全部'){
                    clearItem('主页搜索接口范围');
                }else{
                    setItem('主页搜索接口范围', input);
                }
                refreshPage(false);
                return "toast://已切换"
            })
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
    
    if(getItem('historyEnable')=='1'){
        d.push({
            title: '<span style="color:#ff6600"><b>\t观看记录\t\t\t</b></span>',
            url: $('#noLoading#').lazyRule(() => {
                let i = parseInt(getMyVar('SrcJu_homeHistory','0')) + 1;
                require(config.依赖.replace(/[^/]*$/,'') + 'SrcJyPublic.js');
                putMyVar('SrcJu_homeHistory', i);
                
                deleteItemByCls('historylist');
                let h = getHistory(i);
                addItemAfter("historyid", h);
                return "hiker://empty";
            }),
            pic_url: getIcon("主页-记录.svg", 1),//'https://hikerfans.com/tubiao/red/40.png',
            col_type: 'avatar',
            extra: {
                id: "historyid"
            }
        });

        let items = getHistory();
        d = d.concat(items);
    }

    let resoufile = libspath + "resou.json";
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
        title: '<span style="color:#ff6600"><b>\t热搜榜单\t\t\t</b></span>',
        desc: '✅'+fenlei[ids],
        url: $(fenlei, 2, '选择热榜分类').select((fenlei) => {
            putMyVar("热榜分类",fenlei.indexOf(input));
            refreshPage(false);
            return "hiker://empty";
        },fenlei),
        pic_url: getIcon("主页-热搜.svg", 1),//'https://hikerfans.com/tubiao/red/73.png',//'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'avatar',
        extra: {
            id: "rousoubang"
        }
    });
    let rbcolor = getItem('主题颜色','#00ba99');
    list.forEach((item,i)=>{
        d.push({
            title: (i=="0"?'““””<span style="color:#ff3300">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="1"?'““””<span style="color:#ff6600">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:i=="2"?'““””<span style="color:#ff9900">' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title:'““””<span>' + (parseInt(i)+1).toString() + '</span>\t\t' + item.title)+'\n<small><span style="color:'+rbcolor+'">'+item.comment+'</small>',
            url: item.title + searchurl,
            pic_url: item.cover,
            desc: item.description,
            col_type: "movie_1_vertical_pic"
        });
    })

    deleteItemByCls("loading_gif");
    setResult(d);

    //一些自动检查调用在首页加截后，间隔24小时
    if (!getMyVar('startCheck') && nowtime > (oldtime+24*60*60*1000)) {
        clearJkSort(); //清理历史接口排序信息
        clearJkFiles(); //清理接口残留文件
        updateResource(); //检查更新订阅资源码
        putMyVar('startCheck', 1);
    }
}

// 版本检测
function Version() {
    if(getItem('本地依赖库')=="1"){
        let loaclfile = "hiker://files/data/"+MY_RULE.title+"/code/SrcTmplVersion.js";
        if(fileExist(loaclfile)){
            eval(fetch(loaclfile));
            setItem('Version', newVersion.SrcJuying);
        }
    }
    var nowVersion = getItem('Version', "0.1");//现在版本 
    var nowtime = Date.now();
    var oldtime = parseInt(getItem('VersionChecktime','0').replace('time',''));
    if (nowtime > (oldtime+24*60*60*1000) && getItem("依赖","").startsWith("http")) {
        try {
            eval(request(getItem("依赖","").replace(/[^/]*$/,'') + 'SrcTmplVersion.js'))
            if (parseFloat(newVersion.SrcJuying) > parseFloat(nowVersion)) {
                confirm({
                    title:'发现新版本，是否更新？', 
                    content:'本地V'+nowVersion+' => 云端V'+newVersion.SrcJuying + '\n' + (newVersion.hint||""), 
                    confirm: getItem('本地依赖库')=="1"?"toast://管理中手工检查更新":$.toString((nowtime,version,updateRecords) => {
                        setItem('Version', version);
                        setItem('VersionChecktime', nowtime+'time');
                        deleteCache();
                        refreshPage();

                        const hikerPop = $.require("http://hiker.nokia.press/hikerule/rulelist.json?id=6966");
                        hikerPop.updateRecordsBottom(updateRecords);
                    },nowtime, newVersion.SrcJuying, newVersion.JYUpdateRecords.slice(0, 3)),
                    cancel:''
                })
                log('检测到新版本！\nV'+newVersion.SrcJuying+'版本》'+newVersion.SrcJuyingdesc[newVersion.SrcJuying]);
            }
            putMyVar('SrcJuying-Version', '-V'+newVersion.SrcJuying);
        } catch (e) { }
    }else{
        putMyVar('SrcJuying-Version', '-V'+nowVersion);
    }
}
