//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
//寻觅片源
function xunmi(name,data,ishkss) {
    name = name.replace(/全集.*|国语.*|粤语.*/g,'');//|\s
    setPageTitle('聚搜>'+name);
    addListener("onClose", $.toString(() => {
        clearMyVar('xunminum');
        clearMyVar('xunmitimeout');
        clearMyVar('failnum');
        clearMyVar('starttask');
        clearMyVar('stoptask');
        clearMyVar('groupmenu');
        clearMyVar('selectgroup');
        clearMyVar('baoliujk');
        clearMyVar('SrcJy$back');
        clearMyVar('deleteswitch');
        putMyVar('closexunmi','1');
    }));
    clearMyVar('closexunmi');
    putMyVar('SrcJy$back','1');
    try{
        var cfgfile = "hiker://files/rules/Src/Juying/config.json";
        var Juyingcfg=fetch(cfgfile);
        if(Juyingcfg != ""){
            eval("var JYconfig=" + Juyingcfg+ ";");
            putMyVar('xunminum',JYconfig['xunminum']?JYconfig['xunminum']:"10");
            putMyVar('xunmitimeout',JYconfig['xunmitimeout']?JYconfig['xunmitimeout']:"5");
            putMyVar('failnum',JYconfig['failnum']?JYconfig['failnum']:"10");
        }
        var xunmigroup = JYconfig.xunmigroup&&JYconfig.xunmigroup!="全部"?JYconfig.xunmigroup:"";
    }catch(e){}
    if(ishkss&&parseInt(getMyVar('xunminum'))>30){
        putMyVar('xunminum',"20");
    }
    if(data){
        var datalist = data;
    }else{
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            try{
                eval("var datalist=" + datafile+ ";");
            }catch(e){
                var datalist = [];
            }
        }else{
            var datalist = [];
        }
        try{
            if(JYconfig.TVBoxDY){
                let TVBoxTmpfile = "hiker://files/rules/Src/Juying/DYTVBoxTmp.json";
                let DYTVBoxTmp = fetch(TVBoxTmpfile);
                if(DYTVBoxTmp != ""){
                    eval("var dydatas=" + DYTVBoxTmp+ ";");
                }else{
                    var dydatas = {};
                }
                let nowtime = Date.now();
                let oldtime = parseInt(getItem('DYTVBoxChecktime','0').replace('time',''));
                if((nowtime < (oldtime+12*60*60*1000)) && dydatas.jiekou){
                    var DYdatalist = dydatas.jiekou||[];
                }else{
                    var DYdatalist = [];
                    let TVBoxDY = JYconfig.TVBoxDY;
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    dydatas = Resourceimport(TVBoxDY,'1',{is:1,sl:datalist.length});
                    DYdatalist = dydatas.jiekou;
                    writeFile(TVBoxTmpfile, JSON.stringify(dydatas));
                    setItem('DYTVBoxChecktime',nowtime+"time");
                }    
                for(let i=0;i<DYdatalist.length;i++){
                    if(!datalist.some(item => item.url==DYdatalist[i].url)){
                        datalist.push(DYdatalist[i]);
                    }
                }
            }
        }catch(e){
            log('TVBox订阅失败>'+e.message)
        }
        hideLoading();
    }
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

    let grouparr = storage0.getItem('grouparr')||[];
    grouparr = grouparr.filter((item1) => grouplist.some((item2) => item1 === item2)).concat(grouplist);
    grouplist = uniq(grouparr);
    storage0.setItem('grouparr',grouplist);

    if(xunmigroup&&grouplist.indexOf(xunmigroup)>-1&&grouplist.indexOf(xunmigroup)!=0){
        for (var i = 0; i < grouplist.length; i++) {
            if (grouplist[i] == xunmigroup) {
                grouplist.splice(i, 1);
                break;
            }
        }
        grouplist.unshift(xunmigroup);
    }
    if(grouplist.indexOf('失败待处理')!=-1&&grouplist.indexOf('失败待处理')!=grouplist.length-1){
        for (var i = 0; i < grouplist.length; i++) {
            if (grouplist[i] == '失败待处理') {
                grouplist.splice(i, 1);
                break;
            }
        }
        grouplist.push('失败待处理');
    }
    var datalist2 = [];
    for(var i in grouplist){
        var lists = datalist.filter(item => {
            return item.group==grouplist[i] || !item.group&&item.type==grouplist[i];
        })
        if(grouplist[i]==xunmigroup){datalist2 = lists;}
        if(!ishkss){//海阔软件搜索时隐藏分组
            let groupname = grouplist[i]+'('+lists.length+')';
            let groupmenu = getMyVar('groupmenu')?getMyVar('groupmenu').split(','):[];
            groupmenu.push(groupname);
            putMyVar('groupmenu',groupmenu.join(','));
            d.push({
                title: grouplist[i]==xunmigroup?'‘‘’’<b><span style="color:#3399cc">'+groupname:groupname,
                url: $('#noLoading#').lazyRule((bess,datalist,name,count,groupname,ishkss)=>{
                    let groupmenu = getMyVar('groupmenu')?getMyVar('groupmenu').split(','):[];
                    for(let i in groupmenu){
                        if(groupmenu[i]==groupname){
                            putMyVar("selectgroup",groupname);
                            updateItem(groupname,{title:'‘‘’’<b><span style="color:#3399cc">'+groupmenu[i]})
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
                    let beerrors = [];
                    deleteItemByCls('xunmilist');
                    putMyVar("starttask","1");
                    bess(datalist,beresults,beerrors,name,count,ishkss);
                    return'hiker://empty';
                },bess,lists,name,lists.length,groupname,ishkss),
                col_type: "scroll_button",
                extra: {
                    id: groupname,
                    cls: 'groupname'
                }
            });
        }
    }
    
    if(!ishkss&&getMyVar('isload', '0')=="0"){
        if(datalist.length>0){
            d.push({
                title: '删除开关',
                url: $('#noLoading#').lazyRule(()=>{
                    if(getMyVar('deleteswitch')){
                        clearMyVar('deleteswitch');
                        updateItem('deleteswitch',{title:'删除开关'});
                        return 'toast://退出处理模式，撤销二级删除开关';
                    }else{
                        putMyVar('deleteswitch','1');
                        updateItem('deleteswitch',{title:'‘‘’’<b><span style="color:#3CB371">删除开关'});
                        return 'toast://进入处理模式，点击影片详情确认是否删除';
                    }
                }),
                col_type: "scroll_button",
                extra: {
                    id: 'deleteswitch'
                }
            });
        }
    }
    d.push({
        title: '没有接口？无法搜索',
        url: "hiker://empty",
        col_type: "text_center_1",
        extra: {
            id: "loading"
        }
    });
    if(!ishkss){
        d.push({
            title: '<br>',
            col_type: 'rich_text'
        });
    }
    setHomeResult(d);
    
    if(datalist2.length>0){
        datalist = datalist2;
    }else{
        datalist = datalist.sort((a,b)=>{
            let agroup = a.group||a.type;
            let bgroup = b.group||b.type;
            return grouparr.indexOf(agroup)-grouparr.indexOf(bgroup)
        });
    }

    if(getMyVar('selectgroup','a').indexOf('失败待处理')==-1&&xunmigroup!="失败待处理"&&grouplist.length>1){
        for(let i=0;i<datalist.length;i++){
            if(datalist[i].group=="失败待处理"){
                datalist.splice(i,1);
                i = i - 1;
            }
        }
    }

    var count = datalist.length;
    var beresults = [];
    var beerrors = [];
    function bess(datalist,beresults,beerrors,name,count,ishkss) {
        var sccesslist = [];
        var errorlist = [];
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
                var listcode = "html.data.list";
            } else if (obj.type=="app") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var listcode = "html.list";
            } else if (obj.type=="v2") {
                var url = url_api + 'video_detail?id=';
                var ssurl = url_api + 'search?limit=10&text='+name;
                var listcode = "html.data";
            } else if (obj.type=="iptv") {
                var url = url_api + '?ac=detail&ids=';
                var ssurl = url_api + '?ac=list&zm='+name+'&wd='+name; 
                var listcode = "html.data";
            } else if (obj.type=="cms") {
                var url = url_api + '?ac=videolist&ids=';
                var ssurl = url_api + '?ac=videolist&wd='+name;
                var listcode = "html.list";
            } else if (obj.type=="xpath"||obj.type=="biubiu"||obj.type=="XBPQ"||obj.type=="custom") {
                var jsondata = obj.data;
            } else {
                log('api类型错误')
            }
            let successnum = beresults.length-beerrors.length;
            updateItem('loading', {
                title: (successnum<0?0:successnum)+'/'+beerrors.length+'/'+count+'，加载中...',
                url: "hiker://empty",
                col_type: "text_center_1",
                extra: {
                    id: "loading"
                }
            });
            var geterror = 0;
            var urlua = obj.ua=="MOBILE_UA"?MOBILE_UA:obj.ua=="PC_UA"?PC_UA:obj.ua;
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
                        html = fetchCodeByWebView(ssurl, { headers: headers, 'blockRules': ['.png', '.jpg'], timeout:timeout});
                        html = pdfh(html,'body&&pre&&Text');
                    }else if (/系统安全验证/.test(html)) {
                        log(obj.name+'>'+ssurl+'>页面有验证码拦截');
                        //过数字验证
                        //let yzcode = 'TloGnnikThrfs/5fDNlk5CSsbaGtAH7W/uMZjuYoIupB6bCoo9CotLQHfPIdGgbkbynKqL2aUE2Xy558X2QxHYtTU09vD+4oaCDIuSZO7nxDbLfRGfWj7zql+yMbvF+aJoD/m6Psfw/PyYOAp/ZVGdrPzaCByfd0HL5DFVSw+YF2OC40V8SP9RxdFKKdrBuPxCWdxUCFrJ+1lRy/TU3LC84C4xxEBhgud7RtBp0zZArqBE06+Z3JtDP0eFCz/D5X0409qPHK3e1y/LuUgccuxpHnjYLE1GjlP8wYA2hQWe7yPngggQBHw33/gvb3tuCcxEKTWgmah/R32AH9ZF8jF7WemT26lUizVXe/spCdhDgHR/zUhODD4PO6glI8JPhdu+VwfPyRLG2D7CUo1L6SIF+0fYf0oTOWN13UPITo5+uZd/WnQQLU8NYx/WFCThEnkbzln9YGt60fRxsH+8uMDFgaBiC+z2SpcxB9gZ6GXypLSXWaj+qEUbGJKEx+jK/v5fnrkIhCdwNbkp9dRks6dmlYlBifzoWF8RkuC3rqPtoScBkMOMZu7GiVtoHEdHUozmnUIdrU1LGIqq9WnG7X2a3yH8s65mjLuLnd3q0U8v+LMPnHL2/GjQuTQKVh+RKEPqK/JdrChGLNrjcHvLHDbHEshrGZuQOdEphbx/PkhkvaYy4K1MO84R17guRsKs/V6niUPaL+XbQ7c3fqJS4VHJwludJTDe02euffGCm0PJIPlAOgLHnX0izJhA6q738R2UwQcWBQjJt79aF+kyqSdyt1QPVQVjaC3IpRf7PgsDhEJ7bi9nSclyIzgJ9DCJ4T+8dG1xHhKyZasT7L/x9Lfr1Mgs8nBZER2W9ax7iTkNK+X5ACU//p/YoP/uAanDtb3D0iKUUuXFH+Jbb0x1P322S2w6BJ46nuNHBMHTpVuWwhZeZzriGh7qoOywLWiExBMKyxTGLnmKh7r03/yXKYWIJnpBN2MMycVHRZJ7RumHV4CIsVrq7iRP48823RJVt9OtyP7uuc3wBBV3kcZUzbbaYdWBx1+Au+Od2u7lR6joOL810mcJm/f7J5TvGQP6HGph1YHHX4C7453a7uVHqOgyjjh5EBd720MEBY23c+TKq/z9UpWDDOg48ZFnwSIhFqitWdiZiqsaYuN0/SXwiK8EG9eQ29u2XDJoDW4mlwtcRO7vaX5XcFsgf4/mLU07mi';
                        let yzcode = 'dMAn/3+9sBWBVMBCED49UnozR961HpaReX33gCVLfBXnJf+FGKd434r4HqKfMxZN0Z6HREaLfn67g9VxwE3qc403Uso103K1/yY1WzkViXvMxO4ZgCKpPmOsK/ciuYJx7tLIZt3XVyxy7W/0gkVNvgxMUJIEkNla1KYdgdUV2Ym+E5mD7GTIDBIJD6uGlUJSJZA8mSqXotk4WX2qHpPo08SXC+xnAbmb1UvhkoFpbEH44hAK8LWLS556cyImIGc69Z3Gt/5fyYMHNi18A5zTEDTECtRodhBmTyM+TIrshx9VTYwkV8xTJ34XS7uxRQnIuezB7D57W/Ie8Pap73VcJAgV+za2+N0JRen9gQc4EtLGKjDeylDCoptPLzYwI1gOvLFowwK3KPH3ujvH+WfNVU/ADFaxLZ8PFVO1rzTtSuklWpt32bT/Z1ZTgqGQPaS+DpB3haYJZMn6BGxmzXxDrrWce3a4gHIsofT30ylQR4c=';
                        evalPrivateJS(yzcode);
                        let www = ssurl.split('/');
                        let home = www[0]+'//'+www[2];
                        let codeurl = home+(ssurl.indexOf('search-pg-1-wd-')>-1?'/inc/common/code.php?a=search':'/index.php/verify/index.html?');
                        let cook = fetchCookie(codeurl, {headers: headers});
                        headers.Cookie = JSON.parse(cook||'[]').join(';');
                        //let vcode = JSON.parse(getVCode2(codeurl, JSON.stringify(headers), 'num')).ret;
                        let vcode = SrcVerify.ocr(codeurl);
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
            if(/v1|app|iptv|v2|cms/.test(obj.type)){
                try {
                    gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                    if(/cms/.test(obj.type)){
                        if(gethtml&&gethtml.indexOf(name)==-1){
                            gethtml = getHtmlCode(ssurl.replace('videolist','list'),urlua,xunmitimeout*1000);
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
                            var html = {"list":xmllist};
                        }else{
                            var html = JSON.parse(gethtml);
                        }
                    }else if(!/{|}/.test(gethtml)&&gethtml!=""){
                        let decfile = "hiker://files/rules/Src/Juying/appdec.js";
                        let Juyingdec=fetch(decfile);
                        if(Juyingdec != ""){
                            eval(Juyingdec);
                            var html = JSON.parse(xgdec(gethtml));
                        }
                    }else{
                        var html = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''));
                    }
                } catch (e) {
                    var html = { data: [] };
                    if(gethtml){geterror = 1;}
                    //log(1);//log(obj.name+'>'+e.message);
                }
                try{
                    try{
                        lists = eval(listcode)||html.list||html.data.list||html.data||[];
                    } catch (e) {
                        lists = html.list||html.data.list||html.data||[];
                    }
                    
                    if(lists.length==0&&obj.type=="iptv"){
                        ssurl = ssurl.replace('&zm='+name,'');
                        html = JSON.parse(getHtmlCode(ssurl,urlua,xunmitimeout*1000));
                        lists = html.data||[];
                    }
                    lists = lists.map(list=>{
                    let vodname = list.vod_name||list.title;
                        if(vodname.indexOf(name)>-1){
                            let vodpic = list.vod_pic||list.pic||"";
                            let voddesc = list.vod_remarks||list.state||"";
                            let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                            return {
                                vodname: vodname,
                                vodpic: vodpic.indexOf('ver.txt')>-1?"":vodpic,
                                voddesc: voddesc,
                                vodurl: vodurl
                            }
                        }
                    })
                } catch (e) {
                    //log(2);//log(obj.name+'>'+e.message);
                    geterror = 1;
                }
            }else if(obj.type=="xpath"||obj.type=="biubiu"){
                try {
                    if(obj.type=="xpath"){
                        var ssurl = jsondata.searchUrl.replace('{wd}',name);
                        if(jsondata.scVodNode=="json:list"){
                            gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            let html = JSON.parse(gethtml);
                            lists = html.list||[];
                            lists.forEach(item => {
                                if(jsondata.scVodId){
                                    item.id = item[jsondata.scVodId];
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
                                gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            }else{
                                gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            }
                            let title = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodName);
                            let href = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodId);
                            let img = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodImg);
                            let mark = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodMark)||"";
                            for(let j in title){
                                lists.push({"id":/^http/.test(href[j])||/\{vid}$/.test(jsondata.dtUrl)?href[j]:href[j].replace(/\/.*?\/|\.html/g,''),"name":title[j],"pic":img[j],"desc":mark[j]})
                            }
                        }
                        var ssvodurl = `jsondata.dtUrl.replace('{vid}', list.id)`;
                    }else{
                        var ssurl = jsondata.url+jsondata.sousuoqian+name+jsondata.sousuohou;
                        if(jsondata.ssmoshi=="0"){
                            gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
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
                                var gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            */
                            }else{
                                gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            }
                            let sslist = gethtml.split(jsondata.jiequshuzuqian.replace(/\\/g,""));
                            sslist.splice(0,1);
                            for (let i = 0; i < sslist.length; i++) {
                                sslist[i] = sslist[i].split(jsondata.jiequshuzuhou.replace(/\\/g,""))[0];
                                let title = sslist[i].split(jsondata.biaotiqian.replace(/\\/g,""))[1].split(jsondata.biaotihou.replace(/\\/g,""))[0];
                                let href = sslist[i].split(jsondata.lianjieqian.replace(/\\/g,""))[1].split(jsondata.lianjiehou.replace(/\\/g,""))[0].replace('.html','').replace(jsondata.sousuohouzhui.replace(/\\/g,""),"");
                                let img = sslist[i].split(jsondata.tupianqian.replace(/\\/g,""))[1].split(jsondata.tupianhou.replace(/\\/g,""))[0];
                                let mark = "";
                                lists.push({"id":href,"name":title,"pic":img,"desc":mark})
                            }
                            if(jsondata.sousuohouzhui=="/vod/"){jsondata.sousuohouzhui = "/index.php/vod/detail/id/"}
                        }
                        var ssvodurl = `jsondata.url+jsondata.sousuohouzhui+list.id+'.html'`;
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
                    geterror = 1;
                }
            }else if(obj.type=="custom"){
                try{
                    let jkfile = fetchCache(jsondata.ext,72);
                    if(jkfile){
                        eval(jkfile);
                        lists = customparse[url_api](name);
                    }
                }catch(e){
                    log(e.message);
                }
            }else if(obj.type=="XBPQ"){
                try{
                    let jkfile = fetchCache(jsondata.ext,72);
                    if(jkfile){
                        eval("var jkdata = " + jkfile);
                        jkdata["搜索url"] = jkdata["搜索url"] || "/index.php/ajax/suggest?mid=1&wd={wd}&limit=500";
                        var ssurl = jkdata["搜索url"].replace('{wd}',name).replace('{pg}','1');
                        ssurl = /^http/.test(ssurl)?ssurl:jkdata["主页url"]+ssurl;
                        if(jkdata["搜索模式"]=="0"&&jkdata["搜索后缀"]){
                            gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            let html = JSON.parse(gethtml);
                            lists = html.list||[];
                            var ssvodurl = `jkdata["主页url"] + jkdata["搜索后缀"] + list.id + '.html'`;
                        }else{
                            let sstype = ssurl.indexOf(';post')>-1?"post":"get";
                            if(sstype == "post"){
                                let postcs = ssurl.split(';')[2];
                                ssurl = ssurl.split(';')[0];
                                gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            }else{
                                gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            }
                            let sslist = gethtml.match(new RegExp(jkdata["搜索数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                            for (let i = 0; i < sslist.length; i++) {
                                let title = sslist[i].split(jkdata["搜索标题"].split('&&')[0])[1].split(jkdata["搜索标题"].split('&&')[1])[0];
                                let href = sslist[i].split(jkdata["搜索链接"].split('&&')[0])[1].split(jkdata["搜索链接"].split('&&')[1])[0];
                                let img = sslist[i].split(jkdata["搜索图片"].split('&&')[0])[1].split(jkdata["搜索图片"].split('&&')[1])[0];
                                let mark = sslist[i].split(jkdata["搜索副标题"].split('&&')[0])[1].split(jkdata["搜索副标题"].split('&&')[1])[0];
                                lists.push({"id":/^http/.test(href)?href:jkdata["主页url"]+href,"name":title,"pic":img,"desc":mark})
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
                    }else{
                        lists = [];
                    }
                }catch(e){
                    log(e.message);
                }
            }

            if(lists.length>0){
                try {
                    let search = lists.map((list)=>{
                        if(list){
                            let vodname = list.vodname
                            let vodpic = list.vodpic?list.vodpic.replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g,'') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif@Referer=";
                            let voddesc = list.voddesc;
                            let appname = '‘‘’’<font color=#f13b66a>聚影√ · '+obj.name+'</font>'+' ('+obj.type+')'+(obj.group&&obj.group!=obj.type?' ['+obj.group+']':'');
                            let vodurl = list.vodurl;
                            if(/^\/\//.test(vodpic)){
                                vodpic = "https:" + vodpic;
                            }   
                            if(/^\/upload|^upload/.test(vodpic)){
                                vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                            }
                            let searchMode = typeof(getSearchMode)!="undefined"?getSearchMode()||0:0;
                            let searchIncludes = typeof(searchContains) =="undefined" ? vodname.indexOf(name)>-1?1:0 :searchContains(vodname,name,true);
                            if((searchMode==1&&vodname==name)||(searchMode==0&&searchIncludes)) {
                                return {
                                    title: !ishkss?vodname!=name?vodname.replace(name,'‘‘’’<font color=red>'+name+'</font>'):'‘‘’’<font color=red>'+vodname+'</font>':vodname,
                                    desc: !ishkss?(voddesc + '\n\n' + appname):'聚影√ · '+obj.name+' ('+obj.type+')'+(obj.group&&obj.group!=obj.type?' ['+obj.group+']':''),
                                    content: voddesc,
                                    pic_url: vodpic,
                                    url: $("hiker://empty##" + vodurl + "#immersiveTheme#"+(getMyVar('debug','0')=="0"?"#autoCache#":"")).rule((type,ua) => {
                                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                            xunmierji(type,ua)
                                        },obj.type, urlua),
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        id: 'xumi-'+url_api,
                                        pic: vodpic,
                                        name: vodname,
                                        title: vodname+'-'+obj.name,
                                        data: typeof(jsondata) =="undefined"|| jsondata ==null?{}:jsondata,
                                        cls: 'xunmilist'
                                    }
                                }
                            }   
                        }
                    });
                    search = search.filter(n => n);
                    if(search.length>0){
                        return {result:1, apiurl:url_api, add:search};
                    }
                } catch (e) {
                    //log(4);//log(obj.name+'>'+e.message);
                    geterror = 1;
                }
            }
            return {result:0, url:ssurl, apiurl:url_api, error:geterror};
        };

        let bedatalist = datalist.slice(0,xunminum);
        let Jklist = bedatalist.map((parse)=>{
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
                    if(getMyVar('selectgroup','a').indexOf('失败待处理')>-1){sccesslist.push(taskResult.apiurl);}
                }else{
                    errorlist.push({name:id,url:taskResult.url,apiurl:taskResult.apiurl,error:taskResult.error});
                    if(!ishkss){obj.errors.push({name:id,url:taskResult.url,apiurl:taskResult.apiurl,error:taskResult.error});}
                }
                if(obj.results.indexOf(taskResult.apiurl)==-1){obj.results.push(taskResult.apiurl);}
                let successnum = obj.results.length-obj.errors.length;
                updateItem('loading', {
                    title: ishkss?(successnum<0?0:successnum)+'/'+count+'，加载中...':(successnum<0?0:successnum)+'/'+obj.errors.length+'/'+count+'，加载中...',
                    url: "hiker://empty",
                    col_type: "text_center_1",
                    extra: {
                        id: "loading"
                    }
                });
                if(error){log(id+"-错误信息："+error);}
                if (success>=xunminum||obj.results.length==count||getMyVar("stoptask","0")=="1"||getMyVar('closexunmi')=="1") {
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
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        var datafile = fetch(filepath);
        eval("var jiekoulist=" + datafile+ ";");
        let tzgroup = 0;
        
        for(let i=0;i<jiekoulist.length;i++){
            for (let k=0;k<errorlist.length;k++) {
                if(jiekoulist[i].url==errorlist[k].apiurl){
                    jiekoulist[i].failnum = jiekoulist[i].failnum + 1 || 1;
                    if(errorlist[k].error==1&&jiekoulist[i].failnum>=parseInt(getMyVar("failnum","10"))){
                        jiekoulist[i].group = "失败待处理";                        
                    }
                    tzgroup = 1;
                    break;
                }
            }
            for (let j=0;j<sccesslist.length;j++) {
                if(jiekoulist[i].url==sccesslist[j]){
                    delete jiekoulist[i].group;
                    //log(sccesslist[j]+' 移出失败组');
                    tzgroup = 1;
                    break;
                }
            }
        }
        if(tzgroup == 1){writeFile(filepath, JSON.stringify(jiekoulist));}
        
        updateItem('loading', {
            title: ishkss?(beresults.length-beerrors.length)+'/'+count+(beresults.length==count?',我是有底线的':',点击继续加载'):'‘‘’’<font color=#f13b66a>'+ (beresults.length-beerrors.length)+'</font>/'+'<font color=#F54343>'+beerrors.length+'</font>/'+count+(beresults.length==count?',我是有底线的':',点击继续加载'),
            url: beresults.length==count?"toast://已搜索完毕":$('#noLoading#').lazyRule((bess,datalist,beresults,beerrors,name,count,ishkss)=>{
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
                    bess(datalist,beresults,beerrors,name,count,ishkss);
                    return "hiker://empty";
                },bess,datalist,beresults,beerrors,name,count,ishkss),
            col_type: "text_center_1",
            extra: {
                id: "loading"
            }
        });
        if(beresults.length==count&&beerrors.length>0){
            function faildatalist(beerrors) {
                if(getMyVar('selectgroup','a').indexOf('失败待处理')>-1){
                    var selectmenu = ["查看原网页","删除此接口","删除全部失败"];    
                }else{
                    var selectmenu = ["查看原网页","加入待处理","保留此接口","删除此接口","删除全部失败","失败全部待处理"];
                }
                for (let k in beerrors) {
                    addItemAfter('loading', {
                        title: beerrors[k].name,
                        desc: "加载失败，点击操作",
                        url: $(selectmenu,2).select((name,url,api,beerrors)=>{
                            if(input=="查看原网页"){
                                return url;
                            }else if(input=="删除此接口"){
                                let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                let datafile = fetch(filepath);
                                eval("let datalist=" + datafile+ ";");
                                for(let i=0;i<datalist.length;i++){
                                    if(datalist[i].url==api){
                                        datalist.splice(i,1);
                                        break;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                                deleteItem('xumi-'+api);
                                return "toast://已删除";
                            }else if(input=="加入待处理"){
                                let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                let datafile = fetch(filepath);
                                eval("let datalist=" + datafile+ ";");
                                for(let i=0;i<datalist.length;i++){
                                    if(datalist[i].url==api){
                                        datalist[i].group = "失败待处理";
                                        break;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                                deleteItem('xumi-'+api);
                                let baoliujk = getMyVar('baoliujk','')?getMyVar('baoliujk','').split(','):[];
                                if(baoliujk.indexOf(api)==-1){
                                    baoliujk.push(api);
                                    putMyVar('baoliujk',baoliujk.join(','));
                                }
                                return "toast://已将“"+name+"”，调整到失败待处理分组";
                            }else if(input=="保留此接口"){
                                deleteItem('xumi-'+api);
                                let baoliujk = getMyVar('baoliujk','')?getMyVar('baoliujk','').split(','):[];
                                if(baoliujk.indexOf(api)==-1){
                                    baoliujk.push(api);
                                    putMyVar('baoliujk',baoliujk.join(','));
                                }
                                return "toast://失败全部删除时保留“"+name+"”";
                            }else if(input=="删除全部失败"){
                                return $("确定要删除失败的"+beerrors.length+"个接口吗？").confirm((beerrors)=>{
                                    let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                    let datafile = fetch(filepath);
                                    eval("let datalist=" + datafile+ ";");
                                    for (let k in beerrors) {
                                        for(let i=0;i<datalist.length;i++){
                                            if(datalist[i].url==beerrors[k].apiurl&&getMyVar('baoliujk','').indexOf(datalist[i].url)==-1){
                                                deleteItem('xumi-'+datalist[i].url);
                                                datalist.splice(i,1);
                                                break;
                                            }
                                        }
                                    }
                                    writeFile(filepath, JSON.stringify(datalist));
                                    return "toast://已删除全部失败的接口(保留除外)";
                                }, beerrors)
                            }else if(input=="失败全部待处理"){
                                let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                let datafile = fetch(filepath);
                                eval("let datalist=" + datafile+ ";");
                                for (let k in beerrors) {
                                    for(let i=0;i<datalist.length;i++){
                                        if(datalist[i].url==beerrors[k].apiurl){
                                            deleteItem('xumi-'+datalist[i].url);
                                            datalist[i].group = "失败待处理";
                                            break;
                                        }
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                                return "toast://已将失败的接口，均调整到失败待处理分组";
                            }
                        }, beerrors[k].name, beerrors[k].url, beerrors[k].apiurl, beerrors),
                        col_type: "text_1",
                        extra: {
                            id: 'xumi-'+beerrors[k].apiurl,
                            cls: 'xunmilist'
                        }
                    });
                }
            }
            if(datalist.length==1){
                faildatalist(beerrors);
            }else{            
                addItemAfter('loading', {
                    title: "👀查看失败接口",
                    url: $('#noLoading#').lazyRule((faildatalist,beerrors)=>{
                        faildatalist(beerrors);
                        deleteItem('lookerror');
                        return "hiker://empty";
                    },faildatalist,beerrors),
                    col_type: "text_center_1",
                    extra: {
                        id: 'lookerror',
                        cls: 'xunmilist'
                    }
                });
            }
        }
    }
    if(count>0){
        putMyVar("starttask","1");
        bess(datalist,beresults,beerrors,name,count,ishkss);
    }
}

function xunmierji(type,ua) {
    addListener("onClose", $.toString(() => {
        clearMyVar('parse_api');
        clearMyVar('moviedesc');
        clearMyVar('SrcM3U8');
        clearMyVar('SrcXTNH');
        clearMyVar('linecode');
    }));

    var d = [];
    if(MY_PARAMS.title){setPageTitle(MY_PARAMS.title);}
    //加载本地自定义变量缓存文件
    var configfile = config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'srcconfig.js';
    require(configfile);

    //自动判断是否需要更新请求
    if (getMyVar('myurl', '0') != MY_URL || !configvar || configvar.标识 != MY_URL) {
        if (/v1|app|v2|iptv|cms/.test(type)) {
            try{
                var gethtml = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } });
                if(/cms/.test(type)&&/<\?xml/.test(gethtml)){
                    var html = gethtml;
                    var isxml = 1;
                }else{
                    var html = JSON.parse(gethtml.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,''));
                    var isxml = 0;
                }
            } catch (e) {
                var html = "";
            }
        } else if (/xpath|biubiu|custom|XBPQ/.test(type)) {
            try{
                var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua } });
            } catch (e) {
                var html = "";
            }
        } else {
            //后续网页类
        }
        var zt = 1;
        putMyVar('myurl', MY_URL);
    } else {
        var zt = 0;
    }
    if(!getMyVar('SrcM3U8')||!getMyVar('superwebM3U8')||!getMyVar('superweb')||!getMyVar('alistLine')||!getMyVar('yundiskLine')){
        try{
            var cfgfile = "hiker://files/rules/Src/Juying/config.json";
            var Juyingcfg=fetch(cfgfile);
            if(Juyingcfg != ""){
                eval("var JYconfig=" + Juyingcfg+ ";");
            }
            putMyVar('SrcM3U8',JYconfig.cachem3u8==0?'0':'1');
            putMyVar('superwebM3U8',JYconfig.cachem3u8!=0&&JYconfig.superweb==1?'1':'0');
            putMyVar('superweb',JYconfig.superweb==1?'1':'0');
            putMyVar('alistLine',JYconfig.alistLine==1?'1':'0');
            putMyVar('yundiskLine',JYconfig.yundiskLine==1?'1':'0');
        }catch(e){}
    }
        
    //影片详情
    if (zt == 1) {
        var actor = "";
        var director = "";
        var area = "";
        var year = "";
        var remarks = "";
        var pubdate = "";
        var pic = MY_PARAMS.pic;
        var desc = '...';
        var arts = [];
        var conts = [];
        if(/cms/.test(type)&&isxml==1){
            html = html.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g,'');
            arts = xpathArray(html,`//video/dl/dt/@name`);
            if(arts.length==0){
                arts = xpathArray(html,`//video/dl/dd/@flag`);
            }
            conts = xpathArray(html,`//video/dl/dd/text()`);
            actor = String(xpath(html,`//video/actor/text()`)).trim().replace(/&middot;/g,'·') || "未知";
            director = String(xpath(html,`//video/director/text()`)).trim().replace(/&middot;/g,'·') || "未知";
            area = String(xpath(html,`//video/area/text()`)).trim();
            year = String(xpath(html,`//video/year/text()`)).trim();
            remarks = String(xpath(html,`//video/note/text()`)).trim() || "";
            pubdate = String(xpath(html,`//video/type/text()`)).trim() || "";
            pic = pic.indexOf('loading.gif')==-1?pic:xpath(html,`//video/pic/text()`);
            desc = String(xpath(html.replace('<p>','').replace('</p>',''),`//video/des/text()`)) || '...';
        }else if (/v1|app|v2|cms/.test(type)) {
            if (/cms/.test(type)) {
                try{
                    var json = html.list[0];
                }catch(e){
                    var json = html.data.list[0];
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
                    var json = html.data[0];
                }else{
                    var json = html.data;
                }
                if(json&&json.vod_info){
                    json = json.vod_info;
                }
                arts = json.vod_play_list || json.vod_url_with_player || [];
                conts = arts;
                if(arts.length==0&&json.vod_play_from&&json.vod_play_url){
                    arts = json.vod_play_from.split('$$$');
                    conts = json.vod_play_url.split('$$$');
                    type = "cms";
                }
            }
            actor = json.vod_actor || "未知";
            director = json.vod_director || "未知";
            area = json.vod_area;
            year = json.vod_year;
            remarks = json.vod_remarks || "";
            pubdate = json.vod_pubdate || json.vod_class || "";
            pic = pic.indexOf('loading.gif')==-1?pic:json.vod_pic&&json.vod_pic.indexOf('ver.txt')==-1?json.vod_pic:pic;
            desc = json.vod_blurb || '...';
        }else if (/iptv/.test(type)) {
            actor = html.actor.join(",") || "未知";
            director = html.director.join(",") || "未知";
            area = html.area.join(",");
            year = html.pubtime;
            remarks = html.trunk || "";
            pubdate = html.type.join(",") || "";
            pic = pic || html.img_url;
            desc = html.intro || '...';
            arts = html.videolist;
            conts = arts;
        }else if (/xpath/.test(type)) {
            let jsondata = MY_PARAMS.data;
            try{
                actor = String(xpathArray(html, jsondata.dtActor).join(',')).replace('主演：','').replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取主演dtActor失败>'+e.message);
            }
            try{
                director = String(xpathArray(html, jsondata.dtDirector).join(',')).replace('导演：','').replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取导演dtDirector失败>'+e.message);
            }
            try{
                area = String(xpath(html, jsondata.dtArea)).replace('地区：','').replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取地区dtArea失败>'+e.message);
            }
            try{
                year = String(xpath(html, jsondata.dtYear)).replace('年份：','').replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取年份dtYear失败>'+e.message);
            }
            try{
                remarks = String(xpathArray(html, jsondata.dtCate).join(',')).replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "")||"xpath数据存在错误";
            }catch(e){
                log('xpath获取类型dtCate失败>'+e.message);
            }
            try{
                pubdate = String(xpathArray(html, jsondata.dtMark).join(',')).replace(jsondata.filter?eval(jsondata.filter):"","").replace(/[\r\ \n]/g, "");
            }catch(e){
                log('xpath获取备注dtMark失败>'+e.message);
            }
            try{
                pic = pic?pic:xpath(html, jsondata.dtImg);
            }catch(e){
                log('xpath获取图片dtImg失败>'+e.message);
            }
            try{
                desc = String(xpath(html, jsondata.dtDesc)).replace(jsondata.filter?eval(jsondata.filter):"","");
            }catch(e){
                log('xpath获取简价dtDesc失败>'+e.message);
            }
            try{
                arts = xpathArray(html, jsondata.dtFromNode+(jsondata.dtFromName.indexOf('concat(')>-1?'/text()':jsondata.dtFromName));
            }catch(e){
                log('xpath获取线路失改>'+e.message);
            }
            try{
                for (let i = 1; i < arts.length+1; i++) {
                    if(arts[i-1].indexOf("在线视频")>-1){arts[i-1] = '播放源'+i;}
                    let contname = xpathArray(html, jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+jsondata.dtUrlName);
                    let conturl = xpathArray(html, jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+(jsondata.dtUrlId=="@href"?'/'+jsondata.dtUrlId:jsondata.dtUrlId));
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
            }catch(e){
                log('xpath获取选集列表失败>'+e.message);
            }
        }else if (/biubiu/.test(type)) {
            let getsm = "";
            try{
                getsm = "获取传递数据";
                var jsondata = MY_PARAMS.data;
                getsm = "获取播放地址数组bfjiequshuzuqian";
                let bflist = html.split(jsondata.bfjiequshuzuqian.replace(/\\/g,""));
                bflist.splice(0,1);
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
                getsm = "获取备注zhuangtaiqian";
                remarks = pdfh(html.split(jsondata.zhuangtaiqian.replace(/\\/g,""))[1].split(jsondata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[0]||"biubiu数据存在错误";
                getsm = "获取主演zhuyanqian";
                actor = pdfh(html.split(jsondata.zhuyanqian.replace(/\\/g,""))[1].split(jsondata.zhuyanhou.replace(/\\/g,""))[0],"Text");
                getsm = "获取导演daoyanqian";
                director = pdfh(html.split(jsondata.daoyanqian.replace(/\\/g,""))[1].split(jsondata.daoyanhou.replace(/\\/g,""))[0],"Text");
                getsm = "获取更新zhuangtaiqian";
                pubdate = pdfh(html.split(jsondata.zhuangtaiqian.replace(/\\/g,""))[1].split(jsondata.zhuangtaihou.replace(/\\/g,""))[0],"Text").split('/')[1]||"";
                getsm = "获取剧情简介juqingqian";
                desc = pdfh(html.split(jsondata.juqingqian.replace(/\\/g,""))[1].split(jsondata.juqinghou.replace(/\\/g,""))[0],"Text") || '...';
            }catch(e){
                log(getsm+'失败>'+e.message)
            }    
        }else if (/XBPQ/.test(type)) {
            let getsm = "";
            try{
                getsm = "获取传递数据";
                var jsondata = MY_PARAMS.data;
                let jkfile = fetchCache(jsondata.ext,72);
                if(jkfile){
                    eval("var jkdata = " + jkfile);
                }
                getsm = "获取线路";
                let arthtml = html;
                if(jkdata["线路二次截取"]){
                    arthtml = arthtml.split(jkdata["线路二次截取"].split('&&')[0])[1].split(jkdata["线路二次截取"].split('&&')[1])[0];
                }
                let artlist = arthtml.match(new RegExp(jkdata["线路数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                for (let i = 0; i < artlist.length; i++) {
                    let arttitle = artlist[i].split(jkdata["线路数组"].split('&&')[0])[1].split(jkdata["线路数组"].split('&&')[1])[0].split(jkdata["线路标题"].split('&&')[0])[1].split(jkdata["线路标题"].split('&&')[1])[0];
                    arts[i] = arttitle.replace(/<\/?.+?\/?>/g,'');
                }
                let conthtml = html;
                if(jkdata["播放二次截取"]){
                    conthtml = conthtml.split(jkdata["播放二次截取"].split('&&')[0])[1].split(jkdata["播放二次截取"].split('&&')[1])[0];
                }
                let contlist = conthtml.match(new RegExp(jkdata["播放数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                for (let i = 0; i < contlist.length; i++) {
                    let bfline = jkdata["播放列表"]?contlist[i].match(new RegExp(jkdata["播放列表"].replace('&&','((?:.|[\r\n])*?)'), 'g')):pdfa(contlist[i],"body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = jkdata["播放标题"]?bfline[j].split(jkdata["播放标题"].split('&&')[0])[1].split(jkdata["播放标题"].split('&&')[1])[0]:pdfh(bfline[j],"a&&Text");
                        let conturl = jkdata["播放链接"]?bfline[j].split(jkdata["播放链接"].split('&&')[0])[1].split(jkdata["播放链接"].split('&&')[1])[0]:pd(bfline[j],"a&&href");
                        cont.push(contname+"$"+conturl)
                    }
                    conts.push(cont.join("#"))
                }
                getsm = "获取副标";
                remarks = jkdata["影片类型"]?html.split(jkdata["影片类型"].split('&&')[0])[1].split(jkdata["影片类型"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,''):"";
                getsm = "获取主演";
                actor = html.split(jkdata["主演"].split('&&')[0])[1].split(jkdata["主演"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,'');
                getsm = "获取导演";
                director = html.split(jkdata["导演"].split('&&')[0])[1].split(jkdata["导演"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,'');
                pubdate = (jkdata["影片年代"]?html.split(jkdata["影片年代"].split('&&')[0])[1].split(jkdata["影片年代"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,''):"")+(jkdata["影片地区"]?" "+html.split(jkdata["影片地区"].split('&&')[0])[1].split(jkdata["影片地区"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,''):"");
                getsm = "获取剧情简介";
                desc = html.split(jkdata["简介"].split('&&')[0])[1].split(jkdata["简介"].split('&&')[1])[0].replace(/<\/?.+?\/?>/g,'') || '...';
            }catch(e){
                log(getsm+'失败>'+e.message)
            }    
        }else{
            //自定义接口/web自动匹配
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcAutoTmpl.js');
            let data = autoerji(MY_URL.split('##')[1].split('#')[0],html);
            var details1 = data.details1||'自动匹配失败';
            var details2 = data.details2||'';
            var pic = pic.indexOf('loading.gif')==-1?pic:data.pic;
            var desc = data.desc||'';
            var arts = data.arts||[];
            var conts = data.conts||[];
        }
        if(/xpath|biubiu|XBPQ/.test(type)&&html&&(arts.length==0||conts.length==0)&&getMyVar('debug','0')=="0"&&html.indexOf(MY_PARAMS.title)>-1){
            log('开启模板自动匹配、AI识片，获取播放选集');
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcAutoTmpl.js');
            let data = autoerji(MY_URL.split('##')[1].split('#')[0],html);
            remarks = remarks||"获取数据存在错误";
            pubdate = data.details2||"";
            arts = data.arts;
            conts = data.conts;
            pic = pic||data.pic;
        }
        setPagePicUrl(pic);
        actor = actor || "未知";
        director = director || "未知";
        let dqnf = "";
        if(area){
            dqnf = '\n地区：' + area + (year?'   年代：' + year:'')
        }else{
            dqnf = year?'\n年代：' + year:''
        }
        var details1 = details1?details1:'导演：' + director.substring(0, director.length<10?director.length:10) + '\n主演：' + actor.substring(0, actor.length<10||dqnf==""?actor.length:10) + dqnf;
        var details2 = details2?details2:remarks.trim() + '\n' + pubdate.trim();
        details1 = details1.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
        details2 = details2.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
        desc = desc.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
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
        pic_url: pic?pic + '@Referer=':'',//图片
        url: getMyVar('deleteswitch')?$("确定要删除此接口吗").confirm((id)=>{
            let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
            let datafile = fetch(filepath);
            eval("let datalist=" + datafile+ ";");
            for(let i=0;i<datalist.length;i++){
                if(datalist[i].url==id.replace('xumi-','')){
                    datalist.splice(i,1);
                    break;
                }
            }
            writeFile(filepath, JSON.stringify(datalist));
            back(false);
            deleteItem(id);
            return "toast://已删除";
        },MY_PARAMS.id):pic + '#noHistory#',//链接
        col_type: 'movie_1_vertical_pic_blur',
        extra: {
            gradient: true
        }
    });

    //二级统一菜单
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyMenu.js');
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
        }else if (/cms|xpath|biubiu|custom|XBPQ/.test(type)) {
            tabs.push(arts[i].replace(/[\r\ \n\t]/g, ""));
            var linecode = arts[i];
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
        }else if (/cms|xpath|biubiu|custom|XBPQ/.test(type)) {
            let single = conts[i]||"";
            if(single){
                let lines = single.split('#');
                if(type=='cms'){
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
 
    //取之前足迹记录，用于自动定位之前的线路
    try {
        eval('var SrcMark = ' + fetch("hiker://files/cache/SrcMark.json"));
        if (SrcMark != "") {
            if (SrcMark.route[MY_URL] != undefined) {
                var SrcMarkline = SrcMark.route[MY_URL];
                putMyVar(MY_URL, SrcMark.route[MY_URL]);
            }
        }
    } catch (e) { }
    var Marksum = 30;//设置记录线路足迹数量
    var lineindex = getMyVar(MY_URL, typeof(SrcMarkline) != "undefined"?SrcMarkline:'0');
    //线路部份
    var Color1 = getItem('SrcJy$linecolor1','#09c11b')||'#09c11b';//#f13b66a
    var Color2 = getItem('SrcJy$linecolor2','');;//#098AC1
    var Color3 = getItem('SrcJy$playcolor','');
    function getHead(title,Color,strong) {
        if(Color){
            if(strong){
                return '‘‘’’<strong><font color="' + Color + '">' + title + '</front></strong>';
            }else{
                return '‘‘’’<font color="' + Color + '">' + title + '</front>';
            }
        }else{
            return title;
        }
    }
    for (let i = 0; i < 9; i++) {
        d.push({
            col_type: "blank_block"
        })
    }

    function setTabs(tabs, vari) {
        d.push({
            title: getMyVar('shsort') == '1'?'““””<b><span style="color: #FF0000">∨</span></b>' : '““””<b><span style="color: #1aad19">∧</span></b>',
            url: lineindex=="98"||lineindex=="99"?"toast://当前线路不支持切换排序":$("#noLoading#").lazyRule(() => {
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
                    title: getMyVar(vari, '0') == i ? getHead(tabs[i],Color1,1) : getHead(tabs[i],Color2),
                    url: $("#noLoading#").lazyRule((vari, i, Marksum) => {
                        if (parseInt(getMyVar(vari, '0')) != i) {
                            if(getMyVar('diskSearch')=="1"){
                                return 'toast://搜索线程中，稍等片刻.'
                            }
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
                        }
                        return '#noHistory#hiker://empty'
                    }, vari, i, Marksum),
                    col_type: 'scroll_button'
                })
            }
        }
    }
    setTabs(tabs, MY_URL);
    if(getMyVar('yundiskLine','0')==1){
        d.push({
            title: lineindex == "98" ? getHead('云盘搜索',Color1,1) : getHead('云盘搜索',Color2),
            url: $("#noLoading#").lazyRule((vari,Marksum) => {
                let i = 98;
                if (parseInt(getMyVar(vari, '0')) != i) {
                    if(getMyVar('diskSearch')=="1"){
                        return 'toast://搜索线程中，稍等片刻.'
                    }
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
                }
                return '#noHistory#hiker://empty'
            }, MY_URL, Marksum),
            col_type: 'scroll_button'
        })
    }
    if(getMyVar('alistLine','0')==1){
        d.push({
            title: lineindex == "99" ? getHead('Alist搜索',Color1,1) : getHead('Alist搜索',Color2),
            url: $("#noLoading#").lazyRule((vari,Marksum) => {
                let i = 99;
                if (parseInt(getMyVar(vari, '0')) != i) {
                    if(getMyVar('diskSearch')=="1"){
                        return 'toast://搜索线程中，稍等片刻.'
                    }
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
                }
                return '#noHistory#hiker://empty'
            }, MY_URL, Marksum),
            col_type: 'scroll_button'
        })
    }
    //推送tvbox
    if(getItem('enabledpush','')=='1' && lists.length>0){
        var movieinfo = {
            "name": MY_PARAMS.title||'聚影',
            "pic": pic.split('@')[0],
            "content": desc,
            "director": details1.split('\n')[0].replace('导演：','')||"未知",
            "actor": details1.indexOf('主演：')>-1?details1.split('主演：')[1].split('\n')[0]:"未知"
        };
        let tvip = getItem('hikertvboxset', '');
        d.push({
            title: '推送TVBOX',
            url: $("#noLoading#").lazyRule((push,tabs,lists,tvip) => {
                if(tvip==""){
                     return 'toast://观影设置中设置TVBOX接收端ip地址，完成后回来刷新一下';
                }
                let urls = [];
                let froms = [];
                for(let i in lists){
                    let list = lists[i];
                    let oneurl = list[0].split('$')[1];
                    if(oneurl.indexOf('=')>-1){
                        oneurl = oneurl.split('=')[1];
                        if (getMyVar('shsort') == '1') {
                            list = list.reverse();
                        }
                        list = list.map(item => {
                            return item.split('$')[0]+'$'+item.split('$')[1].split('=')[1];
                        });
                    }
                    if(/^http/.test(oneurl)){
                        urls.push(list.join('#').replace(/\&/g, '＆＆'));
                        froms.push(tabs[i]);
                    }
                }

                if(urls.length>0){
                    push['from'] = froms.join('$$$');
                    push['url'] = urls.join('$$$');
                    var state = request(tvip + '/action', {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            //'X-Requested-With': 'XMLHttpRequest',
                            'Referer': tvip
                        },
                        timeout: 2000,
                        body: 'do=push&url=' + JSON.stringify(push),
                        method: 'POST'
                    });
                    //log(push);
                    //log(state);
                    if (state == 'ok') {
                        return 'toast://推送成功，如果tvbox显示“没找到数据”可能是该链接需要密码或者当前的jar不支持。';
                    } else {
                        return 'toast://推送失败'
                    }
                }
                return 'toast://所有线路均不支持推送列表';
            }, movieinfo, tabs, lists, tvip),
            col_type: 'scroll_button'
        })
    }

    //选集部份
    function setLists(lists, index) {
        var list = lists[index];
        function playlist(lx, len) {//定义选集列表生成
            if (lx == '1') {
                if (/v1|app|v2|iptv|cms/.test(type)) {
                    var playtitle = list[j].split('$')[0].trim();
                    if (/iptv/.test(type)) {
                        var playurl = list[j].split('$')[1].split('=')[1];
                        parse_api = list[j].split('$')[1].split('=')[0]+"=";
                    }else{
                        var playurl = list[j].split('$')[1];
                    }
                    putMyVar('parse_api', parse_api);
                    var DTJX = $("").lazyRule(() => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(input);
                    });
                }else if (/xpath|biubiu|custom|XBPQ/.test(type)) {
                    var playtitle = list[j].split('$')[0].trim();
                    var playurl = list[j].split('$')[1];
                    if(/qq\.com|douyin|youku|mgtv|ixigua|bili|iqiyi|sohu|pptv|migu|1905|le\.com/.test(playurl) && /html/.test(playurl)){
                        var DTJX = $("").lazyRule(() => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                            return SrcParseS.聚影(input);
                        });
                    }else{
                        var DTJX = $("").lazyRule(() => {
                            if(getMyVar('superweb')=="1"){// && getMyVar('pushboxplay')!="1"){
                                return 'video://'+input;
                            }else{
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                                return SrcParseS.嗅探(input,[],1);
                            }
                        });
                    }
                }else{
                    //网页
                }

                let extra = {
                    id: playurl,
                    jsLoadingInject: true,
                    blockRules: ['.m4a', '.mp3', '.gif', '.jpeg', '.jpg', '.ico', '.png', 'hm.baidu.com', '/ads/*.js', 'cnzz.com'],
                    cls: "loadlist"
                }
                
                if(!/qq|youku|mgtv|bili|qiyi|sohu|pptv/.test(playurl) && /html/.test(playurl)){
                    extra.referer = playurl;
                }
                if(getMyVar('superwebM3U8') == "1"){
                    extra.cacheM3u8 = true;
                }
                /*
                if(getItem('enabledpush','')=='1'){
                    try{
                        movieinfo['from'] = playtitle;
                        extra.longClick = [{
                            title: "推送TVBOX",
                            js: $.toString((play,movieinfo) => {
                                putMyVar('pushboxplay','1');
                                storage0.putMyVar('movieinfo',movieinfo);
                                return play;
                            },playurl + DTJX,movieinfo)
                        }]
                    }catch(e){
                    }
                }
                */
                d.push({
                    title: getHead(playtitle.replace(/第|集|话|期|-|new|最新|新/g, ''), Color3),
                    url: playurl + DTJX,
                    extra: extra,
                    col_type: list.length > 4 && len < 7 ? 'text_4' : len > 20 ? 'text_1' :'text_3'
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
            if (/v1|app|v2|iptv|cms|xpath|biubiu|custom|XBPQ/.test(type)) {
                var listone = list[0].split('$')[0].trim();
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
    if(lineindex != "98" && lineindex != "99"){
        setLists(lists, lineindex);
    }
    //底部说明
    d.push({
        desc: '‘‘’’<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>',
        url: 'toast://温馨提示：且用且珍惜！',
        col_type: 'text_center_1',
        extra: {
            id: "listloading",
            lineVisible: false
        }
    });
    setResult(d);
    if(lineindex == "98"){
        let diskMark = storage0.getMyVar('diskMark') || {};
        if(diskMark[MY_PARAMS.name]){
            deleteItemByCls('loadlist');
            addItemBefore('listloading', diskMark[MY_PARAMS.name]);
        }else{
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliDisk.js');
            aliDiskSearch(MY_PARAMS.name);
        }
    }else if(lineindex == "99"){
        let alistMark = storage0.getMyVar('alistMark') || {};
        if(alistMark[MY_PARAMS.name]){
            deleteItemByCls('loadlist');
            addItemBefore('listloading', alistMark[MY_PARAMS.name]);
        }else{
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
            alistSearch2(MY_PARAMS.name,1);
        } 
    }
    setLastChapterRule('js:' + $.toString((type,ua,data)=>{
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLastChapter.js');
        xunmi(type,ua,data);
    }, type, ua, MY_PARAMS.data))
}
