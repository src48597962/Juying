//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
//二级统一菜单
function erjimenu(desc,name,group) {
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
                        title: `<font color="#098AC1">详情简介 </font><small><font color="#f47983"> ::</font></small>`,
                        col_type: "avatar",
                        url: $("#noLoading#").lazyRule(() => {
                            clearMyVar('二级简介打开标识');
                            deleteItemByCls("SrcJudescload");
                            return "hiker://empty";
                        }),
                        pic_url: globalMap0.getMyVar('gmParams').getIcon("点播-简介.svg"),
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
            pic_url: getIcon("点播-详情简介.svg"),
            col_type: 'icon_small_3',
            extra: {
                cls: "Juloadlist"
            }
        },
        {
            title: "观看设置",
            url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
                lookset();
            }),
            pic_url: getIcon("点播-观看设置.svg"),
            col_type: 'icon_small_3',
            extra: {
                cls: "Juloadlist"
            }
        },
        {
            title: "切换站源",
            url: !fileExist(jkfile) ? "toast://聚搜、分享页面，无法扩展更多片源" : $("#noLoading#").lazyRule((name,group) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
                cutSource(name,group);
                return  "hiker://empty";
            },name, group),
            pic_url: getIcon("点播-切换站源.svg"),
            col_type: 'icon_small_3',
            extra: {
                cls: "Juloadlist"
            }
        }
    ]
}

//切源事件
function cutSource(name, group) {
    putMyVar("切源旧分组", group);
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
    let datalist = getDatas('jk',1);
    let groups = getJiekouGroups(datalist.filter(v=>v.searchable!=0)).concat(['云盘']);
    let grouparr = [];
    let color = getItem("主题颜色", "#6dc9ff");//#3399cc
    groups.forEach(it=>{
        grouparr.push({
            title: group==it?`““””<b><span style="color: `+color+`">`+it+`</span></b>`:it,
            url: $('#noLoading#').lazyRule((name,newgroup) => {
                let oldgroup = getMyVar("切源旧分组","");
                if(oldgroup==newgroup){
                    return "hiker://empty";
                }
                updateItem("id_"+oldgroup, {
                    title: oldgroup
                })
                updateItem("id_"+newgroup, {
                    title: `““””<b><span style="color: `+getItem("主题颜色", "#6dc9ff")+`">`+newgroup+`</span></b>`
                })
                updateItem(oldgroup+"_"+name+"_loading", {
                    extra: {"id":newgroup+"_"+name+"_loading","lineVisible":false}
                })
                deleteItemByCls('grouploadlist');
                putMyVar("切源旧分组", newgroup);
                if(newgroup=="云盘"){
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                    erjiSousuo(name);
                }else{
                    require(config.依赖);
                    erjisousuo(name, newgroup);
                }
                return 'toast://切源分组已切为：' + newgroup;
            }, name, it),
            col_type: "scroll_button",
            extra: {
                id: "id_"+it,
                cls: "Juloadlist"
            }
        })
    })
    
    deleteItemByCls('Juloadlist');
    let updateItemid = group + "_" +name + "_loading";
    updateItem(updateItemid+'2', {
        extra: {"id":updateItemid,"lineVisible":false}
    })
    addItemBefore(updateItemid, grouparr);// 生成切源分组
    if(group=="云盘"){
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
        erjiSousuo(name);
    }else{
        require(config.依赖);
        erjisousuo(name, group);
    }
}

function lookset() {
    addListener("onClose", $.toString(() => {
        clearMyVar('playSet');
    }));
    setPageTitle("点播二级观看设置");
    let recordfile = globalMap0.getMyVar('gmParams').rulepath + "parse.json";//解析相关记录文件
    let parseRecord = {};
    if(fetch(recordfile)){
        try{
            eval("parseRecord =" + fetch(recordfile) + ";");
        }catch(e){}
    }

    let playSet = storage0.getMyVar('playSet') || storage0.getItem('playSet') || Juconfig['playSet'] || {};
    clearItem('playSet');

    let d = [];
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '功能开关',
        pic_url: getIcon("点播-功能开关.svg"),
        col_type: "avatar",
        url: "hiker://empty"
    });
    d.push({
        title: '解析日志打印',
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['printlog'] != 1) {
                playSet['printlog'] = 1;
            } else {
                playSet['printlog'] = 0;
            }
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        pic_url: playSet['printlog']?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '分页设置',
        pic_url: getIcon("点播-分页设置.svg"),
        col_type: "avatar",
        url: "hiker://empty"
    });
    let partpage = storage0.getItem('partpage') || {};
    d.push({
        title: '选集列表分页',
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
        pic_url: partpage['ispage']?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '每页数量：'+(partpage['pagenum']||40),
        url: $(partpage['pagenum']||"40","每页选集数量").input((partpage) => {
            partpage['pagenum'] = parseInt(input);
            storage0.setItem('partpage',partpage);
            refreshPage(false);
            return 'hiker://empty'
        },partpage),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '分页阀值：'+(partpage['partnum']||100),
        url: $(partpage['partnum']||"100","选集数量超过多少才分页").input((partpage) => {
            partpage['partnum'] = parseInt(input);
            storage0.setItem('partpage',partpage);
            refreshPage(false);
            return 'hiker://empty'
        },partpage),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '解析设置',
        pic_url: getIcon("点播-解析设置.svg"),
        col_type: "avatar",
        url: "hiker://empty"
    });
    let parsemode = playSet["parsemode"] || 1;
    d.push({
        title: '聚影智能',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 1;
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://聚影智能 | 上次优先>接口自带+私有解析';
        }, playSet),
        pic_url: parsemode==1?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '强制嗅探',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 2;
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://强制嗅探 | 将web解析组线路进video播放器';
        }, playSet),
        pic_url: parsemode==2?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '手动切换',
        url: $('#noLoading#').lazyRule((playSet) => {
            playSet['parsemode'] = 3;
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://手动切换 | 代理播放，在播放页手动选择解析';
        }, playSet),
        pic_url: parsemode==3?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
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
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://嗅探内核切换为：'+sm;
        }, playSet),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '嗅探方式：'+(playSet['video']!=0?"video":"WebRule"),
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['video'] != 0) {
                playSet['video'] = 0;
            } else {
                playSet['video'] = 1;
            }
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://已切换';
        }, playSet),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: '无效播放地址',
        url: $("", "输入无法播放的地址进行屏蔽").input((parseRecord, recordfile) => {
            parseRecord['excludeurl'] = parseRecord['excludeurl'] || [];
            let url = input.split(';{')[0].replace(/file.*video\.m3u8##/, '').replace('#isVideo=true#', '');
            if (parseRecord['excludeurl'].indexOf(url) == -1) {
                parseRecord['excludeurl'].push(url);
            }
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://对此播放地址将拦截';
        }, parseRecord, recordfile),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '清空播放拦截记录',
        url: $("清空拦截无法播放地址记录？").confirm((parseRecord, recordfile) => {
            delete parseRecord['excludeurl'];
            writeFile(recordfile, JSON.stringify(parseRecord));
            return 'toast://无清空';
        }, parseRecord, recordfile),
        pic_url: getIcon("点播-箭头.svg"),
        col_type: "text_icon"
    });
    d.push({
        col_type: "line"
    });
    d.push({
        title: 'm3u8索引文件缓存',
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['cachem3u8'] != 1) {
                playSet['cachem3u8'] = 1;
            } else {
                playSet['cachem3u8'] = 0;
            }
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        pic_url: playSet['cachem3u8']?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '解析结果有效性检测',
        desc: "除video方式外，其他解析结果是否开启检测",
        url: $('#noLoading#').lazyRule((playSet) => {
            if (playSet['isTest']) {
                playSet['isTest'] = 0;
            } else {
                playSet['isTest'] = 1;
            }
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://切换成功';
        }, playSet),
        pic_url: playSet['isTest']?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
    });
    d.push({
        title: '调用dm盒子弹幕',
        url: $('#noLoading#').lazyRule((playSet) => {
            let sm;
            if (playSet['dmRoute']) {
                playSet['dmRoute'] = 0;
                sm = '关闭dm盒子弹幕';
            } else {
                playSet['dmRoute'] = 1;
                sm = '仅针对官网地址有效，需要dm盒子小程序';
            }
            storage0.putMyVar('playSet', playSet);
            refreshPage(false);
            return 'toast://' + sm;
        }, playSet),
        pic_url: playSet['dmRoute']?getIcon("点播-开.svg"):getIcon("关.svg"),
        col_type: "text_icon"
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
    Juconfig['playSet'] = playSet;
    writeFile(cfgfile, JSON.stringify(Juconfig));
}
//主页导航按钮菜单
let menubtns = ["管理", "历史", "收藏", "点播", "直播", "Alist", "云盘"];//"搜索",
let buttonmenu = {
    "管理": {
        img: getIcon("主页-管理.svg"),//"https://hikerfans.com/tubiao/more/129.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            manageSet();
        })
    },
    "历史": {
        img: getIcon("主页-历史.svg"),//"https://hikerfans.com/tubiao/more/213.png",
        url: "hiker://history?rule=" + MY_RULE.title
    },
    "收藏": {
        img: getIcon("主页-收藏.svg"),//"https://hikerfans.com/tubiao/more/109.png",
        url: "hiker://collection?rule=" + MY_RULE.title
    },
    "点播": {
        img: getIcon("主页-点播.svg"),//"https://hikerfans.com/tubiao/more/105.png",
        url: $("hiker://empty##fypage#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖);
            dianboyiji();
        })
    },
    "直播": {
        img: getIcon("主页-直播.svg"),//"https://hikerfans.com/tubiao/more/87.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
            Live();
        })
    },
    "Alist": {
        img: getIcon("主页-Alist.svg"),//"https://hikerfans.com/tubiao/more/226.png",//hiker://files/cache/src/Alist.svg
        url: $("hiker://empty###noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
            alistHome();
        })
    },
    "云盘": {
        img: getIcon("主页-云盘.svg"),//"https://hikerfans.com/tubiao/more/97.png",
        url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
            aliMyDisk();
        })
    }
}
