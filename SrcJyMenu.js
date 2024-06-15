//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
//二级统一菜单
function erjimenu(desc) {
    return [
        {
            title: "详情简介",
            url: $("#noLoading#").lazyRule((desc) => {
                if (getMyVar('二级简介打开标识') == "1") {
                    clearMyVar('二级简介打开标识');
                    deleteItemByCls("SrcJudescload");
                } else {
                    putMyVar('二级简介打开标识', "1");
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
                    }, {
                        title: desc,
                        col_type: "rich_text",
                        extra: {
                            cls: "SrcJudescload"
                        }
                    }]);
                }
                return "hiker://empty";
            }, desc || ""),
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
            title: "切换站源",
            url: !fileExist(jxfile) ? "toast://分享页面或没有接口，无法扩展更多片源" : "toast://暂未上线",
            pic_url: 'https://hikerfans.com/tubiao/messy/20.svg',
            col_type: 'icon_small_3'
        }
    ]
}

function lookset() {
    setPageTitle("♥观影设置");
    let recordfile = "hiker://files/rules/Src/Juying2/parse.json";//解析相关记录文件
    let parseRecord = {};
    if(fetch(recordfile)){
        try{
            eval("parseRecord =" + fetch(recordfile) + ";");
        }catch(e){}
    }
    
    let d = [];
    d.push({
        title: '功能开关',
        col_type: "rich_text"
    });
    d.push({
        title: (parseRecord['printlog'] == 1 ? getide(1) : getide(0)) + '解析日志',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            if (parseRecord['printlog'] != 1) {
                parseRecord['printlog'] = 1;
            } else {
                parseRecord['printlog'] = 0;
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://切换成功';
        }, parseRecord, recordfile),
        col_type: "text_2"
    });
    d.push({
        title: (parseRecord['cachem3u8'] != 0 ? getide(1) : getide(0)) + 'm3u8缓存',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            if (parseRecord['cachem3u8'] == 0) {
                parseRecord['cachem3u8'] = 1;
            } else {
                parseRecord['cachem3u8'] = 0;
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://切换成功';
        }, parseRecord, recordfile),
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
        url: $("", "屏蔽无法播放的地址").input((parseRecord, recordfile) => {
            parseRecord['excludeurl'] = parseRecord['excludeurl'] || [];
            let url = input.split(';{')[0].replace('file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8##', '').replace('#isVideo=true#', '');
            if (parseRecord['excludeurl'].indexOf(url) == -1) {
                parseRecord['excludeurl'].push(url);
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://屏蔽无效播放地址成功';
        }, parseRecord, recordfile),
        col_type: "text_2"
    });
    d.push({
        title: '清空播放拦载记录',
        url: $("清空拦截无法播放地址记录？").confirm((parseRecord, recordfile) => {
            delete parseRecord['excludeurl'];
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://无清空';
        }, parseRecord, recordfile),
        col_type: "text_2"
    });
    d.push({
        col_type: "line"
    });
    
    d.push({
        title: '解析设置',
        col_type: "rich_text"
    });
    let parsemode = parseRecord.parsemode || 1;
    d.push({
        title: '当前解析模式：' + (parsemode == 1 ? '聚影智能' : parsemode == 2 ? '强制嗅探' : parsemode == 3 ? '手动模式' : '异常'),
        desc: parsemode == 1 ? '上次优先>接口自带+私有解析' : parsemode == 2 ? 'web解析使用video进行嗅探' : parsemode == 3 ? '使用代理播放模式，在播放页手动选择解析' : '',
        url: 'hiker://empty',
        col_type: "text_center_1"
    });
    d.push({
        title: (parsemode == 1 ? getide(1) : getide(0)) + '聚影智能',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            parseRecord['parsemode'] = 1;
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://解析模式：聚影智能';
        }, parseRecord, recordfile),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode == 2 ? getide(1) : getide(0)) + '强制嗅探',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            parseRecord['parsemode'] = 2;
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://解析模式：强制嗅探';
        }, parseRecord, recordfile),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode == 3 ? getide(1) : getide(0)) + '手动切换',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            parseRecord['parsemode'] = 3;
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://解析模式：手动切换';
        }, parseRecord, recordfile),
        col_type: "text_3"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: '嗅探内核：'+(parseRecord['xiutannh']||"web"),
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            let sm;
            if(parseRecord['xiutannh'] == 'x5'){
                parseRecord['xiutannh'] = 'web';
                sm = 'web';
            }else{
                parseRecord['xiutannh'] = 'x5';
                sm = 'x5';
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://嗅探内核切换为：'+sm;
        }, parseRecord, recordfile),
        col_type: "text_3"
    });
    d.push({
        title: (parseRecord['dmRoute'] == "1" ? getide(1) : getide(0)) + 'dm盒子弹幕',
        url: $('#noLoading#').lazyRule((parseRecord, recordfile) => {
            if (parseRecord['dmRoute'] == "1") {
                parseRecord['dmRoute'] = 0;
            } else {
                parseRecord['dmRoute'] = 1;
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            refreshPage(false);
            return 'toast://切换成功';
        }, parseRecord, recordfile),
        col_type: "text_3"
    });
    d.push({
        col_type: "line_blank"
    });
    /*
    d.push({
        title: (getItem('enabledpush', '') == '1' ? getide(1) : getide(0)) + 'TVBOX推送',
        url: $('#noLoading#').lazyRule(() => {
            refreshPage(false);
            if (getItem('enabledpush', '') == '1') {
                clearItem('enabledpush');
                return 'toast://已关闭按钮';
            } else {
                setItem('enabledpush', '1');
                return 'toast://已开启，仅对接口二级有效，非需要请关闭';
            }
        }),
        col_type: "text_1",
        extra: {
            lineVisible: false
        }
    });

    if (getItem('enabledpush', '') == '1') {
        try {
            var boxip = getIP();
        } catch (e) {
            var boxip = '0.0.0.0';
        }
        d.push({
            title: getItem('hikertvboxset') ? '参照频道香佬教程，需自行研究' : '推送选集列表，设置接收端ip地址',
            desc: getItem('hikertvboxset') ? '接收端ip地址：' + getItem('hikertvboxset', '') : '还未设置接收端ip地址',
            url: "input://" + (getItem('hikertvboxset', '') == '' ? ('http://' + boxip + ':9978') : getItem('hikertvboxset')) + "////TVBOX接收端ip地址.js:setItem('hikertvboxset',input);refreshPage()",
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
        title: getItem('SrcJy$linecolor1', '') == '' ? '线路选中' : '‘‘’’<font color=' + getItem('SrcJy$linecolor1', '') + '>' + '线路选中' + '</font>',
        url: $("", "选中的线路名颜色设置").input(() => {
            setItem('SrcJy$linecolor1', input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    d.push({
        title: getItem('SrcJy$linecolor2', '') == '' ? '线路未选' : '‘‘’’<font color=' + getItem('SrcJy$linecolor2', '') + '>' + '线路未选' + '</font>',
        url: $("", "未选中的线路名颜色设置").input(() => {
            setItem('SrcJy$linecolor2', input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    d.push({
        title: getItem('SrcJy$playcolor', '') == '' ? '选集颜色' : '‘‘’’<font color=' + getItem('SrcJy$playcolor', '') + '>' + '选集颜色' + '</font>',
        url: $("", "选集列表名称的颜色设置").input(() => {
            setItem('SrcJy$playcolor', input);
            refreshPage(false);
            return "hiker://empty";
        }),
        col_type: "text_3"
    })
    */
    
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    });
    setResult(d);
}
//主页导航按钮菜单
let menubtns = ["管理", "历史", "收藏", "点播", "直播", "Alist", "云盘"];//"搜索",
let buttonmenu = {
    "管理": {
        img: "https://hikerfans.com/tubiao/more/129.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            extension();
        })
    },
    "历史": {
        img: "https://hikerfans.com/tubiao/more/213.png",
        url: "hiker://history?rule=" + MY_RULE.title
    },
    "收藏": {
        img: "https://hikerfans.com/tubiao/more/109.png",
        url: "hiker://collection?rule=" + MY_RULE.title
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
        img: "https://hikerfans.com/tubiao/more/226.png",//hiker://files/cache/src/Alist.svg
        url: $("hiker://empty###noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
            alistHome();
        })
    },
    "云盘": {
        img: "https://hikerfans.com/tubiao/more/97.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
            aliMyDisk();
        })
    }
}
//选中状态标识
function getide(is) {
    if(is==1){
        return '‘‘’’<strong><font color="#f13b66a">◉ </front></strong>';
    }else{
        return '‘‘’’<strong><font color="#F54343">◉ </front></strong>';
    }
}