//引入Ali公用文件
require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/', '/master/') + 'SrcJyAliPublic.js');
let folderFilter = new RegExp("点左上角头像订阅|点击头像订阅|购买年超级会员|购买会员享8T", "i");//文件夹过滤
let errorCode = {
    'ShareLink.Cancelled': '分享链接已失效',
    'ShareLink.Forbidden': '违规资源已被封禁',
    'NotFound.ShareLink': '不存在该链接请核对',
    'AccessTokenInvalid': '访问令牌失效，请重新登陆',
    'ShareLinkTokenInvalid': '分享令牌失效',
    'ParamFlowException': '访问过于频繁，请稍后再试'
}

function aliShareUrl(input) {
    let li = input.split('\n');
    let share_id;
    let folder_id;
    let share_pwd
    li.forEach(it => {
        it = it.trim();
        if (it.indexOf("提取码") > -1) {
            share_pwd = it.replace('提取码: ', '');
        }
        if (it.indexOf("https://www.aliyundrive.com") > -1) {
            it = it.replace('https://www.aliyundrive.com/s/', '').replace('链接：', '');
            share_id = it.indexOf('/folder/') > -1 ? it.split('/folder/')[0] : it;
            folder_id = it.indexOf('/folder/') > -1 ? it.split('/folder/')[1] : "root";
        }
    })
    clearMyVar('SrcJyDisk$name');//清除之前搜索的影片名
    aliShare(share_id, folder_id, share_pwd);
}

function myDiskMenu(islogin) {
    let setalitoken = $().lazyRule((alistfile, alistData) => {
        let alistconfig = alistData.config || {};
        let alitoken = alistconfig.alitoken;
        return $(alitoken || "", "refresh_token").input((alistfile, alistData, alistconfig) => {
            alistconfig.alitoken = input;
            alistData.config = alistconfig;
            writeFile(alistfile, JSON.stringify(alistData));
            clearMyVar('getalitoken');
            refreshPage(false);
            return "toast://已设置";
        }, alistfile, alistData, alistconfig)
    }, alistfile, alistData)

    let onlogin = [{
        title: userinfo.nick_name,
        url: setalitoken,
        img: userinfo.avatar,
        col_type: 'avatar'
    }, {
        col_type: "line"
    }];
    let nologin = [{
        title: "⚡登录获取token⚡",
        url: $("hiker://empty###noRecordHistory##noHistory#").rule(() => {
            let d = [];
            let url = 'https://auth.aliyundrive.com/v2/oauth/authorize?login_type=custom&response_type=code&redirect_uri=https%3A%2F%2Fwww.aliyundrive.com%2Fsign%2Fcallback&client_id=25dzX3vbYqktVxyX&state=%7B%22origin%22%3A%22*%22%7D#/login'
            let js = $.toString(() => {
                const tokenFunction = function () {
                    var token = JSON.parse(localStorage.getItem('token'))
                    if (token && token.user_id) {
                        let alistfile = "hiker://files/rules/Src/Juying/Alist.json";
                        if (fy_bridge_app.fetch(alistfile)) {
                            eval("var alistData = " + fy_bridge_app.fetch(alistfile));
                        } else {
                            var alistData = {};
                        }
                        let alistconfig = alistData.config || {};
                        alistconfig.alitoken = token.refresh_token;
                        alistData.config = alistconfig;
                        fy_bridge_app.writeFile(alistfile, JSON.stringify(alistData));
                        localStorage.clear();
                        fy_bridge_app.back(true);
                        fy_bridge_app.toast('TOKEN获取成功，请勿泄漏！');
                        return;
                    } else {
                        token_timer();
                    }
                }
                var token_timer = function () {
                    setTimeout(tokenFunction, 300);
                }
                tokenFunction();
            })
            d.push({
                url: url,
                col_type: 'x5_webview_single',
                desc: '100%&&float',
                extra: {
                    canBack: true,
                    js: js,
                    urlInterceptor: $.toString(() => true)
                }
            })
            setResult(d);
        }),
        col_type: 'text_center_1'
    }, {
        title: "⭐手工填写token⭐",
        url: setalitoken,
        col_type: 'text_center_1'
    }]
    if (islogin) {
        return onlogin;
    } else {
        return nologin;
    }
}
function aliShare(share_id, folder_id, share_pwd) {
    let rulepages = storage0.getMyVar('rulepages') || [];
    if(rulepages.indexOf(folder_id)==-1){
        rulepages.push(folder_id);
        storage0.putMyVar('rulepages',rulepages);
        clearMyVar('聚影云盘自动返回');
    }
    addListener("onClose", $.toString(() => {
        let rulepages = storage0.getMyVar('rulepages') || [];
        rulepages.length = rulepages.length-1;
        storage0.putMyVar('rulepages',rulepages);
        if(rulepages.length>0 && getMyVar('聚影云盘自动返回')=="1"){
            back(false);
        }
    }));
    setPageTitle(typeof (MY_PARAMS) != "undefined" && MY_PARAMS.dirname ? MY_PARAMS.dirname : '云盘共享文件 | 聚影√');
    let d = [];
    let orders = {
        名称正序: 'name#ASC',
        名称倒序: 'name#DESC',
        时间正序: 'updated_at#ASC',
        时间倒序: 'updated_at#DESC',
        聚影排序: 'name#DESC'
    };
    let ordersKeys = Object.keys(orders);
    let orderskey = orders[getItem('aliyun_order', '聚影排序')];
    let style = getItem('aliyun_style', 'avatar');
    d.push(
        {
            title: "换源",
            url: $().lazyRule((name) => {
                if(getMyVar('SrcJy$back')=='1' || !name){
                    putMyVar('聚影云盘自动返回','1');
                    back(false);
                    return 'hiker://empty';
                }else if(name){
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
                }
            },MY_PARAMS.name||""),
            col_type: 'icon_5',
            img: 'https://hikerfans.com/tubiao/grey/175.png',
        },
        {
            title: "样式",
            url: $(['text_1', 'movie_2', 'card_pic_3', 'avatar']).select(() => {
                setItem('aliyun_style', input);
                refreshPage();
                return 'toast://已切换';
            }),
            col_type: 'icon_5',//icon_round_small_4
            img: 'https://hikerfans.com/tubiao/grey/168.png',
        },
        {
            title: "排序",
            url: $(ordersKeys, 2).select(() => {
                setItem('aliyun_order', input);
                refreshPage();
                return 'toast://切换成功';
            }),
            col_type: 'icon_5',
            img: 'https://hikerfans.com/tubiao/grey/221.png',
        },
        {
            title: getItem('aliyun_playMode', '智能'),
            url: $(['转码', '原画', '智能']).select(() => {
                setItem('aliyun_playMode', input);
                refreshPage();
                return 'toast://切换成功';
            }),
            col_type: 'icon_5',
            img: 'https://hikerfans.com/tubiao/grey/100.png',
        },
        {
            title: '转存',
            url: `smartdrive://share/browse?shareId=${share_id}&sharePwd=${share_pwd}`,
            col_type: 'icon_5',
            img: 'https://hikerfans.com/tubiao/grey/206.png',
        },
        {
            col_type: 'line_blank',
        }
    )
    try {
        if (!userinfo.nick_name) {
            d = d.concat(myDiskMenu(0));
        } else {
            share_pwd = share_pwd || "";
            let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { headers: headers, body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST' })).share_token;
            let postdata = { "share_id": share_id, "parent_file_id": folder_id || "root", "limit": 200, "image_thumbnail_process": "image/resize,w_256/format,jpeg", "image_url_process": "image/resize,w_1920/format,jpeg/interlace,1", "video_thumbnail_process": "video/snapshot,t_1000,f_jpg,ar_auto,w_256", "order_by": orderskey.split('#')[0], "order_direction": orderskey.split('#')[1] };
            headers['x-share-token'] = sharetoken;
            let getShare = JSON.parse(request('https://api.aliyundrive.com/adrive/v2/file/list_by_share', { headers: headers, body: postdata, method: 'POST' }));
            if(errorCode[getShare.code]){
                d.push({
                    title: errorCode[getShare.code],
                    url: 'hiker://empty##',
                    col_type: "text_center_1"
                })
                setResult(d);
            }
            let sharelist = getShare.items || [];
            sharelist = sharelist.filter(item => {
                return item.type == "file" || (item.type == "folder" && !folderFilter.test(item.name));
            })
            if(sharelist.length==1 && sharelist[0].type=="folder"){
                rulepages.length = rulepages.length-1;
                storage0.putMyVar('rulepages',rulepages);
                aliShare(share_id, sharelist[0].file_id, share_pwd);
            }else if (sharelist.length > 0) {
                let sublist = sharelist.filter(item => {
                    return item.type == "file" && /srt|vtt|ass/.test(item.file_extension);
                })
                let dirlist = sharelist.filter((item) => {
                    return item.type == "folder";
                })
                dirlist.forEach((item) => {
                    d.push({
                        title: item.name,
                        img: "hiker://files/cache/src/文件夹.svg",//#noRecordHistory##noHistory#
                        url: $("hiker://empty##https://www.aliyundrive.com/s/" + item.share_id + (item.file_id ? "/folder/" + item.file_id : "")).rule((share_id, folder_id, share_pwd) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/', '/master/') + 'SrcJyAliDisk.js');
                            aliShare(share_id, folder_id, share_pwd);
                        }, item.share_id, item.file_id, share_pwd),
                        col_type: style,
                        extra: {
                            dirname: item.name,
                            name: MY_PARAMS.name||""
                        }
                    })
                })
                let filelist = sharelist.filter((item) => {
                    return item.type == "file";
                })
                if (getItem('aliyun_order', '聚影排序') == "聚影排序") {
                    filelist.sort(SortList);
                }
                filelist.forEach((item) => {
                    if (item.category == "video") {
                        let sub_file_id;
                        if (sublist.length == 1) {
                            sub_file_id = sublist[0].file_id;
                        } else if (sublist.length > 1) {
                            sublist.forEach(it => {
                                let subnmae = it.name.substring(0, it.name.lastIndexOf(".")).replace(/\.chs|\.eng/g, '');
                                if (item.name.includes(subnmae)) {
                                    sub_file_id = it.file_id;
                                }
                            })
                        }
                        let filesize = item.size / 1024 / 1024;
                        d.push({
                            title: item.name,
                            img: item.thumbnail || (item.category == "video" ? "hiker://files/cache/src/影片.svg" : item.category == "audio" ? "hiker://files/cache/src/音乐.svg" : item.category == "image" ? "hiker://files/cache/src/图片.png" : "https://img.alicdn.com/imgextra/i1/O1CN01mhaPJ21R0UC8s9oik_!!6000000002049-2-tps-80-80.png"),
                            url: $("hiker://empty##").lazyRule((share_id, file_id, sub_file_id, share_pwd) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/', '/master/') + 'SrcJyAliPublic.js');
                                let play = getAliUrl(share_id, file_id, share_pwd);
                                if (play.urls) {
                                    let subtitle;
                                    if (sub_file_id) {
                                        subtitle = getSubtitle(share_id, sub_file_id, share_pwd);
                                    }
                                    if (subtitle) {
                                        play['subtitle'] = subtitle;
                                    }
                                    return JSON.stringify(play);
                                } else {
                                    return "toast://获取播放列表失败，看日志有无异常或token无效";
                                }
                            }, item.share_id, item.file_id, sub_file_id || "", share_pwd),
                            desc: filesize < 1024 ? filesize.toFixed(2) + 'MB' : (filesize / 1024).toFixed(2) + 'GB',
                            col_type: style,
                            extra: {
                                id: item.file_id
                            }
                        })
                    }
                })
                d.push({
                    title: "““””<small><font color=#f20c00>已开启文件过滤，仅显示视频文件</font></small>",
                    url: "hiker://empty",
                    col_type: "text_center_1"
                })
            } else {
                toast('列表为空');
            }
        }
    } catch (e) {
        log('获取共享文件列表失败>'+e.message);
        d.push({
            title: '该分享已失效或异常',
            url: 'hiker://empty##',
            col_type: "text_center_1"
        })
        toast('该分享已失效或异常，可刷新确认下');
    }
    setResult(d);
    setLastChapterRule('js:' + $.toString(() => {
        setResult('');
    }))
}
//evalPrivateJS('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')
function aliDiskSearch(input,data) {
    putMyVar('SrcJy$back','1');
    showLoading('搜索中，请稍后...');
    let datalist = [];
    if(data){
        datalist.push(data);
    }else{
        let filepath = "hiker://files/rules/Src/Juying/yundisk.json";
        let datafile = fetch(filepath);
        if(datafile != ""){
            try{
                eval("datalist=" + datafile+ ";");
            }catch(e){
                datalist = [];
            }
        }
    }
    let diskMark = storage0.getMyVar('diskMark') || {};
    let i = 0;
    let one = "";
    for (var k in diskMark) {
        i++;
        if (i == 1) { one = k }
    }
    if (i > 30) { delete diskMark[one]; }
    let task = function(obj) {
        try{
            eval('let Parse = '+obj.parse)
            let datalist2 = Parse(input) || [];
            let searchlist = [];
            datalist2.forEach(item => {
                let arr = {
                    title: item.title,
                    img: "hiker://files/cache/src/文件夹.svg",
                    col_type: "avatar",
                    extra: {
                        cls: "loadlist",
                        name: input,
                        dirname: input
                    }
                };

                let home = "https://www.aliyundrive.com/s/";
                if(obj.name=="我的云盘"){
                    arr.url = $("hiker://empty##").rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                        aliMyDisk(input);
                    },item.url);
                }else if(item.url.includes(home)){
                    arr.url = $("hiker://empty##").rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                        aliShareUrl(input);
                    },item.url);
                } else if (obj.erparse) {
                    arr.url = $("hiker://empty##").lazyRule((url,erparse) => {
                        eval('let Parse = '+erparse)
                        let aurl = Parse(url);
                        if(aurl.indexOf('aliyundrive.com')>-1){
                            return $("hiker://empty##").rule((input) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                                aliShareUrl(input);
                            },aurl)
                        }else{
                            return "toast://二解云盘共享链接失败";
                        }
                    },item.url,obj.erparse);
                }
                searchlist.push(arr);
            })
            if(searchlist.length>0){
                hideLoading();
                searchlist.unshift({
                    title: obj.name + " 找到" + searchlist.length + "条 “" + input + "” 相关",
                    url: "hiker://empty",
                    col_type: "text_center_1",
                    extra: {
                        cls: "loadlist"
                    }
                });
                searchlist.unshift({
                    col_type: "line_blank",
                    extra: {
                        cls: "loadlist"
                    }
                });
                diskMark[input] = diskMark[input] || [];
                diskMark[input] = diskMark[input].concat(searchlist);
                addItemBefore('listloading', searchlist);
            }
        }catch(e){
            log(obj.name + '>' + e.message);
        }
        return 1;
    }
    let list = datalist.map((item)=>{
        return {
          func: task,
          param: item,
          id: item.name
        }
    });
    if(list.length>0){
        deleteItemByCls('loadlist');
        putMyVar('diskSearch', '1');
        be(list, {
            func: function(obj, id, error, taskResult) {
            },
            param: {
            }
        });
        storage0.putMyVar('diskMark',diskMark);
        clearMyVar('diskSearch');
        toast('搜索完成');
    }else{
        toast('无接口，无法搜索');
    }
    hideLoading();
}
//evalPrivateJS('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')
evalPrivateJS('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')