//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
//Ali公用文件
let alistfile = "hiker://files/rules/Src/Juying/Alist.json";
let alicfgfile = "hiker://files/rules/Src/Juying/aliconfig.json";
let aliconfig = {};
if (fetch(alicfgfile)) {
    try {
        eval("aliconfig = " + fetch(alicfgfile));
    } catch (e) {
        log("aliconfig文件加载失败");
    }
} else if (fetch(alistfile)) {
    try {
        eval("let alistdata = " + fetch(alistfile));
        if (alistdata.config) {
            aliconfig = alistdata.config;
            if (aliconfig.alitoken) {
                aliconfig.refresh_token = aliconfig.alitoken;
                delete aliconfig.alitoken;
                writeFile(alicfgfile, JSON.stringify(aliconfig));
                delete alistdata.config;
                writeFile(alistfile, JSON.stringify(alistdata));
            }
        }
    } catch (e) {
        log("从alist拆分aliconfig文件失败");
    }
}

let alistconfig = aliconfig;
let fileFilter = aliconfig['fileFilter'] == 0 ? 0 : 1;
let audiovisual = aliconfig.contain ? aliconfig.contain.replace(/\./g, "") : 'mp4|avi|mkv|rmvb|flv|mov|ts|mp3|m4a|wma|flac';//影音文件
let contain = new RegExp(audiovisual, "i");//设置可显示的影音文件后缀
let music = new RegExp("mp3|m4a|wma|flac", "i");//进入音乐播放器
let image = new RegExp("jpg|png|gif|bmp|ico|svg", "i");//进入图片查看
let transcoding = { UHD: "4K 超清", QHD: "2K 超清", FHD: "1080 全高清", HD: "720 高清", SD: "540 标清", LD: "360 流畅" };
//let ali_yun = aliconfig.aliyun || {};
let alitoken = aliconfig.refresh_token || "";
if (!alitoken && getMyVar('getalitoken') != "1") {
    putMyVar('getalitoken', '1');
    try {
        //节约资源，如果有获取过用户信息，就重复利用一下
        let icyfilepath = "hiker://files/rules/icy/icy-ali-token.json";
        let joefilepath = "hiker://files/rules/joe/ali.json";
        let alifile = fetch(icyfilepath);
        if (alifile) {
            let tokenlist = eval(alifile);
            if (tokenlist.length > 0) {
                alitoken = tokenlist[0].refresh_token;
            }
        }
        if (!alitoken) {
            alifile = fetch(joefilepath);
            if (alifile) {
                let token = eval(alifile);
                alitoken = token.refresh_token;
            }
        }
        if (alitoken) {
            aliconfig.refresh_token = alitoken;
            writeFile(alicfgfile, JSON.stringify(aliconfig));
        }
    } catch (e) {
        log('自动取ali-token失败' + e.message);
    }
}
let headers = {
    "content-type": "application/json;charset=UTF-8",
    "origin": "https://www.aliyundrive.com",
    "referer": "https://www.aliyundrive.com/",
    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36 Edg/110.0.1587.41"
};
let userinfo = {};
if (alitoken) {
    let nowtime = Date.now();
    let oldtime = parseInt(getMyVar('userinfoChecktime', '0').replace('time', ''));
    let aliuserinfo = storage0.getMyVar('aliuserinfo');
    if (aliuserinfo && aliuserinfo.user_id && nowtime < (oldtime + 2 * 60 * 60 * 1000)) {
        userinfo = aliuserinfo;
    } else {
        userinfo = JSON.parse(request('https://auth.aliyundrive.com/v2/account/token', { headers: headers, body: { "refresh_token": alitoken, "grant_type": "refresh_token" }, method: 'POST', timeout: 3000 }));
        headers['authorization'] = 'Bearer ' + userinfo.access_token;
        let json = JSON.parse(request('https://user.aliyundrive.com/v2/user/get', { headers: headers, body: {}, method: 'POST', timeout: 3000 }));
        delete headers['authorization'];
        userinfo.resource_drive_id = json.resource_drive_id;
        storage0.putMyVar('aliuserinfo', userinfo);
        putMyVar('userinfoChecktime', nowtime + 'time');
        aliconfig.refresh_token = userinfo.refresh_token;
        writeFile(alicfgfile, JSON.stringify(aliconfig));
    }
}
function getUserInfo() {
    let account = JSON.parse(request('https://auth.aliyundrive.com/v2/account/token', { headers: headers, body: { "refresh_token": alitoken, "grant_type": "refresh_token" }, method: 'POST', timeout: 3000 }));
    if(account.refresh_token){
        headers['authorization'] = 'Bearer ' + userinfo.access_token;
        let user = JSON.parse(request('https://user.aliyundrive.com/v2/user/get', { headers: headers, body: {}, method: 'POST', timeout: 3000 }));
        delete headers['authorization'];
        account.resource_drive_id = user.resource_drive_id;
    }
    return account;
}

function getShareToken(share_id, share_pwd) {
    return JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })) || {};
}

function SortList(v1, v2) {
    var a = v1.name;
    var b = v2.name;
    var reg = /[0-9]+/g;
    var lista = a.match(reg);
    var listb = b.match(reg);
    if (!lista || !listb) {
        return a.localeCompare(b);
    }
    for (var i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
        //数字所在位置序号
        var indexa = a.indexOf(lista[i]);
        var indexb = b.indexOf(listb[i]);
        //数字前面的前缀
        var prefixa = a.substring(0, indexa);
        var prefixb = a.substring(0, indexb);
        //数字的string
        var stra = lista[i];
        var strb = listb[i];
        //数字的值
        var numa = parseInt(stra);
        var numb = parseInt(strb);
        //如果数字的序号不等或前缀不等，属于前缀不同的情况，直接比较
        if (indexa != indexb || prefixa != prefixb) {
            return a.localeCompare(b);
        }
        else {
            //数字的string全等
            if (stra === strb) {
                //如果是最后一个数字，比较数字的后缀
                if (i == minLen - 1) {
                    return a.substring(indexa).localeCompare(b.substring(indexb));
                }
                //如果不是最后一个数字，则循环跳转到下一个数字，并去掉前面相同的部分
                else {
                    a = a.substring(indexa + stra.length);
                    b = b.substring(indexa + stra.length);
                }
            }
            //如果数字的string不全等，但值相等
            else if (numa == numb) {
                //直接比较数字前缀0的个数，多的更小
                return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '');
            }
            else {
                //如果数字不等，直接比较数字大小
                return numa - numb;
            }
        }
    }
}

eval(fetch('http://124.221.241.174:13000/src48597962/hkbak/raw/branch/main/SrcJyAliPublic.js'));
/*
evalPrivateJS('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')
evalPrivateJS('LMUBjarZ5eOGA/z1aks6fNNBHPn4N+xNr5JpUh71s2P9e+J6BhEF12L8JFIfeYrnj+pMPdP2pq4RTyQYWwSCW/sOK+rmBauO+krr6G4ZSFJJip1lnwRp5U0SlNnMPprAKRKZd4Xc8EjVNXtU52rrJyvTslFW+6IB6F7e+ZQcMLWXHDzPr8DhpqWtwlHSl/J7bm0zyFdNCMBNz+bshPrQ+2Ccc+o+9HYwJZF4Xr22fbxPofr78yZtiAesfyXfQWNJwK6DNmkTU5DPkvudQ1AhH/yi13Mxl3/uD3ZsxyU6zbT1Mu2UlK2xneR1t5/BvtBTqhRiPrQga5hTn8zUndb+UITqqus1WM6i/UgSbTGXO5GLj7nZJF52wHiKL0080i880r4mq2fxGB023PONLmotZLacEaU3/M9ueY+oS0UXKMotu/M/JeAtoBLWZ3FQWcvd1RWMTjiwyjnPwPrJKWlfGjr/SJSbqqWr+FOWoTEoihRaZeijIvoY8gy23KhUYUS518AET2q4bx6umujrPN/yC8lcVAoLvAT2+cg2mzTotw7nES3ozs27AJjLVmdlrs95dLmMjOP+JOxdZZ2eMqZC5+GW3197+MPzCDb3TFCtYfXapXOkx74oZzf4aAvpZqZBl3my7OiwPOwM2kwHkH5h2f6PmQpB07o1j1sbFWauQgKF8as9jaqeJ5gwTmapYfqwdVrYb3g47BouzJZwxcbM5BTPqQNwm7edPWihLSmVu/IELswYXuh2GrFEcUlokDotq04ZPObIW3qiqUpYhcod6aRIx/latzA0g9peSr++2MskHPcc7Gg8La6oOH6Xyh1HzQFQqF/n+zvmKMsB0u5o88sVWxOaJcgWL4SCyjK+XNwdsEaOxtrgt1ZnjcJk25dF3YCE32+eaXCqHeAv/b9Ks9I21Up2Oy0cN2rBbIjdSG+F62+Tf14tEUzDoubyMcH0D54Y3eScGoiYn+jcGZZNNyoJvKjDAWWYevfaFAteZjDFOoY+Ru5FheivqWGeX+/gQ2twlISxIxj2daPde/hhrBoo5x3w2i5XA3V+VGteWtaHNIhZD0YYRRyHiliH5Ai/dBGeDAIR5VNht6cjhKkVuv5eh7ssv7ZloOjj/LKeRVHA/tyVFxnMda0oBbITvxFyNYh3/AwaD5ttjaNRkIzwAvkDyPa4TO/la1K+pxgt8IvXDy8Gyvdxun6nnYjuQBDRHA8nsifnMZxiOgVACYfaKkOYoggul44zIZ61LroFgXJQtjGODZkhzSNKeYdg59JI14kGluxMmTzjKen9KxNs4i7akCHE2MA42z7j7Q05T2nBUP78UtnBeCsWlTH4r+9iyYtkGfP69N7zGyhXiFP0mTfCoSu09U1N4X7QsJGV/Iu2bgf8Z1avEihrMChOdufyGtdy71PxTuWpChq2HF6Un034ertyAKlCFi+/jnqYrSH6QayrRihIdV2dyU9p4mWxga77Cb+KtlpNCPff5CyMdNmhmgHZ50gKqP5J65eV5gBkww8Rp92Dpsv/C4xunNht7rvPMWHz4HaQQgzu8CZwv+sze02L2rUg8kciuzKzvaPE1juNZ2M8KuC1G82AuYdJY+zFmj/hJ6sGZXd5sake5PEYyFjDhIwDxrYXzpT5WRNtYli5JOFnwZBPfv/P8FJC0LbI1oQdOw+2q+TbnphYKw==')
evalPrivateJS('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')
evalPrivateJS('rhiz2Ll8wYnkCoIzJ/nTsBjQ/xZMODzvvtPniw+kAOLskUtISUP3bxLpce3nKwueKIRVgYJSl08ETl80Jugl4F61PEurKDXlGxDMMHTL7RX8xTEGMNCtr0CEz49SZNWjtFkzEGIq6pS3iLCILVd6h1sXtv/FScNv6NQQYlEIjW7WckFOqjGXn5HhlATkGQmmI1EWoJap43XP6z2HXrfh5HPNQbw/933iqfRa243hJYIL6fJpsd+n6HeYwtsHeHyAxfdqU5xQ/t3qEKlJkFEe6vOim/J4bolr+llOV9zAzyQlOr87N9FqSc66i/RJE2F+bhNexmDWYJ7nSa5Mu7tJLobDHkrfhtAxMIjqVxhAbSEQBsXvnXqADx+tMzaouNlVNzR39IauZT5MTxg27GUvcrglO55YXEF4LbzEgRKyZMicJjMySIHRHuxwim//kUHi3aqcdMJn8ZWOU2XRDACg2tV1sa68SyxPNnELh+GUmhDVfpwUogbzvU6IOZFzyb/cZFav+GjMbELFXVsEScTxPNIUGfEaEZiBh5xCOkgSX/pDTPasqDWRvNAITLc278UjcTc0JNfImDzjhOpLjlQXIB0NVgkOUtJdDatVz9fPTK7cC43OcjUbaafVS6/CLNFY9TIYhUDPX+63hLPe/ehInUOYoggul44zIZ61LroFgXJkPhmKX38Iq9fo1ckazTTrzgfLOgokcFCuSjvOzY2gC9hckltXGlL3yJJCLun9ukWdr7qZuBze+ajkNNwx6XnQ3qwNIomKsMHvZWOxsecIh/2+s6xtNwvgpLCjs31QiTo7ndI3GbUiX52RjPdXxUwP5nAI6zJFY4ZUk9qN720ivyP4YTAlL/pq+GTrRcnJ6Onn/qlEN4ufoPzM/iyBS43xgfe5VVsJAXC6mBkIugIOPdJY9TDaaj6Ueklop127uO7gkUQvX+nvSeXoMNLVOamzhXhI/6LPhynbzYi9wNqO87oP9wyUmJc5yDg2cSrlQLWAiEIxo/sD5CAufPWZjf4UwhJ9JpfNKRNfu6QuAFq4crxFEle747biNmdp5LQAzXQRGjjZyFcJQ/Q6aJbv0LpEqbBVB5/GWsqkOB/OEP50wSO113sy5hdBjgwJ9Z4yKNh9ZQ68CqLFWVNDPZZsX0rIl6lf/AH/8YeCynxIKFVOFfkssl8guxV9Mkdo8hwhG1RxuSEyBToJssTWjhbL7NpECX1wmA1nx74v74I8/9OGPw==')
evalPrivateJS('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')
evalPrivateJS('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')
*/