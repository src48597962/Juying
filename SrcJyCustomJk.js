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
        try {
            var lists = [];
            let html = request("https://zhuiyingmao2.com/index.php/ajax/suggest?mid=1&wd="+name+"&limit=10" );
            let data = JSON.parse(html).list;
            let cook = getCookie('https://zhuiyingmao.com');
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
    csp_custom_77: function (name) {
        let list = [];
        try {
            let html = request("https://api.tyun77.cn/api.php/provide/searchVideo?searchName="+name);
            let data = JSON.parse(html).data;
            data.forEach(item=>{
                let dataname = item.videoName;
                if(dataname == name || (getSearchMode()==0&&dataname.indexOf(name)>-1)){
                    list.push({
                        vodname: dataname,
                        vodpic: item.videoCover.replace(/http.*?\?url=/,''),
                        voddesc: item.msg,
                        vodurl: item.id
                    })
                }
            })
            return {
                list: list,//搜索结果列表
                urlparse: function (url) {//影片链接解析处理

                },
                erjiparse: {//二级解析代码
                    detail: function (html) {//影片详情

                    },
                    line: function (html) {//线路

                    },
                    list: function (html) {//选集

                    }
                }
            }
        } catch (e) {
            log(e.message);
        }
        return list;
    }
}

