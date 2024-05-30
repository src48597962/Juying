// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明

// extData缓存
function extDataCache(jkdata) {
    if($.type(jkdata.ext)=='object'){
        return jkdata.ext;
    }else if(/^hiker/.test(jkdata.url)){
        if (jkdata.ext && /^http/.test(jkdata.ext)) {
            if(!fileExist(jkdata.url)){
                let content = fetch(jkdata.ext, {timeout:3000});
                if (content) {
                    writeFile(jkdata.url, content);
                }
            }
        }
        if(fileExist(jkdata.url)){
            eval("let extdata = " + fetch(jkdata.url));
            return extdata;
        }else{
            toast('数据文件获取失败');
            return '';
        }
    }
    toast('此源接口数据有异常');
    return '';
}
//截取中间字符
function getBetweenStr(str, key) {
    if(!str || !key){
        return '';
    }
    const prefix = key.split('&&')[0];
    const suffix = key.split('&&')[1];
    const regex = new RegExp(prefix + '(.*?)' + suffix, 's'); // 's' 使 . 匹配换行符
    const match = str.match(regex);
    return match ? match[1].replace(/<\/?.+?\/?>/g,'') : '';
}
// 获取一级数据
function getYiData(jkdata) {
    let d = [];
    let api_name = jkdata.name||"";
    let api_type = jkdata.type||"";
    let api_url = jkdata.url||"";
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;
    let headers = { 'User-Agent': api_ua };
    
    let vodurlhead,classurl,listurl,listnode,extdata;
    if(api_name&&api_type&&api_url){
        if (api_type=="v1") {
            let date = new Date();
            let mm = date.getMonth()+1;
            let dd = date.getDate();
            let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
            vodurlhead = api_url + '/detail?&key='+key+'&vod_id=';
            classurl = api_url + "/types";
            listurl = api_url + '?key='+key+'&page=';
            listnode = "html.data.list";
        } else if (api_type=="app") {
            vodurlhead = api_url + 'video_detail?id=';
            classurl = api_url + "nav";
            listurl = api_url + 'video?tid=@type_id&pg=';
            listnode = "html.list";
        } else if (api_type=="v2") {
            vodurlhead = api_url + 'video_detail?id=';
            classurl = api_url + "nav";
            listurl = api_url + 'video?tid=@type_id&pg=';
            listnode = "html.data";
        } else if (api_type=="iptv") {
            vodurlhead = api_url + '?ac=detail&ids=';
            classurl = api_url + "?ac=flitter";
            listurl = api_url + '?ac=list&page=';
            listnode = "html.data";
        } else if (api_type=="cms") {
            vodurlhead = api_url + '?ac=videolist&ids=';
            classurl = api_url + "?ac=list";
            listurl = api_url + '?ac=videolist&pg=';
            listnode = "html.list";
        } else if (api_type=="XBPQ") {
            extdata = extDataCache(jkdata)
            if($.type(extdata)=='object'){
                let host = extdata["主页url"] || '';
                classurl = extdata["分类"];
                extdata["分类url"] = extdata["分类url"]?extdata["分类url"].split(';;')[0].split('[')[0]:"";
                listurl = extdata["分类url"]?/^http/.test(extdata["分类url"])?extdata["分类url"]:host + extdata["分类url"]:"";
                vodurlhead = getHome(listurl);
            }
        } else if (api_type=="drpy") {
            eval(fetch(drpymuban).replace('export default {muban, getMubans};',''));
            eval(fetch(jkdata.url));
            if(rule['模板']){
                extdata = Object.assign(muban[rule['模板']], rule);
            }else{
                extdata = rule;
            }
            if(extdata){
                let host = extdata["host"] || '';
                classurl = host;
                listurl = classurl + extdata["url"];
                vodurlhead = getHome(listurl);
            }
        } else {
            log('api类型错误')
        }
    }
    let lists = []; //影片列表
    let fold = getMyVar('SrcJu_dianbo$fold', "0");//是否展开小分类筛选
    let cate_id = '';
    let type_id = '';
    let class_id = '';
    let area_id = '';
    let year_id = '';
    let sort_id = '';

    if(MY_PAGE==1){
        if(classurl){
            let 推荐 = [];
            let 分类 = [];
            let 类型 = [];
            let 剧情 = [];
            let 地区 = [];
            let 年份 = [];
            let 排序 = [];
            let 筛选 = 0;
            
            const Color = "#3399cc";
            let classCache = storage0.getMyVar('SrcJu_dianbo$classCache');
            if(classCache){
                推荐 = classCache.推荐;
                分类 = classCache.分类;
                类型 = classCache.类型;
                剧情 = classCache.剧情;
                地区 = classCache.地区;
                年份 = classCache.年份;
                排序 = classCache.排序;
                筛选 = classCache.筛选;
            }else{
                try{
                    if(api_type=="drpy"){
                        if(extdata["class_name"] && extdata["class_url"]){
                            let cnames = extdata["class_name"].split('&');
                            let curls = extdata["class_url"].split('&');
                            分类 = cnames.map((it,i) => {
                                return it+'$'+curls[i];
                            });
                        }else if(extdata["class_parse"]){
                            let cparses = extdata["class_parse"].split(';');
                            let cate_exclude = [];
                            if(extdata["cate_exclude"]){
                                cate_exclude = extdata["cate_exclude"].split('|');
                            }
                            headers = extdata["headers"] || headers;
                            if(headers['User-Agent']){
                                headers['User-Agent'] = headers['User-Agent']=='PC_UA'?PC_UA:MOBILE_UA;
                            }
                            let chtml = request(extdata["host"], {headers:headers, timeout:5000});
                            let fls = _pdfa(chtml, cparses[0]);
                            fls.forEach(it=>{
                                try{
                                    let typename = _pdfh(it, cparses[1]);
                                    let typeurl = _pdfh(it, cparses[2]);
                                    if(cparses.length==4 && cparses[3]){
                                        typeurl = typeurl.match(cparses[3])[1];
                                    }
                                    if(cate_exclude.indexOf(typename)==-1){
                                        分类.push(typename+'$'+typeurl);
                                    }
                                }catch(e){
                                    //log(e.message);
                                }
                            }) 
                        }
                        let ss = extdata["filter"];
                        if(ss){
                            分类.forEach(it=>{
                                let id = it.split('$')[1];
                                let sss = ss[id] || [];
                                sss.forEach(itit=>{
                                    let itvalue = itit.value;
                                    let values = [];
                                    itvalue.forEach(value=>{
                                        values.push(value.n+'$'+value.v)
                                    })
                                    if(itit.key=='cateId' || itit.key=='类型'){
                                        类型.push(values.join('#'));
                                    }else if(itit.key=='class' || itit.key=='剧情'){
                                        剧情.push(values.join('#'));
                                    }else if(itit.key=='area' || itit.key=='地区'){
                                        地区.push(values.join('#'));
                                    }else if(itit.key=='year' || itit.key=='年份'){
                                        年份.push(values.join('#'));
                                    }else if(itit.key=='by' || itit.key=='排序'){
                                        排序.push(values.join('#'));
                                    }
                                })
                            })
                            筛选 = 1;
                        }
                    }else if(api_type=="XBPQ"){
                        if(extdata["分类"].indexOf('$')>-1){
                            分类 = extdata["分类"].split('#');
                            let ss = extdata["筛选"];
                            if(ss){
                                分类.forEach(it=>{
                                    let id = it.split('$')[1];
                                    let sss = ss[id] || [];
                                    sss.forEach(itit=>{
                                        let itvalue = itit.value;
                                        let values = [];
                                        itvalue.forEach(value=>{
                                            values.push(value.n+'$'+value.v)
                                        })
                                        if(itit.key=='cateId' || itit.key=='class'){
                                            类型.push(values.join('#'));
                                        }else if(itit.key=='area'){
                                            地区.push(values.join('#'));
                                        }else if(itit.key=='year'){
                                            年份.push(values.join('#'));
                                        }else if(itit.key=='by'){
                                            排序.push(values.join('#'));
                                        }
                                    })
                                })
                                筛选 = 1;
                            }
                        }else if(extdata["分类"].indexOf('&')>-1&&extdata["分类值"]){
                            let typenames = extdata["分类"].split('&');
                            let typeids = extdata["分类值"].split('&');
                            for(let i in typeids){
                                分类.push(typenames[i]+'$'+typeids[i]);
                            }
                        }
                    }else{
                        let gethtml = request(classurl, { headers: { 'User-Agent': api_ua }, timeout:5000 });
                        if (api_type=="v1") {
                            let typehtml = JSON.parse(gethtml);
                            let typelist = typehtml.data.list||typehtml.data.typelist;
                            typelist.map((it)=>{
                                分类.push(it.type_name+'$'+it.type_id);
                            })
                        } else if (/app|v2/.test(api_type)) {
                            let typehtml = JSON.parse(gethtml);
                            let typelist = typehtml.list||typehtml.data;
                            typelist.forEach(it=>{
                                分类.push(it.type_name+'$'+it.type_id);
                            })
                        } else if (api_type=="iptv") {
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
                            typelist.forEach((it)=>{
                                if(type_dict[it]){
                                    分类.push(type_dict[it]+'$'+it);
                                }
                            })
                        } else if (api_type=="cms") {
                            if(/<\?xml/.test(gethtml)){
                                let typelist = pdfa(gethtml,'class&&ty');
                                typelist.forEach((it)=>{
                                    分类.push(String(xpath(it,`//ty/text()`)).trim()+'$'+String(xpath(it,`//ty/@id`)).trim());
                                })
                            }else{
                                let typehtml = JSON.parse(gethtml);
                                let typelist = typehtml.class;
                                if(jkdata.categories){
                                    for(var i=0;i<typelist.length;i++){
                                        if(jkdata.categories.indexOf(typelist[i].type_name)==-1 && typelist[i].type_pid !=0){
                                            typelist.splice(i,1);
                                            i = i -1;
                                        }
                                    }
                                }
                                typelist.forEach((it)=>{
                                    if(it.type_pid==0){
                                        分类.push(it.type_name+'$'+it.type_id);
                                        let values = [];
                                        typelist.forEach((itit)=>{
                                            if(itit.type_pid==it.type_id){
                                                values.push(itit.type_name+'$'+itit.type_id);
                                            }
                                        })
                                        类型.push(values.join('#'));
                                    }
                                })
                            }
                        }else {
                            log('api类型错误')
                        }
                    }
                }catch(e){
                    d.push({
                        title: '获取分类数据失败！',
                        desc: '看一下日志具体信息',
                        url: classurl + '#noHistory#',
                        col_type: 'text_center_1'
                    }); 
                    log(api_name+'>获取分类数据异常>'+e.message + " 错误行#" + e.lineNumber);
                }
                if(分类.length>0){
                    storage0.putMyVar('SrcJu_dianbo$classCache', {分类:分类,类型:类型,剧情:剧情,地区:地区,年份:年份,排序:排序,筛选:筛选,推荐:推荐});
                }
            }

            if(分类.length>0){
                try{
                    if(筛选){
                        d.push({
                            title: fold === '1' ? '““””<b><span style="color: #F54343">∨</span></b>' : '““””<b><span style="color:' + Color + '">∧</span></b>',
                            url: $('#noLoading#').lazyRule((fold) => {
                                putMyVar('SrcJu_dianbo$fold', fold === '1' ? '0' : '1');
                                clearMyVar('SrcJu_dianbo$类型');
                                clearMyVar('SrcJu_dianbo$剧情');
                                clearMyVar('SrcJu_dianbo$地区');
                                clearMyVar('SrcJu_dianbo$年份');
                                clearMyVar('SrcJu_dianbo$排序');
                                refreshPage(false);
                                return "hiker://empty";
                            }, fold),
                            col_type: 'scroll_button',
                        })
                    }

                    cate_id = getMyVar('SrcJu_dianbo$分类', 推荐.length>0?'tj':分类[0].split('$')[1]);
                    putMyVar('SrcJu_dianbo$分类', cate_id);
                    if(推荐.length>0){
                        if(cate_id == 'tj'){
                            lists = 推荐;//当前分类为推荐，取推荐列表
                        }
                        d.push({
                            title: cate_id=='tj'?'““””<b><span style="color:' + Color + '">' + '推荐' + '</span></b>':'推荐',
                            url: $('#noLoading#').lazyRule(() => {
                                putMyVar('SrcJu_dianbo$分类', 'tj');
                                refreshPage(true);
                                return "hiker://empty";
                            }),
                            col_type: 'scroll_button'
                        });
                    }

                    let index = 0; //分类数组索引
                    分类.forEach((it,i)=>{
                        let itname = it.split('$')[0];
                        let itid = it.split('$')[1];
                        if(cate_id==itid){
                            index = i;
                        }
                        d.push({
                            title: cate_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                            url: $('#noLoading#').lazyRule((itid) => {
                                putMyVar('SrcJu_dianbo$分类', itid);
                                clearMyVar('SrcJu_dianbo$类型');
                                clearMyVar('SrcJu_dianbo$剧情');
                                clearMyVar('SrcJu_dianbo$地区');
                                clearMyVar('SrcJu_dianbo$年份');
                                clearMyVar('SrcJu_dianbo$排序');
                                refreshPage(true);
                                return "hiker://empty";
                            }, itid),
                            col_type: 'scroll_button'
                        });
                    })
                    d.push({
                        col_type: "blank_block"
                    });
                    
                    if(筛选 && (fold=='1' || api_type=='cms')){
                        if(类型.length>0 && 类型[index]){
                            type_id = getMyVar('SrcJu_dianbo$类型', 类型[index].split('#')[0].split('$')[1]);
                            类型[index].split('#').forEach(it=>{
                                let itname = it.split('$')[0];
                                let itid = it.split('$')[1];
                                d.push({
                                    title: type_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                                    url: $('#noLoading#').lazyRule((itid) => {
                                        putMyVar('SrcJu_dianbo$类型', itid);
                                        refreshPage(true);
                                        return "hiker://empty";
                                    }, itid),
                                    col_type: 'scroll_button'
                                });
                            })
                            d.push({
                                col_type: "blank_block"
                            });
                        }
                        if(剧情.length>0 && 剧情[index]){
                            class_id = getMyVar('SrcJu_dianbo$剧情', 剧情[index].split('#')[0].split('$')[1]);
                            剧情[index].split('#').forEach(it=>{
                                let itname = it.split('$')[0];
                                let itid = it.split('$')[1];
                                d.push({
                                    title: class_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                                    url: $('#noLoading#').lazyRule((itid) => {
                                        putMyVar('SrcJu_dianbo$剧情', itid);
                                        refreshPage(true);
                                        return "hiker://empty";
                                    }, itid),
                                    col_type: 'scroll_button'
                                });
                            })
                            d.push({
                                col_type: "blank_block"
                            });
                        }
                        if(地区.length>0 && 地区[index]){
                            area_id = getMyVar('SrcJu_dianbo$地区', 地区[index].split('#')[0].split('$')[1]);
                            地区[index].split('#').forEach(it=>{
                                let itname = it.split('$')[0];
                                let itid = it.split('$')[1];
                                d.push({
                                    title: area_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                                    url: $('#noLoading#').lazyRule((itid) => {
                                        putMyVar('SrcJu_dianbo$地区', itid);
                                        refreshPage(true);
                                        return "hiker://empty";
                                    }, itid),
                                    col_type: 'scroll_button'
                                });
                            })
                            d.push({
                                col_type: "blank_block"
                            });
                        }
                        if(年份.length>0 && 年份[index]){
                            year_id = getMyVar('SrcJu_dianbo$年份', 年份[index].split('#')[0].split('$')[1]);
                            年份[index].split('#').forEach(it=>{
                                let itname = it.split('$')[0];
                                let itid = it.split('$')[1];
                                d.push({
                                    title: year_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                                    url: $('#noLoading#').lazyRule((itid) => {
                                        putMyVar('SrcJu_dianbo$年份', itid);
                                        refreshPage(true);
                                        return "hiker://empty";
                                    }, itid),
                                    col_type: 'scroll_button'
                                });
                            })
                            d.push({
                                col_type: "blank_block"
                            });
                        }
                        if(排序.length>0 && 排序[index]){
                            sort_id = getMyVar('SrcJu_dianbo$排序', 排序[index].split('#')[0].split('$')[1]);
                            排序[index].split('#').forEach(it=>{
                                let itname = it.split('$')[0];
                                let itid = it.split('$')[1];
                                d.push({
                                    title: sort_id==itid?'““””<b><span style="color:' + Color + '">' + itname + '</span></b>':itname,
                                    url: $('#noLoading#').lazyRule((itid) => {
                                        putMyVar('SrcJu_dianbo$排序', itid);
                                        refreshPage(true);
                                        return "hiker://empty";
                                    }, itid),
                                    col_type: 'scroll_button'
                                });
                            })
                            d.push({
                                col_type: "blank_block"
                            });
                        }
                    }
                    let searchurl = $('').lazyRule((jkdata) => {
                        if(jkdata){
                            /*
                            return $('hiker://empty#noRecordHistory##noHistory#').rule((name,data) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
                                let ssdata = getSsData(name,data);
                                setResult(ssdata);
                            }, input, data);
                            */
                            storage0.putMyVar('搜索临时搜索数据', jkdata);
                            return 'hiker://search?s='+input+'  '+'&rule='+MY_RULE.title;
                        }else{
                            return 'toast://未找到接口数据'
                        }
                    },jkdata);
                    d.push({
                        title: "搜索",
                        url: $.toString((searchurl) => {
                                return input + searchurl;
                            },searchurl),
                        desc: "搜你想看的...",
                        col_type: "input",
                        extra: {
                            titleVisible: true
                        }
                    });
                }catch(e){
                    d.push({
                        title: '生成分类数据失败！',
                        desc: e.message,
                        url: 'hiker://empty',
                        col_type: 'text_center_1'
                    }); 
                    log(api_name+'>生成分类数据异常>'+e.message + " 错误行#" + e.lineNumber);
                }
            }
        }
    }

    if(listurl && lists.length==0){
        try{
            if(api_type=="drpy"){
                log(listurl);
                if(extdata['filter_url']){
                    let filter_url = extdata['filter_url'].replace('{{fl.lang}}','').replace('{{fl.letter}}','').replace('{{fl.字母}}','').replace('{{fl.语言}}','');
                    filter_url = filter_url.replace('fl.类型',type_id?'type_id':'cate_id').replace('fl.地区','area_id').replace('fl.年份','year_id').replace('fl.剧情','class_id').replace('fl.排序','sort_id');
                    filter_url = filter_url.replace('fl.cateId', type_id?'type_id':'cate_id').replace('fl.area','area_id').replace('fl.year','year_id').replace('fl.class','class_id').replace('fl.by','sort_id');
                    filter_url = filter_url.replace('fyclass', 'cate_id').replace('fypage', MY_PAGE).replace(/ or /g, '||').replace(/{{/g, '${').replace(/}}/g, '}');
                    eval(`filter_url = \`${filter_url}\`;`);
                    MY_URL = listurl.replace('fyfilter', filter_url);
                }else{
                    MY_URL = listurl.replace('fyclass', cate_id).replace('fypage', MY_PAGE);
                }
                log(MY_URL);
            }else if(api_type=="XBPQ"){
                MY_URL = listurl.replace('/lang/{lang}','');
                if(!type_id){
                    MY_URL = MY_URL.replace('/class/{class}','');
                }
                if(!area_id){
                    MY_URL = MY_URL.replace('/area/{area}','');
                }
                if(!year_id){
                    MY_URL = MY_URL.replace('/year/{year}','');
                }
                if(!sort_id){
                    MY_URL = MY_URL.replace('/by/{by}','');
                }
                MY_URL = MY_URL.replace('{catePg}',extdata["起始页"]?MY_PAGE>extdata["起始页"]?MY_PAGE:extdata["起始页"]:MY_PAGE).replace('{year}', year_id).replace('{area}', area_id).replace('{by}', sort_id).replace('{class}', type_id).replace('{cateId}', cate_id);
            }else{
                MY_URL = listurl + MY_PAGE;
                if(api_type=="v2"||api_type=="app"){
                    MY_URL = MY_URL.replace('@type_id',type_id);
                }else if (api_type=="v1") {
                    MY_URL = MY_URL + '&type=' + type_id;
                } else if (api_type=="iptv") {
                    MY_URL = MY_URL + '&class=' + type_id;
                } else {
                    MY_URL = MY_URL + '&t=' + type_id;
                }
            }

            let gethtml = request(MY_URL, { headers: headers, timeout:5000 });

            if(api_type=="drpy"){
                let id,name,pic,note
                let dws = extdata["一级"].split(';');
                let vodlist = _pdfa(gethtml, dws[0]);
                vodlist.forEach(it=>{
                    if(dws[4]){
                        id = _pd(it, dws[4], MY_URL);
                    }
                    if(dws[1]){
                        name = _pdfh(it, dws[1]);
                    }
                    if(dws[2]){
                        pic = _pdfh(it, dws[2]);
                    }
                    if(dws[3]){
                        note = _pdfh(it, dws[3]);
                    }
                    if(id&&name){
                        lists.push({"vod_id":id,"vod_name":name,"vod_remarks":note||"","vod_pic":pic||""});
                    }
                })
            }else if(api_type=="XBPQ"){
                extdata["二次截取"] = extdata["二次截取"] || (gethtml.indexOf(`<ul class="stui-vodlist`)>-1?`<ul class="stui-vodlist&&</ul>`:gethtml.indexOf(`<ul class="myui-vodlist`)>-1?`<ul class="myui-vodlist&&</ul>`:"");
                if(extdata["二次截取"]){
                    gethtml = gethtml.split(extdata["二次截取"].split('&&')[0])[1].split(extdata["二次截取"].split('&&')[1])[0];
                }
                extdata["链接"] = extdata["链接"] || `href="&&"`;
                extdata["标题"] = extdata["标题"] || `title="&&"`;
                extdata["数组"] = extdata["数组"] || `<a &&</a>`;
                let jklist = gethtml.match(new RegExp(extdata["数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                jklist.forEach(item=>{
                    if(!extdata["图片"]){
                        if(item.indexOf('original=')>-1){
                            extdata["图片"] = `original="&&"`;
                        }else if(item.indexOf('<img src=')>-1){
                            extdata["图片"] = `<img src="&&"`;
                        }
                    };
                    if(extdata["图片"]&&item.indexOf(extdata["图片"].split("&&")[0])>-1){
                        let id = getBetweenStr(item, extdata["链接"]);
                        let name = getBetweenStr(item, extdata["标题"]);
                        let pic = "";
                        try{
                            pic = getBetweenStr(item, extdata["图片"]);
                        }catch(e){}
                        let note = "";
                        try{
                            note = getBetweenStr(item, extdata["副标题"]);
                        }catch(e){}
                        let arr = {"vod_id":id,"vod_name":name,"vod_remarks":note,"vod_pic":pic};
                        lists.push(arr);
                    }
                })
            }else{
                let json;
                if(/cms/.test(api_type)&&/<\?xml/.test(gethtml)){
                    gethtml = gethtml.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g,'');
                    let xmllist = [];
                    let videos = pdfa(gethtml,'list&&video');
                    for(let i in videos){
                        let id = String(xpath(videos[i],`//video/id/text()`)).trim();
                        let name = String(xpath(videos[i],`//video/name/text()`)).trim();
                        let pic = String(xpath(videos[i],`//video/pic/text()`)).trim();
                        let note = String(xpath(videos[i],`//video/note/text()`)).trim();
                        let arr = {"vod_id":id,"vod_name":name,"vod_remarks":note,"vod_pic":pic};
                        let plays = xpathArray(videos[i],`//video/dl/dd/text()`);
                        if(plays.length==1){
                            let play = plays[0];
                            if(play.indexOf('$')==-1&&play.indexOf('m3u8')>-1){
                                arr['play'] = play.trim();
                            }
                        }
                        xmllist.push(arr)
                    }
                    json = {"list":xmllist};
                }else if(!/{|}/.test(gethtml)&&gethtml!=""){
                    var decfile = "hiker://files/rules/Src/Juying/appdec.js";
                    var Juyingdec=fetch(decfile);
                    if(Juyingdec != ""){
                        eval(Juyingdec);
                        json = JSON.parse(xgdec(gethtml));
                    }
                }else{
                    json = JSON.parse(gethtml);
                }
                try{
                    lists = eval(listnode)||json.list||json.data.list||json.data||[];
                } catch (e) {
                    lists = json.list||json.data.list||json.data||[];
                }
            }
            if(lists.length==0){
                d.push({
                    title: '列表为空',
                    desc: '点击访问原网页',
                    url: MY_URL + '#noHistory#',
                    col_type: 'text_center_1'
                }); 
            }
        }catch(e){
            d.push({
                title: '获取列表数据失败！',
                desc: '点击访问原网页',
                url: MY_URL + '#noHistory#',
                col_type: 'text_center_1'
            }); 
            log(api_name+'>获取列表异常>'+e.message + " 错误行#" + e.lineNumber)
        }
    }

    lists.forEach((list)=>{
        let vodname = list.vod_name||list.title;
        vodname = vodname.replace(/<\/?.+?\/?>/g,'');
        if(vodname){
            let vodpic = list.vod_pic||list.pic;
            let voddesc = list.vod_remarks||list.state||"";
            voddesc = voddesc.replace(/<\/?.+?\/?>/g,'');
            let vodurl = /^hiker/.test(list.vodid)?list.vodid:list.vod_id?vodurlhead&&!/^http/.test(list.vod_id)?vodurlhead+list.vod_id:list.vod_id:list.nextlink;
            vodpic = vodpic?vodpic.replace('/img.php?url=','').replace('/tu.php?tu=',''):"hiker://files/cache/src/404.jpg";
            if(/^\/upload|^upload/.test(vodpic)){
                vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
            }
            if(/^\/\//.test(vodpic)){
                vodpic = "https:" + vodpic;
            }
            if(api_type=='cms'&&list.vod_play_url){
                if(list.vod_play_url.indexOf('$')==-1&&list.vod_play_url.indexOf('m3u8')>-1){
                    list['play'] = list.vod_play_url;
                }
            }
            d.push({
                title: vodname,
                desc: voddesc,
                pic_url: vodpic,
                url: /^hiker/.test(vodurl)?vodurl:list.play?list.play:$("hiker://empty#immersiveTheme##autoCache#").rule(() => {
                    require(config.依赖);
                    dianboerji()
                }),
                col_type: 'movie_3',
                extra: {
                    url: vodurl,
                    pic: vodpic,
                    pageTitle: vodname,
                    data: jkdata
                }
            })
        }
    });
    
    return d;
}
// 获取搜索数据
function getSsData(name, jkdata) {
    name = name.replace(/全集.*|国语.*|粤语.*/g,'');
    let api_name = jkdata.name||"";
    let api_type = jkdata.type||"";
    let api_url = jkdata.url||"";
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;

    let vodurlhead,ssurl,listnode,extdata;
    if (api_type=="v1") {
        let date = new Date();
        let mm = date.getMonth()+1;
        let dd = date.getDate();
        let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
        vodurlhead = api_url + '/detail?&key='+key+'&vod_id=';
        ssurl = api_url + '?ac=videolist&limit=10&wd='+name+'&key='+key;
        listnode = "html.data.list";
    } else if (api_type=="app") {
        vodurlhead = api_url + 'video_detail?id=';
        ssurl = api_url + 'search?limit=10&text='+name;
        listnode = "html.list";
    } else if (api_type=="v2") {
        vodurlhead = api_url + 'video_detail?id=';
        ssurl = api_url + 'search?limit=10&text='+name;
        listnode = "html.data";
    } else if (api_type=="iptv") {
        vodurlhead = api_url + '?ac=detail&ids=';
        ssurl = api_url + '?ac=list&zm='+name+'&wd='+name; 
        listnode = "html.data";
    } else if (api_type=="cms") {
        vodurlhead = api_url + '?ac=videolist&ids=';
        ssurl = api_url + '?ac=videolist&wd='+name;
        listnode = "html.list";
    } else if (api_type=="xpath"||api_type=="biubiu"||api_type=="XBPQ") {
        extdata = extDataCache(jkdata)
        if($.type(extdata)=='object'){
            if(api_type=="XBPQ"){
                extdata["搜索url"] = extdata["搜索url"] || "/index.php/ajax/suggest?mid=1&wd={wd}&limit=500";
                ssurl = extdata["搜索url"].replace('{wd}',name).replace('{pg}','1');
                ssurl = /^http/.test(ssurl)?ssurl:extdata["主页url"]+ssurl;
                vodurlhead = getHome(ssurl);
            }
        }
    } else {
        log('api类型错误')
    }
    function getHtmlCode(ssurl,ua,timeout){
        let headers = {
            "User-Agent": ua,
            "Referer": ssurl
        };
        let html = request(ssurl, { headers: headers, timeout:timeout });
        try{
            if (html.indexOf('检测中') != -1) {
                html = request(ssurl + '&btwaf' + html.match(/btwaf(.*?)\"/)[1], {headers: headers, timeout: timeout});
            }else if (/页面已拦截/.test(html)) {
                html = fetchCodeByWebView(ssurl, { headers: headers, 'blockRules': ['.png', '.jpg', '.gif', '.mp3', '.mp4'], timeout:timeout});
                html = pdfh(html,'body&&pre&&Text');
            }else if (/系统安全验证/.test(html)) {
                log(api_name+'>'+ssurl+'>页面有验证码拦截');
                function ocr(codeurl,headers) {
                    headers= headers || {};
                    let img = convertBase64Image(codeurl,headers).replace('data:image/jpeg;base64,','');
                    let code = request('https://api.xhofe.top/ocr/b64/text', { body: img, method: 'POST', headers: {"Content-Type":"text/html"}});
                    code = code.replace(/o/g, '0').replace(/u/g, '0').replace(/I/g, '1').replace(/l/g, '1').replace(/g/g, '9');
                    log('识别验证码：'+code);
                    return code;
                }
                let www = ssurl.split('/');
                let home = www[0]+'//'+www[2];
                let codeurl = home+(ssurl.indexOf('search-pg-1-wd-')>-1?'/inc/common/code.php?a=search':'/index.php/verify/index.html?');
                let cook = fetchCookie(codeurl, {headers: headers});
                headers.Cookie = JSON.parse(cook||'[]').join(';');
                let vcode = ocr(codeurl,headers);
                fetch(home+(ssurl.indexOf('search-pg-1-wd-')>-1?'/inc/ajax.php?ac=code_check&type=search&code=':html.match(/\/index.php.*?verify=/)[0]) + vcode, {
                    headers: headers,
                    method: ssurl.indexOf('search-pg-1-wd-')>-1?'GET':'POST'
                })

                html = fetch(ssurl, { headers: headers, timeout:timeout});
            }
        }catch(e){}
        return html;
    }
    
    let lists = [];
    let gethtml = "";
    if(/v1|app|iptv|v2|cms/.test(api_type)){
        let json;
        try {
            gethtml = getHtmlCode(ssurl,api_ua,5000);
            if(/cms/.test(api_type)){
                if(gethtml&&gethtml.indexOf(name)==-1){
                    gethtml = getHtmlCode(ssurl.replace('videolist','list'),api_ua,5000);
                }
                if(/<\?xml/.test(gethtml)){
                    gethtml = gethtml.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g,'');
                    let xmllist = [];
                    let videos = pdfa(gethtml,'list&&video');
                    for(let i in videos){
                        let id = String(xpath(videos[i],`//video/id/text()`)).trim();
                        let name = String(xpath(videos[i],`//video/name/text()`)).trim();
                        let pic = String(xpath(videos[i],`//video/pic/text()`)).trim();
                        let note = String(xpath(videos[i],`//video/note/text()`)).trim();
                        xmllist.push({"vod_id":id,"vod_name":name,"vod_remarks":note,"vod_pic":pic})
                    }
                    json = {"list":xmllist};
                }else{
                    json = JSON.parse(gethtml);
                }
            }else if(!/{|}/.test(gethtml)&&gethtml!=""){
                let decfile = "hiker://files/rules/Src/Juying/appdec.js";
                let Juyingdec=fetch(decfile);
                if(Juyingdec != ""){
                    eval(Juyingdec);
                    json = JSON.parse(xgdec(gethtml));
                }
            }else{
                json = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''));
            }
        } catch (e) {
            json = { data: [] };
            if(gethtml){geterror = 1;}
            //log(1);//log(obj.name+'>'+e.message + " 错误行#" + e.lineNumber);
        }
        try{
            try{
                lists = eval(listnode)||json.list||json.data.list||json.data||[];
            } catch (e) {
                lists = json.list||json.data.list||json.data||[];
            }
            
            if(lists.length==0&&api_type=="iptv"){
                ssurl = ssurl.replace('&zm='+name,'');
                json = JSON.parse(getHtmlCode(ssurl,api_ua,5000));
                lists = json.data||[];
            }
            lists = lists.map(list=>{
            let vodname = list.vod_name||list.title;
                if(vodname.indexOf(name)>-1){
                    let vodpic = list.vod_pic||list.pic||"";
                    let voddesc = list.vod_remarks||list.state||"";
                    let vodurl = list.vod_id?vodurlhead + list.vod_id:list.nextlink;
                    let vodcontent = list.vod_blurb || "";
                    return {
                        vodname: vodname,
                        vodpic: vodpic.indexOf('ver.txt')>-1?"":vodpic,
                        voddesc: voddesc,
                        vodurl: vodurl,
                        vodcontent: vodcontent
                    }
                }
            })
        } catch (e) {
            //log(2);//log(obj.name+'>'+e.message);
        }
    }else if(api_type=="xpath"||api_type=="biubiu"){
        try {
            if(api_type=="xpath"){
                ssurl = extdata.searchUrl.replace('{wd}',name);
                if(extdata.scVodNode=="json:list"){
                    gethtml = getHtmlCode(ssurl,api_ua,5000);
                    let json = JSON.parse(gethtml);
                    lists = json.list||[];
                    lists.forEach(item => {
                        if(extdata.scVodId){
                            item.id = item[extdata.scVodId];
                        }
                    })
                }else{
                    let sstype = ssurl.indexOf(';post')>-1?"post":"get";
                    if(sstype == "post"){
                        let ssstr = ssurl.replace(';post','').split('?');
                        let postcs = ssstr[ssstr.length-1];
                        if(ssstr.length>2){
                            ssstr.length = ssstr.length-1;
                        }
                        ssurl = ssstr.join('?');
                        gethtml = request(ssurl, { headers: { 'User-Agent': api_ua }, timeout:5000, method: 'POST', body: postcs  });
                    }else{
                        gethtml = getHtmlCode(ssurl,api_ua,5000);
                    }
                    let title = xpathArray(gethtml, extdata.scVodNode+extdata.scVodName);
                    let href = xpathArray(gethtml, extdata.scVodNode+extdata.scVodId);
                    let img = xpathArray(gethtml, extdata.scVodNode+extdata.scVodImg);
                    let mark = xpathArray(gethtml, extdata.scVodNode+extdata.scVodMark)||"";
                    for(let j in title){
                        lists.push({"id":/^http/.test(href[j])||/\{vid}$/.test(extdata.dtUrl)?href[j]:href[j].replace(/\/.*?\/|\.html/g,''),"name":title[j],"pic":img[j],"desc":mark[j]})
                    }
                }
                var ssvodurl = `extdata.dtUrl.replace('{vid}', list.id)`;
            }else{
                ssurl = extdata.url+extdata.sousuoqian+name+extdata.sousuohou;
                if(extdata.ssmoshi=="0"){
                    gethtml = getHtmlCode(ssurl,api_ua,5000);
                    let html = JSON.parse(gethtml);
                    lists = html.list||[];
                }else{
                    let sstype = ssurl.indexOf(';post')>-1?"post":"get";
                    if(sstype == "post"){
                        /*
                        let ssstr = ssurl.replace(';post','').split('?');
                        var postcs = ssstr[ssstr.length-1];
                        if(ssstr.length>2){
                            ssstr.length = ssstr.length-1;
                        }
                        var gethtml = request(ssurl, { headers: { 'User-Agent': api_ua }, timeout:5000, method: 'POST', body: postcs  });
                    */
                    }else{
                        gethtml = getHtmlCode(ssurl,api_ua,5000);
                    }
                    let sslist = gethtml.split(extdata.jiequshuzuqian.replace(/\\/g,""));
                    sslist.splice(0,1);
                    for (let i = 0; i < sslist.length; i++) {
                        sslist[i] = sslist[i].split(extdata.jiequshuzuhou.replace(/\\/g,""))[0];
                        let title = sslist[i].split(extdata.biaotiqian.replace(/\\/g,""))[1].split(extdata.biaotihou.replace(/\\/g,""))[0];
                        let href = sslist[i].split(extdata.lianjieqian.replace(/\\/g,""))[1].split(extdata.lianjiehou.replace(/\\/g,""))[0].replace(extdata.sousuohouzhui.replace(/\\/g,""),"");//.replace('.html','')
                        let img = sslist[i].split(extdata.tupianqian.replace(/\\/g,""))[1].split(extdata.tupianhou.replace(/\\/g,""))[0];
                        let mark = "";
                        lists.push({"id":href,"name":title,"pic":img,"desc":mark})
                    }
                    if(extdata.sousuohouzhui=="/vod/"){extdata.sousuohouzhui = "/index.php/vod/detail/id/"}
                }
                var ssvodurl = `extdata.url+extdata.sousuohouzhui+list.id`;//+'.html'
            }
            lists = lists.map(list=>{
                let vodname = list.name;
                let vodpic = list.pic||"";
                let voddesc = list.desc||"";
                let vodurl = eval(ssvodurl);
                return {
                    vodname: vodname,
                    vodpic: vodpic,
                    voddesc: voddesc,
                    vodurl: vodurl
                }
            })
        } catch (e) {
            //log(3);//log(obj.name+'>'+e.message);
        }
    }else if(api_type=="XBPQ"){
        try{
            if(extdata["搜索模式"]=="0"&&extdata["搜索后缀"]){
                gethtml = getHtmlCode(ssurl,api_ua,5000);
                let html = JSON.parse(gethtml);
                lists = html.list||[];
                var ssvodurl = `extdata["主页url"] + extdata["搜索后缀"] + list.id + '.html'`;
            }else{
                let sstype = ssurl.indexOf(';post')>-1?"post":"get";
                if(sstype == "post"){
                    let postcs = ssurl.split(';')[2];
                    ssurl = ssurl.split(';')[0];
                    gethtml = request(ssurl, { headers: { 'User-Agent': api_ua }, timeout:5000, method: 'POST', body: postcs  });
                }else{
                    gethtml = getHtmlCode(ssurl,api_ua,5000);
                }
                if(extdata["搜索二次截取"]){
                    gethtml = gethtml.split(extdata["搜索二次截取"].split('&&')[0])[1].split(extdata["搜索二次截取"].split('&&')[1])[0];
                }
                let sslist = gethtml.match(new RegExp(extdata["搜索数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                for (let i = 0; i < sslist.length; i++) {
                    let title = getBetweenStr(sslist[i], extdata["搜索标题"]);//sslist[i].split(extdata["搜索标题"].split('&&')[0])[1].split(extdata["搜索标题"].split('&&')[1])[0];
                    let href = getBetweenStr(sslist[i], extdata["搜索链接"].replace(`+\"id\":`,'').replace(`,+`,'.'));//sslist[i].split(extdata["搜索链接"].split('&&')[0])[1].split(extdata["搜索链接"].split('&&')[1])[0];
                    let img = getBetweenStr(sslist[i], extdata["搜索图片"]);//sslist[i].split(extdata["搜索图片"].split('&&')[0])[1].split(extdata["搜索图片"].split('&&')[1])[0];
                    let mark = getBetweenStr(sslist[i], extdata["搜索副标题"]);//sslist[i].split(extdata["搜索副标题"].split('&&')[0])[1].split(extdata["搜索副标题"].split('&&')[1])[0];
                    lists.push({"id":/^http/.test(href)?href:vodurlhead+href,"name":title,"pic":img,"desc":mark})
                }
                var ssvodurl = "";
            }
            lists = lists.map(list=>{
                let vodurl = ssvodurl?eval(ssvodurl):list.id;
                return {
                    vodname: list.name,
                    vodpic: list.pic||"",
                    voddesc: list.desc||"",
                    vodurl: vodurl
                }
            })
        }catch(e){
            log(e.message + " 错误行#" + e.lineNumber);
        }
    }
    let searchs = [];
    if(lists.length>0){
        try {
            lists.forEach((list)=>{
                let vodpic = list.vodpic?list.vodpic.replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g,''):"hiker://files/cache/src/picloading.gif";
                if(/^\/\//.test(vodpic)){
                    vodpic = "https:" + vodpic;
                }   
                if(/^\/upload|^upload/.test(vodpic)){
                    vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                }

                searchs.push({
                    vodname: list.vodname,
                    voddesc: list.voddesc,
                    vodcontent: list.vodcontent,
                    vodpic: vodpic,
                    vodurl: list.vodurl
                })
            });
        } catch (e) {
            log(jkdata.name + '输出结果报错>'+e.message + " 错误行#" + e.lineNumber);
        }
    }
    return searchs;
}

// 获取二级数据
function getErData(jkdata) {
    let api_type = jkdata.type;
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;

    let html,isxml,extdata;
    if (/v1|app|v2|iptv|cms/.test(api_type)) {
        try{
            let gethtml = request(MY_URL, {headers: {'User-Agent': api_ua}, timeout:5000});
            if(/cms/.test(api_type)&&/<\?xml/.test(gethtml)){
                html = gethtml;
                isxml = 1;
            }else{
                html = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''));
                isxml = 0;
            }
        } catch (e) {
            
        }
    } else if (/xpath|biubiu|XBPQ/.test(api_type)) {
        extdata = extDataCache(jkdata)
        try{
            html = request(MY_URL, {headers: {'User-Agent': api_ua}, timeout:5000});
        } catch (e) {
            log(e.message + " 错误行#" + e.lineNumber);
        }
    }
    
    let pic = '';
    let details1 = '';
    let details2 = '';
    let desc = '...';
    let tabs = [];
    let lists = [];
    let linecodes = [];
    let parse_api = "";

    if(html){
        let arts = [];
        let conts = [];
        let actor,director,area,year,remarks,pubdate;
        if(/cms/.test(api_type)&&isxml==1){
            html = html.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g,'');
            arts = xpathArray(html,`//video/dl/dt/@name`);
            if(arts.length==0){
                arts = xpathArray(html,`//video/dl/dd/@flag`);
            }
            conts = xpathArray(html,`//video/dl/dd/text()`);
            actor = String(xpath(html,`//video/actor/text()`)).trim().replace(/&middot;/g,'·') || "";
            director = String(xpath(html,`//video/director/text()`)).trim().replace(/&middot;/g,'·') || "";
            area = String(xpath(html,`//video/area/text()`)).trim();
            year = String(xpath(html,`//video/year/text()`)).trim();
            remarks = String(xpath(html,`//video/note/text()`)).trim() || "";
            pubdate = String(xpath(html,`//video/type/text()`)).trim() || "";
            pic = xpath(html,`//video/pic/text()`);
            desc = String(xpath(html.replace('<p>','').replace('</p>',''),`//video/des/text()`));
        }else if (/v1|app|v2|cms/.test(api_type)) {
            let json;
            if (/cms/.test(api_type)) {
                try{
                    json = html.list[0];
                }catch(e){
                    json = html.data.list[0];
                }
                if(json.vod_play_from&&json.vod_play_url){
                    arts = json.vod_play_from.split('$$$');
                    conts = json.vod_play_url.split('$$$');
                }else if(html.from&&html.play){
                    arts = html.from;
                    for (let i = 0; i < html.play.length; i++) {
                        let cont = [];
                        let plays = html.play[i];
                        for (let j = 0; j < plays.length; j++) {
                            cont.push(plays[j][0]+"$"+plays[j][1])
                        }
                        conts.push(cont.join("#"))
                    }
                }
            }else{
                if($.type(html.data)=="array"){
                    json = html.data[0];
                }else{
                    json = html.data;
                }
                if(json&&json.vod_info){
                    json = json.vod_info;
                }
                arts = json.vod_play_list || json.vod_url_with_player || [];
                conts = arts;
                if(arts.length==0&&json.vod_play_from&&json.vod_play_url){
                    arts = json.vod_play_from.split('$$$');
                    conts = json.vod_play_url.split('$$$');
                    api_type = "cms";
                }
            }
            actor = json.vod_actor;
            director = json.vod_director;
            area = json.vod_area;
            year = json.vod_year;
            remarks = json.vod_remarks || "";
            pubdate = json.vod_pubdate || json.vod_class || "";
            pic = json.vod_pic&&json.vod_pic.indexOf('ver.txt')==-1?json.vod_pic:'';
            desc = json.vod_blurb;
        }else if (/iptv/.test(api_type)) {
            actor = html.actor.join(",");
            director = html.director.join(",");
            area = html.area.join(",");
            year = html.pubtime;
            remarks = html.trunk || "";
            pubdate = html.type.join(",") || "";
            pic = html.img_url;
            desc = html.intro;
            arts = html.videolist;
            conts = arts;
        }else if (/xpath/.test(api_type)) {
            try{
                actor = String(xpathArray(html, extdata.dtActor).join(',')).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取主演dtActor失败>'+e.message);
            }
            try{
                director = String(xpathArray(html, extdata.dtDirector).join(',')).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取导演dtDirector失败>'+e.message);
            }
            try{
                area = String(xpath(html, extdata.dtArea)).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取地区dtArea失败>'+e.message);
            }
            try{
                year = String(xpath(html, extdata.dtYear)).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取年份dtYear失败>'+e.message);
            }
            try{
                remarks = String(xpathArray(html, extdata.dtCate).join(',')).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "")||"xpath数据存在错误";
            }catch(e){
                log('xpath获取类型dtCate失败>'+e.message);
            }
            try{
                pubdate = String(xpathArray(html, extdata.dtMark).join(',')).replace(extdata.filter?eval(extdata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取备注dtMark失败>'+e.message);
            }
            try{
                pic = xpath(html, extdata.dtImg);
            }catch(e){
                log('xpath获取图片dtImg失败>'+e.message);
            }
            try{
                desc = String(xpath(html, extdata.dtDesc)).replace(extdata.filter?eval(extdata.filter):"","");
            }catch(e){
                log('xpath获取简价dtDesc失败>'+e.message);
            }
            try{
                arts = xpathArray(html, extdata.dtFromNode+(extdata.dtFromName.indexOf('concat(')>-1?'/text()':extdata.dtFromName));
            }catch(e){
                log('xpath获取线路失改>'+e.message);
            }
            try{
                for (let i = 1; i < arts.length+1; i++) {
                    if(arts[i-1].indexOf("在线视频")>-1){arts[i-1] = '播放源'+i;}
                    let contname = xpathArray(html, extdata.dtUrlNode+'['+i+']'+extdata.dtUrlSubNode+extdata.dtUrlName);
                    let conturl = xpathArray(html, extdata.dtUrlNode+'['+i+']'+extdata.dtUrlSubNode+(extdata.dtUrlId=="@href"?'/'+extdata.dtUrlId:extdata.dtUrlId));
                    let cont = [];
                    for (let j = 0; j < contname.length; j++) {
                        let urlid = extdata.dtUrlIdR;
                        let playUrl;
                        if(urlid){
                            let urlidl = urlid.split('(\\S+)')[0];
                            let urlidr = urlid.split('(\\S+)')[1];
                            playUrl = conturl[j].replace(urlidl,'').replace(urlidr,'');
                        }else{
                            playUrl = conturl[j];
                        }
                        cont.push(contname[j]+"$"+extdata.playUrl.replace('{playUrl}',playUrl))
                    }
                    conts.push(cont.join("#"))
                }
            }catch(e){
                log('xpath获取选集列表失败>'+e.message);
            }
        }else if (/biubiu/.test(api_type)) {
            let getsm = "";
            try{
                getsm = "获取播放地址数组bfjiequshuzuqian";
                let bflist = html.split(extdata.bfjiequshuzuqian.replace(/\\/g,""));
                bflist.splice(0,1);
                for (let i = 0; i < bflist.length; i++) {
                    arts[i] = '播放源'+(i+1);
                    bflist[i] = bflist[i].split(extdata.bfjiequshuzuhou.replace(/\\/g,""))[0];
                    let bfline = pdfa(bflist[i],"body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = pdfh(bfline[j],"a&&Text");
                        let conturl = pd(bfline[j],"a&&href");
                        cont.push(contname+"$"+conturl)
                    }
                    conts.push(cont.join("#"))
                }
                getsm = "获取备注zhuangtaiqian";
                remarks = pdfh(html.split(extdata.zhuangtaiqian.replace(/\\/g,""))[1].split(extdata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[0]||"biubiu数据存在错误";
                getsm = "获取主演zhuyanqian";
                actor = pdfh(html.split(extdata.zhuyanqian.replace(/\\/g,""))[1].split(extdata.zhuyanhou.replace(/\\/g,""))[0],"Text");
                getsm = "获取导演daoyanqian";
                director = pdfh(html.split(extdata.daoyanqian.replace(/\\/g,""))[1].split(extdata.daoyanhou.replace(/\\/g,""))[0],"Text");
                getsm = "获取更新zhuangtaiqian";
                pubdate = pdfh(html.split(extdata.zhuangtaiqian.replace(/\\/g,""))[1].split(extdata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[1]||"";
                getsm = "获取剧情简介juqingqian";
                desc = pdfh(html.split(extdata.juqingqian.replace(/\\/g,""))[1].split(extdata.juqinghou.replace(/\\/g,""))[0],"Text");
            }catch(e){
                log(getsm+'失败>'+e.message + " 错误行#" + e.lineNumber)
            }    
        }else if (/XBPQ/.test(api_type)) {
            try{
                let arthtml = html;
                if(extdata["线路二次截取"]){
                    arthtml = arthtml.split(extdata["线路二次截取"].split('&&')[0])[1].split(extdata["线路二次截取"].split('&&')[1])[0];
                }
                let artlist = arthtml.match(new RegExp(extdata["线路数组"].split('[')[0].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                for (let i = 0; i < artlist.length; i++) {
                    let arttitle = artlist[i].split(extdata["线路数组"].split('&&')[0])[1].split(extdata["线路数组"].split('&&')[1])[0].split(extdata["线路标题"].split('&&')[0])[1].split(extdata["线路标题"].split('&&')[1])[0];
                    arts[i] = arttitle.replace(/<\/?.+?\/?>/g,'');
                }

                let conthtml = html;
                if(extdata["播放二次截取"]){
                    conthtml = conthtml.split(extdata["播放二次截取"].split('&&')[0])[1].split(extdata["播放二次截取"].split('&&')[1])[0];
                }
                let contlist = conthtml.match(new RegExp(extdata["播放数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                for (let i = 0; i < contlist.length; i++) {
                    let bfline = extdata["播放列表"]?contlist[i].match(new RegExp(extdata["播放列表"].replace('&&','((?:.|[\r\n])*?)'), 'g')):pdfa(contlist[i],"body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = extdata["播放标题"]?bfline[j].split(extdata["播放标题"].split('&&')[0])[1].split(extdata["播放标题"].split('&&')[1])[0]:pdfh(bfline[j],"a&&Text");
                        let conturl = extdata["播放链接"]?bfline[j].split(extdata["播放链接"].split('&&')[0])[1].split(extdata["播放链接"].split('&&')[1])[0]:pd(bfline[j],"a&&href");
                        cont.push(contname+"$"+conturl)
                    }
                    conts.push(cont.join("#"))
                }
                
                actor = getBetweenStr(html, extdata["主演"]);
                director = getBetweenStr(html, extdata["导演"]);
                remarks = getBetweenStr(html, extdata["影片状态"]);
                pubdate = getBetweenStr(html, extdata["影片类型"]);
                year = getBetweenStr(html, extdata["影片年代"]);
                area = getBetweenStr(html, extdata["影片地区"]);
                extdata["简介"] = extdata["简介"]&&extdata["简介"].includes('+')?extdata["简介"].split('+')[1]:extdata["简介"];
                desc = getBetweenStr(html, extdata["简介"]);
            }catch(e){
                log('失败>'+e.message + " 错误行#" + e.lineNumber)
            }    
        }else{
            //自定义接口/web自动匹配
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcAutoTmpl.js');
            let data = autoerji(MY_URL, html);
            details1 = data.details1||'自动匹配失败';
            details2 = data.details2||'';
            pic = data.pic;
            desc = data.desc;
            arts = data.arts||[];
            conts = data.conts||[];
        }
        if(/xpath|biubiu|XBPQ/.test(api_type)&&html&&(arts.length==0||conts.length==0)&&getMyVar('debug','0')=="0"&&html.indexOf(MY_PARAMS.pageTitle)>-1){
            log('开启模板自动匹配、AI识片，获取播放选集');
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcAutoTmpl.js');
            let data = autoerji(MY_URL, html);
            remarks = remarks || "";
            details2 = data.details2 || "";
            arts = data.arts || area;
            conts = data.conts;
            pic = data.pic || pic;
        }
        actor = actor?actor.includes('主演')?actor:'主演：'+actor:'';
        director = director?director.includes('导演')?director:'导演：'+director:'';
        let dqnf = "";
        if(area){
            dqnf = '\n地区：' + area + (year?'   年代：' + year:'')
        }else{
            dqnf = year?'\n年代：' + year:''
        }
        details1 = details1?details1:director.substring(0, director.length<10?director.length:10) + '\n' + actor.substring(0, actor.length<10||dqnf==""?actor.length:10) + dqnf;
        details2 = details2?details2:remarks + '\n' + pubdate;
        details1 = details1.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
        details2 = details2.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
        desc = desc || '...';
        desc = desc.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
        
        //获取线路
        for (var i in arts) {
            let linecode;
            if (/v1|app|v2/.test(api_type)) {
                let line = arts[i].name || arts[i].player_info.show;
                tabs.push(line);
                linecode = arts[i].code || arts[i].player_info.from;

                if (getMyVar(MY_URL, '0') == i) {
                    try {
                        if(api_type=="v2"){
                            var parse1 = arts[i].parse_api;
                            var parse2 = arts[i].extra_parse_api;
                        }else{
                            var parse1 = arts[i].player_info.parse;
                            var parse2 = arts[i].player_info.parse2;
                        }
                        if (parse2.indexOf('//') == -1) {
                            parse_api = parse1;
                        } else if (parse1.indexOf('//') == -1) {
                            parse_api = parse2;
                        } else {
                            parse_api = parse2 + ',' + parse1;
                        }
                    } catch (e) {
                        parse_api = arts[i].parse_api;
                    }
                    if (parse_api != "" && parse_api != undefined) {
                        parse_api = parse_api.replace(/\.\./g, '.').replace(/。\./g, '.');
                    }
                }
            }else if (/iptv/.test(api_type)) {
                let line = i;
                tabs.push(line);
                linecode = i;
            }else if (/cms|xpath|biubiu|XBPQ/.test(api_type)) {
                tabs.push(arts[i].replace(/[\r\ \n\t]/g, ""));
                linecode = arts[i];
            }
            linecodes.push(linecode);
        }
        //获取选集
        for (var i in conts) {
            if (/v1|app|v2/.test(api_type)) {
                if(conts[i].url){
                    let single = conts[i].url||"";
                    if(single){lists.push(single.split('#'))};
                }else{
                    let single = conts[i].urls||[];
                    if(single.length>0){
                        let si = [];
                        for (let j = 0; j < single.length; j++) {
                            si.push(single[j].name+"$"+single[j].url);
                        }
                        lists.push(si);
                    };
                }
            }else if (/iptv/.test(api_type)) {
                let single = conts[i]||[];
                if(single.length>0){
                    let si = [];
                    for (let j = 0; j < single.length; j++) {
                        si.push(single[j].title+"$"+single[j].url.split('=')[1]);
                        parse_api = single[j].url.split('=')[0]+"=";
                    }
                    lists.push(si);
                };
            }else if (/cms|xpath|biubiu|XBPQ/.test(api_type)) {
                let single = conts[i]||"";
                if(single){
                    let lines = single.split('#');
                    if(api_type=='cms'){
                        for(let i in lines){
                            if(lines[i].indexOf('$')==-1){
                                let ii = parseInt(i)+1;
                                lines[i] = ii+'$'+lines[i];
                            }else{
                                break;
                            }
                        }
                    }
                    lists.push(lines)
                };
            }
        }
    }
    
    
 
    return {
        "details1": details1,
        "details2": details2,
        "pic": pic,
        "desc": desc,
        "tabs": tabs,
        "linecodes": linecodes,
        "lists": lists,
        "parse_api": parse_api
    };
}