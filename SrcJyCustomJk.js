let customparse = {
    csp_custom_aicb: function (name) {
        let list = [];
        eval(getCryptoJS());
        let token = CryptoJS.SHA1(name + "URBBRGROUN").toString();
        try {
            let html = request('https://api.cupfox.app/api/v2/search/?text=' + name + '&type=0&from=0&size=200&token=' + token);
            var lists = JSON.parse(html).resources;
        } catch (e) {
            var lists = [];
        }
        lists.forEach(item => {
            let vodname = item.text.replace(/<em>|<\/em>/g, ''); 
            if (!/qq|mgtv|iptv|iqiyi|youku|bilibili|souhu|cctv|wybg666|bdys01|ylwt33/.test(item.url)&&vodname.indexOf(name)>-1) {
                list.push({
                    vodname: vodname,
                    vodpic: "",
                    voddesc: item.website + (item.tags.length > 0 ? '  [' + item.tags.join(' ') + ']' : ''),
                    vodurl: item.url
                })
            }
        });
        return list;
    },
    csp_custom_aidog: function (name) {
        try {
            var lists = [];
            let html = request("https://www.dianyinggou.com/so/" + name);
            let data = pdfa(html, "body&&.movies&&.each");
            let cook = getCookie('https://www.dianyinggou.com');
            data.forEach(item=>{
                let dogname = pdfh(item, "a&&title");
                if(dogname.indexOf(name)>-1){
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
                    log(htmls);
                    htmls.forEach(item=>{
                        let sitename = pdfh(item, "a&&li,1&&Text");
                        let vodname = pdfh(item, "a&&li,0&&Text");
                        let vodurl = pdfh(item, "a&&href");
                        lists.push({name:vodname,pic:dogpic,url:vodurl,site:sitename})
                    })
                }
            })
        } catch (e) {
            log(e.message);
            var lists = [];
        }
        let list = [];
        let task = function(obj) {
            let trueurl = request(obj.url, {redirect: false, withHeaders: true});
            let vodurl = JSON.parse(trueurl).headers.location[0];
            list.push({
                vodname: obj.name,
                vodpic: obj.pic,
                voddesc: obj.site,
                vodurl: vodurl
            })
            return 1;
        }
        let doglist = lists.map((item)=>{
			return {
				func: task,
				param: item,
				id: item.url
			}
        });
        be(doglist, {
            func: function(obj, id, error, taskResult) {
            },
            param: {
            }
        });
        return list;
    }
}

