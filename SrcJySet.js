function SRCSet() {
    addListener("onClose", $.toString(() => {
        clearMyVar('guanlicz');
        clearMyVar('duoselect');
        //refreshPage(false);
    }));
    setPageTitle("♥管理"+getVar('SrcJuying-Version', ''));
    clearMyVar('duoselect');
    function getTitle(title, Color) {
        return '<font color="' + Color + '">' + title + '</font>';
    }
    var d = [];
    d.push({
        title: getMyVar('guanli', 'jk')=="jk"?getTitle('接口管理', '#f13b66a'):'接口管理',
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jk');clearMyVar('duoselect');refreshPage(false);'toast://已切换到接口管理';`,
        img: "https://lanmeiguojiang.com/tubiao/movie/98.svg",
        col_type: "icon_small_3"
    });
    d.push({
        title: getMyVar('guanli', 'jk')=="jk"?'解析管理':getTitle('解析管理', '#f13b66a'),
        url: `#noLoading#@lazyRule=.js:putMyVar('guanli','jx');clearMyVar('duoselect');refreshPage(false);'toast://已切换到解析管理';`,
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

    function guanlidata(data) {
        try{
            if(getMyVar('guanli', 'jk')=="jx"&&data.length > 0){
                for(var i in data){
                    //data[i]['id'] = i;
                    data[i]['sort'] = data[i]['sort']||0;
                }
                data.sort((a, b) => {
                    if(a.sort!=b.sort){
                        return a.sort - b.sort
                    }else{
                        return a.id - b.id;
                    }
                });
            }
            var czdatalist = data.map((datalist)=>{
                if(getMyVar('guanli', 'jk')=="jk"){
                    var dataurl = datalist.url;
                    var dataname = datalist.name;
                    var dataua = datalist.ua;
                    var datatype = datalist.type;
                    var datagroup = datalist.group;
                    var datatitle = dataname + ' ('+datatype+')' + (datagroup&&datagroup!=datatype?' [' + datagroup + ']':"");
                    var datadesc = dataurl;
                    var dataarr = {name:dataname, url:dataurl, ua:dataua, type:datatype, group:datagroup};
                    var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                }else{
                    var dataurl = datalist.parse;
                    var dataname = datalist.name;
                    var datastopfrom = datalist.stopfrom||[];
                    var datapriorfrom = datalist.priorfrom||"";
                    var datasort = datalist.sort||0;
                    var datatitle = datasort+'-'+dataname+'-'+dataurl;
                    var datadesc = "优先强制：" + datapriorfrom + "" + "\n排除片源：" + datastopfrom + "";
                    var dataarr = {name:dataname, url:dataurl, stopfrom:datastopfrom+"", priorfrom:datapriorfrom+""};
                    if(datalist.header){dataarr['header'] = datalist.header}
                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                }
                
                return {
                    title: datatitle,
                    desc: datadesc,
                    url: getMyVar('guanlicz')=="1"?$('#noLoading#').lazyRule((name,url)=>{
                            copy(name+'#'+url);
                            return "hiker://empty";
                        },dataname, dataurl):getMyVar('guanlicz')=="2"?$('hiker://empty#noRecordHistory##noHistory#').rule((data) => {
                            require(config.依赖.match(/https.*\//)[0] + 'SrcJySet.js');
                            if(getMyVar('guanli', 'jk')=="jk"){
                                jiekou('update', data);
                            }else{
                                jiexi('update', data);
                            }
                        }, dataarr):getMyVar('guanlicz')=="3"?$("确定删除接口："+dataname).confirm((dataurl,filepath)=>{
                            var datafile = fetch(filepath);
                            eval("var datalist=" + datafile+ ";");
                            if(getMyVar('guanli', 'jk')=="jk"){
                                for(var i=0;i<datalist.length;i++){
                                    if(datalist[i].url==dataurl){
                                        datalist.splice(i,1);
                                        break;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                            }else{
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
                            }
                            
                            refreshPage(false);
                            return "toast://已删除";
                        }, dataurl,filepath):getMyVar('guanlicz')=="4"?$('#noLoading#').lazyRule((datatitle,dataurl)=>{
                            let duoselect = getMyVar('duoselect','')?getMyVar('duoselect','').split(','):[];
                            if(duoselect.indexOf(dataurl)==-1){
                                duoselect.push(dataurl);
                                updateItem(dataurl,{title:'‘‘’’<span style="color:red">'+datatitle})
                            }else{
                                function removeByValue(arr, val) {
                                    for(var i = 0; i < arr.length; i++) {
                                        if(arr[i] == val) {
                                        arr.splice(i, 1);
                                        break;
                                        }
                                    }
                                }
                                removeByValue(duoselect,dataurl);
                                updateItem(dataurl,{title:datatitle})
                            }
                            putMyVar('duoselect',duoselect.join(','));
                            return "hiker://empty";
                        }, datatitle,dataurl):"toast://功能异常",
                    col_type: 'text_1',
                    extra: {
                        id: dataurl,
                        cls: "guanlidatalist"
                    }
                }
            })

            return czdatalist;
        } catch (e) {
            log(e.message);
            return [];
        }
    }
    d.push({
        title: '增加',
        url: getMyVar('guanli', 'jk')=="jk"?$('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/https.*\//)[0] + 'SrcJySet.js');
            jiekou('add')
        }):$('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/https.*\//)[0] + 'SrcJySet.js');
            jiexi('add');
        }),
        img: "https://lanmeiguojiang.com/tubiao/more/25.png",
        col_type: "icon_small_4"
    });
    d.push({
        title: getMyVar('guanlicz')=="1"?'复制':getMyVar('guanlicz')=="2"?'变更':getMyVar('guanlicz')=="3"?'删除':getMyVar('guanlicz')=="4"?'多选':'操作',
        url: $(["复制","变更","删除","清空","多选"],2,"选择操作功能项").select(()=>{
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
                }else if(input=="多选"){
                    putMyVar('guanlicz','4');
                    refreshPage(false);
                    return 'toast://已切换到多选模式';
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
        img: getMyVar('guanlicz')=="1"?"https://lanmeiguojiang.com/tubiao/more/292.png":getMyVar('guanlicz')=="2"?"https://lanmeiguojiang.com/tubiao/more/275.png":getMyVar('guanlicz')=="3"?"https://lanmeiguojiang.com/tubiao/more/216.png":getMyVar('guanlicz')=="4"?"https://lanmeiguojiang.com/tubiao/more/213.png":"https://lanmeiguojiang.com/tubiao/more/290.png",
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
                var sm2 = "聚影分享口令已生成";
                let duoselect = getMyVar('duoselect','')?getMyVar('duoselect','').split(','):[];
                if(duoselect.length>0){
                    var lists = datalist.filter(item => {
                        if(item.url){
                            return duoselect.indexOf(item.url)>-1;
                        }else{
                            return duoselect.indexOf(item.parse)>-1;
                        }
                    })
                    if(lists.length>0){
                        var datalist = lists;
                        sm2 = "(选定)聚影分享口令已生成";
                    }
                }
                
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
                    return "toast://"+sm2;
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
            url: $.toString((guanlidata,datalist) => {
                    if(datalist.length>0){
                        deleteItemByCls('guanlidatalist');
                        var lists = datalist.filter(item => {
                            if(item.url){
                                return item.name.includes(input) || item.url.includes(input);
                            }else{
                                return item.name.includes(input) || item.parse.includes(input);
                            }
                        })
                        let gldatalist = guanlidata(lists);
                        addItemBefore('guanliloading', gldatalist);
                    }
                    return "hiker://empty";
                },guanlidata,datalist),
            desc: "搜你想要的...",
            col_type: "input",
            extra: {
                titleVisible: true
            }
        });
        
        let gldatalist = guanlidata(datalist);
        d = d.concat(gldatalist);
    }
    d.push({
        title: '当前共有'+datalist.length+'个'+(getMyVar('guanli', 'jk')=="jk"?"接口":"私有解析"),
        url: "hiker://empty",
        col_type: "text_center_1",
        extra: {
            id: "guanliloading"
        }
    });
    setResult(d);
}

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

function jiekou(lx,data) {
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
                    require(config.依赖.match(/https.*\//)[0] + 'SrcJyXunmi.js');
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
        }, lx, data)
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
        clearMyVar('parseheader');
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
        
        let priorfrom = getMyVar('priorfrom', data&&data.priorfrom?data.priorfrom:"");
        d.push({
            title:'优先片源：' + priorfrom,
            col_type: 'text_1',
            url:$('hiker://empty#noRecordHistory##noHistory#').rule((priorfrom) => {
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
                        defaultValue: getMyVar('priorfrom', priorfrom),
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
            },priorfrom)
        });
        let stopfrom = getMyVar('stopfrom', lx=="update"?data.stopfrom:"");
        d.push({
            title:'排除片源：' + stopfrom,
            col_type: 'text_1',
            url:$(stopfrom,"输入排除的片源标识，以逗号隔开，为空则自动管理").input(()=>{
                putMyVar('stopfrom', input);
                refreshPage(false);
                return "toast://"+input;
            })
        });
        let parseheader = getMyVar('parseheader', lx=="update"&&data.header?JSON.stringify(data.header):"");
        d.push({
            title:'header信息：' + parseheader,
            col_type: 'text_1',
            url:$().lazyRule((parseheader)=>{
                function sethead(parse){
                    if(!/^http/.test(parse)){
                        return "";
                    }else{
                        let head = {"User-Agent": "Dalvik/2.1.0"};
                        let referer = parse.match(/http(s)?:\/\/(.*?)\//)[0]||"";
                        if(referer){
                            head["referer"] = referer;
                        }
                        return head;
                    }
                }
                return $(parseheader?parseheader:sethead(getMyVar('parseurl', '')),"提示防盗的解析可能就是需要header，比如Referer、UA").input(()=>{
                    if((getMyVar("parseurl")&&/{|}/.test(input))||input==""){
                        putMyVar("parseheader",input);
                        refreshPage(false);
                        return "hiker://empty";
                    }else{
                        return "toast://链接地址不能为空，或输入信息不正常"
                    }
                })
            }, parseheader)
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
            var dataurl = getMyVar('parseurl');
            var dataname = getMyVar('parsename')||'测试';
            var datahead = getMyVar('parseheader',data&&data.header?JSON.stringify(data.header):"");
            if(!dataurl||!/^http/.test(dataurl)){
                return "toast://获取解析地址失败，无法测试";
            }

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
            let parsearr = {name:dataname,parse:dataurl};
            try{
                if(datahead){parsearr['header']= JSON.parse(datahead)}
            }catch(e){     }
            urls['自定义'] = "";
            for(var key in urls){
                addItemBefore('jxline2', {
                    title: key,
                    url: key!="自定义"?$('#noRecordHistory##noHistory#').lazyRule((vipUrl,parseStr)=>{
                        require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(vipUrl, parseStr);
                    },urls[key],parsearr):$("","输入自定义播放地址").input((parseStr) => {
                        if(input==""){
                            return "toast://未输入自定义地址，无法测试";
                        }else{
                            return $().lazyRule((vipUrl,parseStr)=>{
                                require(config.依赖.match(/https.*\//)[0] + 'SrcParseS.js');
                                return SrcParseS.聚影(vipUrl, parseStr);
                            }, input, parseStr)
                        }
                    }, parsearr),
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
            updateItem('jxtest', {
                /*
                title:'测试',
                col_type:'text_3',
                */
                url: "hiker://empty"
            })
            return "hiker://empty";
        }, data),
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
            let parseheader = getMyVar('parseheader',data&&data.header?JSON.stringify(data.header):"");
            if(getMyVar('addtype', '1')=="1"&&parseurl&&parsename){
                if(lx=="update"){
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
                    let arr  = { "name": parsename, "parse": parseurl, "stopfrom": stopfrom, "priorfrom": priorfrom, "sort": 0};
                    try{
                        if(parseheader){arr['header']= JSON.parse(parseheader)}
                    }catch(e){     }
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
                        let arr  = { "name": urlname, "parse": urlurl, "stopfrom": [], "priorfrom": [], "sort": 0 };
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