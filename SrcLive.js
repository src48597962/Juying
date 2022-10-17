function Live() {
    addListener("onClose", $.toString(() => {
        clearMyVar('editmode');
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
    if(JYlive==""&&livedata.length>0){
        showLoading('发现订阅源，正在初始化');
        let YChtml = request(livedata[0],{timeout:2000}).replace(/TV-/g,'TV');
        if(YChtml.indexOf('#genre#')>-1){
            writeFile(livefile, YChtml);
            JYlive = YChtml;
            saveFile('live'+md5(livedata[0])+'.txt',YChtml);
        }
        hideLoading();
    }
    if(JYlive){
        var JYlives = JYlive.split('\n');
    }else{
        var JYlives = [];
    }
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
            title: '<b>聚影√</b> &nbsp &nbsp <small>⚙直播设置⚙</small>',
            img: "https://img.vinua.cn/images/QqyC.png",
            url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                    LiveSet();
                }),
            col_type: 'avatar'
        });
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
        d.push({
            col_type: 'line'
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
        title: '🆖 订阅源管理',
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
            addListener("onClose", $.toString(() => {
                //refreshPage(false);
            }));
            //setPageTitle("🆖资源导入-历史记录");
            let livecfgfile = "hiker://files/rules/Src/Juying/liveconfig.json";
            let livecfg = fetch(livecfgfile);
            if(livecfg != ""){
                eval("var liveconfig = " + livecfg);
            }else{
                var liveconfig = {};
            }
            var d = [];
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
                            /*
                                if(input=="选择"){
                                    putMyVar('importinput', url);
                                    back(true);
                                }else if(input=="删除"){
                                    let importrecord = JYconfig['importrecord']||[];
                                    for(let i=0;i<importrecord.length;i++){
                                        if(importrecord[i].url==url&&importrecord[i].type==getMyVar('importtype','0')){
                                            importrecord.splice(i,1);
                                            break;
                                        }
                                    }
                                    JYconfig['importrecord'] = importrecord; 
                                    writeFile(cfgfile, JSON.stringify(JYconfig));
                                    refreshPage(false);
                                }
                                */
                                return "hiker://empty";
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
        title: '导入聚直播',
        img: 'https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fis4.mzstatic.com%2Fimage%2Fthumb%2FPurple3%2Fv4%2Fdf%2Ff6%2Fda%2Fdff6da83-47d7-9cb6-2398-1919c13837b4%2Fmzl.kgmnwodo.png%2F0x0ss-85.jpg&refer=http%3A%2F%2Fis4.mzstatic.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1638629349&t=2f6d967185fe2b9c54e8b230eb83e66c',
        col_type: 'icon_2_round',
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
        title: '清空直播源',
        img: 'https://lanmeiguojiang.com/tubiao/messy/8.svg',
        col_type: 'icon_2_round',
        url: $('#noLoading#').lazyRule(() => {
            writeFile("hiker://files/rules/Src/Juying/live.txt", "");
            putMyVar('isEdit','1');
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
        title: '删除失效的直播源地址',
        desc: '此功能为实验性的，可能存在误删，谨慎操作！\n通过判断地址是否可以访问来甄别有效性',
        col_type: 'text_center_1',
        url: $('#noLoading#').lazyRule(() => {
            putMyVar('isEdit','1');
            let urls = [];
            let JYlivefile="hiker://files/rules/Src/Juying/live.txt";
            let JYlive = fetch(JYlivefile);
            if(JYlive!=""){
                let JYlives = JYlive.split('\n');
                for(let i = 0; i < JYlives.length; i++){
                    try{
                        if(JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf('#genre#')==-1){
                            urls.push(JYlives[i]);
                        }
                    }catch(e){}
                }
                let fails = [];
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