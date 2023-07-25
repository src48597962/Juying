let alistfile = "hiker://files/rules/Src/Juying/Alist.json";
try {
  if(fetch(alistfile)){
    eval("var alistData = " + fetch(alistfile));
  }else{
    var alistData = {};
  }
} catch (e) {
  var alistData = {};
}
let alistconfig = alistData.config || {};
let fileFilter = alistconfig['fileFilter'] == 0 ? 0 : 1;
let audiovisual = alistconfig.contain ? alistconfig.contain.replace(/\./, "") : 'mp4|avi|mkv|rmvb|flv|mov|ts|mp3|m4a|wma|flac';//影音文件
let contain = new RegExp(audiovisual, "i");//设置可显示的影音文件后缀
let music = new RegExp("mp3|m4a|wma|flac", "i");//进入音乐播放器
let image = new RegExp("jpg|png|gif|bmp|ico|svg", "i");//进入图片查看
let transcoding = {UHD: "4K 超清", QHD: "2K 超清", FHD: "1080 全高清", HD: "720 高清", SD: "540 标清", LD: "360 流畅" };
let alitoken = alistconfig.alitoken;
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
      alistconfig.alitoken = alitoken;
      alistData.config = alistconfig;
      writeFile(alistfile, JSON.stringify(alistData));
    }
  } catch (e) {
    log('自动取ali-token失败' + e.message);
  }
}
let headers = {
  'content-type': 'application/json;charset=UTF-8',
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
    storage0.putMyVar('aliuserinfo', userinfo);
    putMyVar('userinfoChecktime', nowtime + 'time');
    alistconfig.alitoken = userinfo.refresh_token;
    alistData.config = alistconfig;
    writeFile(alistfile, JSON.stringify(alistData));
  }
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

evalPrivateJS('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')
evalPrivateJS('LMUBjarZ5eOGA/z1aks6fNNBHPn4N+xNr5JpUh71s2P9e+J6BhEF12L8JFIfeYrnj+pMPdP2pq4RTyQYWwSCW/sOK+rmBauO+krr6G4ZSFJJip1lnwRp5U0SlNnMPprAKRKZd4Xc8EjVNXtU52rrJyvTslFW+6IB6F7e+ZQcMLUaqWsEiqekcWERkauvRTo82E9FCWCToNkSocKnAog109gHJpRyC8vyMnXfyzvM3hXRE4DP9j8Wf+lkHsvPADRYGlMSM86YzsGPGMrinusmZhtq512Ahuji0YLOrCjDMzf/NwghsA0Hxb7dycAQ5nrt/f+WcVWvNzpq3WU9GFxPANzOe+4V3SV12rYacxfR5+XGTUjUFvzUqXDoIy5HAEzV83O62M7p0qL+E/rrq6SrNLHkBzEPbNHlmF1APsj9KgGIEtfHmCYIrmM6UAnsfraXti/L1WBHk2scP8Sy9nluAJZ0NFCkUNRt97DCr2Iiu5/sLjhXjCAhglvL52p6K0Jot3UBtfRZkBaWcyB2QazQCr3VaBUdvtmG0d3Shf8X7SgMwNHObnG6GR2a/YUBjnaxts6BjzYiSNv9R5/zExdFFr0WILdCk+3+Jri40/XWxNAVKD69/zXFEQD/eiLwiyYpM/rOwMCCsEWSTKozGHXzdIA//kEOUX3pTgEGRfk7e6dTptDZu3sjVdOExCG9S+7rOiy+O5z69fiL2kQtFWjVbvZPrhzoWyhTSfA7Q3zFtBmXQ+h6KrkEbcZW7x5QYqH32hClG4LJph+8f/4njFniNnGo5ihco9+0gaQK6XaY4o8HvtUM261ox3hzZB4k/iEIr+BuBU5iNA99GujAQtZ7eUjoS2SFAvPRZyV0dki9bDQYtG2wIP9SDdOVHFjtG4IoM4mWphrEMdCZr2n/Hfhixc4EVwQzflbPaw9GlytCabS6lTpKjJfHTYojK0+4XLBWxMWKTXGWQrhh0YzVSLy7yBTQHyGlIiPdwQ24QKWkVlq5UYRBCaqhZUhCkLNRV0qqepc215u0pd5yGMmopIDkSQSDtQgzT1k2IJfV0oNzfSL5cbTY5jjIJYCoKtKgMRnbXYd7KatHeOlodWKScxekMptZ5+ksl087btqD6P+DySZpw+DKfxDFaVu3bqNH/IJCcWzQpzMchsh2KRgOaK8CX7Ebxe3JeWyY159pgDTr7ChtFlU5gqlpBe3K6NDUKhQtaavISc0dqyV0OIpu2dH7wzMH7jxEwtRxTcvcmIymdsbw/10c3/ZMBF8OzuSBeKIRn63gPrIJZ3udFLGEAiGMA4z2v9c1fhIjcwI4MZAsBY/m9t74/8rBpcGwGrDxgc7kFYJCQ4PQcLr+34tjE3qnmGvC4ly8nx0r7xJVpKjMfAT80XpJAguQX6t5u0EJAbAKMdpjeNsdwAtZSEP4kejrQfGc4TiyezUOexy7awqQBMC86AX2GyV5H+q6Rc76n+NlAalHLx514FWYXR+7zEJagq/TKTobf5Fn5KO8b2XO0nleVwy56S+SLaYug3dZeZwVB4VPjcY5xqKDTA27yCB0pxfdLeJPTxSQRuSccRwhvdB6S3xNQOXLi/1R489eA0TZOttEmPS6qr8nTDjhMyViK5qHASp9I0/4ANBz0IV4+FGyW2+Xqob5Es6lYwA5Y0wORLd7FHgTVCezXO9vJs6LYfoAWOy4LHPRh3jFKMw5iJxEpMmjVlt7egB5vZafEACUDZ7+1kd4zo4qEbMCpapRNv3o+YeaviddZVSOBPcnOdVnL11wyZiKhvkMoHbUMh7S6kMWobRKkGrMavKzJXhlPN7jbBo++jZbAPQ2sSsEArGK5rupc1DPblPZ1jopKePghdGUf8HJImHQJT3X5Ey0iA==')
evalPrivateJS('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')
evalPrivateJS('rhiz2Ll8wYnkCoIzJ/nTsBjQ/xZMODzvvtPniw+kAOLskUtISUP3bxLpce3nKwueKIRVgYJSl08ETl80Jugl4F61PEurKDXlGxDMMHTL7RX8xTEGMNCtr0CEz49SZNWjtFkzEGIq6pS3iLCILVd6h1sXtv/FScNv6NQQYlEIjW7WckFOqjGXn5HhlATkGQmmbAMBJ0g/ouwqhIYNv1nH7aM4kSMYV2Nhe5VOaRJSBslqZw1YGcjXBGsYZxkC5TAkNDhSCR42A5to1wbVLxZKSf3fgoHgw+KOnjR8TJQCUbpri8ThGahcNNwT6KOSNgCmj51XEqoS0TCPxASkthcPtwtXvqepUwN0J4Yw+u9NTlvflx/heN21C99lmN6yaas6yJsPThBcAo3jemTHDB7XMnQ+kKPA/ewnSU7+1H4yZwcBUB10+Nc8wgA9X4E0J+ewhsMeSt+G0DEwiOpXGEBtIRKy/iVnqtMQRHPnsgOHcrcDt4Gsvz6HPt96e5z8iZf2Fc0QL3h6ttzoWhQe+QQBCBFWQZjj+wKwO2CrO+QquMGCMhBruPZ5ABGNRpVUhwpnmR18bApwPylzNvJ914epBb/09vaSV+tfD47g2MlmcF+TBjKMDhcSh/12ulK4mptYKEIgtITWO2Mn93gIo6W3SkSKPMO1aVMeCV9p192nn4hGHJQ6cgvJLxuzG//iZFEHJRUx6gpdXp9veuxHmi+lIC+TP/eMEIDVk3lRdLXnGrnq7urLKf6lq6QNwOklKE19gD21NChrlzhsUyUvCeSgiCcmHkeKYnBhGEmFlIGVlF4cppbtPp2BI9D1kolcTb6Is5hJwU0CkNeJK8EOorKLBPGc4TiyezUOexy7awqQBMCsDufyvWgQcfbloZLTORi+eH0xEUpkbnodXZDU3iyB5J/yFAm5Jb3i5Ww7pn3Zf6YZs/I3FMl5/kulM5NVyRyTB088OtOSYYMg5mO2aFegK2I+D7xW4B/cbZvQJExnMhrdH06FQRAhdSUhJ8/w0oWAhpdv0H0PhSOvsjecGSw9SNfRjYo05I5g2mEwdWDZKRLDrFg1/S+l7Scp8MySX2akWrNfxgLEW8eke5mEB9TdYCc9AVrboRipAaKzxoSpQFb9mdlA3soj51zHS6lrtoPN+WyDjTwnoS9w7qe+S4G9H2wjzQDvBSkejIRiP94UehCetAi+msmNwhmFBlm0ddPYHv/ZAzAXxVjF7aZ3WAMVLss2bRHaDWQEWdbAYoFZTESK5rupc1DPblPZ1jopKePg+H3uTEZaUseDUBvTCuKj/jfg5PibCBWaIHA8QOJwn/pjnx4YK/dfTaam0j4AJfVU7Lw531KsW0hIg5RSZs8cCghhJyUZfdag0LPi1xJdDjLO0MEYF8rSSDUpJSVYQuMR')
evalPrivateJS('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')
//evalPrivateJS('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')
function aliOpenPlayUrl(file_id,sharedata) {
  try {
    function getopentoken(authorization) {
      headers['authorization'] = authorization;
      headers['x-canary'] = "client=web,app=adrive,version=v4.3.1";
      let data = {"authorize":"1","scope":"user:base,file:all:read,file:all:write"}
      let json = JSON.parse(request('https://open.aliyundrive.com/oauth/users/authorize?client_id=76917ccccd4441c39457a04f6084fb2f&redirect_uri=https://alist.nn.ci/tool/aliyundrive/callback&scope=user:base,file:all:read,file:all:write&state=', { headers: headers, body: data, method: 'POST', timeout: 8000 }));
      let code = json.redirectUri.split("code=")[1];
      let data2 = {"code":code,"grant_type":"authorization_code"}
      let json2;
      try{
        json2 = JSON.parse(request('https://api-cf.nn.ci/alist/ali_open/code', { body: data2, method: 'POST', timeout: 8000 }));
      } catch(e) {
        json2 = JSON.parse(request('https://api.xhofe.top/alist/ali_open/code', { body: data2, method: 'POST', timeout: 8000 }));
      }
      return json2.access_token || "";
    }
    function fcopy(obj) {
        try {
            let json = JSON.parse(fetch('https://api.aliyundrive.com/adrive/v2/batch', {
                headers: {
                    'User-Agent': PC_UA,
                    'Referer': 'https://www.aliyundrive.com/',
                    'authorization': obj.authorization,
                    'x-canary': 'client=web,app=share,version=v2.3.1',
                    'x-share-token': obj.sharetoken
                },
                body: {
                    "requests": [{
                        "body": {
                            "file_id": obj.file_id,
                            "share_id": obj.share_id,
                            "auto_rename": true,
                            "to_parent_file_id": "root",
                            "to_drive_id": obj.drive_id
                        },
                        "headers": {"Content-Type": "application/json"},"id": "0","method": "POST","url": "/file/copy"
                    }],
                    "resource": "file"
                },
                method: 'POST'
            })).responses[0].body;
            if(/size/.test(json.message)){
                log('云盘没有空间，无法操作转存');
            }
            return json.file_id;
        } catch (e) {
            return "";
        }
    };
    function fdel(obj) {
        fetch('https://api.aliyundrive.com/adrive/v2/batch', {
            headers: {
                'User-Agent': PC_UA,
                'Referer': 'https://www.aliyundrive.com/',
                'authorization': obj.authorization,
                'x-canary': 'client=web,app=share,version=v2.3.1',
                'x-share-token': obj.sharetoken
            },
            body: {
                "requests": [{
                    "body": {
                        "drive_id": obj.drive_id,
                        "file_id": obj.file_id
                    },
                    "headers": {"Content-Type": "application/json"},
                    "id": obj.file_id,
                    "method": "POST",
                    "url": "/file/delete"
                }],
                "resource": "file"
            },
            method: 'POST'
        });
    }
    let authorization = 'Bearer ' + userinfo.access_token;
    let drive_id = userinfo.default_drive_id;
    let newfile_id;
    if(sharedata){
      sharedata.file_id = file_id;
      sharedata.drive_id = drive_id;
      sharedata.authorization = authorization;
      newfile_id = fcopy(sharedata);
      if(!newfile_id){
        return "";
      }
    }
    let url = '';
    try{
        let opentoken;
        let nowtime = Date.now();
        let oldtime = parseInt(getMyVar('opentokenChecktime', '0').replace('time', ''));
        let aliopentoken = getMyVar('aliopentoken');
        if (aliopentoken && nowtime < (oldtime + 1 * 60 * 60 * 1000)) {
          opentoken = aliopentoken;
        } else {
          opentoken = getopentoken(authorization);
          putMyVar('aliopeninfo', opentoken);
          putMyVar('opentokenChecktime', nowtime + 'time');
        }
        headers['authorization'] = 'Bearer ' + opentoken;
        let data3 = {"drive_id":drive_id,"file_id":newfile_id||file_id}
        let json3 = JSON.parse(request('https://open.aliyundrive.com/adrive/v1.0/openFile/getDownloadUrl', { headers: headers, body: data3, method: 'POST', timeout: 8000}));
        url = json3.url;
    }catch(e){
      log('获取原画播放地址失败>' + e.message);
    }
    if (newfile_id) {
        sharedata.file_id = newfile_id;
        fdel(sharedata);
    }
    return url;
  } catch (e) {
    log('获取我的云盘原画出现异常>' + e.message);
  }
  return "";
}