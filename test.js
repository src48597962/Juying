if(/v1|app|iptv|v2|cms/.test(obj.type)){
                try {
                    var gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
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
                    if(gethtml){geterror = 1;}
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
                            html = JSON.parse(getHtmlCode(ssurl,urlua,xunmitimeout*1000));
                            list = html.data||[];
                        } catch (e) {
                            list = [];
                        }
                    }

                    if(list.length>0){
                        try {
                            let search = list.map((list)=>{
                                let vodname = list.vod_name||list.title;
                                if(vodname.indexOf(name)>-1){
                                    let vodpic = list.vod_pic||list.pic;
                                    let voddesc = list.vod_remarks||list.state||"";
                                    let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>'+' ('+obj.type+')'+(obj.group&&obj.group!=obj.type?' ['+obj.group+']':'');
                                    let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                                    vodpic = vodpic?vodpic.replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g,'') + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif@Referer=";
                                    if(/^\/upload|^upload/.test(vodpic)){
                                        vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                                    }
                                    if(/^\/\//.test(vodpic)){
                                        vodpic = "https" + vodpic;
                                    }
                                    return {
                                        title: !ishkss?vodname!=name?vodname.replace(name,'‘‘’’<font color=red>'+name+'</font>'):'‘‘’’<font color=red>'+vodname+'</font>':vodname,
                                        desc: !ishkss?(voddesc + '\n\n' + appname):'聚影√ · '+obj.name,
                                        content: voddesc,
                                        pic_url: vodpic,
                                        url: $("hiker://empty##" + vodurl + "#immersiveTheme##autoCache#").rule((type,ua) => {
                                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                                xunmierji(type,ua)
                                            },obj.type, urlua),
                                        col_type: "movie_1_vertical_pic",
                                        extra: {
                                            id: 'xumi-'+url_api,
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
                    return {result:0, url:ssurl, apiurl:url_api, error:geterror};
                } catch (e) {
                    //log(obj.name+'>'+e.message);
                    return {result:0, url:ssurl, apiurl:url_api, error:geterror};
                }
            }else if(obj.type=="xpath"||obj.type=="biubiu"){
                try {
                    if(obj.type=="xpath"){
                        var ssurl = jsondata.searchUrl.replace('{wd}',name);
                        if(jsondata.scVodNode=="json:list"){
                            var gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            var html = JSON.parse(gethtml);
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
                                var gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            }else{
                                var gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            }

                            let title = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodName);
                            let href = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodId);
                            let img = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodImg);
                            let mark = xpathArray(gethtml, jsondata.scVodNode+jsondata.scVodMark)||"";
                            var list = [];
                            for(var j in title){
                                list.push({"id":/^http/.test(href[j])||/\{vid}$/.test(jsondata.dtUrl)?href[j]:href[j].replace(/\/.*?\/|\.html/g,''),"name":title[j],"pic":img[j],"desc":mark[j]})
                            }
                        }
                        var ssvodurl = `jsondata.dtUrl.replace('{vid}',list.id)`;
                    }else{
                        var ssurl = jsondata.url+jsondata.sousuoqian+name+jsondata.sousuohou;
                        if(jsondata.ssmoshi=="0"){
                            var gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            var html = JSON.parse(gethtml);
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
                               var gethtml = request(ssurl, { headers: { 'User-Agent': urlua }, timeout:xunmitimeout*1000, method: 'POST', body: postcs  });
                            */
                            }else{
                                var gethtml = getHtmlCode(ssurl,urlua,xunmitimeout*1000);
                            }
                            let sslist = gethtml.split(jsondata.jiequshuzuqian.replace(/\\/g,""));
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
                    if(gethtml){geterror = 1;}
                }
                if(list.length>0){
                    try {
                        let search = list.map((list)=>{
                            let vodname = list.name;
                            if(vodname.indexOf(name)>-1){
                                let vodpic = list.pic.replace(/http.*\/tu\.php\?tu=|\/tu\.php\?tu=| |\/img\.php\?url=/g,'');
                                let voddesc = list.desc?list.desc:"";
                                let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>'+' ('+obj.type+')'+(obj.group&&obj.group!=obj.type?' ['+obj.group+']':'');
                                let vodurl = eval(ssvodurl);
                                if(/^\/upload|^upload/.test(vodpic)){
                                    vodpic = vodurl.match(/http(s)?:\/\/(.*?)\//)[0] + vodpic;
                                }
                                if(/^\/\//.test(vodpic)){
                                    vodpic = "https" + vodpic;
                                }
                                return {
                                    title: !ishkss?vodname!=name?vodname.replace(name,'‘‘’’<font color=red>'+name+'</font>'):'‘‘’’<font color=red>'+vodname+'</font>':vodname,
                                    desc: !ishkss?(voddesc + '\n\n' + appname):'聚影√ · '+obj.name,
                                    content: voddesc,
                                    pic_url: vodpic?vodpic + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif@Referer=",
                                    url: $("hiker://empty##" + vodurl + "#immersiveTheme##autoCache#").rule((type,ua) => {
                                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                                            xunmierji(type,ua)
                                        },obj.type, urlua),
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        id: 'xumi-'+url_api,
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
                return {result:0, url:ssurl, apiurl:url_api, error:geterror};
            }else{

            }