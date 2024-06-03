//修改自道长drpy2.js文件中的一些方法，修改后用于drpy接口解析
/*
let detailObj = {
        orId: orId,
        url:url,
        二级:rule.二级,
        二级访问前:rule.二级访问前,
        detailUrl:detailUrl,
        fyclass:fyclass,
        tab_exclude:rule.tab_exclude,
    }
detailParse(detailObj)


return {
        "details1": details1,
        "details2": details2,
        "pic": pic,
        "desc": desc,
        "tabs": tabs,
        "lists": lists,
        "linecodes": linecodes,
        "parse_api": parse_api
    };
*/

/**
 * 二级详情页数据解析
 * @param detailObj
 * @returns {string}
 */
function detailParse(detailObj){
    let t1 = (new Date()).getTime();
    //fetch_params = JSON.parse(JSON.stringify(rule_fetch_params));
    let orId = detailObj.orId;
    let vod_name = '片名';
    let vod_pic = '';
    let vod_id = orId;
    if(rule.二级==='*'){
        let extra = orId.split('@@');
        vod_name = extra.length>1?extra[1]:vod_name;
        vod_pic = extra.length>2?extra[2]:vod_pic;
    }

    let vod = {
        vod_id: vod_id, 
        vod_name: vod_name,
        vod_pic: vod_pic,
        type_name: "类型",
        vod_year: "年份",
        vod_area: "地区",
        vod_remarks: "更新信息",
        vod_actor: "主演",
        vod_director: "导演",
        vod_content: "简介"
    };
    let p = detailObj.二级;
    let url = detailObj.url;
    let detailUrl = detailObj.detailUrl;
    let fyclass = detailObj.fyclass;
    let tab_exclude = detailObj.tab_exclude;
    let html = detailObj.html||'';
    MY_URL = url;
    if(detailObj.二级访问前){
        try {
            print(`尝试在二级访问前执行代码:${detailObj.二级访问前}`);
            eval(detailObj.二级访问前.trim().replace('js:',''));
        }catch (e) {
            print(`二级访问前执行代码出现错误:${e.message}`)
        }
    }

    if(p==='*'){
        vod.vod_play_from = '道长在线';
        vod.vod_remarks = detailUrl;
        vod.vod_actor = '没有二级,只有一级链接直接嗅探播放';
        vod.vod_content = MY_URL;
        vod.vod_play_url = '嗅探播放$' + MY_URL.split('@@')[0];
    }else if(typeof(p)==='string'&&p.trim().startsWith('js:')){
        const TYPE = 'detail';
        var input = MY_URL;
        var play_url = '';
        eval(p.trim().replace('js:',''));
        vod = VOD;
        console.log(JSON.stringify(vod));
    }else if(p&&typeof(p)==='object'){
        let tt1 = (new Date()).getTime();
        if(!html){
            html = getHtml(MY_URL);
        }
        print(`二级${MY_URL}仅获取源码耗时:${(new Date()).getTime()-tt1}毫秒`);
        let _ps;
        if(p.is_json){
            print('二级是json');
            _ps = parseTags.json;
            html = dealJson(html);
        }else if(p.is_jsp){
            print('二级是jsp');
            _ps = parseTags.jsp;
        }else if(p.is_jq){
            print('二级是jq');
            _ps = parseTags.jq;
        }else{
            print('二级默认jq');
            _ps = parseTags.jq;
            // print('二级默认jsp');
            // _ps = parseTags.jsp;
        }
        let tt2 = (new Date()).getTime();
        print(`二级${MY_URL}获取并装载源码耗时:${tt2-tt1}毫秒`);
        _pdfa = _ps.pdfa;
        _pdfh = _ps.pdfh;
        _pd = _ps.pd;
        if(p.title){
            let p1 = p.title.split(';');
            vod.vod_name = _pdfh(html, p1[0]).replace(/\n|\t/g,'').trim();
            let type_name = p1.length > 1 ? _pdfh(html, p1[1]).replace(/\n|\t/g,'').replace(/ /g,'').trim():'';
            vod.type_name = type_name||vod.type_name;
        }
        if(p.desc){
            try{
                let p1 = p.desc.split(';');
                vod.vod_remarks =  _pdfh(html, p1[0]).replace(/\n|\t/g,'').trim();
                vod.vod_year = p1.length > 1 ? _pdfh(html, p1[1]).replace(/\n|\t/g,'').trim():'';
                vod.vod_area = p1.length > 2 ? _pdfh(html, p1[2]).replace(/\n|\t/g,'').trim():'';
                vod.vod_actor = p1.length > 3 ? _pdfh(html, p1[3]).replace(/\n|\t/g,'').trim():'';
                vod.vod_director = p1.length > 4 ? _pdfh(html, p1[4]).replace(/\n|\t/g,'').trim():'';
            }
            catch (e) {

            }
        }
        if(p.content){
            try{
                let p1 = p.content.split(';');
                vod.vod_content =  _pdfh(html, p1[0]).replace(/\n|\t/g,'').trim();
            }
            catch (e) {}
        }
        if(p.img){
            try{
                let p1 = p.img.split(';');
                vod.vod_pic =  _pd(html, p1[0],MY_URL);
            }
            catch (e) {}
        }

        let vod_play_from = '$$$';
        let playFrom = [];
        if(p.重定向&&p.重定向.startsWith('js:')){
            print('开始执行重定向代码:'+p.重定向);
            html = eval(p.重定向.replace('js:',''));
        }

        if(p.tabs){
            if(p.tabs.startsWith('js:')){
                print('开始执行tabs代码:'+p.tabs);
                var input = MY_URL;
                eval(p.tabs.replace('js:',''));
                playFrom = TABS;
            }else{
                let p_tab = p.tabs.split(';')[0];
                // console.log(p_tab);
                let vHeader = _pdfa(html, p_tab);
                console.log(vHeader.length);
                let tab_text = p.tab_text||'body&&Text';
                // print('tab_text:'+tab_text);
                let new_map = {};
                for(let v of vHeader){
                    let v_title = _pdfh(v,tab_text).trim();
                    if(!v_title){
                        v_title = '线路空'
                    }
                    console.log(v_title);
                    if(tab_exclude&& (new RegExp(tab_exclude)).test(v_title)){
                        continue;
                    }
                    if(!new_map.hasOwnProperty(v_title)){
                        new_map[v_title] = 1;
                    }else{
                        new_map[v_title] += 1;
                    }
                    if(new_map[v_title]>1){
                        v_title+=Number(new_map[v_title]-1);
                    }
                    playFrom.push(v_title);
                }
            }
            console.log(JSON.stringify(playFrom));
        }else{
            playFrom = ['道长在线']
        }
        vod.vod_play_from = playFrom.join(vod_play_from);

// console.log(3);
        let vod_play_url = '$$$';
        let vod_tab_list = [];
        if(p.lists){
            if(p.lists.startsWith('js:')){
                print('开始执行lists代码:'+p.lists);
                try {
                    var input = MY_URL;
                    var play_url = '';
                    eval(p.lists.replace('js:',''));
                    for(let i in LISTS){
                        if(LISTS.hasOwnProperty(i)){
                            // print(i);
                            try {
                                LISTS[i] = LISTS[i].map(it=>it.split('$').slice(0,2).join('$'));
                            }catch (e) {
                                print('格式化LISTS发生错误:'+e.message);
                            }
                        }
                    }
                    vod_play_url = LISTS.map(it=>it.join('#')).join(vod_play_url);
                }catch (e) {
                    print('js执行lists: 发生错误:'+e.message);
                }

            }else{
                let list_text = p.list_text||'body&&Text';
                let list_url = p.list_url||'a&&href';
                let list_url_prefix = p.list_url_prefix||'';
                // print('list_text:'+list_text);
                // print('list_url:'+list_url);
                // print('list_parse:'+p.lists);
                let is_tab_js = p.tabs.trim().startsWith('js:');
                for(let i=0;i<playFrom.length;i++){
                    let tab_name = playFrom[i];
                    let tab_ext =  p.tabs.split(';').length > 1 && !is_tab_js ? p.tabs.split(';')[1] : '';
                    let p1 = p.lists.replaceAll('#idv', tab_name).replaceAll('#id', i);
                    tab_ext = tab_ext.replaceAll('#idv', tab_name).replaceAll('#id', i);
                    let tabName = tab_ext?_pdfh(html, tab_ext):tab_name;
                    console.log(tabName);
                    // print('tab_ext:'+tab_ext);
                    let new_vod_list = [];
                    let tt1 = (new Date()).getTime();
                    // print('pdfl:'+typeof (pdfl));
                    if(typeof (pdfl) ==='function'){
                        new_vod_list = pdfl(html, p1, list_text, list_url, MY_URL);
                        if(list_url_prefix){
                            new_vod_list = new_vod_list.map(it=>it.split('$')[0]+'$'+list_url_prefix+it.split('$').slice(1).join('$'));
                        }
                    }else {
                        let vodList = [];
                        try {
                            vodList =  _pdfa(html, p1);
                            console.log('len(vodList):'+vodList.length);
                        }catch (e) {
                            // console.log(e.message);
                        }
                        for (let i = 0; i < vodList.length; i++) {
                            let it = vodList[i];
                            new_vod_list.push(_pdfh(it, list_text).trim() + '$' + list_url_prefix + _pd(it, list_url, MY_URL));
                        }
                    }
                    if(new_vod_list.length>0){
                        new_vod_list = forceOrder(new_vod_list,'',x=>x.split('$')[0]);
                        console.log(`drpy影响性能代码共计列表数循环次数:${new_vod_list.length},耗时:${(new Date()).getTime()-tt1}毫秒`);
                    }
                    // print(new_vod_list);
                    let vlist = new_vod_list.join('#');
                    vod_tab_list.push(vlist);
                }
                vod_play_url = vod_tab_list.join(vod_play_url);
            }
        }
        vod.vod_play_url = vod_play_url;
    }
    if(rule.图片替换 && rule.图片替换.includes('=>')){
        let replace_from = rule.图片替换.split('=>')[0];
        let replace_to = rule.图片替换.split('=>')[1];
        vod.vod_pic = vod.vod_pic.replace(replace_from,replace_to);
    }
    if(rule.图片来源 && vod.vod_pic && vod.vod_pic.startsWith('http')){
        vod.vod_pic = vod.vod_pic + rule.图片来源;
    }
    if(!vod.vod_id||(vod_id.includes('$')&&vod.vod_id!==vod_id)){
        vod.vod_id = vod_id;
    }
    let t2 = (new Date()).getTime();
    console.log(`加载二级界面${MY_URL}耗时:${t2-t1}毫秒`);
    // print(vod);
    try {
     vod = vodDeal(vod);
    }catch (e) {
     console.log(`vodDeal发生错误:${e.message}`);
    }
    // print(vod);
    return JSON.stringify({
        list: [vod]
    })
}
