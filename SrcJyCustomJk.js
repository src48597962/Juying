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
            //let cook = getCookie('https://zhuiyingmao2.com');
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
    },
    csp_custom_77: function (name,type) {
        if(type=="ss"){//搜索
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
            } catch (e) {
                //log(e.message);
            }
            return list;
        }else if(type=="erji"){
            return {
                url: function (vid) {//影片链接解析处理
                    let qqtime = parseInt(new Date().getTime() / 1000) + '';
                    let qqtok = md5('/api.php/provide/videoDetailrealme4ac3fe96a6133de96904b8d3c8cfe16d'+vid+'40.954705116.801239RMX1931com.sevenVideo.app.android010110005'+ qqtime +'android7.1.22.1.4'+ qqtime +'XSpeUFjJ');
                    let html = request('https://api.tyun77.cn/api.php/provide/videoDetail?brand=realme&devid=4ac3fe96a6133de96904b8d3c8cfe16d&ids='+vid+'&lat=40.954705&lon=116.801239&model=RMX1931&package=com.sevenVideo.app.android&pcode=010110005&sj='+qqtime+'&sys=android&sysver=7.1.2&version=2.1.4', {
                        headers: {
                            "User-Agent": "okhttp/3.12.0",
                            "t": qqtime,
                            "TK": qqtok
                        }
                    });
                    return {html:html,vid:vid};
                },
                data: function (obj) {//影片详情、线路、选集
                    let json = JSON.parse(obj.html).data;
                    let detail1 = '主演：' + json.actor + '\n地区：'+json.area+' 年份：'+json.year;
                    let detail2 = '分类：' + json.subCategory + '\n状态：'+json.msg;
                    let img = json.videoCover;
                    let desc = json.brief;
                    let qqtime = parseInt(new Date().getTime() / 1000) + '';
                    let vid = obj.vid;
                    let qqtok = md5('/api.php/provide/videoPlaylistrealme4ac3fe96a6133de96904b8d3c8cfe16d'+vid+'40.954705116.801239RMX1931com.sevenVideo.app.android010110005'+ qqtime +'android7.1.22.1.4'+ qqtime +'XSpeUFjJ');
                    let html = fetch('https://api.tyun77.cn/api.php/provide/videoPlaylist?brand=realme&devid=4ac3fe96a6133de96904b8d3c8cfe16d&ids='+vid+'&lat=40.954705&lon=116.801239&model=RMX1931&package=com.sevenVideo.app.android&pcode=010110005&sj='+qqtime+'&sys=android&sysver=7.1.2&version=2.1.4', {
                        headers: {
                            "User-Agent": "okhttp/3.12.0",
                            "t": qqtime,
                            "TK": qqtok
                        }
                    });
                    let lines =[];//线路数组
                    let lists =[];//选集数组
                    let list =[];//单选集临时
                    let data = JSON.parse(html).data.episodes;
                    data.forEach(it=>{
                        if(lines.indexOf(it.source)==-1){
                            lines.push(it.source);
                        }
                        list.push(it.title.replace(it.albumTitle,'')+'$'+it.playurl);
                    })
                    lists.push(list.join('#'));
                    return {
                        detail1:detail1,
                        detail2:detail2,
                        img:img,
                        desc:desc,
                        lines:lines,
                        lists:lists
                    }
                }
            }
        }
    }
}

