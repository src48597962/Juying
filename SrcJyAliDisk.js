
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
    share_pwd = share_pwd || "";
    try{
        let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { headers: headers, body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
        let postdata = { "share_id": share_id, "parent_file_id": folder_id || "root", "limit": 200, "image_thumbnail_process": "image/resize,w_256/format,jpeg", "image_url_process": "image/resize,w_1920/format,jpeg/interlace,1", "video_thumbnail_process": "video/snapshot,t_1000,f_jpg,ar_auto,w_256", "order_by": "name", "order_direction": "DESC" };
        headers['x-share-token'] = sharetoken;
        let sharelist = JSON.parse(request('https://api.aliyundrive.com/adrive/v2/file/list_by_share', { headers: headers, body: postdata, method: 'POST' })).items;
        if(sharelist.length>0){
            d.push({
                title: "⛅⛅⛅保存到我的云盘⛅⛅⛅",
                url: "smartdrive://share/browse?shareId="+share_id+"&sharePwd="+share_pwd,
                col_type: 'text_center_1'
            })
        }
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
                            return "toast://获取转码播放列表失败，阿里token无效";
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
        hideLoading();
        toast('无接口，无法搜索');
    }
    let diskMark = storage0.getMyVar('diskMark') || [];
    if(diskMark.length>20){
        diskMark.splice(0,1);
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
                if(obj.name=="我的云盘"){
                    arr.url = $("hiker://empty##").rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                        aliMyDisk(input);
                    },item.url);
                }else if(item.url.includes(home)){
                    arr.url = $("hiker://empty##").rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                        aliShareUrl(input);
                    },item.url);
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
                diskMark[input] = searchlist;
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
    }
}

function aliMyDisk(folder_id) {
    let d = [];
    setPageTitle(typeof(MY_PARAMS)!="undefined" && MY_PARAMS.dirname ? MY_PARAMS.dirname : '我的云盘文件 | 聚影√');
    try{
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
                let sub_file_url;
                if (sublist.length == 1) {
                    sub_file_url = sublist[0].url;
                } else if (sublist.length > 1) {
                    sublist.forEach(it => {
                        if (it.name.substring(0, it.name.lastIndexOf(".")) == item.name.substring(0, item.name.lastIndexOf("."))) {
                            sub_file_url = it.url;
                        }
                    })
                }
                let filesize = item.size/1024/1024;
                d.push({
                    title: item.name,
                    img: item.thumbnail+"@Referer=https://www.aliyundrive.com/" || (item.category == "video" ? "hiker://files/cache/src/影片.svg" : item.category == "audio" ? "hiker://files/cache/src/音乐.svg" : item.category == "image" ? "hiker://files/cache/src/图片.png" : "https://img.alicdn.com/imgextra/i1/O1CN01mhaPJ21R0UC8s9oik_!!6000000002049-2-tps-80-80.png"),
                    url: $("hiker://empty##").lazyRule((file_id,file_url,sub_file_url) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
                        if(alitoken){
                            let play = aliMyPlayUrl(file_id);
                            if (play.urls) {
                                if (sub_file_url) {
                                    play['subtitle'] = sub_file_url;
                                }
                                play.urls.unshift(file_url);
                                play.names.unshift("原始 文件");
                                play.headers.unshift({'Referer':'https://www.aliyundrive.com/'});
                                return JSON.stringify(play);
                            }else{
                                return "toast://"+play.message;
                            }
                        }else{
                            return "toast://未获取到阿里token";
                        }
                    }, item.file_id, item.url, sub_file_url),
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
