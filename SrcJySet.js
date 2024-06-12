////本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');//加载公共文件

function SRCSet() {
    addListener("onClose", $.toString(() => {
        clearMyVar('guanli');
        clearMyVar('SrcJu_批量选择模式');
        clearMyVar('SrcJu_duoselect');
        clearMyVar('groupmenu');
    }));

    if(getMyVar('guanli','')==""){putMyVar('guanli','jk');}

    let guanliType = getMyVar('guanli', 'jk');
    var d = [];
    /*
    d.push({
        title: guanliType=="jk"?colorTitle('接口管理', '#f13b66a'):'接口管理',
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jk');refreshPage(false);'toast://已切换到接口管理';`,
        img: "https://hikerfans.com/tubiao/movie/98.svg",
        col_type: "icon_small_3",
        extra: {
            newWindow: true,
            windowId: MY_RULE.title + "云盘",
            longClick: [{
                title: "☁️云盘接口",
                js: $.toString(() => {
                    return $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                        yundiskjiekou();
                    })
                })
            }]
        }
    });
    d.push({
        title: guanliType=="jk"?'解析管理':colorTitle('解析管理', '#f13b66a'),
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jx');refreshPage(false);'toast://已切换到解析管理';`,
        img: "https://hikerfans.com/tubiao/movie/105.svg",
        col_type: "icon_small_3"
    });
    d.push({
        title: '扩展中心',
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            extension();
        }),
        img: "https://hikerfans.com/tubiao/ke/156.png",
        col_type: "icon_small_3"
    });

    d.push({
        col_type: "line_blank"
    });
    */
    d.push({
        title: '增加',
        url: guanliType=="jk"?$('#noLoading#').lazyRule(() => {
            return 'toast://不支持手工增加接口'
        }):$('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            jiexi('add');
        }),
        img: "https://hikerfans.com/tubiao/more/25.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: '操作',
        url: $(["批量选择","清空所有"],2,"选择操作功能项").select(()=>{
            clearMyVar('groupmenu');
            if(input=="批量选择"){
                let sm;
                if(getMyVar('SrcJu_批量选择模式')){
                    clearMyVar('SrcJu_批量选择模式');
                    sm = "退出批量选择模式";
                }else{
                    putMyVar('SrcJu_批量选择模式','1');
                    sm = "进入批量选择模式";
                }
                refreshPage(false);
                return "toast://"+sm;
            }else if(input=="清空所有"){
                if(getMyVar('guanli', 'jk')=="jk"){
                    var sm = "接口";
                }else{
                    var sm = "解析";
                }
                return $("确定要删除本地所有的"+sm+"吗？").confirm(()=>{
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                    deleteData(getMyVar('guanli', 'jk'));
                    refreshPage(false);
                    return 'toast://已全部清空';
                })
            }
        }),
        img: "https://hikerfans.com/tubiao/more/290.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: '导入',
        url: $("","聚影2口令").input(()=>{
            if(input==""){
                return 'toast://不能为空';
            }
            if(input.indexOf('@import=js:')>-1){
                input = input.split('@import=js:')[0].replace('云口令：','').trim();
            }
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            return JYimport(input);
        }),
        img: "https://hikerfans.com/tubiao/more/43.png",
        col_type: "icon_small_4"
    });
    let pastes = getPastes();
    pastes.push('云口令文件');

    let datalist = getDatas(guanliType);
    let jkdatalist;
    if(getMyVar("SrcJu_seacrhJiekou")){
        jkdatalist = datalist.filter(it=>{
            return it.name.indexOf(getMyVar("SrcJu_seacrhJiekou"))>-1;
        })
    }else{
        let group = guanliType=='jk'?getMyVar("SrcJu_jiekouGroup",""):"";
        jkdatalist = getGroupLists(datalist, group);
    }
    let yxdatalist = jkdatalist.filter(it=>{
        return !it.stop;
    });
    d.push({
        title: '分享',
        url: yxdatalist.length==0?'toast://有效数据为空，无法分享':$(pastes,2).select((lx)=>{
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            return JYshare(lx, input);
        }, guanliType),
        img: "https://hikerfans.com/tubiao/more/3.png",
        col_type: "icon_small_4",
        extra: {
            longClick: [{
                title: '单接口分享剪贴板：' + (Juconfig['sharePaste'] || "自动选择"),
                js: $.toString((cfgfile, Juconfig) => {
                    let pastes = getPastes();
                    pastes.unshift('自动选择');
                    return $(pastes,2,'指定单接口分享时用哪个剪贴板').select((cfgfile,Juconfig) => {
                        if(input=="自动选择"){
                            delete Juconfig["sharePaste"];
                        }else{
                            Juconfig["sharePaste"] = input;
                        }
                        writeFile(cfgfile, JSON.stringify(Juconfig));
                        refreshPage(false);
                        return 'toast://单接口分享剪贴板已设置为：' + input;
                    }, cfgfile, Juconfig)
                },cfgfile, Juconfig)
            }]
        }
    });
    d.push({
        col_type: "line"
    });
    
    d.push({
        title: "🔍",
        url: $.toString(() => {
            putMyVar("SrcJu_seacrhJiekou",input);
            refreshPage(false);
        }),
        desc: "搜你想要的...",
        col_type: "input",
        extra: {
            defaultValue: getMyVar('SrcJu_seacrhJiekou',''),
            titleVisible: true
        }
    });
    if(guanliType=='jk' && datalist.length){
        let groupNames = getJiekouGroups(datalist);
        groupNames.unshift("全部");
        groupNames.forEach(it =>{
            let obj = {
                title: getMyVar("SrcJu_jiekouGroup","全部")==it?`““””<b><span style="color: #3399cc">`+it+`</span></b>`:it,
                url: $('#noLoading#').lazyRule((it) => {
                    if(getMyVar("SrcJu_jiekouGroup")!=it){
                        putMyVar("SrcJu_jiekouGroup",it);
                        refreshPage(false);
                    }
                    return "hiker://empty";
                },it),
                col_type: 'scroll_button'
            }
            
            if(it == "全部"){
                obj.extra = {
                    longClick: [{
                        title: "列表排序：" + getItem("sourceListSort", "update"),
                        js: $.toString(() => {
                            return $(["更新时间","接口名称"], 1).select(() => {
                                if(input=='接口名称'){
                                    setItem("sourceListSort","name");
                                }else{
                                    clearItem("sourceListSort");
                                }
                                refreshPage(false);
                            })
                        })
                    }]
                }
            }
            
            d.push(obj);
        })
    }
    if(getMyVar('SrcJu_批量选择模式')){
        d.push({
            col_type: "blank_block"
        });
        d.push({
            title: "反向选择",
            url: $('#noLoading#').lazyRule((jkdatalist) => {
                jkdatalist = JSON.parse(base64Decode(jkdatalist));
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                duoselect(jkdatalist);
                return "toast://已反选";
            },base64Encode(JSON.stringify(jkdatalist))),
            col_type: 'scroll_button'
        })
        d.push({
            title: "删除所选",
            url: $('#noLoading#').lazyRule(() => {
                let duoselect = storage0.getMyVar('SrcJu_duoselect') || [];
                if(duoselect.length==0){
                    return "toast://未选择";
                }
                return $("确定要删除选择的"+duoselect.length+"个接口？").confirm((duoselect)=>{
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                    deleteData(getMyVar('guanli', 'jk'), duoselect);
                    refreshPage(false);
                    return 'toast://已删除选择';
                }, duoselect)
            }),
            col_type: 'scroll_button'
        })
        if(guanliType=='jk'){
            d.push({
                title: "禁用所选",
                url: $('#noLoading#').lazyRule(() => {
                    let duoselect = storage0.getMyVar('SrcJu_duoselect') || [];
                    if(duoselect.length==0){
                        return "toast://未选择";
                    }
                    return $("确定要禁用选择的"+duoselect.length+"个接口？").confirm((duoselect)=>{
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                        dataEnable(getMyVar('guanli', 'jk'), duoselect, '禁用');
                        refreshPage(false);
                        return 'toast://已禁用选择';
                    },duoselect)
                }),
                col_type: 'scroll_button'
            })
            d.push({
                title: "调整分组",
                url: $('#noLoading#').lazyRule(()=>{
                        let duoselect = storage0.getMyVar('SrcJu_duoselect') || [];
                        if(duoselect.length>0){
                            return $("","选定的"+duoselect.length+"个接口新分组名").input((duoselect)=>{
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                                var filepath = getFile(getMyVar('guanli', 'jk'));
                                var datafile = fetch(filepath);
                                eval("var datalist=" + datafile+ ";");
                                datalist.forEach(data=>{
                                    if(duoselect.some(item => data.url==item.url)){
                                        if(input){
                                            data.group  = input;
                                        }else{
                                            delete data.group;
                                        }
                                    }
                                })
                                writeFile(filepath, JSON.stringify(datalist));
                                clearMyVar('SrcJu_duoselect');
                                refreshPage(false);
                                return "toast://已批量调整接口分组";
                            }, duoselect)
                        }else{
                            return "toast://请选择";
                        }
                    }),
                col_type: "scroll_button"
            });
        }
    }

    jkdatalist.forEach(it => {
        let selectmenu,datatitle,datadesc;
        if(guanliType=="jk"){
            datatitle = it.name + ' ('+it.type+')' + (it.group?' [' + it.group + ']':"");
            datadesc = it.url;
            selectmenu = ["分享", "删除", it.stop?"启用":"禁用"];
        }else{
            datatitle = (it.sort||0)+'-'+it.name+'-'+it.url;
            datadesc = it.ext&&it.ext.flag?it.ext.flag.join(','):"";
            selectmenu = ["分享","编辑", "删除"];
        }

        d.push({
            title: it.stop?'‘‘’’'+colorTitle(datatitle,'#f20c00'):datatitle,
            url: getMyVar('SrcJu_批量选择模式')?$('#noLoading#').lazyRule((data) => {
                data = JSON.parse(base64Decode(data));
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                duoselect(data);
                return "hiker://empty";
            },base64Encode(JSON.stringify(it))):$(selectmenu, 2).select((data,paste) => {
                data = JSON.parse(base64Decode(data));
                if (input == "分享") {
                    showLoading('分享上传中，请稍后...');
                    let oneshare = []
                    oneshare.push(data);
                    let pasteurl = sharePaste(aesEncode('SrcJuying2', JSON.stringify(oneshare)), paste||"");
                    hideLoading();
                    if (/^http|^云/.test(pasteurl) && pasteurl.includes('/')) {
                        pasteurl = pasteurl.replace('云6oooole', 'https://pasteme.tyrantg.com').replace('云5oooole', 'https://cmd.im').replace('云7oooole', 'https://note.ms').replace('云9oooole', 'https://txtpbbd.cn').replace('云10oooole', 'https://hassdtebin.com');   
                        log('剪贴板地址>'+pasteurl);
                        let code = '聚影2接口￥' + aesEncode('SrcJuying2', pasteurl) + '￥' + data.name;
                        copy('云口令：'+code+`@import=js:$.require("hiker://page/import?rule=`+MY_RULE.title+`");`);
                        return "toast://(单个)分享口令已生成";
                    } else {
                        return "toast://分享失败，剪粘板或网络异常>"+pasteurl;
                    }
                } else if (input == "编辑") {
                    log(data);
                    return $('hiker://empty#noRecordHistory##noHistory#').rule((data) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                        if(getMyVar('guanli', 'jk')=="jk"){
                            jiekou('update', data);
                        }else{
                            jiexi('update', data);
                        }
                    }, data)
                } else if (input == "删除") {
                    return $("确定删除："+data.name).confirm((data)=>{
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                        deleteData(getMyVar('guanli', 'jk'), data);
                        refreshPage(false);
                        return 'toast://已删除:'+data.name;
                    }, data)
                } else if (input == "禁用" || input == "启用" ) {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
                    let sm = dataEnable(getMyVar('guanli', 'jk'), data, input);
                    refreshPage(false);
                    return 'toast://' + sm;
                }
            }, base64Encode(JSON.stringify(it)), Juconfig['sharePaste']),
            desc: datadesc,
            col_type: "text_1",
            extra: {
                id: it.url
            }
        });
    })
    d.push({
        title: "‘‘’’<small><font color=#f20c00>当前接口数：" + jkdatalist.length + "，总有效数："+yxdatalist.length+"</font></small>",
        url: 'hiker://empty',
        col_type: 'text_center_1'
    });
    
    
    setResult(d);
}

function getapitype(apiurl) {
    if(apiurl){
        if(apiurl.includes('.vod')){
            return "v1";
        }else if(apiurl.includes('/app/')){
            return "app";
        }else if(apiurl.includes('app.php')){
            return "v2";
        }else if(/iptv|Chengcheng/.test(apiurl)){
            return "iptv";
        }else if(apiurl.includes('provide/vod/')){
            return "cms";
        }else{
            return "";
        }
    }else{
        return "";
    }
}

//接口保存
function jiekousave(urls, mode) {
    if(urls.length==0){return 0;}
    let num = 0;
    try{
        let datalist = getDatas('jk');
        let olddatanum = datalist.length;

        if(mode==1){//全量模式时，先删除本地
            for(let i=0;i<datalist.length;i++){
                if(datalist[i].retain!=1){
                    if(/^hiker:\/\/files\/data\//.test(datalist[i].url)){
                        deleteFile(datalist[i].url);
                    }
                    datalist.splice(i,1);
                    i = i - 1;
                }
            }
        }
        //.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])|\(XPF\)|\(萝卜\)|\(神马\)|\(切\)|\(聚\)|\(优\)|\(神马\)|\(XB\)|\(SP\)|\(XP\)|[\x00-\x1F\x7F]/g,'');
        urls.forEach(it=>{
            if(it.oldurl){
                for(let i=0;i<datalist.length;i++){
                    if(datalist[i].url==it.url||datalist[i].url==it.oldurl){
                        if(/^hiker:\/\/files\/data\//.test(datalist[i].url)){
                            deleteFile(datalist[i].url);
                        }
                        datalist.splice(i,1);
                        break;
                    }
                }
            }

            function checkitem(item) {
                return item.url==it.url;
            }
            
            if(!datalist.some(checkitem)&&it.name&&it.url&&it.type){
                if(olddatanum>0){
                    it.group = it.group || "新导入";
                }
                if(urls.length == 1){
                    datalist.unshift(it);
                }else{
                    datalist.push(it);
                }
                num = num + 1;
            }
        })
        if(num>0){writeFile(jkfile, JSON.stringify(datalist));}
    } catch (e) {
        log('导入失败：'+e.message); 
        return -1;
    }
    return num;
}
//解析保存
function jiexisave(urls, mode) {
    if(urls.length==0){return 0;}
    let num = 0;
    try{
        let datalist = getDatas('jx');
        if(mode==1){
            for(let i=0;i<datalist.length;i++){
                if(datalist[i].retain!=1){
                    datalist.splice(i,1);
                    i = i - 1;
                }
            }
        }
        
        urls.forEach(it=>{
            if(it.oldurl){
                for(let i=0;i<datalist.length;i++){
                    if(datalist[i].url==it.url||datalist[i].url==it.oldurl){
                        datalist.splice(i,1);
                        break;
                    }
                }
            }

            function checkitem(item) {
                return item.url==it.url;
            }

            if(!datalist.some(checkitem)&&it.url&&it.name&&/^http|^functio/.test(it.url)){
                if(urls.length == 1){
                    datalist.unshift(it);
                }else{
                    datalist.push(it);
                }
                num = num + 1;
            }
        })
        if(num>0){writeFile(jxfile, JSON.stringify(datalist));}
    } catch (e) {
        log('导入失败：'+e.message); 
        num = -1;
    }
    return num;
}
//解析新增或编辑
function jiexi(lx,data) {
    addListener("onClose", $.toString(() => {
        clearMyVar('parsename');
        clearMyVar('parseurl');
        clearMyVar('parsetype');
        clearMyVar('parseext');
        clearMyVar('isretain');
        clearMyVar('isload');
    }));
    log(data);
    let d = [];
    if(lx!="update"){
        setPageTitle("♥解析管理-新增");
    }else{
        if(getMyVar('isload', '0')=="0"){
            setPageTitle("♥解析管理-变更");
            putMyVar('isretain', data.retain||"");
            putMyVar('isload', '1');
        }
    }
    d.push({
        title:'parseurl',
        col_type: 'input',
        desc: "解析名称",
        extra: {
            titleVisible: false,
            defaultValue: getMyVar('parsename', lx=="update"?data.name:""),
            onChange: 'putMyVar("parsename",input)'
        }
    });
    d.push({
        title:'parseurl',
        col_type: 'input',
        desc: "链接地址",
        extra: {
            highlight: true,
            type: "textarea",
            titleVisible: false,
            defaultValue: getMyVar('parseurl', lx=="update"?data.url:""),
            onChange: 'putMyVar("parseurl",input)'
        }
    });
    let parsetype = data.type;
    d.push({
        title: parsetype,//'是否为web嗅探解析：' + (getMyVar('parsetype', parsetype)=="0"?"是":"否"),
        col_type: 'text_1',
        url:$().lazyRule(()=>{
            if(/^http/.test(getMyVar('parseurl',''))&&!/id=|key=/.test(getMyVar('parseurl',''))){
                if(getMyVar('parsetype')=="1"){
                    putMyVar('parsetype','0');
                }else{
                    putMyVar('parsetype','1');
                }
                refreshPage(false);
                return "hiker://empty";
            }else{
                return "toast://以http开头的普通解析才能标记"
            }
        })
    });
    d.push({
        title: getMyVar('isretain', '')!="1"?'强制保留：否':'强制保留：是',
        desc: getMyVar('isretain', '')!="1"?'资源码订阅更新时会被覆盖':'资源码订阅更新时保留此接口',
        col_type:'text_1',
        url:$('#noLoading#').lazyRule(()=>{
            if(getMyVar('isretain', '')!="1"){
                putMyVar('isretain', '1');
            }else{
                clearMyVar('isretain');
            }
            refreshPage(false);
            return 'toast://已切换';
        })
    });
    d.push({
        title: 'ext数据',
        col_type: 'input',
        desc: "ext对象数据，如headers、flag, 可以留空",
        extra: {
            defaultValue: storage0.getMyVar('parseext', data.ext) || "",
            titleVisible: false,
            type: "textarea",
            highlight: true,
            height: 3,
            onChange: $.toString(() => {
                if (/{|}/.test(input) || !input) {
                    storage0.putMyVar("parseext", input)
                }
            })
        }
    });
    
    d.push({
        title:'测试',
        col_type:'text_3',
        url: $().lazyRule(()=>{
            var dataurl = getMyVar('parseurl');
            var dataname = getMyVar('parsename')||'测试';
            var datatype = getMyVar('parsetype','0');
            var dataext = storage0.getMyVar('parseext') || {};
            if(!dataurl||!/^http|^functio/.test(dataurl.trim())){
                return "toast://获取解析地址失败，无法测试";
            }

            addItemAfter('jxline',{
                title: '选择测试片源',
                col_type: "rich_text",
                extra:{
                    id: 'jxfrom',
                    cls: 'jxtest'
                }
            })
            addItemAfter('jxfrom',{
                col_type: "line",
                extra:{
                    id: 'jxline2',
                    cls: 'jxtest'
                }
            })
            var filepath = 'hiker://files/rules/Src/Juying2/testurls.json';
            var datafile = fetch(filepath);
            if(datafile != ""){
                eval("var urls=" + datafile+ ";");
            }else{
                var urls = {
                    "1905": "https://vip.1905.com/m/play/1566444.shtml",
                    "爱奇艺": "https://m.iqiyi.com/v_sa04mvdzk8.html",
                    "优酷": "https://v.youku.com/v_show/id_XNDc0MDE1NTk1Mg==.html",
                    "腾讯": "https://v.qq.com/x/cover/mzc00200frpbpgb/r0042i6x2xp.html",
                    "芒果": "https://www.mgtv.com/b/349253/10424300.html",
                    "哔哩哔哩": "https://m.bilibili.com/bangumi/play/ep471494",
                    "搜狐": "https://m.tv.sohu.com/v/MjAyMjAxMDkvbjYwMTE1MjExMy5zaHRtbA==.html",
                    "西瓜": "https://www.ixigua.com/6532733952283640333?logTag=fbbfc792d3498d67c0fd",
                    "PPTV": "https://v.pptv.com/show/zVn3dJXt1xV49l4.html",
                    "咪咕": "https://m.miguvideo.com/mgs/msite/prd/detail.html?cid=676935232&mgdbid=&channelId=CAAAB000902015500000000",
                    "乐视": "http://www.le.com/ptv/vplay/26958608.html"
                }
                writeFile(filepath, JSON.stringify(urls));
            }
            let parsearr = {name:dataname,url:dataurl,type:datatype,ext:dataext};
            urls['自定义'] = "";
            for(var key in urls){
                addItemBefore('jxline2', {
                    title: key,
                    url: key!="自定义"?$('#noRecordHistory##noHistory#').lazyRule((vipUrl,parseStr)=>{
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(vipUrl, parseStr);
                    },urls[key],parsearr):$("","输入自定义播放地址").input((parseStr) => {
                        if(input==""){
                            return "toast://未输入自定义地址，无法测试";
                        }else{
                            return $().lazyRule((vipUrl,parseStr)=>{
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                                return SrcParseS.聚影(vipUrl, parseStr);
                            }, input, parseStr)
                        }
                    }, parsearr),
                    col_type: "text_3",
                    extra:{
                        cls: 'jxtest',
                        jsLoadingInject: true,
                        blockRules: ['.m4a','.mp3','.gif','.jpeg','.png','.ico','hm.baidu.com','/ads/*.js'] 
                    }
                })
            }
            addItemBefore('jxline2', {
                title: '编辑测试',
                url: $('#noRecordHistory##noHistory#').lazyRule(()=>{
                    return "editFile://hiker://files/rules/Src/Juying2/testurls.json";
                }),
                col_type: "text_3",
                extra:{
                    cls: 'jxtest'
                }
            })
            updateItem('jxtest', {
                url: "hiker://empty"
            })
            return "hiker://empty";
        }),
        extra:{
            id: 'jxtest'
        }
    });
    if(lx=="update"){
        d.push({
            title:'删除',
            col_type:'text_3',
            url: $("确定删除解析："+getMyVar('parsename',data.name)).confirm((dataurl)=>{
                var filepath = "hiker://files/rules/Src/Juying2/jiexi.json";
                var datafile = fetch(filepath);
                eval("var datalist=" + datafile+ ";");
                for(var i=0;i<datalist.length;i++){
                    if(datalist[i].url==dataurl){
                        datalist.splice(i,1);
                        break;
                    }
                }
                writeFile(filepath, JSON.stringify(datalist));
                back(true);
                return "toast://已删除";
            }, data.url)
        });    
    }else{
        d.push({
            title:'清空',
            col_type:'text_3',
            url:$("确定要清空上面填写的内容？").confirm(()=>{
                clearMyVar('parsename');
                clearMyVar('parseurl');
                clearMyVar('parseext');
                refreshPage(false);
                return "toast://已清空";
            })
        });
    } 
    d.push({
        title:'保存',
        col_type:'text_3',
        url: $().lazyRule((lx,data)=>{
            if(!/^http|^functio/.test(getMyVar('parseurl',''))){
                return "toast://解析地址不正确"
            }
            let parseext = storage0.getMyVar('parseext');
            if(parseext && $.type(parseext)!="object"){
                return "toast://ext对象数据不正确"
            }
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            let urls= [];
            let parseurl = getMyVar('parseurl');
            let parsename = getMyVar('parsename');
            let parsetype = getMyVar('parsetype','0');
            
            if(parseurl&&parsename){
                let arr  = { "name": parsename.trim(), "type": parseInt(parsetype),"url": parseurl.trim()};
                if(parseext){
                    arr['ext']=  parseext;
                }
                let isretain = getMyVar('isretain')=="1"?1:0;
                if(isretain){arr['retain'] = 1;}
                if(lx=="update"){
                    arr['oldurl'] = data.url;
                }
                urls.push(arr);
                let num = jiexisave(urls);
                if(num==1){
                    back(true);
                    return "toast://已保存";
                }else if(num==0){
                    return "toast://已存在";
                }else{
                    return "toast://保存出错";
                }
            }else{
                return "toast://无法保存，检查项目填写完整性";
            }
                
        },lx,data)
    });
    d.push({
        col_type: "line",
        extra:{id:'jxline'}
    })
    setHomeResult(d);
}
//扩展中心
function extension(){
    addListener("onClose", $.toString(() => {
        clearMyVar('uploads');
        clearMyVar('uploadjiekou');
        clearMyVar('uploadjiexi');
        clearMyVar('uploadlive');
        clearMyVar('uploadyundisk');
        //refreshPage(false);
    }));
    setPageTitle("♥管理"+getMyVar('SrcJuying-Version', ''));

    let d = [];
    /*
    d.push({
        col_type: "line_blank"
    });
    */
    d.push({
        title: '🌐 聚影分享',
        col_type: "rich_text"
    });
    let num = ''; 
    for (var i = 0; i < 10; i++) {
        num += Math.floor(Math.random() * 10);
    }
    let note_name = 'Juying'+num;
    let sharecode = Juconfig['sharecode'] || {};
    sharecode['note_name'] = sharecode['note_name'] || note_name;
    let noteinfo = {};
    if(sharecode['note_id']){
        try{
            noteinfo = JSON.parse(request('https://netcut.txtbin.cn/api/note2/info/?note_id='+sharecode['note_id'], {
                headers: { 'Referer': 'https://netcut.cn/' }
            }));
        }catch(e){}
    }

    d.push({
        title: noteinfo.status==1&&sharecode['note_id']?'复制聚影资源码口令':'申请聚影资源码',//sharetime
        desc: noteinfo.status==1&&sharecode['time']?noteinfo.data.created_time+' 有效期三年\n'+(sharecode['time']?sharecode['time']+" 上次同步时间":"暂未分享同步"):'点击申请三年长期资源码',
        url: sharecode['note_id']?$().lazyRule((codeid)=>{
                let code = '聚影资源码￥'+codeid;
                copy(code);
                return "hiker://empty";
            },aesEncode('Juying', sharecode['note_id'])):$().lazyRule((Juconfig,cfgfile,note_name) => {
                try{
                    let pastecreate = JSON.parse(request('https://netcut.txtbin.cn/api/note2/save/', {
                        headers: { 'Referer': 'https://netcut.cn/' },
                        body: 'note_name='+note_name+'&note_id=&note_content=&note_token=&note_pwd=&expire_time=94608000',
                        method: 'POST'
                    }));
                    if(pastecreate.status==1){
                        let pastedata = pastecreate.data || {};
                        pastedata['note_name'] = note_name;
                        Juconfig['sharecode'] = pastedata;
                        writeFile(cfgfile, JSON.stringify(Juconfig));
                        refreshPage(false);
                        return 'toast://申领成功';
                    }else{
                        return 'toast://申领失败：'+pastecreate.error;
                    }
                } catch (e) {
                    log('申请失败：'+e.message); 
                    return 'toast://申请失败，请重新再试';
                }
            }, Juconfig, cfgfile, sharecode['note_name']),
        col_type: "text_center_1"
    });
    d.push({
        title: '✅ 分享同步',
        url: noteinfo.status==1&&sharecode['note_id']?$('#noLoading#').lazyRule(()=>{
            putMyVar('uploads','1');
            putMyVar('uploadjiekou','1');
            putMyVar('uploadjiexi','0');
            putMyVar('uploadlive','0');
            putMyVar('uploadyundisk','0');
            refreshPage(false);
            return 'toast://选择上传同步云端的项';
        }):'toast://请先申请聚影资源码',
        col_type: "text_2"
    });
    d.push({
        title: '❎ 删除云端',
        url: sharecode['note_id']?$("确定要删除吗，删除后无法找回？").confirm((Juconfig,cfgfile)=>{
                try{
                    let sharecode = Juconfig['sharecode'] || {};
                    var pastedelete = JSON.parse(request('https://netcut.txtbin.cn/api/note2/deleteNote/', {
                        headers: { 'Referer': 'https://netcut.cn/' },
                        body: 'note_id='+sharecode.note_id+'&note_toke='+sharecode.note_toke+'&note_name='+sharecode.note_name,
                        method: 'POST'
                    }));
                    var status = pastedelete.status

                    delete Juconfig['sharecode'];
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    
                    if(status==1){
                        return "toast://聚影资源码云端已删除";
                    }else{
                        return 'toast://无需删除，云端已不存在';
                    }
                } catch (e) {
                    log('删除失败：'+e.message); 
                    return 'toast://删除资源失败，云端异常';
                }
            }, Juconfig, cfgfile):'toast://请先申请聚影资源码',
        col_type: "text_2"
    });
    if(getMyVar('uploads','0')=="1"){
        d.push({
            title: '选择分享同步云端的项目',
            col_type: "rich_text",
            extra:{textSize:12}
        });
        d.push({
            title:(getMyVar('uploadjiekou','0')=="1"?getide(1):getide(0))+'接口',
            col_type:'text_4',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('uploadjiekou')=="1"){
                    putMyVar('uploadjiekou','0');
                }else{
                    putMyVar('uploadjiekou','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
        d.push({
            title:(getMyVar('uploadjiexi','0')=="1"?getide(1):getide(0))+'解析',
            col_type:'text_4',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('uploadjiexi')=="1"){
                    putMyVar('uploadjiexi','0');
                    var sm = "hiker://empty";
                }else{
                    putMyVar('uploadjiexi','1');
                    var sm = "toast://友情提醒：公开分享的解析容易失效";
                }
                refreshPage(false);
                return sm;
            })
        });
        d.push({
            title:(getMyVar('uploadlive','0')=="1"?getide(1):getide(0))+'直播',
            col_type:'text_4',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('uploadlive')=="1"){
                    putMyVar('uploadlive','0');
                }else{
                    putMyVar('uploadlive','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
        d.push({
            title:(getMyVar('uploadyundisk','0')=="1"?getide(1):getide(0))+'云盘',
            col_type:'text_4',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('uploadyundisk')=="1"){
                    putMyVar('uploadyundisk','0');
                }else{
                    putMyVar('uploadyundisk','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
        d.push({
            title: '🔙 取消上传',
            url: $('#noLoading#').lazyRule(() => {
                clearMyVar('uploads');
                clearMyVar('uploadjiekou');
                clearMyVar('uploadjiexi');
                clearMyVar('uploadlive');
                clearMyVar('uploadyundisk');
                refreshPage(false);
                return "hiker://empty";
            }),
            col_type: "text_2"
        });
        d.push({
            title: '🔝 确定上传',
            url: $().lazyRule((Juconfig,cfgfile) => {
                var text = {};
                if(getMyVar('uploadjiekou','0')=="1"){
                    var filepath = "hiker://files/rules/Src/Juying2/jiekou.json";
                    var datafile = fetch(filepath);
                    if(datafile==""){
                        var datalist = [];
                    }else{
                        eval("var datalist=" + datafile+ ";");
                    }
                    text['jiekou'] = datalist;
                }
                if(getMyVar('uploadjiexi','0')=="1"){
                    var filepath = "hiker://files/rules/Src/Juying2/jiexi.json";
                    var datafile = fetch(filepath);
                    if(datafile==""){
                        var datalist = [];
                    }else{
                        eval("var datalist=" + datafile+ ";");
                    }
                    text['jiexi'] = datalist;
                }
                if(getMyVar('uploadlive','0')=="1"){
                    var filepath = "hiker://files/rules/Src/Juying2/liveconfig.json";
                    var datafile = fetch(filepath);
                    if(datafile==""){
                        var liveconfig={};
                    }else{
                        eval("var liveconfig=" + datafile+ ";");
                    }
                    text['live'] = liveconfig;
                }
                if(getMyVar('uploadyundisk','0')=="1"){
                    var filepath = "hiker://files/rules/Src/Juying2/yundisk.json";
                    var datafile = fetch(filepath);
                    if(datafile==""){
                        var datalist=[];
                    }else{
                        eval("var datalist=" + datafile+ ";");
                    }
                    text['yundisk'] = datalist;
                }
                let textcontent = base64Encode(JSON.stringify(text));
                if(textcontent.length>=200000){
                    log('分享失败：字符数超过最大限制，请精简接口，重点减少XPath和biubiu类型'); 
                    return 'toast://分享同步失败，超过最大限制，请精简接口';
                }
                try{
                    let sharecode = Juconfig['sharecode'] || {};
                    var pasteupdate = JSON.parse(request('https://netcut.txtbin.cn/api/note2/save/', {
                        headers: { 'Referer': 'https://netcut.cn/' },
                        body: 'note_name='+sharecode.note_name+'&note_id='+sharecode.note_id+'&note_content='+textcontent+'&note_token='+sharecode.note_token+'&note_pwd=&expire_time=94608000',
                        method: 'POST'
                    }));
                    var status = pasteupdate.status
                    
                    clearMyVar('uploads');
                    clearMyVar('uploadjiekou');
                    clearMyVar('uploadjiexi');
                    clearMyVar('uploadlive');
                    clearMyVar('uploadyundisk');
                    refreshPage(false);
                    if(status==1){
                        let pastedata = pasteupdate.data || {};
                        pastedata['note_name'] = sharecode.note_name;
                        Juconfig['sharecode'] = pastedata;
                        writeFile(cfgfile, JSON.stringify(Juconfig));
                        refreshPage(false);
                        return "toast://分享同步云端数据成功";
                    }else{
                        return 'toast://分享同步失败，资源码应该不存在';
                    }
                } catch (e) {
                    log('分享失败：'+e.message); 
                    return 'toast://分享同步失败，请重新再试';
                }
            }, Juconfig, cfgfile),
            col_type: "text_2"
        });
    }
    /*
    d.push({
        col_type: "line_blank"
    });
    */
    d.push({
        col_type: "line"
    });
    d.push({
        title: '⚡ 订阅管理',
        col_type: "rich_text"
    });
    
    d.push({
        title: Juconfig['codedyid']?'已订阅聚影资源码':'订阅聚影资源码',
        desc: Juconfig['codedyid']?'点击订阅、复制、切换资源码'+(Juconfig['codedyname']?'\n当前订阅的资源码为：'+Juconfig['codedyname']:""):'订阅后将与分享者云端数据保持同步',
        url: $(["订阅","复制","切换"],3).select((Juconfig,cfgfile)=>{
                if(input=="订阅"){
                    return $("","输入聚影资源码口令\n订阅会自动和云端同步，覆盖本地非保留接口").input((Juconfig,cfgfile) => {
                        if(input.split('￥')[0]!="聚影资源码"){
                            return 'toast://口令有误';
                        }
                        showLoading('正在较验有效性')
                        let codeid = input.split('￥')[1];
                        let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', codeid));
                        hideLoading();
                        if(codeid&&!/^error/.test(text)){
                            return $("","当前资源码有效，起个名保存吧").input((Juconfig,cfgfile,codeid) => {
                                let dydatalist = Juconfig.dingyue||[];
                                if(dydatalist.some(item => item.name ==input)){
                                    return 'toast://名称重复，无法保存';
                                }else if(input!=""){
                                    if(!dydatalist.some(item => item.url ==codeid)){
                                        Juconfig['codedyid'] = codeid;
                                        Juconfig['codedyname'] = input;
                                        dydatalist.push({name:input, url:codeid})
                                        Juconfig['dingyue'] = dydatalist;
                                        writeFile(cfgfile, JSON.stringify(Juconfig));
                                        refreshPage(false);
                                        return 'toast://已保存，订阅成功';
                                    }else{
                                        return 'toast://已存在，订阅未成功';
                                    }
                                }else{
                                    return 'toast://名称为空，无法保存';
                                }
                            }, Juconfig, cfgfile, codeid);
                        }else{
                            return "toast://口令错误或资源码已失效";
                        }
                    }, Juconfig, cfgfile)
                }else if(input=="复制"){
                    let codeid = Juconfig['codedyid'];
                    return codeid?$().lazyRule((codeid)=>{
                        let code = '聚影资源码￥'+codeid;
                        copy(code);
                        return "hiker://empty";
                    },codeid):'toast://请先订阅'
                }else if(input=="切换"){
                    let codeid = Juconfig['codedyid'];
                    let dydatalist = Juconfig.dingyue||[];
                    let list = dydatalist.map((list)=>{
                        if(list.url !=codeid){
                            return list.name;
                        }
                    })
                    list = list.filter(n => n);
                    if(list.length>0){
                        return $(list,3,"选择需切换的订阅源").select((dydatalist,Juconfig,cfgfile)=>{
                            var url = "";
                            for (var i in dydatalist) {
                                if(dydatalist[i].name==input){
                                    url = dydatalist[i].url;
                                    break;
                                }
                            }
                            if(url){
                                Juconfig['codedyid'] = url;
                                Juconfig['codedyname'] = input;
                                writeFile(cfgfile, JSON.stringify(Juconfig));
                                refreshPage(false);
                                return 'toast://订阅已切换为：'+input+'，更新资源立即生效';
                            }else{
                                return 'toast://本地订阅记录文件异常，是不是干了坏事？';
                            }
                        },dydatalist,Juconfig,cfgfile)
                    }else{
                        return 'toast://未找到可切换的历史订阅';
                    }
                }
            },Juconfig,cfgfile),
        col_type: "text_center_1"
    });

    d.push({
        title: '✅ 更新资源',
        url: Juconfig['codedyid']?$("确定要从云端更新数据？\n"+(Juconfig['codedytype']=="2"?"当前为增量订阅模式，只增不删":"当前为全量订阅模式，覆盖本地")).confirm((codedyid,codedytype)=>{
                try{
                    showLoading('请稍候...')
                    let codeid = codedyid;
                    let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', codeid));
                    if(codeid&&!/^error/.test(text)){
                        let pastedata = JSON.parse(base64Decode(text));
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                        let jknum = 0;
                        let jxnum = 0;
                        let ypnum = 0;
                        let jkdatalist = pastedata.jiekou||[];
                        if(jkdatalist.length>0){
                            jknum = jiekousave(jkdatalist, codedytype||1);
                        }
                        let jxdatalist = pastedata.jiexi||[];
                        if(jxdatalist.length>0){
                            jxnum = jiexisave(jxdatalist, codedytype||1);
                        }
                        if(pastedata.live){
                            let livefilepath = "hiker://files/rules/Src/Juying2/liveconfig.json";
                            let liveconfig = pastedata.live;
                            writeFile(livefilepath, JSON.stringify(liveconfig));
                            var sm = "，直播订阅已同步"
                        }
                        let ypdatalist = pastedata.yundisk||[];
                        if(ypdatalist.length>0){
                            ypnum = yundisksave(ypdatalist);
                        }
                        hideLoading();
                        return "toast://同步完成，接口："+jknum+"，解析："+jxnum+(sm?sm:"")+"，云盘："+ypnum;
                    }else{
                        hideLoading();
                        return "toast://口令错误或资源码已失效";
                    }
                } catch (e) {
                    hideLoading();
                    log('更新失败：'+e.message); 
                    return "toast://无法识别的口令";
                }
            }, Juconfig['codedyid'], Juconfig['codedytype']):'toast://请先订阅聚影资源码',
        col_type: "text_2",
        extra: {
            longClick: [{
                title: "订阅类型改为："+(Juconfig['codedytype']=="2"?"全量":"增量"),
                js: $.toString((Juconfig,cfgfile) => {
                    if(Juconfig['codedytype']=="2"){
                        Juconfig['codedytype'] = "1";
                        var sm = "切换为全量订阅，除强制保留的接口/接口，均会被清空";
                    }else{
                        Juconfig['codedytype'] = "2";
                        var sm = "切换为增量订阅，接口/接口只会累加，不会删除";
                    }
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    return "toast://"+sm;
                },Juconfig,cfgfile)
            }]
        }
    });
    d.push({
        title: '❎ 删除订阅',
        url: Juconfig['codedyid']?$(["仅删订阅源，保留历史","册除订阅及历史，不再切换"],1).select((Juconfig,cfgfile)=>{
            if(input=="仅删订阅源，保留历史"){
                return $().lazyRule((Juconfig,cfgfile) => {
                    delete Juconfig['codedyid'];
                    delete Juconfig['codedyname'];
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    return 'toast://已删除订阅源，历史记录可用于切换';
                }, Juconfig, cfgfile)
            }else if(input=="册除订阅及历史，不再切换"){
                return $().lazyRule((Juconfig,cfgfile) => {
                    let codeid = Juconfig['codedyid'];
                    delete Juconfig['codedyid'];
                    delete Juconfig['codedyname'];
                    let dydatalist = Juconfig.dingyue||[];
                    for (var i in dydatalist) {
                        if(dydatalist[i].url==codeid){
                            dydatalist.splice(i,1);
                            break;
                        }
                    }
                    Juconfig['dingyue'] = dydatalist;
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    return 'toast://已删除订阅源和历史记录';
                }, Juconfig, cfgfile)
            }                    
        }, Juconfig, cfgfile):'toast://请先订阅聚影资源码',
        col_type: "text_2"
    });
    /*
    d.push({
        col_type: "line_blank"
    });
    */
    d.push({
        col_type: "line"
    });
    d.push({
        title: '⚙ 个性设置',
        col_type: "rich_text"
    });

    d.push({
        title: '搜索分组',
        url: $(Juconfig['xunmigroup']?Juconfig['xunmigroup']:"全部","设置搜索时默认分组").input((Juconfig,cfgfile) => {
                Juconfig['xunmigroup'] = input;
                writeFile(cfgfile, JSON.stringify(Juconfig));
                refreshPage(false);
                return 'toast://默认搜索分组'+(input?'已设置为：'+input:'已清空');
            }, Juconfig, cfgfile),
        col_type: "text_3"
    });

    d.push({
        title: '超时时长',
        url: $(Juconfig['xunmitimeout']?Juconfig['xunmitimeout']:"5","设置接口搜索超时时长(秒)").input((Juconfig,cfgfile) => {
                if(!parseInt(input)||parseInt(input)<1||parseInt(input)>10){return 'toast://输入有误，请输入1-10数字'}else{
                    Juconfig['xunmitimeout'] = parseInt(input);
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    return 'toast://接口搜索超时时长已设置为：'+input+'秒';
                }
            }, Juconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: '失败次数',
        url: $(Juconfig['failnum']?Juconfig['failnum']:"10","搜索无法访问的接口达到多少失败次数，转移到失败待处理分组").input((Juconfig,cfgfile) => {
                if(!parseInt(input)||parseInt(input)<1||parseInt(input)>100){return 'toast://输入有误，请输入1-100数字'}else{
                    Juconfig['failnum'] = parseInt(input);
                    writeFile(cfgfile, JSON.stringify(Juconfig));
                    refreshPage(false);
                    return 'toast://搜索接口无法访问'+input+'次，自动转移到失败待处理分组';
                }
            }, Juconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        col_type: "line"
    });

    
    /*
    d.push({
        col_type: "line_blank"
    });
    */
    
    /*
    d.push({
        col_type: "line_blank"
    });
    */
    d.push({
        col_type: "line"
    });

    d.push({
        title: '💝 关于聚影',
        desc: '这是一个空壳小程序，仅用于个人学习研究！',
        col_type: 'text_1',
        url: 'toast://哥就是帅',
        extra:{
            lineVisible:false,
            longClick: [{
                title: "📑更新日志",
                js: $.toString(() => {
                    return $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                        setPageTitle("💝 关于聚影");
                        var d = [];
                        try{
                            eval(fetchCache(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcTmplVersion.js', 1, { timeout:2000 }))
                            var SrcJuyingdesc = newVersion.SrcJuyingdesc;
                        }catch(e){

                        }
                        if(SrcJuyingdesc){
                            d.push({
                                title: '📑 更新日志',
                                col_type: "rich_text"
                            });
                            d.push({
                                col_type: "line"
                            });
                            var updatedesc = [];
                            for(let key in SrcJuyingdesc){
                                updatedesc.push('版本V'+key+(parseFloat(key) > parseFloat(getMyVar('SrcJuying-Version','').replace('-V',''))?"(内测)":"")+'：'+SrcJuyingdesc[key]);
                            }
                            d.push({
                                title: updatedesc.reverse().slice(0,3).join('<br>'),
                                col_type: "rich_text"
                            });
                        }
                        setHomeResult(d);
                    })
                })
            }]
        }
    });
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    });
    setHomeResult(d);
}
//资源管理
function resource() {
    addListener("onClose", $.toString(() => {
        clearMyVar('importjiekou');
        clearMyVar('importjiexi');
        clearMyVar('importlive');
        clearMyVar('importtype');
        clearMyVar('importinput');
    }));
    setPageTitle("资源管理");
    let d = [];
    d.push({
        title: '🎁 资源导入类型',
        col_type: "rich_text"
    });
    let importtype = getMyVar('importtype','1');
    d.push({
        title: (importtype=="1"?"👉":"")+"TVBox导入",
        col_type: 'scroll_button',
        url: $('#noLoading#').lazyRule(() => {
            putMyVar('importtype','1');
            refreshPage(false);
            return "hiker://empty";
        })
    });

    if(importtype=="1"){
        d.push({
            title: '选择需要的导入项目',
            col_type: "rich_text",
            extra:{textSize:12}
        });
        d.push({
            title:(getMyVar('importjiekou','0')=="1"?getide(1):getide(0))+'影视接口',
            col_type:'text_3',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('importjiekou')=="1"){
                    putMyVar('importjiekou','0');
                }else{
                    putMyVar('importjiekou','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
        d.push({
            title:(getMyVar('importjiexi','0')=="1"?getide(1):getide(0))+'解析接口',
            col_type:'text_3',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('importjiexi')=="1"){
                    putMyVar('importjiexi','0');
                }else{
                    putMyVar('importjiexi','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
        d.push({
            title:(getMyVar('importlive','0')=="1"?getide(1):getide(0))+'直播接口',
            col_type:'text_3',
            url:$('#noLoading#').lazyRule(() => {
                if(getMyVar('importlive')=="1"){
                    putMyVar('importlive','0');
                }else{
                    putMyVar('importlive','1');
                }
                refreshPage(false);
                return "hiker://empty";
            })
        });
    }
        d.push({
            title:'本地',
            col_type: 'input',
            desc: '请输入链接地址',
            url: $.toString(() => {
                return `fileSelect://`+$.toString(()=>{
                    return "toast://"+input;
                })
            }),
            extra: {
                titleVisible: true,
                defaultValue: getMyVar('importinput', ''),
                onChange: 'putMyVar("importinput",input)'
            }
        });
        d.push({
            title: '🆖 历史记录',
            url: $('hiker://empty#noRecordHistory##noHistory#').rule((cfgfile,Juconfig) => {
                addListener("onClose", $.toString(() => {
                    refreshPage(false);
                }));
                setPageTitle("🆖资源导入-历史记录");
                
                var d = [];
                let importrecord = Juconfig['importrecord']||[];
                let lists = importrecord.filter(item => {
                    return item.type==getMyVar('importtype','1');
                })
                if(lists.length>0){
                    d.push({
                        title: '点击下方的历史条目，进行操作👇',
                        col_type: "rich_text"
                    });
                    d.push({
                        col_type: "line"
                    });
                    lists.reverse();
                    for(let i=0;i<lists.length;i++){
                        d.push({
                            title: lists[i].url,
                            url: $(["选择","删除"],1,"").select((Juconfig, cfgfile, url)=>{
                                    if(input=="选择"){
                                        putMyVar('importinput', url);
                                        back(true);
                                    }else if(input=="删除"){
                                        let importrecord = Juconfig['importrecord']||[];
                                        for(let i=0;i<importrecord.length;i++){
                                            if(importrecord[i].url==url&&importrecord[i].type==getMyVar('importtype','1')){
                                                importrecord.splice(i,1);
                                                break;
                                            }
                                        }
                                        Juconfig['importrecord'] = importrecord; 
                                        writeFile(cfgfile, JSON.stringify(Juconfig));
                                        refreshPage(false);
                                    }
                                    return "hiker://empty";
                                }, Juconfig, cfgfile, lists[i].url),
                            col_type: "text_1"
                        });
                    }
                }else{
                    d.push({
                        title: '↻无记录',
                        col_type: "rich_text"
                    });
                }
                setHomeResult(d);
            },cfgfile,Juconfig),
            col_type: "text_2"
        });
        d.push({
            title: '🆗 确定导入(' + (Juconfig["importmode"]?"全":"增")+')',
            url: getMyVar('importjiekou')!="1"&&getMyVar('importjiexi')!="1"&&getMyVar('importlive')!="1"?'toast://请选择导入项目':$('#noLoading#').lazyRule((Juconfig,cfgfile) => {
                    if(getMyVar('importinput', '')==""){
                        return 'toast://请先输入链接地址'
                    }
                    let input = getMyVar('importinput', '');
                    if(input){
                        let importrecord = Juconfig['importrecord']||[];
                        if(importrecord.length>20){//保留20个记录
                            importrecord.shift();
                        }
                        if(!importrecord.some(item => item.url==input && item.type==getMyVar('importtype','1'))){
                            importrecord.push({type:getMyVar('importtype','1'),url:input});
                            Juconfig['importrecord'] = importrecord;
                            writeFile(cfgfile, JSON.stringify(Juconfig));
                        }
                    }

                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    return Resourceimport(input,getMyVar('importtype','1'),Juconfig['importmode']?1:0);
                }, Juconfig, cfgfile),
            col_type: "text_2",
            extra: {
                longClick: [{
                    title: "导入方式",
                    js: $.toString((cfgfile, Juconfig) => {
                        if(Juconfig["importmode"]){
                            Juconfig["importmode"] = 0;
                        }else{
                            Juconfig["importmode"] = 1;
                        }
                        writeFile(cfgfile, JSON.stringify(Juconfig));
                        refreshPage(false);
                        return 'toast://导入方式设置为：' + (Juconfig["importmode"]?"全":"增") + "量导入";
                    },cfgfile, Juconfig)
                }]
            }
        });
    setResult(d);
}
//资源导入
function Resourceimport(input,importtype,importmode){
    if(importtype=="1"){//tvbox导入
        let data;
        try{
            showLoading('检测文件有效性');
            if(/\/storage\/emulated\//.test(input)){input = "file://" + input}
            var html = request(input,{timeout:2000});
            if(html.includes('LuUPraez**')){
                html = base64Decode(html.split('LuUPraez**')[1]);
            }
            
            //var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
            //html = html.replace(/api\"\:csp/g,'api":"csp').replace(reg, function(word) { 
            //    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
            //}).replace(/^.*#.*$/gm,"").replace(/\,\,/g,',');//.replace(/=\\n\"/g,'="')|[\t\r\n].replace(/\s+/g, "").replace(/<\/?.+?>/g,"").replace(/[\r\n]/g, "")
            //log(html);
            eval('data = ' + html)
            //data = JSON.parse(html);                        
        } catch (e) {
            hideLoading();
            log('TVBox文件检测失败>'+e.message); 
            return "toast://TVBox导入失败：链接文件无效或内容有错";
        }
        hideLoading();

        let jknum = -1;
        let jxnum = -1;
        let livenum = -1;
        let jiekous = data.sites||[];
        if((getMyVar('importjiekou','')=="1")&&jiekous.length>0){
            showLoading('正在多线程抓取数据中');
            let urls= [];
            //多线程处理
            var task = function(obj) {
                let arr;
                if(/^csp_AppYs/.test(obj.api)){
                    arr = { "name": obj.name, "url": obj.ext, "type": getapitype(obj.ext)};
                }else if((obj.type==1||obj.type==0)&&obj.api.indexOf('cms.nokia.press')==-1){
                    arr = { "name": obj.name, "url": obj.api, "type": "cms"};
                    if(obj.categories){
                        arr["categories"] = obj.categories;
                    }
                }else{
                    let extfile = obj.ext;
                    if($.type(extfile)=='string'){
                        if(/^clan:/.test(extfile)){
                            extfile = extfile.replace("clan://TVBox/", input.match(/file.*\//)[0]);
                        }else if(/^./.test(extfile)){
                            extfile = input.match(/http(s)?:\/\/.*\//)[0]+extfile.replace("./","");
                        }
                    }
                    
                    if(/drpy2/.test(obj.api)){
                        arr = { "name": obj.name, "type": "drpy", "ext": extfile};
                    }else if(/^csp_XBiubiu/.test(obj.api)){
                        arr = { "name": obj.name, "type": "biubiu", "ext": extfile};
                    }else if(/^csp_XPath/.test(obj.api)){
                        arr = { "name": obj.name, "type": "XPath", "ext": extfile};
                    }else if(obj.api=="csp_XBPQ"){
                        arr = { "name": obj.name, "type": "XBPQ", "ext": extfile};
                    }else if(/^csp_XYQHiker/.test(obj.api)){
                        arr = { "name": obj.name, "type": "XYQ", "ext": extfile};
                    }

                    if(arr){
                        let urlfile;
                        if($.type(extfile)=='object'){
                            urlfile = 'hiker://files/data/'+MY_RULE.title+'/libs/' + arr.type + '_' + arr.name + '.json';
                            writeFile(urlfile, JSON.stringify(extfile));
                        }else if(/^file/.test(extfile)){
                            urlfile = 'hiker://files/' + extfile.split('/files/Documents/')[1];
                        }else if(/^http/.test(extfile)){
                            try{
                                let content = fetch(extfile, {timeout:2000});
                                if (content == '') {
                                    urlfile = '';
                                }else{
                                    if(arr.type=="XYQ" && !/分类片单标题/.test(content)){
                                        arr['onlysearch'] = 1;
                                    }
                                    urlfile = 'hiker://files/data/'+MY_RULE.title+'/libs/' + arr.type + '_' + extfile.substr(extfile.lastIndexOf('/') + 1);
                                    writeFile(urlfile, content);
                                }
                            }catch(e){
                                log(obj.name + 'ext文件缓存失败>' + e.message);
                            }
                        }
                        if(urlfile){
                            arr['url'] = urlfile;
                        }
                    }
                }
                if(arr && arr.url){
                    arr['searchable'] = obj.searchable;
                    urls.push(arr);
                }
                return 1;
            }
            
            let jiekoutask = jiekous.map((list)=>{
                return {
                    func: task,
                    param: list,
                    id: list.key
                }
            });

            be(jiekoutask, {
                func: function(obj, id, error, taskResult) {                            
                },
                param: {
                }
            });

            try{
                jknum = jiekousave(urls, importmode);
            }catch(e){
                jknum =-1;
                log('TVBox导入接口保存有异常>'+e.message);
            } 
            hideLoading();    
        }
        let jiexis = data.parses||[];
        if((getMyVar('importjiexi','')=="1")&&jiexis.length>0){
            try{
                let urls = jiexis.filter(it=>{
                    return /^http/.test(it.url);
                })
                jxnum = jiexisave(urls, importmode);
            } catch (e) {
                jxnum = -1;
                log('TVBox导入解析保存失败>'+e.message);
            }
        }
        let lives = data.lives || [];
        if(getMyVar('importlive','')=="1"&&lives.length>0){
            try{
                let urls = [];
                for (let i=0;i<lives.length;i++) {
                    let channels = lives[i].channels||[];
                    if(channels.length>0){
                        for (let j=0;j<channels.length;j++) {
                            let live = channels[i].urls;
                            for (let k=0;k<live.length;k++) {
                                let url = live[i].replace('proxy://do=live&type=txt&ext=','');
                                if(/^http/.test(url)){
                                    urls.push(url);
                                }else{
                                    urls.push(base64Decode(url));
                                }
                            }
                        }
                    }else{
                        let url = lives[i].url || "";
                        if(/^http/.test(url)){
                            urls.push(url);
                        }
                    }
                }
                if(urls.length>0){
                    livenum = 0;
                    let livecfgfile = "hiker://files/rules/Src/Juying2/liveconfig.json";
                    let livecfg = fetch(livecfgfile);
                    if(livecfg != ""){
                        eval("var liveconfig = " + livecfg);
                    }else{
                        var liveconfig = {};
                    }
                    let livedata = liveconfig['data']||[];
                    for(let i=0;i<urls.length;i++){
                        if(!livedata.some(item => item.url==urls[i])){
                            let YChtml = request(urls[i],{timeout:5000}).replace(/TV-/g,'TV');
                            if(YChtml.indexOf('#genre#')>-1){
                                let id = livedata.length + 1;
                                livedata.push({name:'JY订阅'+id,url:urls[i]});
                                livenum++;
                            }
                        }
                    }
                    if(livenum>0){
                        liveconfig['data'] = livedata;
                        writeFile(livecfgfile, JSON.stringify(liveconfig));
                    }
                }
            } catch (e) {
                log('TVBox导入live保存失败>'+e.message);
            }
        }

        let sm = (jknum>-1?' 接口保存'+jknum:'')+(jxnum>-1?' 解析保存'+jxnum:'')+(livenum>-1?' 直播保存'+livenum:'');
        if(jknum>0||jxnum>0){back();}
        if(jknum==-1&&jxnum==-1&&livenum>-1){
            clearMyVar('importinput');
            refreshPage(false);
        }
        return 'toast://TVBox导入：'+(sm?sm:'导入异常，详情查看日志');     
    }
}

//资源分享
function JYshare(lx,input) {
    if(lx=="jk"){
        var filepath = jkfile;
        var sm = "聚影接口";
    }else if(lx=="jx"){
        var filepath = jxfile;
        var sm = "聚影解析";
    }
    var datafile = fetch(filepath);
    eval("var datalist=" + datafile+ ";");
    var sm2 = "聚影分享口令已生成";
    let duoselect = storage0.getMyVar('SrcJu_duoselect') || [];
    if(duoselect.length>0){
        var lists = datalist.filter(item => {
            if(item.url){
                return duoselect.indexOf(item.url)>-1;
            }else{
                return duoselect.indexOf(item.parse)>-1;
            }
        })
        if(lists.length>0){
            var datalist = lists;
            sm2 = "(选定)聚影分享口令已生成";
        }
    }
    if(input=='云口令文件'){
        let sharetxt = base64Encode(JSON.stringify(datalist));
        let code = sm + '￥' + aesEncode('Juying', sharetxt) + '￥云口令文件';
        let sharefile = 'hiker://files/_cache/Juying_'+datalist.length+'_'+$.dateFormat(new Date(),"HHmmss")+'.hiker';
        writeFile(sharefile, '云口令：'+code+`@import=js:$.require("hiker://page/cloudimport?rule=聚影√");`);
        if(fileExist(sharefile)){
            return 'share://'+sharefile;
        }else{
            return 'toast://云口令文件生成失败';
        }
    }else{
        showLoading('分享生成中，请稍后...');
        let pasteurl = sharePaste(base64Encode(JSON.stringify(datalist)), input);
        hideLoading();
        if(/^http|^云/.test(pasteurl) && pasteurl.includes('/')){
            pasteurl = pasteurl.replace('云6oooole', 'https://pasteme.tyrantg.com').replace('云2oooole', 'https://netcut.cn').replace('云5oooole', 'https://cmd.im').replace('云7oooole', 'https://note.ms').replace('云9oooole', 'https://txtpbbd.cn').replace('云10oooole', 'https://hassdtebin.com');   
            let code = sm+'￥'+aesEncode('Juying', pasteurl)+'￥共' + datalist.length + '条('+input+')';
            copy('云口令：'+code+`@import=js:$.require("hiker://page/cloudimport?rule=聚影√");`);
            return "toast://"+sm2;
        }else{
            return "toast://分享失败，剪粘板或网络异常>"+pasteurl;
        }
    }
}
//资源导入
function JYimport(input) {
    let cloudimport;
    if(/^云口令：/.test(input)){
        input = input.replace('云口令：','').trim();
        cloudimport = 1;
    }
    let pasteurl;
    let inputname;
    let codelx = "share";
    try{
        pasteurl = aesDecode('Juying', input.split('￥')[1]);
        inputname = input.split('￥')[0];
        if(inputname=="聚影资源码"){
            codelx = "dingyue";
            pasteurl = 'https://netcut.cn/p/' + pasteurl;
            if(getMyVar('guanli')=="jk"){
                inputname = "聚影接口";
            }else if(getMyVar('guanli')=="jx"){
                inputname = "聚影解析";
            }
        }
    }catch(e){
        return "toast://聚影√：口令有误>"+e.message;
    }
    try{
        if (inputname == "聚影云盘") {
            let content = parsePaste(pasteurl);
            let datalist2 = JSON.parse(base64Decode(content));
            let num = yundisksave(datalist2);
            return "toast://合计" + datalist2.length + "个，导入" + num + "个";
        }
        if(inputname=="聚影接口"){
            var sm = "聚影√：接口";
        }else if(inputname=="聚影解析"){
            var sm = "聚影√：解析";
        }else{
            return "toast://聚影√：无法识别的口令";
        }
        let text;
        if(/http/.test(pasteurl)){
            showLoading('获取数据中，请稍后...');
            text = parsePaste(pasteurl);
            hideLoading();
        }else{
            text = pasteurl;
        }
        if(pasteurl&&!/^error/.test(text)){
            let pastedata = JSON.parse(base64Decode(text));           
            let urlnum = 0;
            if(inputname=="聚影接口"){
                if(codelx=="share"){
                    var pastedatalist = pastedata;
                }else if(codelx=="dingyue"){
                    var pastedatalist = pastedata.jiekou;
                }
                urlnum = jiekousave(pastedatalist);
            }else if(inputname=="聚影解析"){
                if(codelx=="share"){
                    var pastedatalist = pastedata;
                }else if(codelx=="dingyue"){
                    var pastedatalist = pastedata.jiexi;
                }
                urlnum = jiexisave(pastedatalist);
            }
            if(urlnum>0&&cloudimport!=1){
                refreshPage(false);
            }
            return "toast://"+sm+"合计："+pastedatalist.length+"，保存："+urlnum;
        }else{
            return "toast://聚影√：口令错误或已失效";
        }
    } catch (e) {
        return "toast://聚影√：无法识别的口令>"+e.message;
    }
}
