//寻觅片源
function xunmi(name,data) {
    setPageTitle('聚搜>'+name);
    addListener("onClose", $.toString(() => {
        clearMyVar('moviemore');
        clearMyVar('xunminum');
        clearMyVar('xunmitimeout');
        clearMyVar('starttask');
        clearMyVar('stoptask');
        clearMyVar('groupmenu');
    }));
    putMyVar('moviemore','1');
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
        putMyVar('xunminum',JYconfig['xunminum']?JYconfig['xunminum']:"10");
        putMyVar('xunmitimeout',JYconfig['xunmitimeout']?JYconfig['xunmitimeout']:"5");

    }
    if(data){
        var datalist = data;
    }else{
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
        try{
            if(JYconfig.TVBoxDY){
                let TVBoxDY = JYconfig.TVBoxDY;
                if(/\/storage\/emulated\//.test(TVBoxDY)){TVBoxDY = "file://" + TVBoxDY}
                if(/^http/.test(TVBoxDY)){
                    var dyhtml = fetchCache(TVBoxDY,48, { timeout:2000 });
                }else{
                    var dyhtml = fetch(TVBoxDY);
                }
                var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
                dyhtml = dyhtml.replace(reg, function(word) { 
                    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                }).replace(/^.*#.*$/mg,"");
                var dydata = JSON.parse(dyhtml);
                var dyjiekou = dydata.sites;
                require(config.依赖.match(/https.*\//)[0] + 'SrcJySet.js');
                showLoading('正在加载TVBox订阅接口')
                for(var i in dyjiekou){
                    if(/^csp_AppYs/.test(dyjiekou[i].api)){
                        let dytype = getapitype(dyjiekou[i].ext);
                        if(dytype&&dyjiekou[i].name&&dyjiekou[i].ext){
                            datalist.push({ "name": dyjiekou[i].name, "url": dyjiekou[i].ext, "ua":"MOBILE_UA", "type":dytype, "group": "TVBox订阅"})
                        }
                    }
                    if(dyjiekou[i].type==1&&dyjiekou[i].name&&dyjiekou[i].api){
                        datalist.push({ "name": dyjiekou[i].name, "url": dyjiekou[i].api, "ua":"MOBILE_UA", "type":"cms", "group": "TVBox订阅"})
                    }
                    if(/^csp_XBiubiu/.test(dyjiekou[i].api)){
                        try{
                            let urlfile = dyjiekou[i].ext;
                            if(/^clan:/.test(urlfile)){
                                urlfile = urlfile.replace("clan://TVBox/",TVBoxDY.match(/file.*\//)[0]);
                            }
                            if(/^http/.test(urlfile)){
                                var biuhtml = fetchCache(urlfile,48,{timeout:2000});
                            }else{
                                var biuhtml = fetch(urlfile);
                            }
                            biuhtml = biuhtml.replace(reg, function(word) { 
                                return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                            }).replace(/^.*#.*$/mg,"");
                            let biujson = JSON.parse(biuhtml);
                            let biudata = {};
                            biudata.url = biujson.url;
                            biudata.jiequshuzuqian = biujson.jiequshuzuqian;
                            biudata.jiequshuzuhou = biujson.jiequshuzuhou;
                            biudata.tupianqian = biujson.tupianqian;
                            biudata.tupianhou = biujson.tupianhou;
                            biudata.biaotiqian = biujson.biaotiqian;
                            biudata.biaotihou = biujson.biaotihou;
                            biudata.lianjieqian = biujson.lianjieqian;
                            biudata.lianjiehou = biujson.lianjiehou;
                            biudata.sousuoqian = biujson.sousuoqian;
                            biudata.sousuohou = biujson.sousuohou;
                            biudata.sousuohouzhui = biujson.sousuohouzhui;
                            biudata.ssmoshi = biujson.ssmoshi;
                            biudata.bfjiequshuzuqian = biujson.bfjiequshuzuqian;
                            biudata.bfjiequshuzuhou = biujson.bfjiequshuzuhou;
                            biudata.zhuangtaiqian = biujson.zhuangtaiqian;
                            biudata.zhuangtaihou = biujson.zhuangtaihou;
                            biudata.daoyanqian = biujson.daoyanqian;
                            biudata.daoyanhou = biujson.daoyanhou;
                            biudata.zhuyanqian = biujson.zhuyanqian;
                            biudata.zhuyanhou = biujson.zhuyanhou;
                            biudata.juqingqian = biujson.juqingqian;
                            biudata.juqinghou = biujson.juqinghou;
                            datalist.push({ "name": dyjiekou[i].name, "url": dyjiekou[i].key, "type": "biubiu", "ua": "PC_UA", "data": biudata, "group": "TVBox订阅"})
                        }catch(e){
                            //log(e.message)
                        }
                    }
                }
            }
        }catch(e){
            log(e.message)
        }
        hideLoading();
    }
    
    var count = datalist.length;

    var d = [];
    let grouplist = datalist.map((list)=>{
        return list.group||list.type;
    })
    //去重复
    function uniq(array){
        var temp = []; //一个新的临时数组
        for(var i = 0; i < array.length; i++){
            if(temp.indexOf(array[i]) == -1){
                temp.push(array[i]);
            }
        }
        return temp;
    }
    grouplist = uniq(grouplist);
    for(var i in grouplist){
        var lists = datalist.filter(item => {
            return item.group==grouplist[i] || item.type==grouplist[i];
        })
        let groupname = grouplist[i]+'('+lists.length+')';
        let groupmenu = getMyVar('groupmenu')?getMyVar('groupmenu').split(','):[];
        groupmenu.push(groupname);
        putMyVar('groupmenu',groupmenu.join(','));
        d.push({
            title: groupname,
            url: $('#noLoading#').lazyRule((bess,datalist,name,count,groupname)=>{
                    let groupmenu = getMyVar('groupmenu')?getMyVar('groupmenu').split(','):[];
                    for(let i in groupmenu){
                        if(groupmenu[i]==groupname){
                            updateItem(groupname,{title:'‘‘’’<span style="color:#f13b66a">'+groupmenu[i]})
                        }else{
                            updateItem(groupmenu[i],{title:groupmenu[i]})
                        }
                    }
                    if(getMyVar("starttask","0")=="1"){putMyVar("stoptask","1");}
                    let waittime = parseInt(getMyVar("xunmitimeout","5"))+1;
                    for (let i = 0; i < waittime; i++) {
                        if(getMyVar("starttask","0")=="0"){
                            break;
                        }
                        showLoading('等待上次线程结束，'+(waittime-i-1)+'s');
                        java.lang.Thread.sleep(1000);
                    }
                    hideLoading();
                    let beresults = [];
                    deleteItemByCls('xunmilist');
                    putMyVar("starttask","1");
                    bess(datalist,beresults,name,count);
                    return'hiker://empty';
                },bess,lists,name,lists.length,groupname),
            col_type: "scroll_button",
            extra: {
                id: groupname
            }
        });
    }
    d.push({
        title: count>0?'加载中...':'没有接口，无法搜索',
        url: "hiker://empty",
        col_type: "text_center_1",
        extra: {
            id: "loading"
        }
    });
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    });
    setHomeResult(d);

    var beresults = [];

    function bess(datalist,beresults,name,count) {
        var beerrors = [];
        var success = 0;
        var xunminum = parseInt(getMyVar("xunminum","10"));
        var xunmitimeout = parseInt(getMyVar("xunmitimeout","5"));
        var task = function(obj) {
            let url_api = obj.url;
            if (obj.type=="v1") {
                let date = new Date();
                let mm = date.getMonth()+1;
                let dd = date.getDate();
                let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
                var url = url_api + '/detail?&key='+key+'&vod_id=';
                var ssurl = url_api + '?ac=videolist&limit=10&wd='+name+'&key='+key;
                var lists = "html.data.list";
            } else if (obj.type=="app") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var lists = "html.list";
            } else if (obj.type=="v2") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var lists = "html.data";
            } else if (obj.type=="iptv") {
                var url = url_api + '?ac=detail&ids=';
                var ssurl = url_api + '?ac=list&zm='+name+'&wd='+name; 
                var lists = "html.data";
            } else if (obj.type=="cms") {
                var url = url_api + '?ac=detail&ids=';
                var ssurl = url_api + '?ac=videolist&wd='+name;
                var lists = "html.list";
            } else if (obj.type=="xpath"||obj.type=="biubiu") {
                var jsondata = obj.data;
            } else {
                log('api类型错误')
            }
            updateItem('loading', {
                title: beresults.length+'/'+count+'，加载中...',
                url: "hiker://empty",
                col_type: "text_center_1",
                extra: {
                    id: "loading"
                }
            });
            var urlua = obj.ua=="MOBILE_UA"?MOBILE_UA:obj.ua=="PC_UA"?PC_UA:obj.ua;
            if(/v1|app|iptv|v2|cms/.test(obj.type)){
                try {
                    var gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 });
                    if(!/{|}/.test(gethtml)&&gethtml!=""){
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
                    try{
                        var list = eval(lists)||html.list||html.data.list||html.data||[];
                    } catch (e) {
                        var list = html.list||html.data.list||html.data||[];
                    }
                    
                    if(list.length==0&&obj.type=="iptv"){
                        try {
                            ssurl = ssurl.replace('&zm='+name,'');
                            html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                            list = html.data||[];
                        } catch (e) {
                            list = [];
                        }
                    }
                    
                    if(obj.type=="cms"){
                        if((list.length>0&&list[0].vod_name.indexOf(name)==-1)||html.code=="0"){
                            try {
                                ssurl = ssurl.replace('videolist','list');
                                html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                                list = html.list||[];
                            } catch (e) {
                                list = [];
                            }
                        }
                    }
                    
                    if(list.length>0){
                        try {
                            let search = list.map((list)=>{
                                let vodname = list.vod_name||list.title;
                                if(vodname.indexOf(name)>-1){
                                    if(vodname!=name){vodname = vodname.replace(name,'‘‘’’<font color=red>'+name+'</font>')}
                                    let vodpic = list.vod_pic||list.pic;
                                    let voddesc = list.vod_remarks||list.state||"";
                                    let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>';
                                    let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                                    vodpic = vodpic?vodpic.replace('/img.php?url=','').replace('/tu.php?tu=','') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif";
                                    if(/^\/upload|^upload/.test(vodpic)){
                                        vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                                    }
                                    if(/^\/\//.test(vodpic)){
                                        vodpic = "https" + vodpic;
                                    }
                                    return {
                                        title: vodname,
                                        desc: voddesc + '\n\n' + appname + ' ('+obj.type+')'+(obj.group?' ['+obj.group+']':''),
                                        pic_url: vodpic,
                                        url: $("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                                require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
                                                xunmierji(type,ua)
                                            },obj.type, urlua),
                                        col_type: "movie_1_vertical_pic",
                                        extra: {
                                            pic: vodpic,
                                            name: vodname,
                                            title: vodname+'-'+obj.name,
                                            cls: 'xunmilist'
                                        }
                                    }
                                }
                            });
                            search = search.filter(n => n);
                            if(search.length>0){
                                return {result:1, apiurl:url_api, add:search};
                            }
                        } catch (e) {
                            log(obj.name+'>'+e.message);
                        }
                    }
                    return {result:0, url:ssurl, apiurl:url_api};
                } catch (e) {
                    //log(obj.name+'>'+e.message);
                    return {result:0, url:ssurl, apiurl:url_api};
                }
            }else if(obj.type=="xpath"||obj.type=="biubiu"){
                try {
                    if(obj.type=="xpath"){
                        var ssurl = jsondata.searchUrl.replace('{wd}',name);
                        if(jsondata.scVodNode=="json:list"){
                            var html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                            var list = html.list||[];
                        }else{
                            var sstype = ssurl.indexOf(';post')>-1?"post":"get";
                            if(sstype == "post"){
                                let ssstr = ssurl.replace(';post','').split('?');
                                var postcs = ssstr[ssstr.length-1];
                                if(ssstr.length>2){
                                    ssstr.length = ssstr.length-1;
                                }
                                ssurl = ssstr.join('?');
                                var html = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            }else{
                                var html = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 });
                            }
                            let title = xpathArray(html, jsondata.dtNode+jsondata.scVodNode+jsondata.scVodName);
                            let href = xpathArray(html, jsondata.dtNode+jsondata.scVodNode+jsondata.scVodId);
                            let img = xpathArray(html, jsondata.dtNode+jsondata.scVodNode+jsondata.scVodImg);
                            let mark = xpathArray(html, jsondata.dtNode+jsondata.scVodNode+jsondata.scVodMark)||"";
                            var list = [];
                            for(var j in title){
                                list.push({"id":href[j],"name":title[j],"pic":img[j],"desc":mark[j]})
                            }
                        }
                        var ssvodurl = `jsondata.dtUrl.replace('{vid}',list.id)`;
                    }else{
                        var ssurl = jsondata.url+jsondata.sousuoqian+name+jsondata.sousuohou;
                        if(jsondata.ssmoshi=="0"){
                            var html = JSON.parse(request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 }));
                            var list = html.list||[];
                        }else{
                            var sstype = ssurl.indexOf(';post')>-1?"post":"get";
                            if(sstype == "post"){
                                /*
                                let ssstr = ssurl.replace(';post','').split('?');
                                var postcs = ssstr[ssstr.length-1];
                                if(ssstr.length>2){
                                    ssstr.length = ssstr.length-1;
                                }
                               var html = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            */
                            }else{
                                var html = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000 });
                            }
                            let sslist = html.split(jsondata.jiequshuzuqian.replace(/\\/g,""));
                            sslist.splice(0,1);
                            var list = [];
                            for (let i = 0; i < sslist.length; i++) {
                                sslist[i] = sslist[i].split(jsondata.jiequshuzuhou.replace(/\\/g,""))[0];
                                let title = sslist[i].split(jsondata.biaotiqian.replace(/\\/g,""))[1].split(jsondata.biaotihou.replace(/\\/g,""))[0];
                                let href = sslist[i].split(jsondata.lianjieqian.replace(/\\/g,""))[1].split(jsondata.lianjiehou.replace(/\\/g,""))[0].replace('.html','').replace(jsondata.sousuohouzhui.replace(/\\/g,""),"");
                                let img = sslist[i].split(jsondata.tupianqian.replace(/\\/g,""))[1].split(jsondata.tupianhou.replace(/\\/g,""))[0];
                                let mark = "";
                                list.push({"id":href,"name":title,"pic":img,"desc":mark})
                            }
                            if(jsondata.sousuohouzhui=="/vod/"){jsondata.sousuohouzhui = "/index.php/vod/detail/id/"}
                        }
                        var ssvodurl = `jsondata.url+jsondata.sousuohouzhui+list.id+'.html'`;
                    }
                } catch (e) {
                    //log(obj.name+'>'+e.message);
                    var list = [];
                }
                if(list.length>0){
                    try {
                        let search = list.map((list)=>{
                            let vodname = list.name;
                            if(vodname.indexOf(name)>-1){
                                if(vodname!=name){vodname = vodname.replace(name,'‘‘’’<font color=red>'+name+'</font>')}
                                let vodpic = list.pic.replace('/tu.php?tu=','').replace('/img.php?url=','');
                                let voddesc = list.desc?list.desc:"";
                                let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>';
                                let vodurl = eval(ssvodurl);
                                if(/^\/upload|^upload/.test(vodpic)){
                                    vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                                }
                                if(/^\/\//.test(vodpic)){
                                    vodpic = "https" + vodpic;
                                }
                                return {
                                    title: vodname,
                                    desc: voddesc + '\n\n' + appname + ' ('+obj.type+')'+(obj.group?' ['+obj.group+']':''),
                                    pic_url: vodpic?vodpic + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif",
                                    url: $("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                            require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
                                            xunmierji(type,ua)
                                        },obj.type, urlua),
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        pic: vodpic,
                                        name: vodname,
                                        title: vodname+'-'+obj.name,
                                        data: jsondata,
                                        cls: 'xunmilist'
                                    }
                                }
                            }
                        });
                        search = search.filter(n => n);
                        if(search.length>0){
                            return {result:1, apiurl:url_api, add:search};
                        }
                    } catch (e) {
                        log(obj.name+'>'+e.message);
                    }
                }
                return {result:0, url:ssurl, apiurl:url_api};
            }else{

            }
        };

        let Jklist = datalist.map((parse)=>{
            return {
                func: task,
                param: {
                    name: parse.name,
                    url: parse.url,
                    ua: parse.ua,
                    type: parse.type,
                    group: parse.group||"",
                    data: parse.data||{}
                },
                id: parse.name
            }
        });
        
        be(Jklist, {
            func: function(obj, id, error, taskResult) {
                let i = taskResult.result;
                if(i==1){
                    success = success + i;
                    addItemBefore('loading', taskResult.add);
                }else{
                    obj.errors.push({name:id,url:taskResult.url,apiurl:taskResult.apiurl});
                }
                if(obj.results.indexOf(taskResult.apiurl)==-1){obj.results.push(taskResult.apiurl);}
                
                updateItem('loading', {
                    title: obj.results.length+'/'+count+'，加载中...',
                    url: "hiker://empty",
                    col_type: "text_center_1",
                    extra: {
                        id: "loading"
                    }
                });
                if(error){log(id+"-错误信息："+error);}
                if (success>=xunminum||obj.results.length==count||getMyVar("stoptask","0")=="1") {
                    //toast("我主动中断了");
                    //log("√线程中止");
                    putMyVar("starttask","0");
                    putMyVar("stoptask","0");
                    return "break";
                }
            },
            param: {
                results: beresults,
                errors: beerrors
            }
        });

        for (let k in beerrors) {
            addItemBefore('loading', {
                title: beerrors[k].name,
                desc: "加载失败，点击操作",
                url: $(["查看原网页","删除此接口"],2).select((name,url,api)=>{
                    if(input=="查看原网页"){
                        return url;
                    }else{
                        return $("确定删除接口："+name).confirm((dataurl)=>{
                            var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                            var datafile = fetch(filepath);
                            eval("var datalist=" + datafile+ ";");
                            for(var i=0;i<datalist.length;i++){
                                if(datalist[i].url==dataurl){
                                    datalist.splice(i,1);
                                    break;
                                }
                            }
                            writeFile(filepath, JSON.stringify(datalist));
                            deleteItem('xumi-'+dataurl);
                            return "toast://已删除";
                        }, api)
                    }
                }, beerrors[k].name, beerrors[k].url, beerrors[k].apiurl),
                col_type: "text_1",
                extra: {
                    id: 'xumi-'+beerrors[k].apiurl,
                    cls: 'xunmilist'
                }
            });
        }
        updateItem('loading', {
            title: beresults.length+'/'+count+',我是有底线的',
            url: beresults.length==count?"hiker://empty":$('#noLoading#').lazyRule((bess,datalist,beresults,name,count)=>{
                    for (let j = 0; j < beresults.length; j++) {
                        for(var i = 0; i < datalist.length; i++){
                            if(beresults[j] == datalist[i].url){
                                datalist.splice(i,1);
                                break;
                            }
                        }
                    }
                    //var arr3 = datalist.filter(list => !beresults.includes(list.url));
                    putMyVar("starttask","1");
                    bess(datalist,beresults,name,count);
                    return "hiker://empty";
                },bess,datalist,beresults,name,count),
            col_type: "text_center_1",
            extra: {
                id: "loading"
            }
        });
    }
    if(count>0){
        putMyVar("starttask","1");
        bess(datalist,beresults,name,count);
    }
}

function xunmierji(type,ua) {
    addListener("onClose", $.toString(() => {
        clearMyVar('parse_api');
        clearMyVar('moviedesc');
        clearMyVar('SrcM3U8');
        clearMyVar('linecode');
    }));

    var d = [];
    setPageTitle(MY_PARAMS.title);
    //加载本地自定义变量缓存文件
    var configfile = config.依赖.match(/https.*\//)[0] + 'srcconfig.js';
    require(configfile);

    //自动判断是否需要更新请求
    if (getMyVar('myurl', '0') != MY_URL || !configvar.详情1 || configvar.标识 != MY_URL) {
        if (/v1|app|v2|iptv|cms/.test(type)) {
            try{
                var html = JSON.parse(request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } }));
            } catch (e) {
                var html = "";
            }
        } else if (/xpath|biubiu/.test(type)) {
            try{
                var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } });
            } catch (e) {
                var html = "";
            }
            try{
                var cfgfile = "hiker://files/rules/Src/Juying/config.json";
                var Juyingcfg=fetch(cfgfile);
                if(Juyingcfg != ""){
                    eval("var JYconfig=" + Juyingcfg+ ";");
                }
                let iscachem3u8 = JYconfig.cachem3u8==0?0:1;
                putMyVar('SrcM3U8',iscachem3u8);
            }catch(e){}
        } else {
            //后续网页类
        }
        var zt = 1;
        putMyVar('myurl', MY_URL);
    } else {
        var zt = 0;
    }
    //影片详情
    if (zt == 1) {
        var dqnf = "";
        if (/v1|app|v2|cms/.test(type)) {
            if (/cms/.test(type)) {
                try{
                    var json = html.list[0];
                }catch(e){
                    var json = html.data.list[0];
                }
                
                var arts = json.vod_play_from.split('$$$');
                var conts = json.vod_play_url.split('$$$');
            }else{
                if($.type(html.data)=="array"){
                    var json = html.data[0];
                }else{
                    var json = html.data;
                }
                if(json&&json.vod_info){
                    json = json.vod_info;
                }
                var arts = json.vod_play_list || json.vod_url_with_player;
                var conts = arts;
            }
            var actor = json.vod_actor || "内详";
            var director = json.vod_director || "内详";
            var area = json.vod_area;
            var year = json.vod_year;
            var remarks = json.vod_remarks || "";
            var pubdate = json.vod_pubdate || json.vod_class || "";
            var pic = MY_PARAMS.pic || json.vod_pic;
            var desc = json.vod_blurb || '...';
            if(area){ dqnf = '\n地区：' + area}
            if(year){ dqnf = dqnf + '   年代：' + year}
        }else if (/iptv/.test(type)) {
            var actor = html.actor.join(",") || "内详";
            var director = html.director.join(",") || "内详";
            var area = html.area.join(",");
            var year = html.pubtime;
            var remarks = html.trunk || "";
            var pubdate = html.type.join(",") || "";
            var pic = MY_PARAMS.pic || html.img_url;
            var desc = html.intro || '...';
            var arts = html.videolist;
            var conts = arts;
            if(area){ dqnf = '\n地区：' + area}
            if(year){ dqnf = dqnf + '   年代：' + year}
        }else if (/xpath/.test(type)) {
            try{
                getsm = "获取传递数据";
                var jsondata = MY_PARAMS.data;
                getsm = "获取播放选集列表";
                var arts = xpathArray(html, jsondata.dtNode+jsondata.dtFromNode+jsondata.dtFromName);
                var conts = [];
                for (let i = 1; i < arts.length+1; i++) {
                    if(arts[i-1].indexOf("在线视频")>-1){arts[i-1] = '播放源'+i;}
                    let contname = xpathArray(html, jsondata.dtNode+jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+jsondata.dtUrlName);
                    let conturl = xpathArray(html, jsondata.dtNode+jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+jsondata.dtUrlId);
                    let cont = [];
                    for (let j = 0; j < contname.length; j++) {
                        let urlid = jsondata.dtUrlIdR;
                        if(urlid){
                            let urlidl = urlid.split('(\\S+)')[0];
                            let urlidr = urlid.split('(\\S+)')[1];
                            var playUrl = conturl[j].replace(urlidl,'').replace(urlidr,'');
                        }else{
                            var playUrl = conturl[j];
                        }
                        cont.push(contname[j]+"$"+jsondata.playUrl.replace('{playUrl}',playUrl))
                    }
                    conts.push(cont.join("#"))
                }
                getsm = "获取主演dtActor";
                var actor = String(xpathArray(html, jsondata.dtNode+jsondata.dtActor).join(',')).replace('主演：','').replace(jsondata.filter?eval(jsondata.filter):"","") || "内详";
                getsm = "获取导演dtDirector";
                var director = String(xpathArray(html, jsondata.dtNode+jsondata.dtDirector).join(',')).replace('导演：','').replace(jsondata.filter?eval(jsondata.filter):"","") || "内详";
                getsm = "获取地区dtArea";
                var area = String(xpath(html, jsondata.dtNode+jsondata.dtArea)).replace('地区：','').replace(jsondata.filter?eval(jsondata.filter):"","");
                getsm = "获取年份dtYear";
                var year = String(xpath(html, jsondata.dtNode+jsondata.dtYear)).replace('年份：','').replace(jsondata.filter?eval(jsondata.filter):"","");
                getsm = "获取类型dtCate";
                var remarks = String(xpath(html, jsondata.dtNode+jsondata.dtCate)).split(' / ')[0].replace(jsondata.filter?eval(jsondata.filter):"","") || "";
                getsm = "获取备份dtMark";
                var pubdate = String(xpath(html, jsondata.dtNode+jsondata.dtMark)) || "";
                var pic = MY_PARAMS.pic || xpath(html, jsondata.dtNode+jsondata.dtImg);
                getsm = "获取简介dtDesc";
                var desc = String(xpath(html, jsondata.dtNode+jsondata.dtDesc)).replace(jsondata.filter?eval(jsondata.filter):"","").replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”') || '...';
                if(area){ dqnf = '\n地区：' + area}
                if(year){ dqnf = dqnf + '   年代：' + year}
            }catch(e){
                var actor = actor||"抓取失败";
                var director = director||"";
                var area = area||"";
                var year = year||"";
                var remarks = remarks||"xpath数据异常";
                var pubdate = pubdate||"此接口需要修改，或删除";
                var pic = MY_PARAMS.pic;
                var desc = desc||'...';
                var arts = arts||[];
                var conts = conts||[];
                log(getsm+'失败>'+e.message)
            }    
        }else if (/biubiu/.test(type)) {
            var getsm = "";
            try{
                getsm = "获取传递数据";
                var jsondata = MY_PARAMS.data;
                getsm = "获取播放选集列表";
                let bflist = html.split(jsondata.bfjiequshuzuqian.replace(/\\/g,""));
                bflist.splice(0,1);
                var arts = [];
                var conts = [];
                for (let i = 0; i < bflist.length; i++) {
                    arts[i] = '播放源'+(i+1);
                    bflist[i] = bflist[i].split(jsondata.bfjiequshuzuhou.replace(/\\/g,""))[0];
                    let bfline = pdfa(bflist[i],"body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = pdfh(bfline[j],"a&&Text");
                        let conturl = pd(bfline[j],"a&&href");
                        cont.push(contname+"$"+conturl)
                    }
                    conts.push(cont.join("#"))
                }
                getsm = "获取主演zhuyanqian";
                var actor = pdfh(html.split(jsondata.zhuyanqian.replace(/\\/g,""))[1].split(jsondata.zhuyanhou.replace(/\\/g,""))[0],"Text") || "内详";
                getsm = "获取导演daoyanqian";
                var director = pdfh(html.split(jsondata.daoyanqian.replace(/\\/g,""))[1].split(jsondata.daoyanhou.replace(/\\/g,""))[0],"Text") || "内详";
                getsm = "获取备注zhuangtaiqian";
                var remarks = pdfh(html.split(jsondata.zhuangtaiqian.replace(/\\/g,""))[1].split(jsondata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[0] || "内详";
                getsm = "获取更新zhuangtaiqian";
                var pubdate = pdfh(html.split(jsondata.zhuangtaiqian.replace(/\\/g,""))[1].split(jsondata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[1] || "内详";
                var pic = MY_PARAMS.pic || "";
                getsm = "获取剧情简介juqingqian";
                var desc = pdfh(html.split(jsondata.juqingqian.replace(/\\/g,""))[1].split(jsondata.juqinghou.replace(/\\/g,""))[0],"Text") || '...';
                getsm = "获取播放地址数组bfjiequshuzuqian";
            }catch(e){
                var actor = actor||"抓取失败";
                var director = director||"";
                var remarks = remarks||"biubiu数据异常";
                var pubdate = pubdate||"此接口需要修改，或删除";
                var pic = MY_PARAMS.pic;
                var desc = desc||'...';
                var arts = arts||[];
                var conts = conts||[];
                log(getsm+'失败>'+e.message)
            }    
        }else{
            //网页
        }
        var details1 = '导演：' + director.substring(0, director.length<12?director.length:12) + '\n主演：' + actor.substring(0, actor.length<12||dqnf==""?actor.length:12) + dqnf;
        var details2 = remarks + '\n' + pubdate;
        var newconfig = { 详情1: details1, 详情2: details2, 图片: pic, 简介: desc, 线路: arts, 影片: conts, 标识: MY_URL };
        var libsfile = 'hiker://files/libs/' + md5(configfile) + '.js';
        writeFile(libsfile, 'var configvar = ' + JSON.stringify(newconfig));
    } else {
        var details1 = configvar.详情1;
        var details2 = configvar.详情2;
        var pic = configvar.图片;
        var desc = configvar.简介;
        var arts = configvar.线路;
        var conts = configvar.影片;
    }
    d.push({
        title: details1,//详情1
        desc: details2,//详情2
        pic_url: pic + '@Referer=',//图片
        url: pic + '#noHistory#',//链接
        col_type: 'movie_1_vertical_pic_blur',
        extra: {
            gradient: true
        }
    });

    //二级统一菜单
    require(config.依赖.match(/https.*\//)[0] + 'SrcJyMenu.js');
    putMyVar('moviedesc',desc)
    for(var i in erjimenu){
        d.push(
            erjimenu[i]
        )
    }
    var parse_api = "";
    var tabs = [];
    var linecodes = [];
    for (var i in arts) {
        if (/v1|app|v2/.test(type)) {
            let line = arts[i].name || arts[i].player_info.show;
            tabs.push(line);
            var linecode = arts[i].code || arts[i].player_info.from;

            if (getMyVar(MY_URL, '0') == i) {
                try {
                    if(type=="v2"){
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
        }else if (/iptv/.test(type)) {
            let line = i;
            tabs.push(line);
            var linecode = i;
        }else if (/cms|xpath|biubiu/.test(type)) {
            tabs.push(arts[i]);
            var linecode = arts[i];
        }else{
            var linecode = "";
            //网页
        }
        linecodes.push(linecode);
    }

    var lists = [];
    for (var i in conts) {
        if (/v1|app|v2/.test(type)) {
            if(conts[i].url){
                let single = conts[i].url||"";
                if(single){lists.push(single.split('#'))};
            }else{
                let single = conts[i].urls||[];
                if(single.length>0){
                    var si = [];
                    for (let j = 0; j < single.length; j++) {
                        si.push(single[j].name+"$"+single[j].url);
                    }
                    lists.push(si);
                };
            }
        }else if (/iptv/.test(type)) {
            let single = conts[i]||[];
            if(single.length>0){
                var si = [];
                for (let j = 0; j < single.length; j++) {
                    si.push(single[j].title+"$"+single[j].url);
                }
                lists.push(si);
            };
        }else if (/cms|xpath|biubiu/.test(type)) {
            let single = conts[i]||"";
            if(single){lists.push(single.split('#'))};
        }else{
            //网页
        }
    }

    //取之前足迹记录，用于自动定位之前的线路
    try {
        eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
        if (SrcMark != "") {
            if (SrcMark.route[MY_URL] != undefined) {
                putMyVar(MY_URL, SrcMark.route[MY_URL]);
            }
        }
    } catch (e) { }
    var Marksum = 30;//设置记录线路足迹数量

    //线路部份
    var Color = "#f13b66a";
    var Color1 = "#098AC1";
    function getHead(title) {
        return '‘‘’’<strong><font color="' + Color + '">' + title + '</front></strong>';
    }
    for (let i = 0; i < 9; i++) {
        d.push({
            col_type: "blank_block"
        })
    }

    function setTabs(tabs, vari) {
        d.push({
            title: getMyVar('shsort') == '1'?'““””<b><span style="color: #FF0000">∨</span></b>' : '““””<b><span style="color: #1aad19">∧</span></b>',
            url: $("#noLoading#").lazyRule(() => {
                if (getMyVar('shsort') == '1') { putMyVar('shsort', '0'); } else { putMyVar('shsort', '1') };
                refreshPage(false);
                return 'toast://切换排序成功'
            }),
            col_type: 'scroll_button'
        })
        for (var i in tabs) {
            if (tabs[i] != "") {
                if(getMyVar(vari, '0') == i){putMyVar('linecode', linecodes[i])};
                d.push({
                    title: getMyVar(vari, '0') == i ? getHead(tabs[i] + '↓') : tabs[i],
                    url: $("#noLoading#").lazyRule((vari, i, Marksum) => {
                        if (parseInt(getMyVar(vari, '0')) != i) {
                            try {
                                eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
                            } catch (e) {
                                var SrcMark = "";
                            }
                            if (SrcMark == "") {
                                SrcMark = { route: {} };
                            } else if (SrcMark.route == undefined) {
                                SrcMark.route = {};
                            }
                            SrcMark.route[vari] = i;
                            var key = 0;
                            var one = "";
                            for (var k in SrcMark.route) {
                                key++;
                                if (key == 1) { one = k }
                            }
                            if (key > Marksum) { delete SrcMark.route[one]; }
                            writeFile("hiker://files/cache/SrcMark.json", JSON.stringify(SrcMark));
                            putMyVar(vari, i);
                            refreshPage(false);
                            return 'toast://切换成功'
                        } else {
                            return '#noHistory#hiker://empty'
                        }
                    }, vari, i, Marksum),
                    col_type: 'scroll_button'
                })
            }
        }
    }
    setTabs(tabs, MY_URL);

    //选集部份
    function setLists(lists, index) {
        var list = lists[index];
        function playlist(lx, len) {//定义选集列表生成
            if (lx == '1') {
                if (/v1|app|v2|iptv|cms/.test(type)) {
                    var playtitle = list[j].split('$')[0];
                    if (/iptv/.test(type)) {
                        var playurl = list[j].split('$')[1].split('url=')[1];
                        parse_api = list[j].split('$')[1].split('url=')[0]+"url=";
                    }else{
                        var playurl = list[j].split('$')[1];
                    }
                    putMyVar('parse_api', parse_api);
                    var DTJX = $("").lazyRule(() => {
                        require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(input);
                    });
                }else if (/xpath|biubiu/.test(type)) {
                    var playtitle = list[j].split('$')[0];
                    var playurl = list[j].split('$')[1];
                    var DTJX = $("").lazyRule(() => {
                        require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.嗅探(input);
                    });
                }else{
                    //网页
                }
                setLastChapterRule('js:' + $.toString(param=>{ setResult('更新至：'+param) }, list[list.length-1].split('$')[0]))
                d.push({
                    title: playtitle.replace(/第|集|话|期|-/g, ''),
                    url: playurl + DTJX,
                    extra: { id: playurl, referer: playurl, jsLoadingInject: true, blockRules: ['.m4a','.mp3','.mp4','.flv','.avi','.mpeg','.wmv','.mov','.rmvb','.gif','.jpg','.jpeg','.png','hm.baidu.com','/ads/*.js','cnzz.com','.css'] },
                    col_type: list.length > 4 && len < 7 ? 'text_4' : 'text_3'
                });
            } else {
                d.push({
                    title: '当前无播放选集，点更多片源试试！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                });
            }

        }
        if (list == undefined || list.length == 0) {
            playlist('0');
        } else {
            if (/v1|app|v2|iptv|xpath|biubiu/.test(type)) {
                var listone = list[0].split('$')[0];
                try{
                    let list1 = list[0].split('$')[0];
                    let list2 = list[list.length-1].split('$')[0];
                    if(parseInt(list1.match(/(\d+)/)[0])>parseInt(list2.match(/(\d+)/)[0])){
                        list.reverse();
                    }
                }catch(e){
                    //log('修正选集顺序失败>'+e.message)
                }
            }else{
                //cms
            }
            
            if (listone) {
                var len = listone.length;
            }
            if (getMyVar('shsort') == '1') {
                try {
                    for (var j = list.length - 1; j >= 0; j--) {
                        playlist('1', len);
                    }
                } catch (e) {
                    playlist('0');
                }
            } else {
                try {
                    for (var j = 0; j < list.length; j++) {
                        playlist('1', len);
                    }
                } catch (e) {
                    playlist('0');
                }

            }
        }
    }
    setLists(lists, getMyVar(MY_URL, '0'));
    //底部说明
    d.push({
        desc: '‘‘’’<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1'
    });
    setResult(d);
}