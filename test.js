function(input) {
    require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAliPublic.js');
    if(userinfo.access_token){
        headers.authorization = "Bearer " + userinfo.access_token;
        let drive_id = userinfo.default_drive_id;
        let postdata = {"drive_id":drive_id,"limit":100,"query":"name match \""+input+"\" and type = \"folder\"","image_thumbnail_process":"image/resize,w_200/format,jpeg","image_url_process":"image/resize,w_1920/format,jpeg","video_thumbnail_process":"video/snapshot,t_1000,f_jpg,ar_auto,w_300","order_by":"updated_at DESC"}
        let list = JSON.parse(request('https://api.aliyundrive.com/adrive/v3/file/search', { headers: headers, body: postdata, method: 'POST', timeout: 3000 })).items;
        let data = list.map(item => {
            return {
                title: item.name,
                url: item.file_id
            }
        })
        return data;
    }
    return [];
}