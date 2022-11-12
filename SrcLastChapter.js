function JY360(){
    try{
        MY_URL = MY_URL.replace('#immersiveTheme##autoCache#','').split('##')[1];
        let html = request(MY_URL, { headers: { 'User-Agent': PC_UA } });
        let json = JSON.parse(html).data;
        let list = [];
        let sitename = json.playlink_sites[0];
        if(json.allepidetail){
            list = json.allepidetail[sitename];
            setResult('更新至：' + list[list.length-1].playlink_num);
        }else if(json.defaultepisode){
            list = json.defaultepisode;
            setResult('更新至：' + list[0].period);
        }else{
            setResult('');
        }
    }catch(e){
        log('获取最新失败>'+e.message);
        setResult('');
    }
}

function sougou() {
    try{
        var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': PC_UA }, timeout:3000 });
        var json = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).detail.itemData;
        var plays = json.play.item_list;
        var shows = json.play_from_open_index;
        var list = plays[0].info;
    }catch(e){
        log('获取最新失败>'+e.message);
        var list = [];
    }
    
    if(list&&list.length > 0){
        setResult('更新至：' + list[list.length-1].index);
    }else if (shows&&plays.length>0) {
        var arr = [];
        var zy = shows.item_list[0];
        for (var ii in zy.date) {
            date = zy.date[ii];
            day = zy.date[ii].day;
            for (j in day) {
                dayy = day[j][0] >= 10 ? day[j][0] : "0" + day[j][0];
                Tdate = date.year + date.month + dayy;
                arr.push(Tdate);
                if (getMyVar('shsort') == '1') {
                    arr.sort(function(a, b) {
                        return a - b
                    })
                } else {
                    arr.sort(function(a, b) {
                        return b - a
                    })
                }
            }
        }
        setResult('更新至：' + arr[arr.length-1]);
    }
}

function xunmi(type,ua,data) {
    if (/v1|app|v2|iptv|cms/.test(type)) {
        try{
            var gethtml = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua }, timeout:3000 });
            if(/cms/.test(type)&&/<\?xml/.test(gethtml)){
                var html = gethtml;
                var isxml = 1;
            }else{
                var html = JSON.parse(gethtml);
                var isxml = 0;
            }
        } catch (e) {
            var html = "";
        }
    } else if (/xpath|biubiu/.test(type)) {
        try{
            var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': ua }, timeout:3000 });
        } catch (e) {
            var html = "";
        }
    }
    try{
        if(/cms/.test(type)&&isxml==1){
            html = html.replace(/&lt;!\[CDATA\[|\]\]&gt;|<!\[CDATA\[|\]\]>/g,'');
            var conts = xpathArray(html,`//video/dl/dd/text()`);
        }else if (/v1|app|v2|cms/.test(type)) {
            if (/cms/.test(type)) {
                try{
                    var json = html.list[0];
                }catch(e){
                    var json = html.data.list[0];
                }
                if(json.vod_play_from&&json.vod_play_url){
                    var conts = json.vod_play_url.split('$$$');
                }else if(html.from&&html.play){
                    var conts = [];
                    for (let i = 0; i < html.play.length; i++) {
                        let cont = [];
                        let plays = html.play[i];
                        for (let j = 0; j < plays.length; j++) {
                            cont.push(plays[j][0]+"$"+plays[j][1])
                        }
                        conts.push(cont.join("#"))
                    }
                }else{
                    var conts = [];
                }
            }else{
                if($.type(html.data)=="array"){
                    var json = html.data[0];
                }else{
                    var json = html.data;
                }
                if(json&&json.vod_info){
                    json = json.vod_info;
                }
                var conts = json.vod_play_list || json.vod_url_with_player;
            }
        }else if (/iptv/.test(type)) {
            var conts = html.videolist;
        }else if (/xpath/.test(type)) {
            var jsondata = data;
            try{
                var arts = xpathArray(html, jsondata.dtFromNode+(jsondata.dtFromName.indexOf('concat(')>-1?'/text()':jsondata.dtFromName));
            }catch(e){
                var arts = [];
            }
            try{
                var conts = [];
                for (let i = 1; i < arts.length+1; i++) {
                    if(arts[i-1].indexOf("在线视频")>-1){arts[i-1] = '播放源'+i;}
                    let contname = xpathArray(html, jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+jsondata.dtUrlName);
                    let conturl = xpathArray(html, jsondata.dtUrlNode+'['+i+']'+jsondata.dtUrlSubNode+(jsondata.dtUrlId=="@href"?'/'+jsondata.dtUrlId:jsondata.dtUrlId));
                    let cont = [];
                    for (let j = 0; j < contname.length; j++) {
                        let urlid = jsondata.dtUrlIdR;
                        if(urlid){
                            let urlidl = urlid.split('(\\S+)')[0];
                            let urlidr = urlid.split('(\\S+)')[1];
                            var playUrl = conturl[j].replace(urlidl,'').replace(urlidr,'');
                        }else{
                            var playUrl = conturl[j];
                        }
                        cont.push(contname[j]+"$"+jsondata.playUrl.replace('{playUrl}',playUrl))
                    }
                    conts.push(cont.join("#"))
                }
            }catch(e){
                var conts = [];
            }
        }else if (/biubiu/.test(type)) {
            try{
                var jsondata = data;
                let bflist = html.split(jsondata.bfjiequshuzuqian.replace(/\\/g,""));
                bflist.splice(0,1);
                var conts = [];
                for (let i = 0; i < bflist.length; i++) {
                    bflist[i] = bflist[i].split(jsondata.bfjiequshuzuhou.replace(/\\/g,""))[0];
                    let bfline = pdfa(bflist[i],"body&&a");
                    let cont = [];
                    for (let j = 0; j < bfline.length; j++) {
                        let contname = pdfh(bfline[j],"a&&Text");
                        let conturl = pd(bfline[j],"a&&href");
                        cont.push(contname+"$"+conturl)
                    }
                    conts.push(cont.join("#"))
                }
            }catch(e){
                var conts = conts||[];
            }    
        }

        var lists = [];
        for (var i in conts) {
            if (/v1|app|v2/.test(type)) {
                if(conts[i].url){
                    let single = conts[i].url||"";
                    if(single){lists.push(single.split('#'))};
                }else{
                    let single = conts[i].urls||[];
                    if(single.length>0){
                        var si = [];
                        for (let j = 0; j < single.length; j++) {
                            si.push(single[j].name+"$"+single[j].url);
                        }
                        lists.push(si);
                    };
                }
            }else if (/iptv/.test(type)) {
                let single = conts[i]||[];
                if(single.length>0){
                    var si = [];
                    for (let j = 0; j < single.length; j++) {
                        si.push(single[j].title+"$"+single[j].url);
                    }
                    lists.push(si);
                };
            }else if (/cms|xpath|biubiu/.test(type)) {
                let single = conts[i]||"";
                if(single){
                    let lines = single.split('#');
                    if(type=='cms'){
                        for(let i in lines){
                            if(lines[i].indexOf('$')==-1){
                                let ii = parseInt(i)+1;
                                lines[i] = ii+'$'+lines[i];
                            }else{
                                break;
                            }
                        }
                    }
                    lists.push(lines)
                };
            }
        }
    }catch(e){
        var lists = [];
    }
    
    if(lists.length>0){
        var list = lists[0];
        if (/v1|app|v2|iptv|cms|xpath|biubiu/.test(type)) {
            try{
                let list1 = list[0].split('$')[0];
                let list2 = list[list.length-1].split('$')[0];
                if(parseInt(list1.match(/(\d+)/)[0])>parseInt(list2.match(/(\d+)/)[0])){
                    list.reverse();
                }
            }catch(e){
            }
        }
        setResult('更新至：' + list[list.length-1].split('$')[0]);
    }
}