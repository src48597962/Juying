/*
function SrcJyJX(vipUrl) {
    function getFreeApi() {
        let registUrl = getRegistUrl();
        let params = {headers: {"User-Agent": MOBILE_UA}, withHeaders: true};
        let html = JSON.parse(fetch(registUrl, params));
        let cookie = html.headers["set-cookie"][0];
        let body = html.body;
        params["headers"]["Cookie"] = cookie;
        params["withHeaders"] = false;
        html = fetch("https://4k.xuanqi.pro/user/?act=注册成功，欢迎回来", params);
        let api = pdfh(html, ".form-control&&value");
        return api;
    }
    let api = getFreeApi();
    log("本次白嫖接口:" + api);
    var url = JSON.parse(request(api + vipUrl, {timeout: 5000})).url;
    return url;
}
*/
let 取随机列表 = function (arr, num) {
    let sData = arr.slice(0), i = arr.length, min = i - num, item, index;
    while (i-- > min) {
        index = Math.floor((i + 1) * Math.random());
        item = sData[index];
        sData[index] = sData[i];
        sData[i] = item;
    }
    return sData.slice(min);
};
function 取随机用户名(num) {
    num = num || 6;
    let arr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    return 取随机列表(arr, num).join("");
}
function 取随机QQ号(num) {
    num = num || 6;
    let arr = "0123456789".split("");
    return 取随机列表(arr, num).join("");
}
/*
function getRegistUrl() {
    let code = 取随机用户名(10);
    let url = "https://4k.xuanqi.pro/user/register/check/?";
    let paramas = {"username": code, "password": code, "repass": code, "email": code + "@163.com", "jxname": "\u9053\u957f", "code": "", "method": "register"};
    let arr = [];
    let keys = Object.keys(paramas);
    for (let i in keys) {
        let key = keys[i];
        arr.push(key + "=" + paramas[key]);
    }
    url = url + arr.join("&");
    return url;
}*/
function 注册账号(regurl,regdata) {
    let reg = request(regurl,
                {headers: {'Referer': regurl },
                body: regdata,
                method: 'POST',
                redirect:false,
                withHeaders:true,
                timeout: 3000
            });

    let regjg = JSON.parse(reg).headers.location || "";
    return regjg;
}
let username = 取随机用户名(10);
let qq = 取随机QQ号(10);
let 获取解析 = {
    nxflv: function() {
        let regurl = "https://vip.nxflv.com/user/login/reg";
        let regdata = "username="+username+"&qq="+qq+"&password="+username;
        let result = 注册账号(regurl,regdata);
        log(regdata+'>>>'+result);
        if(result.indexOf('注册成功')>-1){
            //fetch(loginurl, {timeout: 5000});
            let loginurl = "https://vip.nxflv.com/user/login";
            //request(loginurl);
            let login = request('https://vip.nxflv.com/user/login/checkUser',
                {headers: {'Referer': loginurl, 'Cookie': getCookie(loginurl)},
                body: "username="+username+"&password="+username,
                method: 'POST',
                timeout: 3000
            });
            if(JSON.parse(login).status == 200){
                let html = request("https://vip.nxflv.com/user/information", {headers: {'Referer': loginurl, 'Cookie': getCookie(loginurl)}})
                let uid = html.split('<input type="number" class="form-control" value="')[1].split('"')[0];
                let key = html.split('<input type="text" class="form-control" value="')[3].split('"')[0];
                return "https://json.nxflv.com/?uid="+uid+"&key="+key+"&url=";
            }
            return "";
        }
    }
}
function SrcJyJX(vipUrl) {   
    let jx = 获取解析.nxflv();
    log(jx);
    /*
    function getFreeApi() {
        let registUrl = getRegistUrl();
        let params = {headers: {"User-Agent": MOBILE_UA}, withHeaders: true};
        let html = JSON.parse(fetch(registUrl, params));
        let cookie = html.headers["set-cookie"][0];
        let body = html.body;
        params["headers"]["Cookie"] = cookie;
        params["withHeaders"] = false;
        html = fetch("https://4k.xuanqi.pro/user/?act=注册成功，欢迎回来", params);
        let api = pdfh(html, ".form-control&&value");
        return api;
    }
    let api = getFreeApi();
    log("本次白嫖接口:" + api);
    var url = JSON.parse(request(api + vipUrl, {timeout: 5000})).url;
    return url;*/

}



