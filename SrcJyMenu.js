//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
//二级统一菜单
var erjimenu = [
    {
        title: "详情简介",
        url: $("#noLoading#").lazyRule((desc) => {
            if(getMyVar('二级简介打开标识')=="1"){
                clearMyVar('二级简介打开标识');
                deleteItemByCls("SrcJudescload");
            }else{
                putMyVar('二级简介打开标识',"1");
                addItemAfter('detailid', [{
                    title: `<font color="#098AC1">详情简介 </font><small><font color="#f47983"> ></font></small>`,
                    col_type: "avatar",
                    url: $("#noLoading#").lazyRule(() => {
                        clearMyVar('二级简介打开标识');
                        deleteItemByCls("SrcJudescload");
                        return "hiker://empty";
                    }),
                    pic_url: "https://hikerfans.com/tubiao/ke/91.png",
                    extra: {
                        cls: "SrcJudescload"
                    }
                },{
                    title: desc,
                    col_type: "rich_text",
                    extra: {
                        cls: "SrcJudescload"
                    }
                }]);
            }
            return "hiker://empty";
        }, `${erdata.desc}`||""),
        pic_url: "https://hikerfans.com/tubiao/messy/32.svg",
        col_type: 'icon_small_3',
        extra: {
            cls: "Juloadlist"
        }
    },
    {
        title: "观影设置",
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
                lookset();
            }),
        pic_url: 'https://hikerfans.com/tubiao/messy/37.svg',
        col_type: 'icon_small_3'
    },
    {
        title: "更多片源",
        url: !fileExist('hiker://files/rules/Src/Juying/jiekou.json')?"toast://分享页面或没有接口，无法扩展更多片源":getMyVar('SrcJy$back')=='1'?`#noLoading#@lazyRule=.js:back(false);'hiker://empty'`:$('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
            xunmi(name);
        }, MY_PARAMS.name),
        pic_url: 'https://hikerfans.com/tubiao/messy/25.svg',
        col_type: 'icon_small_3',
        extra: {
            key: MY_PARAMS.name,
            longClick: [{
                title: "云盘君",
                js: $.toString(() => {
                    return "#noHistory#hiker://page/soup?rule=云盘君";
                })
            },{
                title: "云盘君.简",
                js: $.toString(() => {
                    return "#noHistory#hiker://page/sou?p=fypage&rule=云盘君.简";
                })
            }]
        }
    }
]

function lookset(){
    function getide(is) {
        if(is==1){
            return '‘‘’’<strong><font color="#f13b66a">◉ </front></strong>';
        }else{
            return '‘‘’’<strong><font color="#F54343">◉ </front></strong>';
        }
    }
    function setupPages(type) {
        switch (type) {
            case "设置":
                return $("hiker://empty#noRecordHistory#").rule(() => {
                    setPageTitle("断插配置");
                    this.d = [];
                    d.push({
                        desc: 'auto',
                        url: 'file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/Parse_Dn.html',
                        col_type: 'x5_webview_single'
                    });
                    setResult(d);
                })
                break;
            case "编辑":
                return $("hiker://empty#noRecordHistory#").rule(() => {
                    setPageTitle("解析管理");
                    this.d = [];
                    require('https://hikerfans.com/js/jxItem.js');
                    jxList();
                    setResult(d);
                })
                break;
            default:
                return 'toast://需要传入正确参数'
                break;
        }
    }
    setPageTitle("♥观影设置");
    var d = [];
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    putMyVar('superwebM3U8',JYconfig.cachem3u8!=0&&JYconfig.superweb==1?'1':'0');
    d.push({
        title: '功能开关',
        col_type: "rich_text"
    });
    d.push({
        title: (JYconfig['printlog']==1?getide(1):getide(0))+'打印日志',
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
        title: (JYconfig['cachem3u8']!=0?getide(1):getide(0))+'m3u8缓存',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['cachem3u8'] == 0){
                    JYconfig['cachem3u8'] = 1;
                    putMyVar('SrcM3U8','1');
                }else{
                    JYconfig['cachem3u8'] = 0;
                    putMyVar('SrcM3U8','0');
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://切换成功';
            }, JYconfig, cfgfile),
        col_type: "text_2"
    });
    d.push({
        title: (JYconfig['yundiskLine']==1?getide(1):getide(0))+'云盘搜索',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['yundiskLine'] != 1){
                    JYconfig['yundiskLine'] = 1;
                    putMyVar('yundiskLine','1');
                }else{
                    JYconfig['yundiskLine'] = 0;
                    putMyVar('yundiskLine','0');
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://'+(JYconfig['alistLine']?'已开启云盘搜索线路':'已关闭云盘搜索线路');
            }, JYconfig, cfgfile),
        col_type: "text_2"
    });
    d.push({
        title: (JYconfig['alistLine']==1?getide(1):getide(0))+'Alist搜索',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['alistLine'] != 1){
                    JYconfig['alistLine'] = 1;
                    putMyVar('alistLine','1');
                }else{
                    JYconfig['alistLine'] = 0;
                    putMyVar('alistLine','0');
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://'+(JYconfig['alistLine']?'已开启Alist搜索线路':'已关闭Alist搜索线路');
            }, JYconfig, cfgfile),
        col_type: "text_2"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '屏蔽操作',
        col_type: "rich_text"
    });
    d.push({
        title: '无效播放地址',
        url: $("","屏蔽无法播放的地址").input(()=>{
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
    d.push({
        title: '清除播放拦载记录',
        url: $("清除拦截无法播放地址记录？").confirm(()=>{
                var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                var recordparse=fetch(recordfile);
                if(recordparse != ""){
                    eval("var recordlist=" + recordparse+ ";");
                    recordlist['excludeurl'] = [];
                    writeFile(recordfile, JSON.stringify(recordlist));
                    return 'toast://已清除跳舞小姐姐视频拦截记录';
                }else{
                    return 'toast://无记录';
                }
            }),
        col_type: "text_2"
    });
    d.push({
        col_type: "line"
    });
    var parsefrom = [];
    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
    var recordparse=fetch(recordfile);
    if(recordparse != ""){
        eval("var recordlist=" + recordparse+ ";");
        try{
            for(var key in recordlist.priorparse){
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
            var priorparse = recordlist.priorparse[input];
            
            let list = priorparse.split(';;');
            let lists = [];
            for(let i=0;i<list.length;i++){    
                if(list[i]){
                    lists.push(list[i]);
                }
            }
            if(lists.length>0){
                return $(lists,2,"选择需屏蔽的解析").select((recordfile,recordlist,from,lists)=>{
                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                    var datafile = fetch(filepath);
                    if(datafile != ""){
                        eval("var datalist=" + datafile+ ";");
                    }else{
                        var datalist = [];
                    }
                    if(datalist.some(item => item.name == input)){
                        //私有解析在屏蔽优先时，仅排除片源
                        for(var j=0;j<datalist.length;j++){
                            if(datalist[j].name==input&&datalist[j].stopfrom.indexOf(from)==-1){
                                datalist[j].stopfrom[datalist[j].stopfrom.length] = from;
                                break;
                            }
                        }
                        writeFile(filepath, JSON.stringify(datalist));
                        var sm = '私有解析('+input+')>排除片源>'+from;
                        log('已屏蔽'+from+' 优先解析：'+sm);
                    }else if(/^http/.test(input)){
                        //app自带的解析在屏蔽优先时，直接加入黑名单
                        recordlist['excludeparse'] = recordlist['excludeparse']||[];
                        if(recordlist['excludeparse'].indexOf(input)==-1){
                            recordlist['excludeparse'].push(input);
                        }
                        var sm = input+'>接口自带解析加入全局黑名单';
                        log('已屏蔽'+input+' 优先解析：'+sm);
                    }
                    let lists = lists || [];
                    function removeByValue(arr, val) {
                        for(var i = 0; i < arr.length; i++) {
                            if(arr[i] == val) {
                            arr.splice(i, 1);
                            break;
                            }
                        }
                    }
                    removeByValue(lists,input);
                    if(lists.length>0){
                        recordlist.priorparse[from] = lists.join(";;");
                    }else{
                        delete recordlist.priorparse[from];
                    }
                    writeFile(recordfile, JSON.stringify(recordlist));   
                    refreshPage(false);
                    return "toast://"+sm;
                },recordfile,recordlist,input,lists)
            }else{
                delete recordlist.priorparse[input];
                refreshPage(false);
                return "toast://已清空优先";
            }
        }),
        col_type: "text_2"
    });
    d.push({
        title: '清除优先拦截记录',
        url: $("清除接口自带解析拦截黑名单记录？").confirm(()=>{
                var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                var recordparse=fetch(recordfile);
                if(recordparse != ""){
                    eval("var recordlist=" + recordparse+ ";");
                    recordlist['excludeparse'] = [];
                    writeFile(recordfile, JSON.stringify(recordlist));
                    refreshPage(false);
                    return 'toast://已清除接口自带解析拦截黑名单记录';
                }else{
                    return 'toast://无记录';
                }
            }),
        col_type: "text_2"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '解析设置',
        col_type: "rich_text"
    });
    let parsemode = JYconfig.parsemode || 1;
    if(fileExist('hiker://files/rules/DuanNian/MyParse.json')||JYconfig.dnfile){
        var haveDN = 1
        var isdn = JYconfig.isdn==0?0:1;
    }else{
        var haveDN = 0
        var isdn = 0;
    };
    d.push({
        title: '当前解析模式：' + (parsemode==1?'聚影智能':parsemode==2?'强制断插':parsemode==3?'强制嗅探':'手动模式'),
        desc: parsemode==1?'上次优先>接口自带+私有解析'+(haveDN&&isdn?'+断插解析':''):parsemode==2?'走断插(含魔断)或帅助手设置的解析逻辑':parsemode==3?'接口自带和私有解析中的直链进行聚合嗅探':'先进播放器，再通过线路选择解析，无法在选集页下载，无法预加载',
        url: 'hiker://empty',
        col_type: "text_center_1"
    });
    d.push({
        title: (parsemode==1?getide(1):getide(0))+'聚影智能',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                JYconfig['parsemode'] = 1;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://解析模式：聚影智能';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: (haveDN&&isdn&&parsemode==1?getide(1):getide(0))+'断插辅助',
        url: haveDN==0?'toast://没有断插？无法开启！':$('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['isdn'] == 0){
                    JYconfig['isdn'] = 1;
                    var sm = "开启断插同步并发解析";
                }else{
                    JYconfig['isdn'] = 0;
                    var sm = "断插辅助解析已关闭";
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://切换成功：' + sm;
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: '📝解析文件',
        url: $(JYconfig.dnfile?JYconfig.dnfile:"","指定断插解析文件路径\n默认可以留空").input((JYconfig,cfgfile) => {
                JYconfig['dnfile'] = input;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://解析文件设置成功';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: (parsemode==2?getide(1):getide(0))+'强制断插',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                JYconfig['parsemode'] = 2;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://解析模式：强制断插';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: '🍧断插配置',
        url: fetch('hiker://files/cache/Parse_Dn.js').indexOf('updateDate')==-1 ? setupPages("设置") : "hiker://page/Route?rule=MyFieldᴰⁿ&type=设置#noHistory#",
        col_type: "text_3"
    });
    d.push({
        title: '🍦解析管理',
        url: fetch('hiker://files/cache/Parse_Dn.js').indexOf('updateDate')==-1 ? setupPages("编辑") : "hiker://page/Route?rule=MyFieldᴰⁿ&type=编辑#noRecordHistory#",
        col_type: "text_3"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: (parsemode==3?getide(1):getide(0))+'强制嗅探',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                JYconfig['parsemode'] = 3;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://解析模式：强制嗅探';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode!=2&&JYconfig.xiutannh!='x5'?getide(1):getide(0))+'web内核',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                JYconfig['xiutannh'] = 'web';
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://嗅探内核：web';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode!=2&&JYconfig.xiutannh=='x5'?getide(1):getide(0))+'x5内核',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                JYconfig['xiutannh'] = 'x5';
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://嗅探内核：x5';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    if((MY_NAME=="海阔视界"&&getAppVersion()>=4094)||(MY_NAME=="嗅觉浏览器"&&getAppVersion()>=1359)){
        d.push({
            title: (parsemode==4?getide(1):getide(0))+'手动切换',
            url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                    JYconfig['parsemode'] = 4;
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    refreshPage(false);
                    return 'toast://解析模式：手动切换';
                }, JYconfig, cfgfile),
            col_type: "text_3"
        });
    }
    if(parsemode!=4){
        if((MY_NAME=="海阔视界"&&getAppVersion()>=3369)||(MY_NAME=="嗅觉浏览器"&&getAppVersion()>=798)){
            JYconfig['superweb'] = JYconfig.superweb==0?0:1;
            d.push({
                col_type: "line"
            });
            d.push({
                title:  (JYconfig.superweb==1?getide(1):getide(0)) + '播放器超级嗅探：' + (JYconfig.superweb==1?'开启':'关闭'),
                desc: JYconfig.superweb==1?'无法在选集页下载，无法预加载，但是可以多线路':'普通模式先嗅探到播放地址再进播放器',
                url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                    if(JYconfig['superweb'] == 1){
                        JYconfig['superweb'] = 0;
                    }else{
                        JYconfig['superweb'] = 1;
                    }
                    putMyVar('superweb',JYconfig['superweb']);
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    refreshPage(false);
                    return 'toast://切换成功';
                }, JYconfig, cfgfile),
                col_type: "text_center_1"
            });
        }
        d.push({
            col_type: "line"
        });
        d.push({
            title: (getItem('dmRoute', '0')=="1"?getide(1):getide(0)) + 'dm盒子弹幕：' + (getItem('dmRoute', '0')=="1"?'开启':'关闭'),
            desc: '1.仅对官链有效，2.拥有dm盒子小程序-版本29+',
            url: $('#noLoading#').lazyRule(() => {
                if(getItem('dmRoute', '0')=="1"){
                    setItem('dmRoute', '0');
                }else{
                    setItem('dmRoute', '1');
                }
                refreshPage(false);
                return 'toast://切换成功';
            }),
            col_type: "text_center_1"
        });
    }
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: (getItem('enabledpush', '')=='1'?getide(1):getide(0))+'TVBOX推送',
        url: $('#noLoading#').lazyRule(() => {
            refreshPage(false);
            if(getItem('enabledpush', '')=='1'){
                clearItem('enabledpush');
                return 'toast://已关闭按钮';
            }else{
                setItem('enabledpush', '1');
                return 'toast://已开启，仅对接口二级有效，非需要请关闭';
            }
        }),
        col_type: "text_1",
        extra:{
            lineVisible:false
        }
    });

    if(getItem('enabledpush', '')=='1'){  
        try{
            var boxip = getIP();
        }catch(e){
            var boxip = '0.0.0.0';
        }  
        d.push({
            title: getItem('hikertvboxset')?'参照频道香佬教程，需自行研究':'推送选集列表，设置接收端ip地址',
            desc: getItem('hikertvboxset')?'接收端ip地址：'+getItem('hikertvboxset',''):'还未设置接收端ip地址',
            url: "input://" + (getItem('hikertvboxset','')==''?('http://' + boxip + ':9978'):getItem('hikertvboxset')) + "////TVBOX接收端ip地址.js:setItem('hikertvboxset',input);refreshPage()",
            col_type: "text_center_1"
        }); 
    }
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '颜色设置',
        col_type: "rich_text"
    });
    d.push({
        title: getItem('SrcJy$linecolor1','')==''?'线路选中':'‘‘’’<font color='+getItem('SrcJy$linecolor1','')+'>'+'线路选中'+'</font>',
        url: $("","选中的线路名颜色设置").input(() => {
            setItem('SrcJy$linecolor1',input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    d.push({
        title: getItem('SrcJy$linecolor2','')==''?'线路未选':'‘‘’’<font color='+getItem('SrcJy$linecolor2','')+'>'+'线路未选'+'</font>',
        url: $("","未选中的线路名颜色设置").input(() => {
            setItem('SrcJy$linecolor2',input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    d.push({
        title: getItem('SrcJy$playcolor','')==''?'选集颜色':'‘‘’’<font color='+getItem('SrcJy$playcolor','')+'>'+'选集颜色'+'</font>',
        url: $("","选集列表名称的颜色设置").input(() => {
            setItem('SrcJy$playcolor',input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    }); 
    setHomeResult(d);
}
//主页导航按钮菜单
let menubtns = ["管理","历史","收藏","搜索","点播","直播","Alist","云盘"];
let buttonmenu = {
    "管理": {
        img: "https://hikerfans.com/tubiao/more/129.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            SRCSet();
        })
    },
    "历史": {
        img: "https://hikerfans.com/tubiao/more/213.png",
        url: "hiker://history?rule="+MY_RULE.title
    },
    "收藏": {
        img: "https://hikerfans.com/tubiao/more/109.png",
        url: "hiker://collection?rule="+MY_RULE.title
    },
    "搜索": {
        img: "https://hikerfans.com/tubiao/more/101.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖);
            sousuo2();
        })
    },
    "点播": {
        img: "https://hikerfans.com/tubiao/more/105.png",
        url: $("hiker://empty##fypage#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖);
            dianboyiji();
        })
    },
    "直播": {
        img: "https://hikerfans.com/tubiao/more/87.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
            Live();
        })
    },
    "Alist": {
        img: "hiker://files/cache/src/Alist.svg",
        url: $("hiker://empty###noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
            alistHome();
        })
    },
    "云盘": {
        img: "https://hikerfans.com/tubiao/more/65.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
            aliMyDisk();
        })
    }
}
