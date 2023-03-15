function testdown(share_id,file_id,share_pwd){
    try{
        share_pwd = share_pwd&&share_pwd.length==4?share_pwd:"";
        let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
        let userinfo = storage0.getMyVar('aliuserinfo');
        let headers = {
        'content-type': 'application/json;charset=UTF-8',
        "origin": "https://www.aliyundrive.com",
        "referer": "https://www.aliyundrive.com/",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
        "authorization": userinfo.access_token,
        "x-share-token":sharetoken
        };
        let data = {"expire_sec":600,"file_id":file_id,"share_id":share_id};
        let downurl = JSON.parse(request("https://api.aliyundrive.com/v2/file/get_share_link_download_url", { headers: headers, body: data, timeout: 3000 })).download_url;
        let url = JSON.parse(request(downurl, { headers: { 'Referer': 'https://www.aliyundrive.com/' }, onlyHeaders: true, redirect: false, timeout: 3000 })).headers.location[0];
        log(url);
        return url;
    }catch(e){
        log(e.message);
    }
    return "";
}