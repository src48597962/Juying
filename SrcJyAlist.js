//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
let alistfile = "hiker://files/rules/Src/Juying/Alist.json";
try{
  eval("var alistData=" + fetch(alistfile));
  var datalist = alistData.drives;
}catch(e){
  var datalist = [];
}
datalist = [
  {
    "name": "小雅",
    "server": "http://alist.xiaoya.pro"
  },
  {
    "name": "帅鹏",
    "server": "https://hi.shuaipeng.wang"
  },{
    "name": "触光",
    "server": "https://pan.ichuguang.com"
  },{
    "name": "七米蓝",
    "server": "https://al.chirmyram.com"
  },{
    "name": "神族九帝",
    "server": "https://alist.shenzjd.com"
  }
];
let fileFilter = 0;
let contain = /\.mp4|\.avi|\.mkv|\.rmvb|\.flv|\.mov|\.mp3|\.m4a|\.wma/;//设置可显示的文件后缀

function gethtml(api,path,password) {
  try{
    path = path || "";
    password = password || "";
    let html = fetch(api, {body: {"path":path,"password":password},method:'POST',timeout:10000});
    return html;
  }catch(e){
    return "";
  }
}
function getlist(data,isdir) {
  try{
    let list = data.filter(item => {
        return isdir ? item.is_dir : fileFilter?contain.test(item.name):item.is_dir==0;
    })
    return list;
  }catch(e){
    return [];
  }
}

function alistHome() {
  let alistapi = storage0.getMyVar('Alistapi',{});
  let d = [];
  datalist.forEach(item => {
    d.push({
      title: alistapi.server==item.server?`““””<b><span style="color: #3399cc">`+item.name+`</span></b>`:item.name,
      url: $('#noLoading#').lazyRule((item) => {
        storage0.putMyVar('Alistapi', item);
        refreshPage(false);
        return "hiker://empty";
      }, item),
      col_type: 'scroll_button'
    })
  })
  d.push({
      col_type: 'blank_block'
  });
  d.push({
      title: '⚙设置',
      url: "",
      col_type: 'scroll_button'
  });
  d.push({
      title: '🔍搜索',
      url: "",
      col_type: 'scroll_button'
  });
  d.push({
      col_type: 'line'
  });
  d.push({
    title: "加载中...",
    url: "hiker://empty",
    col_type: "text_center_1",
    extra: {
        id: "homeloading",
        lineVisible: false
    }
  })

  setResult(d);
  if (datalist.length > 0) {
    alistapi = storage0.getMyVar('Alistapi', datalist[0]);
    setPageTitle("Alist网盘-" + alistapi.name);
    try{
      let json = JSON.parse(gethtml(alistapi.server + "/api/fs/list", "", alistapi.password));
      if(json.code==200){
        let dirlist = getlist(json.data.content,1);
        addItemBefore('homeloading', arrayAdd(dirlist,1,alistapi));
        
        let filelist = getlist(json.data.content,0);
        addItemBefore('homeloading', arrayAdd(filelist,0,alistapi));
      }
      updateItem('homeloading', {
        title: "““””<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>"
      });
    }catch(e){
      updateItem('homeloading', {
        title: "出错了,下拉刷新重试."
      });
    }
  } else {
    setPageTitle("Alist网盘");
    updateItem('homeloading', {
        title: "Alist列表为空"
    });
  }
}

function alistList(alistapi){
  setPageTitle("Alist网盘-" + alistapi.name);
  let d = [];
  let listid = base64Encode(MY_PARAMS.path);
  d.push({
    title: "<span style='color: #3399cc'>🏠"+ (MY_PARAMS.path||"") + "</span>",
    col_type: 'rich_text'
  })
  d.push({
    title: "加载中...",
    url: "hiker://empty",
    col_type: "text_center_1",
    extra: {
        id: listid,
        lineVisible: false
    }
  })
  setResult(d);
  try{
    let json = JSON.parse(gethtml(alistapi.server + "/api/fs/list", MY_PARAMS.path, alistapi.password));
    if(json.code==200){
      let dirlist = getlist(json.data.content,1);
      addItemBefore(listid, arrayAdd(dirlist,1,alistapi));
      
      let filelist = getlist(json.data.content,0);
      addItemBefore(listid, arrayAdd(filelist,0,alistapi));
    }
    updateItem(listid, {
      title: fileFilter?"““””<small><font color=#f20c00>已开启文件过滤，仅显示音视频文件</font></small>":""
    });
  }catch(e){
    updateItem(listid, {
      title: "出错了,下拉刷新重试."
    });
  }
}

function arrayAdd(list,isdir,alistapi){
  let d = [];
  if(isdir){
    list.forEach(item => {
      let folderpath = (MY_PARAMS.path||"") + "/" + item.name;
      d.push({
        title: item.name,
        img: item.thumb || config.依赖.match(/http(s)?:\/\/.*\//)[0] + "img/文件夹.svg",
        url: $("hiker://empty##" + alistapi.server + folderpath + "#noRecordHistory##noHistory#").rule((alistapi) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          alistList(alistapi);
        },alistapi),
        col_type: 'avatar',
        extra: {
          path: folderpath
        }
      })
    })
  }else{
    list.forEach(item => {
      d.push({
        title: item.name,
        img: item.thumb || "https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg@Referer=",
        url: $().lazyRule((api,path,pwd,sign) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          return alistUrl(api,path,pwd,sign);
        }, alistapi.server, (MY_PARAMS.path||"") + "/" + item.name, alistapi.password, item.sign),
        col_type: 'avatar',
      })
    })
  }
  return d;
}

function alistUrl(api,path,pwd,sign) {
  if(contain.test(path)){
    try{
      let json = JSON.parse(gethtml(api + "/api/fs/get", path, pwd));
      if(json.code==200){
        return json.data.raw_url + (/\.mp3|\.m4a|\.wav/.test(path)?"#isMusic=true#":"#isVideo=true#");
      }
    }catch(e){
      return api + "/d"+ path + "?sign=" + sign;
    }
    return "toast://播放失败，网盘失效";
  }else{
    return "download://" + api + "/d"+ path + "?sign=" + sign;
  }
}



/*

hiker://empty@lazyRule=.js:(
(item, url, path, list, u) => {
    const type_dict = {0: $.toString((url) => {
        return "download://" + url;
    }
    , url), 2: $.toString((url, list, u, path) => {
        var subtitles = $.require("api").getSubtitles(list, u, path);
        if (subtitles.length > 1) {
            var namelist = subtitles.map(function (item) {
                return item.name;
            });
            return $(namelist, 1, "\u8bf7\u9009\u62e9\u5b57\u5e55").select((subtitles, namelist, url) => {
                return JSON.stringify({urls: [url], subtitle: subtitles[namelist.indexOf(input)].url});
            }
            , subtitles, namelist, url);
        } else {
            return url + "#isVideo=true#";
        }
    }
    , url, list, u, path), 3: $.toString((url) => {
        return url + "#isMusic=true#";
    }
    , url), 4: $.toString((url) => {
        return "download://" + url;
    }
    , url), 5: $.toString((url) => {
        return url + "#.jpg";
    }
    , url)};
    if (item.is_dir) {
        return "hiker://page/home?page=fypage";
    } else {
        if ($.require("api").getHzm(item.name) == "pdf") {
            return "https://alist-org.github.io/pdf.js/web/viewer.html?file=" + url;
        } else {
            if ($.office.includes($.require("api").getHzm(item.name))) {
                return $(["\u5fae\u8f6f", "\u8c37\u6b4c"]).select((url) => {
                    if (input == "\u5fae\u8f6f") {
                        return "https://view.officeapps.live.com/op/view.aspx?src=" + url;
                    } else {
                        return "https://docs.google.com/gview?&embedded=true&url=" + url;
                    }
                }
                , url);
            } else {
                return eval(type_dict[item.type]);
            }
        }
    }
}
)({"name":"微软常用运行库.exe","size":34013425,"is_dir":false,"modified":"2021-11-19T12:42:25.187Z","sign":"eXl-v6t8UDdV7GwVao27L9UB3J1We2VtKXQrGbC2x3M=:0","thumb":"","type":0},"https://pan.ichuguang.com/d/%E7%B2%BE%E5%93%81%E8%BD%AF%E4%BB%B6/%E8%A1%A5%E4%B8%81%E4%BF%AE%E5%A4%8D/%E5%BE%AE%E8%BD%AF%E5%B8%B8%E7%94%A8%E8%BF%90%E8%A1%8C%E5%BA%93.exe?sign=eXl-v6t8UDdV7GwVao27L9UB3J1We2VtKXQrGbC2x3M=:0","/精品软件/补丁修复",[{"name":"微软常用运行库.exe","size":34013425,"is_dir":false,"modified":"2021-11-19T12:42:25.187Z","sign":"eXl-v6t8UDdV7GwVao27L9UB3J1We2VtKXQrGbC2x3M=:0","thumb":"","type":0},{"name":".NET Framework.exe","size":137905904,"is_dir":false,"modified":"2021-11-19T12:42:25.239Z","sign":"xrygxvnHgbXyyWeAIywo4mgzS6qDmd_kEjUAnoxqCtg=:0","thumb":"","type":0},{"name":"dll修复工具.exe","size":199775122,"is_dir":false,"modified":"2021-11-19T12:42:25.3Z","sign":"vg0luZS1OlImU5ufO25z7uW5wrdPo7Ve8k1BRhA_nbE=:0","thumb":"","type":0}],"https://pan.ichuguang.com/")
*/