function(input) {
    let headers = {
        'content-type': 'application/json;charset=UTF-8',
        "referer": "https://www.aliyundrive.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
    };
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
    headers.authorization = "Bearer " + userinfo.access_token;
    let drive_id = userinfo.default_drive_id;
    let body = {"drive_id":drive_id,"limit":20,"query":"name match \""+input+"\" and type = \"folder\"","image_thumbnail_process":"image/resize,w_200/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_1000,f_jpg,ar_auto,w_300","order_by":"updated_at DESC"}
    let list = JSON.parse(request('https://api.aliyundrive.com/adrive/v3/file/search', { headers: headers, body: body, method: 'POST', timeout: 3000 }));
    let data = list.map(item => {
        return {
            title: item.name,
            url: item.file_id
        }
    })
    return data;
}