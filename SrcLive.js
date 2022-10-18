function Live() {
    addListener("onClose", $.toString(() => {
        clearMyVar('editmode');
        clearMyVar('clearlive');
        clearMyVar('JYlivenum');
        clearMyVar('JYlivedyurl');
    }));
    var d = [];
    d.push({
        title: '<b>聚影√</b> &nbsp &nbsp <small>⚙直播设置⚙</small>',
        img: "https://img.vinua.cn/images/QqyC.png",
        url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                LiveSet();
            }),
        col_type: 'avatar'
    });
    let livecfgfile = "hiker://files/rules/Src/Juying/liveconfig.json";
    let livecfg = fetch(livecfgfile);
    if(livecfg != ""){
        eval("var liveconfig = " + livecfg);
    }else{
        var liveconfig = {};
    }
    let livedata = liveconfig['data']||[];

    let JYlivefile = "hiker://files/rules/Src/Juying/live.txt";
    let JYlive= "";
    let JYlivedyurl = getMyVar('JYlivedyurl','juying');
    if(JYlivedyurl=="juying"){
        JYlive=fetch(JYlivefile);
    }

    if(livedata.length>0){
        d.push({
            col_type: 'line'
        })
        for (let i = 0; i < 9; i++) {
            d.push({
                col_type: "blank_block"
            })
        }
        d.push({
            title: '本地✋',
            url: $("#noLoading#").lazyRule(() => {
                putMyVar('JYlivedyurl','juying');
                refreshPage(false);
                return "toast://聚影直播本地源数据";
            }),
            col_type: 'scroll_button'
        })
        for(let i=0;i<livedata.length;i++){
            let dyname = livedata[i].name;
            let dyurl = livedata[i].url;
            d.push({
                title: getMyVar('JYlivedyurl')==dyurl?dyname+'✋':dyname,
                url: $("#noLoading#").lazyRule((dyname,dyurl) => {
                    putMyVar('JYlivedyurl',dyurl);
                    refreshPage(false);
                    return "toast://已切换远程订阅："+dyname;
                },dyname,dyurl),
                col_type: 'scroll_button'
            })
        }
        d.push({
            col_type: 'line'
        })
    }

    if(JYlive==""&&livedata.length>0&&(getMyVar('clearlive','0')!="1"||JYlivedyurl!="juying")){
        showLoading('发现订阅源，正在初始化');
        if(JYlivedyurl=="juying"){
            log('本地源文件为空且有订阅，默认导入第一个订阅');
            var tourl = livedata[0].url;
        }else{
            var tourl = JYlivedyurl;
        }
        let YChtml = readFile('live'+md5(tourl)+'.txt')||request(tourl,{timeout:2000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
        if(YChtml.indexOf('#genre#')>-1){
            if(!fileExist('live'+md5(tourl)+'.txt')){
                saveFile('live'+md5(tourl)+'.txt',YChtml);
            }
            if(JYlivedyurl=="juying"){
                writeFile(JYlivefile, YChtml);
            }
            JYlive = YChtml;
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
        putMyVar('JYlivenum',datalist.length);
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
                id: "livesearch",
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
                let groupname = grouplist[i]?grouplist[i]:"未分组";
                d.push({
                    title: index==0?'‘‘’’<b><span style="color:#3399cc">'+groupname:groupname,
                    url: $('#noLoading#').lazyRule((grouplist,groupname,guanlidata,datalist,JYlivefile) => {
                        for(let i in grouplist){
                            if(grouplist[i]==groupname){
                                updateItem(groupname,{title:'‘‘’’<b><span style="color:#3399cc">'+groupname})
                            }else{
                                updateItem(grouplist[i],{title:grouplist[i]})
                            }
                        }
                        if(!/^group/.test(getMyVar('editmode','0'))){
                            deleteItemByCls('livelist');
                            var lists = datalist.filter(item => {
                                return item.name.includes(input);
                            })
                            let gldatalist = guanlidata(lists);
                            addItemAfter('liveloading', gldatalist);
                            return "hiker://empty";
                        }else if(getMyVar('editmode','0')=="groupdelete"){
                            try{
                                showLoading('加载中，请稍候...');
                                let JYlive=fetch(JYlivefile);
                                let JYlives = JYlive.split('\n');
                                for(let i=0;i<JYlives.length;i++){
                                    if(JYlives[i].indexOf('#genre#')>-1&&JYlives[i].indexOf(groupname)>-1){
                                        JYlives.splice(i,1);
                                        i = i - 1;
                                    }else if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&datalist.some(item => item.name==JYlives[i].split(',')[0])){
                                        JYlives.splice(i,1);
                                        i = i - 1;
                                    }
                                }
                                writeFile(JYlivefile, JYlives.join('\n'));
                                hideLoading();
                                refreshPage(false);
                                return "toast://已删除分组 <"+groupname+"> 所有地址";
                            }catch(e){
                                hideLoading();
                                log(e.message);
                                return "toast://删除分组失败，详情查看日志";
                            }
                        }else if(getMyVar('editmode','0')=="grouprename"){
                            return $("","输入新的分组名").input((groupname,JYlivefile)=>{
                                if(input){
                                    let JYlive=fetch(JYlivefile);
                                    let JYlives = JYlive.split('\n');
                                    for(let i=0;i<JYlives.length;i++){
                                        try{
                                            if(JYlives[i].indexOf('#genre#')>-1&&JYlives[i].indexOf(groupname)>-1){
                                                JYlives[i] = JYlives[i].replace(groupname,input);
                                            }
                                        }catch(e){}
                                    }
                                    writeFile(JYlivefile, JYlives.join('\n'));
                                    updateItem(groupname,{title:input});
                                    return "toast:// <"+groupname+"> 分组改名为 <"+input+">";
                                }else{
                                    return "toast://输入不能为空"
                                }
                            },groupname,JYlivefile)
                        }
                    },grouplist,groupname,guanlidata,lists,JYlivefile),
                    col_type: "scroll_button",
                    extra: {
                        id: groupname
                    }
                });
                if(index==0){
                    datalist2 = lists;
                    index = 1;
                }
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
    if(getMyVar('editmode')&&getMyVar('JYlivedyurl','juying')=="juying"){
        let editnames = ["分组删除|groupdelete","分组改名|grouprename","地址删除|urldelete","地址改名|urlrename","退出编辑|exitedit"];
        let editmenu = [];
        for(let i=0;i<editnames.length;i++){
            let name = editnames[i].split('|')[0];
            let code = editnames[i].split('|')[1];
            editmenu.push({
                title: getMyVar('editmode')==code?'‘‘’’<b><span style="color:#3399cc">'+name:name,
                url: getMyVar('JYlivedyurl','juying')=="juying"?$("#noLoading#").lazyRule((name,code,editnames) => {
                    if(code=="exitedit"){
                        clearMyVar('editmode');
                        deleteItemByCls('editmenu');
                        return "toast://退出编辑，正常观看";
                    }else{
                        putMyVar('editmode',code);
                    }
                    for(let i in editnames){
                        if(editnames[i].split('|')[1]==code){
                            updateItem(code,{title:'‘‘’’<b><span style="color:#3399cc">'+name})
                        }else{
                            updateItem(editnames[i].split('|')[1],{title:editnames[i].split('|')[0]})
                        }
                    }
                    return "toast://进入"+name+"模式";
                },name,code,editnames):"toast://当前为远程订阅源，无法进入编辑模式",
                col_type: 'scroll_button',
                extra: {
                    id: code,
                    cls: 'editmenu'
                }
            })
        }
        editmenu.push({
            col_type: 'line',
            extra: {
                cls: 'editmenu'
            }
        })
        for (let i = 0; i < 9; i++) {
            editmenu.push({
                col_type: "blank_block",
                extra: {
                    cls: 'editmenu'
                }
            })
        }
        addItemAfter('livesearch',editmenu);
    }
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
            img: 'https://lanmeiguojiang.com/tubiao/ke/156.png',
            col_type: 'icon_2_round',
            url: $('#noLoading#').lazyRule((name) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                return LivePlay(name);
            },datalist[i].name),
            extra: {
                id: datalist[i].name,
                cls: 'livelist'
            }
        });
    }
    return list;
}
function LivePlay(name) {
    let JYlivefile= "hiker://files/rules/Src/Juying/live.txt";
    let JYlive= getMyVar('JYlivedyurl','juying')=="juying"?fetch(JYlivefile):readFile('live'+md5(getMyVar('JYlivedyurl'))+'.txt');
    let JYlives = JYlive.split('\n');
    if(!/^url/.test(getMyVar('editmode','0'))||getMyVar('JYlivedyurl','juying')!="juying"){
        let urls = [];
        for(let i = 0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf(',')>-1&&JYlives[i].split(',')[0].trim()==name){
                    let url = JYlives[i].split(',')[1].trim();
                    if(/\\r^/.test(url)){
                        url = url.slice(0, url.length - 2);
                    }
                    urls.push(url + '#isVideo=true#');
                }
            }catch(e){}
        }
        return JSON.stringify({
            urls: urls
        });
    }else if(getMyVar('editmode','0')=="urldelete"){
        for(let i=0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf(name)>-1){
                    JYlives.splice(i,1);
                    i = i - 1;
                }
            }catch(e){}
        }
        writeFile(JYlivefile, JYlives.join('\n'));
        deleteItem(name);
        return "toast://已删除 <"+name+">";
    }else if(getMyVar('editmode','0')=="urlrename"){
        return $("","输入新的地址名").input((name,JYlivefile)=>{
            if(input){
                let JYlive=fetch(JYlivefile);
                let JYlives = JYlive.split('\n');
                for(let i=0;i<JYlives.length;i++){
                    try{
                        if(JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf(name)>-1){
                            JYlives[i] = JYlives[i].replace(name,input);
                        }
                    }catch(e){}
                }
                writeFile(JYlivefile, JYlives.join('\n'));
                updateItem(name, {
                    title: input
                });
                return "toast:// <"+name+"> 改名为 <"+input+">";
            }else{
                return "toast://输入不能为空"
            }
        },name,JYlivefile)
    }
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
        title: '👦哥就是帅，不接受反驳...',
        col_type: "rich_text"
    });
    d.push({
        col_type: "line"
    });
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
                        if(!livedata.some(item => item.url==input)){
                            let YChtml = request(input,{timeout:2000});
                            if(YChtml.indexOf('#genre#')>-1){
                                return $("","起个名字").input((livedata,url,livecfgfile,liveconfig)=>{
                                    if(input){
                                        livedata.push({name:input,url:url});
                                        liveconfig['data'] = livedata;
                                        writeFile(livecfgfile, JSON.stringify(liveconfig));
                                        refreshPage(false);
                                        return "toast://增加自定义tv链接地址成功";
                                    }else{
                                        return "toast://输入不能为空"
                                    }
                                },livedata,input,livecfgfile,liveconfig)
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
                        title: livedata[i].name,
                        desc: livedata[i].url,
                        url: $(["更新缓存","删除订阅","导入聚直播","导入聚影√","复制链接"],2,"").select((livecfgfile, url)=>{
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
                                        for(let i=0;i<livedata.length;i++){
                                            if(livedata[i].url==url){
                                                livedata.splice(i,1);
                                                break;
                                            }
                                        }
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
                                        let importnum = 0;
                                        let JYlivefile = "hiker://files/rules/Src/Juying/live.txt";
                                        let JYlive=fetch(JYlivefile);
                                        if(JYlive){
                                            var JYlives = JYlive.split('\n');
                                            let id = 0;
                                            let py = 0;
                                            for(let i=0;i<YClives.length;i++){
                                                if(JYlives.length>10000){
                                                    log('直播数据源文件已大于10000行，为保证效率停止导入');
                                                    break;
                                                }else{
                                                    if(YClives[i].indexOf('#genre#')>-1&&JYlives.indexOf(YClives[i])>-1){
                                                        id = JYlives.indexOf(YClives[i]);
                                                        py = 0;
                                                    }else if(YClives[i].indexOf('#genre#')>-1&&JYlives.indexOf(YClives[i])==-1){
                                                        id = JYlives.length+1;
                                                        py = 0;
                                                        JYlives.splice(id+1, 0, YClives[i]);
                                                    }else if(YClives[i].indexOf(',')>-1&&JYlives.indexOf(YClives[i])==-1&&YClives[i].trim()!=""){
                                                        JYlives.splice(id+1+py, 0, YClives[i]);
                                                        py++;
                                                        importnum++;
                                                    }
                                                }
                                            }
                                        }else{
                                            var JYlives = YClives;
                                            importnum = JYlives.length;
                                        }
                                        writeFile(JYlivefile, JYlives.join('\n'));
                                        hideLoading();
                                        if(importnum>0){
                                            putMyVar('isEdit','1');
                                        }
                                        return "toast://成功导入"+importnum;
                                    }else{
                                        return "toast://文件异常，导入失败";
                                    }
                                }else if(input=="复制链接"){
                                    copy(url);
                                }
                                return "hiker://empty";
                            }catch(e){
                                hideLoading();
                                log(e.message);
                                return "toast://操作异常，详情查看日志";
                            }
                        }, livecfgfile, livedata[i].url),
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
        col_type: "line"
    });
    d.push({
        title: '🛠 编辑本地源',
        col_type: 'text_2',
        url: getMyVar('JYlivedyurl','juying')=="juying"?$('#noLoading#').lazyRule(() => {
            putMyVar('editmode','1');
            back(true);
            return "toast://进入编辑模式，选择操作菜单";
        }):"toast://当前为远程订阅源，无法进入编辑模式"
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
        title: '🔎清理失效的直播源地址',
        desc: '此功能为实验性的，可能存在误删，谨慎操作！\n通过判断地址是否可以访问来甄别有效性\n聚影本地直播源地址有：'+getMyVar('JYlivenum','0'),
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
                
                let JYlives = JYlive.split('\n');
                for(let i = 0; i < JYlives.length; i++){
                    try{
                        if(JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf('#genre#')==-1){
                            urls.push(JYlives[i]);
                        }
                    }catch(e){}
                }
                showLoading('检测'+urls.length+'条，保持屏幕亮屏');
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