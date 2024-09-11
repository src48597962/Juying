// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明

// 获取一级数据
function getYiData(jkdata) {
    let fllists;
    let vodlists;
    let error = {};
    let api_name = jkdata.name || "";
    let api_type = jkdata.type || "";
    let api_url = jkdata.url || "";
    let api_ua = jkdata.ua || "MOBILE_UA";
    api_ua = api_ua == "MOBILE_UA" ? MOBILE_UA : api_ua == "PC_UA" ? PC_UA : api_ua;
    let headers = { 'User-Agent': api_ua };
    let vodhost, classurl, listurl, detailurl, listnode, extdata, noerji, coltype;
    //分类变量
    let fold = getMyVar('SrcJu_dianbo$fold', "0");//是否展开小分类筛选
    let cate_id = getMyVar('SrcJu_dianbo$分类', '');
    let fl = storage0.getMyVar('SrcJu_dianbo$flCache') || {};
    if(cate_id=="tj" && MY_PAGE>1){
        return {
            fllists: [],
            vodlists: [],
            error: {}
        }
    }

    //基础链接拼接
    if (api_type == "v1") {
        let date = new Date();
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let key = (mm < 10 ? "0" + mm : mm) + "" + (dd < 10 ? "0" + dd : dd);
        classurl = api_url + "/types";
        listurl = api_url + '?key=' + key + '&type=${fl.cateId}&page=' + MY_PAGE;
        detailurl = api_url + '/detail?&key=' + key + '&vod_id=';
        listnode = "json.data.list";
    } else if (api_type == "app") {
        classurl = api_url + "nav";
        listurl = api_url + 'video?tid=${fl.cateId}&pg=' + MY_PAGE;
        detailurl = api_url + 'video_detail?id=';
        listnode = "json.list";
    } else if (api_type == "v2") {
        classurl = api_url + "nav";
        listurl = api_url + 'video?tid=${fl.cateId}&pg=' + MY_PAGE;
        detailurl = api_url + 'video_detail?id=';
        listnode = "json.data";
    } else if (api_type == "iptv") {
        classurl = api_url + "?ac=flitter";
        listurl = api_url + '?ac=list&class=${fl.cateId}&page=' + MY_PAGE;
        detailurl = api_url + '?ac=detail&ids=';
        listnode = "json.data";
    } else if (api_type == "cms") {
        classurl = api_url + "?ac=list";
        listurl = api_url + '?ac=videolist&t=${fl.cateId}&pg=' + MY_PAGE;
        detailurl = api_url + '?ac=videolist&ids=';
        listnode = "json.list";
    } else if (/XBPQ|XPath|XYQ/.test(api_type)) {
        extdata = extDataCache(jkdata);
        if ($.type(extdata) == 'object') {
            if (api_type == "XBPQ") {
                let host = extdata["主页url"] || '';
                classurl = extdata["分类"];
                extdata["分类url"] = extdata["分类url"] ? extdata["分类url"].split(';;')[0].split('[')[0] : "";
                listurl = extdata["分类url"] ? /^http/.test(extdata["分类url"]) ? extdata["分类url"] : host + extdata["分类url"] : "";
            } else if (api_type == "XPath") {
                let host = extdata["homeUrl"] || '';
                classurl = host;
                extdata["cateUrl"] = extdata["cateUrl"] ? extdata["cateUrl"].split(';;')[0].split('[')[0] : "";
                listurl = extdata["cateUrl"] ? /^http/.test(extdata["cateUrl"]) ? extdata["cateUrl"] : host + extdata["cateUrl"] : "";
            } else if (api_type == "XYQ") {
                if (extdata["请求头参数"]) {
                    if (extdata["请求头参数"].includes('#') || extdata["请求头参数"].includes('$')) {
                        extdata["请求头参数"].split('#').forEach(v => {
                            headers[v.split('$')[0]] = v.split('$')[1];
                        })
                    } else {
                        headers["User-Agent"] = extdata["请求头参数"] || headers["User-Agent"];
                    }
                }
                headers["User-Agent"] = (headers["User-Agent"] == "电脑" || headers["User-Agent"] == "PC_UA") ? PC_UA : MOBILE_UA;
                let host = extdata["首页推荐链接"] || '';
                classurl = host;
                extdata["分类链接"] = extdata["分类链接"].includes('firstPage=')&&MY_PAGE==1?extdata["分类链接"].split('firstPage=')[1].split(']')[0]:extdata["分类链接"].split('[')[0];
                listurl = extdata["分类链接"] ? /^http/.test(extdata["分类链接"]) ? extdata["分类链接"] : host + extdata["分类链接"] : "";
            }
            vodhost = getHome(listurl);
        }
    } else if (api_type == 'hipy_t3') {
        if(getItem('hipy_t3_enable')!="1"){
            toast("hipy_t3请使用DrpyHiker小程序");
            log("hipy_t3接口未开启");
            return {
                fllists: [],
                vodlists: [],
                error: {}
            }
        }

        var drpy = GM.defineModule("SrcJuDrpy", config.依赖.match(/http(s)?:\/\/.*\//)[0] + "SrcJyDrpy.js").get(jkdata);
        let rule = drpy.getRule();
        detailurl = rule.detailUrl || "";
        classurl = rule.homeUrl || rule.host;
        listurl = rule.filter_url || rule.host;
        if(rule.二级=="*"){
            noerji = 1;
        }
        if(rule.hikerClassListCol){
            coltype = rule.hikerClassListCol;
        }
    } else if (api_type == "hipy_t4") {
        classurl = api_url + "&extend=" + jkdata.ext + "&filter=true";
        listurl = api_url + "&t={cate_id}&ac=detail&pg="+MY_PAGE+"&extend="+jkdata.ext+"&ext={flb64}";
        //listnode = "json.list";
    } else {
        log(api_type + '>api类型错误');
        return {
            fllists: [],
            vodlists: [],
            error: {}
        }
    }

    //一级第1页生成分类数据
    if (MY_PAGE == 1) {
        if (classurl) {
            MY_URL = classurl;
            let 推荐 = [];
            let 分类 = [];
            let 筛选;

            let cate_exclude = ['主页', '求片/留言'];
            const Color = getItem("主题颜色", "#6dc9ff");
            let classCache = storage0.getMyVar('SrcJu_dianbo$classCache');
            if (classCache) {
                推荐 = classCache.推荐;
                分类 = classCache.分类;
                筛选 = classCache.筛选;
            } else {
                try {
                    if (api_type == "hipy_t4"){
                        let home = JSON.parse(getHtml(classurl, headers));
                        let typelist = home['class'] || [];
                        typelist.forEach(v=>{
                            分类.push(v.type_name + '$' + v.type_id);
                        })
                        if(home['filters']){
                            筛选 = home['filters'];
                        }
                        let homeVod = home['list'] || [];
                        homeVod.forEach(it=>{
                            推荐.push({ "vod_url": it.vod_id.toString(), "vod_name": it.vod_name, "vod_desc": it.vod_remarks, "vod_pic": it.vod_pic });
                        })
                    }else if (api_type == "hipy_t3") {
                        let home = JSON.parse(drpy.home());
                        let typelist = home['class'] || [];
                        typelist.forEach(v=>{
                            分类.push(v.type_name + '$' + v.type_id);
                        })
                        if(home['filters']){
                            筛选 = home['filters'];
                        }
                        let homeVod = JSON.parse(drpy.homeVod()).list || [];
                        homeVod.forEach(it=>{
                            let playUrl = it.vod_id.toString().split("@@")[0].trim();
                            if(detailurl && noerji && !playUrl.startsWith("http")){
                                let fyclass = "";
                                let fyid = playUrl;
                                if(playUrl.includes("$")){
                                    fyclass = playUrl.split("$")[0];
                                    fyid = playUrl.split("$")[1];
                                }
                                playUrl = detailurl.replace(/fyclass/g, fyclass).replace(/fyid/g, fyid);
                            }
                            推荐.push({ "vod_url": it.vod_id.toString(), "vod_name": it.vod_name, "vod_desc": it.vod_remarks, "vod_pic": it.vod_pic, "vod_play":noerji?playUrl:"" });
                        })
                    } else if (api_type == "XYQ") {
                        if (extdata['是否开启获取首页数据'] && extdata['首页列表数组规则'] && extdata['首页片单列表数组规则']) {
                            let gethtml = getHtml(classurl, headers);
                            let 首页列表数组 = pdfa(gethtml, extdata['首页列表数组规则'] + '&&' + extdata['首页片单列表数组规则']);
                            let 图片规则 = extdata['首页片单图片'] || extdata['分类片单图片'];
                            let 图片前缀 = "";
                            if(图片规则.includes('+')){
                                图片前缀 = 图片规则.split('+')[0].replace(/'|`|"/g, '');
                                图片规则 = 图片规则.split('+')[1];
                            }
                            首页列表数组.forEach(v => {
                                    if (extdata['首页片单是否Jsoup写法']=="1"||extdata['首页片单是否Jsoup写法']=="是") {
                                        let vodid = pd(v, extdata['首页片单链接'] || extdata['分类片单链接'], vodhost);
                                        let vodname = pdfh(v, extdata['首页片单标题'] || extdata['分类片单标题']);
                                        let vodpic = 图片前缀 + pdfh(v, 图片规则);
                                        let voddesc = pdfh(v, extdata['首页片单副标题'] || extdata['分类片单副标题']);
                                        if (vodid && vodname) {
                                            推荐.push({ "vod_url": vodid, "vod_name": vodname, "vod_desc": voddesc, "vod_pic": vodpic });
                                        }
                                    }

                            })
                        }

                        let typenames = extdata['分类名称'] ? extdata['分类名称'].split('&') : [];
                        let typeids = extdata['分类名称替换词'] ? extdata['分类名称替换词'].split('&') : [];
                        for (let i in typeids) {
                            if (cate_exclude.indexOf(typenames[i]) == -1) {
                                分类.push(typenames[i] + '$' + typeids[i]);
                            }
                        }

                        if ($.type(extdata['筛选数据']) == "string" && extdata['筛选数据'] == "ext") {
                            let 筛选循环 = ["子分类", "类型", "地区", "年份", "语言", "排序"];
                            let 筛选循环id = ["cateId", "class", "area", "year", "lang", "by"];
                            筛选循环.forEach((it, id) => {
                                if (extdata['筛选' + it + '名称'] && extdata['筛选' + it + '替换词']) {
                                    extdata['筛选' + it + '替换词'] = extdata['筛选' + it + '替换词'] == "*" ? extdata['筛选' + it + '名称'] : extdata['筛选' + it + '替换词'];
                                    let catenames = extdata['筛选' + it + '名称'].split('||');
                                    let cateids = extdata['筛选' + it + '替换词'].split('||');
                                    
                                    if (it == "排序") {
                                        for (let i = 0; i < typeids.length-1; i++) {
                                            catenames = catenames.concat(catenames.slice(0, 1));
                                            cateids = cateids.concat(cateids.slice(0, 1));
                                        }
                                    }

                                    cateids.forEach((x, i) => {
                                        let value = [];
                                        let names = catenames[i].split('&');
                                        let ids = cateids[i].split('&');
                                        for (let j in names) {
                                            value.push({ n: names[j], v: ids[j] });
                                        }
                                        if (value.length > 0) {
                                            if (it != "排序") {
                                                value.unshift({ n: "全部", v: "" });
                                            }
                                            筛选 = 筛选 || {};
                                            筛选[typeids[i]] = 筛选[typeids[i]] || [];
                                            筛选[typeids[i]].push({ "key": 筛选循环id[id], "name": it, "value": value });
                                        }
                                    })
                                }
                            })
                        }
                    } else if (api_type == "XPath") {
                        let gethtml = getHtml(classurl, headers);
                        let typenames = xpathArray(gethtml, extdata['cateNode'] + extdata['cateName']);
                        let typeids = xpathArray(gethtml, extdata['cateNode'] + extdata['cateId']);
                        if (extdata['cateIdR']) {
                            typeids = typeids.map(x => {
                                return x.match(extdata['cateIdR'])[1];
                            })
                        }
                        for (let i in typeids) {
                            if (cate_exclude.indexOf(typenames[i]) == -1) {
                                分类.push(typenames[i] + '$' + typeids[i]);
                            }
                        }
                    } else if (api_type == "XBPQ") {
                        if (extdata["分类"].indexOf('$') > -1) {
                            分类 = extdata["分类"].split('#');
                        } else if (extdata["分类"].indexOf('&') > -1 && extdata["分类值"]) {
                            let typenames = extdata["分类"].split('&');
                            let typeids = extdata["分类值"].split('&');
                            for (let i in typeids) {
                                if (cate_exclude.indexOf(typenames[i]) == -1) {
                                    分类.push(typenames[i] + '$' + typeids[i]);
                                }
                            }
                        }
                        筛选 = extdata["筛选"];
                    } else {
                        let gethtml = getHtml(classurl, headers);
                        if (api_type == "v1") {
                            let typehtml = JSON.parse(gethtml);
                            let typelist = typehtml.data.list || typehtml.data.typelist;
                            typelist.map((it) => {
                                分类.push(it.type_name + '$' + it.type_id);
                            })
                        } else if (/app|v2/.test(api_type)) {
                            let typehtml = JSON.parse(gethtml);
                            let typelist = typehtml.list || typehtml.data;
                            typelist.forEach(it => {
                                分类.push(it.type_name + '$' + it.type_id);
                            })
                            if(api_type=="app"){
                                try{
                                    let gettjhtml = getHtml(api_url+'index_video?token=', headers);
                                    let tjlist = JSON.parse(gettjhtml).list;
                                    tjlist.forEach(it=>{
                                        it.vlist.forEach(v=>{
                                            推荐.push({ "vod_url": detailurl + v.vod_id, "vod_name": v.vod_name, "vod_desc": v.vod_remarks, "vod_pic": v.vod_pic });
                                        })
                                    })
                                }catch(e){}
                            }
                        } else if (api_type == "iptv") {
                            let type_dict = {
                                comic: '动漫',
                                movie: '电影',
                                tvplay: '电视剧',
                                tvshow: '综艺',
                                movie_4k: '4k',
                                hanguoju: '韩剧',
                                oumeiju: '欧美剧',
                                tiyu: '体育'
                            };
                            let typelist = JSON.parse(gethtml);
                            typelist.forEach((it) => {
                                if (type_dict[it]) {
                                    分类.push(type_dict[it] + '$' + it);
                                }
                            })
                        } else if (api_type == "cms") {
                            if (/<\?xml/.test(gethtml)) {
                                let typelist = pdfa(gethtml, 'class&&ty');
                                if (jkdata.categories) {
                                    for (var i = 0; i < typelist.length; i++) {
                                        if (jkdata.categories.indexOf(String(xpath(typelist[i], `//ty/text()`)).trim()) == -1) {
                                            typelist.splice(i, 1);
                                            i = i - 1;
                                        }
                                    }
                                }
                                typelist.forEach((it) => {
                                    分类.push(String(xpath(it, `//ty/text()`)).trim() + '$' + String(xpath(it, `//ty/@id`)).trim());
                                })
                            } else {
                                let typehtml = dealJson(gethtml);
                                let typelist = typehtml["class"] || [];
                                if (jkdata.categories) {
                                    for (var i = 0; i < typelist.length; i++) {
                                        if (jkdata.categories.indexOf(typelist[i].type_name) == -1 && typelist[i].type_pid!=0) {
                                            typelist.splice(i, 1);
                                            i = i - 1;
                                        }
                                    }
                                }

                                typelist.forEach((it) => {
                                    if(it.type_name && it.type_id){
                                        if(it.type_pid==0){
                                            分类.push(it.type_name + '$' + it.type_id);
                                            let value = [];
                                            typelist.forEach((itit) => {
                                                if (itit.type_pid == it.type_id) {
                                                    value.push({ n: itit.type_name, v: itit.type_id });
                                                }
                                            })
                                            if (value.length > 0) {
                                                筛选 = 筛选 || {};
                                                筛选[it.type_id] = [{ "key": "cateId", "name": it.type_name, "value": value }];
                                            }
                                        }
                                    }
                                })

                                if(分类.length==0 && typelist.length>0){
                                    // 针对一些奇怪的网站没有一级分类时，全部显示为一级分类
                                    typelist.forEach((it) => {
                                        if(it.type_name && it.type_id){
                                            分类.push(it.type_name + '$' + it.type_id);
                                        }
                                    })
                                }
                                try{
                                    let gettjhtml = getHtml(api_url+'?ac=videolist&pg=1', headers);
                                    let tjlist = JSON.parse(gettjhtml).list;
                                    tjlist.forEach(v=>{
                                        推荐.push({ "vod_url": detailurl + v.vod_id, "vod_name": v.vod_name, "vod_desc": v.vod_remarks, "vod_pic": v.vod_pic });
                                    })
                                }catch(e){}
                            }
                        }
                    }
                } catch (e) {
                    error.fl = 1;
                    log(api_name + '>获取分类数据异常>' + e.message + " 错误行#" + e.lineNumber);
                }
                if (分类.length > 0) {
                    storage0.putMyVar('SrcJu_dianbo$classCache', { 分类: 分类, 筛选: 筛选, 推荐: 推荐 });
                }
            }

            if (分类.length > 0) {
                fllists = [];
                try {
                    cate_id = getMyVar('SrcJu_dianbo$分类', 推荐.length > 0 ? 'tj' : 分类[0].split('$')[1]);

                    if ($.type(筛选)=='object' && api_type != 'cms' && cate_id != 'tj') {
                        fllists.push({
                            title: fold === '1' ? '““””<b><span style="color: #F54343">∨</span></b>' : '““””<b><span style="color:' + Color + '">∧</span></b>',
                            url: $('#noLoading#').lazyRule((fold) => {
                                putMyVar('SrcJu_dianbo$fold', fold === '1' ? '0' : '1');
                                clearMyVar('SrcJu_dianbo$flCache');
                                refreshPage(false);
                                return "hiker://empty";
                            }, fold),
                            col_type: 'scroll_button'
                        })
                    }

                    putMyVar('SrcJu_dianbo$分类', cate_id);
                    if (推荐.length > 0) {
                        if (cate_id == 'tj') {
                            vodlists = 推荐;//当前分类为推荐，取推荐列表
                        }
                        fllists.push({
                            title: cate_id == 'tj' ? '““””<b><span style="color:' + Color + '">' + '推荐' + '</span></b>' : '推荐',
                            url: $('#noLoading#').lazyRule(() => {
                                putMyVar('SrcJu_dianbo$分类', 'tj');
                                refreshPage(true);
                                return "hiker://empty";
                            }),
                            col_type: 'scroll_button',
                            extra: {
                                backgroundColor: cate_id=='tj'?"#20" + Color.replace('#',''):""
                            }
                        });
                    }

                    分类.forEach((it, i) => {
                        let itname = it.split('$')[0].replace(/|||/g, '').trim();
                        let itid = it.split('$')[1];
                        fllists.push({
                            title: cate_id == itid ? '““””<b><span style="color:' + Color + '">' + itname + '</span></b>' : itname,
                            url: $('#noLoading#').lazyRule((itid) => {
                                putMyVar('SrcJu_dianbo$分类', itid);
                                clearMyVar('SrcJu_dianbo$flCache');
                                refreshPage(true);
                                return "hiker://empty";
                            }, itid),
                            col_type: 'scroll_button',
                            extra: {
                                backgroundColor: cate_id==itid?"#20" + Color.replace('#',''):""
                            }
                        });
                    })
                    fllists.push({
                        col_type: "blank_block"
                    });

                    if (筛选 && (fold == '1' || api_type == 'cms')) {
                        Object.entries(筛选).forEach(([key, value]) => {
                            //console.log(`Key: ${key}, Value: ${value}`);
                            if (key == cate_id) {
                                value.forEach(it => {
                                    if (it.value.length > 0) {
                                        fl[it.key] = fl[it.key] || it.value[0].v;
                                        it.value.forEach((itit) => {
                                            fllists.push({
                                                title: fl[it.key] == itit.v ? '““””<b><span style="color:' + Color + '">' + itit.n + '</span></b>' : itit.n,
                                                url: $('#noLoading#').lazyRule((flkey, itid) => {
                                                    let fl = storage0.getMyVar('SrcJu_dianbo$flCache') || {};
                                                    fl[flkey] = itid;
                                                    storage0.putMyVar('SrcJu_dianbo$flCache', fl);
                                                    refreshPage(true);
                                                    return "hiker://empty";
                                                }, it.key, itit.v),
                                                col_type: 'scroll_button',
                                                extra: {
                                                    backgroundColor: fl[it.key]==itit.v?"#20" + Color.replace('#',''):""
                                                }
                                            });
                                        })
                                        fllists.push({
                                            col_type: "blank_block"
                                        });
                                    }
                                })
                            }
                        });
                    }
                    storage0.putMyVar('SrcJu_dianbo$flCache', fl);
                } catch (e) {
                    error.fl = 1;
                    log(api_name + '>生成分类数据异常>' + e.message + " 错误行#" + e.lineNumber);
                }
            }
        }
    }

    if (listurl && cate_id!="tj" && !error.fl) {
        try {
            fl.cateId = fl.cateId || cate_id;
            //拼接生成分类页url链接
            if (api_type == 'hipy_t4'){
                delete fl.cateId;
                MY_URL = listurl.replace('{cate_id}', cate_id).replace('{flb64}', base64Encode(JSON.stringify(fl)));
            } else if (api_type == "XYQ") {
                fl.catePg = MY_PAGE;
                let execStrs = getExecStrs(listurl);
                execStrs.forEach(k => {
                    if (!fl[k]) {
                        listurl = listurl.replace('/' + k + '/{' + k + '}', '');
                    }
                })
                listurl = listurl.replace('{catePg}', MY_PAGE).replace(/{/g, '${fl.').replace(/}/g, ' || ""}');
                eval(`listurl = \`${listurl}\`;`);
                MY_URL = listurl;
            } else if (api_type == "XPath") {
                fl.catePg = MY_PAGE;
                let execStrs = getExecStrs(listurl);
                execStrs.forEach(k => {
                    if (!fl[k]) {
                        listurl = listurl.replace('/' + k + '/{' + k + '}', '');
                    }
                })
                listurl = listurl.replace('{catePg}', MY_PAGE).replace(/{/g, '${fl.').replace(/}/g, ' || ""}');
                eval(`listurl = \`${listurl}\`;`);
                MY_URL = listurl;
            } else if (api_type == "XBPQ") {
                fl.catePg = MY_PAGE;
                let execStrs = getExecStrs(listurl);
                execStrs.forEach(k => {
                    if (!fl[k]) {
                        listurl = listurl.replace('/' + k + '/{' + k + '}', '');
                    }
                })
                listurl = listurl.replace('{catePg}', extdata["起始页"] ? MY_PAGE > extdata["起始页"] ? MY_PAGE : extdata["起始页"] : MY_PAGE).replace(/{/g, '${fl.').replace(/}/g, ' || ""}');
                eval(`listurl = \`${listurl}\`;`);
                MY_URL = listurl;
            } else {
                eval(`listurl = \`${listurl}\`;`);
                MY_URL = listurl;
            }

            vodlists = [];
            let vod_name, vod_pic, vod_url, vod_desc;
            if (api_type=="hipy_t4") {
                let vodlist = JSON.parse(getHtml(MY_URL, headers)).list || [];
                vodlist.forEach(it=>{
                    vodlists.push({ "vod_url": it.vod_id.toString(), "vod_name": it.vod_name, "vod_desc": it.vod_remarks, "vod_pic": it.vod_pic });
                })
            }else if (api_type=="hipy_t3") {
                delete fl.cateId;
                let vodlist = JSON.parse(drpy.category(cate_id, MY_PAGE, true, fl)).list || [];
                vodlist.forEach(it=>{
                    let playUrl = it.vod_id.toString().split("@@")[0].trim();
                    if(detailurl && noerji && !playUrl.startsWith("http")){
                        let fyclass = "";
                        let fyid = playUrl;
                        if(playUrl.includes("$")){
                            fyclass = playUrl.split("$")[0];
                            fyid = playUrl.split("$")[1];
                        }
                        playUrl = detailurl.replace(/fyclass/g, fyclass).replace(/fyid/g, fyid);
                    }
                    vodlists.push({ "vod_url": it.vod_id.toString(), "vod_name": it.vod_name, "vod_desc": it.vod_remarks, "vod_pic": it.vod_pic, "vod_play": noerji?playUrl:"" });
                })
            }else if (api_type == "XYQ") {
                let gethtml = getHtml(MY_URL, headers);
                if ((extdata['分类片单是否Jsoup写法']=="1" || extdata['分类片单是否Jsoup写法']=="是") && extdata['分类列表数组规则']) {
                    let 图片规则 = extdata['分类片单图片'];
                    let 图片前缀 = "";
                    if(图片规则.includes('+')){
                        图片前缀 = 图片规则.split('+')[0].replace(/'|`|"/g, '');
                        图片规则 = 图片规则.split('+')[1];
                    }
                    pdfa(gethtml, extdata['分类列表数组规则']).forEach(it => {
                        let vodname = pdfh(it, extdata['分类片单标题']);
                        let vodid = pd(it, extdata['分类片单链接'], vodhost);
                        let vodimg = 图片前缀 + pdfh(it, 图片规则);
                        let voddesc = pdfh(it, extdata['分类片单副标题']);
                        if (vodname && vodid) {
                            let arr = { "vod_url": vodid, "vod_name": vodname, "vod_desc": voddesc, "vod_pic": vodimg };
                            vodlists.push(arr);
                        }
                    })
                }
            } else if (api_type == "XPath") {
                let gethtml = getHtml(MY_URL, headers);
                let vodnames = xpathArray(gethtml, extdata["homeVodNode"] + extdata["homeVodName"]);
                let vodids = xpathArray(gethtml, extdata["homeVodNode"] + extdata["homeVodId"]);
                let vodimgs = xpathArray(gethtml, extdata["homeVodNode"] + extdata["homeVodImg"]);
                let vodmarks = xpathArray(gethtml, extdata["homeVodNode"] + extdata["homeVodMark"]);
                for (let i in vodids) {
                    if (vodids[i] && vodnames[i]) {
                        let arr = { "vod_url": vodhost + vodids[i], "vod_name": vodnames[i], "vod_desc": vodmarks[i], "vod_pic": vodimgs[i] };
                        vodlists.push(arr);
                    }
                }
            } else if (api_type == "XBPQ") {
                let gethtml = getHtml(MY_URL, headers);
                extdata["二次截取"] = extdata["二次截取"] || (gethtml.indexOf(`<ul class="stui-vodlist`) > -1 ? `<ul class="stui-vodlist&&</ul>` : gethtml.indexOf(`<ul class="myui-vodlist`) > -1 ? `<ul class="myui-vodlist&&</ul>` : "");
                if (extdata["二次截取"]) {
                    gethtml = gethtml.split(extdata["二次截取"].split('&&')[0])[1].split(extdata["二次截取"].split('&&')[1])[0];
                }
                extdata["链接"] = extdata["链接"] || `href="&&"`;
                extdata["标题"] = extdata["标题"] || `title="&&"`;
                extdata["数组"] = extdata["数组"] || `<a &&</a>`;
                let vodlist = gethtml.match(new RegExp(extdata["数组"].split('[')[0].replace('&&', '((?:.|[\r\n])*?)'), 'g')) || [];
                vodlist.forEach(item => {
                    if (!extdata["图片"]) {
                        if (item.indexOf('original=') > -1) {
                            extdata["图片"] = `original="&&"`;
                        } else if (item.indexOf('<img src=') > -1) {
                            extdata["图片"] = `<img src="&&"`;
                        }
                    };
                    if (extdata["图片"] && item.indexOf(extdata["图片"].split("&&")[0]) > -1) {
                        vod_url = getBetweenStr(item, extdata["链接"]);
                        vod_url = /^http/.test(vod_url) ? vod_url : (extdata["链接前缀"]||vodhost) + vod_url;
                        vod_name = getBetweenStr(item, extdata["标题"]);
                        vod_pic = "";
                        try {
                            vod_pic = getBetweenStr(item, extdata["图片"]);
                        } catch (e) { }
                        vod_desc = "";
                        try {
                            vod_desc = getBetweenStr(item, extdata["副标题"]);
                        } catch (e) { }
                        let arr = { "vod_url": vod_url, "vod_name": vod_name, "vod_desc": vod_desc, "vod_pic": vod_pic };
                        vodlists.push(arr);
                    }
                })
            } else {
                let gethtml = getHtml(MY_URL, headers);
                let json;
                if (api_type=="cms" && /<\?xml/.test(gethtml)) {
                    gethtml = gethtml.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g, '');
                    let xmllist = [];
                    let videos = pdfa(gethtml, 'list&&video');
                    for (let i in videos) {
                        let id = String(xpath(videos[i], `//video/id/text()`)).trim();
                        let name = String(xpath(videos[i], `//video/name/text()`)).trim();
                        let pic = String(xpath(videos[i], `//video/pic/text()`)).trim();
                        let note = String(xpath(videos[i], `//video/note/text()`)).trim();
                        let arr = { "vod_id": id, "vod_name": name, "vod_remarks": note, "vod_pic": pic };
                        let plays = xpathArray(videos[i], `//video/dl/dd/text()`);
                        if (plays.length == 1) {
                            let play = plays[0];
                            if (play.indexOf('$') == -1 && play.indexOf('m3u8') > -1) {
                                arr['playUrl'] = play.trim();
                            }
                        }
                        xmllist.push(arr)
                    }
                    json = { "list": xmllist };
                } else if (!/{|}/.test(gethtml) && gethtml != "") {
                    let decfile = globalMap0.getVar('Jy_gmParams').datapath + "appdec.js";
                    let Juyingdec = fetch(decfile);
                    if (Juyingdec != "") {
                        eval(Juyingdec);
                        json = JSON.parse(xgdec(gethtml));
                    }
                } else {
                    json = JSON.parse(gethtml);
                }
                let vodlist = [];
                try {
                    vodlist = eval(listnode) || json.list || json.data.list || json.data || [];
                } catch (e) {
                    vodlist = json.list || json.data.list || json.data || [];
                }
 
                vodlist.forEach(it => {
                    if (api_type == 'cms' && it.vod_play_url) {
                        if (it.vod_play_url.indexOf('$') == -1 && it.vod_play_url.indexOf('m3u8') > -1) {
                            it['playUrl'] = it.vod_play_url;
                        }
                    }
                    let vodurl = it.vod_id ? detailurl + it.vod_id : it.nextlink;
                    let vodpic = it.vod_pic || it.pic || "";
                    if(vodurl){
                        let arr = { "vod_url": vodurl, "vod_name": it.vod_name || it.title, "vod_desc": it.vod_remarks || it.state || "", "vod_pic": vodpic, "vod_play": it.playUrl };
                        vodlists.push(arr);
                    }
                })
            }
        } catch (e) {
            error.vod = 1;
            log(api_name + '>获取列表异常>' + e.message + ' 错误行#' + e.lineNumber);
        }
    }

    return {
        fllists: fllists,
        vodlists: vodlists,
        error: error,
        coltype: coltype
    }
}
// 获取搜索数据
function getSsData(name, jkdata, page) {
    name = name.replace(/全集.*|国语.*|粤语.*/g, '');
    let api_name = jkdata.name || "";
    let api_type = jkdata.type || "";
    let api_url = jkdata.url || "";
    let api_ua = jkdata.ua || "MOBILE_UA";
    api_ua = api_ua == "MOBILE_UA" ? MOBILE_UA : api_ua == "PC_UA" ? PC_UA : api_ua;
    let headers = { 'User-Agent': api_ua };
    page = page || MY_PAGE;

    let vodhost, ssurl, detailurl, postdata, listnode, extdata;
    if (api_type == "v1") {
        let date = new Date();
        let mm = date.getMonth() + 1;
        let dd = date.getDate();
        let key = (mm < 10 ? "0" + mm : mm) + "" + (dd < 10 ? "0" + dd : dd);
        detailurl = api_url + '/detail?&key=' + key + '&vod_id=';
        ssurl = api_url + '?ac=videolist&limit=10&wd=' + name + '&key=' + key + '&page=' + page;
        listnode = "json.data.list";
    } else if (api_type == "app") {
        detailurl = api_url + 'video_detail?id=';
        ssurl = api_url + 'search?limit=10&text=' + name + '&pg=' + page;
        listnode = "json.list";
    } else if (api_type == "v2") {
        detailurl = api_url + 'video_detail?id=';
        ssurl = api_url + 'search?limit=10&text=' + name + '&pg=' + page;
        listnode = "json.data";
    } else if (api_type == "iptv") {
        detailurl = api_url + '?ac=detail&ids=';
        ssurl = api_url + '?ac=list&zm=' + name + '&wd=' + name + '&page=' + page;
        listnode = "json.data";
    } else if (api_type == "cms") {
        detailurl = api_url + '?ac=videolist&ids=';
        ssurl = api_url + '?ac=videolist&wd=' + name + '&pg=' + page;
        listnode = "json.list";
    } else if (/XPath|biubiu|XBPQ|XYQ/.test(api_type)) {
        extdata = extDataCache(jkdata)
        if ($.type(extdata) == 'object') {
            if (api_type == "XBPQ") {
                extdata["搜索url"] = extdata["搜索url"] || "/index.php/ajax/suggest?mid=1&wd={wd}&limit=500";
                ssurl = extdata["搜索url"].replace('{wd}', name).replace('{pg}', page);
                ssurl = /^http/.test(ssurl) ? ssurl : extdata["主页url"] + ssurl;
                vodhost = getHome(ssurl);
            } else if (api_type == "XPath") {
                ssurl = extdata["searchUrl"].replace('{wd}', name).replace('{pg}', page);
                ssurl = /^http/.test(ssurl) ? ssurl : extdata["homeUrl"] + ssurl;
                vodhost = getHome(ssurl);
            } else if (api_type == "XYQ") {
                if (extdata["搜索请求头参数"]) {
                    if (extdata["搜索请求头参数"].includes('#') || extdata["搜索请求头参数"].includes('$')) {
                        extdata["搜索请求头参数"].split('#').forEach(v => {
                            headers[v.split('$')[0]] = v.split('$')[1];
                        })
                    } else {
                        headers["User-Agent"] = extdata["搜索请求头参数"] || headers["User-Agent"];
                    }
                }
                headers["User-Agent"] = (headers["User-Agent"] == "电脑" || headers["User-Agent"] == "PC_UA") ? PC_UA : MOBILE_UA;
                ssurl = extdata["搜索链接"].replace('{wd}', name).replace('{pg}', page);
                if (extdata["POST请求数据"] != "") {
                    ssurl = ssurl.split(';')[0];
                    postdata = extdata["POST请求数据"].replace('{wd}', name).replace('{pg}', page);
                }
                vodhost = getHome(ssurl);
            }
        }
    } else if (api_type=="hipy_t3" || api_type=="hipy_t4") {
        if(api_type=="hipy_t3" && getItem('hipy_t3_enable')!="1"){
            log('hipy_t3请使用DrpyHiker小程序');
            return [];
        }
        detailurl = "";
        listnode = "json.list";
    } else {
        log('api类型错误');
        return [];
    }
    function getHtmlCode(ssurl, headers) {
        let html = request(ssurl, { headers: headers, timeout: timeout });
        try {
            if (html.indexOf('cf-wrapper') != -1) {
                html = fetchCodeByWebView(ssurl, { headers: headers, 'blockRules': ['.png', '.jpg'],checkJs: $.toString((name)=>{
                    if(document.body.innerHTML.includes(name)) {
                        return 1;
                    }
                },name) });
                //log(html);
            }else if (html.indexOf('检测中') != -1) {
                html = request(ssurl + '&btwaf' + html.match(/btwaf(.*?)\"/)[1], { headers: headers, timeout: timeout });
            } else if (/页面已拦截/.test(html)) {
                html = fetchCodeByWebView(ssurl, { headers: headers, 'blockRules': ['.png', '.jpg', '.gif', '.mp3', '.mp4'], timeout: timeout });
                html = pdfh(html, 'body&&pre&&Text');
            } else if (/系统安全验证/.test(html)) {
                log(api_name + '>' + ssurl + '>页面有验证码拦截');
                function ocr(codeurl, headers) {
                    headers = headers || {};
                    let img = convertBase64Image(codeurl, headers).replace('data:image/jpeg;base64,', '');
                    let code = request('https://api.xhofe.top/ocr/b64/text', { body: img, method: 'POST', headers: { "Content-Type": "text/html" } });
                    code = code.replace(/o/g, '0').replace(/u/g, '0').replace(/I/g, '1').replace(/l/g, '1').replace(/g/g, '9');
                    log('识别验证码：' + code);
                    return code;
                }
                let www = ssurl.split('/');
                let home = www[0] + '//' + www[2];
                let codeurl = home + (ssurl.indexOf('search-pg-1-wd-') > -1 ? '/inc/common/code.php?a=search' : '/index.php/verify/index.html?');
                let cook = fetchCookie(codeurl, { headers: headers });
                headers.Cookie = JSON.parse(cook || '[]').join(';');
                let vcode = ocr(codeurl, headers);
                fetch(home + (ssurl.indexOf('search-pg-1-wd-') > -1 ? '/inc/ajax.php?ac=code_check&type=search&code=' : html.match(/\/index.php.*?verify=/)[0]) + vcode, {
                    headers: headers,
                    method: ssurl.indexOf('search-pg-1-wd-') > -1 ? 'GET' : 'POST'
                })

                html = request(ssurl, { headers: headers, timeout: timeout });
            }
        } catch (e) { }
        return html;
    }

    let lists = [];
    let gethtml = "";
    try {
        if (/v1|app|iptv|v2|cms|hipy_/.test(api_type)) {
            let json;
            if(api_type=="hipy_t4"){
                json = JSON.parse(getHtml(jkdata.url+"&wd="+name+"&extend="+jkdata.ext+"&quick=false", headers));
            }else if(api_type=="hipy_t3"){
                let drpy = GM.defineModule("SrcJuDrpy", config.依赖.match(/http(s)?:\/\/.*\//)[0] + "SrcJyDrpy.js").get(jkdata);
                json = JSON.parse(drpy.search(name, 0, page));
                //noerji = drpy.getRule("二级")=="*"?1:0;
            }else{
                gethtml = getHtmlCode(ssurl, headers);
                if (/cms/.test(api_type)) {
                    if (gethtml && gethtml.indexOf(name) == -1) {
                        gethtml = getHtmlCode(ssurl.replace('videolist', 'list'), headers);
                    }
                    if (/<\?xml/.test(gethtml)) {
                        gethtml = gethtml.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g, '');
                        let xmllist = [];
                        let videos = pdfa(gethtml, 'list&&video');
                        for (let i in videos) {
                            let id = String(xpath(videos[i], `//video/id/text()`)).trim();
                            let name = String(xpath(videos[i], `//video/name/text()`)).trim();
                            let pic = String(xpath(videos[i], `//video/pic/text()`)).trim();
                            let note = String(xpath(videos[i], `//video/note/text()`)).trim();
                            let type = String(xpath(videos[i], `//video/type/text()`)).trim();
                            let year = String(xpath(videos[i], `//video/year/text()`)).trim();
                            let area = String(xpath(videos[i], `//video/area/text()`)).trim();
                            xmllist.push({ "vod_id": id, "vod_name": name, "vod_remarks": note, "vod_pic": pic, "vod_content": type+"\n"+area+" "+year })
                        }
                        json = { "list": xmllist };
                    } else {
                        json = JSON.parse(gethtml);
                    }
                } else if (!/{|}/.test(gethtml) && gethtml != "") {
                    let decfile = globalMap0.getVar('Jy_gmParams').datapath + "appdec.js";
                    let Juyingdec = fetch(decfile);
                    if (Juyingdec != "") {
                        eval(Juyingdec);
                        json = JSON.parse(xgdec(gethtml));
                    }
                } else {
                    json = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
                }
            }

            try {
                lists = eval(listnode) || json.list || json.data.list || json.data || [];
            } catch (e) {
                //lists = json.list || json.data.list || json.data || [];
            }

            if (lists.length == 0 && api_type == "iptv") {
                ssurl = ssurl.replace('&zm=' + name, '');
                json = JSON.parse(getHtmlCode(ssurl, headers));
                lists = json.data || [];
            }
            lists = lists.map(list => {
                let vodname = list.vod_name || list.title;
                let vodpic = list.vod_pic || list.pic || "";
                let voddesc = list.vod_remarks || list.state || "";
                let vodurl = list.vod_id ? detailurl + list.vod_id : list.nextlink;
                let vodcontent = list.vod_content || list.vod_blurb || list.type_name ||"";
                return {
                    name: vodname,
                    pic: vodpic,
                    desc: voddesc,
                    id: vodurl,
                    content: vodcontent
                }
            })
        } else {
            if (api_type == "XPath") {
                if (extdata.scVodNode == "json:list") {
                    gethtml = getHtmlCode(ssurl, headers);
                    let json = JSON.parse(gethtml);
                    lists = json.list || [];
                    lists.forEach(item => {
                        if (extdata.scVodId) {
                            item.id = item[extdata.scVodId];
                        }
                    })
                } else {
                    let sstype = ssurl.indexOf(';post') > -1 ? "post" : "get";
                    if (sstype == "post") {
                        let ssstr = ssurl.replace(';post', '').split('?');
                        postdata = ssstr[ssstr.length - 1];
                        if (ssstr.length > 2) {
                            ssstr.length = ssstr.length - 1;
                        }
                        ssurl = ssstr.join('?');
                        gethtml = request(ssurl, { headers: headers, timeout: timeout, method: 'POST', body: postdata });
                    } else {
                        gethtml = getHtmlCode(ssurl, headers);
                    }
                    let title = xpathArray(gethtml, extdata.scVodNode + extdata.scVodName);
                    let href = xpathArray(gethtml, extdata.scVodNode + extdata.scVodId);
                    let img = xpathArray(gethtml, extdata.scVodNode + extdata.scVodImg);
                    let mark = xpathArray(gethtml, extdata.scVodNode + extdata.scVodMark) || "";
                    for (let j in title) {
                        let id = /^http/.test(href[j]) || /\{vid}$/.test(extdata.dtUrl) ? href[j] : href[j].replace(/\/.*?\/|\.html/g, '');
                        lists.push({ "id": extdata.dtUrl.replace('{vid}', id), "name": title[j], "pic": img[j], "desc": mark[j] })
                    }
                }
            } else if(api_type == "biubiu"){
                ssurl = extdata.url + extdata.sousuoqian + name + extdata.sousuohou;
                if (extdata.ssmoshi == "0") {
                    gethtml = getHtmlCode(ssurl, headers);
                    let html = JSON.parse(gethtml);
                    lists = html.list || [];
                } else {
                    let sstype = ssurl.indexOf(';post') > -1 ? "post" : "get";
                    if (sstype == "post") {
                        /*
                        let ssstr = ssurl.replace(';post','').split('?');
                        var postcs = ssstr[ssstr.length-1];
                        if(ssstr.length>2){
                            ssstr.length = ssstr.length-1;
                        }
                        var gethtml = request(ssurl, { headers: headers, timeout:timeout, method: 'POST', body: postcs  });
                    */
                    } else {
                        gethtml = getHtmlCode(ssurl, headers);
                    }
                    let sslist = gethtml.split(extdata.jiequshuzuqian.replace(/\\/g, ""));
                    sslist.splice(0, 1);
                    for (let i = 0; i < sslist.length; i++) {
                        sslist[i] = sslist[i].split(extdata.jiequshuzuhou.replace(/\\/g, ""))[0];
                        let title = sslist[i].split(extdata.biaotiqian.replace(/\\/g, ""))[1].split(extdata.biaotihou.replace(/\\/g, ""))[0];
                        let href = extdata.url+extdata.sousuohouzhui+sslist[i].split(extdata.lianjieqian.replace(/\\/g, ""))[1].split(extdata.lianjiehou.replace(/\\/g, ""))[0].replace(extdata.sousuohouzhui.replace(/\\/g, ""), "");//.replace('.html','')
                        let img = sslist[i].split(extdata.tupianqian.replace(/\\/g, ""))[1].split(extdata.tupianhou.replace(/\\/g, ""))[0];
                        let mark = "";
                        lists.push({ "id": href, "name": title, "pic": img, "desc": mark })
                    }
                    if (extdata.sousuohouzhui == "/vod/") { extdata.sousuohouzhui = "/index.php/vod/detail/id/" }
                }
            }else if (api_type=="XBPQ"){
                if (extdata["搜索模式"] == "0" && extdata["搜索后缀"]) {
                    gethtml = getHtmlCode(ssurl, headers);
                    let html = JSON.parse(gethtml);
                    lists = html.list || [];
                    lists.forEach(it=>{
                        it.id = extdata["主页url"] + extdata["搜索后缀"] + it.id + '.html';
                    })
                } else {
                    let sstype = ssurl.indexOf(';post') > -1 ? "post" : "get";
                    if (sstype == "post") {
                        let postcs = ssurl.split(';')[2];
                        ssurl = ssurl.split(';')[0];
                        gethtml = request(ssurl, { headers: headers, timeout: timeout, method: 'POST', body: postcs });
                    } else {
                        gethtml = getHtmlCode(ssurl, headers);
                    }
                    if (extdata["搜索二次截取"]) {
                        gethtml = gethtml.split(extdata["搜索二次截取"].split('&&')[0])[1].split(extdata["搜索二次截取"].split('&&')[1])[0];
                    }
                    let sslist = gethtml.match(new RegExp((extdata["搜索数组"]||extdata["数组"]).replace('&&', '((?:.|[\r\n])*?)'), 'g')) || [];
                    for (let i = 0; i < sslist.length; i++) {
                        let title = getBetweenStr(sslist[i], (extdata["搜索标题"]||extdata["标题"]));//sslist[i].split(extdata["搜索标题"].split('&&')[0])[1].split(extdata["搜索标题"].split('&&')[1])[0];
                        let href = getBetweenStr(sslist[i], (extdata["搜索链接"]||extdata["链接"]).replace(`+\"id\":`, '').replace(`,+`, '.'));//sslist[i].split(extdata["搜索链接"].split('&&')[0])[1].split(extdata["搜索链接"].split('&&')[1])[0];
                        let img = getBetweenStr(sslist[i], (extdata["搜索图片"]||extdata["图片"]));//sslist[i].split(extdata["搜索图片"].split('&&')[0])[1].split(extdata["搜索图片"].split('&&')[1])[0];
                        let desc = getBetweenStr(sslist[i], (extdata["搜索副标题"]||extdata["副标题"]));//sslist[i].split(extdata["搜索副标题"].split('&&')[0])[1].split(extdata["搜索副标题"].split('&&')[1])[0];
                        lists.push({ "id": /^http/.test(href) ? href : vodhost + href, "name": title, "pic": img, "desc": desc })
                    }
                }
            }else if(api_type=="XYQ"){
                /*
                if (extdata["搜索后缀"]) {
                    gethtml = getHtmlCode(ssurl, headers);
                    let html = JSON.parse(gethtml);
                    lists = html.list || [];
                    lists.forEach(it=>{
                        it.id = extdata["主页url"] + extdata["搜索后缀"] + it.id + '.html';
                    })
                } else {*/
                    if (postdata) {
                        gethtml = request(ssurl, { headers: headers, timeout: timeout, method: 'POST', body: postdata });
                    } else {
                        gethtml = getHtmlCode(ssurl, headers);
                    }
                    let sslist = pdfa(gethtml, 	extdata["搜索列表数组规则"]);
                    let 图片规则 = extdata['分类片单图片'];
                    let 图片前缀 = "";
                    if(图片规则.includes('+')){
                        图片前缀 = 图片规则.split('+')[0].replace(/'|`|"/g, '');
                        图片规则 = 图片规则.split('+')[1];
                    }
                    for (let i = 0; i < sslist.length; i++) {
                        let title,href,img,desc;
                        if(extdata["搜索片单是否Jsoup写法"]=="1"||extdata["搜索片单是否Jsoup写法"]=="是"){
                            title = pdfh(sslist[i], extdata["搜索片单标题"]);
                            href = (extdata["搜索片单链接加前缀"]||"")+pdfh(sslist[i], extdata["搜索片单链接"])+(extdata["搜索片单链接加后缀"]||"");
                            img = 图片前缀 + pdfh(sslist[i], 图片规则);
                            desc = pdfh(sslist[i], extdata["搜索片单副标题"]);
                        }
                        if(href&&title){
                            lists.push({ "id": href, "name": title, "pic": img, "desc": desc });
                        }
                    }
                //}
            }
        }
    } catch (e) {
        log(jkdata.name + ' 搜索数据报错>' + e.message + " 错误行#" + e.lineNumber);
    }

    let searchs = [];
    if (lists.length > 0) {
        try {
            lists.forEach((list) => {
                let vodpic = list.pic ? list.pic.replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g, '') : getIcon("404.jpg");
                if(vodpic.startsWith("//")){
                    vodpic = "https:" + vodpic;
                }
                if(!/^http|^hiker/.test(vodpic) && list.id.startsWith('http')){
                    vodpic = getHome(list.id) + '/' + vodpic;
                }

                if (searchContains(list.name, name, true)) {
                    searchs.push({
                        vod_name: list.name.replace('立刻播放',''),
                        vod_desc: list.desc,
                        vod_content: list.content.replace(/<\/?.+?\/?>/g,''),
                        vod_pic: vodpic,
                        vod_url: list.id,
                        //vod_play: noerji?list.id:""
                    })
                }
            });
        } catch (e) {
            log(jkdata.name + ' 输出结果报错>' + e.message + " 错误行#" + e.lineNumber);
        }
    }
    return searchs;
}

// 获取二级数据
function getErData(jkdata) {
    let api_type = jkdata.type;
    let api_name = jkdata.name;
    let api_ua = jkdata.ua || "MOBILE_UA";
    api_ua = api_ua == "MOBILE_UA" ? MOBILE_UA : api_ua == "PC_UA" ? PC_UA : api_ua;
    let headers = { 'User-Agent': api_ua };

    let html, isxml, extdata, detailtype;
    if (/v1|app|v2|iptv|cms/.test(api_type)) {
        try {
            let gethtml = getHtml(MY_URL, headers);
            if (/cms/.test(api_type) && /<\?xml/.test(gethtml)) {
                html = gethtml;
                isxml = 1;
            } else {
                html = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ''));
                isxml = 0;
            }
        } catch (e) {
            log(e.message);
        }
    } else if (/XPath|biubiu|XBPQ|XYQ/.test(api_type)) {
        extdata = extDataCache(jkdata)
        if (api_type == "XYQ") {
            if (extdata["请求头参数"]) {
                if (extdata["请求头参数"].includes('#') || extdata["请求头参数"].includes('$')) {
                    extdata["请求头参数"].split('#').forEach(v => {
                        headers[v.split('$')[0]] = v.split('$')[1];
                    })
                } else {
                    headers["User-Agent"] = extdata["请求头参数"] || headers["User-Agent"];
                }
            }
            headers["User-Agent"] = (headers["User-Agent"] == "电脑" || headers["User-Agent"] == "PC_UA") ? PC_UA : MOBILE_UA;
        }
        html = getHtml(MY_URL, headers);
    } else if (api_type=="hipy_t3") {
        let drpy = GM.defineModule("SrcJuDrpy", config.依赖.match(/http(s)?:\/\/.*\//)[0] + "SrcJyDrpy.js").get(jkdata);
        try{
            html = drpy.detail(MY_URL);
        }catch(e){}
        detailtype = drpy.getRule('类型') || (jkdata.name.includes('[书]')?"小说":"");
    } else if (api_type=="hipy_t4") {
        html = getHtml(jkdata.url+"&extend="+jkdata.ext+"&ac=detail&ids="+MY_URL, headers);
        detailtype = JSON.parse(html).type || (jkdata.name.includes('[书]')?"小说":"");
    } else {
        html = getHtml(MY_URL, headers);
    }

    let pic = '';
    let details1 = '';
    let details2 = '';
    let desc = '...';

    let tabs = [];
    let lists = [];
    let flags = [];//线路标识
    let parse_api = [];//自带解析
    let sniffer = {};//嗅探词:contain包含，exclude排除

    if (html) {
        let arts = [];
        let conts = [];
        let actor, area, year, remarks, pubdate;
        if (/v1|app|v2|cms/.test(api_type)) {
            let json = {};
            if (/cms/.test(api_type)) {
                if (isxml == 1) {
                    html = html.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g, '');
                    arts = xpathArray(html, `//video/dl/dt/@name`);
                    if (arts.length == 0) {
                        arts = xpathArray(html, `//video/dl/dd/@flag`);
                    }
                    conts = xpathArray(html, `//video/dl/dd/text()`);
                    json.vod_actor = String(xpath(html, `//video/actor/text()`)).trim().replace(/&middot;/g, '·') || "";
                    json.vod_area = String(xpath(html, `//video/area/text()`)).trim();
                    json.vod_year = String(xpath(html, `//video/year/text()`)).trim();
                    json.vod_remarks = String(xpath(html, `//video/note/text()`)).trim() || "";
                    json.vod_pubdate = String(xpath(html, `//video/type/text()`)).trim() || "";
                    json.vod_pic = xpath(html, `//video/pic/text()`);
                    json.vod_blurb = String(xpath(html.replace('<p>', '').replace('</p>', ''), `//video/des/text()`));
                } else {
                    try {
                        json = html.list[0];
                    } catch (e) {
                        json = html.data.list[0];
                    }
                    if (json.vod_play_from && json.vod_play_url) {
                        arts = json.vod_play_from.split('$$$');
                        conts = json.vod_play_url.split('$$$');
                    } else if (html.from && html.play) {
                        arts = html.from;
                        for (let i = 0; i < html.play.length; i++) {
                            let cont = [];
                            let plays = html.play[i];
                            for (let j = 0; j < plays.length; j++) {
                                cont.push(plays[j][0] + "$" + plays[j][1])
                            }
                            conts.push(cont.join("#"));
                        }
                    }
                }
                tabs = arts.map(it => {
                    return it.replace(/[\r\ \n\t]/g, "");
                })
                lists = conts.map(it => {
                    let lines = it.split('#');
                    lines = lines.map((itit, i) => {
                        if (itit.indexOf('$') == -1) {
                            let ii = parseInt(i) + 1;
                            itit = ii + '$' + itit;
                        }
                        return itit;
                    })
                    return lines;
                })
            } else {
                if ($.type(html.data) == "array") {
                    json = html.data[0];
                } else {
                    json = html.data;
                }
                if (json && json.vod_info) {
                    json = json.vod_info;
                }
                arts = json.vod_play_list || json.vod_url_with_player || [];
                arts.forEach(it => {
                    let linename = it.name || it.player_info.show;
                    if (linename) {
                        tabs.push(linename);
                        let flag = it.code || it.player_info.from || "";
                        flags.push(flag);
                    }

                    try {
                        let parse1 = it.parse_api || it.player_info.parse || "";
                        let parse2 = it.extra_parse_api || it.player_info.parse2 || "";
                        if (parse1) {
                            parse_api.push(parse1.replace(/\.\./g, '.').replace(/。\./g, '.'));
                        }
                        if (parse2) {
                            parse_api.push(parse2.replace(/\.\./g, '.').replace(/。\./g, '.'));
                        }
                    } catch (e) { }
                })
                conts = json.vod_play_list || json.vod_url_with_player || [];
                conts.forEach(it => {
                    if (it.url) {
                        let single = it.url || "";
                        if (single) { lists.push(single.split('#')) };
                    } else {
                        let single = it.urls || [];
                        if (single.length > 0) {
                            let si = [];
                            for (let j = 0; j < single.length; j++) {
                                si.push(single[j].name + "$" + single[j].url);
                            }
                            lists.push(si);
                        };
                    }
                })
                if (arts.length == 0 && json.vod_play_from && json.vod_play_url) {
                    tabs = json.vod_play_from.split('$$$');
                    conts = json.vod_play_url.split('$$$');
                    lists = conts.map(it => {
                        let lines = it.split('#');
                        lines = lines.map((itit, i) => {
                            if (itit.indexOf('$') == -1) {
                                let ii = parseInt(i) + 1;
                                itit = ii + '$' + itit;
                            }
                            return itit;
                        })
                        return lines;
                    })
                    api_type = "cms";
                }
            }
            actor = json.vod_actor;
            area = json.vod_area;
            year = json.vod_year;
            remarks = json.vod_remarks || "";
            pubdate = json.vod_pubdate || json.vod_class || "";
            pic = json.vod_pic && json.vod_pic.indexOf('ver.txt') == -1 ? json.vod_pic : '';
            desc = json.vod_content || json.vod_blurb;
        } else if (/iptv/.test(api_type)) {
            actor = html.actor.join(",");
            area = html.area.join(",");
            year = html.pubtime;
            remarks = html.trunk || "";
            pubdate = html.type.join(",") || "";
            pic = html.img_url;
            desc = html.intro;
            tabs = html.videolist;
            conts = html.videolist;
            /*
            let single = conts[i]||[];
                if(single.length>0){
                    let si = [];
                    for (let j = 0; j < single.length; j++) {
                        si.push(single[j].title+"$"+single[j].url.split('=')[1]);
                        parse_api = single[j].url.split('=')[0]+"=";
                    }
                    lists.push(si);
                };
                */
        } else if (api_type == "XPath") {
            try {
                actor = String(xpathArray(html, extdata.dtActor).join(',')).replace(/[\r\ \n]/g, "");
                area = String(xpath(html, extdata.dtArea)).replace(/[\r\ \n]/g, "");
                year = String(xpath(html, extdata.dtYear)).replace(/[\r\ \n]/g, "");
                remarks = String(xpathArray(html, extdata.dtCate).join(',')).replace(/[\r\ \n]/g, "");
                pubdate = String(xpathArray(html, extdata.dtMark).join(',')).replace(/[\r\ \n]/g, "");
                desc = String(xpath(html, extdata.dtDesc));
                pic = String(xpath(html, extdata.dtImg)).replace(/[\r\ \n]/g, "");
            } catch (e) {
                log('xpath获取海报信息失败>' + e.message + " 错误行#" + e.lineNumber);
            }
            try {
                tabs = xpathArray(html, extdata.dtFromNode + (extdata.dtFromName.indexOf('concat(') > -1 ? '/text()' : extdata.dtFromName));
            } catch (e) {
                log('xpath获取线路失败>' + e.message);
            }
            try {
                for (let i = 1; i < tabs.length + 1; i++) {
                    let contname = xpathArray(html, extdata.dtUrlNode + '[' + i + ']' + extdata.dtUrlSubNode + extdata.dtUrlName);
                    let conturl = xpathArray(html, extdata.dtUrlNode + '[' + i + ']' + extdata.dtUrlSubNode + (extdata.dtUrlId == "@href" ? '/' + extdata.dtUrlId : extdata.dtUrlId));
                    let cont = [];
                    for (let j = 0; j < contname.length; j++) {
                        let playUrl;
                        if (extdata.dtUrlIdR) {
                            playUrl = conturl[j].match(extdata.dtUrlIdR)[1];
                        } else {
                            playUrl = conturl[j];
                        }
                        cont.push(contname[j] + "$" + extdata.playUrl.replace('{playUrl}', playUrl))
                    }
                    lists.push(cont);
                }
            } catch (e) {
                log('xpath获取选集列表失败>' + e.message);
            }
        } else if (api_type == "biubiu") {
            let getsm = "";
            try {
                getsm = "获取播放地址数组bfjiequshuzuqian";
                let bflist = html.split(extdata.bfjiequshuzuqian.replace(/\\/g, ""));
                bflist.splice(0, 1);
                for (let i = 0; i < bflist.length; i++) {
                    tabs.push('播放源' + (i + 1));
                    bflist[i] = bflist[i].split(extdata.bfjiequshuzuhou.replace(/\\/g, ""))[0];
                    let bfline = pdfa(bflist[i], "body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = pdfh(bfline[j], "a&&Text");
                        let conturl = pd(bfline[j], "a&&href");
                        cont.push(contname + "$" + conturl)
                    }
                    lists.push(cont);
                }
                getsm = "获取备注zhuangtaiqian";
                remarks = pdfh(html.split(extdata.zhuangtaiqian.replace(/\\/g, ""))[1].split(extdata.zhuangtaihou.replace(/\\/g, ""))[0], "Text").split('/')[0] || "biubiu数据存在错误";
                getsm = "获取主演zhuyanqian";
                actor = pdfh(html.split(extdata.zhuyanqian.replace(/\\/g, ""))[1].split(extdata.zhuyanhou.replace(/\\/g, ""))[0], "Text");
                getsm = "获取更新zhuangtaiqian";
                pubdate = pdfh(html.split(extdata.zhuangtaiqian.replace(/\\/g, ""))[1].split(extdata.zhuangtaihou.replace(/\\/g, ""))[0], "Text").split('/')[1] || "";
                getsm = "获取剧情简介juqingqian";
                desc = pdfh(html.split(extdata.juqingqian.replace(/\\/g, ""))[1].split(extdata.juqinghou.replace(/\\/g, ""))[0], "Text");
            } catch (e) {
                log(getsm + '失败>' + e.message + " 错误行#" + e.lineNumber)
            }
        } else if (api_type == "XBPQ") {
            try {
                let arthtml = html;
                if (extdata["线路二次截取"]) {
                    arthtml = arthtml.split(extdata["线路二次截取"].split('&&')[0])[1].split(extdata["线路二次截取"].split('&&')[1])[0];
                }
                extdata["线路数组"] = extdata["线路数组"].split('[')[0];
                let artlist = arthtml.match(new RegExp(extdata["线路数组"].replace('&&', '((?:.|[\r\n])*?)'), 'g')) || [];
                extdata["线路标题"] = extdata["线路标题"].split('+')[0];
                for (let i = 0; i < artlist.length; i++) {
                    let arttitle = artlist[i].split(extdata["线路数组"].split('&&')[0])[1].split(extdata["线路数组"].split('&&')[1])[0].split(extdata["线路标题"].split('&&')[0])[1].split(extdata["线路标题"].split('&&')[1])[0];
                    tabs.push(arttitle.replace(/<\/?.+?\/?>/g, ''));
                }

                let conthtml = html;
                if (extdata["播放二次截取"]) {
                    conthtml = conthtml.split(extdata["播放二次截取"].split('&&')[0])[1].split(extdata["播放二次截取"].split('&&')[1])[0];
                }
                let contlist = conthtml.match(new RegExp(extdata["播放数组"].replace('&&', '((?:.|[\r\n])*?)'), 'g')) || [];
                for (let i = 0; i < contlist.length; i++) {
                    let bfline = extdata["播放列表"] ? (contlist[i].match(new RegExp(extdata["播放列表"].replace('&&', '((?:.|[\r\n])*?)'), 'g')) || []) : pdfa(contlist[i], "body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = extdata["播放标题"] ? bfline[j].split(extdata["播放标题"].split('&&')[0])[1].split(extdata["播放标题"].split('&&')[1])[0] : pdfh(bfline[j], "a&&Text");
                        let conturl = extdata["播放链接"] ? bfline[j].split(extdata["播放链接"].split('&&')[0])[1].split(extdata["播放链接"].split('&&')[1])[0] : pd(bfline[j], "a&&href");
                        if(!conturl.startsWith('http')){
                            conturl = extdata["主页url"] + conturl;
                        }
                        cont.push(contname + "$" + conturl)
                    }
                    lists.push(cont);
                }

                actor = getBetweenStr(html, extdata["主演"]);
                remarks = getBetweenStr(html, extdata["影片状态"]);
                pubdate = getBetweenStr(html, extdata["影片类型"]);
                year = getBetweenStr(html, extdata["影片年代"]);
                area = getBetweenStr(html, extdata["影片地区"]);
                extdata["简介"] = extdata["简介"] && extdata["简介"].includes('+') ? extdata["简介"].split('+')[0] : extdata["简介"];
                desc = getBetweenStr(html, extdata["简介"]);
                if(extdata["嗅探词"]){
                    sniffer["contain"] = extdata["嗅探词"].split('#');
                }
                if(extdata["过滤词"]){
                    sniffer["exclude"] = extdata["过滤词"].split('#');
                }
            } catch (e) {
                log('失败>' + e.message + " 错误行#" + e.lineNumber)
            }
        } else if (api_type == "XYQ") {
            try {
                if (extdata["详情是否Jsoup写法"]=="1"||extdata["详情是否Jsoup写法"]=="是") {
                    remarks = pdfh(html, extdata["类型详情"]);
                    year = pdfh(html, extdata["年代详情"]);
                    area = pdfh(html, extdata["地区详情"]);
                    actor = pdfh(html, extdata["演员详情"]);
                    desc = pdfh(html, extdata["简介详情"]);
                } else {
                    remarks = getBetweenStr(html, extdata["类型详情"]);
                    year = getBetweenStr(html, extdata["年代详情"]);
                    area = getBetweenStr(html, extdata["地区详情"]);
                    actor = getBetweenStr(html, extdata["演员详情"]);
                    desc = getBetweenStr(html, extdata["简介详情"]);
                }
            } catch (e) {
                log('xpath获取海报信息失败>' + e.message + " 错误行#" + e.lineNumber);
            }
            try {
                if (extdata["线路列表数组规则"]) {
                    pdfa(html, extdata["线路列表数组规则"]).forEach(it => {
                        let linename = "";
                        extdata["线路标题"].split('+').forEach(v => {
                            let n;
                            if (v == "_") {
                                n = v;
                            } else {
                                n = pdfh(it, v);
                            }
                            linename = linename.concat(n);
                        })
                        tabs.push(linename);
                    })
                } else {
                    tabs = ["线路1"];
                }
            } catch (e) {
                log('XYQ获取线路失败>' + e.message);
            }
            try {
                let contlist = pdfa(html, extdata["播放列表数组规则"]);
                for (let i = 0; i < contlist.length; i++) {
                    let bfline = pdfa(contlist[i], "body&&"+extdata["选集列表数组规则"]);
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname, conturl;
                        if (extdata["选集标题链接是否Jsoup写法"]=="1"||extdata["选集标题链接是否Jsoup写法"]=="是") {
                            contname = pdfh(bfline[j], extdata["选集标题"] || "a&&Text");
                            conturl = (extdata["选集链接加前缀"] || "") + pdfh(bfline[j], extdata["选集链接"] || "a&&href") + (extdata["选集链接加后缀"] || "");
                        }
                        cont.push(contname + "$" + conturl)
                    }
                    if (extdata["是否反转选集序列"] == "1") {
                        cont.reverse();
                    }
                    lists.push(cont);
                }
                if(extdata["手动嗅探视频链接关键词"]){
                    sniffer["contain"] = extdata["手动嗅探视频链接关键词"].split('#');
                }
                if(extdata["手动嗅探视频链接过滤词"]){
                    sniffer["exclude"] = extdata["手动嗅探视频链接过滤词"].split('#');
                }
            } catch (e) {
                log('XYQ获取选集列表失败>' + e.message);
            }
        } else if (api_type == 'hipy_t3' || api_type == 'hipy_t4') {
            try{
                let json = JSON.parse(html).list[0];
                actor = json.vod_actor;
                area = json.vod_area;
                remarks = json.vod_remarks || json.vod_class || "";
                desc = json.vod_content || "";
                pic = json.vod_pic;
                tabs = json.vod_play_from.split('$$$');
                lists = json.vod_play_url.split('$$$').map(it => {
                    return it.split('#');
                });
            }catch(e){}
        }

        if (/XPath|biubiu|XBPQ|XYQ/.test(api_type) && html && (tabs.length == 0 || lists.length == 0) && getMyVar('debug', '0') == "0" && html.indexOf(MY_PARAMS.pageTitle) > -1) {
            log('开启模板自动匹配、AI识片，获取播放选集');
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcAutoTmpl.js');
            let data = autoerji(MY_URL, html);
            details1 = data.details1
            details2 = data.details2;
            pic = data.pic || pic;
            desc = data.desc || desc;
            tabs = data.tabs;
            lists = data.lists;
        }
        actor = actor ? actor.includes('主演') ? actor.replace(/\n+/g, '') : '主演：' + actor.replace(/\n+/g, '') : '';
        let dqnf = "";
        if (area) {
            dqnf = '\n地区：' + area.replace(/\n+/g, '') + (year ? '   年代：' + year.replace(/\n+/g, '') : '')
        } else {
            dqnf = year ? '\n年代：' + year.replace(/\n+/g, '') : ''
        }
        remarks = remarks || "";
        pubdate = pubdate || "";
        details1 = details1 ? details1 : actor.substring(0, actor.length < 10 || dqnf == "" ? actor.length : 10) + dqnf;
        details2 = details2 ? details2 : remarks.replace(/\n+/g, '') + '\n' + pubdate.replace(/\n+/g, '');
        details1 = details1.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&middot;/g, '·').replace(/&hellip;/g, '…').replace(/&nbsp;|♥/g, ' ');
        details2 = details2.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&middot;/g, '·').replace(/&hellip;/g, '…').replace(/&nbsp;|♥/g, ' ');
        desc = desc || '...';
        desc = desc.replace(/&ldquo;/g, '“').replace(/&rdquo;/g, '”').replace(/&middot;/g, '·').replace(/&hellip;/g, '…').replace(/&nbsp;|♥/g, ' ');
    }

    return {
        "details1": details1,
        "details2": details2,
        "pic": pic&&pic.includes('Logo.')?"":pic,
        "desc": desc,
        "tabs": tabs,
        "lists": lists,
        "flags": flags,
        "parse_api": parse_api,
        "sniffer": sniffer,
        "detailtype": detailtype
    };
}
// 设置收藏更新最新章节
function setLastChapter(url,jkdata) {
    MY_URL = url;
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyPublic.js');
    let erdate = getErData(jkdata);
    let lists = erdate.lists;
    if(lists.length>0){
        //取线路选集最多的索引
        let indexOfMax = 0;
        let tempMax = lists[0].length;
        for(let i = 0; i < lists.length; i ++){
            if(lists[i].length > tempMax){
                tempMax = lists[i].length;
                indexOfMax = i;
            }
        }
        let list = lists[indexOfMax];
        try{
            let list1 = list[0].split('$')[0];
            let list2 = list[list.length-1].split('$')[0];
            if(parseInt(list1.match(/(\d+)/)[0])>parseInt(list2.match(/(\d+)/)[0])){
                list.reverse();
            }
        }catch(e){
        }
        setResult(jkdata.name + ' | ' + list[list.length-1].split('$')[0]);
    }
}
// 获取网页源码
function getHtml(url, headers) {
    headers = headers || {};
    let html = request(url, { headers: headers, withStatusCode: true });
    try {
        let json = JSON.parse(html);
        if (json.statusCode == 200) {
            return json.body;
        }

    } catch (e) { }
    return '';
}

// extData缓存
function extDataCache(jkdata) {
    if (jkdata.url.startsWith("file") || jkdata.url.startsWith("hiker")) {
        if (!fileExist(jkdata.url)) {
            //log("数据文件不存在?");
            if(!fileExist(jkfile)){
                jkdata.url = jkdata.url.replace('/data/','/_cache/');
            }
            jkdata.url = jkdata.url.replace('/聚影✓/','/聚影/');
            if ($.type(jkdata.ext)=='string' && /^http|^file/.test(jkdata.ext)) {
                let content = getContnet(jkdata.ext);
                if (content) {
                    writeFile(jkdata.url, content);
                }
            } else if ($.type(jkdata.ext) == 'object') {
                writeFile(jkdata.url, JSON.stringify(jkdata.ext));
            }
        }
        if (fileExist(jkdata.url)) {
            eval("let extdata = " + fetch(jkdata.url));
            return extdata;
        } else {
            toast('数据文件获取失败');
            return '';
        }
    }
    toast('此源接口数据文件有异常');
    return '';
}
//截取中间字符
function getBetweenStr(str, key) {
    if (!str || !key) {
        return '';
    }
    const prefix = key.split('&&')[0];
    const suffix = key.split('&&')[1];
    const regex = new RegExp(prefix + '(.*?)' + suffix, 's'); // 's' 使 . 匹配换行符
    const match = str.match(regex);
    return match ? match[1].replace(/<\/?.+?\/?>/g, '') : '';
}
//归整转为json对象
function dealJson(html) {
    try {
        html = html.trim();
        if (!((html.startsWith('{') && html.endsWith('}')) || (html.startsWith('[') && html.endsWith(']')))) {
            html = '{' + html.match(/.*?\{(.*)\}/m)[1] + '}';
        }
    } catch (e) { }
    try {
        html = JSON.parse(html);
    } catch (e) {
        log("dealJson转换为对象失败>"+e.message);
    }
    return html;
}
//获取对象指定路径值
function getJsonValue(obj, path) {
    const parts = path.split('.');
    let current = obj;
    for (let part of parts) {
        if (current[part]) {
            current = current[part];
        } else {
            return undefined;
        }
    }
    return current;
}
function encodeUrl(str) {
    if (typeof (encodeURI) == 'function') {
        return encodeURI(str)
    } else {
        str = (str + '').toString();
        return encodeURIComponent(str).replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3A/g, ':').replace(/%40/g, '@').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%2B/g, '+').replace(/%24/g, '$');
    }
}
//正则获取{}中间的所有值返回数组
function getExecStrs(str) {
    var reg = /\{(.+?)\}/g
    var list = []
    var result = null
    do {
        result = reg.exec(str)
        result && list.push(result[1])
    } while (result)
    return list
}