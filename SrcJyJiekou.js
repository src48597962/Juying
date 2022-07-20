var jyjiekou = {
    "csp_xpath_jbb":{//接口标识不能重复
        "name": "剧白白",//接口名称
        "filter": "",//过虑字符，使用正则表达式/过虑1|过虑2/g
        "ua": "",
        "dtUrl": "https://www.jubaibai.cc/vod/{vid}.html",//视频地址
        "dtNode": "//body",//xpath最顶层节点
        "dtImg": "//div[contains(@class,'stui-content__thumb')]/a/img/@data-original",//图片
        "dtCate": "//p[contains(@class,'data')][1]/text()",//类型
        "dtYear": "//p[contains(@class,'data')][5]/text()",//年份
        "dtArea": "//p[contains(@class,'data')][3]/text()",//地区
        "dtMark": "//p[contains(@class,'data')][8]/span/text()",//状态、备注
        "dtDirector": "//p[contains(@class,'data')][6]/a/text()",//导演
        "dtActor": "//p[contains(@class,'data')][7]/a/text()",//主演
        "dtDesc": "//span[@class='detail-content']/text()",//简介
        "dtFromNode": "//div[@class='stui-vodlist__head']/h3[@class='title']",//线路列表
        "dtFromName": "/text()",//线路名称
        "dtUrlNode": "//div[contains(@class,'stui-vodlist__head')]",//选集列表
        "dtUrlSubNode": "/ul/li/a",//单集
        "dtUrlId": "/@href",//单集链接
        "dtUrlName": "/text()",//单集名称
        "dtUrlIdR": "/play/(\\S+).html",//播地址格式
        "playUrl": "https://www.jubaibai.cc/play/{playUrl}.html",//播放地址
        "searchUrl": "https://www.jubaibai.cc/index.php/ajax/suggest?mid=1&wd={wd}&limit=10",//搜索地址
        "scVodNode": "json:list",//搜索数据类型
        "scVodName": "name",//搜索数据-影片名
        "scVodId": "id",//搜索数据-影片id
        "scVodImg": "pic",//搜索数据-影片图片
        "scVodMark": ""//搜索数据-影片备注
    },
    "csp_xpath_ddg":{
        "name": "达达龟",
        "filter": "",
        "ua": "",
        "dtUrl": "http://www.dadagui.com/voddetail/{vid}.html",
        "dtNode": "//body",
        "dtImg": "//div[contains(@class,'stui-content__thumb')]/a/img/@data-original",
        "dtCate": "//p[contains(@class,'data')][4]/text()",
        "dtYear": "//p[contains(@class,'data')][3]/text()",
        "dtArea": "//p[contains(@class,'data')][1]/text()",
        "dtMark": "//p[contains(@class,'data')][7]/text()",
        "dtDirector": "//p[contains(@class,'data')][6]/text()",
        "dtActor": "//p[contains(@class,'data')][5]/text()",
        "dtDesc": "//span[@class='detail-content']/text()",
        "dtFromNode": "//h3[contains(text(), '播')]",
        "dtFromName": "/text()",
        "dtUrlNode": "//ul[contains(@class,'stui-content__playlist')]",
        "dtUrlSubNode": "/li/a",
        "dtUrlId": "/@href",
        "dtUrlName": "/text()",
        "dtUrlIdR": "/vodplay/(\\S+).html",
        "playUrl": "http://www.dadagui.com/vodplay/{playUrl}.html",
        "searchUrl": "http://www.dadagui.com/index.php/ajax/suggest?mid=1&wd={wd}&limit=10",
        "scVodNode": "json:list",
        "scVodName": "name",
        "scVodId": "id",
        "scVodImg": "pic",
        "scVodMark": ""
    },
    "csp_xpath_lezhu":{
        "name": "乐猪TV",
        "filter": "",
        "ua": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
        "dtUrl": "http://www.lezhutv.com{vid}",
        "dtNode": "//body",
        "dtImg": "//div[@class='dbox']/div[contains(@class,'img item-lazy')]/@data-original",
        "dtCate": "//span[contains(text(), '分类')]/following-sibling::*/text()",
        "dtYear": "//span[contains(text(), '年份')]/following-sibling::*/text()",
        "dtArea": "//span[contains(text(), '地区')]/following-sibling::*/text()",
        "dtMark": "//p[contains(@class, 'yac')]/text()",
        "dtActor": "//p[@class='act']/span[contains(text(), '主演')]/parent::*/text()",
        "dtDirector": "//p[@class='dir']/span[contains(text(), '导演')]/parent::*/text()",
        "dtDesc": "//div[contains(@class, 'tbox_js')]/text()",
        "dtFromNode": "//div[contains(@class, 'tabs')]/div/h3",
        "dtFromName": "/text()",
        "dtUrlNode": "//div[contains(@class, 'tabs')]",
        "dtUrlSubNode": "//div[contains(@class,'tabs_block2')]/ul/li/a",
        "dtUrlId": "/@href",
        "dtUrlIdR": "/play/(\\S+).html",
        "dtUrlName": "/text()",
        "playUrl": "http://www.lezhutv.com/play/{playUrl}.html",
        "searchUrl": "http://www.lezhutv.com/index.php?m=vod-search?wd={wd};post",
        "scVodNode": "//ul[contains(@class,'tbox_m')]/li",
        "scVodName": "/a[contains(@class,'item-lazy')]/@title",
        "scVodId": "/a[contains(@class,'item-lazy')]/@href",
        "scVodImg": "/a[contains(@class,'item-lazy')]/@data-original",
        "scVodMark": "/a[contains(@class,'item-lazy')]/span/text()"
    },
    "csp_biubiu_dxtv":{
        "name": "大象TV",
        "url": "http://www.daxiangtv.net/",
        "tupianqian": "original=\"",
        "tupianhou": "\"",
        "lianjieqian": "href=\"",
        "lianjiehou": "\"",
        "sousuoqian": "/index.php/ajax/suggest?mid=1&wd=",
        "sousuohou": "&limit=500",
        "sousuohouzhui": "/voddetail/",
        "ssmoshi": "0",
        "sousuoshifouercijiequ": "0",
        "jspic": "pic",
        "jsname": "name",
        "jsid": "id",
        "ssjiequqian": "空",
        "ssjiequhou": "空",
        "ssjiequshuzuqian": "空",
        "ssjiequshuzuhou": "空",
        "sstupianqian": "空",
        "sstupianhou": "空",
        "ssbiaotiqian": "空",
        "ssbiaotihou": "空",
        "sslianjieqian": "空",
        "sslianjiehou": "空",
        "bfshifouercijiequ": "0",
        "bfjiequqian": "空",
        "bfjiequhou": "空",
        "bfjiequshuzuqian": "id=\"playlist",
        "bfjiequshuzuhou": "</ul>",
        "zhuangtaiqian": "更新：</span>",
        "zhuangtaihou": "</p>",
        "daoyanqian": "导演：</span>",
        "daoyanhou": "</p>",
        "zhuyanqian": "主演：</span>",
        "zhuyanhou": "</p>",
        "juqingqian": "class=\"sketch content\">",
        "juqinghou": "</span>",
        "bfyshifouercijiequ": "0",
        "bfyjiequqian": "空",
        "bfyjiequhou": "空",
        "bfyjiequshuzuqian": "<a",
        "bfyjiequshuzuhou": "/a>",
        "bfbiaotiqian": ">",
        "bfbiaotihou": "<",
        "bflianjieqian": "href=\"",
        "bflianjiehou": "\""
    },
    "csp_biubiu_swxf":{
        "author":"20220530",
        "name": "森屋新番",
        "url": "https://www.senfun.net", //填网站链接
        "tihuan": "cnzz.com", //这个不用动，是个别网站嗅探时过滤地址用的
        //"User": "空", //这个不用动，是个别网站播放需要请求头时才用到
        "User": "User-Agent:Dart/2.14 (dart:io)",
        "shouye": "1",
        "fenlei": "TV动画$/show/1/page/#BD动画$/show/2/page/#剧场版$/show/3/page/#欧美动漫$/show/37/page/", //网站列表的分类
        "houzhui": ".html", //网站翻页链接的后缀

        "shifouercijiequ": "0", //截取的列表数组是否需要二次截取，0不需要，1需要
        "jiequqian": "空", //不需要二次截取就填空
        "jiequhou": "空", //不需要二次截取就填空
        "jiequshuzuqian": "class=\"module-item-pic\"", //截取的列表数组的前关键词,截取的关键词有 " 的用 \ 进行转义
        "jiequshuzuhou": "</div>", //截取的列表数组的后关键词,截取的关键词有 " 的用 \ 进行转义
        "tupianqian": "data-src=\"", //列表中资源的图片前关键词,截取的关键词有 " 的用 \ 进行转义
        "tupianhou": "\"", //列表中资源的图片后关键词,截取的关键词有 " 的用 \ 进行转义
        "biaotiqian": "title=\"", //列表中资源的标题前关键词,截取的关键词有 " 的用 \ 进行转义
        "biaotihou": "\"", //列表中资源的标题后关键词,截取的关键词有 " 的用 \ 进行转义
        "lianjieqian": "href=\"", //列表中资源的详情页跳转链接前关键词,截取的关键词有 " 的用 \ 进行转义
        "lianjiehou": "\"", //列表中资源的详情页跳转链接后关键词,截取的关键词有 " 的用 \ 进行转义

        //搜索部分基本不用动，现在网站基本都是苹果CMS，所有搜索是固定的。
        "sousuoqian": "/index.php/ajax/suggest?mid=1&wd=",
        "sousuohou": "&limit=500",
        "sousuohouzhui": "/bangumi/", //搜索页影片跳转详情页的中间标识链接部分
        "ssmoshi": "0",
        "sousuoshifouercijiequ": "0",
        "jspic": "pic",
        "jsname": "name",
        "jsid": "id",
        "ssjiequqian": "空",
        "ssjiequhou": "空",
        "ssjiequshuzuqian": "空",
        "ssjiequshuzuhou": "空",
        "sstupianqian": "空",
        "sstupianhou": "空",
        "ssbiaotiqian": "空",
        "ssbiaotihou": "空",
        "sslianjieqian": "空",
        "sslianjiehou": "空",

        "bfshifouercijiequ": "0",
        "bfjiequqian": "空",
        "bfjiequhou": "空",
        "bfjiequshuzuqian": "id=\"sort-item-", //播放截取的列表数组的前关键词
        "bfjiequshuzuhou": "</div>", //播放截取的列表数组的后关键词

        "zhuangtaiqian": "video-info-item\">", //状态前关键词
        "zhuangtaihou": "</div>", //状态后关键词
        "daoyanqian": "导演：</span>", //导演前关键词
        "daoyanhou": "</div>", //导演态后关键词
        "zhuyanqian": "主演：</span>", //主演前关键词
        "zhuyanhou": "</div>", //主演后关键词
        "juqingqian": "class=\"zkjj_a\">", //剧情前关键词
        "juqinghou": "<span", //剧情后关键词

        "bfyshifouercijiequ": "0", //截取的播放列表数组是否需要二次截取，0不需要，1需要
        "bfyjiequqian": "空", //不需要二次截取就填空
        "bfyjiequhou": "空", //不需要二次截取就填空
        "bfyjiequshuzuqian": "<a", //播放剧集数组前关键词
        "bfyjiequshuzuhou": "/a>", //播放剧集数组后关键词
        "bfbiaotiqian": "span>", //播放剧集标题前关键词
        "bfbiaotihou": "</span", //状播放剧集标题后关键词
        "bflianjieqian": "href=\"", //播放剧集链接前关键词
        "bflianjiehou": "\""
        }
}