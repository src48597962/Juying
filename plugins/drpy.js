//修改自道长drpy2.js文件中的一些方法，修改后用于drpy接口解析
/*
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

// 获取drpy的rule对象
function getRule(data){
    eval(fetchCache(drpymuban,9999).replace('export default {muban, getMubans};',''));
    eval(fetch(data.url));
    return rule;
}
// 二级详情页数据解析
function detailParse(Obj){
    let rule = getRule(Obj.data);
    let MY_URL = Obj.url;
    let detailObj = rule;
    let VOD;

    let t1 = (new Date()).getTime();
    
    let headers = rule["headers"] || {};
    if(headers['User-Agent']){
        headers['User-Agent'] = headers['User-Agent']=='PC_UA'?PC_UA:MOBILE_UA;
    }

    let fetch_params = {headers:headers, timeout:10000};

    let vod = {
        vod_id: '', 
        vod_name: '',
        vod_pic: '',
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
        let html = request(MY_URL, fetch_params);
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



const parseTags = {
    jsp:{
        pdfh:pdfh2,
        pdfa:pdfa2,
        pd:pd2,
    },
    json:{
        pdfh(html, parse) {
            if (!parse || !parse.trim()){
                return '';
            }
            if (typeof(html) === 'string'){
                // print('jsonpath:pdfh字符串转dict');
                html = JSON.parse(html);
            }
            parse = parse.trim();
            if (!parse.startsWith('$.')){
                parse = '$.' + parse;
            }
            parse = parse.split('||');
            for (let ps of parse) {
                let ret = cheerio.jp(ps, html);
                if (Array.isArray(ret)){
                    ret = ret[0] || '';
                } else{
                    ret = ret || ''
                }
                if (ret && typeof (ret) !== 'string'){
                    ret = ret.toString();
                }
                if(ret){
                    return ret
                }
            }
            return '';
        },
        pdfa(html, parse) {
            if (!parse || !parse.trim()){
                return '';
            }
            if (typeof(html) === 'string'){
                // print('jsonpath:pdfa字符串转dict');
                html = JSON.parse(html);
            }
            parse = parse.trim()
            if (!parse.startsWith('$.')){
                parse = '$.' + parse;
            }
            let ret = cheerio.jp(parse, html);
            if (Array.isArray(ret) && Array.isArray(ret[0]) && ret.length === 1){
                return ret[0] || []
            }
            return ret || []
        },
        pd(html,parse){
            let ret = parseTags.json.pdfh(html,parse);
            if(ret){
                return urljoin(MY_URL,ret);
            }
            return ret
        },
    },
    jq:{
        pdfh(html, parse) {
            if (!html||!parse || !parse.trim()) {
                return ''
            }
            parse = parse.trim();
            let result = defaultParser.pdfh(html,parse);
            // print(`pdfh解析${parse}=>${result}`);
            return result;
        },
        pdfa(html, parse) {
            if (!html||!parse || !parse.trim()) {
                return [];
            }
            parse = parse.trim();
            let result = defaultParser.pdfa(html,parse);
            // print(result);
            print(`pdfa解析${parse}=>${result.length}`);
            return result;
        },
        pd(html,parse,base_url){
            if (!html||!parse || !parse.trim()) {
                return ''
            }
            parse = parse.trim();
            base_url = base_url||MY_URL;
            return defaultParser.pd(html, parse, base_url);
        },
    },
    getParse(p0){//非js开头的情况自动获取解析标签
        if(p0.startsWith('jsp:')){
            return this.jsp
        }else if(p0.startsWith('json:')){
            return this.json
        }else if(p0.startsWith('jq:')){
            return this.jq
        }else {
            return this.jq
        }
    }
};
function encodeUrl(str){
    if(typeof(encodeURI) == 'function'){
        return encodeURI(str)
    }else{
        str = (str + '').toString();
        return encodeURIComponent(str).replace(/%2F/g, '/').replace(/%3F/g, '?').replace(/%3A/g, ':').replace(/%40/g, '@').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2C/g, ',').replace(/%2B/g, '+').replace(/%24/g, '$');
    }
}
function urlencode (str) {
    str = (str + '').toString();
    return encodeURIComponent(str).replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').
    replace(/\)/g, '%29').replace(/\*/g, '%2A').replace(/%20/g, '+');
}

/**
 *  url拼接
 * @param fromPath 初始当前页面url
 * @param nowPath 相对当前页面url
 * @returns {*}
 */
function urljoin(fromPath, nowPath) {
    fromPath = fromPath||'';
    nowPath = nowPath||'';
    return joinUrl(fromPath, nowPath);
    // try {
    //     // import Uri from './uri.min.js';
    //     // var Uri = require('./uri.min.js');
    //     // eval(request('https://cdn.bootcdn.net/ajax/libs/URI.js/1.19.11/URI.min.js'));
    //     // let new_uri = URI(nowPath, fromPath);

    //     let new_uri = Uri(nowPath, fromPath);
    //     new_uri = new_uri.toString();
    //     // console.log(new_uri);
    //     // return fromPath + nowPath
    //     return new_uri
    // }
    // catch (e) {
    //     console.log('urljoin发生错误:'+e.message);
    //     if(nowPath.startsWith('http')){
    //         return nowPath
    //     }if(nowPath.startsWith('/')){
    //         return getHome(fromPath)+nowPath
    //     }
    //     return fromPath+nowPath
    // }
}
var urljoin2 = urljoin;

// 内置 pdfh,pdfa,pd
const defaultParser = {
    pdfh:pdfh,
    pdfa:pdfa,
    pd:pd,
};
function pdfh2(html,parse){
    let html2 = html;
    try {
        if(typeof(html)!=='string'){
            html2 = html.rr(html.ele).toString();
        }
    }catch (e) {
        print('html对象转文本发生了错误:'+e.message);
    }
    let result = defaultParser.pdfh(html2,parse);
    let option = parse.includes('&&')?parse.split('&&').slice(-1)[0]:parse.split(' ').slice(-1)[0];
    if(/style/.test(option.toLowerCase())&&/url\(/.test(result)){
        try {
            result =  result.match(/url\((.*?)\)/)[1];
            // 2023/07/28新增 style取内部链接自动去除首尾单双引号
            result = result.replace(/^['|"](.*)['|"]$/, "$1");
        }catch (e) {}
    }
    return result
}

/**
 * pdfa原版优化,可以转换jq的html对象
 * @param html
 * @param parse
 * @returns {*}
 */
function pdfa2(html,parse){
    let html2 = html;
    try {
        if(typeof(html)!=='string'){
            html2 = html.rr(html.ele).toString();
        }
    }catch (e) {
        print('html对象转文本发生了错误:'+e.message);
    }
    return defaultParser.pdfa(html2,parse);
}

/**
 * pd原版方法重写-增加自动urljoin
 * @param html
 * @param parse
 * @param uri
 * @returns {*}
 */
function pd2(html,parse,uri){
    let ret = pdfh2(html,parse);
    if(typeof(uri)==='undefined'||!uri){
        uri = '';
    }
    if(DOM_CHECK_ATTR.test(parse) && !SPECIAL_URL.test(ret)){
        if(/http/.test(ret)){
            ret = ret.slice(ret.indexOf('http'));
        }else{
            ret = urljoin(MY_URL,ret)
        }
    }
    return ret
}

const print = log;
const stringify = JSON.stringify;
const jsp = parseTags.jsp;
const jq = parseTags.jq;
