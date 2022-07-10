//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除
function SRCSet() {
    addListener("onClose", $.toString(() => {
        clearMyVar('guanlicz');
        //refreshPage(false);
    }));
    setPageTitle("♥管理"+getVar('SrcJuying-Version', ''));
    function jiekouchuli(lx,urls) {
        function apitype(apiurl) {
            if(apiurl){
                if(apiurl.includes('.vod')){
                    return "v1";
                }else if(apiurl.includes('/app/')){
                    return "app";
                }else if(apiurl.includes('app.php')){
                    return "v2";
                }else if(/iptv|Chengcheng/.test(apiurl)){
                    return "iptv";
                }else if(apiurl.includes('provide/vod/')){
                    return "cms";
                }else{
                    return "";
                }
            }else{
                return "";
            }
        }
        if(lx=="type"){
            return apitype(urls);
        }else if(lx=="save"){
            try{
                var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                var datafile = fetch(filepath);
                if(datafile != ""){
                    eval("var datalist=" + datafile+ ";");
                }else{
                    var datalist = [];
                }
                
                var num = 0;
                for (var i in urls) {
                    let urlname = urls[i].name;
                    let urlurl = urls[i].url;
                    let urlua = urls[i].ua||"Dalvik/2.1.0";
                    let urltype = urls[i].type||apitype(urlurl);
                    let urlgroup = urls[i].group||"";
                    if(!datalist.some(item => item.url ==urlurl)&&urlname&&/^http/.test(urlurl)&&urltype){
                        let arr  = { "name": urlname, "url": urlurl, "ua": urlua, "type": urltype, "group": urlgroup };
                        datalist.push(arr);
                        num = num + 1;
                    }
                }
                if(num>0){writeFile(filepath, JSON.stringify(datalist));}
            } catch (e) {
                log('导入失败：'+e.message); 
                return -1;
            }
            return num;
        }else{
            return "toast://接口处理类型不正确";
        }
    }
    function getTitle(title, Color) {
        return '<font color="' + Color + '">' + title + '</font>';
    }
    var d = [];
    d.push({
        title: getMyVar('guanli', 'jk')=="jk"?getTitle('接口管理', '#f13b66a'):'接口管理',
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jk');refreshPage(false);'toast://已切换到接口管理';`,
        img: "https://lanmeiguojiang.com/tubiao/movie/98.svg",
        col_type: "icon_small_3"
    });
    d.push({
        title: getMyVar('guanli', 'jk')=="jk"?'解析管理':getTitle('解析管理', '#f13b66a'),
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jx');refreshPage(false);'toast://已切换到解析管理';`,
        img: "https://lanmeiguojiang.com/tubiao/movie/105.svg",
        col_type: "icon_small_3"
    });
    d.push({
        title: '扩展中心',
        url: $('hiker://empty#noRecordHistory##noHistory#').rule((jiekouchuli) => {
            addListener("onClose", $.toString(() => {
                refreshPage(false);
            }));
            var d = [];
            var cfgfile = "hiker://files/rules/Src/Juying/config.json";
            var Juyingcfg=fetch(cfgfile);
            if(Juyingcfg != ""){
                eval("var JYconfig=" + Juyingcfg+ ";");
            }else{
                var JYconfig= {};
            }

            d.push({
                title: '聚影分享',
                col_type: "rich_text"
            });
            d.push({
                col_type: "line_blank"
            });
            d.push({
                title: JYconfig['codeid']?'复制聚影资源码口令':'申请聚影资源码',//sharetime
                desc: JYconfig['codetime']?JYconfig['codetime']+' 有效期三年\n'+(JYconfig['sharetime']?JYconfig['sharetime']+" 上次同步时间":"暂未分享同步"):'点击申请三年长期资源码',
                url: JYconfig['codeid']?$().lazyRule((codeid)=>{
                        let code = '聚影资源码￥'+codeid;
                        copy(code);
                        return "hiker://empty";
                    },JYconfig['codeid']):$().lazyRule((JYconfig,cfgfile) => {
                        var num = ''; 
                        for (var i = 0; i < 6; i++) {
                            num += Math.floor(Math.random() * 10);
                        }
                        
                        try{
                            var pastecreate = JSON.parse(request('https://netcut.cn/api/note/create/', {
                                headers: { 'Referer': 'https://netcut.cn/' },
                                body: 'note_name=Juying'+num+'&note_content=&note_pwd=0&expire_time=94608000',
                                method: 'POST'
                            })).data;
                            var codeid = pastecreate.note_id;
                            var codetime = pastecreate.created_time;
                        } catch (e) {
                            log('申请失败：'+e.message); 
                            return 'toast://申请失败，请重新再试';
                        }
                        JYconfig['codeid'] = aesEncode('Juying', codeid);
                        JYconfig['codetime'] = codetime;
                        writeFile(cfgfile, JSON.stringify(JYconfig));
                        refreshPage(false);
                        return 'toast://申领成功';
                    }, JYconfig, cfgfile),
                col_type: "text_center_1"
            });
            
            d.push({
                title: '分享同步',
                url: JYconfig['codeid']?$(["只传接口","只传解析","接口+解析"],2,"选择上传同步云端的项").select((JYconfig,cfgfile)=>{
                    var text = {};
                    if(input=="只传接口"||input=="接口+解析"){
                        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                        var datafile = fetch(filepath);
                        if(datafile==""){
                            return 'toast://接口数据为空，无法同步云端';
                        }
                        eval("var datalist=" + datafile+ ";");
                        text['jiekou'] = datalist;
                    }else{
                        text['jiekou'] = [];
                    }
                    if(input=="只传解析"||input=="接口+解析"){
                        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                        var datafile = fetch(filepath);
                        if(datafile==""){
                            var datalist=[];
                        }else{
                            eval("var datalist=" + datafile+ ";");
                        }
                        text['jiexi'] = datalist;
                    }else{
                        text['jiexi'] = [];
                    }

                    try{
                        var pasteupdate = JSON.parse(request('https://netcut.cn/api/note/update/', {
                            headers: { 'Referer': 'https://netcut.cn/' },
                            body: 'note_id='+aesDecode('Juying', JYconfig['codeid'])+'&note_content='+base64Encode(JSON.stringify(text)),
                            method: 'POST'
                        }));
                        var status = pasteupdate.status
                        var sharetime = pasteupdate.data.updated_time;
                        if(status==1){
                            JYconfig['sharetime'] = sharetime;
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            //let code = '聚影资源码￥'+JYconfig['codeid'];
                            //copy(code);
                            return "toast://分享同步云端数据成功";
                        }else{
                            return 'toast://分享同步失败，资源码应该不存在';
                        }
                    } catch (e) {
                        log('分享失败：'+e.message); 
                        return 'toast://分享同步失败，请重新再试';
                    }
                }, JYconfig, cfgfile):'toast://请先申请聚影资源码',
                col_type: "text_2"
            });
            d.push({
                title: '删除云端',
                url: JYconfig['codeid']?$().lazyRule((JYconfig,cfgfile) => {
                        try{
                            var pastedelete = JSON.parse(request('https://netcut.cn/api/note/del_note/', {
                                headers: { 'Referer': 'https://netcut.cn/' },
                                body: 'note_id='+aesDecode('Juying', JYconfig['codeid']),
                                method: 'POST'
                            }));
                            var status = pastedelete.status

                            delete JYconfig['codeid'];
                            delete JYconfig['codetime'];
                            delete JYconfig['sharetime'];
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            
                            if(status==1){
                                return "toast://聚影资源码云端已删除";
                            }else{
                                return 'toast://无需删除，云端已不存在';
                            }
                        } catch (e) {
                            log('删除失败：'+e.message); 
                            return 'toast://删除资源失败，云端异常';
                        }
                    }, JYconfig, cfgfile):'toast://请先申请聚影资源码',
                col_type: "text_2"
            });
            d.push({
                col_type: "line"
            });

            d.push({
                title: '订阅管理',
                col_type: "rich_text"
            });
            d.push({
                col_type: "line_blank"
            });
            d.push({
                title: JYconfig['codeid2']?'已订阅聚影资源码':'订阅聚影资源码',
                desc: JYconfig['codeid2']?'点击订阅、复制、切换资源码'+(JYconfig['codedyname']?'\n当前订阅的资源码为：'+JYconfig['codedyname']:""):'订阅后将与分享者云端数据保持同步',
                url: $(["订阅","复制","切换"],3).select((JYconfig,cfgfile)=>{
                        if(input=="订阅"){
                            return $("","聚影资源码口令").input((JYconfig,cfgfile) => {
                                if(input.split('￥')[0]!="聚影资源码"){
                                    return 'toast://口令有误';
                                }
                                showLoading('正在较验有效性')
                                let codeid = input.split('￥')[1];
                                let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', codeid));
                                hideLoading();
                                if(codeid&&!/^error/.test(text)){
                                    return $("","当前资源码有效，起个名保存吧").input((JYconfig,cfgfile,codeid) => {
                                        var filepath = "hiker://files/rules/Src/Juying/dingyue.json";
                                        var datafile = fetch(filepath);
                                        if(datafile != ""){
                                            eval("var datalist=" + datafile+ ";");
                                        }else{
                                            var datalist = [];
                                        }
                                        if(datalist.some(item => item.name ==input)){
                                            return 'toast://名称重复，无法保存';
                                        }else if(input!=""){
                                            if(!datalist.some(item => item.url ==codeid)){
                                                JYconfig['codeid2'] = codeid;
                                                JYconfig['codedyname'] = input;
                                                writeFile(cfgfile, JSON.stringify(JYconfig));
                                                refreshPage(false);
                                                datalist.push({name:input, url:codeid})
                                                writeFile(filepath, JSON.stringify(datalist));
                                                return 'toast://已保存，订阅成功';
                                            }else{
                                                return 'toast://已存在，订阅未成功';
                                            }
                                        }else{
                                            return 'toast://名称为空，无法保存';
                                        }
                                    }, JYconfig, cfgfile, codeid);
                                }else{
                                    return "toast://口令错误或资源码已失效";
                                }
                            }, JYconfig, cfgfile)
                        }else if(input=="复制"){
                            let codeid = JYconfig['codeid2'];
                            return codeid?$().lazyRule((codeid)=>{
                                let code = '聚影资源码￥'+codeid;
                                copy(code);
                                return "hiker://empty";
                            },codeid):'toast://请先订阅'
                        }else if(input=="切换"){
                            let codeid = JYconfig['codeid2'];
                            var filepath = "hiker://files/rules/Src/Juying/dingyue.json";
                            var datafile = fetch(filepath);
                            if(datafile != ""){
                                eval("var datalist=" + datafile+ ";");
                            }else{
                                var datalist = [];
                            }
                            let list = datalist.map((list)=>{
                                if(list.url !=codeid){
                                    return list.name;
                                }
                            })
                            list = list.filter(n => n);
                            if(list.length>0){
                                return $(list,3,"选择需切换的订阅源").select((datalist,JYconfig,cfgfile)=>{
                                    var url = "";
                                    for (var i in datalist) {
                                        if(datalist[i].name==input){
                                            url = datalist[i].url;
                                            break;
                                        }
                                    }
                                    if(url){
                                        JYconfig['codeid2'] = url;
                                        JYconfig['codedyname'] = input;
                                        writeFile(cfgfile, JSON.stringify(JYconfig));
                                        refreshPage(false);
                                        return 'toast://订阅已切换为：'+input+'，更新资源立即生效';
                                    }else{
                                        return 'toast://本地订阅记录文件异常，是不是干了坏事？';
                                    }
                                },datalist,JYconfig,cfgfile)
                            }else{
                                return 'toast://未找到可切换的历史订阅';
                            }
                        }
                    },JYconfig,cfgfile),
                col_type: "text_center_1"
            });

            d.push({
                title: '更新资源',
                url: JYconfig['codeid2']?$().lazyRule((JYconfig) => {
                        try{
                            let codeid = JYconfig['codeid2'];
                            let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', codeid));
                            if(codeid&&!/^error/.test(text)){
                                let pastedata = JSON.parse(base64Decode(text));
                                var jkfilepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                var jkdatalist = pastedata.jiekou;
                                if(jkdatalist.length>0){
                                    writeFile(jkfilepath, JSON.stringify(jkdatalist));
                                }
                                var jxfilepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                var jxdatalist = pastedata.jiexi;
                                if(jxdatalist.length>0){
                                    writeFile(jxfilepath, JSON.stringify(jxdatalist));
                                }
                                return "toast://同步完成，接口："+jkdatalist.length+"，解析："+jxdatalist.length;
                            }else{
                                return "toast://口令错误或资源码已失效";
                            }
                        } catch (e) {
                            log('更新失败：'+e.message); 
                            return "toast://无法识别的口令";
                        }
                    }, JYconfig):'toast://请先订阅聚影资源码',
                col_type: "text_2"
            });
            d.push({
                title: '删除订阅',
                url: JYconfig['codeid2']?$(["仅删订阅源，保留历史","册除订阅及历史，不再切换"],1).select((JYconfig,cfgfile)=>{
                    if(input=="仅删订阅源，保留历史"){
                        return $().lazyRule((JYconfig,cfgfile) => {
                            delete JYconfig['codeid2'];
                            delete JYconfig['codedyname'];
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://已删除订阅源，历史记录可用于切换';
                        }, JYconfig, cfgfile)
                    }else if(input=="册除订阅及历史，不再切换"){
                        return $().lazyRule((JYconfig,cfgfile) => {
                            let codeid2 = JYconfig['codeid2'];
                            delete JYconfig['codeid2'];
                            delete JYconfig['codedyname'];
                            writeFile(cfgfile, JSON.stringify(JYconfig));

                            var filepath = "hiker://files/rules/Src/Juying/dingyue.json";
                            var datafile = fetch(filepath);
                            if(datafile != ""){
                                eval("var datalist=" + datafile+ ";");
                            }else{
                                var datalist = [];
                            }
                            for (var i in datalist) {
                                if(datalist[i].url==codeid2){
                                    datalist.splice(i,1);
                                    break;
                                }
                            }
                            writeFile(filepath, JSON.stringify(datalist));
                            refreshPage(false);
                            return 'toast://已删除订阅源和历史记录';
                        }, JYconfig, cfgfile)
                    }                    
                }, JYconfig, cfgfile):'toast://请先订阅聚影资源码',
                col_type: "text_2"
            });

            d.push({
                title: '个性设置',
                col_type: "rich_text"
            });
            d.push({
                col_type: "line_blank"
            });
            d.push({
                title: JYconfig['erjimode']!=2?'当前二级模式：常规':'当前二级模式：搜索',
                desc: JYconfig['erjimode']!=2?'一级选片点击先用进二级，再扩展更多片源':'一级选片点击调用接口搜索扩展更多片源',
                url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                        if(JYconfig['erjimode'] == 2){
                            JYconfig['erjimode'] = 1;
                            var sm = "从一级先进二级常规模式";
                        }else{
                            JYconfig['erjimode'] = 2;
                            var sm = "从一级直接调接口到搜索模式";
                        }
                        writeFile(cfgfile, JSON.stringify(JYconfig));
                        refreshPage(false);
                        return 'toast://切换为：' + sm + '，返回主页后刷新生效';
                    }, JYconfig, cfgfile),
                col_type: "text_center_1"
            });
            d.push({
                title: '搜索线程',
                url: $(JYconfig['xunminum']?JYconfig['xunminum']:"10","每次搜索成功停止线程数").input((JYconfig,cfgfile) => {
                        if(!parseInt(input)||parseInt(input)<1||parseInt(input)>100){return 'toast://输入有误，请输入1-100数字'}else{
                            JYconfig['xunminum'] = parseInt(input);
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://每次搜索成功线程数已设置为：'+input;
                        }
                    }, JYconfig, cfgfile),
                col_type: "text_2"
            });
            d.push({
                title: '搜索时长',
                url: $(JYconfig['xunmitimeout']?JYconfig['xunmitimeout']:"5","设置接口搜索超时时长(秒)").input((JYconfig,cfgfile) => {
                        if(!parseInt(input)||parseInt(input)<1||parseInt(input)>10){return 'toast://输入有误，请输入1-10数字'}else{
                            JYconfig['xunmitimeout'] = parseInt(input);
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://接口搜索超时时长已设置为：'+input+'秒';
                        }
                    }, JYconfig, cfgfile),
                col_type: "text_2"
            });
            d.push({
                title: '解析保留',
                url: $(JYconfig['appjiexinum']?JYconfig['appjiexinum']:"50","app自带解析保留数量").input((JYconfig,cfgfile) => {
                        if(!parseInt(input)||parseInt(input)<1||parseInt(input)>100){return 'toast://输入有误，请输入1-100数字'}else{
                            JYconfig['appjiexinum'] = parseInt(input);
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://app自带解析保留数量已设置为：'+input;
                        }
                    }, JYconfig, cfgfile),
                col_type: "text_2"
            });
            d.push({
                title: '其他资源',
                col_type: "rich_text"
            });
            d.push({
                col_type: "line_blank"
            });
            
            d.push({
                title: 'biu导入',
                url:$("","输入biu资源地址").input((jiekouchuli) => {
                        try{
                            var html = fetch(input);
                            var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
                            html = html.replace(reg, function(word) { 
                                return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                            }).replace(/\\ '/g,"\'").replace(/\\ "/g,`\"`).replace(/\\>/g,">").replace(/\\'"/g,`'"`);
                            var bbdata = JSON.parse(html);
                            var bbjiekou = bbdata.zhuyejiekou||[];
                            var bbcaiji = bbdata.caijizhan||[];
                        } catch (e) {
                            log('接口导入失败：'+e.message); 
                            return "toast://导入失败：连接无效或内容有错";
                        }

                        var urls= [];
                        for(var i in bbjiekou){
                            urls.push({ "name" : bbjiekou[i].name, "url" : bbjiekou[i].url})
                        }
                        for(var i in bbcaiji){
                            urls.push({ "name" : bbcaiji[i].name, "url" : /\/api.php^/.test(bbcaiji[i].url)?bbcaiji[i].url+"/provide/vod":bbcaiji[i].url})
                        }
                        var jknum = jiekouchuli('save',urls);
                        if(jknum<0){
                            return'toast://导入失败，内容异常';
                        }else{
                            let zhujiexi = bbdata.zhujiexi||"";
                            let zjiexi = zhujiexi.split('#');
                            let beiyongjiexi = bbdata.beiyongjiexi||"";
                            let bjiexi = beiyongjiexi.split('#');
                            var jiexi = zjiexi.concat(bjiexi);
                            if(jiexi.length>0){
                                return $("接口导入已完成，成功保存："+jknum+ "，确定要继续导入解析吗？\n不建议导入，因为99%是失效的").confirm((jiexi)=>{
                                    try{
                                        
                                        var jxfilepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                        var jxdatafile = fetch(jxfilepath);
                                        if(jxdatafile != ""){
                                            eval("var jxdatalist=" + jxdatafile+ ";");
                                        }else{
                                            var jxdatalist = [];
                                        }
                                        var jxnum = 0;
                                        for (var i=0;i<jiexi.length;i++) {
                                            if(/^http/.test(jiexi[i])&&!jxdatalist.some(item => item.parse ==jiexi[i])){
                                                let namebh = parseInt(jxdatalist.length)+parseInt(jiexi.length);
                                                let arr  = { "name": "bb"+namebh, "parse": jiexi[i], "stopfrom": [], "priorfrom": [], "sort": 1 };
                                                jxdatalist.push(arr);
                                                jxnum = jxnum + 1;
                                            }
                                        }
                                        if(jxnum>0){
                                            writeFile(jxfilepath, JSON.stringify(jxdatalist));
                                            return "toast://导入完成，解析保存："+jxnum;
                                        }else{
                                            return "toast://无解析";
                                        }
                                    } catch (e) {
                                        log('解析导入失败：'+e.message); 
                                        return "toast://解析导入失败";
                                    }
                                }, jiexi)
                            }else{
                                return "接口导入已完成，成功保存："+jknum;
                            }
                        }
                }, jiekouchuli),
                col_type: "text_3"
            });
            d.push({
                title: 'TVb导入',
                url:$("","输入TVb资源地址").input((jiekouchuli) => {
                    try{
                        var html = fetch(input);
                        if(!/https:\/\/i.*memory.coding.net/.test(input)){
                            var lx ="TVb";
                            var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
                            html = html.replace(reg, function(word) { 
                                return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                            }).replace(/#.*?\n/g,"");
                            var data = JSON.parse(html);
                            var jiekou = data.sites;
                            var jiexi = data.parses;
                        }else{
                            var lx =".";
                                var jiekou = html.split('\n');
                            var jiexi = [];
                        }
                    } catch (e) {
                        log('接口导入失败：'+e.message); 
                        return "toast://导入失败：连接无效或内容有错";
                    }

                    var urls= [];
                    for(var i in jiekou){
                        if(lx=="."){
                            urls.push({ "name": jiekou[i].split('@')[1].split('=')[0], "url": jiekou[i].split('@')[1].split('=')[1].split('#')[0], "group":jiekou[i].split('@')[0]})
                        }else{
                            if(jiekou[i].api=="csp_AppYsV2"){
                                urls.push({ "name": jiekou[i].name, "url": jiekou[i].ext})
                            }
                            if(jiekou[i].type==1){
                                urls.push({ "name": jiekou[i].name, "url": jiekou[i].api})
                            }
                        }
                    }
                    var jknum = jiekouchuli('save',urls);
                    if(jknum<0){
                        return'toast://导入失败，内容异常';
                    }else{
                        if(jiexi.length>0){
                            return $("接口导入已完成，成功保存："+jknum+ "，确定要继续导入解析吗？\n不建议导入，因为99%是失效的").confirm((jiexi)=>{
                                try{
                                    var jxfilepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                    var jxdatafile = fetch(jxfilepath);
                                    if(jxdatafile != ""){
                                        eval("var jxdatalist=" + jxdatafile+ ";");
                                    }else{
                                        var jxdatalist = [];
                                    }
                                    var jxnum = 0;
                                    for (var i=0;i<jiexi.length;i++) {
                                        if(/^http/.test(jiexi[i].url)&&!jxdatalist.some(item => item.parse ==jiexi[i].url)){
                                            let arr  = { "name": jiexi[i].name, "parse": jiexi[i].url, "stopfrom": [], "priorfrom": [], "sort": 1 };
                                            jxdatalist.push(arr);
                                            jxnum = jxnum + 1;
                                        }
                                    }
                                    if(jxnum>0){
                                        writeFile(jxfilepath, JSON.stringify(jxdatalist));
                                    }else{
                                        return "toast://无解析";
                                    }
                                } catch (e) {
                                    log('解析导入失败：'+e.message);
                                    return "toast://解析导入失败";
                                }
                            },jiexi)
                        }else{
                            return "接口导入已完成，成功保存："+jknum;
                        }
                    }
                }, jiekouchuli),
                col_type: "text_3"
            });
            setHomeResult(d);
        }, jiekouchuli),
        img: "https://lanmeiguojiang.com/tubiao/ke/156.png",
        col_type: "icon_small_3"
    });
    if(getMyVar('guanli', 'jk')=="jk"){
        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
    }else if(getMyVar('guanli', 'jk')=="jx"){
        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
    }
    var datafile = fetch(filepath);
    if(datafile != ""){
        eval("var datalist=" + datafile+ ";");
    }else{
        var datalist = [];
    }
    
    d.push({
        col_type: "line_blank"
    });

    function jiekou(lx,data,jiekouchuli) {
        addListener("onClose", $.toString(() => {
            clearMyVar('apiname');
            clearMyVar('apiurl');
            clearMyVar('apitype');
            clearMyVar('apiua');
            clearMyVar('apiurls');
            clearMyVar('addtype');
            clearMyVar('isload');
            clearMyVar('apigroup');
        }));

        var d = [];
        if(lx!="update"){
            setPageTitle("♥接口管理-新增");
            d.push({
                title: '添加方式：点击切换',
                col_type:'text_1',
                url: $('#noLoading#').lazyRule(()=>{
                    if(getMyVar('addtype', '1')=="1"){
                        putMyVar('addtype', '2');
                    }else{
                        putMyVar('addtype', '1');
                    }
                    refreshPage(false);
                    return'toast://已切换';
                })
            });
        }else{
            if(getMyVar('isload', '0')=="0"){
                setPageTitle("♥接口管理-变更");
                putMyVar('apiname', data.name);
                putMyVar('apiurl', data.url);
                putMyVar('apitype', data.type);
                putMyVar('apiua', data.ua);
                putMyVar('apigroup', data.group?data.group:"");
                putMyVar('isload', '1');
            }
        }
        if(getMyVar('addtype', '1')=="1"){
            d.push({
                title:'apiname',
                col_type: 'input',
                desc: "接口名称",
                extra: {
                    titleVisible: false,
                    defaultValue: getMyVar('apiname', ''),
                    onChange: 'putMyVar("apiname",input)'
                }
            });
            d.push({
                title:'apiurl',
                col_type: 'input',
                desc: "接口地址",
                extra: {
                    titleVisible: false,
                    defaultValue: getMyVar('apiurl', ''),
                    onChange: 'putMyVar("apiurl",input)'
                }
            });
            d.push({
                title: getMyVar('apitype', '')==""?'类型：自动识别':'类型：'+getMyVar('apitype'),
                col_type:'text_1',
                url:$(["v1","app","v2","iptv","cms","自动"],3).select(()=>{
                    if(input=="自动"){
                        clearMyVar('apitype');
                    }else{
                        putMyVar('apitype', input);
                    }
                    refreshPage(false);
                    return'toast://已选择类型：' + input;
                })
            });
        }else{
            d.push({
                title:'批量添加',
                col_type: 'input',
                desc: "一行一个接口\n格式：名称#接口地址#类型#分组\n格式：名称#接口地址#类型\n格式：名称#接口地址\n类型可以留空，自动判断\n分组可以留空，空则取类型\n分隔符#可以用,号代替",
                extra: {
                    titleVisible: false,
                    type: "textarea",
                    height: 10,
                    onChange: 'putMyVar("apiurls",input)'
                }
            });
        }
        
        d.push({
            title: 'User-Agent：'+getMyVar('apiua','Dalvik/2.1.0'),
            col_type:'text_1',
            url:$(["Dalvik/2.1.0","Dart/2.13 (dart:io)","MOBILE_UA","PC_UA","自定义"],2).select(()=>{
                if(input=="自定义"){
                    return $(getMyVar('apiua','Dalvik/2.1.0'),"输入指定ua").input(()=>{
                        putMyVar('apiua', input);
                        refreshPage(true);
                        return "toast://已指定ua："+input;
                    })
                }else{
                    putMyVar('apiua', input);
                    refreshPage(true);
                    return "toast://已指定ua："+input;
                }
            })
        });
        d.push({
            title:'分组名称：' + getMyVar('apigroup', ''),
            col_type: 'text_1',
            url:$(getMyVar('apigroup', ''),"输入分组名称，为空则取类型").input(()=>{
                putMyVar('apigroup', input);
                refreshPage(true);
                return "toast://"+input;
            })
        });
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        
        d.push({
            title:'测试',
            col_type:'text_3',
            url: $(getMyVar("testkey","我的"),"输入测试搜索关键字").input((jiekouchuli)=>{
                    putMyVar("testkey",input);
                    if(getMyVar('addtype', '1')=="1"&&!/^http/.test(getMyVar('apiurl',''))){return "toast://接口地址不正确"}
                    return $('hiker://empty#noRecordHistory##noHistory#').rule((name,jiekouchuli) => {
                        let apiurl = getMyVar('apiurl');
                        let apiname = getMyVar('apiname');
                        let apiurls = getMyVar('apiurls');
                        let apiua = getMyVar('apiua','Dalvik/2.1.0');
                        let datalist = [];
                        if(getMyVar('addtype', '1')=="1"&&apiname&&apiurl){
                            let urltype = getMyVar('apitype')||jiekouchuli("type",apiurl);
                            let urlgroup = getMyVar('apigroup','');
                            datalist.push({"name": apiname, "url": apiurl, "ua": apiua, "type": urltype, "group": urlgroup });
                        }else if(getMyVar('addtype', '1')=="2"&&apiurls){
                            var urls = apiurls.replace(/,|，/g,"#").split('\n');
                            for (var i in urls) {
                                let urlname = urls[i].split('#')[0];
                                let urlurl = urls[i].split('#')[1];
                                let urltype = urls[i].split('#')[2]||jiekouchuli("type",urlurl);
                                let urlgroup = urls[i].split('#')[3]||getMyVar('apigroup','');
                                if(!datalist.some(item => item.url ==urlurl)&&urlname&&/^http/.test(urlurl)&&urltype){
                                    let arr  = { "name": urlname, "url": urlurl, "ua": apiua, "type": urltype, "group": urlgroup };
                                    datalist.push(arr);
                                }
                            }
                        }else{
                            return "toast://无法测试，检查项目填写完整性";
                        }
                        require(config.依赖);
                        xunmi(name, datalist);
                    },input, jiekouchuli);
                },jiekouchuli)
        });
        if(lx=="update"){
            d.push({
                title:'删除',
                col_type:'text_3',
                url: $("确定删除接口："+data.name).confirm((dataurl)=>{
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
                    back(true);
                    return "toast://已删除";
                }, data.url)
            });   
        }else{
            d.push({
                title:'清空',
                col_type:'text_3',
                url:$("确定要清空上面填写的内容？").confirm(()=>{
                        clearMyVar('apiname');
                        clearMyVar('apiurl');
                        clearMyVar('apiurls');
                        clearMyVar('apitype');
                        return "toast://已清空";
                    })
            });
        }
        d.push({
            title:'保存',
            col_type:'text_3',
            url: $().lazyRule((lx,data,jiekouchuli)=>{
                if(getMyVar('addtype', '1')=="1"&&!/^http/.test(getMyVar('apiurl',''))){return "toast://接口地址不正确"}
                var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                var datafile = fetch(filepath);
                if(datafile != ""){
                    eval("var datalist=" + datafile+ ";");
                }else{
                    var datalist = [];
                }

                let apiurl = getMyVar('apiurl');
                let apiname = getMyVar('apiname');
                let apiurls = getMyVar('apiurls');
                let apiua = getMyVar('apiua','Dalvik/2.1.0');
                if(getMyVar('addtype', '1')=="1"&&apiname&&apiurl){
                    let urltype = getMyVar('apitype')||jiekouchuli("type",apiurl);
                    let apigroup = getMyVar('apigroup','');
                    if(lx=="update"&&(apiurl!=data.url||apiname!=data.name||apiua!=data.ua||urltype!=data.type||apigroup!=data.group)){
                        for(var i=0;i<datalist.length;i++){
                            if(datalist[i].url==data.url){
                                datalist.splice(i,1);
                                break;
                            }
                        }
                    }
                    
                    if(urltype !=""){
                        if(!datalist.some(item => item.url ==apiurl)){
                            let arr  = { "name": apiname, "url": apiurl, "ua": apiua, "type": urltype, "group": apigroup };
                            datalist.unshift(arr);
                            writeFile(filepath, JSON.stringify(datalist));
                            back(true);
                            return "toast://已保存";
                        }else{
                            return "toast://已存在";
                        }
                    }else{
                        return "toast://暂不支持的api接口类型";
                    }
                }else if(getMyVar('addtype', '1')=="2"&&apiurls){
                    var urls = apiurls.replace(/,|，/g,"#").split('\n');
                    var urlnum = 0;

                    for (var i in urls) {
                        let urlname = urls[i].split('#')[0];
                        let urlurl = urls[i].split('#')[1];
                        let urltype = urls[i].split('#')[2]||jiekouchuli("type",urlurl);
                        let urlgroup = urls[i].split('#')[3]||urltype;
                        if(!datalist.some(item => item.url ==urlurl)&&urlname&&/^http/.test(urlurl)&&urltype){
                            let arr  = { "name": urlname, "url": urlurl, "ua": apiua, "type": urltype, "group": urlgroup };
                            datalist.push(arr);
                            urlnum = urlnum + 1;
                        }
                    }
                    if(urlnum>0){writeFile(filepath, JSON.stringify(datalist));}
                    back(true);
                    return "toast://合计："+urls.length+"，保存："+urlnum;
                }else{
                    return "toast://无法保存，检查项目填写完整性";
                }
            }, lx, data, jiekouchuli)
        });
        setHomeResult(d);
    }
    function jiexi(lx,data) {
        addListener("onClose", $.toString(() => {
            clearMyVar('parsename');
            clearMyVar('parseurl');
            clearMyVar('parseurls');
            clearMyVar('addtype');
            clearMyVar('stopfrom');
            clearMyVar('priorfrom');
            //refreshPage(false);
        }));
        var d = [];
        if(lx!="update"){
            setPageTitle("♥解析管理-新增");
            d.push({
                title: '添加方式：点击切换',
                col_type:'text_1',
                url: $('#noLoading#').lazyRule(()=>{
                    if(getMyVar('addtype', '1')=="1"){
                        putMyVar('addtype', '2');
                    }else{
                        putMyVar('addtype', '1');
                    }
                    refreshPage(false);
                    return'toast://已切换';
                })
            });
        }else{
            setPageTitle("♥解析管理-变更");
        }
        
        if(getMyVar('addtype', '1')=="1"){
            d.push({
                title:'parseurl',
                col_type: 'input',
                desc: "解析名称",
                extra: {
                    titleVisible: false,
                    defaultValue: getMyVar('parsename', lx=="update"?data.name:""),
                    onChange: 'putMyVar("parsename",input)'
                }
            });
            d.push({
                title:'parseurl',
                col_type: 'input',
                desc: "链接地址",
                extra: {
                    titleVisible: false,
                    defaultValue: getMyVar('parseurl', lx=="update"?data.url:""),
                    onChange: 'putMyVar("parseurl",input)'
                }
            });
            let apistopfrom = getMyVar('stopfrom', lx=="update"?data.stopfrom:"");
            d.push({
                title:'排除片源：' + apistopfrom,
                col_type: 'text_1',
                url:$(apistopfrom,"输入排除的片源标识，以逗号隔开，为空则自动管理").input(()=>{
                    putMyVar('stopfrom', input);
                    refreshPage(false);
                    return "toast://"+input;
                })
            });
            let apipriorfrom = getMyVar('priorfrom', data&&data.priorfrom?data.priorfrom:"");
            d.push({
                title:'优先片源：' + apipriorfrom,
                col_type: 'text_1',
                url:$('hiker://empty#noRecordHistory##noHistory#').rule((apipriorfrom) => {
                    var d = [];
                    d.push({
                        title: '优先片源标识不为空时，优先级在上次优先之后',
                        col_type: "rich_text"
                    });
                    d.push({
                        col_type: "line"
                    });
                    d.push({
                        title:'优先片源',
                        col_type: 'input',
                        desc: getMyVar('priorfrom',''),
                        extra: {
                            titleVisible: false,
                            defaultValue: getMyVar('priorfrom', apipriorfrom),
                            onChange: 'putMyVar("priorfrom",input)'
                        }
                    });
                    d.push({
                        title: '选择需要优先的片源标识>',
                        col_type: "rich_text"
                    });
                    d.push({
                        col_type: "line_blank"
                    });
                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                    var recordparse=fetch(recordfile);
                    if(recordparse!=""){
                        eval("var recordlist=" + recordparse+ ";");
                    }else{
                        var recordlist={};
                    }
                    var froms = recordlist.from || ['youku','mgtv','iqiyi','qq'];
                    for(var i in froms){
                        d.push({
                            title:froms[i],
                            col_type:'text_4',
                            url: $('#noLoading#').lazyRule((from)=>{
                                    let priorfrom = getMyVar('priorfrom','')?getMyVar('priorfrom','').replace(/,|，/g,",").split(','):[];
                                    if(priorfrom.indexOf(from)==-1){
                                        priorfrom.push(from);
                                        var sm = '选择优先>'+from;
                                    }else{
                                        function removeByValue(arr, val) {
                                            for(var i = 0; i < arr.length; i++) {
                                                if(arr[i] == val) {
                                                arr.splice(i, 1);
                                                break;
                                                }
                                            }
                                        }
                                        removeByValue(priorfrom,from);
                                        var sm = '删除优先>'+from;
                                    }
                                    putMyVar('priorfrom',priorfrom.join(','));
                                    refreshPage(false);
                                    return 'toast://'+sm;
                            }, froms[i])
                        })
                    }
                    d.push({
                        col_type: "line_blank"
                    });
                    d.push({
                        title:'选择好了，点此返回',
                        col_type:'text_center_1',
                        url: $('#noLoading#').lazyRule(()=>{
                            back(true);
                            return "hiker://empty";
                        })
                    });
                    setHomeResult(d);
                },apipriorfrom)
            });
        }else{
            d.push({
                title:'批量添加',
                col_type: 'input',
                desc: "一行一个解析\n格式：解析名称#链接地址\n分隔符#可以用,号代替",
                extra: {
                    titleVisible: false,
                    type: "textarea",
                    height: 10,
                    onChange: 'putMyVar("parseurls",input)'
                }
            });
        }
        d.push({
            title:'测试',
            col_type:'text_3',
            url: $().lazyRule((data)=>{
                if(data){
                    var dataurl = data.url;
                }else{
                    var dataurl = getMyVar('parseurl');
                }
                if(!dataurl||!/^http/.test(dataurl)){
                    return "toast://获取解析地址失败，无法测试";
                }
                //if(findItem('jxfrom')){
                //    deleteItemByCls('jxtest');
                //}else{
                    addItemAfter('jxline',{
                        title: '选择测试片源',
                        col_type: "rich_text",
                        extra:{
                            id: 'jxfrom',
                            cls: 'jxtest'
                        }
                    })
                    addItemAfter('jxfrom',{
                        col_type: "line",
                        extra:{
                            id: 'jxline2',
                            cls: 'jxtest'
                        }
                    })
                    var filepath = 'hiker://files/rules/Src/Juying/testurls.json';
                    var datafile = fetch(filepath);
                    if(datafile != ""){
                        eval("var urls=" + datafile+ ";");
                    }else{
                        var urls = {
                            "1905": "https://vip.1905.com/m/play/1566444.shtml",
                            "爱奇艺": "https://m.iqiyi.com/v_sa04mvdzk8.html",
                            "优酷": "https://v.youku.com/v_show/id_XNDc0MDE1NTk1Mg==.html",
                            "腾讯": "https://v.qq.com/x/cover/mzc00200frpbpgb/r0042i6x2xp.html",
                            "芒果": "https://www.mgtv.com/b/349253/10424300.html",
                            "哔哩哔哩": "https://m.bilibili.com/bangumi/play/ep471494",
                            "搜狐": "https://m.tv.sohu.com/v/MjAyMjAxMDkvbjYwMTE1MjExMy5zaHRtbA==.html",
                            "西瓜": "https://www.ixigua.com/6532733952283640333?logTag=fbbfc792d3498d67c0fd",
                            "PPTV": "https://v.pptv.com/show/zVn3dJXt1xV49l4.html",
                            "咪咕": "https://m.miguvideo.com/mgs/msite/prd/detail.html?cid=676935232&mgdbid=&channelId=CAAAB000902015500000000",
                            "乐视": "http://www.le.com/ptv/vplay/26958608.html",
                            "融兴": "RongXingVR-5145649549215",
                            "龙腾": "LT-2a2ac4570caa6b6e987b05371d8a945e",
                            "旋风": "xfy-3be76512eb721f0b",
                            "五毒云": "wuduyun-90db2047aa43104c8821468d03258c52",
                            "思古": "sigu-1359862022c153dc90285a5a07ca42fda894ff0ee5_1",
                            "人人迷": "renrenmi-3bcde575190081f6",
                            "CL4K": "https://3.ruifenglb.com/play/1650861537.m3u8",
                            "多多": "https://m3u8.cache.suoyo.cc/m3u8/202206/3/e04f658333a07ef659d77cf7c2546400aee0f6bd.m3u8",
                            "新苍蓝": "canglan-42d3f9790dcdc5adc1345516174b6823",
                            "乐多": "XMMTk2Mzk5MDAwMF8xMA==",
                            "雪人": "xueren-1653287099"
                        }
                        writeFile(filepath, JSON.stringify(urls));
                    }
                    
                    urls['自定义'] = "";
                    for(var key in urls){

                        addItemBefore('jxline2', {
                            title: key,
                            url: key!="自定义"?$('#noRecordHistory##noHistory#').lazyRule((vipUrl,parseurl)=>{
                                try{
                                    eval("var config =" + fetch("hiker://files/cache/MyParseSet.json"));
                                    eval(fetch(config.cj));
                                    return aytmParse(vipUrl,parseurl);
                                }catch(e){
                                    return "toast://没有断插，无法测试";
                                };
                            },urls[key],dataurl):$("","输入自定义播放地址").input((parseurl) => {
                                if(input==""){
                                    return "toast://未输入自定义地址，无法测试";
                                }else{
                                    return $().lazyRule((vipUrl,parseurl)=>{
                                        try{
                                            eval("var config =" + fetch("hiker://files/cache/MyParseSet.json"));
                                            eval(fetch(config.cj));
                                            return aytmParse(vipUrl,parseurl);
                                        }catch(e){
                                            return "toast://没有断插，无法测试";
                                        };
                                    }, input, parseurl)
                                }
                            }, dataurl),
                            col_type: "text_3",
                            extra:{
                                cls: 'jxtest'
                            }
                        })
                    }
                    addItemBefore('jxline2', {
                        title: '编辑测试',
                        url: $('#noRecordHistory##noHistory#').lazyRule(()=>{
                            return "editFile://hiker://files/rules/Src/Juying/testurls.json";
                        }),
                        col_type: "text_3",
                        extra:{
                            cls: 'jxtest'
                        }
                    })
                //}
                updateItem('jxtest', {
                    title:'测试',
                    col_type:'text_3',
                    url: "hiker://empty"
                })
                return "hiker://empty";
            },data),
            extra:{
                id: 'jxtest'
            }
        });
        if(lx=="update"){
            d.push({
                title:'删除',
                col_type:'text_3',
                url: $("确定删除解析："+data.url).confirm((dataurl)=>{
                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                    var datafile = fetch(filepath);
                    eval("var datalist=" + datafile+ ";");
                    for(var i=0;i<datalist.length;i++){
                        if(datalist[i].parse==dataurl){
                            datalist.splice(i,1);
                            break;
                        }
                    }
                    writeFile(filepath, JSON.stringify(datalist));
                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                    var recordparse=fetch(recordfile);
                    if(recordparse!=""){
                        eval("var recordlist=" + recordparse+ ";");
                    }else{
                        var recordlist={};
                    }
                    var excludeparse = recordlist.excludeparse||[];
                    if(excludeparse.length>0){
                        function removeByValue(arr, val) {
                            for(var i = 0; i < arr.length; i++) {
                                if(arr[i] == val) {
                                arr.splice(i, 1);
                                break;
                                }
                            }
                        }
                        removeByValue(excludeparse,dataurl);
                        writeFile(recordfile, JSON.stringify(recordlist));
                    }
                    back(true);
                    return "toast://已删除";
                }, data.url)
            });    
        }else{
            d.push({
                title:'清空',
                col_type:'text_3',
                url:$("确定要清空上面填写的内容？").confirm(()=>{
                    clearMyVar('parsename');
                    clearMyVar('parseurl');
                    clearMyVar('parseurls');
                    refreshPage(false);
                    return "toast://已清空";
                })
            });
        }        
        d.push({
            title:'保存',
            col_type:'text_3',
            url: $().lazyRule((lx,data)=>{
                var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                var datafile = fetch(filepath);
                if(datafile != ""){
                    eval("var datalist=" + datafile+ ";");
                }else{
                    var datalist = [];
                }
                let parseurl = getMyVar('parseurl');
                let parsename = getMyVar('parsename');
                let parseurls = getMyVar('parseurls');
                let parsestopfrom = getMyVar('stopfrom',"");
                let pasrepriorfrom = getMyVar('priorfrom',"");
                if(getMyVar('addtype', '1')=="1"&&parseurl&&parsename){
                    if(lx=="update"&&(parseurl!=data.url||parsename!=data.name||parsestopfrom!=data.stopfrom||pasrepriorfrom!=data.priorfrom)){
                        for(var i=0;i<datalist.length;i++){
                            if(datalist[i].parse==data.url){
                                datalist.splice(i,1);
                                break;
                            }
                        }
                    }
                    if(!datalist.some(item => item.parse ==parseurl)){
                        let stopfrom = parsestopfrom.replace('，',',').split(',');
                        stopfrom = stopfrom.filter(n => n);
                        let priorfrom = pasrepriorfrom.replace('，',',').split(',');
                        priorfrom = priorfrom.filter(n => n);
                        let arr  = { "name": parsename, "parse": parseurl, "stopfrom": stopfrom, "priorfrom": priorfrom, "sort": 1 };
                        datalist.unshift(arr);
                        writeFile(filepath, JSON.stringify(datalist));
                        back(true);
                        return "toast://已保存";
                    }else{
                        return "toast://已存在";
                    }
                }else if(getMyVar('addtype', '1')=="2"&&parseurls){
                    let urls = parseurls.replace(/,|，/g,"#").split('\n');
                    let urlnum = 0;

                    for (var i in urls) {
                        let urlname = urls[i].split('#')[0];
                        let urlurl = urls[i].split('#')[1];
                        if(!datalist.some(item => item.url ==urlurl)&&urlname&&/^http/.test(urlurl)){
                            let arr  = { "name": urlname, "parse": urlurl, "stopfrom": [], "priorfrom": [], "sort": 1 };
                            datalist.push(arr);
                            urlnum = urlnum + 1;
                        }
                    }
                    if(urlnum>0){writeFile(filepath, JSON.stringify(datalist));}
                    back(true);
                    return "toast://合计："+urls.length+"，保存："+urlnum;
                }else{
                    return "toast://无法保存，检查项目填写完整性";
                }
                    
            },lx,data)
        });
        d.push({
            col_type: "line",
            extra:{id:'jxline'}
        })
        setHomeResult(d);
    }
    function guanlidata(data,jiekou,jiexi,jiekouchuli) {
        try{
            if(getMyVar('guanli', 'jk')=="jk"){
                var czdatalist = data.map((datalist)=>{
                    let dataurl = datalist.url;
                    let dataname = datalist.name;
                    let dataua = datalist.ua;
                    let datatype = datalist.type;
                    let datagroup = datalist.group;
                    return {
                        title: dataname + ' ('+datatype+')' + (datagroup&&datagroup!=datatype?' [' + datagroup + ']':""),
                        desc: dataurl,
                        url: getMyVar('guanlicz','0')=="1"?$('#noLoading#').lazyRule((name,url)=>{
                                copy(name+'#'+url);
                                return "hiker://empty";
                            },dataname, dataurl):getMyVar('guanlicz','0')=="2"?$('hiker://empty#noRecordHistory##noHistory#').rule((jiekou,data,jiekouchuli) => {
                                jiekou('update', data, jiekouchuli);
                            }, jiekou, {name:dataname, url:dataurl, ua:dataua, type:datatype, group:datagroup}, jiekouchuli):$("确定删除接口："+dataname).confirm((dataurl)=>{
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
                                refreshPage(false);
                                return "toast://已删除";
                            }, dataurl),
                        col_type: 'text_1',
                        extra: {
                            cls: "guanlidatalist"
                        }
                    }

                })
            }else{
                //定义排序函数
                function sortData(a, b) {
                    try{
                        if(a.sort!=b.sort){
                            return a.sort - b.sort
                        }else{
                            return a.id - b.id;
                        }
                    }catch(e){
                        return a.id - b.id;
                    }
                };
                if(data.length > 0){data.sort(sortData)};

                var czdatalist = data.map((datalist)=>{
                    let dataurl = datalist.parse;
                    let dataname = datalist.name;
                    let datastopfrom = datalist.stopfrom||[];
                    let datapriorfrom = datalist.priorfrom||"";
                    let datasort = datalist.sort||1;
                    return {
                        title: datasort+'-'+dataname+'-'+dataurl,
                        desc: "优先强制：" + datapriorfrom + "" + "\n排除片源：" + datastopfrom + "",
                        url: getMyVar('guanlicz','0')=="1"?$('#noLoading#').lazyRule((name,url)=>{
                                copy(name+"#"+url);
                                return "hiker://empty";
                            },dataname,dataurl):getMyVar('guanlicz','0')=="2"?$('hiker://empty#noRecordHistory##noHistory#').rule((jiexi,data) => {
                                jiexi('update', data);
                            }, jiexi, {name:dataname, url:dataurl, stopfrom:datastopfrom+"", priorfrom:datapriorfrom+""}):$("确定删除解析："+dataname).confirm((dataurl)=>{
                                var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                var datafile = fetch(filepath);
                                eval("var datalist=" + datafile+ ";");
                                for(var i=0;i<datalist.length;i++){
                                    if(datalist[i].parse==dataurl){
                                        datalist.splice(i,1);
                                        break;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                                var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                                var recordparse=fetch(recordfile);
                                if(recordparse!=""){
                                    eval("var recordlist=" + recordparse+ ";");
                                }else{
                                    var recordlist={};
                                }
                                var excludeparse = recordlist.excludeparse||[];
                                if(excludeparse.length>0){
                                    function removeByValue(arr, val) {
                                        for(var i = 0; i < arr.length; i++) {
                                            if(arr[i] == val) {
                                            arr.splice(i, 1);
                                            break;
                                            }
                                        }
                                    }
                                    removeByValue(excludeparse,dataurl);
                                    writeFile(recordfile, JSON.stringify(recordlist));
                                }
                                refreshPage(false);
                                return "toast://已删除";
                            }, dataurl),
                        col_type: 'text_1',
                        extra: {
                            cls: "guanlidatalist"
                        }
                    }
                })
            }
            return czdatalist;
        } catch (e) {
            log(e.message);
            return [];
        }
    }
    d.push({
        title: '增加',
        url: getMyVar('guanli', 'jk')=="jk"?$('hiker://empty#noRecordHistory##noHistory#').rule((jiekou,jiekouchuli) => {
            jiekou('add','',jiekouchuli)
        }, jiekou, jiekouchuli):$('hiker://empty#noRecordHistory##noHistory#').rule((jiexi) => {
            jiexi('add');
        }, jiexi),
        img: "https://lanmeiguojiang.com/tubiao/more/25.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: getMyVar('guanlicz','0')=="1"?'复制':getMyVar('guanlicz','0')=="2"?'变更':getMyVar('guanlicz','0')=="3"?'删除':'操作',
        url: $(["复制","变更","删除","清空"],2,"选择操作功能项").select(()=>{
                if(input=="复制"){
                    putMyVar('guanlicz','1');
                    refreshPage(false);
                    return 'toast://已切换到复制模式';
                }else if(input=="变更"){
                    putMyVar('guanlicz','2');
                    refreshPage(false);
                    return 'toast://已切换到变更模式';
                }else if(input=="删除"){
                    putMyVar('guanlicz','3');
                    refreshPage(false);
                    return 'toast://已切换到删除模式';
                }else if(input=="清空"){
                    if(getMyVar('guanli', 'jk')=="jk"){
                        var sm = "接口";
                    }else{
                        var sm = "私有解析";
                    }
                    return $("确定要删除本地所有的"+sm+"吗？").confirm(()=>{
                        if(getMyVar('guanli', 'jk')=="jk"){
                            var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                        }else if(getMyVar('guanli', 'jk')=="jx"){
                            var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                        }
                        var datalist = [];
                        writeFile(filepath, JSON.stringify(datalist));
                        refreshPage(false);
                        return 'toast://已全部清空';
                    })
                }
            }),
        img: getMyVar('guanlicz','0')=="1"?"https://lanmeiguojiang.com/tubiao/more/292.png":getMyVar('guanlicz','0')=="2"?"https://lanmeiguojiang.com/tubiao/more/275.png":getMyVar('guanlicz','0')=="3"?"https://lanmeiguojiang.com/tubiao/more/216.png":"https://lanmeiguojiang.com/tubiao/more/290.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: '导入',
        url: $("","聚影口令").input(()=>{
                try{
                    if((input.split('￥')[0]=="聚影接口"||input.split('￥')[0]=="聚影资源码")&&getMyVar('guanli', 'jk')=="jk"){
                        var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                        var sm = "聚影接口";
                    }else if((input.split('￥')[0]=="聚影解析"||input.split('￥')[0]=="聚影资源码")&&getMyVar('guanli', 'jk')=="jx"){
                        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                        var sm = "聚影解析";
                    }else{
                        return "toast://无法识别的口令";
                    }
                    if(input.split('￥')[0]=="聚影资源码"){
                        var codelx = "dingyue";
                    }else{
                        var codelx = "share";
                    }
                    let pasteurl = input.split('￥')[1];
                    let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', pasteurl));
                    if(pasteurl&&!/^error/.test(text)){
                        let pastedata = JSON.parse(base64Decode(text));
                        var datafile = fetch(filepath);
                        if(datafile != ""){
                            eval("var datalist=" + datafile+ ";");
                        }else{
                            var datalist = [];
                        }
                        var urlnum = 0;

                        if(getMyVar('guanli', 'jk')=="jk"){
                            if(codelx=="share"){
                                var pastedatalist = pastedata;
                            }else if(codelx=="dingyue"){
                                var pastedatalist = pastedata.jiekou;
                            }
                            for (var i in pastedatalist) {
                                if(!datalist.some(item => item.url ==pastedatalist[i].url)){
                                    //let arr  = { "name" : pastedatalist[i].name, "url" : pastedatalist[i].url, "ua" : pastedatalist[i].ua, "type" : pastedatalist[i].type, "group" : pastedatalist[i].group?pastedatalist[i].group:pastedatalist[i].type };
                                    datalist.push(pastedatalist[i]);
                                    urlnum = urlnum + 1;
                                }
                            }
                        }else{
                            if(codelx=="share"){
                                var pastedatalist = pastedata;
                            }else if(codelx=="dingyue"){
                                var pastedatalist = pastedata.jiexi;
                            }
                            for (var i in pastedatalist) {
                                if(!datalist.some(item => item.parse ==pastedatalist[i].parse)){
                                    //let arr  = { "name" : pastedatalist[i].name, "parse" : pastedatalist[i].parse, "stopfrom" : pastedatalist[i].stopfrom };
                                    datalist.push(pastedatalist[i]);
                                    urlnum = urlnum + 1;
                                }
                            } 
                        }
                        if(urlnum>0){
                            writeFile(filepath, JSON.stringify(datalist));
                            refreshPage(false);
                        }
                        return "toast://"+sm+"合计："+pastedatalist.length+"，保存："+urlnum;
                    }else{
                        return "toast://口令错误或已失效";
                    }
                } catch (e) {
                    return "toast://无法识别的口令";
                }
            }),
        img: "https://lanmeiguojiang.com/tubiao/more/43.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: '分享',
        url: datalist.length==0?'toast://数据为空，无法分享':$().lazyRule(()=>{
                if(getMyVar('guanli', 'jk')=="jk"){
                    var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                    var sm = "聚影接口";
                }else{
                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                    var sm = "聚影解析";
                }
                var datafile = fetch(filepath);
                eval("var datalist=" + datafile+ ";");
                let text = JSON.stringify(datalist);
                var num = ''; 
                for (var i = 0; i < 6; i++) {
                    num += Math.floor(Math.random() * 10);
                }
                var pasteurl = JSON.parse(request('https://netcut.cn/api/note/create/', {
                    headers: { 'Referer': 'https://netcut.cn/' },
                    body: 'note_name=Juying'+num+'&note_content='+base64Encode(text)+'&note_pwd=0&expire_time=3600',
                    method: 'POST'
                })).data.note_id || "";

                if(pasteurl){
                    let code = sm+'￥'+aesEncode('Juying', pasteurl)+'￥1小时内有效';
                    copy(code);
                    return "toast://聚影分享口令已生成";
                }else{
                    return "toast://分享失败，剪粘板异常";
                }
            }),
        img: "https://lanmeiguojiang.com/tubiao/more/3.png",
        col_type: "icon_small_4"
    });
    d.push({
        col_type: "line"
    });

    if(getMyVar('guanlicz','0')!="0"){
        d.push({
            title: "🔍",
            url: $.toString((guanlidata,datalist,jiekou,jiexi,jiekouchuli) => {
                    if(datalist.length>0){
                        deleteItemByCls('guanlidatalist');
                        var lists = datalist.filter(item => {
                            if(item.url){
                                return item.name.includes(input) || item.url.includes(input);
                            }else{
                                return item.name.includes(input) || item.parse.includes(input);
                            }
                        })
                        let gldatalist = guanlidata(lists,jiekou,jiexi,jiekouchuli);
                        addItemBefore('guanliloading', gldatalist);
                    }
                    return "hiker://empty";
                },guanlidata,datalist,jiekou,jiexi,jiekouchuli),
            desc: "搜你想要的...",
            col_type: "input",
            extra: {
                titleVisible: true
            }
        });
        
        let gldatalist = guanlidata(datalist,jiekou,jiexi,jiekouchuli);
        d = d.concat(gldatalist);
    }
    d.push( {
        title: '当前共有'+datalist.length+'个'+(getMyVar('guanli', 'jk')=="jk"?"接口":"私有解析"),
        url: "hiker://empty",
        col_type: "text_center_1",
        extra: {
            id: "guanliloading"
        }
    });
    setResult(d);
}

//寻觅片源
function xunmi(name,data) {
    addListener("onClose", $.toString(() => {
        clearMyVar('moviemore');
    }));
    putMyVar('moviemore','1');
    
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
        d.push({
            title: grouplist[i]+'('+lists.length+')',
            url: $('#noLoading#').lazyRule((bess,datalist,name,count)=>{
                    let beresults = [];
                    deleteItemByCls('xunmilist');
                    bess(datalist,beresults,name,count);
                    return'hiker://empty';
                },bess,lists,name,lists.length),
            col_type: "scroll_button",
            extra: {
                id: "grouplist"
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
        var num = 0;
        var cfgfile = "hiker://files/rules/Src/Juying/config.json";
        var Juyingcfg=fetch(cfgfile);
        if(Juyingcfg != ""){
            eval("var JYconfig=" + Juyingcfg+ ";");
            var xunminum = JYconfig['xunminum'] || 10;
            var xunmitimeout = JYconfig['xunmitimeout'] || 5;
        }else{
            var xunmitimeout = 5;
        }
        var task = function(obj) {
            let url_api = obj.url;
            if (obj.type=="v1") {
                let date = new Date();
                let mm = date.getMonth()+1;
                let dd = date.getDate();
                let key = (mm<10?"0"+mm:mm)+""+(dd<10?"0"+dd:dd);
                //mm<10?"0"+mm+""+dd:mm+""+dd;
                /*
                if(url_api.substr(url_api.length-1,1)=="/"){
                    url_api = url_api.substr(0,url_api.length-1);
                }*/
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
            }else{

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
                    
                    if(list.length>0&&obj.type=="cms"){
                        if(list[0].vod_name.indexOf(name)==-1){
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
                                    let vodpic = list.vod_pic||list.pic;
                                    let voddesc = list.vod_remarks||list.state||"";
                                    let appname = '‘‘’’<font color=#f13b66a>'+obj.name+'</font>';
                                    let vodurl = list.vod_id?url + list.vod_id:list.nextlink;
                                    return {
                                        title: vodname,
                                        desc: voddesc + '\n\n' + appname + ' ('+obj.type+')'+(obj.group?' ['+obj.group+']':''),
                                        pic_url: vodpic?vodpic + "@Referer=":"https://www.xawqxh.net/mxtheme/images/loading.gif",
                                        url: $("hiker://empty##" + vodurl + "#immersiveTheme#").rule((type,ua) => {
                                                require(config.依赖);
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
                    log(obj.name+'>'+e.message);
                    return {result:0, url:ssurl, apiurl:url_api};
                }
            }
            //网页
        };

        let Jklist = datalist.map((parse)=>{
            return {
                func: task,
                param: {
                    name: parse.name,
                    url: parse.url,
                    ua: parse.ua,
                    type: parse.type,
                    group: parse.group||""
                },
                id: parse.name
            }
        });
        
        be(Jklist, {
            func: function(obj, id, error, taskResult) {
                num = num + 1;
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
                
                if (success>=xunminum) {
                    //toast("我主动中断了");
                    //log("√线程中止");
                    return "break";
                }
                if(error){log(id+"-错误信息："+error);}
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
                    bess(datalist,beresults,name,count);
                    return "hiker://empty";
                },bess,datalist,beresults,name,count),
            col_type: "text_center_1",
            extra: {
                id: "loading"
            }
        });
    }
    if(count>0){bess(datalist,beresults,name,count);}
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
        }else{
            //后续网页类
        }
        var zt = 1;
        putMyVar('myurl', MY_URL);
    } else {
        var zt = 0;
    }
    //影片详情
    if (zt == 1) {
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
            let actor = json.vod_actor || "内详";
            let director = json.vod_director || "内详";
            let area = json.vod_area || "未知";
            let year = json.vod_year || "未知";
            let remarks = json.vod_remarks || "";
            let pubdate = json.vod_pubdate || json.vod_class || "";
            var details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
            var details2 = remarks + '\n' + pubdate;
            var pic = MY_PARAMS.pic || json.vod_pic;
            var desc = json.vod_blurb || '...';
        }else if (/iptv/.test(type)) {
            let actor = html.actor.join(",") || "内详";
            let director = html.director.join(",") || "内详";
            let area = html.area.join(",") || "未知";
            let year = html.pubtime || "未知";
            let remarks = html.trunk || "";
            let pubdate = html.type.join(",") || "";
            var details1 = '主演：' + actor.substring(0, 12) + '\n导演：' + director.substring(0, 12) + '\n地区：' + area + '   年代：' + year;
            var details2 = remarks + '\n' + pubdate;
            var pic = MY_PARAMS.pic || html.img_url;
            var desc = html.intro || '...';
            var arts = html.videolist;
            var conts = arts;
        }else{
            //网页
        }
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
        }else if (/cms/.test(type)) {
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
        }else if (/cms/.test(type)) {
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
                }else{
                    //网页
                }
                d.push({
                    title: playtitle.replace(/第|集|话|期|-/g, ''),
                    url: playurl + DTJX,
                    extra: { id: playurl, referer: playurl, ua: PC_UA, jsLoadingInject: true, blockRules: ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', '.css'] },
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
            if (/v1|app|v2|iptv/.test(type)) {
                var listone = list[0].split('$')[0];
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

//二级
function erji() {
    addListener("onClose", $.toString(() => {
        clearMyVar('SrcM3U8');
    }));
    var d = [];
    //加载本地自定义变量缓存文件
    //var configfile = config.依赖.match(/https.*\//)[0] + 'srcconfig.js';
    //require(configfile);

    //自动判断是否需要更新请求
    //if (getMyVar('myurl', '0') != MY_URL || !configvar.详情1 || configvar.标识 != MY_URL) {
        var html = fetch(MY_URL.split('##')[1]);
    //    var zt = 1;
    //    putMyVar('myurl', MY_URL);
    //} else {
    //    var zt = 0;
    //}

    //影片详情
    //if (zt == 1) {
        var json = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).detail.itemData;
        var plays = json.play.item_list;
        //log(plays);
        var shows = json.play_from_open_index;
        //log(shows);
        
        let actor = json.starring?'演员：'+json.starring : json.emcee?'主持：'+json.emcee:'内详';
        let director = json.director?'导演：'+json.director : json.tv_station?json.tv_station:'内详';
        let area = json.zone?'地区：'+json.zone:'';
        let year = json.year?'   年代：' + json.year:'';
        let remarks = json.style ? json.style : '';
        let pubdate = json.update_wordstr ? json.update_wordstr : '';

        var details1 = director.substring(0, 15) + '\n' + actor.substring(0, 15) + '\n' + area + year;
        var details2 = remarks + '\n' + pubdate;
        var pic = MY_PARAMS.pic;
    /*    var newconfig = { 详情1: details1, 详情2: details2, 图片: pic, 标识: MY_URL, plays: plays, shows: shows };
        var libsfile = 'hiker://files/libs/' + md5(configfile) + '.js';
        writeFile(libsfile, 'var configvar = ' + JSON.stringify(newconfig));
    } else {
        var details1 = configvar.详情1;
        var details2 = configvar.详情2;
        var pic = configvar.图片;
        var plays = configvar.plays;
        var shows = configvar.shows;
    }*/
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
    for(var i in erjimenu){
        d.push(
            erjimenu[i]
        )
    }

    var tabs = [];
    var lists = [];

    for (var i in plays) {
        lists.push(plays[i].info);
        tabs.push(plays[i].sitename[0]);
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
    try{
        var playsinfo = plays[0].info;
    }catch(e){
        var playsinfo = "";
    }
    if(playsinfo||shows){
        setTabs(tabs, MY_URL);
    }else{
        d.push({
            col_type: "line"
        })
        for (let i = 0; i < 8; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
    }
    var easy = $("").lazyRule(() => {
        try{
            /*input=fetch(input,{}).split("('")[1].split("'")[0];
            
            if(input.match(/ixigua|iqiyi|qq.com|mgtv|le\.com|bili|sohu|youku|pptv|cctv|1905\.com/)){
                input=input.split("?")[0];
            }else if(input.match(/huanxi/)){
                input=input.split("&")[0];
            }else if(input.match(/migu/)){
                input=input.replace(/http/,'https').split("&from")[0];
            }*/
            if (input.indexOf('sa.sogou') != -1) {
                input = parseDomForHtml(request(input), 'video&&src');
            } else {
                input = request(input, {}).split("('")[1].split("',")[0];
            }
            if (input.match(/huanxi/)) {
                input = input.split("&")[0];
            } else if (input.match(/migu/)) {
                input = "https://m.miguvideo.com/mgs/msite/prd/detail.html" + input.replace(/\\?.*cid/, '?cid').split("&")[0] + "&mgdbid=";
            } else {
                input = input.split("?")[0];
            }
            if(!/^http/.test(input)){
                return "toast://本集无播放地址，可从更多片源中寻找";
            }
            //log(input)
            require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
            return SrcParseS.聚影(input);
        }catch(e){
            return input;
        }
    });
    var block = ['.m4a', '.mp3', '.mp4', '.m3u8', '.flv', '.avi', '.3gp', '.mpeg', '.wmv', '.mov', '.rmvb', '.gif', '.jpg', '.jpeg', '.png', '.ico', '.svg', '.css'];
    //选集部份
    function setLists(lists, index) {
        var list = lists[index];
        
        function nolist() {
            d.push({
                title: '此影片无播放选集！',
                url: '#noHistory#hiker://empty',
                col_type: 'text_center_1'
            });
        }
        
        if(list){
            if (list.length == 0) {
                nolist();
            } else {
                if (getMyVar('shsort') == '1') {
                    try {
                        for (var j = list.length - 1; j >= 0; j--) {
                            let url = 'https://v.sogou.com' + list[j].url;
                            if (!list[j].index == '0') {
                                d.push({
                                    title: list[j].index + '',
                                    url: url + easy,
                                    extra: { id: MY_URL+j, jsLoadingInject: true, blockRules: block },
                                    col_type: 'text_4'
                                });
                            }
                        }
                    } catch (e) {
                        nolist();
                    }
                } else {
                    try {
                        for (var j = 0; j < list.length; j++) {
                            let url = 'https://v.sogou.com' + list[j].url;
                            if (!list[j].index == '0') {
                                d.push({
                                    title: list[j].index + '',
                                    url: url + easy,
                                    extra: { id: MY_URL+j, jsLoadingInject: true, blockRules: block },
                                    col_type: 'text_4'
                                });
                            }
                        }
                    } catch (e) {
                        nolist();
                    }
                }
            }
        }else if (shows&&plays.length>0) {
            var arr = [];
            var zy = shows.item_list[index];
            for (var ii in zy.date) {
                date = zy.date[ii];
                day = zy.date[ii].day;
                for (j in day) {
                    dayy = day[j][0] >= 10 ? day[j][0] : "0" + day[j][0];
                    Tdate = date.year + date.month + dayy;
                    arr.push(Tdate);
                    if (getMyVar('shsort') == '1') {
                        arr.sort(function(a, b) {
                            return a - b
                        })
                    } else {
                        arr.sort(function(a, b) {
                            return b - a
                        })
                    }
                }
            }
            for (var k = 0; k < arr.length; k++) {
                let url = "https://v.sogou.com/vc/eplay?query=" + arr[k] + "&date=" + arr[k] + "&key=" + json.dockey + "&st=5&tvsite=" + plays[index].site;
                d.push({
                    title: "第" + arr[k] + "期",
                    col_type: "text_2",
                    url: url + easy,
                    extra: {
                        id: MY_URL+k, jsLoadingInject: true, blockRules: block
                    }
                });
            }
        } else if (plays.length==0) {
            nolist();
        } else {
            for (var m in plays) {
                let url = "https://v.sogou.com" + plays[m].url;
                d.push({
                    title: plays[m].flag_list.indexOf('trailer') == -1?plays[m].sitename[0]:plays[m].sitename[0] + '—预告',
                    img: 'http://dlweb.sogoucdn.com/video/wap/static/img/logo/' + plays[m].sitename[1],
                    url: url + easy,
                    col_type: "icon_2",
                    extra: { id: MY_URL, jsLoadingInject: true, blockRules: block },
                })
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


//一级
function yiji() {
    Version();
    /*
    addListener("onClose", $.toString(() => {
        clearMyVar('isverifyA');
    }));
*/

    var d = [];
    const Color = "#3399cc";
    const categorys = ['电视剧','电影','动漫','综艺','纪录片'];
    const listTabs = ['teleplay','film','cartoon','tvshow','documentary'];
    const fold = getMyVar('SrcJuying$fold', "0");
    const 类型 = getMyVar('SrcJuying$类型', '');
    const 地区 = getMyVar('SrcJuying$地区', '');
    const 年代 = getMyVar('SrcJuying$年代', '');
    const 资源 = getMyVar('SrcJuying$资源', '');
    const 明星 = getMyVar('SrcJuying$明星', '');
    const 排序 = getMyVar('SrcJuying$排序', '');
    MY_URL = "https://waptv.sogou.com/napi/video/classlist?abtest=0&iploc=CN1304&spver=&listTab=" + getMyVar('SrcJuying$listTab', 'teleplay') + "&filter=&start="+ (MY_PAGE-1)*15 +"&len=15&fr=filter";

    if(类型 != ""){
        MY_URL = MY_URL + "&style=" + 类型;
    }
    if(地区 != ""){
        MY_URL = MY_URL + "&zone=" + 地区;
    }
    if(年代 != ""){
        MY_URL = MY_URL + "&year=" + 年代;
    }
    if(资源 != ""){
        MY_URL = MY_URL + "&fee=" + 资源;
    }
    if(明星 != ""){
        MY_URL = MY_URL + "&emcee=" + 明星;
    }
    if(排序 != ""){
        MY_URL = MY_URL + "&order=" + (排序=="最新"?"time":"score");
    }

    if(MY_PAGE==1){
        d.push({
            title: "管理",
            url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                    require(config.依赖);
                    SRCSet();
                }),
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/129.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "历史",
            url: "hiker://history",
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/109.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "搜索",
            url: $("hiker://empty#noRecordHistory##noHistory#").rule(() => {
                    require(config.依赖);
                    sousuo2();
                }),
            pic_url: 'https://lanmeiguojiang.com/tubiao/more/101.png',
            col_type: 'icon_small_4'
        });
        d.push({
            title: "筛选",
            url: $('#noLoading#').lazyRule((fold) => {
                    putMyVar('SrcJuying$fold', fold === '1' ? '0' : '1');
                    refreshPage(false);
                    return "hiker://empty";
                }, fold),
            pic_url: fold === '1'?'https://lanmeiguojiang.com/tubiao/more/213.png':'https://lanmeiguojiang.com/tubiao/more/172.png',
            col_type: 'icon_small_4'
        });
        d.push({
            col_type: 'line'
        });
        for (let i = 0; i < 10; i++) {
            d.push({
                col_type: "blank_block"
            })
        }

        for (var i in categorys) {
            d.push({
                title: getMyVar('SrcJuying$listTab', 'teleplay') === listTabs[i] ? '““””<b><span style="color:' + Color + '">' + categorys[i] + '</span></b>' : categorys[i],
                url: $('#noLoading#').lazyRule((listTab) => {
                        putMyVar('SrcJuying$listTab', listTab);
                        refreshPage(false);
                        return "hiker://empty";
                    }, listTabs[i]),
                col_type: 'scroll_button'
            });
        }
        d.push({
            col_type: "blank_block"
        });
        
        var html = JSON.parse(request(MY_URL));

        if(fold==='1'){
            var filter = html.listData.list.filter_list;
            for (var i in filter) {
                d.push({
                    title: filter[i].name=="排序"?排序==""?'““””<span style="color:red">最热</span>':"最热":(类型==""&&filter[i].name=="类型")||(地区==""&&filter[i].name=="地区")||(年代==""&&filter[i].name=="年代")||(资源==""&&filter[i].name=="资源")||(明星==""&&filter[i].name=="明星")?'““””<span style="color:red">全部</span>':"全部",
                    url: $('#noLoading#').lazyRule((name) => {
                            putMyVar('SrcJuying$'+name, '');
                            refreshPage(false);
                            return "hiker://empty";
                        }, filter[i].name),
                    col_type: 'scroll_button',
                })
                let option_list = filter[i].option_list;
                for (var j in option_list) {
                    d.push({
                        title: getMyVar('SrcJuying$'+filter[i].name, '')==option_list[j]?'““””<span style="color:red">'+option_list[j]+'</span>':option_list[j],
                        url: $('#noLoading#').lazyRule((name,option) => {
                                putMyVar('SrcJuying$'+name, option);
                                refreshPage(false);
                                return "hiker://empty";
                            }, filter[i].name, option_list[j]),
                        col_type: 'scroll_button'
                    });
                }
                d.push({
                    col_type: "blank_block"
                });
            }
        }
    }else{
        var html = JSON.parse(request(MY_URL));
    }
    var seachurl = $('').lazyRule(() => {
        return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖);
            xunmi(name);
        }, input);
    });
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    var list = html.listData.results;
    for (var i in list) {
        d.push({
            title: list[i].name,
            img: list[i].v_picurl + '@Referer=',
            url: JYconfig['erjimode']!=2?"hiker://empty##https://v.sogou.com" + list[i].url.replace('teleplay', 'series').replace('cartoon', 'series') + "#immersiveTheme#":list[i].name + seachurl,
            desc: list[i].ipad_play_for_list.finish_episode?list[i].ipad_play_for_list.episode==list[i].ipad_play_for_list.finish_episode?"全集"+list[i].ipad_play_for_list.finish_episode:"连载"+list[i].ipad_play_for_list.episode+"/"+list[i].ipad_play_for_list.finish_episode:"",
            extra: {
                pic: list[i].v_picurl,
                name: list[i].name
            }
        });
    }

    setResult(d);
    if(getMyVar('jydingyue','0')=="0"&&JYconfig['codeid2']){
        putMyVar('jydingyue','1');
        try{
            var nowtime = Date.now();
            var oldtime = parseInt(getItem('dingyuetime','0').replace('time',''));
            if(nowtime > (oldtime+6*60*60*1000)){
                let pasteurl = JYconfig['codeid2'];
                let text = parsePaste('https://netcut.cn/p/'+aesDecode('Juying', pasteurl));
                if(pasteurl&&!/^error/.test(text)){
                    let pastedata = JSON.parse(base64Decode(text));
                    var jkfilepath = "hiker://files/rules/Src/Juying/jiekou.json";
                    var jkdatalist = pastedata.jiekou;
                    if(jkdatalist.length>0){
                        writeFile(jkfilepath, JSON.stringify(jkdatalist));
                    }
                    var jxfilepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                    var jxdatalist = pastedata.jiexi;
                    if(jxdatalist.length>0){
                        writeFile(jxfilepath, JSON.stringify(jxdatalist));
                    }
                    log("自动订阅同步完成");
                }else{
                    log("自动订阅同步口令错误或已失效");
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
    var seachurl = $('').lazyRule(() => {
            return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                require(config.依赖);
                xunmi(name);
            }, input);
        });
    var d = [];
    d.push({
        title: "🔍",
        url: $.toString((seachurl) => {
                return input + seachurl;
            },seachurl),
        desc: "搜你想看的...",
        col_type: "input",
        extra: {
            titleVisible: true,
            id: "input",
            onChange: $.toString((seachurl) => {
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
                                    url: sug.title + seachurl,
                                    desc: "年份：" + sug.year,
                                    col_type: "movie_1_vertical_pic",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }else{
                                return {
                                    title: "⚡" + sug.title,
                                    url: sug.title + seachurl,
                                    col_type: "text_1",
                                    extra: {
                                        cls: 'suggest'
                                    }
                                }
                            }
                        } catch (e) {  }
                    });
                    if(suggest.length>0){
                        addItemAfter('input', suggest);
                    }
                }
            }, seachurl)
        }
    });

    d.push({
        title: '<span style="color:#ff6600"><b>\t热搜榜\t\t\t</b></span>',
        url: "hiker://empty",
        pic_url: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=3779990328,1416553241&fm=179&app=35&f=PNG?w=60&h=70&s=E7951B62A4639D153293A4E90300401B',
        col_type: 'icon_small_3'
    });
    var cfgfile = "hiker://files/rules/Src/Juying/config.json";
    var Juyingcfg=fetch(cfgfile);
    if(Juyingcfg != ""){
        eval("var JYconfig=" + Juyingcfg+ ";");
    }else{
        var JYconfig= {};
    }
    try{
        if(JYconfig.resoulist){
            delete JYconfig['resoulist'];
            writeFile(cfgfile, JSON.stringify(JYconfig));
        }
    }catch(e){
        //过几个版本后删除
    }
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
            url: pdfh(list[i], "a&&Text") + seachurl,
            col_type: "text_1"
        }, );
    }

    setResult(d);
}

//搜索
function sousuo() {
    var d = [];
    var html = getResCode();
    try {
        var list = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).result.longVideo.results;
        for (var i = 0; i < list.length; i++) {
            if (list[i].play.item_list){
                d.push({
                    title: list[i].name.replace(/|/g,''),
                    url: 'hiker://empty##https://v.sogou.com' + list[i].tiny_url + "#immersiveTheme#",
                    desc: list[i].list_category.join(','),
                    content: list[i].introduction,
                    pic_url: list[i].v_picurl,
                    extra: {
                        pic: list[i].v_picurl,
                        name: list[i].name.replace(/|/g,'')
                    }
                })
            }
        }
    } catch (e) { }
    setResult(d);
}

//二级统一菜单
var erjimenu = [
        {
        title: "剧情简介",
        url: /\.sogou\./.test(MY_URL)?$('hiker://empty#noRecordHistory##noHistory#').rule((url) => {
                var d=[];
                var html = fetch(url.split('##')[1]);
                var story=parseDomForHtml(html, 'body&&.srch-result-info&&Html').replace(/<\/a><a/g,',</a><a');
                for(let i = 0;;i++){
                    try{
                        d.push({
                            title:parseDomForHtml(story, 'div,' +i+ '&&Text').replace('更多',''),
                            col_type: 'rich_text'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }catch(e){
                        break;
                    }
                };

                try{
                    var photos=parseDomForArray(html, '#photoList&&.sort_lst_bx&&a');
                    if(photos.length>0){
                        d.push({
                            title: '剧照：',
                            col_type: 'rich_text'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }
                    for(var i in photos){
                        d.push({
                            pic_url: parseDomForHtml(photos[i], 'img&&data-src'),
                            url: 'hiker://empty',
                            col_type: 'pic_1_full'
                        });
                        d.push({
                            col_type: 'line'
                        });
                    }
                }catch(e){};
                setHomeResult(d);
            }, MY_URL): $('hiker://empty#noHistory#').rule(() => {
                setHomeResult([{
                    title: '影片简介：\n' + getMyVar('moviedesc',''),
                    col_type: 'long_text'
                }]);
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/32.svg',
        col_type: 'icon_small_3'
    },
    {
        title: "观影设置",
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                setPageTitle("♥个性化设置");
                var d = [];
                var cfgfile = "hiker://files/rules/Src/Juying/config.json";
                var Juyingcfg=fetch(cfgfile);
                if(Juyingcfg != ""){
                    eval("var JYconfig=" + Juyingcfg+ ";");
                }else{
                    var JYconfig= {};
                }

                d.push({
                    title: '功能开关',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: JYconfig['printlog']==1?'打印日志(开)':'打印日志(关)',
                    url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['printlog'] != 1){
                                JYconfig['printlog'] = 1;
                            }else{
                                JYconfig['printlog'] = 0;
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功';
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: JYconfig['cachem3u8']!=0?'m3u8缓存(开)':'m3u8缓存(关)',
                    url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['cachem3u8'] == 0){
                                JYconfig['cachem3u8'] = 1;
                            }else{
                                JYconfig['cachem3u8'] = 0;
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功';
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    col_type: "line"
                });
                if(fileExist('hiker://files/cache/MyParseSet.json')&&fileExist('hiker://files/rules/DuanNian/MyParse.json')){var isDn = 1}else{var isDn = 0};
                d.push({
                    title: isDn==1&&JYconfig['isdn']!=0?'断插辅助(开)':'断插辅助(关)',
                    url: isDn==0?'toast://没有断插？无法开启！':$('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['isdn'] == 0){
                                JYconfig['isdn'] = 1;
                                var sm = "开启断插同步并发解析";
                            }else{
                                JYconfig['isdn'] = 0;
                                var sm = "只走程序自身的解析";
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功：' + sm;
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: isDn==1&&JYconfig['forcedn']==1?'强制断插(开)':'强制断插(关)',
                    url: isDn==0?'toast://没有断插？无法开启！':$('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                            if(JYconfig['forcedn'] != 1){
                                JYconfig['forcedn'] = 1;
                                var sm = "开启强制断插，仅走断插解析";
                            }else{
                                JYconfig['forcedn'] = 0;
                                var sm = "关闭强制断插，程序智能解析";
                            }
                            writeFile(cfgfile, JSON.stringify(JYconfig));
                            refreshPage(false);
                            return 'toast://切换成功：' + sm;
                        }, JYconfig, cfgfile),
                    col_type: "text_2"
                });
                d.push({
                    title: '屏蔽操作',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: '无效播放地址',
                    url: $("","屏蔽无效播放地址\n多数为跳舞小姐姐播放链接").input(()=>{
                            var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                            var recordparse=fetch(recordfile);
                            if(recordparse != ""){
                                eval("var recordlist=" + recordparse+ ";");
                            }else{
                                var recordlist = {};
                            }
                            recordlist['excludeurl'] = recordlist['excludeurl']||[];
                            let url = input.split(';{')[0].replace('file:///storage/emulated/0/Android/data/com.example.hikerview/files/Documents/cache/video.m3u8##','').replace('#isVideo=true#','');
                            if(recordlist['excludeurl'].indexOf(url)==-1){
                                recordlist['excludeurl'].push(url);
                            }
                            writeFile(recordfile, JSON.stringify(recordlist));
                            return 'toast://屏蔽无效播放地址成功';
                        }),
                    col_type: "text_2"
                });
                var parsefrom = [];
                var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                var recordparse=fetch(recordfile);
                if(recordparse != ""){
                    eval("var recordlist=" + recordparse+ ";");
                    try{
                        for(var key in recordlist.parse){
                            parsefrom.push(key);
                        }
                    }catch(e){ }
                }
                d.push({
                    title: '屏蔽优先解析',
                    url: parsefrom.length==0?'toast://没有优先解析，无需操作':$(parsefrom,3,"选择片源屏蔽优先解析").select(()=>{
                        var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                        var recordparse=fetch(recordfile);
                        eval("var recordlist=" + recordparse+ ";");
                        var parseurl = recordlist.parse[input];
                        var parsename = recordlist.name[input];
                        delete recordlist.parse[input];
                        

                        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                        var datafile = fetch(filepath);
                        if(datafile != ""){
                            eval("var datalist=" + datafile+ ";");
                        }else{
                            var datalist = [];
                        }
                        if(datalist.some(item => item.parse == parseurl)){
                            //私有解析在屏蔽优先时，仅排除片源
                            for(var j=0;j<datalist.length;j++){
                                if(datalist[j].parse==parseurl&&datalist[j].stopfrom.indexOf(input)==-1){
                                    datalist[j].stopfrom[datalist[j].stopfrom.length] = input;
                                }
                                break;
                            }
                            writeFile(filepath, JSON.stringify(datalist));
                            var sm = '私有解析('+parsename+')>排除片源>'+input;
                        }else{
                            //app自带的解析在屏蔽优先时，直接加入黑名单
                            recordlist['excludeparse'] = recordlist['excludeparse']||[];
                            if(recordlist['excludeparse'].indexOf(recordlist.parse[input])==-1){
                                recordlist['excludeparse'].push(recordlist.parse[input]);
                            }
                            var sm = parsename+'>加入全局黑名单';
                        }

                        writeFile(recordfile, JSON.stringify(recordlist));   
                        refreshPage(false);
                        log('已屏蔽'+input+'优先解析：'+sm);
                        return 'toast://已屏蔽'+input+'优先解析';
                    }),
                    col_type: "text_2"
                });

                d.push({
                    title: '反悔回退',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line_blank"
                });
                d.push({
                    title: '清除拦截记录',
                    url: $(["播放地址","优先解析"],2,"选择需清除记录的项").select(()=>{
                            if(input=="播放地址"){
                                return $("清除拦截跳舞小姐姐视频记录？").confirm(()=>{
                                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                                    var recordparse=fetch(recordfile);
                                    if(recordparse != ""){
                                        eval("var recordlist=" + recordparse+ ";");
                                        recordlist['exclude'] = [];
                                        writeFile(recordfile, JSON.stringify(recordlist));
                                        return 'toast://已清除跳舞小姐姐视频拦截记录';
                                    }else{
                                        return 'toast://无记录';
                                    }
                                })
                            }else if(input=="优先解析"){
                                return $("清除app自带解析拦截黑名单记录？").confirm(()=>{
                                    var recordfile = "hiker://files/rules/Src/Juying/parse.json";
                                    var recordparse=fetch(recordfile);
                                    if(recordparse != ""){
                                        eval("var recordlist=" + recordparse+ ";");
                                        recordlist['excludeparse'] = [];
                                        writeFile(recordfile, JSON.stringify(recordlist));
                                        refreshPage(false);
                                        return 'toast://已清除app自带解析拦截黑名单记录';
                                    }else{
                                        return 'toast://无记录';
                                    }
                                })
                            }
                            
                            
                        }),
                    col_type: "text_2"
                });
                setHomeResult(d);
            }),
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/37.svg',
        col_type: 'icon_small_3'
    },
    {
        title: "更多片源",
        url: !fileExist('hiker://files/rules/Src/Juying/jiekou.json')?"toast://分享页面或没有接口，无法扩展更多片源":getMyVar('moviemore','0')=="0"?$('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
            require(config.依赖);
            xunmi(name);
        }, MY_PARAMS.name):`#noLoading#@lazyRule=.js:back(false);'hiker://empty'`,
        pic_url: 'https://lanmeiguojiang.com/tubiao/messy/25.svg',
        col_type: 'icon_small_3'
    }
]
//版本检测
function Version() {
    var nowVersion = 2.1;//现在版本
    var nowtime = Date.now();
    var oldtime = parseInt(getItem('VersionChecktime','0').replace('time',''));
    if (getVar('SrcJuying-VersionCheck', '0') == '0' && nowtime > (oldtime+6*60*60*1000)) {
        try {
            eval(fetch(config.依赖.match(/https.*\//)[0] + 'SrcTmplVersion.js'))
            if (newVersion.SrcJuying > nowVersion) {
                confirm({
                    title:'发现新版本，是否更新？', 
                    content:nowVersion+'=>'+newVersion.SrcJuying+'\n'+newVersion.SrcJuyingdesc[eval(newVersion.SrcJuying)], 
                    confirm:`deleteCache();refreshPage();`, 
                    cancel:''
                })
                log('检测到新版本！\nV'+newVersion.SrcJuying+'版本》'+newVersion.SrcJuyingdesc[eval(newVersion.SrcJuying)]);
            }
            putVar('SrcJuying-Version', '-V'+newVersion.SrcJuying);
        } catch (e) { }
        putVar('SrcJuying-VersionCheck', '1');
        setItem('VersionChecktime',nowtime+"time");
    }else{
        putVar('SrcJuying-Version', '-V'+nowVersion);
    }
}