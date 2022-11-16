//直接白嫖道长dr模板
let erjitmplfile = 'hiker://files/rules/dzHouse/json/二级模板.json';
if(!fileExist(erjitmplfile)){
    requireDownload('http://hiker.nokia.press/hikerule/rulelist.json?id=4552', erjitmplfile);
}

function 获取源码(url){
    let html =request(url);
    return html;
}

function autoerji(url){
    //log(url);
    let data = {};
    if(!/http/.test(url)){return data;}
    try{
        var tmpllist = JSON.parse(fetch(erjitmplfile));
    }catch(e){
        var tmpllist = [];
    }
    let html = 获取源码(url);
    let urldomian = url.match(/http(s)?:\/\/(.*?)\//)[0];
    let urltmpl = JSON.parse(getMyVar('Tmpl-'+urldomian,'{}'));
    let tmplidex = tmpllist.findIndex(it=>it.名称===urltmpl.名称);
    if(tmplidex>-1) {
        let tmpl = tmpllist.splice(tmplidex, 1);
        tmpllist.unshift(tmpl[0]);
    }
    for(let i in tmpllist){
        log('【'+tmpllist[i].名称+'】');
        let t = tmpllist[i].解析;
        try {
            let tabs = pdfa(html,t.tabs);
            log(tabs)
            var arts = [];
            tabs.forEach(item => {
                let name = pdfh(item, t.tab_text?t.tab_text:'h3||a||span&&Text');
                if(name&&!/更多精品/.test(name)){
                    arts.push(name);
                }
            });
            log(arts)
            let lists = pdfa(html,'body&&'+t.lists.split(',')[0]);//全线路影片列表
            log(lists)
            var conts = [];
            for (let i = 0; i < lists.length; i++) {
                let key = lists[i].indexOf('#id')==-1?t.lists.split(',')[1].replace('#id','body'):t.lists.split(',')[1];
                let list = pdfa(lists[i],key);//单线路影片列表
                let cont = [];
                for (let j = 0; j < list.length; j++) {
                    let contname = pdfh(list[j],"a&&Text");
                    let conturl = pd(list[j],t.tab_id?t.tab_id:'a&&href');
                    cont.push(contname+"$"+conturl)
                }
                conts.push(cont.join("#"))
            }
            log(conts)
            if(arts.length>0&&conts.length>0&&conts[0]){
                let details1 = pdfh(html, t.desc.split(';')[0]);
                let details2 = t.desc.indexOf(';')>-1?pdfh(html, t.desc.split(';')[1]):"";
                let pic = pdfh(html,t.img).replace(/http.*\/tu\.php\?tu=|\/img\.php\?url=| |\/tu\.php\?tu=/g,'');
                let desc = pdfh(html,t.content);
                data = {details1:details1,details2:details2,pic:pic,desc:desc,arts:arts,conts:conts};
                putMyVar('Tmpl-'+urldomian,JSON.stringify(tmpllist[i])); 
                break;
            }
        }catch (e) {
            log('二级模板【'+tmpllist[i].名称+'】匹配失败：'+e.message);
        }
    }
    //log(data);
    return data;
}