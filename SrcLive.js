function Live() {
    addListener("onClose", $.toString(() => {
        clearMyVar('editmode');
        clearMyVar('clearlive');
    }));
    var d = [];
    let livefile = "hiker://files/rules/Src/Juying/live.txt";
    let JYlive=fetch(livefile);

    let livecfgfile = "hiker://files/rules/Src/Juying/liveconfig.json";
    let livecfg = fetch(livecfgfile);
    if(livecfg != ""){
        eval("var liveconfig = " + livecfg);
    }else{
        var liveconfig = {};
    }
    let livedata = liveconfig['data']||[];
    if(JYlive==""&&livedata.length>0&&getMyVar('clearlive','0')!="1"){
        showLoading('发现订阅源，正在初始化');
        log('本地源文件为空且有订阅，默认导入第一个订阅');
        let YChtml = readFile('live'+md5(livedata[0])+'.txt')||request(livedata[0],{timeout:2000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
        if(YChtml.indexOf('#genre#')>-1){
            if(!fileExist('live'+md5(livedata[0])+'.txt')){
                saveFile('live'+md5(livedata[0])+'.txt',YChtml);
            }
            writeFile(livefile, YChtml);
            JYlive = YChtml;
        }
        hideLoading();
    }
    if(JYlive){
        var JYlives = JYlive.split('\n');
    }else{
        var JYlives = [];
    }
    d.push({
        title: '<b>聚影√</b> &nbsp &nbsp <small>⚙直播设置⚙</small>',
        img: "https://img.vinua.cn/images/QqyC.png",
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                LiveSet();
            }),
        col_type: 'avatar'
    });
    if(JYlives.length>0){
        let datalist = [];
        let datalist2 = [];
        let group = "";
        for(let i=0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf('#genre#')>-1){
                    group = JYlives[i].split(',')[0];
                }else if(JYlives[i].indexOf(',')>-1){
                    datalist.push({group: group, name: JYlives[i].split(',')[0].trim()});
                }
            }catch(e){}
        }
        let obj = {};
        datalist = datalist.reduce((newArr, next) => {
            obj[next.name] ? "" : (obj[next.name] = true && newArr.push(next));
            return newArr;
        }, []);
        d.push({
            title: "🔍",
            url: $.toString((guanlidata,datalist) => {
                    if(datalist.length>0){
                        deleteItemByCls('livelist');
                        var lists = datalist.filter(item => {
                            return item.name.includes(input);
                        })
                        let gldatalist = guanlidata(lists);
                        addItemAfter('liveloading', gldatalist);
                    }
                    return "hiker://empty";
                },guanlidata,datalist),
            desc: "搜你想要的...",
            col_type: "input",
            extra: {
                titleVisible: true
            }
        });
        
        let grouplist = datalist.map((list)=>{
            return list.group;
        })
        function uniq(array){
            var temp = []; 
            for(var i = 0; i < array.length; i++){
                if(temp.indexOf(array[i]) == -1){
                    temp.push(array[i]);
                }
            }
            return temp;
        }
        grouplist = uniq(grouplist);
        let index = 0;
        for(var i in grouplist){
            let lists = datalist.filter(item => {
                return item.group==grouplist[i];
            })
            if(lists.length>0){
                if(index==0){
                    datalist2 = lists;
                    index = 1;
                }
                d.push({
                    title: grouplist[i],
                    url: $('#noLoading#').lazyRule((guanlidata,datalist) => {
                        if(datalist.length>0){
                            deleteItemByCls('livelist');
                            var lists = datalist.filter(item => {
                                return item.name.includes(input);
                            })
                            let gldatalist = guanlidata(lists);
                            addItemAfter('liveloading', gldatalist);
                        }
                        return "hiker://empty";
                    },guanlidata,lists),
                    col_type: "scroll_button",
                    extra: {
                        id: grouplist[i]
                    }
                });
            }
        }
        d.push({
            col_type: 'line',
            extra: {
                id: 'liveloading'
            }
        });
        datalist = datalist2;
        d = d.concat(guanlidata(datalist));
        d.push({
            title: '<br>',
            col_type: 'rich_text'
        });
    }else{
        d.push({
            title: '没有直播数据源，可从TVBox导入',
            col_type: 'rich_text'
        });
    }
    setHomeResult(d);
}

function guanlidata(datalist) {
    /*
    function compare (attr,rev) {
        if(rev ==  undefined){
            rev = 1;
        }else{
            rev = (rev) ? 1 : -1;
        }
        return (a,b) => {
            a = a[attr];
            b = b[attr];
            if(a.replace(/[^\d]/g, "")&&b.replace(/[^\d]/g, "")){
                if(parseInt(a.replace(/[^\d]/g, "")) < parseInt(b.replace(/[^\d]/g, ""))){
                    return rev * -1;
                }
                if(parseInt(a.replace(/[^\d]/g, "")) > parseInt(b.replace(/[^\d]/g, ""))){
                    return rev * 1;
                }
                return 0;
            }else{
                if(a < b){
                    return rev * -1;
                }
                if(a > b){
                    return rev * 1;
                }
                return 0;
            }
        }
    }
    datalist = datalist.sort(compare('name',true));  
    */
    let list = []; 
    for (let i=0;i<datalist.length;i++) {
        list.push({
            title: datalist[i].name,
            img: 'https://lanmeiguojiang.com/tubiao/ke/156.png',//https://lanmeiguojiang.com/tubiao/more/228.png
            col_type: 'icon_2_round',
            url: $('#noLoading#').lazyRule((name) => {
                let urls = [];
                let JYlivefile=fetch("hiker://files/rules/Src/Juying/live.txt");
                let JYlives = JYlivefile.split('\n');
                for(var i = 0; i < JYlives.length; i++){
                    try{
                        if(JYlives[i].indexOf(',')>-1&&JYlives[i].split(',')[0].trim()==name){
                            urls.push(JYlives[i].split(',')[1] + '#isVideo=true#');
                        }
                    }catch(e){}
                }
                return JSON.stringify({
                    urls: urls
                }); 
            },datalist[i].name),
            extra: {
                cls: 'livelist'
            }
        });
    }
    return list;
}

function LiveSet() {
    addListener("onClose", $.toString(() => {
        if(getMyVar('isEdit')=="1"){
            refreshPage(false);
        }
        clearMyVar('isEdit');
    }));
    setPageTitle("⚙直播设置⚙");
    var d = [];
    d.push({
        title: '📺 订阅源管理',
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            addListener("onClose", $.toString(() => {
                //refreshPage(false);
            }));
            setPageTitle("⚙直播设置⚙");
            let livecfgfile = "hiker://files/rules/Src/Juying/liveconfig.json";
            let livecfg = fetch(livecfgfile);
            if(livecfg != ""){
                eval("var liveconfig = " + livecfg);
            }else{
                var liveconfig = {};
            }
            var d = [];
            d.push({
                title: '‘‘’’<b>📺 订阅源管理</b> &nbsp &nbsp <small>添加自定义链接</small>',
                img: "https://img.vinua.cn/images/QqyC.png",
                url: $("","输入通用格式的tv链接地址").input((livecfgfile,liveconfig)=>{
                    if(input){
                        let livedata = liveconfig['data']||[];
                        if(livedata.indexOf(input)==-1){
                            let YChtml = request(input,{timeout:2000});
                            if(YChtml.indexOf('#genre#')>-1){
                                livedata.push(input);
                                liveconfig['data'] = livedata;
                                writeFile(livecfgfile, JSON.stringify(liveconfig));
                                refreshPage(false);
                                return "toast://增加自定义tv链接地址成功";
                            }else{
                                return "toast://无法识别，需含#genre#的通用格式";
                            }
                        }else{
                            return "toast://已存在";
                        }
                    }else{
                        return "toast://地址不能为空";
                    }
                },livecfgfile,liveconfig),
                col_type: 'text_1'
            });
            
            let livedata = liveconfig['data']||[];
            if(livedata.length>0){
                d.push({
                    title: '点击下方的订阅源条目，进行操作👇',
                    col_type: "rich_text"
                });
                d.push({
                    col_type: "line"
                });
                for(let i=0;i<livedata.length;i++){
                    d.push({
                        title: livedata[i],
                        url: $(["更新缓存","删除订阅","导入聚直播","导入聚影√"],2,"").select((livecfgfile, url)=>{
                            try{
                                if(input=="更新缓存"){
                                    showLoading('正在缓存，请稍后.');
                                    let YChtml = request(url,{timeout:2000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
                                    if(YChtml){
                                        deleteFile('live'+md5(url)+'.txt');
                                        saveFile('live'+md5(url)+'.txt',YChtml);
                                        hideLoading();
                                        return "toast://更新文件缓存成功";
                                    }else{
                                        hideLoading();
                                        return "toast://更新失败";
                                    }
                                }else if(input=="删除订阅"){
                                    deleteFile('live'+md5(url)+'.txt');
                                    let livecfg = fetch(livecfgfile);
                                    if(livecfg != ""){
                                        eval("var liveconfig = " + livecfg);
                                        let livedata = liveconfig['data']||[];
                                        function removeByValue(arr, val) {
                                            for(var i = 0; i < arr.length; i++) {
                                                if(arr[i] == val) {
                                                arr.splice(i, 1);
                                                break;
                                                }
                                            }
                                        }
                                        removeByValue(livedata,url);
                                        liveconfig['data'] = livedata;
                                        writeFile(livecfgfile, JSON.stringify(liveconfig));
                                        refreshPage(false);
                                    }
                                }else if(input=="导入聚直播"){
                                    let Julivefile = "hiker://files/rules/live/config.json";
                                    let Julive = fetch(Julivefile);
                                    if(Julive != ""){
                                        try{
                                            eval("var Judata=" + Julive+ ";");
                                            let Judatalist = Judata['data']||[];
                                            if(!Judatalist.some(item => item.url==url)){
                                                return $("","取个名字保存吧").input((Julivefile,Judata,url)=>{
                                                    if(input){
                                                        Judata['data'].push({name:input,url:url});
                                                        writeFile(Julivefile, JSON.stringify(Judata));
                                                        return "toast://导入聚直播订阅成功";
                                                    }else{
                                                        return "toast://名称不能为空";
                                                    }
                                                },Julivefile,Judata,url)
                                            }else{
                                                return "toast://已存在聚直播订阅";
                                            }
                                        }catch(e){
                                            log("导入聚直播订阅失败>"+e.message);
                                            return "toast://导入聚直播订阅失败";
                                        }
                                    }else{
                                        return "toast://仓库先导入聚直播小程序";
                                    }
                                }else if(input=="导入聚影√"){
                                    showLoading('叠加导入直播，最大万行限制');
                                    let YChtml = readFile('live'+md5(url)+'.txt')||request(url,{timeout:2000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
                                    if(YChtml.indexOf('#genre#')>-1){
                                        if(!fileExist('live'+md5(url)+'.txt')){
                                            saveFile('live'+md5(url)+'.txt',YChtml);
                                        }
                                        var YClives = YChtml.split('\n');
                                    }else{
                                        var YClives = [];
                                    }
                                    if(YClives.length>0){
                                        let ycnum = 0;
                                        let livefile = "hiker://files/rules/Src/Juying/live.txt";
                                        let JYlive=fetch(livefile);
                                        if(JYlive){
                                            var JYlives = JYlive.split('\n');
                                            let id = 0;
                                            for(let i=0;i<YClives.length;i++){
                                                if(JYlives.length>10000){
                                                    log('直播数据源文件已大于10000行，为保证效率停止导入');
                                                    break;
                                                }else{
                                                    if(YClives[i].indexOf('#genre#')>-1&&JYlives.indexOf(YClives[i])>-1){
                                                        id = JYlives.indexOf(YClives[i]);
                                                    }else if(YClives[i].indexOf('#genre#')>-1&&JYlives.indexOf(YClives[i])==-1){
                                                        id = JYlives.length+1;
                                                    }else if(YClives[i].indexOf(',')>-1&&!JYlives.some(item => item.split(',')[1]==YClives[i].split(',')[1])&&YClives[i].trim()!=""){
                                                        JYlives.splice(id, 0, YClives[i]);
                                                        ycnum++;
                                                    }
                                                }
                                            }
                                        }else{
                                            var JYlives = YClives;
                                        }
                                        writeFile(livefile, JYlives.join('\n'));
                                        hideLoading();
                                        if(ycnum>0){
                                            putMyVar('isEdit','1');
                                        }
                                        return "toast://成功导入"+ycnum;
                                    }else{
                                        return "toast://文件异常，导入失败";
                                    }
                                }
                                return "hiker://empty";
                            }catch(e){
                                hideLoading();
                                log(e.message);
                                return "toast://操作异常，详情查看日志";
                            }
                        }, livecfgfile, livedata[i]),
                        col_type: "text_1"
                    });
                }
            }else{
                d.push({
                    title: '↻无记录',
                    col_type: "rich_text"
                });
            }
            setHomeResult(d);
        }),
        col_type: "text_2"
    });
    d.push({
        title: '🎦 导入聚直播',
        col_type: 'text_2',
        url: $('#noLoading#').lazyRule(() => {
            let Julivefile = "hiker://files/rules/live/config.json";
            let Julive = fetch(Julivefile);
            if(Julive != ""){
                try{
                    eval("var Judata=" + Julive+ ";");
                    let Judatalist = Judata['data']||[];
                    let JYlivefile = "hiker://files/rules/Src/Juying/live.txt";
                    if(!Judatalist.some(item => item.url==JYlivefile)){
                        Judatalist.push({"name":"聚影√", "url":JYlivefile})
                        Judata['data'] = Judatalist;
                        writeFile(Julivefile, JSON.stringify(Judata));
                        return "toast://导入聚直播订阅成功";
                    }else{
                        return "toast://已存在聚直播订阅";
                    }
                }catch(e){
                    log("导入聚直播订阅失败>"+e.message);
                    return "toast://导入聚直播订阅失败";
                }
            }else{
                return "toast://仓库先导入聚直播小程序";
            }
        })
    });
    d.push({
        title: '🛠 编辑本地源',
        col_type: 'text_2',
        url: $(["分组删除","分组改名","直播删除","直播改名"],2,"").select(()=>{
            writeFile("hiker://files/rules/Src/Juying/live.txt", "");
            putMyVar('isEdit','1');
            return "toast://已清空";
        })
    });
    d.push({
        title: '♻ 清空直播源',
        col_type: 'text_2',
        url: $("确定清空聚影直播本地文件？").confirm(()=>{
            writeFile("hiker://files/rules/Src/Juying/live.txt", "");
            putMyVar('isEdit','1');
            putMyVar('clearlive','1');
            return "toast://已清空";
        })
    });
    d.push({
        col_type: 'line'
    });
    d.push({
        title: '删除分组',
        col_type: 'scroll_button',
        url: $('#noLoading#').lazyRule(() => {
            putMyVar('editmode','delete');
            back(false);
            return "toast://进入删除分组模式";
        })
    });
    d.push({
        title: '分组改名',
        col_type: 'scroll_button',
        url: $('#noLoading#').lazyRule(() => {
            putMyVar('editmode','rename');
            back(false);
            return "toast://进入删除分组模式";
        })
    });
    d.push({
        col_type: 'line'
    });
    d.push({
        title: '🔎清理失效的直播源地址',
        desc: '此功能为实验性的，可能存在误删，谨慎操作！\n通过判断地址是否可以访问来甄别有效性',
        col_type: 'text_center_1',
        url: $('#noLoading#').lazyRule(() => {
            putMyVar('isEdit','1');
            let urls = [];
            let JYlivefile="hiker://files/rules/Src/Juying/live.txt";
            let JYlive = fetch(JYlivefile);
            if(JYlive!=""){
                var task = function(obj) {
                    try{
                        let url = obj.split(',')[1];
                        let code = JSON.parse(request(url,{onlyHeaders:true,timeout:1000}));
                        if(code.statusCode!=200){
                            fails.push(obj);
                        }
                    }catch(e){

                    }
                    return 1;
                }
                showLoading('正在检测'+urls.length+'条，请保持屏幕亮屏');
                let JYlives = JYlive.split('\n');
                for(let i = 0; i < JYlives.length; i++){
                    try{
                        if(JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf('#genre#')==-1){
                            urls.push(JYlives[i]);
                        }
                    }catch(e){}
                }
                let fails = [];
                for (var i=0;i<urls.length;i++) {
                    let UrlList = [];
                    let p = i + 799;
                    for(let s=i;s<p;s++){
                        UrlList.push(urls[s]);
                        i=s;
                    }
                    let urlscheck = UrlList.map((list)=>{
                        return {
                            func: task,
                            param: list,
                            id: list
                        }
                        
                    });
                    be(urlscheck, {
                        func: function(obj, id, error, taskResult) {                            
                        },
                        param: {
                        }
                    });
                }
                
                for(let i = 0; i < JYlives.length; i++){
                    if(fails.indexOf(JYlives[i])>-1){
                        JYlives.splice(i,1);
                        i = i - 1;
                    }
                }
                writeFile(JYlivefile, JYlives.join('\n'));
                hideLoading();
                return "toast://删除疑似失效源"+fails.length+"条";
            }else{
                return "toast://没有直播数据源";
            }
        })
    });
    setHomeResult(d);
}