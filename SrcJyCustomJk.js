//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
let customparse = {
    csp_custom_aidog: function (name) {
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
        var list = [];
        try {
            let html = request("https://zhuiyingmao2.com/index.php/ajax/suggest?mid=1&wd="+name+"&limit=10" );
            let data = JSON.parse(html).list;
            let cook = getCookie('https://zhuiyingmao2.com');
            data.forEach(item => {
                let maoname = item.name;
                if (maoname == name) {
                    let maourl = 'https://zhuiyingmao2.com/voddetail/' + item.id+".html";
                    let maopic = item.pic;
                    let headers = {
                        "User-Agent": MOBILE_UA,
                        "Referer": maourl,
                        "x-requested-with": "XMLHttpRequest",
                        "Cookie": cook
                    };
                    let maohtml = request(maourl, {
                        //headers: headers
                    });
                    let htmls = pdfa(maohtml, ".search-result-container&&a");
                    htmls.forEach(it => {
                        let sitename = pdfh(it, ".website-name&&Text");
                        let vodurl = pdfh(it, "a&&href");
                        if (!list.some(ii => ii.url == vodurl)) {
                            list.push({
                                vodname: maoname,
                                vodpic: maopic.replace(/http.*?\?url=/,''),
                                voddesc: sitename,
                                vodurl: vodurl
                            });
                        }
                    });
                }
            })
        } catch (e) {
            //log(e.message);
        }
        return list;
    }
}

