//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
function Live() {
    addListener("onClose", $.toString(() => {
        clearMyVar('editmode');
        clearMyVar('JYlivenum');
        clearMyVar('JYlivedyurl');
        clearMyVar('selectgroup');
        clearMyVar('JYlivelocal');
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
    livedata = livedata.filter(item => {
        return item.show!=0;
    })

    let JYlivefile = "hiker://files/rules/Src/Juying/live.txt";
    let JYlive = "";
    let JYlivedyurl = getMyVar('JYlivedyurl','juying');
    if(getMyVar('JYlivelocal','0')=="1"){
        JYlive=fetch(JYlivefile);
    }else{
        if(JYlivedyurl=="juying"){
            JYlive=fetch(JYlivefile);
            if(JYlive==""&&livedata.length>0){
                JYlivedyurl = livedata[0].url?livedata[0].url:JYlivedyurl;
                putMyVar('JYlivedyurl',JYlivedyurl);
            }
        }
        if(JYlivedyurl!="juying"){
            try{
                showLoading('发现订阅源，正在初始化');
                let YChtml = fetchCache(JYlivedyurl,48,{timeout:3000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
                if(YChtml.indexOf('#genre#')>-1){
                    JYlive = YChtml;
                }
                hideLoading();
            }catch(e){
                hideLoading();
                log(e.message);
            }
        }
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
            title: JYlivedyurl=="juying"?'本地✌':'本地',
            url: $("#noLoading#").lazyRule(() => {
                putMyVar('JYlivedyurl','juying');
                putMyVar('JYlivelocal','1');
                refreshPage(false);
                return "toast://聚影直播本地源数据";
            }),
            col_type: 'scroll_button'
        })
        for(let i=0;i<livedata.length;i++){
            let dyname = livedata[i].name;
            let dyurl = livedata[i].url;
            deleteFile('live'+md5(dyurl)+'.txt');//自动删除之前私有文件
            //if(livedata[i].show!=0){
                d.push({
                    title: JYlivedyurl==dyurl?dyname+'✌':dyname,
                    url: $("#noLoading#").lazyRule((dyname,dyurl) => {
                        putMyVar('JYlivedyurl',dyurl);
                        clearMyVar('JYlivelocal');
                        clearMyVar('editmode');
                        refreshPage(false);
                        return "toast://已切换远程订阅："+dyname;
                    },dyname,dyurl),
                    col_type: 'scroll_button'
                })
            //}
        }
        d.push({
            col_type: 'line'
        })
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
        if(JYlivedyurl=="juying"){putMyVar('JYlivenum',datalist.length);}
        datalist = datalist.reduce((newArr, next) => {
            obj[next.name] ? "" : (obj[next.name] = true && newArr.push(next));
            return newArr;
        }, []);
        d.push({
            title: "🔍",
            url: $.toString((guanlidata,datalist) => {
                    if(datalist.length>0){
                        deleteItemByCls('livelist');
                        let lists = datalist.filter(item => {
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
                let longClick = getMyVar('editmode','0')=="1"?[{
                    title: "删除此分组",
                    js: $.toString((groupname,lists) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                        return GroupEdit(groupname,'del',lists);
                    },groupname,lists)
                },{
                    title: "重命名分组",
                    js: $.toString((groupname) => {
                        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                        return GroupEdit(groupname,'rename');
                    },groupname)
                }]:[];
                if(getItem('enabledpush','')=='1'){
                    longClick.push({
                        title: "推送至TVBOX",
                        js: $.toString((groupname,lists) => {
                            require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                            return GroupEdit(groupname,'pushBox',lists);
                        },groupname,lists)
                    })
                }
                d.push({
                    title: index==0?'‘‘’’<b><span style="color:#3399cc">'+groupname:groupname,
                    url: $('#noLoading#').lazyRule((grouplist,groupname,guanlidata,lists) => {
                        if(getMyVar('selectgroup')!=groupname){
                            putMyVar('selectgroup',groupname);
                            for(let i in grouplist){
                                if(grouplist[i]==groupname){
                                    updateItem(groupname,{title:'‘‘’’<b><span style="color:#3399cc">'+groupname})
                                }else{
                                    updateItem(grouplist[i],{title:grouplist[i]})
                                }
                            }
                            deleteItemByCls('livelist');
                            let gldatalist = guanlidata(lists);
                            addItemAfter('liveloading', gldatalist);
                        }
                        return "hiker://empty";
                    },grouplist,groupname,guanlidata,lists),
                    col_type: "scroll_button",
                    extra: {
                        id: groupname,
                        longClick: longClick
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
            title: '没有直播数据源',
            col_type: 'rich_text'
        });
    }
    setHomeResult(d);
}

function GroupEdit(groupname,mode,lists) {
    let JYlivefile= "hiker://files/rules/Src/Juying/live.txt";
    if(mode=='del'){
        try{
            showLoading('删除中，请稍候...');
            let JYlive=fetch(JYlivefile);
            let JYlives = JYlive.split('\n');
            for(let i=0;i<JYlives.length;i++){
                if(JYlives[i].indexOf('#genre#')>-1&&JYlives[i].indexOf(groupname)>-1){
                    JYlives.splice(i,1);
                    i = i - 1;
                }else if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&lists.some(item => item.name==JYlives[i].split(',')[0].trim())){
                    JYlives.splice(i,1);
                    i = i - 1;
                }
            }
            writeFile(JYlivefile, JYlives.join('\n'));
            deleteItem(groupname);
            let playlist = lists.map((list)=>{
                return list.name;
            });
            deleteItem(playlist);
            hideLoading();
            return "toast://已删除分组 <"+groupname+"> 所有地址";
        }catch(e){
            hideLoading();
            log(e.message);
            return "toast://删除分组失败，详情查看日志";
        }
    }else if(mode=='rename'){
        return $("","输入新的分组名").input((JYlivefile,groupname)=>{
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
        },JYlivefile,groupname)
    }else if(mode=='pushBox'){
        let push = {
            "name": groupname,
            "pic": 'https://lanmeiguojiang.com/tubiao/ke/156.png',
            "content": '聚影直播推送',
            "director": "分组推送",
            "actor": "列表可能有点凌乱"
        };
        let urls = [];
        let JYlive= fetch(JYlivefile);
        let JYlives = JYlive.split('\n');
        for(let i=0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&lists.some(item => item.name==JYlives[i].split(',')[0].trim())){
                    urls.push(JYlives[i].split(',')[0].trim()+'$'+JYlives[i].split(',')[1].split('#')[0]);
                }
            }catch(e){

            }
        }
        let tvip = getItem('hikertvboxset', '');
        if(urls.length>0){
            push['from'] = groupname;
            push['url'] = urls.join('#').replace(/\&/g, '＆＆');
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

            if (state == 'ok') {
                return 'toast://推送成功，如果不能播放则TVBOX版本不支持，分组推送完成。';
            } else {
                return 'toast://推送失败';
            }
        }else{
            return 'toast://播放地址为空';
        }
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
        let name = datalist[i].name;
        let longClick = getMyVar('editmode','0')=="1"?[{
            title: "删除此频道",
            js: $.toString((name) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                return LiveEdit(name,'del');
            },name)
        },{
            title: "重命名频道",
            js: $.toString((name) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                return LiveEdit(name,'rename');
            },name)
        }]:[];
        if(getItem('enabledpush','')=='1'){
            longClick.push({
                title: "推送至TVBOX",
                js: $.toString((name) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                    return LiveEdit(name,'pushBox');
                },name)
            })
        }
        list.push({
            title: name,
            img: 'https://lanmeiguojiang.com/tubiao/ke/156.png',
            col_type: 'icon_2_round',
            url: $('#noLoading#').lazyRule((name) => {
                require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcLive.js');
                return LivePlay(name);
            },name),
            extra: {
                id: name,
                cls: 'livelist',
                longClick: longClick
            }
        });
    }
    return list;
}
function LivePlay(name) {
    let JYlivefile= "hiker://files/rules/Src/Juying/live.txt";
    let JYlive= getMyVar('JYlivedyurl','juying')=="juying"?fetch(JYlivefile):fetchCache(getMyVar('JYlivedyurl'),24,{timeout:3000});
    let JYlives = JYlive.split('\n');
    let urls = [];
    for(let i = 0;i<JYlives.length;i++){
        try{
            if(JYlives[i].indexOf(',')>-1&&JYlives[i].indexOf('#genre#')==-1&&JYlives[i].split(',')[0].replace(/TV-/g,'TV').replace(/\[.*\]/g,'').trim()==name){
                let url = JYlives[i].split(',')[1].trim();
                let urll = url.split('#');
                urll.forEach(item => {
                    if(/\\r^/.test(item)){
                        item = item.slice(0, item.length - 2);
                    }
                    if(item){
                        urls.push(item + '#isVideo=true#');
                    }
                })
            }
        }catch(e){}
    }
    if(urls.length==0){
        return "toast://无播放地址";
    }else if(urls.length==1){
        return urls[0];
    }else{
        return JSON.stringify({
            urls: urls
        });
    }
} 
function LiveEdit(name,mode) {
    let JYlivefile= "hiker://files/rules/Src/Juying/live.txt";
    if(mode=='del'){
        let JYlive= fetch(JYlivefile);
        let JYlives = JYlive.split('\n');
        for(let i=0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&JYlives[i].split(',')[0].replace(/TV-/g,'TV').replace(/\[.*\]/g,'').trim()==name){
                    JYlives.splice(i,1);
                    i = i - 1;
                }
            }catch(e){}
        }
        writeFile(JYlivefile, JYlives.join('\n'));
        deleteItem(name);
        return "toast://已删除 <"+name+">";
    }else if(mode=='rename'){
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
    }else if(mode=='pushBox'){
        let push = {
            "name": name,
            "pic": 'https://lanmeiguojiang.com/tubiao/ke/156.png',
            "content": '聚影直播推送',
            "director": "频道推送",
            "actor": "单个频道所有线路"
        };
        let urls = [];
        let JYlive= fetch(JYlivefile);
        let JYlives = JYlive.split('\n');
        for(let i=0;i<JYlives.length;i++){
            try{
                if(JYlives[i].indexOf('#genre#')==-1&&JYlives[i].indexOf(',')>-1&&JYlives[i].split(',')[0].replace(/TV-/g,'TV').replace(/\[.*\]/g,'').trim()==name){
                    urls.push(JYlives[i].split(',')[1]);
                }
            }catch(e){}
        }
        let tvip = getItem('hikertvboxset', '');
        if(urls.length>0){
            push['from'] = name;
            push['url'] = {urls:urls};//urls.join('#').replace(/\&/g, '＆＆');
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

            if (state == 'ok') {
                return 'toast://推送成功，如果不能播放则TVBOX版本不支持，单频道推送完成。';
            } else {
                return 'toast://推送失败';
            }
        }else{
            return 'toast://播放地址为空';
        }
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
                        if(/\/storage\/emulated\//.test(input)){input = "file://" + input}
                        let livedata = liveconfig['data']||[];
                        if(!livedata.some(item => item.url==input)){
                            showLoading('正在验证链接有效性...');
                            let YChtml = request(input,{timeout:3000});
                            if(YChtml.indexOf('#genre#')>-1){
                                hideLoading();
                                return $("","链接有效，起个名字保存").input((livedata,url,livecfgfile,liveconfig)=>{
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
                                hideLoading();
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
                function getide(is) {
                    if(is==1){
                        return '‘‘’’<strong><font color="#f13b66a">◉ </front></strong>';
                    }else{
                        return '‘‘’’<strong><font color="#F54343">◉ </front></strong>';
                    }
                }
                for(let i=0;i<livedata.length;i++){
                    d.push({
                        title: (livedata[i].show!=0?getide(1):getide(0))+livedata[i].name,
                        desc: livedata[i].url,
                        url: $(["复制链接","导入聚影√","更新缓存","导入聚直播","删除订阅",livedata[i].show!=0?"停用订阅":"启用订阅"],2,"").select((livecfgfile, url)=>{
                            try{
                                if(input=="更新缓存"){
                                    showLoading('正在缓存，请稍后.');
                                    let YChtml = request(url,{timeout:3000});
                                    if(YChtml.indexOf('#genre#')>-1){
                                        deleteCache(url);
                                        let YChtml = fetchCache(url,24,{timeout:3000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
                                        hideLoading();
                                        return "toast://更新文件缓存成功";
                                    }else{
                                        hideLoading();
                                        return "toast://更新失败";
                                    }
                                }else if(input=="删除订阅"){
                                    if(/^http/.test(url)){
                                        deleteCache(url);
                                    }
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
                                    let YChtml = fetchCache(url,24,{timeout:3000}).replace(/TV-/g,'TV').replace(/\[.*\]/g,'');
                                    if(YChtml.indexOf('#genre#')>-1){
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
                                        if(importnum>0&&getMyVar('JYlivedyurl','juying')=="juying"){
                                            putMyVar('isEdit','1');
                                        }
                                        return "toast://成功导入"+importnum;
                                    }else{
                                        return "toast://文件异常，导入失败";
                                    }
                                }else if(input=="复制链接"){
                                    copy(url);
                                }else if(input=="停用订阅"||input=="启用订阅"){
                                    let livecfg = fetch(livecfgfile);
                                    if(livecfg != ""){
                                        eval("var liveconfig = " + livecfg);
                                        let livedata = liveconfig['data']||[];
                                        for(let i=0;i<livedata.length;i++){
                                            if(livedata[i].url==url){
                                                livedata[i].show = input=="停用订阅"?0:1;
                                                break;
                                            }
                                        }
                                        liveconfig['data'] = livedata;
                                        writeFile(livecfgfile, JSON.stringify(liveconfig));
                                        refreshPage(false);
                                    }
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
            if(getMyVar('JYlivenum','0')=="0"){
                return "toast://本地数据源为空，无法进入编辑模式";
            }
            putMyVar('editmode','1');
            putMyVar('isEdit','1');
            return "toast://进入编辑模式，长按分组或频道选择操作";
        }):"toast://当前为远程订阅源，无法进入编辑模式"
    });
    d.push({
        title: '♻ 清空直播源',
        col_type: 'text_2',
        url: $("确定清空聚影直播本地文件？").confirm(()=>{
            writeFile("hiker://files/rules/Src/Juying/live.txt", "");
            if(getMyVar('JYlivedyurl','juying')=="juying"){
                putMyVar('isEdit','1');
            }
            clearMyVar('JYlivenum');
            refreshPage(false);
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
                if(fails.length>0&&getMyVar('JYlivedyurl','juying')=="juying"){
                    putMyVar('isEdit','1');
                }
                return "toast://删除疑似失效源"+fails.length+"条";
            }else{
                return "toast://没有直播数据源";
            }
        })
    });
    setHomeResult(d);
}