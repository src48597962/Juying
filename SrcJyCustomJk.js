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
            let headers = {
                "User-Agent": MOBILE_UA,
                "Referer": "https://www.dianyinggou.com"
            };
            let cook = fetchCookie('https://www.dianyinggou.com');
            headers.Cookie = JSON.parse(cook||'[]').join(';');
            let doghtml = request('https://www.dianyinggou.com/SpiderMovie/zy/' + name, { headers: headers, timeout:5000});
                    log(doghtml);
                    /*
            data.forEach(item=>{
                let dogname = pdfh(item, "a&&title");
                if(dogname.indexOf(name)>-1){
                    let dogpic = pdfh(item, "img&&data-url");
                    let doghtml = request('https://www.dianyinggou.com/SpiderMovie/zy/' + dogname);
                    log(doghtml);
                    lists.push({name:dogname,html:doghtml,pic:dogpic})
                }
            })*/
        } catch (e) {
            log(e.message);
            var lists = [];
        }
        let task = function(obj) {
            //let html = request('https://www.dianyinggou.com/SpiderMovie/zy/' + name);
            //log(html);
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

