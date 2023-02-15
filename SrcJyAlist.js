//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
var Alistfile = "hiker://files/rules/Src/Juying/Alist.json";
var AlistData = fetch(Alistfile);
if (AlistData != "") {
  eval("var datalist=" + AlistData + ";");
} else {
  var datalist = [
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
}
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
        return isdir ? item.is_dir : /\.mp4|\.avi|\.mkv|\.rmvb|\.flv|\.mov|\.wmv|\.3gp|\.mp3|\.m4a|\.wma|\.wav/.test(item.name);
    })
    return list;
  }catch(e){
    return [];
  }
}

function alisthome() {
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
        title: ""
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

function alistlist(alistapi){
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
      title: ""
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
          alistlist(alistapi);
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
        url: $().lazyRule((api,path,password) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          try{
            let json = JSON.parse(gethtml(api + "/api/fs/get", path, password));
            if(json.code==200&&json.data.raw_url){
              return json.data.raw_url + (/\.mp3|\.m4a|\.wav/.test(json.data.raw_url)?"#isMusic=true#":"#isVideo=true#");
            }
          }catch(e){
            return api + "/d"+ path;
          }
          return "toast://播放失败，网盘失效";
        }, alistapi.server, (MY_PARAMS.path||"") + "/" + item.name, alistapi.password),
        col_type: 'avatar',
      })
    })
  }
  return d;
}