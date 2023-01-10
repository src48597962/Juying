//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
let customparse = {
    csp_custom_aidog: function (name) {
        let filepath = "hiker://files/rules/Src/Juying/jiekou.json";
        let datafile = fetch(filepath);
        if(datafile != ""){
            eval("var datalist=" + datafile+ ";");
        }else{
            var datalist = [];
        }
        let is =0;
        for(let i=0;i<datalist.length;i++){
            if(datalist[i].url=="csp_custom_aidog"){
                datalist[i].data.ext = "https://raw.iqiq.io/src48597962/hk/master/SrcJyCustomJk.js";
                is =1;
                break;
            }
        }
        if(is==1){
            writeFile(filepath, JSON.stringify(datalist));
        }

        try {
            var lists = [];
            let html = request("https://www.dianyinggou.com/so/" + name);
            let data = pdfa(html, "body&&.movies&&.each");
            let cook = getCookie('https://www.dianyinggou.com');
            data.forEach(item=>{
                let dogname = pdfh(item, "a&&title");
                if(dogname == name){
                    let dogurl = pdfh(item, "a&&href");
                    let dogpic = pdfh(item, "img&&data-url");
                    let headers = {
                        "User-Agent": MOBILE_UA,
                        "Referer": dogurl,
                        "x-requested-with": "XMLHttpRequest",
                        "Cookie": cook
                    };
                    let doghtml = request('https://www.dianyinggou.com/SpiderMovie/zy/' + dogname, {headers: headers});
                    let htmls = pdfa(doghtml, "body&&a");
                    htmls.forEach(it=>{
                        try{
                            let sitename = pdfh(it, "a&&li,1&&Text");
                            let vodname = pdfh(it, "a&&li,0&&Text");
                            let vodurl = pdfh(it, "a&&href");
                            if(vodname==dogname&&!lists.some(ii => ii.url==vodurl)){
                                lists.push({name:vodname,pic:dogpic,url:vodurl,site:sitename})
                            }
                        }catch(e){}
                    })
                }
            })
        } catch (e) {
            log(e.message);
            var lists = [];
        }

        let list = [];
        let task = function(obj) {
            try{
                let trueurl = request(obj.url, {redirect: false, withHeaders: true});
                let vodurl = JSON.parse(trueurl).headers.location[0];
                if(!/qq|mgtv|iptv|iqiyi|youku|bilibili|souhu|cctv|icaqd|cokemv|mhyyy|fun4k|jpys\.me|31kan|37dyw|kpkuang/.test(vodurl)&&!list.some(ii => ii.vodurl==vodurl)){
                    list.push({
                        vodname: obj.name,
                        vodpic: obj.pic.replace(/http.*?\?url=/,''),
                        voddesc: obj.site,
                        vodurl: vodurl
                    })
                }
            }catch(e){}
            return 1;
        }
        let doglist = lists.map((item)=>{
			return {
				func: task,
				param: item,
				id: item.url
			}
        });
        if(doglist.length>0){
            be(doglist, {
                func: function(obj, id, error, taskResult) {
                },
                param: {
                }
            });
        }
        return list;
    },
    csp_custom_zhuiyingmao: function(name) {
        try {
            var lists = [];
            let html = request("https://zhuiyingmao.com/index.php/ajax/suggest?mid=1&wd="+name+"&limit=10" );
            let data = JSON.parse(html).list;
            let cook = getCookie('https://zhuiyingmao.com');
            data.forEach(item => {
                let maoname = item.name;
                if (maoname == name) {
                    let maourl = 'https://zhuiyingmao.com/voddetail/' + item.id+".html";
                    let maopic = item.pic;
                    let headers = {
                        "User-Agent": MOBILE_UA,
                        "Referer": maourl,
                        "x-requested-with": "XMLHttpRequest",
                        "Cookie": cook
                    };
                    let maohtml = request(maourl, {
                        headers: headers
                    });
                    let htmls = pdfa(maohtml, ".search-result-container&&a");
                    htmls.forEach(it => {
                        try {
                            let sitename = pdfh(it, ".website-name&&Text");
                            let vodname = pdfh(it, ".title&&Text");
                            let vodurl = pdfh(it, "a&&href");
                            if (vodname == maoname && !lists.some(ii => ii.url == vodurl)) {
                                lists.push({
                                    name: vodname,
                                    pic: maopic,
                                    url: vodurl,
                                    site: sitename
                                });
                            }
                        } catch (e) {}
                    });
                }
            })
        } catch (e) {
            log(e.message);
            var lists = [];
        }
        
        let list = [];
        let task = function(obj) {
            try {
                let vodurl = obj.url;
                if (!/qq|mgtv|iptv|iqiyi|youku|bilibili|souhu|cctv|icaqd|cokemv|mhyyy|fun4k|jpys\.me|31kan|37dyw|kpkuang/.test(vodurl) && !list.some(ii => ii.vodurl == vodurl)) {
                    list.push({
                        vodname: obj.name,
                        vodpic: obj.pic.replace(/http.*?\?url=/, ''),
                        voddesc: obj.site,
                        vodurl: vodurl
                    });
                }
            } catch (e) {}
            return 1;
        }
        let maolist = lists.map((item) => {
            return {
                func: task,
                param: item,
                id: item.url
            }
        });
        if (maolist.length > 0) {
            be(maolist, {
                func: function(obj, id, error, taskResult) {},
                param: {}
            });
        }
        return list;
    },
    csp_custom_aiwandou: function (name) {
        try {
            var lists = [];
            let html = request("https://wuli.api.bailian168.cc/movie/getsearchlist/keywords/"+name+"/page/1/rows/15.json");
            let data = JSON.parse(html).data;
            data.forEach(item=>{
                let ainame = item.movie_name;
                if(ainame == name || (getSearchMode()==0&&ainame.indexOf(name)>-1)){
                    let aiurl = "https://www.wandou.pro/detail/"+item.movie_id;
                    let aipic = item.movie_img_url;
                    let aihtml = request(aiurl);
                    let htmls = pdfa(aihtml,"body&&.c-kbddDX&&a");
                    htmls.forEach(it=>{
                        try{
                            let sitename = pdfh(it,"span&&Text");
                            let vodurl = pdfh(it,"a&&href");
                            if(!lists.some(ii => ii.url==vodurl)){
                                lists.push({name:ainame,pic:aipic,url:vodurl,site:sitename});
                            }
                        }catch(e){}
                    })
                }
            })
        } catch (e) {
            log(e.message);
            var lists = [];
        }

        let list = [];
        lists.forEach(item=>{
            if(!/qq|mgtv|iptv|iqiyi|youku|bilibili|souhu|cctv|icaqd|cokemv|mhyyy|fun4k|jpys\.me|31kan|37dyw|kpkuang/.test(item.url)&&!list.some(ii => ii.vodurl==item.url)){
                list.push({
                    vodname: item.name,
                    vodpic: item.pic.replace(/http.*?\?url=/,''),
                    voddesc: item.site,
                    vodurl: item.url
                })
            }
        })
        return list;
    }
}

