//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
//接口一级
function jiekouyiji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('zsjiekou');
        clearMyVar('zsdatalist');
    }));
    clearMyVar('SrcJy$back');
    setPageTitle('接口独立展示');
    var d = [];
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    if(!storage0.getMyVar('zsjiekou')){
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
        storage0.putMyVar('zsdatalist',datalist);
        if(JYconfig.zsjiekou){
            var zslist = datalist.filter(item => {
                return item.name==JYconfig.zsjiekou.api_name;
            })
        }else{
            var zslist = [];
        }
        zslist = zslist.length>0?zslist:[{}];
        storage0.putMyVar('zsjiekou',zslist[0]);
    }
    let zsjiekou = storage0.getMyVar('zsjiekou',{});
    let api_name = zsjiekou.name||"";
    let api_type = zsjiekou.type||"";
    let api_url = zsjiekou.url||"";
    let api_ua = zsjiekou.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;
    let xunmitimeout = JYconfig.xunmitimeout||5;
    let selectgroup = JYconfig.zsjiekou?JYconfig.zsjiekou.selectgroup||"":"";

    if(api_name){setPageTitle(api_name);}
    if(api_name&&api_type&&api_url){
        if (api_type=="v1") {
            let date = new Date();
            let mm = date.getMonth()+1;
            let dd = date.getDate();
            let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
            var url = api_url + '/detail?&key='+key+'&vod_id=';
            var typeurl = api_url + "/types";
            var listurl = api_url + '?key='+key+'&page=';
            var lists = "html.data.list";
        } else if (api_type=="app") {
            var url = api_url + 'video_detail?id=';
            var typeurl = api_url + "nav";
            var listurl = api_url + 'video?tid=@type_id&pg=';
            var lists = "html.list";
        } else if (api_type=="v2") {
            var url = api_url + 'video_detail?id=';
            var typeurl = api_url + "nav";
            var listurl = api_url + 'video?tid=@type_id&pg=';
            var lists = "html.data";
        } else if (api_type=="iptv") {
            var url = api_url + '?ac=detail&ids=';
            var typeurl = api_url + "?ac=flitter";
            var listurl = api_url + '?ac=list&page=';
            var lists = "html.data";
        } else if (api_type=="cms") {
            var url = api_url + '?ac=videolist&ids=';
            var typeurl = api_url + "?ac=list";
            var listurl = api_url + '?ac=videolist&pg=';
            var lists = "html.list";
        }  else if (obj.type=="XBPQ") {
            var jsondata = obj.data;
        } else {
            log('api类型错误')
        }
    }
    
    if(MY_PAGE==1){
        /*
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
        */
        let datalist = storage0.getMyVar('zsdatalist',[]);
        let grouplist = [];
        datalist.forEach(item=>{
            let groupname = item.group||item.type;
            if(/app|v1|v2|iptv|cms/.test(item.type)&&grouplist.indexOf(groupname)==-1&&item.group!="失败待处理"){
                grouplist.push(groupname);
            }
        })

        datalist = datalist.filter(item => {
            if(selectgroup&&grouplist.indexOf(selectgroup)>-1){
                return /app|v1|v2|iptv|cms/.test(item.type) && (item.group==selectgroup || !item.group&&item.type==selectgroup) && item.group!="失败待处理"
            }else{
                return /app|v1|v2|iptv|cms/.test(item.type) && item.group!="失败待处理";
            }
        })
        /*
        if(!datalist.some(item => item.url == api_url)){
            JYconfig['zsjiekou'] = api_group?{api_group:api_group}:{};
            writeFile(cfgfile, JSON.stringify(JYconfig));
            refreshPage(true);
        }
        */
        for (let i = 0; i < 9; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        
        d.push({
            title: selectgroup?'👉'+selectgroup:'🆙选择分组',
            url: $(grouplist,2).select((cfgfile,JYconfig,selectgroup)=>{
                if(selectgroup!=input){
                    JYconfig['zsjiekou'].selectgroup = input;
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    refreshPage(true);
                }
                return "hiker://empty";
            },cfgfile,JYconfig,selectgroup),
            col_type: "scroll_button"
        });
        if(datalist.length>0){
            for(let i in datalist){
                if(api_url==datalist[i].url){
                    var Srczsjiekousousuodata = [];
                    Srczsjiekousousuodata.push(datalist[i]);
                }
                //let zsdata = {api_name:datalist[i].name, api_type:datalist[i].type, api_url:datalist[i].url, api_ua:datalist[i].ua};
                let zsdata = {api_name:datalist[i].name};
                if(selectgroup){
                    zsdata.selectgroup = selectgroup;
                }
                d.push({
                    title: api_url==datalist[i].url?'““””<b><span style="color:#3CB371">' + datalist[i].name + '</span></b>':datalist[i].name,
                    col_type: 'scroll_button',
                    url: $('#noLoading#').lazyRule((zsjiekou,cfgfile,JYconfig,jkdata) => {
                        clearMyVar('Srczsjiekou$type_id');
                        JYconfig['zsjiekou'] = zsjiekou;
                        writeFile(cfgfile, JSON.stringify(JYconfig));
                        storage0.putMyVar('zsjiekou',jkdata);
                        refreshPage(true);
                        return "hiker://empty";
                    }, zsdata,cfgfile,JYconfig,datalist[i])
                });
            }
            d.push({
                col_type: "blank_block"
            });
        }
        if(typeof(typeurl) != "undefined"){
            const Color = "#3399cc";
            try{
                let gethtml = request(typeurl, { headers: { 'User-Agent': api_ua }, timeout:xunmitimeout*1000 });
                if (api_type=="v1") {
                    let typehtml = JSON.parse(gethtml);
                    let typelist = typehtml.data.list||typehtml.data.typelist;
                    var typeclass = typelist.map((list)=>{
                        return {
                            "type_id": list.type_id,
                            "type_pid": list.type_pid,
                            "type_name": list.type_name
                        }
                    })
                } else if (/app|v2/.test(api_type)) {
                    let typehtml = JSON.parse(gethtml);
                    let typelist = typehtml.list||typehtml.data;
                    var typeclass = typelist.map((list)=>{
                        return {
                            "type_id": list.type_id,
                            "type_pid": 0,
                            "type_name": list.type_name
                        }
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
                    let typehtml = JSON.parse(gethtml);
                    var typeclass = typehtml.map((list)=>{
                        if(type_dict[list]){
                            return {
                                "type_id": list,
                                "type_pid": 0,
                                "type_name": type_dict[list]
                            }
                        }
                    })
                    typeclass = typeclass.filter(n => n);
                } else if (api_type=="cms") {
                    if(/<\?xml/.test(gethtml)){
                        let typelist = pdfa(gethtml,'class&&ty');
                        var typeclass = typelist.map((list)=>{
                            return {
                                "type_id": String(xpath(list,`//ty/@id`)).trim(),
                                "type_pid": 0,
                                "type_name": String(xpath(list,`//ty/text()`)).trim()
                            }
                        })
                    }else{
                        let typehtml = JSON.parse(gethtml);
                        var typeclass = typehtml.class;
                    }
                } else {
                    log('api类型错误')
                }
            }catch(e){
                log(api_name+' 接口访问异常，请更换接口！获取分类失败>'+e.message);
                var typeclass = [];
            }

            if(typeclass&&typeclass.length>0){
                let type_pids = [];
                let type_ids = [];
                for(let i in typeclass){
                    if(type_pids.indexOf(typeclass[i].type_pid)==-1){type_pids.push(typeclass[i].type_pid)}
                    if(type_ids.indexOf(typeclass[i].type_id)==-1){type_ids.push(typeclass[i].type_id)}
                }
                if(type_pids.length > 0){
                    type_pids.sort((a, b) => {
                        return a - b
                    })
                };
                if(/v2|app/.test(api_type)&&!getMyVar('Srczsjiekou$type_id')){
                    putMyVar('Srczsjiekou$type_id',type_ids[0]);
                }
                for (var j in type_pids) {
                    for (var i in typeclass) {
                        if(typeclass[i].type_pid==type_pids[j]){
                            d.push({
                                title: getMyVar('Srczsjiekou$type_id')==typeclass[i].type_id?'““””<b><span style="color:' + Color + '">' + typeclass[i].type_name + '</span></b>':typeclass[i].type_name,
                                url: $('#noLoading#').lazyRule((type_id) => {
                                    putMyVar('Srczsjiekou$type_id', type_id);
                                    refreshPage(true);
                                    return "hiker://empty";
                                }, typeclass[i].type_id),
                                col_type: 'scroll_button'
                            });
                        }
                    }
                    d.push({
                        col_type: "blank_block"
                    });
                }
                
            }
            var searchurl = $('').lazyRule((data) => {
                if(data){
                    return $('hiker://empty#noRecordHistory##noHistory#').rule((name,data) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                        xunmi(name,data);
                    }, input,data);
                }else{
                    return 'toast://未找到接口数据'
                }
            },Srczsjiekousousuodata);
            d.push({
                title: "🔍",
                url: $.toString((searchurl) => {
                        return input + searchurl;
                    },searchurl),
                desc: "搜你想看的...",
                col_type: "input",
                extra: {
                    titleVisible: true
                }
            });
        }
    }
    if(typeof(listurl) != "undefined"){
        try{
            MY_URL = listurl + MY_PAGE;
            if(api_type=="v2"||api_type=="app"){
                MY_URL = MY_URL.replace('@type_id',getMyVar('Srczsjiekou$type_id','1'));
            }else if(getMyVar('Srczsjiekou$type_id')){
                if (api_type=="v1") {
                    MY_URL = MY_URL + '&type=' + getMyVar('Srczsjiekou$type_id');
                } else if (api_type=="iptv") {
                    MY_URL = MY_URL + '&class=' + getMyVar('Srczsjiekou$type_id');
                } else{
                    MY_URL = MY_URL + '&t=' + getMyVar('Srczsjiekou$type_id');
                }
            }
            
            try {
                var gethtml = request(MY_URL, { headers: { 'User-Agent': api_ua }, timeout:xunmitimeout*1000 });
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
                                arr['play'] = play;
                            }
                        }
                        xmllist.push(arr)
                    }
                    var html = {"list":xmllist};
                }else if(!/{|}/.test(gethtml)&&gethtml!=""){
                    var decfile = "hiker://files/rules/Src/Juying/appdec.js";
                    var Juyingdec=fetch(decfile);
                    if(Juyingdec != ""){
                        eval(Juyingdec);
                        var html = JSON.parse(xgdec(gethtml));
                    }
                }else{
                    var html = JSON.parse(gethtml);
                }
            } catch (e) {
                var html = { data: [] };
            }
            try{
                var list = eval(lists)||html.list||html.data.list||html.data||[];
            } catch (e) {
                var list = html.list||html.data.list||html.data||[];
            }
            let videolist = list.map((list)=>{
                let vodname = list.vod_name||list.title;
                if(vodname){
                    let vodpic = list.vod_pic||list.pic;
                    let voddesc = list.vod_remarks||list.state||"";
                    let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                    vodpic = vodpic?vodpic.replace('/img.php?url=','').replace('/tu.php?tu=','') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif";
                    if(/^\/upload|^upload/.test(vodpic)){
                        vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                    }
                    if(/^\/\//.test(vodpic)){
                        vodpic = "https" + vodpic;
                    }
                    if(api_type=='cms'&&list.vod_play_url){
                        if(list.vod_play_url.indexOf('$')==-1&&list.vod_play_url.indexOf('m3u8')>-1){
                            list['play'] = list.vod_play_url;
                        }
                    }
                    return {
                        title: vodname,
                        desc: voddesc,
                        pic_url: vodpic,
                        url: list.play?list.play:$("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                xunmierji(type,ua)
                            },api_type, api_ua),
                        col_type: 'movie_3',
                        extra: {
                            pic: vodpic,
                            name: vodname,
                            title: vodname+'-'+api_name
                        }
                    }
                }
            });
            videolist = videolist.filter(n => n);
            d = d.concat(videolist);
        }catch(e){
            if(!list){
                d.push({
                    title: '接口访问异常，请更换接口！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                }); 
            }
            log(api_name+' 接口访问异常，请更换接口！获取影片失败>'+e.message)
        }
    }else{
        d.push({
            title: '先选择一个接口，做为默认展示站！',
            url: 'hiker://empty',
            col_type: 'text_center_1'
        }); 
    }    
    setResult(d);
}
//二级
function erji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('SrcM3U8');
        clearMyVar('SrcXTNH');
    }));
    clearMyVar('SrcJy$back');
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
    JYerji();

    setLastChapterRule('js:' + $.toString(param=>{
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLastChapter.js');
        param=='sougou'?sougou():JY360();
    }, MY_PARAMS.datasource))
}


//一级
function yiji() {
    Version();
    /*
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
    */
    /*
    if(MY_RULE.version<9){
        confirm({
            title: "温馨提示",
            content: "发现小程序新版本",
            confirm: $.toString(() => {
                return "海阔视界首页频道规则【聚影√】￥home_rule_url￥http://hiker.nokia.press/hikerule/rulelist.json?id=5102"
            }),
            cancel: $.toString(() => {
                return "toast://当前代码需要配合新小程序版本9以上"
            })
        });
    }
    */  
    clearMyVar('SrcJy$back');
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
    JYyiji();
    if(getMyVar('jydingyue','0')=="0"&&JYconfig['codedyid']&&JYconfig['codeid']!=JYconfig['codedyid']){
        putMyVar('jydingyue','1');
        try{
            var nowtime = Date.now();
            var oldtime = parseInt(getItem('dingyuetime','0').replace('time',''));
            if(nowtime > (oldtime+6*60*60*1000)){
                let pasteurl = JYconfig['codedyid'];
                let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', pasteurl));
                if(pasteurl&&!/^error/.test(text)){
                    let pastedata = JSON.parse(base64Decode(text));
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    let jknum = 0;
                    let jxnum = 0;
                    var jkdatalist = pastedata.jiekou||[];
                    if(jkdatalist.length>0){
                        jknum = jiekousave(jkdatalist, 0, JYconfig['codedytype']||1);
                    }
                    var jxdatalist = pastedata.jiexi||[];
                    if(jxdatalist.length>0){
                        jxnum = jiexisave(jxdatalist, 0, JYconfig['codedytype']||1);
                    }
                    if(pastedata.live){
                        let livefilepath = "hiker://files/rules/Src/Juying/liveconfig.json";
                        let liveconfig = pastedata.live;
                        writeFile(livefilepath, JSON.stringify(liveconfig));
                    }
                    log("订阅资源码自动同步完成，接口："+jknum+"，解析："+jxnum);
                }else{
                    log("订阅资源码自动同步口令错误或已失效");
                }
                setItem('dingyuetime',nowtime+"time");
            }
        } catch (e) {
            log('自动订阅更新失败：'+e.message); 
        }
    }
}

//搜索页
function sousuo2() {
    addListener("onClose", $.toString(() => {
        clearMyVar('sousuo$input');
    }));
    var searchurl = $('').lazyRule(() => {
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.indexOf(input)>-1){
            recordlist = recordlist.filter((item) => item !== input);
        }
        recordlist.unshift(input);
        if(recordlist.length>20){
            recordlist.splice(recordlist.length-1,1);
        }
        storage0.setItem('searchrecord', recordlist);
        if(getItem('searchmode')=="hiker"){
            return "hiker://search?rule=" + MY_RULE.title + "&s=" + input;
        }else{
            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                xunmi(name);
            }, input);
        }
    });
    var d = [];
    d.push({
        title: "🔍",
        url: $.toString((searchurl) => {
                return input + searchurl;
            },searchurl),
        desc: "搜你想看的...",
        col_type: "input",
        extra: {
            titleVisible: true,
            id: "searchinput",
            onChange: $.toString((searchurl) => {
                if(input.length==1){deleteItemByCls('suggest');}
                if(input.length>1&&input!=getMyVar('sousuo$input', '')){
                    putMyVar('sousuo$input', input);
                    deleteItemByCls('suggest');
                    var html = request("https://movie.douban.com/j/subject_suggest?q=" + input, {timeout: 3000});
                    var list = JSON.parse(html)||[];
                    let suggest = list.map((sug)=>{
                        try {
                            if(sug.img!=""){
                                return {
                                    title: sug.title,
                                    img: sug.img + '@Referer=',
                                    url: sug.title + searchurl,
                                    desc: "年份：" + sug.year,
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }else{
                                return {
                                    title: "⚡" + sug.title,
                                    url: sug.title + searchurl,
                                    col_type: "text_1",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }
                        } catch (e) {  }
                    });
                    if(suggest.length>0){
                        addItemAfter('searchinput', suggest);
                    }
                }
            }, searchurl)
        }
    });
    if(getItem('searchrecordide','0')=='1'){
        let recordlist = storage0.getItem('searchrecord') || [];
        if(recordlist.length>0){
            d.push({
                title: '🗑清空',
                url: $('#noLoading#').lazyRule(() => {
                    clearItem('searchrecord');
                    deleteItemByCls('searchrecord');
                    return "toast://已清空";
                }),
                col_type: 'scroll_button'
            });
        }else{
            d.push({
                title: '↻无记录',
                url: "hiker://empty",
                col_type: 'scroll_button'
            });
        }
        recordlist.forEach(item=>{
            d.push({
                title: item,
                url: item + searchurl,
                col_type: 'scroll_button',
                extra: {
                    cls: 'searchrecord'
                }
            });
        })
    }
    d.push({
        title: '<span style="color:#ff6600"><b>\t热搜榜\t\t\t</b></span>',
        url: "hiker://empty",
        pic_url: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'icon_small_3'
    });
    
    var resoufile = "hiker://files/rules/Src/Juying/resou.json";
    var Juyingresou=fetch(resoufile);
    if(Juyingresou != ""){
        eval("var JYresou=" + Juyingresou+ ";");
        var list = JYresou['resoulist'] || [];
    }else{
        var JYresou= {};
        var list = [];
    }
    var nowtime = Date.now();
    var oldtime = JYresou.updatetime||0;
    if(list.length==0||nowtime > (oldtime+24*60*60*1000)){
        var html = request("https://waptv.sogou.com/hotsugg");
        var list = pdfa(html, "body&&.hot-list&&li");
        JYresou['resoulist'] = list;
        JYresou['updatetime'] = nowtime;
        writeFile(resoufile, JSON.stringify(JYresou));
    }

    for (var i in list) {
        d.push({
            title: i=="0"?'““””<span style="color:#ff3300">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):i=="1"?'““””<span style="color:#ff6600">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):i=="2"?'““””<span style="color:#ff9900">' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"):'““””<span>' + (parseInt(i)+1).toString() + '</span>' + "\t\t\t" + pdfh(list[i], "a&&Text"),
            url: pdfh(list[i], "a&&Text") + searchurl,
            col_type: "text_1"
        }, );
    }

    setResult(d);
}

//搜索
function sousuo() {
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }
    if(!fileExist('hiker://files/rules/Src/Juying/jiekou.json')||JYconfig.sousuoms==1){
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
        JYsousuo();
    }else{
        if(MY_PAGE==1){
            let name = MY_URL.split('##')[1];
            if(name == undefined){
                setResult([{
                    title: "当前小程序版本过低，需升级新版本",
                    url: "海阔视界首页频道规则【聚影√】￥home_rule_url￥http://hiker.nokia.press/hikerule/rulelist.json?id=5102&auth=9f188bbe-4415-5fd4-ae82-726319ca44d5",
                    col_type: "text_1"
                }]);
            }else if(name.trim()){
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                xunmi(name,false,true);
            }else{
                setResult([{
                    title: "搜索关键词不能为空",
                    url: "hiker://empty",
                    col_type: "text_1"
                }]);
            }
        }else{
            setResult([]);
        }
    }
}

//版本检测
function Version() {
    var nowVersion = "6.4";//现在版本 
    var nowtime = Date.now();
    var oldtime = parseInt(getItem('VersionChecktime','0').replace('time',''));
    if (getMyVar('SrcJuying-VersionCheck', '0') == '0' && nowtime > (oldtime+12*60*60*1000)) {
        try {
            eval(request(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcTmplVersion.js'))
            if (parseFloat(newVersion.SrcJuying) > parseFloat(nowVersion)) {
                confirm({
                    title:'发现新版本，是否更新？', 
                    content:nowVersion+'=>'+newVersion.SrcJuying+'\n'+newVersion.SrcJuyingdesc[newVersion.SrcJuying], 
                    confirm: $.toString((nowtime) => {
                        setItem('VersionChecktime', nowtime+'time');
                        deleteCache();
                        delete config.依赖;
                        refreshPage();
                    },nowtime),
                    cancel:''
                })
                log('检测到新版本！\nV'+newVersion.SrcJuying+'版本》'+newVersion.SrcJuyingdesc[newVersion.SrcJuying]);
            }
            putMyVar('SrcJuying-Version', '-V'+newVersion.SrcJuying);
        } catch (e) { }
        putMyVar('SrcJuying-VersionCheck', '1');
    }else{
        putMyVar('SrcJuying-Version', '-V'+nowVersion);
    }
}
