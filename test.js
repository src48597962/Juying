function testdown(share_id, file_id, share_pwd) {
    try {
        share_pwd = share_pwd && share_pwd.length == 4 ? share_pwd : "";
        let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
        let userinfo = {
            "default_sbox_drive_id": "22285911",
            "role": "user",
            "device_id": "2ee96484b9fc4860b9427feb97a4c142",
            "user_name": "181***189",
            "need_link": false,
            "expire_time": "2023-03-15T14:52:44Z",
            "pin_setup": true,
            "need_rp_verify": false,
            "avatar": "https://img.aliyundrive.com/avatar/630f95279b504d10b8fc529b67a9717b.jpeg",
            "user_data": {
                "DingDingRobotUrl": "https://oapi.dingtalk.com/robot/send?access_token=0b4a936d0e98c08608cd99f693393c18fa905aa0868215485a28497501916fec",
                "EncourageDesc": "内测期间有效反馈前10名用户将获得终身免费会员",
                "FeedBackSwitch": true,
                "FollowingDesc": "34848372",
                "ding_ding_robot_url": "https://oapi.dingtalk.com/robot/send?access_token=0b4a936d0e98c08608cd99f693393c18fa905aa0868215485a28497501916fec",
                "encourage_desc": "内测期间有效反馈前10名用户将获得终身免费会员",
                "feed_back_switch": true,
                "following_desc": "34848372"
            },
            "token_type": "Bearer",
            "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIzNDI2YWQ4ZWJhYTA0ZTFlYTllZTAxYmQ5OThkMDZkNCIsImN1c3RvbUpzb24iOiJ7XCJjbGllbnRJZFwiOlwiMjVkelgzdmJZcWt0Vnh5WFwiLFwiZG9tYWluSWRcIjpcImJqMjlcIixcInNjb3BlXCI6W1wiRFJJVkUuQUxMXCIsXCJTSEFSRS5BTExcIixcIkZJTEUuQUxMXCIsXCJVU0VSLkFMTFwiLFwiVklFVy5BTExcIixcIlNUT1JBR0UuQUxMXCIsXCJTVE9SQUdFRklMRS5MSVNUXCIsXCJCQVRDSFwiLFwiT0FVVEguQUxMXCIsXCJJTUFHRS5BTExcIixcIklOVklURS5BTExcIixcIkFDQ09VTlQuQUxMXCIsXCJTWU5DTUFQUElORy5MSVNUXCIsXCJTWU5DTUFQUElORy5ERUxFVEVcIl0sXCJyb2xlXCI6XCJ1c2VyXCIsXCJyZWZcIjpcImh0dHBzOi8vd3d3LmFsaXl1bmRyaXZlLmNvbS9cIixcImRldmljZV9pZFwiOlwiMTcyMzA1NTVkZTkwNGM4YmFlZjdmMzFiOGJmNTY5ZmJcIn0iLCJleHAiOjE2Nzg4OTE5NjQsImlhdCI6MTY3ODg4NDcwNH0.ORQ1zIP3ZDyvJpra3xQdG_CAGbbk0NL--vG57YZSG_3lLDl8Bag5IZREpVdmkibsXHW67D_8y3oYMQPcNaq5dY2p5fEtp9vyZOJFf2_6nMQEj5Ho_F3iV7C66-TCJE91UsyewjiJIgq5is5I2H5TV-wGUak8ebVd-4F6_h6IZeU",
            "default_drive_id": "12285911",
            "domain_id": "bj29",
            "refresh_token": "17230555de904c8baef7f31b8bf569fb",
            "is_first_login": false,
            "user_id": "3426ad8ebaa04e1ea9ee01bd998d06d4",
            "nick_name": "咸咸哈哈",
            "exist_link": [

            ],
            "state": "",
            "expires_in": 7200,
            "status": "enabled"
        };
        let headers = {
            'content-type': 'application/json;charset=UTF-8',
            "origin": "https://www.aliyundrive.com",
            "referer": "https://www.aliyundrive.com/",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41",
            "authorization": userinfo.access_token,
            "x-share-token": sharetoken
        };
        let data = { "expire_sec": 600, "file_id": file_id, "share_id": share_id };
        let downurl = JSON.parse(request("https://api.aliyundrive.com/v2/file/get_share_link_download_url", { headers: headers, body: data, timeout: 3000 })).download_url;
        let url = JSON.parse(request(downurl, { headers: { 'Referer': 'https://www.aliyundrive.com/' }, onlyHeaders: true, redirect: false, timeout: 3000 })).headers.location[0];
        log(url);
        return url;
    } catch (e) {
        log(e.message);
    }
    return "";
}