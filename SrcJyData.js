// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
// 获取搜索数据
function getSsData(name, jkdata) {
    name = name.replace(/全集.*|国语.*|粤语.*/g,'');
    let api_name = jkdata.name||"";
    let api_type = jkdata.type||"";
    let api_url = jkdata.url||"";
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;

    let vodurlhead,ssurl,listnode;
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
        var jsondata = obj.data;
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
    let geterror;
    if(/v1|app|iptv|v2|cms/.test(api_type)){
        log('1');
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
            //log(1);//log(obj.name+'>'+e.message);
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
    }else if(api_type=="xpath"||api_type=="biubiu"){
        try {
            if(api_type=="xpath"){
                var ssurl = jsondata.searchUrl.replace('{wd}',name);
                if(jsondata.scVodNode=="json:list"){
                    gethtml = getHtmlCode(ssurl,api_ua,5000);
                    let json = JSON.parse(gethtml);
                    lists = json.list||[];
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
                        gethtml = request(ssurl, { headers: { 'User-Agent': api_ua }, timeout:5000, method: 'POST', body: postcs  });
                    }else{
                        gethtml = getHtmlCode(ssurl,api_ua,5000);
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
                    let sslist = gethtml.split(jsondata.jiequshuzuqian.replace(/\\/g,""));
                    sslist.splice(0,1);
                    for (let i = 0; i < sslist.length; i++) {
                        sslist[i] = sslist[i].split(jsondata.jiequshuzuhou.replace(/\\/g,""))[0];
                        let title = sslist[i].split(jsondata.biaotiqian.replace(/\\/g,""))[1].split(jsondata.biaotihou.replace(/\\/g,""))[0];
                        let href = sslist[i].split(jsondata.lianjieqian.replace(/\\/g,""))[1].split(jsondata.lianjiehou.replace(/\\/g,""))[0].replace(jsondata.sousuohouzhui.replace(/\\/g,""),"");//.replace('.html','')
                        let img = sslist[i].split(jsondata.tupianqian.replace(/\\/g,""))[1].split(jsondata.tupianhou.replace(/\\/g,""))[0];
                        let mark = "";
                        lists.push({"id":href,"name":title,"pic":img,"desc":mark})
                    }
                    if(jsondata.sousuohouzhui=="/vod/"){jsondata.sousuohouzhui = "/index.php/vod/detail/id/"}
                }
                var ssvodurl = `jsondata.url+jsondata.sousuohouzhui+list.id`;//+'.html'
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
    }else if(api_type=="XBPQ"){
        try{
            let jkfile = fetchCache(jsondata.ext,72);
            if(jkfile){
                eval("var jkdata = " + jkfile);
                jkdata["搜索url"] = jkdata["搜索url"] || "/index.php/ajax/suggest?mid=1&wd={wd}&limit=500";
                var ssurl = jkdata["搜索url"].replace('{wd}',name).replace('{pg}','1');
                ssurl = /^http/.test(ssurl)?ssurl:jkdata["主页url"]+ssurl;
                if(jkdata["搜索模式"]=="0"&&jkdata["搜索后缀"]){
                    gethtml = getHtmlCode(ssurl,api_ua,5000);
                    let html = JSON.parse(gethtml);
                    lists = html.list||[];
                    var ssvodurl = `jkdata["主页url"] + jkdata["搜索后缀"] + list.id + '.html'`;
                }else{
                    let sstype = ssurl.indexOf(';post')>-1?"post":"get";
                    if(sstype == "post"){
                        let postcs = ssurl.split(';')[2];
                        ssurl = ssurl.split(';')[0];
                        gethtml = request(ssurl, { headers: { 'User-Agent': api_ua }, timeout:5000, method: 'POST', body: postcs  });
                    }else{
                        gethtml = getHtmlCode(ssurl,api_ua,5000);
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
    log(lists);
    if(lists.length>0){
        try {
            let search = lists.map((list)=>{
                if(list){
                    let vodname = list.vodname
                    let vodpic = list.vodpic?list.vodpic.replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g,'') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif@Referer=";
                    let voddesc = list.voddesc;
                    
                    let vodurl = list.vodurl;
                    if(/^\/\//.test(vodpic)){
                        vodpic = "https:" + vodpic;
                    }   
                    if(/^\/upload|^upload/.test(vodpic)){
                        vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                    }

                    let searchIncludes = typeof(searchContains) =="undefined" ? vodname.indexOf(name)>-1?1:0 :searchContains(vodname,name,true);
                    if(searchIncludes) {
                        return {
                            title: vodname,
                            desc: voddesc,
                            content: voddesc,
                            pic_url: vodpic,
                            url: $("hiker://empty##" + vodurl + "#immersiveTheme#"+(getMyVar('debug','0')=="0"?"#autoCache#":"")).rule((type,ua) => {
                                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyXunmi.js');
                                    xunmierji(type,ua)
                                },api_type, api_ua),
                            col_type: "movie_1_vertical_pic",
                            extra: {
                                id: 'xunmi-'+url_api,
                                pic: vodpic,
                                name: vodname,
                                title: vodname+'-'+api_name,
                                //data: typeof(jsondata) =="undefined"|| jsondata ==null?{}:jsondata,
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

}

// 获取二级数据
function getErData(jkdata) {
    let api_type = jkdata.type;
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;

    let html,isxml;
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
        try{
            html = request(MY_URL, {headers: {'User-Agent': api_ua}, timeout:5000});
        } catch (e) {
            log(e.message);
        }
    }

    let pic,details1,details2,desc,arts,conts;

    let actor = "";
    let director = "";
    let area = "";
    let year = "";
    let remarks = "";
    let pubdate = "";
    pic = MY_PARAMS.pic;
    desc = '...';
    arts = [];
    conts = [];
    if(/cms/.test(api_type)&&isxml==1){
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
        actor = json.vod_actor || "未知";
        director = json.vod_director || "未知";
        area = json.vod_area;
        year = json.vod_year;
        remarks = json.vod_remarks || "";
        pubdate = json.vod_pubdate || json.vod_class || "";
        pic = pic.indexOf('loading.gif')==-1?pic:json.vod_pic&&json.vod_pic.indexOf('ver.txt')==-1?json.vod_pic:pic;
        desc = json.vod_blurb || '...';
    }else if (/iptv/.test(api_type)) {
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
    }else if (/xpath/.test(api_type)) {
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
                    let playUrl;
                    if(urlid){
                        let urlidl = urlid.split('(\\S+)')[0];
                        let urlidr = urlid.split('(\\S+)')[1];
                        playUrl = conturl[j].replace(urlidl,'').replace(urlidr,'');
                    }else{
                        playUrl = conturl[j];
                    }
                    cont.push(contname[j]+"$"+jsondata.playUrl.replace('{playUrl}',playUrl))
                }
                conts.push(cont.join("#"))
            }
        }catch(e){
            log('xpath获取选集列表失败>'+e.message);
        }
    }else if (/biubiu/.test(api_type)) {
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
    }else if (/XBPQ/.test(api_type)) {
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
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcAutoTmpl.js');
        let data = autoerji(MY_URL, html);
        details1 = data.details1||'自动匹配失败';
        details2 = data.details2||'';
        pic = pic.indexOf('loading.gif')==-1?pic:data.pic;
        desc = data.desc||'';
        arts = data.arts||[];
        conts = data.conts||[];
    }
    if(/xpath|biubiu|XBPQ/.test(api_type)&&html&&(arts.length==0||conts.length==0)&&getMyVar('debug','0')=="0"&&html.indexOf(MY_PARAMS.title)>-1){
        log('开启模板自动匹配、AI识片，获取播放选集');
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcAutoTmpl.js');
        let data = autoerji(MY_URL, html);
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
    details1 = details1?details1:'导演：' + director.substring(0, director.length<10?director.length:10) + '\n主演：' + actor.substring(0, actor.length<10||dqnf==""?actor.length:10) + dqnf;
    details2 = details2?details2:remarks.trim() + '\n' + pubdate.trim();
    details1 = details1.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
    details2 = details2.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');
    desc = desc.replace(/&ldquo;/g,'“').replace(/&rdquo;/g,'”').replace(/&middot;/g,'·').replace(/&hellip;/g,'…').replace(/&nbsp;|♥/g,' ');

    let parse_api = "";
    let tabs = [];
    let linecodes = [];
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
    
    let lists = [];
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
// 获取一级数据
function getYiData(jkdata) {
    let d = [];
    let api_name = jkdata.name||"";
    let api_type = jkdata.type||"";
    let api_url = jkdata.url||"";
    let api_ua = jkdata.ua||"MOBILE_UA";
    api_ua = api_ua=="MOBILE_UA"?MOBILE_UA:api_ua=="PC_UA"?PC_UA:api_ua;
    
    let vodurlhead,classurl,listurl,listnode;
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
        } else {
            log('api类型错误')
        }
    }
    if(MY_PAGE==1){
        if(typeof(classurl) != "undefined"){
            const Color = "#3399cc";
            let typeclass = [];
            try{
                
                let gethtml = request(classurl, { headers: { 'User-Agent': api_ua }, timeout:5000 });
                if (api_type=="v1") {
                    let typehtml = JSON.parse(gethtml);
                    let typelist = typehtml.data.list||typehtml.data.typelist;
                    typeclass = typelist.map((list)=>{
                        return {
                            "type_id": list.type_id,
                            "type_pid": list.type_pid,
                            "type_name": list.type_name
                        }
                    })
                } else if (/app|v2/.test(api_type)) {
                    let typehtml = JSON.parse(gethtml);
                    let typelist = typehtml.list||typehtml.data;
                    typeclass = typelist.map((list)=>{
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
                    typeclass = typehtml.map((list)=>{
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
                        typeclass = typelist.map((list)=>{
                            return {
                                "type_id": String(xpath(list,`//ty/@id`)).trim(),
                                "type_pid": 0,
                                "type_name": String(xpath(list,`//ty/text()`)).trim()
                            }
                        })
                    }else{
                        let typehtml = JSON.parse(gethtml);
                        typeclass = typehtml.class;
                    }
                    if(jkdata.categories){
                        for(var i=0;i<typeclass.length;i++){
                            if(jkdata.categories.indexOf(typeclass[i].type_name)==-1){
                                typeclass.splice(i,1);
                                i = i -1;
                            }
                        }
                    }
                } else {
                    log('api类型错误')
                }
            }catch(e){
                log(api_name+' 接口访问异常，请更换接口！获取分类失败>'+e.message);
            }
            
            if(typeclass.length>0){
                let type_pids = [];
                let type_ids = [];
                typeclass.forEach(it=>{
                    if(type_pids.indexOf(it.type_pid)==-1){type_pids.push(it.type_pid)}
                    if(type_ids.indexOf(it.type_id)==-1){type_ids.push(it.type_id)}
                })

                if(type_pids.length > 0){
                    type_pids.sort((a, b) => {
                        return a - b
                    })
                };

                if(type_ids.length>0&&!getMyVar('SrcJu_dianbo$type_id')){///v2|app|XBPQ/.test(api_type)
                    putMyVar('SrcJu_dianbo$type_id',type_ids[0]);
                }
                for (var j in type_pids) {
                    for (var i in typeclass) {
                        if(typeclass[i].type_pid==type_pids[j]){
                            d.push({
                                title: getMyVar('SrcJu_dianbo$type_id')==typeclass[i].type_id?'““””<b><span style="color:' + Color + '">' + typeclass[i].type_name + '</span></b>':typeclass[i].type_name,
                                url: $('#noLoading#').lazyRule((type_id) => {
                                    putMyVar('SrcJu_dianbo$type_id', type_id);
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
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyData.js');
                        let ssdata = getSsData(name,data);
                        setResult(ssdata);
                    }, input, data);
                }else{
                    return 'toast://未找到接口数据'
                }
            },jkdata);
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
        let lists = [];
        try{
            if(api_type=="XBPQ"){
                MY_URL = listurl.replace('{catePg}',jkdata["起始页"]?MY_PAGE>jkdata["起始页"]?MY_PAGE:"":MY_PAGE).replace('{cateId}',getMyVar('SrcJu_dianbo$type_id','1'));
            }else{
                MY_URL = listurl + MY_PAGE;
                if(api_type=="v2"||api_type=="app"){
                    MY_URL = MY_URL.replace('@type_id',getMyVar('SrcJu_dianbo$type_id','1'));
                }else if(getMyVar('SrcJu_dianbo$type_id')){
                    if (api_type=="v1") {
                        MY_URL = MY_URL + '&type=' + getMyVar('SrcJu_dianbo$type_id');
                    } else if (api_type=="iptv") {
                        MY_URL = MY_URL + '&class=' + getMyVar('SrcJu_dianbo$type_id');
                    } else {
                        MY_URL = MY_URL + '&t=' + getMyVar('SrcJu_dianbo$type_id');
                    }
                }
            }
            try {
                var gethtml = request(MY_URL, { headers: { 'User-Agent': api_ua }, timeout:5000 });
                if(api_type=="XBPQ"){
                    jkdata["二次截取"] = jkdata["二次截取"] || (gethtml.indexOf(`<ul class="stui-vodlist`)>-1?`<ul class="stui-vodlist&&</ul>`:gethtml.indexOf(`<ul class="myui-vodlist`)>-1?`<ul class="myui-vodlist&&</ul>`:"");
                    if(jkdata["二次截取"]){
                        gethtml = gethtml.split(jkdata["二次截取"].split('&&')[0])[1].split(jkdata["二次截取"].split('&&')[1])[0];
                    }
                    jkdata["链接"] = jkdata["链接"] || `href="&&"`;
                    jkdata["标题"] = jkdata["标题"] || `title="&&"`;
                    jkdata["数组"] = jkdata["数组"] || `<a &&</a>`;
                    let jklist = gethtml.match(new RegExp(jkdata["数组"].replace('&&','((?:.|[\r\n])*?)'), 'g'));
                    jklist.forEach(item=>{
                        if(!jkdata["图片"]){
                            if(item.indexOf('original=')>-1){
                                jkdata["图片"] = `original="&&"`;
                            }else if(item.indexOf('<img src=')>-1){
                                jkdata["图片"] = `<img src="&&"`;
                            }
                        };
                        if(jkdata["图片"]&&item.indexOf(jkdata["图片"].split("&&")[0])>-1){
                            let id = item.split(jkdata["链接"].split('&&')[0])[1].split(jkdata["链接"].split('&&')[1])[0];
                            let name = item.split(jkdata["标题"].split('&&')[0])[1].split(jkdata["标题"].split('&&')[1])[0];
                            let pic = "";
                            try{
                                pic = item.split(jkdata["图片"].split('&&')[0])[1].split(jkdata["图片"].split('&&')[1])[0];
                            }catch(e){}
                            let note = "";
                            try{
                                note = item.split(jkdata["副标题"].split('&&')[0])[1].split(jkdata["副标题"].split('&&')[1])[0];
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
            } catch (e) {
                
            }
            
            let videolist = lists.map((list)=>{
                let vodname = list.vod_name||list.title;
                if(vodname){
                    let vodpic = list.vod_pic||list.pic;
                    let voddesc = list.vod_remarks||list.state||"";
                    let vodurl = list.vod_id?vodurlhead&&!/^http/.test(list.vod_id)?vodurlhead+list.vod_id:list.vod_id:list.nextlink;
                    vodpic = vodpic?vodpic.replace('/img.php?url=','').replace('/tu.php?tu=','') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif";
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
                    return {
                        title: vodname,
                        desc: voddesc,
                        pic_url: vodpic,
                        url: list.play?list.play:$("hiker://empty#immersiveTheme##autoCache#").rule(() => {
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
                    }
                }
            });
            videolist = videolist.filter(n => n);
            d = d.concat(videolist);
        }catch(e){
            if(lists.length==0){
                d.push({
                    title: '接口访问异常，请更换接口！',
                    url: '#noHistory#hiker://empty',
                    col_type: 'text_center_1'
                }); 
            }
            log(api_name+' 接口访问异常，请更换接口！获取影片失败>'+e.message)
        }
    }
    return d;
}