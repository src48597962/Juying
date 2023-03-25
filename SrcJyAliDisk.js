
//引入Ali公用文件
require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');

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
    aliShare(share_id, folder_id, share_pwd);
}

function aliShare(share_id, folder_id, share_pwd) {
    let d = [];
    setPageTitle(typeof(MY_PARAMS)!="undefined" && MY_PARAMS.dirname ? MY_PARAMS.dirname : '云盘共享文件 | 聚影√');
    let headers = {
        'content-type': 'application/json;charset=UTF-8',
        "origin": "https://www.aliyundrive.com",
        "referer": "https://www.aliyundrive.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
        "x-canary": "client=web,app=share,version=v2.3.1"
    };
    try{
        let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { headers: headers, body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
        let postdata = { "share_id": share_id, "parent_file_id": folder_id || "root", "limit": 200, "image_thumbnail_process": "image/resize,w_256/format,jpeg", "image_url_process": "image/resize,w_1920/format,jpeg/interlace,1", "video_thumbnail_process": "video/snapshot,t_1000,f_jpg,ar_auto,w_256", "order_by": "name", "order_direction": "DESC" };
        headers['x-share-token'] = sharetoken;
        let sharelist = JSON.parse(request('https://api.aliyundrive.com/adrive/v2/file/list_by_share', { headers: headers, body: postdata, method: 'POST' })).items;
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
                url: $("hiker://empty##https://www.aliyundrive.com/s/"+item.share_id+(item.file_id?"/folder/"+item.file_id:"")).rule((share_id, folder_id, share_pwd) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                    aliShare(share_id, folder_id, share_pwd);
                }, item.share_id, item.file_id, share_pwd),
                col_type: 'avatar',
                extra: {
                    dirname: item.name
                }
            })
        })
        let filelist = sharelist.filter((item) => {
            return item.type == "file";
        })
        filelist.sort(SortList);
        filelist.forEach((item) => {
            if (item.category == "video") {
                let sub_file_id;
                if (sublist.length == 1) {
                    sub_file_id = sublist[0].file_id;
                } else if (sublist.length > 1) {
                    sublist.forEach(it => {
                        if (it.name.substring(0, it.name.lastIndexOf(".")) == item.name.substring(0, item.name.lastIndexOf("."))) {
                            sub_file_id = it.file_id;
                        }
                    })
                }
                let filesize = item.size/1024/1024;
                d.push({
                    title: item.name,
                    img: item.thumbnail || (item.category == "video" ? "hiker://files/cache/src/影片.svg" : item.category == "audio" ? "hiker://files/cache/src/音乐.svg" : item.category == "image" ? "hiker://files/cache/src/图片.png" : "https://img.alicdn.com/imgextra/i1/O1CN01mhaPJ21R0UC8s9oik_!!6000000002049-2-tps-80-80.png"),
                    url: $("hiker://empty##").lazyRule((share_id, file_id, sub_file_id, share_pwd) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
                        //let alitoken = alistconfig.alitoken;
                        let play = getAliUrl(share_id, file_id, alitoken, share_pwd);
                        if (play.urls) {
                            let subtitle;
                            if (sub_file_id) {
                                subtitle = getSubtitle(share_id, sub_file_id, share_pwd);
                            }
                            if (subtitle) {
                                play['subtitle'] = subtitle;
                            }
                            return JSON.stringify(play);
                        }else{
                            return "toast://获取转码播放列表失败，是不是没有设置阿里token";
                        }
                    }, item.share_id, item.file_id, sub_file_id, share_pwd),
                    desc: filesize < 1024 ? filesize.toFixed(2) + 'MB' : (filesize/1024).toFixed(2) + 'GB',
                    col_type: 'avatar',
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
    }catch(e){
        d.push({
            title: '来晚啦，该分享已失效',
            url: 'hiker://empty##',
            col_type: "text_center_1"
        })
        toast('来晚啦，该分享已失效.');
    }
    setResult(d);
    setLastChapterRule('js:' + $.toString(()=>{
        setResult('');
    }))
}

function aliShareSearch(input) {
    deleteItemByCls('loadlist');
    showLoading('搜索中，请稍后...');
    let filepath = "hiker://files/rules/Src/Juying/yundisk.json";
    let datafile = fetch(filepath);
    if(datafile != ""){
        try{
            eval("var datalist=" + datafile+ ";");
        }catch(e){
            var datalist = [];
        }
    }else{
        var datalist = [];
    }
    if(datalist.length==0){
        toast('无接口，无法搜索');
    }
    let task = function(obj) {
        try{
            eval('let Parse = '+obj.parse)
            let datalist = Parse(input) || [];
            let searchlist = [];
            datalist.forEach(item => {
                let arr = {
                    title: item.title,
                    img: "hiker://files/cache/src/文件夹.svg",
                    col_type: "avatar",
                    extra: {
                        cls: "loadlist",
                        dirname: input
                    }
                };

                let home = "https://www.aliyundrive.com/s/";
                if(item.url.includes(home)){
                    //let share_id = item.url.replace(home, '').replace('/folder/','');
                    //let getis = JSON.parse(request("https://api.aliyundrive.com/adrive/v3/share_link/get_share_by_anonymous",{headers: {referer: "https://www.aliyundrive.com/"}, body: {"share_id": share_id}, method: 'POST', timeout: 3000 })).file_infos || [];
                    //if(getis.length>0){
                        arr.url = $("hiker://empty##").rule((input) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                            aliShareUrl(input);
                        },item.url);
                        searchlist.push(arr);
                    //}
                } else if (obj.erparse) {
                    arr.url = $("hiker://empty##").lazyRule((url,erparse) => {
                        eval('let Parse = '+erparse)
                        let aurl = Parse(url);
                        if(aurl.indexOf('aliyundrive.com')>-1){
                            return $("hiker://empty##").rule((input) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                                aliShareUrl(input);
                            },aurl)
                        }else{
                            return "toast://二解云盘共享链接失败";
                        }
                    },item.url,obj.erparse);
                    searchlist.push(arr);
                }
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
        be(list, {
            func: function(obj, id, error, taskResult) {
            },
            param: {
            }
        });
    }
    
}

function aliMyDisk(folder_id) {
    let d = [];
    setPageTitle(typeof(MY_PARAMS)!="undefined" && MY_PARAMS.dirname ? MY_PARAMS.dirname : '我的云盘文件 | 聚影√');
    let headers = {
        'content-type': 'application/json;charset=UTF-8',
        "origin": "https://www.aliyundrive.com",
        "referer": "https://www.aliyundrive.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
        "x-canary": "client=web,app=share,version=v2.3.1"
    };
    try{
        let nowtime = Date.now();
        let oldtime = parseInt(getMyVar('userinfoChecktime','0').replace('time',''));
        let userinfo;
        let aliuserinfo = storage0.getMyVar('aliuserinfo');
        if (aliuserinfo && aliuserinfo.user_id && nowtime < (oldtime+2*60*60*1000)) {
            userinfo = aliuserinfo;
        } else {
            userinfo = JSON.parse(request('https://auth.aliyundrive.com/v2/account/token', { headers: headers, body: { "refresh_token": alitoken, "grant_type": "refresh_token" }, method: 'POST', timeout: 3000 }));
            storage0.putMyVar('aliuserinfo', userinfo);
            putMyVar('userinfoChecktime', nowtime+'time');
        }
        let drive_id = userinfo.default_drive_id;
        let postdata = {"drive_id":drive_id,"parent_file_id":folder_id,"limit":200,"all":true,"url_expire_sec":86400,"image_thumbnail_process":"image/resize,w_400/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_1000,f_jpg,ar_auto,w_300","order_by":"name","order_direction":"ASC"};
        headers['authorization'] = 'Bearer ' + userinfo.access_token;
        let myfilelist = JSON.parse(request('https://api.aliyundrive.com/adrive/v3/file/list', { headers: headers, body: postdata, method: 'POST' })).items;
        let sublist = myfilelist.filter(item => {
            return item.type == "file" && /srt|vtt|ass/.test(item.file_extension);
        })
        
        let dirlist = myfilelist.filter((item) => {
            return item.type == "folder";
        })
        dirlist.forEach((item) => {
            d.push({
                title: item.name,
                img: "hiker://files/cache/src/文件夹.svg",
                url: $("hiker://empty").rule((folder_id) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                    aliMyDisk(folder_id);
                }, item.file_id),
                col_type: 'avatar',
                extra: {
                    dirname: item.name
                }
            })
        })
        let filelist = myfilelist.filter((item) => {
            return item.type == "file";
        })
        filelist.sort(SortList);
        filelist.forEach((item) => {
            if (item.category == "video") {
                let sub_file_id;
                if (sublist.length == 1) {
                    sub_file_id = sublist[0].file_id;
                } else if (sublist.length > 1) {
                    sublist.forEach(it => {
                        if (it.name.substring(0, it.name.lastIndexOf(".")) == item.name.substring(0, item.name.lastIndexOf("."))) {
                            sub_file_id = it.file_id;
                        }
                    })
                }
                let filesize = item.size/1024/1024;
                d.push({
                    title: item.name,
                    img: item.thumbnail || (item.category == "video" ? "hiker://files/cache/src/影片.svg" : item.category == "audio" ? "hiker://files/cache/src/音乐.svg" : item.category == "image" ? "hiker://files/cache/src/图片.png" : "https://img.alicdn.com/imgextra/i1/O1CN01mhaPJ21R0UC8s9oik_!!6000000002049-2-tps-80-80.png"),
                    url: $("hiker://empty##").lazyRule((share_id, file_id, sub_file_id, share_pwd) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
                        let play = getAliUrl(share_id, file_id, alitoken, share_pwd);
                        if (play.urls) {
                            let subtitle;
                            if (sub_file_id) {
                                subtitle = getSubtitle(share_id, sub_file_id, share_pwd);
                            }
                            if (subtitle) {
                                play['subtitle'] = subtitle;
                            }
                            return JSON.stringify(play);
                        }else{
                            return "toast://获取转码播放列表失败，阿里token可能无效";
                        }
                    }, item.share_id, item.file_id, sub_file_id, share_pwd),
                    desc: filesize < 1024 ? filesize.toFixed(2) + 'MB' : (filesize/1024).toFixed(2) + 'GB',
                    col_type: 'avatar',
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
    }catch(e){
        log(e.message);
        toast('有异常，可查看日志');
    }
    setResult(d);
    setLastChapterRule('js:' + $.toString(()=>{
        setResult('');
    }))
}
