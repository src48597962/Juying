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
        "dtMark": "//span[contains(text(), '更新')]/following-sibling::*/text()",
        "dtActor": "//p[@class='act']/span[contains(text(), '主演')]/parent::*/text()",
        "dtDirector": "//p[@class='dir']/span[contains(text(), '导演')]/parent::*/text()",
        "dtDesc": "//span[contains(text(), '简介')]/parent::*/text()",
        "dtFromNode": "//div[contains(@class, 'tbox_t')]/h3/i[contains(@class, 'icon-pin')]/parent::*",
        "dtFromName": "/text()",
        "dtUrlNode": "//div[contains(@class,'tabs_block')]/ul[contains(@class, 'list_block show')]",
        "dtUrlSubNode": "/li/a",
        "dtUrlId": "@href",
        "dtUrlIdR": "/play/(\\S+).html",
        "dtUrlName": "/text()",
        "playUrl": "http://www.lezhutv.com/play/{playUrl}.html",
        "searchUrl": "http://www.lezhutv.com/index.php?m=vod-search?wd={wd};post",
        "scVodNode": "//ul[contains(@class,'tbox_m')]/li",
        "scVodName": "//a/@title",
        "scVodId": "//a/@href",
        "scVodImg": "//a/@data-original",
        "scVodMark": "//span/Text()"
    }
}