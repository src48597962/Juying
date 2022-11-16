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
    let data = {};
    if(!/http/.test(url)){return data;}
    try{
        var tmpllist = JSON.parse(fetch(erjitmplfile));
    }catch(e){
        var tmpllist = [];
    }
    let html = 获取源码(url);
    let filter = '';
    let urldomian = url.match(/http(s)?:\/\/(.*?)\//)[0];
    let urltmpl = JSON.parse(getMyVar('Tmpl-'+urldomian,'{}'));
    let tmplidex = tmpllist.findIndex(it=>it.名称===urltmpl.名称);
    if(tmplidex>-1) {
        let tmpl = tmpllist.splice(tmplidex, 1);
        tmpllist.unshift(tmpl[0]);
    }
    for(let i in tmpllist){
        let t = tmpllist[i].解析;
        try {
            var details1 = pdfh(html,t.desc);
            var details2 = '';
            var pic = pdfh(html,t.img);
            var desc = pdfh(html,t.content);
            let tabs = pdfa(html,t.tabs);
            var arts = tabs.map(item=>{
                return pdfh(item, t.tabs_text).replace(//g,'').replace(/ /g,'').replace(/ /g,'').replace(eval(filter), '');
            });
            let lists = pdfa(html,t.lists);
            var conts = lists.map(item=>{
                return pdfh(item, 'a&&Text')+'$'+pdfh(item, t.tab_id?t.tab_id:'a&&href');
            });
            data = {details1:details1,details2:details2,pic:pic,desc:desc,arts:arts,conts:conts};
            putMyVar('Tmpl-'+urldomian,JSON.stringify(tmpllist[i])); 
            break;
        }catch (e) {

        }
    }
    return data;
}