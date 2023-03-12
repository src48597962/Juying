function aliShare(share_id,share_pwd,file_id) {
    let headers = {
      'content-type': 'application/json;charset=UTF-8',
      "origin": "https://www.aliyundrive.com",
      "referer": "https://www.aliyundrive.com/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
      "x-canary": "client=web,app=share,version=v2.3.1"
    };
    let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { headers:headers,body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
    let postdata = {"share_id":share_id,"parent_file_id":file_id||"root","limit":20,"image_thumbnail_process":"image/resize,w_256/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg/interlace,1","video_thumbnail_process":"video/snapshot,t_1000,f_jpg,ar_auto,w_256","order_by":"name","order_direction":"DESC"};
    headers['x-share-token'] = sharetoken;
    let sharelist = JSON.parse(request('https://api.aliyundrive.com/adrive/v2/file/list_by_share', { headers:headers, body: postdata, method: 'POST', timeout: 3000 }));
    let d = [];
    sharelist.forEach((item) => {
        if (item.type=="folder") {
            d.push({
                title: item.name,
                img: "hiker://files/cache/src/文件夹.svg",//#noRecordHistory##noHistory#
                url: $("hiker://empty##").rule((share_id,share_pwd,file_id) => {
                    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliShare.js');
                    aliShare(share_id,share_pwd,file_id);
                }, item.share_id, share_pwd, item.file_id),
                col_type: 'avatar',
                extra: {
                    cls: "loadlist"
                }
            })
        } else {
            d.push({
                title: item.name,
                img: "hiker://files/cache/src/音乐.svg",// : contain.test(suffix) ? "hiker://files/cache/src/影片.svg" : image.test(suffix) ? "hiker://files/cache/src/图片.png" : "hiker://files/cache/src/Alist.svg"),
                url: $().lazyRule(() => {
                    
                }),
                col_type: 'avatar'
            })
        }
    })
    setResult(d);
    
    /*
    let share_id = rurl.split('&sl=')[1].split('&')[0];
    let file_id = rurl.split('&f=')[1].split('&')[0];
    let alitoken = alistconfig.alitoken;
    let play = getAliUrl(share_id, file_id, alitoken);
    if (play.urls) {
        if (subtitle) {
            play['subtitle'] = subtitle;
        }
        return JSON.stringify(play);
    }*/
}