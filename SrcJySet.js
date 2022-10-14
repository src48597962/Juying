//个人学习代码
function SRCSet() {
    addListener("onClose", $.toString(() => {
        clearMyVar('guanlicz');
        clearMyVar('duoselect');
        clearMyVar('datalist');
        //refreshPage(false);
    }));
    setPageTitle("♥管理"+getMyVar('SrcJuying-Version', ''));
    clearMyVar('duoselect');
    clearMyVar('datalist');
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
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            extension();
        }),
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
    storage0.putMyVar('datalist',datalist);
    d.push({
        col_type: "line_blank"
    });

    function guanlidata(data) {
        try{
            if(getMyVar('guanli', 'jk')=="jx"&&data.length > 0){
                for(var i in data){
                    data[i]['id'] = i;
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
                    var dataarr = {name:dataname, url:dataurl, ua:dataua, type:datatype};
                    if(datagroup){dataarr['group'] = datagroup}
                    if(datalist.data){dataarr['data'] = datalist.data}
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
                    if(datalist.web){dataarr['web'] = datalist.web}
                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                }
                
                return {
                    title: datatitle,
                    desc: datadesc,
                    url: getMyVar('guanlicz')=="1"?$('#noLoading#').lazyRule((name,url)=>{
                            copy(name+'#'+url);
                            return "hiker://empty";
                        },dataname, dataurl):getMyVar('guanlicz')=="2"?$('hiker://empty#noRecordHistory##noHistory#').rule((data) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                            if(getMyVar('guanli', 'jk')=="jk"){
                                jiekou('update', data);
                            }else{
                                jiexi('update', data);
                            }
                        }, dataarr):getMyVar('guanlicz')=="3"?$("确定删除："+dataname).confirm((dataurl,filepath)=>{
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

                                let cfgfile = "hiker://files/rules/Src/Juying/config.json";
                                let Juyingcfg=fetch(cfgfile);
                                if(Juyingcfg != ""){
                                    eval("var JYconfig=" + Juyingcfg+ ";");
                                }else{
                                    var JYconfig= {};
                                }
                                if(JYconfig.zsjiekou.api_url==dataurl){
                                    delete JYconfig['zsjiekou'];
                                    writeFile(cfgfile, JSON.stringify(JYconfig));
                                }
                            }else{
                                for(var i=0;i<datalist.length;i++){
                                    if(datalist[i].parse==dataurl){
                                        datalist.splice(i,1);
                                        break;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                            }
                            
                            refreshPage(false);
                            return "toast://已删除";
                        }, dataurl,filepath):getMyVar('guanlicz')=="4"?$('#noLoading#').lazyRule((datatitle,dataurl)=>{
                            let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
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
                            storage0.putMyVar('duoselect',duoselect);
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
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            jiekou('add')
        }):$('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
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
                        //var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
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
                        
                        let urlnum = 0;
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                        if(getMyVar('guanli', 'jk')=="jk"){
                            if(codelx=="share"){
                                var pastedatalist = pastedata;
                            }else if(codelx=="dingyue"){
                                var pastedatalist = pastedata.jiekou;
                            }
                            urlnum = jiekousave(pastedatalist);
                        }else{
                            if(codelx=="share"){
                                var pastedatalist = pastedata;
                            }else if(codelx=="dingyue"){
                                var pastedatalist = pastedata.jiexi;
                            }
                            urlnum = jiexisave(pastedatalist);
                        }
                        if(urlnum>0){
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
                let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
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
                        //clearMyVar('duoselect');
                    }
                }
                
                let text = JSON.stringify(datalist);
                var num = ''; 
                for (var i = 0; i < 6; i++) {
                    num += Math.floor(Math.random() * 10);
                }
                let textcontent = base64Encode(text);
                if(textcontent.length>=200000){
                    log('分享失败：接口字符数超过最大限制，请精简接口，重点减少xpath和biubiu类型'); 
                    return 'toast://分享同步失败，接口字符数超过最大限制';
                }
                try{
                    var pasteurl = JSON.parse(request('https://netcut.cn/api/note/create/', {
                        headers: { 'Referer': 'https://netcut.cn/' },
                        body: 'note_name=Juying'+num+'&note_content='+textcontent+'&note_pwd=0&expire_time=3600',
                        method: 'POST'
                    })).data.note_id || "";
                }catch(e){
                    var pasteurl = "";
                }

                if(pasteurl){
                    let code = sm+'￥'+aesEncode('Juying', pasteurl)+'￥1小时内有效';
                    copy(code);
                    return "toast://"+sm2;
                }else{
                    return "toast://分享失败，剪粘板或网络异常";
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
        if(getMyVar('guanlicz')=="4"){
            d.push({
                title: "全选",
                url: $('#noLoading#').lazyRule(()=>{
                        let datalist = storage0.getMyVar('datalist')?storage0.getMyVar('datalist'):[];
                        let duoselect = [];
                        for(let i=0;i<datalist.length;i++){
                            if(getMyVar('guanli', 'jk')=="jk"){
                                let dataname = datalist[i].name;
                                let datatype = datalist[i].type;
                                let datagroup = datalist[i].group;
                                var dataurl = datalist[i].url;
                                var datatitle = dataname + ' ('+datatype+')' + (datagroup&&datagroup!=datatype?' [' + datagroup + ']':"");
                            }else{
                                let dataname = datalist[i].name;
                                let datasort = datalist[i].sort||0;
                                var dataurl = datalist[i].parse;
                                var datatitle = datasort+'-'+dataname+'-'+dataurl;
                            }
                            updateItem(dataurl,{title:'‘‘’’<span style="color:red">'+datatitle})
                            duoselect.push(dataurl);
                        }
                        storage0.putMyVar('duoselect',duoselect);
                        return "toast://合计选择："+duoselect.length;
                    }),
                col_type: "scroll_button"
            });
            d.push({
                title: "批量删除",
                url: $('#noLoading#').lazyRule(()=>{
                        let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
                        if(duoselect.length>0){
                            if(getMyVar('guanli', 'jk')=="jk"){
                                var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                var sm = "确定删除选定的"+duoselect.length+"个接口吗？";
                            }else if(getMyVar('guanli', 'jk')=="jx"){
                                var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                var sm = "确定删除选定的"+duoselect.length+"个解析吗？";
                            }
                            return $(sm).confirm((duoselect, filepath)=>{
                                var datafile = fetch(filepath);
                                eval("var datalist=" + datafile+ ";");
                                for(var i=0;i<datalist.length;i++){
                                    if(duoselect.indexOf(datalist[i].url?datalist[i].url:datalist[i].parse)>-1){
                                        datalist.splice(i,1);
                                        i = i - 1;
                                    }
                                }
                                writeFile(filepath, JSON.stringify(datalist));
                                refreshPage(false);
                                return "toast://已批量删除解析"+duoselect.length;
                            }, duoselect, filepath)
                        }else{
                            return "toast://请选择";
                        }
                    }),
                col_type: "scroll_button"
            });
            if(getMyVar('guanli', 'jk')=="jk"){
                d.push({
                    title: "调整分组",
                    url: $('#noLoading#').lazyRule(()=>{
                            let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
                            if(duoselect.length>0){
                                return $("","选定的"+duoselect.length+"个接口新分组名").input((duoselect)=>{
                                    var filepath = "hiker://files/rules/Src/Juying/jiekou.json";
                                    var datafile = fetch(filepath);
                                    eval("var datalist=" + datafile+ ";");
                                    for(var i=0;i<datalist.length;i++){
                                        if(duoselect.indexOf(datalist[i].url)>-1){
                                            if(input){
                                                datalist[i].group  = input;
                                            }else{
                                                delete datalist[i].group;
                                            }
                                            delete datalist[i].failnum;
                                        }
                                    }
                                    writeFile(filepath, JSON.stringify(datalist));
                                    refreshPage(false);
                                    return "toast://已批量调整接口分组";
                                }, duoselect)
                            }else{
                                return "toast://请选择";
                            }
                        }),
                    col_type: "scroll_button"
                });
            }else{
                d.push({
                    title: "重置排除",
                    url: $('#noLoading#').lazyRule(()=>{
                            let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
                            if(duoselect.length>0){
                                return $("确定重置选定的"+duoselect.length+"个解析排除片源记录吗？").confirm((duoselect)=>{
                                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                    var datafile = fetch(filepath);
                                    eval("var datalist=" + datafile+ ";");
                                    for(var i=0;i<datalist.length;i++){
                                        if(duoselect.indexOf(datalist[i].parse)>-1){
                                            datalist[i].stopfrom = [];
                                        }
                                    }
                                    writeFile(filepath, JSON.stringify(datalist));
                                    refreshPage(false);
                                    return "toast://已批量重置选定解析的排除片源记录";
                                }, duoselect)
                            }else{
                                return "toast://请选择";
                            }
                        }),
                    col_type: "scroll_button"
                });
                d.push({
                    title: "重置排序",
                    url: $('#noLoading#').lazyRule(()=>{
                            let duoselect = storage0.getMyVar('duoselect')?storage0.getMyVar('duoselect'):[];
                            if(duoselect.length>0){
                                return $("确定重置选定的"+duoselect.length+"个解析失败排序记录吗？").confirm((duoselect)=>{
                                    var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
                                    var datafile = fetch(filepath);
                                    eval("var datalist=" + datafile+ ";");
                                    for(var i=0;i<datalist.length;i++){
                                        if(duoselect.indexOf(datalist[i].parse)>-1){
                                            datalist[i].sort = 0;
                                        }
                                    }
                                    writeFile(filepath, JSON.stringify(datalist));
                                    refreshPage(false);
                                    return "toast://已批量重置选定解析的排除片源记录";
                                }, duoselect)
                            }else{
                                return "toast://请选择";
                            }
                        }),
                    col_type: "scroll_button"
                });
            }
        }
        if(getMyVar('guanli', 'jk')=="jk"){
            d.push({
                col_type: "blank_block"
            })
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
                    return item.group==grouplist[i] || !item.group&&item.type==grouplist[i];
                })
                d.push({
                    title: grouplist[i]+'('+lists.length+')',
                    url: $('#noLoading#').lazyRule((guanlidata,lists)=>{
                            if(lists.length>0){
                                deleteItemByCls('guanlidatalist');
                                let gldatalist = guanlidata(lists);
                                addItemBefore('guanliloading', gldatalist);
                                storage0.putMyVar('datalist',lists);
                            }
                            return "hiker://empty";
                        },guanlidata,lists),
                    col_type: "scroll_button",
                    extra: {
                        id: "grouplist"
                    }
                });
            }
        }
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

function getapitype(apiurl) {
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

function similar(s, t, f) {//判断两个字符串之间的相似度
    if (!s || !t) {
        return 0
    }
    if(s === t){
        return 100;
    }
    var l = s.length > t.length ? s.length : t.length;
    var n = s.length;
    var m = t.length;
    var d = [];
    f = f || 2;
    var min = function (a, b, c) {
        return a < b ? (a < c ? a : c) : (b < c ? b : c)
    }
    var i, j, si, tj, cost
    if (n === 0) return m
    if (m === 0) return n
    for (i = 0; i <= n; i++) {
        d[i] = [];
        d[i][0] = i;
    }
    for (j = 0; j <= m; j++) {
        d[0][j] = j;
    }
    for (i = 1; i <= n; i++) {
        si = s.charAt(i - 1)
        for (j = 1; j <= m; j++) {
            tj = t.charAt(j - 1)
            if (si === tj) {
                cost = 0
            } else {
                cost = 1
            }
            d[i][j] = min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
    }
    let res = (1 - d[n][m] / l) *100 || 0;
    return parseInt(res.toFixed(f));
}
function jiekousave(urls,update) {
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
            let urlname = urls[i].name.replace(/(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])|\(XPF\)|\(萝卜\)|\(神马\)|\(切\)|\(聚\)|\(优\)|\(神马\)|\(XB\)|\(SP\)|\(XP\)|[\x00-\x1F\x7F]/g,'');
            let urlurl = urls[i].url;
            let urlua = urls[i].ua||"Dalvik/2.1.0";
            let urltype = urls[i].type||getapitype(urlurl);
            let urlgroup = urls[i].group||"";

            if(update==1){
                for(var j=0;j<datalist.length;j++){
                    if(datalist[j].url==urlurl||datalist[j].url==urls[i].oldurl){
                        datalist.splice(j,1);
                        break;
                    }
                }
            }

            function checkitem(item) {
                //log(item.name+' '+urlname+' '+similar(item.name,urlname));
                //return item.url==urlurl||(similar(item.name,urlname)>60&&urltype=="biubiu");
                return item.url==urlurl||(urltype=="biubiu"&&item.data&&urls[i].data.url==item.data.url);
            }

            if(!datalist.some(checkitem)&&urlname&&/^http|^csp/.test(urlurl)&&urltype){
                let arr  = { "name": urlname, "url": urlurl, "ua": urlua, "type": urltype };
                if(urls[i].data){arr['data'] = urls[i].data}
                if(urlgroup){arr['group'] = urlgroup}
                if(urls.length == 1){
                    datalist.unshift(arr);
                }else{
                    datalist.push(arr);
                }
                num = num + 1;
            }
        }
        if(num>0){writeFile(filepath, JSON.stringify(datalist));}
    } catch (e) {
        log('导入失败：'+e.message); 
        return -1;
    }
    return num;
}
function jiexisave(urls,update) {
    try{
        var filepath = "hiker://files/rules/Src/Juying/myjiexi.json";
        var datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
        
        var num = 0;
        for (var i in urls) {
            let urlname = urls[i].name;
            let urlurl = urls[i].parse;
            let urlstopfrom = urls[i].stopfrom||[];
            let urlpriorfrom = urls[i].priorfrom||[];
            let urlsort = urls[i].sort||0;

            if(update==1){
                for(var j=0;j<datalist.length;j++){
                    if(datalist[j].parse==urlurl||datalist[j].parse==urls[i].oldurl){
                        datalist.splice(j,1);
                        break;
                    }
                }
            }
            
            function checkitem(item) {
                return item.parse==urlurl||item.name==urlname;
            }

            if(!datalist.some(checkitem)&&urlname&&/^http|^functio/.test(urlurl)){
                let arr  = { "name": urlname, "parse": urlurl, "stopfrom": urlstopfrom, "priorfrom": urlpriorfrom, "sort": urlsort };
                if(urls[i].web){arr['web'] = urls[i].web}
                if(urls.length == 1){
                    datalist.unshift(arr);
                }else{
                    datalist.push(arr);
                }
                num = num + 1;
            }
        }
        if(num>0){writeFile(filepath, JSON.stringify(datalist));}
    } catch (e) {
        log('导入失败：'+e.message); 
        return -1;
    }
    return num;
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
        clearMyVar('apidata');
        clearMyVar('isSaveAs');
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
            desc: getMyVar('apitype')=="xpath"?"接口地址以csp_xpath_为前缀":getMyVar('apitype')=="biubiu"?"接口地址以csp_biubiu_为前缀":"接口地址",
            extra: {
                titleVisible: false,
                defaultValue: getMyVar('apitype')=="xpath"&&getMyVar('apiurl', '')==""?'csp_xpath_':getMyVar('apitype')=="biubiu"&&getMyVar('apiurl', '')==""?'csp_biubiu_':getMyVar('apiurl', ''),
                onChange: 'putMyVar("apiurl",input)'
            }
        });
        if(getMyVar('apitype')=="xpath"||getMyVar('apitype')=="biubiu"){
            d.push({
                title:'data代码',
                col_type: 'input',
                desc: "对象数据格式要求非常高\n大佬来偿试写接口呀",
                extra: {
                    titleVisible: false,
                    highlight: true,//getMyVar('apidata', data&&data.data?JSON.stringify(data.data):"")
                    defaultValue: getMyVar('apidata')?JSON.stringify(JSON.parse(getMyVar('apidata')), null, "\t"):data&&data.data?JSON.stringify(data.data, null, "\t"):"",
                    type: "textarea",
                    height: 5,
                    onChange: '/{|}/.test(input)?putMyVar("apidata",JSON.stringify(JSON.parse(input))):""'
                }
            });
        }
        d.push({
            title: getMyVar('apitype', '')==""?'类型：自动识别':'类型：'+getMyVar('apitype'),
            col_type:'text_1',
            url:$(["v1","app","v2","iptv","cms","xpath","biubiu","自动"],3).select(()=>{
                if(input=="自动"){
                    clearMyVar('apitype');
                    clearMyVar('apidata');
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
    if(lx=="update"){
        d.push({
            title: getMyVar('isSaveAs', '')!="1"?'保存方式：覆盖':'保存方式：另存',
            col_type:'text_1',
            url:$('#noLoading#').lazyRule(()=>{
                if(getMyVar('isSaveAs', '')!="1"){
                    putMyVar('isSaveAs', '1');
                }else{
                    clearMyVar('isSaveAs');
                }
                refreshPage(false);
                return 'toast://已切换';
            })
        });
    }
    for (let i = 0; i < 10; i++) {
        d.push({
            col_type: "blank_block"
        })
    }
    
    d.push({
        title:'测试',
        col_type:'text_3',
        url: $(getMyVar("testkey","我的"),"输入测试搜索关键字").input(()=>{
                putMyVar("testkey",input);
                if(getMyVar('addtype', '1')=="1"&&!/^http|^csp/.test(getMyVar('apiurl',''))){return "toast://接口地址不正确"}
                return $('hiker://empty#noRecordHistory##noHistory#').rule((name) => {
                    let apiurl = getMyVar('apiurl');
                    let apiname = getMyVar('apiname');
                    let apiurls = getMyVar('apiurls');
                    let apiua = getMyVar('apiua','Dalvik/2.1.0');
                    let datalist = [];
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    if(getMyVar('addtype', '1')=="1"&&apiname&&apiurl){
                        let urltype = getMyVar('apitype')||getapitype(apiurl);
                        let urlgroup = getMyVar('apigroup');
                        let arr = {"name": apiname, "url": apiurl, "ua": apiua, "type": urltype };
                        if(urlgroup){arr['group'] = urlgroup}
                        if(getMyVar('apidata')){
                            try{
                                arr['data'] = JSON.parse(getMyVar('apidata'));
                            }catch(e){
                                return "toast://data对象数据异常";
                            }
                        }
                        datalist.push(arr);
                    }else if(getMyVar('addtype', '1')=="2"&&apiurls){
                        var urls = apiurls.replace(/,|，/g,"#").split('\n');
                        for (var i in urls) {
                            let urlname = urls[i].split('#')[0];
                            let urlurl = urls[i].split('#')[1];
                            let urltype = urls[i].split('#')[2]||getapitype(urlurl);
                            let urlgroup = urls[i].split('#')[3]||getMyVar('apigroup');
                            if(!datalist.some(item => item.url ==urlurl)&&urlname&&/^http/.test(urlurl)&&urltype){
                                let arr  = { "name": urlname, "url": urlurl, "ua": apiua, "type": urltype };
                                if(urlgroup){datalist['group'] = urlgroup}
                                datalist.push(arr);
                            }
                        }
                    }else{
                        return "toast://无法测试，检查项目填写完整性";
                    }
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyXunmi.js');
                    xunmi(name, datalist);
                },input);
            })
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

                let cfgfile = "hiker://files/rules/Src/Juying/config.json";
                let Juyingcfg=fetch(cfgfile);
                if(Juyingcfg != ""){
                    eval("var JYconfig=" + Juyingcfg+ ";");
                }else{
                    var JYconfig= {};
                }
                if(JYconfig.zsjiekou.api_url==dataurl){
                    delete JYconfig['zsjiekou'];
                    writeFile(cfgfile, JSON.stringify(JYconfig));
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
        url: $().lazyRule((lx,data)=>{
            if(getMyVar('addtype', '1')=="1"&&!/^http|^csp/.test(getMyVar('apiurl',''))){return "toast://接口地址不正确"}
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
            var urls= [];
            let apiurl = getMyVar('apiurl');
            let apiname = getMyVar('apiname');
            let apiurls = getMyVar('apiurls');
            let apiua = getMyVar('apiua','Dalvik/2.1.0');
            let isupdate = 0;
            if(getMyVar('addtype', '1')=="1"&&apiname&&apiurl){
                let urltype = getMyVar('apitype');
                let apigroup = getMyVar('apigroup');
                let apidata = getMyVar('apidata');
                let arr = {"name": apiname.trim(), "url": apiurl.trim(), "ua": apiua, "type": urltype };
                if(apigroup){arr['group'] = apigroup}
                if(apidata){
                    try{
                        arr['data'] = JSON.parse(apidata);
                    }catch(e){
                        return "toast://data对象数据异常";
                    }
                }
                if(lx=="update"){
                    isupdate = 1;
                    if((apiurl==data.url&&apiname==data.name&&apiua==data.ua&&urltype==data.type&&apigroup==(data.group?data.group:'')&&apidata==(data.data?JSON.stringify(data.data):''))){
                        return "toast://未修改";
                    }else{
                        arr['oldurl'] = data.url;
                    }
                }
                urls.push(arr);
            }else if(getMyVar('addtype', '1')=="2"&&apiurls){
                let list = apiurls.replace(/,|，/g,"#").split('\n');
                for (var i in list) {
                    let urlname = list[i].split('#')[0];
                    let urlurl = list[i].split('#')[1];
                    let urltype = list[i].split('#')[2]||getapitype(urlurl);
                    let urlgroup = list[i].split('#')[3]||"";
                    let arr  = { "name": urlname.trim(), "url": urlurl.trim(), "ua": apiua, "type": urltype };
                    if(urlgroup){arr['group'] = urlgroup}
                    urls.push(arr);
                }
            }else{
                return "toast://无法保存，检查项目填写完整性";
            }
            if(urls.length==0){
                    return'toast://失败>无数据';
            }else{
                if(getMyVar('isSaveAs','')=="1"){
                    isupdate = 0;
                }
                var jknum = jiekousave(urls, isupdate);
                if(jknum<0){
                    return'toast://失败>内容异常';
                }else if(jknum==0&&urls.length==1){
                    return'toast://已存在';
                }else{
                    back(true);
                    if(urls.length==1){
                        return "toast://保存成功";
                    }else{
                        return "toast://合计："+urls.length+"，保存："+jknum;
                    }
                }
            } 
        }, lx, data)
    });
    for (let i = 0; i < 10; i++) {
        d.push({
            col_type: "blank_block"
        })
    }
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
        clearMyVar('parseisweb');
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
                highlight: true,
                type: "textarea",
                titleVisible: false,
                defaultValue: getMyVar('parseurl', lx=="update"?data.url:""),
                onChange: 'putMyVar("parseurl",input)'
            }
        });
        function selectfrom(lx,oldfrom){
            addListener("onClose", $.toString(() => {
                clearMyVar('selectfrom');
            }));
            var d = [];
            d.push({
                title: lx=="prior"?'优先片源标识不为空时，优先级在上次优先之后':'排除对应片源后，解析将不再调用',
                col_type: "rich_text"
            });
            d.push({
                col_type: "line"
            });
            d.push({
                title:lx=="prior"?'优先片源':'排除片源',
                col_type: 'input',
                desc: getMyVar('selectfrom',oldfrom),
                extra: {
                    titleVisible: false,
                    defaultValue: getMyVar('selectfrom', oldfrom),
                    onChange: 'putMyVar("selectfrom",input)'
                }
            });
            d.push({
                title: '选择对应的片源标识>',
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
                    title:getMyVar('selectfrom',oldfrom).indexOf(froms[i])>-1?'‘‘’’<span style="color:red">'+froms[i]:froms[i],
                    col_type:'text_4',
                    url: $('#noLoading#').lazyRule((from)=>{
                            let selectfrom = getMyVar('selectfrom')?getMyVar('selectfrom','').replace(/,|，/g,",").split(','):[];
                            if(selectfrom.indexOf(from)==-1){
                                selectfrom.push(from);
                                var sm = '选择片源>'+from;
                            }else{
                                function removeByValue(arr, val) {
                                    for(var i = 0; i < arr.length; i++) {
                                        if(arr[i] == val) {
                                        arr.splice(i, 1);
                                        break;
                                        }
                                    }
                                }
                                removeByValue(selectfrom,from);
                                var sm = '删除片源>'+from;
                            }
                            putMyVar('selectfrom',selectfrom.join(','));
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
                url: $('#noLoading#').lazyRule((lx)=>{
                    if(lx=="prior"){
                        putMyVar('priorfrom',getMyVar('selectfrom',''));
                    }else{
                        putMyVar('stopfrom',getMyVar('selectfrom',''));
                    }
                    back(true);
                    return "hiker://empty";
                },lx)
            });
            setHomeResult(d);
        }
        let priorfrom = getMyVar('priorfrom', data&&data.priorfrom?data.priorfrom:"");
        d.push({
            title:'优先片源：' + priorfrom,
            col_type: 'text_1',
            url:$('hiker://empty#noRecordHistory##noHistory#').rule((selectfrom,lx,oldfrom) => {
                selectfrom(lx,oldfrom);
            },selectfrom,'prior',priorfrom)
        });
        let stopfrom = getMyVar('stopfrom', lx=="update"?data.stopfrom:"");
        d.push({
            title:'排除片源：' + stopfrom,
            col_type: 'text_1',
            url: $('hiker://empty#noRecordHistory##noHistory#').rule((selectfrom,lx,oldfrom) => {
                selectfrom(lx,oldfrom);
            },selectfrom,'stop',stopfrom)
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
        if(lx=="update"&&getMyVar('parseisweb',data&&data.web==1?"1":"0")=="1"){
            putMyVar('parseisweb','1');
        }
        d.push({
            title:'是否明确为web普通解析：' + (getMyVar('parseisweb')=="1"?"是":"否"),
            col_type: 'text_1',
            url:$().lazyRule(()=>{
                if(/^http/.test(getMyVar('parseurl',''))&&!/json|id=|key=/.test(getMyVar('parseurl',''))){
                    if(getMyVar('parseisweb')=="1"){
                        putMyVar('parseisweb','0');
                    }else{
                        putMyVar('parseisweb','1');
                    }
                    refreshPage(false);
                    return "hiker://empty";
                }else{
                    return "toast://以http开头的普通解析才能标记"
                }
            })
        });
    }else{
        d.push({
            title:'批量添加',
            col_type: 'input',
            desc: "一行一个解析\n格式：解析名称#链接地址\n分隔符#可以用,号代替\n\n\n断插解析导入\n明码格式：★xxx★xxx\n云分享链接也支持的",
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
            if(!dataurl||!/^http|^functio/.test(dataurl.trim())){
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
            }catch(e){}
            if(getMyVar('parseisweb')=="1"){parsearr['web']= 1}
            urls['自定义'] = "";
            for(var key in urls){
                addItemBefore('jxline2', {
                    title: key,
                    url: key!="自定义"?$('#noRecordHistory##noHistory#').lazyRule((vipUrl,parseStr)=>{
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                        return SrcParseS.聚影(vipUrl, parseStr);
                    },urls[key],parsearr):$("","输入自定义播放地址").input((parseStr) => {
                        if(input==""){
                            return "toast://未输入自定义地址，无法测试";
                        }else{
                            return $().lazyRule((vipUrl,parseStr)=>{
                                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcParseS.js');
                                return SrcParseS.聚影(vipUrl, parseStr);
                            }, input, parseStr)
                        }
                    }, parsearr),
                    col_type: "text_3",
                    extra:{
                        cls: 'jxtest',
                        jsLoadingInject: true,
                        blockRules: ['.m4a','.mp3','.flv','.avi','.3gp','.mpeg','.wmv','.mov','.rmvb','.gif','.jpeg','.png','hm.baidu.com','/ads/*.js','.css'] 
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
            if(getMyVar('addtype', '1')=="1"&&!/^http|^functio/.test(getMyVar('parseurl',''))){return "toast://解析地址不正确"}
            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');

            let urls= [];
            let parseurl = getMyVar('parseurl');
            let parsename = getMyVar('parsename');
            let parseurls = getMyVar('parseurls');
            let parsestopfrom = getMyVar('stopfrom',data&&data.stopfrom?data.stopfrom:"");
            let pasrepriorfrom = getMyVar('priorfrom',data&&data.priorfrom?data.priorfrom:"");
            let parseheader = getMyVar('parseheader',data&&data.header?JSON.stringify(data.header):"");
            if(getMyVar('addtype', '1')=="1"&&parseurl&&parsename){
                let isupdate = 0;
                let stopfrom = parsestopfrom.replace('，',',').split(',');
                stopfrom = stopfrom.filter(n => n);
                let priorfrom = pasrepriorfrom.replace('，',',').split(',');
                priorfrom = priorfrom.filter(n => n);
                let arr  = { "name": parsename.trim(), "parse": parseurl.trim(), "stopfrom": stopfrom, "priorfrom": priorfrom, "sort": 0};
                try{
                    if(parseheader){arr['header']= JSON.parse(parseheader)}
                }catch(e){     }
                try{
                    if(getMyVar('parseisweb')=="1"){arr['web']= 1}
                }catch(e){}
                
                if(lx=="update"){
                    isupdate = 1;
                    arr['oldurl'] = data.url;
                }
                urls.push(arr);
                let num = jiexisave(urls,isupdate);
                if(num==1){
                    back(true);
                    return "toast://已保存";
                }else if(num==0){
                    return "toast://已存在";
                }else{
                    return "toast://保存出错";
                }
            }else if(getMyVar('addtype', '1')=="2"&&parseurls){
                if(parseurls.indexOf('★')>-1){
                    try{
                        if(/^https:\/\/netcut\.cn/.test(parseurls)&&parseurls.indexOf('★MyParseS合集★')>-1){
                            let parsesurl = parsePaste(parseurls);
                            eval(base64Decode(parsesurl.replace('MyParseS合集★@base64://','')));
                            for (let i=0;i<parseTitle.length;i++) {
                                let urlname = parseTitle[i].trim();                            
                                let urlurl = $.stringify(ParseS[urlname]).trim();
                                let arr  = { "name": urlname, "parse": urlurl, "stopfrom": [], "priorfrom": [], "sort": 0 };
                                urls.push(arr);
                            }
                        }else{                        
                            if(/^https:\/\/netcut\.cn/.test(parseurls)){
                                parseurls = parsePaste(parseurls);
                                var urlname = parseurls.split('★')[1].trim();
                                var urlurl = base64Decode(parseurls.split('★')[2]).trim();
                            }else{
                                var urlname = parseurls.split('★')[1].trim();
                                var urlurl = parseurls.split('★')[2].trim();
                            }
                            let arr  = { "name": urlname, "parse": urlurl, "stopfrom": [], "priorfrom": [], "sort": 0 };
                            urls.push(arr);
                        }
                    }catch(e){
                        return "toast://断插解析识别出错";
                    }
                }else{
                    let list = parseurls.replace(/,|，/g,"#").split('\n');
                    for (let i in list) {
                        let urlname = list[i].split('#')[0];
                        let urlurl = list[i].split('#')[1];
                        let arr  = { "name": urlname, "parse": urlurl, "stopfrom": [], "priorfrom": [], "sort": 0 };
                        urls.push(arr);
                    }
                }               
                if(urls.length>0){
                    let num = jiexisave(urls);
                    if(num>=0){
                        back(true);
                        return "toast://成功保存解析："+num;
                    }else{
                        return "toast://保存出错";
                    } 
                }
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
//扩展中心
function extension(){
    addListener("onClose", $.toString(() => {
        clearMyVar('importjiekou');
        clearMyVar('importjiexi');
        clearMyVar('importlive');
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
    //临时保存几个版本，以后删除
    if(JYconfig['codeid2']){
        JYconfig['codedyid'] = JYconfig['codeid2'];
        delete JYconfig['codeid2'];
        let dyname = JYconfig['codedyname'];
        JYconfig['codedyname'] = dyname;
        delete JYconfig['codedyname'];
        writeFile(cfgfile, JSON.stringify(JYconfig));
    }
    //上面临时存放几个版本，将订阅id名称改一下
    if(JYconfig['Jydouli']){
        JYconfig['zsjiekou'] = JYconfig['Jydouli'];
        delete JYconfig['Jydouli'];
        writeFile(cfgfile, JSON.stringify(JYconfig));
    }
    //上面临时存放几个版本，独立展示接口改个名
    var dingyuefilepath = "hiker://files/rules/Src/Juying/dingyue.json";
    var dingyuefile = fetch(dingyuefilepath);
    if(dingyuefile != ""){
        eval("var dingyuelist=" + dingyuefile+ ";");
        JYconfig['dingyue'] = dingyuelist;
        writeFile(cfgfile, JSON.stringify(JYconfig));
        let png = "hiker://files/rules/Src/Juying/dingyue.json";
        let path = getPath(png).replace("file://", "");
        const File = java.io.File;
        let javaImport = new JavaImporter();
        javaImport.importPackage(
            Packages.com.example.hikerview.utils
        );
        with(javaImport) {
            new File(path).delete();
        }
    }
    //上面的代码是将订阅历史迁移合并到config中
    function getide(is) {
        if(is==1){
            return '‘‘’’<strong><font color="#f13b66a">◉ </front></strong>';
        }else{
            return '‘‘’’<strong><font color="#F54343">◉ </front></strong>';
        }
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
            let textcontent = base64Encode(JSON.stringify(text));
            if(textcontent.length>=200000){
                log('分享失败：接口字符数超过最大限制，请精简接口，重点减少xpath和biubiu类型'); 
                return 'toast://分享同步失败，接口字符数超过最大限制';
            }
            try{
                var pasteupdate = JSON.parse(request('https://netcut.cn/api/note/update/', {
                    headers: { 'Referer': 'https://netcut.cn/' },
                    body: 'note_id='+aesDecode('Juying', JYconfig['codeid'])+'&note_content='+textcontent,
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
        title: JYconfig['codedyid']?'已订阅聚影资源码':'订阅聚影资源码',
        desc: JYconfig['codedyid']?'点击订阅、复制、切换资源码'+(JYconfig['codedyname']?'\n当前订阅的资源码为：'+JYconfig['codedyname']:""):'订阅后将与分享者云端数据保持同步',
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
                                let dydatalist = JYconfig.dingyue||[];
                                if(dydatalist.some(item => item.name ==input)){
                                    return 'toast://名称重复，无法保存';
                                }else if(input!=""){
                                    if(!dydatalist.some(item => item.url ==codeid)){
                                        JYconfig['codedyid'] = codeid;
                                        JYconfig['codedyname'] = input;
                                        dydatalist.push({name:input, url:codeid})
                                        JYconfig['dingyue'] = dydatalist;
                                        writeFile(cfgfile, JSON.stringify(JYconfig));
                                        refreshPage(false);
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
                    let codeid = JYconfig['codedyid'];
                    return codeid?$().lazyRule((codeid)=>{
                        let code = '聚影资源码￥'+codeid;
                        copy(code);
                        return "hiker://empty";
                    },codeid):'toast://请先订阅'
                }else if(input=="切换"){
                    let codeid = JYconfig['codedyid'];
                    let dydatalist = JYconfig.dingyue||[];
                    let list = dydatalist.map((list)=>{
                        if(list.url !=codeid){
                            return list.name;
                        }
                    })
                    list = list.filter(n => n);
                    if(list.length>0){
                        return $(list,3,"选择需切换的订阅源").select((dydatalist,JYconfig,cfgfile)=>{
                            var url = "";
                            for (var i in dydatalist) {
                                if(dydatalist[i].name==input){
                                    url = dydatalist[i].url;
                                    break;
                                }
                            }
                            if(url){
                                JYconfig['codedyid'] = url;
                                JYconfig['codedyname'] = input;
                                writeFile(cfgfile, JSON.stringify(JYconfig));
                                refreshPage(false);
                                return 'toast://订阅已切换为：'+input+'，更新资源立即生效';
                            }else{
                                return 'toast://本地订阅记录文件异常，是不是干了坏事？';
                            }
                        },dydatalist,JYconfig,cfgfile)
                    }else{
                        return 'toast://未找到可切换的历史订阅';
                    }
                }
            },JYconfig,cfgfile),
        col_type: "text_center_1"
    });

    d.push({
        title: '更新资源',
        url: JYconfig['codedyid']?$().lazyRule((codedyid) => {
                try{
                    let codeid = codedyid;
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
            }, JYconfig['codedyid']):'toast://请先订阅聚影资源码',
        col_type: "text_2"
    });
    d.push({
        title: '删除订阅',
        url: JYconfig['codedyid']?$(["仅删订阅源，保留历史","册除订阅及历史，不再切换"],1).select((JYconfig,cfgfile)=>{
            if(input=="仅删订阅源，保留历史"){
                return $().lazyRule((JYconfig,cfgfile) => {
                    delete JYconfig['codedyid'];
                    delete JYconfig['codedyname'];
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    refreshPage(false);
                    return 'toast://已删除订阅源，历史记录可用于切换';
                }, JYconfig, cfgfile)
            }else if(input=="册除订阅及历史，不再切换"){
                return $().lazyRule((JYconfig,cfgfile) => {
                    let codeid = JYconfig['codedyid'];
                    delete JYconfig['codedyid'];
                    delete JYconfig['codedyname'];
                    let dydatalist = JYconfig.dingyue||[];
                    for (var i in dydatalist) {
                        if(dydatalist[i].url==codeid){
                            dydatalist.splice(i,1);
                            break;
                        }
                    }
                    JYconfig['dingyue'] = dydatalist;
                    writeFile(cfgfile, JSON.stringify(JYconfig));
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
        title: '搜索分组',
        url: $(JYconfig['xunmigroup']?JYconfig['xunmigroup']:"全部","设置搜索时默认分组").input((JYconfig,cfgfile) => {
                JYconfig['xunmigroup'] = input;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://默认搜索分组'+(input?'已设置为：'+input:'已清空');
            }, JYconfig, cfgfile),
        col_type: "text_3"
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
        col_type: "text_3"
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
        col_type: "text_3"
    });
    d.push({
        title: '失败次数',
        url: $(JYconfig['failnum']?JYconfig['failnum']:"10","设置接口搜索失败多少次，转移到失败待处理分组").input((JYconfig,cfgfile) => {
                if(!parseInt(input)||parseInt(input)<1||parseInt(input)>100){return 'toast://输入有误，请输入1-100数字'}else{
                    JYconfig['failnum'] = parseInt(input);
                    writeFile(cfgfile, JSON.stringify(JYconfig));
                    refreshPage(false);
                    return 'toast://接口搜索失败'+input+'次，转移到失败待处理分组';
                }
            }, JYconfig, cfgfile),
        col_type: "text_3"
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
        col_type: "text_3"
    });
    d.push({
        title: JYconfig['recordentry']!=2?'历史记录':'收藏记录',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['recordentry'] == 2){
                    JYconfig['recordentry'] = 1;
                    var sm = "首页观看记录入口改为历史列表";
                }else{
                    JYconfig['recordentry'] = 2;
                    var sm = "首页观看记录入口改为收藏列表";
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://' + sm + '，返回主页后刷新生效';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: JYconfig['sousuoms']==1?'搜索(视界)':'搜索(聚搜)',
        url: $('#noLoading#').lazyRule((JYconfig,cfgfile) => {
                if(JYconfig['sousuoms'] == 2){
                    JYconfig['sousuoms'] = 1;
                    var sm = "视界搜索改为调用原始视界搜索";
                }else{
                    JYconfig['sousuoms'] = 2;
                    var sm = "视界搜索改为调用聚影接口聚合搜索";
                }
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://' + sm + '，返回主页后刷新生效';
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: '其他资源',
        col_type: "rich_text"
    });
    d.push({
        col_type: "line_blank"
    });
    d.push({
        title: '选择需要导入的项目',
        col_type: "rich_text",
        extra:{textSize:16}
    });
    d.push({
        title:(getMyVar('importjiekou','0')=="1"?getide(1):getide(0))+'影视接口',
        col_type:'text_3',
        url:$("确定要清空上面填写的内容？").confirm(()=>{
            clearMyVar('parsename');
            clearMyVar('parseurl');
            clearMyVar('parseurls');
            refreshPage(false);
            return "toast://已清空";
        })
    });
    d.push({
        title:(getMyVar('importjiexi','0')=="1"?getide(1):getide(0))+'解析接口',
        col_type:'text_3',
        url:$("确定要清空上面填写的内容？").confirm(()=>{
            clearMyVar('parsename');
            clearMyVar('parseurl');
            clearMyVar('parseurls');
            refreshPage(false);
            return "toast://已清空";
        })
    });
    d.push({
        title:(getMyVar('importlive','0')=="1"?getide(1):getide(0))+'直播接口',
        col_type:'text_3',
        url:$("确定要清空上面填写的内容？").confirm(()=>{
            clearMyVar('parsename');
            clearMyVar('parseurl');
            clearMyVar('parseurls');
            refreshPage(false);
            return "toast://已清空";
        })
    });
    
    d.push({
        title: 'biu导入',
        url:$("","输入biubiu资源地址").input(() => {
                try{
                    showLoading('检测文件有效性');
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    var html = fetch(input,{timeout:2000});
                    var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
                    html = html.replace(reg, function(word) { 
                        return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                    }).replace(/\\ '/g,"\'").replace(/\\ "/g,`\"`).replace(/\\>/g,">").replace(/\\'"/g,`'"`).replace(/[\x00-\x1F\x7F]/g,'');
                    //var bbdata = JSON.parse(html);
                    eval('var bbdata = ' + html)
                    var bbjiekou = bbdata.zhuyejiekou||[];
                    var bbcaiji = bbdata.caijizhan||[];
                    var bbzidingyi = bbdata.zidingyi||[];
                } catch (e) {
                    hideLoading();
                    log('接口导入失败：'+e.message); 
                    return "toast://导入失败：连接无效或内容有错";
                }
                showLoading('正在抓取数据中')
                var urls= [];
                for(var i in bbjiekou){
                    urls.push({ "name": bbjiekou[i].name, "url": bbjiekou[i].url, "group": "新导入"})
                }
                for(var i in bbcaiji){
                    urls.push({ "name": bbcaiji[i].name, "url": /\/api.php^/.test(bbcaiji[i].url)?bbcaiji[i].url+"/provide/vod":bbcaiji[i].url, "group": "新导入"})
                }
                for(var i in bbzidingyi){
                    try{
                        let biudata = {};
                        biudata.url = bbzidingyi[i].url;
                        biudata.jiequshuzuqian = bbzidingyi[i].jiequshuzuqian;
                        biudata.jiequshuzuhou = bbzidingyi[i].jiequshuzuhou;
                        biudata.tupianqian = bbzidingyi[i].tupianqian;
                        biudata.tupianhou = bbzidingyi[i].tupianhou;
                        biudata.biaotiqian = bbzidingyi[i].biaotiqian;
                        biudata.biaotihou = bbzidingyi[i].biaotihou;
                        biudata.lianjieqian = bbzidingyi[i].lianjieqian;
                        biudata.lianjiehou = bbzidingyi[i].lianjiehou;
                        biudata.sousuoqian = bbzidingyi[i].sousuoqian;
                        biudata.sousuohou = bbzidingyi[i].sousuohou;
                        biudata.sousuohouzhui = bbzidingyi[i].sousuohouzhui;
                        biudata.ssmoshi = bbzidingyi[i].ssmoshi;
                        biudata.bfjiequshuzuqian = bbzidingyi[i].bfjiequshuzuqian;
                        biudata.bfjiequshuzuhou = bbzidingyi[i].bfjiequshuzuhou;
                        biudata.zhuangtaiqian = bbzidingyi[i].zhuangtaiqian;
                        biudata.zhuangtaihou = bbzidingyi[i].zhuangtaihou;
                        biudata.daoyanqian = bbzidingyi[i].daoyanqian;
                        biudata.daoyanhou = bbzidingyi[i].daoyanhou;
                        biudata.zhuyanqian = bbzidingyi[i].zhuyanqian;
                        biudata.zhuyanhou = bbzidingyi[i].zhuyanhou;
                        biudata.juqingqian = bbzidingyi[i].juqingqian;
                        biudata.juqinghou = bbzidingyi[i].juqinghou;
                        urls.push({ "name": bbzidingyi[i].name, "url": bbzidingyi[i].url, "type": "biubiu", "ua": "PC_UA", "data": biudata, "group": "新导入"})
                    }catch(e){
                        //log(bbzidingyi[i].name + '>抓取失败>' + e.message)
                    }
                }

                try{
                    var jknum = jiekousave(urls);
                }catch(e){
                    var jknum =-1;
                    log('导入保存有异常>'+e.message);
                }  
                hideLoading();
                if(jknum<0){
                    return'toast://导入失败，内容异常';
                }else{
                    let zhujiexi = bbdata.zhujiexi||"";
                    let zjiexi = zhujiexi.split('#');
                    let beiyongjiexi = bbdata.beiyongjiexi||"";
                    let bjiexi = beiyongjiexi.split('#');
                    var jiexi = zjiexi.concat(bjiexi);
                    if(jiexi.length>0){
                        return $("接口导入已完成，成功保存："+jknum+ "，确定要继续导入解析吗？\n不建议导入，因为99%是失效的").confirm((jiexi,jiexisave)=>{
                            try{
                                let urls = [];
                                for (let i=0;i<jiexi.length;i++) {
                                    if(/^http/.test(jiexi[i])){
                                        let arr  = { "name": "bb"+namebh, "parse": jiexi[i], "stopfrom": [], "priorfrom": [], "sort": 1 };
                                        urls.push(arr);
                                    }
                                }
                                let jxnum = jiexisave(urls);
                                if(jxnum>0){
                                    return "toast://导入完成，解析保存："+jxnum;
                                }else{
                                    return "toast://无解析";
                                }
                            } catch (e) {
                                log('解析导入失败：'+e.message); 
                                return "toast://解析导入失败";
                            }
                        }, jiexi,jiexisave)
                    }else{
                        return "toast://接口导入已完成，成功保存："+jknum;
                    }
                }
        }),
        col_type: "text_3"
    });
    d.push({
        title: 'TVBox导入',
        url:$("","输入TVBox/beibei资源地址").input(() => {
            try{
                showLoading('检测文件有效性');
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                if(/\/storage\/emulated\//.test(input)){input = "file://" + input}
                var html = fetch(input,{timeout:2000});
                var reg = /("([^\\\"]*(\\.)?)*")|('([^\\\']*(\\.)?)*')|(\/{2,}.*?(\r|\n|$))|(\/\*(\n|.)*?\*\/)/g;
                html = html.replace(/api\"\:csp/g,'api":"csp').replace(reg, function(word) { 
                    return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                }).replace(/^.*#.*$/gm,"").replace(/\,\,/g,',');//.replace(/=\\n\"/g,'="')|[\t\r\n]
                //log(html);
                eval('var data = ' + html)
                //var data = JSON.parse(html);                        
                var jiekou = data.sites||[];
                var jiexi = data.parses||[];
            } catch (e) {
                hideLoading();
                log('接口导入失败：'+e.message); 
                return "toast://导入失败：连接无效或内容有错";
            }
            showLoading('正在多线程抓取数据中');
            var urls= [];
            //多线程处理
            var task = function(obj) {
                if(/^csp_AppYs/.test(obj.api)){
                    urls.push({ "name": obj.name, "url": obj.ext, "group": "新导入"})
                }else if((obj.type==1||obj.type==0)&&obj.api.indexOf('cms.nokia.press')==-1){
                    urls.push({ "name": obj.name, "url": obj.api, "group": "新导入"})
                }else if(/^csp_XBiubiu/.test(obj.api)){
                    try{
                        let urlfile = obj.ext;
                        if(/^clan:/.test(urlfile)){
                            urlfile = urlfile.replace("clan://TVBox/",input.match(/file.*\//)[0]);
                        }
                        let biuhtml = fetch(urlfile,{timeout:2000});
                        biuhtml = biuhtml.replace(reg, function(word) { 
                            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                        }).replace(/^.*#.*$/mg,"").replace(/[\x00-\x1F\x7F]|[\t\r\n]/g,'');
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
                        urls.push({ "name": obj.name, "url": obj.key, "type": "biubiu", "ua": "PC_UA", "data": biudata, "group": "新导入"})
                    }catch(e){
                        //log(obj.name + '>抓取失败>' + e.message)
                    }
                }else if(/^csp_XPath/.test(obj.api)){
                    try{
                        let urlfile = obj.ext;
                        if(/^clan:/.test(urlfile)){
                            urlfile = urlfile.replace("clan://TVBox/",input.match(/file.*\//)[0]);
                        }
                        let xphtml = fetch(urlfile,{timeout:2000});
                        xphtml = xphtml.replace(reg, function(word) { 
                            return /^\/{2,}/.test(word) || /^\/\*/.test(word) ? "" : word; 
                        }).replace(/^.*#.*$/mg,"").replace(/[\x00-\x1F\x7F]|[\t\r\n]/g,'');
                        let xpjson = JSON.parse(xphtml);
                        let xpdata = {};
                        xpdata.filter = "";
                        xpdata.dtUrl = xpjson.dtUrl;
                        xpdata.dtImg = xpjson.dtImg;
                        xpdata.dtCate = xpjson.dtCate;
                        xpdata.dtYear = xpjson.dtYear;
                        xpdata.dtArea = xpjson.dtArea;
                        xpdata.dtMark = xpjson.dtMark;
                        xpdata.dtDirector = xpjson.dtDirector;
                        xpdata.dtActor = xpjson.dtActor;
                        xpdata.dtDesc = xpjson.dtDesc;
                        xpdata.dtFromNode = xpjson.dtFromNode;
                        xpdata.dtFromName = xpjson.dtFromName;
                        xpdata.dtUrlNode = xpjson.dtUrlNode;
                        xpdata.dtUrlSubNode = xpjson.dtUrlSubNode;
                        xpdata.dtUrlId = xpjson.dtUrlId;
                        xpdata.dtUrlName = xpjson.dtUrlName;
                        xpdata.dtUrlIdR = xpjson.dtUrlIdR;
                        xpdata.playUrl = xpjson.playUrl;
                        xpdata.searchUrl = xpjson.searchUrl;
                        xpdata.scVodNode = xpjson.scVodNode;
                        xpdata.scVodName = xpjson.scVodName;
                        xpdata.scVodId = xpjson.scVodId;
                        xpdata.scVodImg = xpjson.scVodImg;
                        xpdata.scVodMark = xpjson.scVodMark;
                        urls.push({ "name": obj.name, "url": obj.ext, "type": "xpath", "ua": xpjson.ua?xpjson.ua:"PC_UA", "data": xpdata, "group": "新导入"})
                    }catch(e){
                        //log(obj.name + '>抓取失败>' + e.message)
                    }
                }
                return 1;
            }
            let jiekous = jiekou.map((list)=>{
                return {
                    func: task,
                    param: list,
                    id: list.name
                }
            });

            be(jiekous, {
                func: function(obj, id, error, taskResult) {                            
                },
                param: {
                }
            });
            try{
                var jknum = jiekousave(urls);
            }catch(e){
                var jknum =-1;
                log('导入保存有异常>'+e.message);
            }                   
            hideLoading();
            if(jknum<0){
                return'toast://导入失败，内容异常';
            }else{
                if(jiexi.length>0){
                    return $("接口导入已完成，成功保存："+jknum+ "，确定要继续导入解析吗？\n不建议导入，因为99%是失效的").confirm((jiexi,jiexisave)=>{
                        try{
                            let urls = [];
                            for (let i=0;i<jiexi.length;i++) {
                                if(/^http/.test(jiexi[i].url)){
                                    let arr  = { "name": jiexi[i].name, "parse": jiexi[i].url, "stopfrom": [], "priorfrom": [], "sort": 1 };
                                    urls.push(arr);
                                }
                            }
                            let jxnum = jiexisave(urls);
                            if(jxnum>0){
                                return "toast://导入完成，解析保存："+jxnum;
                            }else{
                                return "toast://无解析";
                            }
                        } catch (e) {
                            log('解析导入失败：'+e.message);
                            return "toast://解析导入失败";
                        }
                    },jiexi,jiexisave)
                }else{
                    return "toast://接口导入已完成，成功保存："+jknum;
                }
            }
        }),
        col_type: "text_3"
    });
    d.push({
        title: 'TVBox订阅',
        url: $(JYconfig['TVBoxDY']?JYconfig['TVBoxDY']:"","输入TVBox在线接口，在搜索时自动加载").input((JYconfig,cfgfile) => {
                JYconfig['TVBoxDY'] = input;
                writeFile(cfgfile, JSON.stringify(JYconfig));
                refreshPage(false);
                return 'toast://'+(input?'已保存':'已取消');
            }, JYconfig, cfgfile),
        col_type: "text_3"
    });
    d.push({
        title: '其他导入',
        url:$("","仅支持输入JY自定义的资源地址").input(() => {
            if(input=="帅"){
                try{
                    let jxnum = 0;
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    let jiexis = fetch(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'jiexi.txt',{timeout:2000});
                    
                    if(jiexis){
                        let jiexi = jiexis.split('\n');
                        let urls = [];
                        for (let i=0;i<jiexi.length;i++) {
                            if(/^http/.test(jiexi[i].split(',')[1])){
                                let arr  = { "name":jiexi[i].split(',')[0], "parse":jiexi[i].split(',')[1], "stopfrom":[], "priorfrom":[], "sort":1, "web":1 };
                                urls.push(arr);
                            }
                        }
                        jxnum = jiexisave(urls);
                    }
                    if(jxnum>0){
                        return "toast://导入完成，解析保存："+jxnum;
                    }else{
                        return "toast://无解析";
                    }
                } catch (e) {
                    log('解析导入失败：'+e.message);
                    return "toast://解析导入失败";
                }

            }else if(input){
                try{
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJySet.js');
                    eval(fetch(input,{timeout:2000}))
                    var urls= [];
                    for(let k in jyjiekou){
                        let jyua = jyjiekou[k].ua||"PC_UA";
                        let jytype = /csp_biubiu_/.test(k)?"biubiu":"xpath"
                        urls.push({"name":jyjiekou[k].name,"type":jytype,"ua":jyua,"url":k,"data":jyjiekou[k], "group": "新导入"})
                    }
                } catch (e) {
                    log('接口导入失败：'+e.message); 
                    return "toast://导入失败：连接无效或内容有错";
                }
                
                var jknum = jiekousave(urls,1);
                if(jknum<0){
                    return'toast://导入失败，内容异常';
                }else{
                    return "toast://导入完成，接口保存："+jknum;
                }
            } 
        }),
        col_type: "text_3"
    });
    d.push({
        title: '<br>',
        col_type: 'rich_text'
    });
    setHomeResult(d);
}
