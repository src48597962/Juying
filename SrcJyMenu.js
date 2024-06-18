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
            col_type: 'icon_small_3',
            extra: {
                cls: "Juloadlist"
            }
        },
        {
            title: "切换站源",
            url: !fileExist(jxfile) ? "toast://分享页面或没有接口，无法扩展更多片源" : "toast://暂未上线",
            pic_url: 'https://hikerfans.com/tubiao/messy/20.svg',
            col_type: 'icon_small_3',
            extra: {
                cls: "Juloadlist"
            }
        }
    ]
}
//选中状态标识
function getide(is) {
    if(is==1){
        return '‘‘’’<strong><font color="#f13b66a">◉ </front></strong>';
    }else{
        return '‘‘’’<strong><font color="#F54343">◉ </front></strong>';
    }
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
    let playSet = storage0.getItem('playSet') || {};
    let d = [];
    d.push({
        title: '功能开关',
        col_type: "rich_text"
    });
    d.push({
        title: (playSet['printlog'] ? getide(1) : getide(0)) + '解析日志',
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['printlog'] != 1) {
                playSet['printlog'] = 1;
            } else {
                playSet['printlog'] = 0;
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        col_type: "text_2"
    });
    d.push({
        title: (playSet['cachem3u8'] ? getide(1) : getide(0)) + 'm3u8缓存',
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['cachem3u8'] != 1) {
                playSet['cachem3u8'] = 1;
            } else {
                playSet['cachem3u8'] = 0;
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        col_type: "text_2"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '分页设置',
        col_type: "rich_text"
    });
    let partpage = storage0.getItem('partpage') || {};
    d.push({
        title: (partpage['ispage'] ? getide(1) : getide(0)) + '选集开启分页设置',
        url: $('#noLoading#').lazyRule((partpage) => {
            if (partpage['ispage'] != 1) {
                partpage['ispage'] = 1;
            } else {
                partpage['ispage'] = 0;
            }
            storage0.setItem('partpage', partpage);
            refreshPage(false);
            return 'toast://切换成功';
        }, partpage),
        col_type: "text_center_1"
    });
    d.push({
        title: '每页数量'+(partpage['pagenum']||40),
        url: $(partpage['pagenum']||"40","每页选集数量").input((partpage) => {
            partpage['pagenum'] = parseInt(input);
            storage0.setItem('partpage',partpage);
            refreshPage(false);
            return 'hiker://empty'
        },partpage),
        col_type: "text_2"
    });
    d.push({
        title: '分页阀值'+(partpage['partnum']||100),
        url: $(partpage['partnum']||"100","选集数量超过多少才分页").input((partpage) => {
            partpage['partnum'] = parseInt(input);
            storage0.setItem('partpage',partpage);
            refreshPage(false);
            return 'hiker://empty'
        },partpage),
        col_type: "text_2"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '解析设置',
        col_type: "rich_text"
    });
    let parsemode = playSet["parsemode"] || 1;
    d.push({
        title: '当前解析模式：' + (parsemode == 1 ? '聚影智能' : parsemode == 2 ? '强制嗅探' : parsemode == 3 ? '手动模式' : '异常'),
        desc: parsemode == 1 ? '上次优先>接口自带+私有解析' : parsemode == 2 ? '使用video将web解析组线路进播放器' : parsemode == 3 ? '使用代理播放模式，在播放页手动选择解析' : '',
        url: 'hiker://empty',
        col_type: "text_center_1"
    });
    d.push({
        title: (parsemode == 1 ? getide(1) : getide(0)) + '聚影智能',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 1;
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://解析模式：聚影智能';
        }, playSet),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode == 2 ? getide(1) : getide(0)) + '强制嗅探',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 2;
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://解析模式：强制嗅探';
        }, playSet),
        col_type: "text_3"
    });
    d.push({
        title: (parsemode == 3 ? getide(1) : getide(0)) + '手动切换',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 3;
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://解析模式：手动切换';
        }, playSet),
        col_type: "text_3"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: '嗅探内核：'+(playSet['xiutannh']||"web"),
        url: $('#noLoading#').lazyRule((playSet) => {
            let sm;
            if(playSet['xiutannh'] == 'x5'){
                playSet['xiutannh'] = 'web';
                sm = 'web';
            }else{
                playSet['xiutannh'] = 'x5';
                sm = 'x5';
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://嗅探内核切换为：'+sm;
        }, playSet),
        col_type: "text_2"
    });
    d.push({
        title: '嗅探方式：'+(playSet['video']!=0?"video":"WebRule"),
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['video'] != 0) {
                playSet['video'] = 0;
            } else {
                playSet['video'] = 1;
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://已切换';
        }, playSet),
        col_type: "text_2"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: '无效播放地址',
        url: $("", "输入无法播放的地址进行屏蔽").input((parseRecord, recordfile) => {
            parseRecord['excludeurl'] = parseRecord['excludeurl'] || [];
            let url = input.split(';{')[0].replace('file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8##', '').replace('#isVideo=true#', '');
            if (parseRecord['excludeurl'].indexOf(url) == -1) {
                parseRecord['excludeurl'].push(url);
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://对此播放地址将拦截';
        }, parseRecord, recordfile),
        col_type: "text_2"
    });
    d.push({
        title: '清空播放拦截记录',
        url: $("清空拦截无法播放地址记录？").confirm((parseRecord, recordfile) => {
            delete parseRecord['excludeurl'];
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://无清空';
        }, parseRecord, recordfile),
        col_type: "text_2"
    });
    d.push({
        title: (playSet['isTest'] ? getide(1) : getide(0)) + '解析结果有效性检测',
        desc: "除video方式外，其他解析结果是否开启检测",
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['isTest']) {
                playSet['isTest'] = 0;
            } else {
                playSet['isTest'] = 1;
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        col_type: "text_1"
    });
    d.push({
        title: (playSet['dmRoute'] ? getide(1) : getide(0)) + 'dm盒子弹幕',
        desc: "仅针对官网地址有效，dm盒子小程序最新版本",
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['dmRoute']) {
                playSet['dmRoute'] = 0;
            } else {
                playSet['dmRoute'] = 1;
            }
            storage0.setItem('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        col_type: "text_1"
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
            manageSet();
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
