//引入Ali公用文件
require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/', '/master/') + 'SrcJyAliPublic.js');
let folderFilter = new RegExp("优惠券|头像订阅|购买年超级会员|购买会员享8T|关注公众号|返佣金", "i");//文件夹过滤
let errorCode = {
    'ShareLink.Cancelled': '来晚啦，该分享已失效',
    'ShareLink.Forbidden': '违规资源已被封禁',
    'NotFound.ShareLink': '不存在该链接请核对',
    'AccessTokenInvalid': '访问令牌失效，请重新登陆或稍后再试',
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
            share_pwd = it.replace(/提取码|:| |：/g, '');
        }
        if (it.indexOf("https://www.aliyundrive.com") > -1) {
            it = it.replace('https://www.aliyundrive.com/s/', '').replace('链接：', '');
            share_id = it.indexOf('/folder/') > -1 ? it.split('/folder/')[0] : it;
            folder_id = it.indexOf('/folder/') > -1 ? it.split('/folder/')[1] : "root";
        }
    })
    if(share_id && share_id!="undefined"){
        addListener("onClose", $.toString(() => {
            putMyVar('SrcJy$back','1');
        }));
        putMyVar('SrcJy$back','1');
        aliShare(share_id, folder_id, share_pwd);
    }else{
        back(false);
        toast("链接地址不正确");
    }
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
                            try{
                                eval("var alistData = " + fy_bridge_app.fetch(alistfile));
                            }catch(e){
                                var alistData = {};
                            }
                        } else {
                            var alistData = {};
                        }
                        let alistconfig = alistData.config || {};
                        alistconfig.alitoken = token.refresh_token;
                        fy_bridge_app.copy(alistconfig.alitoken);
                        fy_bridge_app.log(alistconfig.alitoken);
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
                    setTimeout(tokenFunction, 500);
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
function aliDiskSearch(input,data) {
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
                        dirname: item.title
                    }
                };

                let home = "https://www.aliyundrive.com/s/";
                if(obj.name=="我的云盘"){
                    arr.url = $(item.url).rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                        aliMyDisk(input);
                    },item.url);
                }else if(item.url.includes(home)){
                    arr.url = $(item.url.split('\n')[0]).rule((input) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliDisk.js');
                        aliShareUrl(input);
                    },item.url);
                } else if (obj.erparse) {
                    arr.url = $("hiker://empty").lazyRule((url,erparse) => {
                        eval('let Parse = '+erparse)
                        let aurl = Parse(url);
                        if(aurl.indexOf('aliyundrive.com')>-1){
                            return $(aurl).rule((input) => {
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
//eval(fetch(''))
evalPrivateJS('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')
evalPrivateJS('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')