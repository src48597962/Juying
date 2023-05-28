
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

function myDiskMenu(islogin){
    let setalitoken = $().lazyRule((alistfile, alistData) => {
        let alistconfig = alistData.config || {};
        let alitoken = alistconfig.alitoken;
        return $(alitoken||"","refresh_token").input((alistfile,alistData,alistconfig)=>{
            alistconfig.alitoken = input;
            alistData.config = alistconfig;
            writeFile(alistfile, JSON.stringify(alistData));
            clearMyVar('getalitoken');
            refreshPage(false);
            return "toast://已设置";
        },alistfile,alistData,alistconfig)
    }, alistfile, alistData)

    let onlogin = [{
        title: userinfo.nick_name,
        url: setalitoken,
        img: userinfo.avatar,
        col_type: 'avatar'
    },{
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
                        if(fy_bridge_app.fetch(alistfile)){
                            eval("var alistData = " + fy_bridge_app.fetch(alistfile));
                        }else{
                            var alistData = {};
                        }
                        let alistconfig = alistData.config || {};
                        alistconfig.alitoken = token.refresh_token;
                        alistData.config = alistconfig;
                        fy_bridge_app.writeFile(alistfile, JSON.stringify(alistData));
                        localStorage.clear();
                        alert('TOKEN获取成功，返回后刷新页面！');
                        fy_bridge_app.parseLazyRule(`hiker://empty@lazyRule=.js:refreshX5WebView('');`);
                        fy_bridge_app.back();
                        return;
                    } else {
                        token_timer();
                    }
                }
                var token_timer = function () {
                    setTimeout(tokenFunction, 500)
                };
                tokenFunction();
            })
            d.push({
                url: url,
                col_type: 'x5_webview_single',
                desc: '100%&&float',
                extra: {
                    canBack: true,
                    js: js
                }
            })
            setResult(d);
        }),
        col_type: 'text_center_1'
    },{
        title: "⭐手工填写token⭐",
        url: setalitoken,
        col_type: 'text_center_1'
    }]
    if(islogin){
        return onlogin;
    }else{
        return nologin;
    }
}

evalPrivateJS('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')
evalPrivateJS('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')
function aliMyDisk(folder_id,nofilter) {
    let d = [];
    setPageTitle(typeof(MY_PARAMS)!="undefined" && MY_PARAMS.dirname ? MY_PARAMS.dirname : '我的云盘 | 聚影√');
    if(userinfo&&userinfo.user_id){
        if(folder_id=="root"){
            let mydisk = myDiskMenu(1) || [];
            d = d.concat(mydisk);
        }
        try{
            let drive_id = userinfo.default_drive_id;
            let postdata = {"drive_id":drive_id,"parent_file_id":folder_id,"limit":200,"all":false,"url_expire_sec":14400,"image_thumbnail_process":"image/resize,w_256/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg/interlace,1","video_thumbnail_process":"video/snapshot,t_1000,f_jpg,ar_auto,w_256","order_by":"updated_at","order_direction":"DESC"};
            headers['authorization'] = 'Bearer ' + userinfo.access_token;
            headers['x-canary'] = "client=web,app=adrive,version=v4.1.1";
            let myfilelist = JSON.parse(request('https://api.aliyundrive.com/adrive/v3/file/list', { headers: headers, body: postdata, method: 'POST' })).items;
            if(myfilelist.length>0){
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
                        url: $("hiker://empty").rule((folder_id,nofilter) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
                            aliMyDisk(folder_id,nofilter);
                        }, item.file_id,nofilter),
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
                    if (item.category == "video" || nofilter) {
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
                            img: item.thumbnail? item.thumbnail+"@Referer=https://www.aliyundrive.com/" : item.category == "video" ? "hiker://files/cache/src/影片.svg" : item.category == "audio" ? "hiker://files/cache/src/音乐.svg" : item.category == "image" ? "hiker://files/cache/src/图片.png" : "https://img.alicdn.com/imgextra/i1/O1CN01mhaPJ21R0UC8s9oik_!!6000000002049-2-tps-80-80.png@Referer=",
                            url: $("hiker://empty##").lazyRule((category,file_id,file_url,sub_file_url) => {
                                if(category=="video"){
                                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
                                    if(alitoken){
                                        let play = aliMyOpenPlayUrl(file_id);
                                        if (play.urls) {
                                            if (sub_file_url) {
                                                play['subtitle'] = sub_file_url;
                                            }
                                            //play.urls.unshift(file_url+ "#isVideo=true##pre#");
                                            //play.names.unshift("原始 画质");
                                            //play.headers.unshift({'Referer':'https://www.aliyundrive.com/'});
                                            return JSON.stringify(play);
                                        }else{
                                            return "toast://"+play.message;
                                        }
                                    }else{
                                        return "toast://未获取到阿里token";
                                    }
                                }else if(category == "audio"){
                                    return file_url + ";{Referer@https://www.aliyundrive.com/}#isMusic=true#";
                                }else if(category == "image"){
                                    return file_url + "#.jpg@Referer=https://www.aliyundrive.com/";
                                }else{
                                    return "download://" + file_url + ";{Referer@https://www.aliyundrive.com/}";
                                }
                            }, item.category, item.file_id, item.url||"", sub_file_url||""),
                            desc: filesize < 1024 ? filesize.toFixed(2) + 'MB' : (filesize/1024).toFixed(2) + 'GB',
                            col_type: 'avatar',
                            extra: {
                                id: item.file_id,
                                inheritTitle: false
                            }
                        })
                    }
                })
                if(!nofilter){
                    d.push({
                        title: "““””<small><font color=#f20c00>已开启文件过滤，仅显示视频文件</font></small>",
                        url: "hiker://empty",
                        col_type: "text_center_1"
                    })
                }
            }else{
                toast('列表为空');
            }
        }catch(e){
            log(e.message);
            toast('有异常查看日志，可刷新确认下');
        }
    }else{
        let mydisk = myDiskMenu(0) || [];
        d = d.concat(mydisk);
    }
    setResult(d);
    setLastChapterRule('js:' + $.toString(()=>{
        setResult('');
    }))
}
//evalPrivateJS('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')