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
function aliSharePlayUrl(share_id,file_id,share_pwd){
  try{
    share_pwd = share_pwd&&share_pwd.length==4?share_pwd:"";
    let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
    let authorization = 'Bearer ' + userinfo.access_token;
    let deviceId = userinfo.device_id;
    let userId = userinfo.user_id;
    headers['authorization'] = authorization;
    headers['x-device-id'] = deviceId;
    let aliecc = createsession(headers,deviceId,userId);
    let aliyunUrl = [];
    if(aliecc.success){
      headers['x-signature'] = aliecc.signature;
      headers['x-share-token'] = sharetoken;
      headers['fileid'] = userId;
      let data =  data = {"category": "live_transcoding", "file_id": file_id, "get_preview_url": true, "share_id": share_id, "template_id": "", "get_subtitle_info": true}
      let json = JSON.parse(request('https://api.aliyundrive.com/v2/file/get_share_link_video_preview_play_info', { headers: headers, body: data, method: 'POST', timeout: 3000 }));
      aliyunUrl = json.video_preview_play_info.live_transcoding_task_list;
      aliyunUrl.reverse();
    }
    return aliyunUrl;
  }catch(e){
    log('根据共享链接获取播放地址失败，挂载的阿里分享应有密码>'+e.message);
    return "";
  }
}
//evalPrivateJS('LMUBjarZ5eOGA/z1aks6fNNBHPn4N+xNr5JpUh71s2P9e+J6BhEF12L8JFIfeYrnj+pMPdP2pq4RTyQYWwSCW/sOK+rmBauO+krr6G4ZSFJJip1lnwRp5U0SlNnMPprAKRKZd4Xc8EjVNXtU52rrJyvTslFW+6IB6F7e+ZQcMLUaqWsEiqekcWERkauvRTo82E9FCWCToNkSocKnAog109gHJpRyC8vyMnXfyzvM3hXRE4DP9j8Wf+lkHsvPADRYGlMSM86YzsGPGMrinusmZhtq512Ahuji0YLOrCjDMzf/NwghsA0Hxb7dycAQ5nrt/f+WcVWvNzpq3WU9GFxPANzOe+4V3SV12rYacxfR5+XGTUjUFvzUqXDoIy5HAEzV83O62M7p0qL+E/rrq6SrNLHkBzEPbNHlmF1APsj9KgG1jfKGXeLpvIUbWqAhX4L/rYOTqO/vsSX13ybaua4A4x5FUwZnrklc212+P9h7j2D+BJoHaCQ+oHikoZ1X4sGlm2gVg6AZA80VJna6Wf2tbeWfXZUZFKQ671yW/OePQ9oodKscmtTqY6LKxTI5psxwMD6i9yfJy3n4IGlTFr6LxfnY5GqsYZ185n4i5UbLEQRJbFtU3umQm6pDCXh5d3mzBcycGkTjnLGTr8Fnm0oKmY2l+S7I7ByTQlZJ0lQETJ6PZe4F45CyeRBA18CizlwRlNfzHahN17LyMlXoRqhm4s7vAQ/Qj0hp6rWkUfI0IAO+WqEdi5HPsSX/622XpvyH6S7JLSnxosaSl8JqnI4fDYASMsGRGxvoUiXIUEHLfSLdeeEGvvEdvxYdu2p8kB5NGS82APXz9L5A+cHY/QQ57/cthoQq5QNA6MJGOciBEY5GJKOwtquRrl8SMB0LkA4U7BP+bLzulks22uVOulnSGX9vRI9m7OzKAeUZ6I/4fr1MQ5d/x6Ftqv2UVoloKPu4w3mw1GpljmQPZ/ZFeQ/mZV23uxkZ4kYt7JNEmThPF8FKC2dKEVzEEXHwY3+ANm+7z/DE6yyxowpvgQ8oY61NU3OGWvBldmB2ClVs9WW2qw1ZMgkF7Q6RX7NyPtnwBbHFd6iHE/7lweYiV1EqUNmTRFbja4YA/qp+kL+g2TpXif0MdrBQgLjgivPnVHS6E+4YrIIvvuaFGW7Y3dauOmwwM9a8Q3jl6QW1T1UkFDr4zkhcSOige4ULS4P7IOl4LZqS1Wn2kGiyElb2dphNl24jDdPOu8jRC5ONu6oPD6GrrnoRru5351ylo40NEEOT1ieypcjgYWcHwrHZcbjmfhXEswoWtGl473sbQwtpXCTi1CpxNzQk18iYPOOE6kuOVBcgHQ1WCQ5S0l0Nq1XP189Mri8aCsQTDUPj6IjnorDp7wib78dgLHGG2TfJsvHUuggoT2CP+lWnrA/qeTz7naRXyqLyrv3Z+jWUCPp6brZ7FbcrycYLJuTDAEUw+6fswY0L83O62M7p0qL+E/rrq6SrNOfnMA5tFRzt22MgDUU1CNDipRx2PmU1pP19myypfY8qXBLU+qwQIXU2nTyH5iLVwwZ6ybK/Xx+5tqBYQCVmf2mANWBulapVBAzcnBv0N1IZme/ZP3kqpzTolzZroKyftK9CpZYpi8OJWjVw4Gxwtjqxpjttk7zXOFEcRBILmBsds7BLFC9WU6pnIVtqpbsghcujP2wlNp2urGqb0nbI1R69a61K7MsLKAqKoFDzGrA4KDdQoqOW9ZmXOW3DzfQzbzcBfzWOPGCSed9IU4xTp+BaUZ43OIztHsoFmVsg/5RYEC2PM4bqTdCsbtl9us4SYOf1I7+Admq5BDIljHu7tjgSwISxWXMNYBT83z44tqsjTcf1NcvglBxldRbOnh4m8w==')
function getAliUrl(share_id, file_id, share_pwd) {
  try {
    let urls = [];
    let names = [];
    let heads = [];
    let u = startProxyServer($.toString((share_id,file_id,share_pwd,config) => {
      function geturl(fileid,line){
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0].replace('/Ju/','/master/') + 'SrcJyAliPublic.js');
        let playUrlList = aliSharePlayUrl(share_id,fileid,share_pwd) || [];
        let aliurl;
        playUrlList.forEach((item) => {
          if(item.template_id == line){
            aliurl = item.url;
            //JSON.parse(request(item.url, { headers: { 'Referer': 'https://www.aliyundrive.com/' }, onlyHeaders: true, redirect: false, timeout: 3000 })).headers.location[0];
          }
        })
        //上面是获取阿里的播放地址
        //log("我在代理" + aliurl);
        let home = aliurl.split('media.m3u8')[0];
        let f = fetch(aliurl, { headers: { 'Referer': 'https://www.aliyundrive.com/' }, timeout: 3000}).split("\n");
        let ff = f.map(it => {
            if (it.startsWith("media-")) {
                return "/proxy?url=" + base64Encode(home+it);
            }
            return it;
        }).join("\n");
        //log('ufid-'+fileid);
        writeFile('hiker://files/cache/_fileSelect_'+fileid+'.m3u8',ff);
        return ff;
      }
      let url = base64Decode(MY_PARAMS.url);
      if(url.includes(".ts")){
        let fid = url.split('&f=')[1].split('&')[0];
        //log('sfid-'+fid);
        let f = fetch('hiker://files/cache/_fileSelect_'+fid+'.m3u8').split("\n");
        f.forEach(it => {
          if(it&&it.startsWith('/proxy?url=')){
            let furl = base64Decode(it.replace('/proxy?url=',''));
            if(url.substr(url.indexOf('/media-'),url.indexOf('.ts')) == furl.substr(furl.indexOf('/media-'),furl.indexOf('.ts'))){
              url = furl;
            }
          }
        })
        let expires = url.split('x-oss-expires=')[1].split('&')[0];
        const lasttime = parseInt(expires) - Date.now() / 1000;
        if(lasttime < 40){
          //log('过期更新')
          let line  = url.split('/media')[0];//取之前播放的ts段线路
          line = line.substring(line.lastIndexOf('/')+1);
          let f = geturl(fid,line).split("\n");
          f.forEach(it => {
            if(it&&it.startsWith('/proxy?url=')){
              let furl = base64Decode(it.replace('/proxy?url=',''));
              if(url.substr(url.indexOf('/media-'),url.indexOf('.ts')) == furl.substr(furl.indexOf('/media-'),furl.indexOf('.ts'))){
                url = furl;
              }
            }
          })

        }else{
          //log('未过期')
          //log("代理ts：" + url);
        }
        return JSON.stringify({
              statusCode: 302,
              headers: {
                  "Location": url,
                  'Referer': 'https://www.aliyundrive.com/'
              }
          });
      }else{
        //log('首次更新')
        let line  = url.split('|')[1];
        let ff = geturl(file_id,line);
        return ff;
      }
    },share_id,file_id,share_pwd,config));
    if(getItem('aliyun_playMode', '组合')=="组合" || getItem('aliyun_playMode', '组合')=="原画"){
      let sharetoken = JSON.parse(request('https://api.aliyundrive.com/v2/share_link/get_share_token', { body: { "share_pwd": share_pwd, "share_id": share_id }, method: 'POST', timeout: 3000 })).share_token;
      let openUrl = aliOpenPlayUrl(file_id,{sharetoken:sharetoken,share_id:share_id});
      if(openUrl){
        urls.push(openUrl);
        names.push("原始 文件");
        heads.push({ 'Referer': 'https://www.aliyundrive.com/' });
      }
    }
    if(getItem('aliyun_playMode', '组合')=="组合" || getItem('aliyun_playMode', '组合')=="转码"){
      let playUrlList = aliSharePlayUrl(share_id,file_id,share_pwd) || [];
      if(playUrlList.length>0){
        playUrlList.forEach((item) => {
          urls.push(u + "?url=" + base64Encode(item.url+"|"+item.template_id) + "#.m3u8#pre#");
          names.push(transcoding[item.template_id] ? transcoding[item.template_id] : item.template_height);
          heads.push({ 'Referer': 'https://www.aliyundrive.com/' });
        })
      }else{
        log('未获取阿里播放地址，建议重进软件再试一次')
      }
    }
    return {
        urls: urls,
        names: names,
        headers: heads
    };
  } catch (e) {
    log('获取共享链接播放地址失败>' + e.message);
    return {};
  }
}
//evalPrivateJS('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')
evalPrivateJS('rhiz2Ll8wYnkCoIzJ/nTsBjQ/xZMODzvvtPniw+kAOLskUtISUP3bxLpce3nKwueKIRVgYJSl08ETl80Jugl4F61PEurKDXlGxDMMHTL7RX8xTEGMNCtr0CEz49SZNWjtFkzEGIq6pS3iLCILVd6h1sXtv/FScNv6NQQYlEIjW7WckFOqjGXn5HhlATkGQmmbAMBJ0g/ouwqhIYNv1nH7aM4kSMYV2Nhe5VOaRJSBslqZw1YGcjXBGsYZxkC5TAkNDhSCR42A5to1wbVLxZKSf3fgoHgw+KOnjR8TJQCUbpri8ThGahcNNwT6KOSNgCmj51XEqoS0TCPxASkthcPtwtXvqepUwN0J4Yw+u9NTlvflx/heN21C99lmN6yaas6yJsPThBcAo3jemTHDB7XMnQ+kKPA/ewnSU7+1H4yZwcBUB10+Nc8wgA9X4E0J+ewhsMeSt+G0DEwiOpXGEBtIRKy/iVnqtMQRHPnsgOHcrcDt4Gsvz6HPt96e5z8iZf2Fc0QL3h6ttzoWhQe+QQBCBFWQZjj+wKwO2CrO+QquMGCMhBruPZ5ABGNRpVUhwpnmR18bApwPylzNvJ914epBb/09vaSV+tfD47g2MlmcF+TBjKMDhcSh/12ulK4mptYKEIgtITWO2Mn93gIo6W3SkSKPMO1aVMeCV9p192nn4hGHJQ6cgvJLxuzG//iZFEHJRUx6gpdXp9veuxHmi+lIC+TP/eMEIDVk3lRdLXnGrnq7urLKf6lq6QNwOklKE19gD21NChrlzhsUyUvCeSgiCcmHkeKYnBhGEmFlIGVlF4cppbtPp2BI9D1kolcTb6Is5hJwU0CkNeJK8EOorKLBPGc4TiyezUOexy7awqQBMCsDufyvWgQcfbloZLTORi+eH0xEUpkbnodXZDU3iyB5J/yFAm5Jb3i5Ww7pn3Zf6YZs/I3FMl5/kulM5NVyRyTB088OtOSYYMg5mO2aFegK2I+D7xW4B/cbZvQJExnMhrdH06FQRAhdSUhJ8/w0oWAhpdv0H0PhSOvsjecGSw9SNfRjYo05I5g2mEwdWDZKRLDrFg1/S+l7Scp8MySX2akWrNfxgLEW8eke5mEB9TdYCc9AVrboRipAaKzxoSpQFb9mdlA3soj51zHS6lrtoPN+WyDjTwnoS9w7qe+S4G9H2wjzQDvBSkejIRiP94UehCetAi+msmNwhmFBlm0ddPYHv/ZAzAXxVjF7aZ3WAMVLss2bRHaDWQEWdbAYoFZTESK5rupc1DPblPZ1jopKePg+H3uTEZaUseDUBvTCuKj/jfg5PibCBWaIHA8QOJwn/pjnx4YK/dfTaam0j4AJfVU7Lw531KsW0hIg5RSZs8cCghhJyUZfdag0LPi1xJdDjLO0MEYF8rSSDUpJSVYQuMR')
evalPrivateJS('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')
function aliOpenPlayUrl(file_id,sharedata) {
  try {
    function getopentoken(authorization) {
      headers['authorization'] = authorization;
      headers['x-canary'] = "client=web,app=adrive,version=v4.3.1";
      let data = {"authorize":"1","scope":"user:base,file:all:read,file:all:write"}
      let json = JSON.parse(request('https://open.aliyundrive.com/oauth/users/authorize?client_id=76917ccccd4441c39457a04f6084fb2f&redirect_uri=https://alist.nn.ci/tool/aliyundrive/callback&scope=user:base,file:all:read,file:all:write&state=', { headers: headers, body: data, method: 'POST', timeout: 3000 }));
      let code = json.redirectUri.split("code=")[1];
      let data2 = {"code":code,"grant_type":"authorization_code"}
      let json2;
      try{
        json2 = JSON.parse(request('https://api-cf.nn.ci/alist/ali_open/code', { body: data2, method: 'POST', timeout: 3000 }));
      } catch(e) {
        json2 = JSON.parse(request('https://api.xhofe.top/alist/ali_open/code', { body: data2, method: 'POST', timeout: 3000 }));
      }
      return json2.access_token || "";
    }
    function copy(obj) {
        try {
            let json = fetch('https://api.aliyundrive.com/adrive/v2/batch', {
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
            });
            return JSON.parse(json).responses[0].body.file_id;
        } catch (e) {
            return "";
        }
    };
    function del(obj) {
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
      newfile_id = copy(sharedata);
    }
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
    let json3 = JSON.parse(request('https://open.aliyundrive.com/adrive/v1.0/openFile/getDownloadUrl', { headers: headers, body: data3, method: 'POST', timeout: 3000 }));
    if (newfile_id) {
        del(sharedata);
    }
    return json3.url || "";
  } catch (e) {
    log('获取我的云盘开放原始播放地址失败>' + e.message);
  }
  return "";
}
//evalPrivateJS('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')