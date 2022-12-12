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
        if(/success/.test(result)){
            //fetch(loginurl, {timeout: 5000});
            let loginurl = "https://vip.nxflv.com/user/login";
            //request(loginurl, {timeout: 5000});
            let login = request('https://vip.nxflv.com/user/login/checkUser',
                {headers: {'Referer': loginurl, 'Cookie': getCookie(loginurl)},
                body: "username="+username+"&password="+username,
                method: 'POST',
                timeout: 3000
            });
            if(JSON.parse(login).status == 200){
                let html = request("https://vip.nxflv.com/user/information", {headers: {'Referer': loginurl, 'Cookie': getCookie(loginurl)}});
                let uid = html.split('<input type="number" class="form-control" value="')[1].split('"')[0];
                let key = html.split('<input type="text" class="form-control" value="')[2].split('"')[0];
                return "https://json.nxflv.com/?uid="+uid+"&key="+key+"&url=";
            }
        }
        return "";
    }
}
function bpParse(vipUrl) {
    try{
        if(!/聚影/.test(MY_RULE.title)){
            log('非法调用');
            return "";
        }
        let parse = getItem('SrcJy$baipiaojiexi','');
        function getparse(parse){
            for(let key in 获取解析){
                parse = 获取解析[key]();
                if(parse){
                    setItem('SrcJy$baipiaojiexi',parse);
                    break;
                }
            }
            return parse;
        }
        parse = parse?parse:getparse(parse);
        if(parse){
            let json = JSON.parse(request(parse + vipUrl, {timeout: 5000 }));
            if(json.code==300){
                parse = getparse(parse);
                json = JSON.parse(request(parse + vipUrl, {timeout: 5000 }));
            }
            return json.url || "";
        }else{
            return "";
        }
    }catch(e){
        log(e.message);
        return "";
    }
}



