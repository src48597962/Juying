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
    "name": "云哲小站",
    "server": "http://202.81.231.111:50526"
  },{
    "name": "AR盘",
    "server": "https://xn--ar-4g8e.tk"
  },{
    "name": "影视库",
    "server": "https://a.aa01.ml"
  },{
    "name": "听闻网盘",
    "server": "https://wangpan.sangxuesheng.com"
  },{
    "name": "Drive",
    "server": "https://drive.9t.ee"
  }
];
let fileFilter = 0;
let contain = /\.mp4|\.avi|\.mkv|\.rmvb|\.flv|\.mov|\.mp3|\.m4a|\.wma|\.flac/;//设置可显示的文件后缀

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
    let list = data.filter(item => {
        return isdir ? item.is_dir : fileFilter?contain.test(item.name):item.is_dir==0;
    })
    try{
        list = list.sort((a, b) => {
          let reg = /^[A-z]/;
          if (reg.test(a.name) || reg.test(b.name)) {
            if (a.name > b.name) {
              return 1;
            } else if (a.name < b.name) {
              return -1;
            } else {
              return 0;
            }
          } else if (/第.*集/.test(a.name) || /第.*集/.test(b.name)) {
            let temp1 = parseInt(a.name)||0;
            let temp2 = parseInt(b.name)||0;
            if (temp1 < temp2) {
                return -1;
            } else if (temp1 == temp2) {
                return 0;
            } else {
                return 1;
            }
          } else {
            return a.name.localeCompare(b.name, "zh");
          }
        })
    }catch(e){
      log(e.message);
    }
    return list || [];
}

function alistHome() {
  let alistapi = storage0.getItem('Alistapi',datalist.length>0?datalist[0]:{});
  let d = [];
  datalist.forEach(item => {
    d.push({
      title: alistapi.server==item.server?`““””<b><span style="color: #3399cc">`+item.name+`</span></b>`:item.name,
      url: $(item.server+'#noLoading#').lazyRule((item) => {
        storage0.setItem('Alistapi', item);
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
      url: $("","搜索关键字").input((alistapi)=>{
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
        alistSearch(alistapi,input);
      },alistapi),
      col_type: 'scroll_button'
  });
  d.push({
      col_type: 'line'
  });
  d.push({
    title: "加载中，请稍后...",
    url: "hiker://empty",
    col_type: "text_center_1",
    extra: {
        id: "homeloading",
        lineVisible: false
    }
  })
  setResult(d);

  if (datalist.length > 0) {
    setPageTitle(alistapi.name+' | 聚影√-Alist');
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
        title: "超时或出错了,下拉刷新重试."
      });
    }
  } else {
    setPageTitle('聚影√-Alist');
    updateItem('homeloading', {
        title: "Alist列表为空"
    });
  }
}

function alistList(alistapi){
  setPageTitle(alistapi.name+' | 聚影√-Alist');
  let d = [];
  let listid = base64Encode(MY_PARAMS.path);
  d.push({
    title: "<span style='color: #3399cc'>🏠"+ (MY_PARAMS.path||"") + "</span>",
    col_type: 'rich_text'
  })
  d.push({
    title: "加载中，请稍后...",
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
      title: "超时或出错了,下拉刷新重试."
    });
  }
}

function arrayAdd(list,isdir,alistapi){
  let d = [];
  list.forEach(item => {
    let path = ((item.parent=="/"?"":item.parent)||(typeof(MY_PARAMS)!="undefined"&&MY_PARAMS.path)||"") + "/" + item.name; 
    if(isdir){
      d.push({
        title: item.name,
        img: item.thumb || config.依赖.match(/http(s)?:\/\/.*\//)[0] + "img/文件夹.svg",
        url: $("hiker://empty##" + alistapi.server + path + "#noRecordHistory##noHistory#").rule((alistapi) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          alistList(alistapi);
        },alistapi),
        col_type: 'avatar',
        extra: {
          path: path,
          cls: "alist"
        }
      })
    }else{
      d.push({
        title: item.name,
        img: item.thumb || "https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg@Referer=",
        url: $(alistapi.server+path).lazyRule((api,path,pwd,sign) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          return alistUrl(api,path,pwd,sign);
        }, alistapi.server, path, alistapi.password, item.sign),
        col_type: 'avatar',
        extra: {
          cls: "alist"
        }
      })
    }
  })
  return d;
}

function alistUrl(api,path,pwd,sign) {
  if(contain.test(path)){
    try{
      let json = JSON.parse(gethtml(api + "/api/fs/get", path, pwd));
      if(json.code==200){
        return json.data.raw_url + (/\.mp3|\.m4a|\.wav|\.flac/.test(path)?"#isMusic=true#":"#isVideo=true#");
      }
    }catch(e){
      return api + "/d"+ path + "?sign=" + sign;
    }
    return "toast://播放失败，网盘失效";
  }else{
    return "download://" + api + "/d"+ path + "?sign=" + sign;
  }
}

function alistSearch(alistapi,key) {
  deleteItemByCls('alist');
  try{
    let json = JSON.parse(fetch(alistapi.server + "/api/fs/search", {headers:{'content-type':'application/json;charset=UTF-8' },body:{"per_page":100,"page":1,"parent":"/","keywords":key},method:'POST',timeout:10000}));
    log(json);
    if(json.code==200){
      let dirlist = getlist(json.data.content,1);
      addItemBefore('homeloading', arrayAdd(dirlist,1,alistapi));
      
      let filelist = getlist(json.data.content,0);
      addItemBefore('homeloading', arrayAdd(filelist,0,alistapi));
    }
  }catch(e){
    log(e.message);
  }
}