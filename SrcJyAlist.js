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
        return isdir ? item.is_dir : fileFilter? contain.test(item.name) || /\.srt|\.vtt|\.ass/.test(item.name) : item.is_dir==0;
    })
    try{    
        //if(!isdir){
            list.sort(SortList);
        //}
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
    setPageTitle(alistapi.name+' | Alist网盘');
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
    setPageTitle('Alist网盘 | 聚影√');
    updateItem('homeloading', {
        title: "Alist列表为空"
    });
  }
}

function alistList(alistapi,dirname){
  setPageTitle(dirname);
  let d = [];
  let listid = base64Encode(MY_PARAMS.path);
  d.push({
    title: "<span style='color: #3399cc'>🏠"+ alistapi.name + MY_PARAMS.path + "</span>",
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
      if(dirlist.length==0&&filelist.length==0){
        addItemBefore('listid', {
          title: "列表为空",
          url: "hiker://empty",
          col_type: "text_center_1"
        });
      }
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
  let sublist = list.filter(item => {
      return /\.srt|\.vtt|\.ass/.test(item.name);
  })
  if(fileFilter){
    list = list.filter(item => {
        return contain.test(item.name);
    })
  }
  list.forEach(item => {
    let path = ((item.parent=="/"?"":item.parent)||(typeof(MY_PARAMS)!="undefined"&&MY_PARAMS.path)||"") + "/" + item.name; 
    if(isdir){
      d.push({
        title: item.name,
        img: item.thumb || config.依赖.match(/http(s)?:\/\/.*\//)[0] + "img/文件夹.svg",//#noRecordHistory##noHistory#
        url: $("hiker://empty##" + encodeURI(alistapi.server + path) + "#autoCache#").rule((alistapi,dirname) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          alistList(alistapi,dirname);
        },alistapi,item.name),
        col_type: 'avatar',
        extra: {
          path: path,
          cls: "alist"
        }
      })
    }else{
      let name = item.name.substring(0,item.name.indexOf("."));
      let sub = [];
      sublist.forEach(item => {
        if(item.name.indexOf(name)>-1){
          sub.push(item.name);
        }
      })
      d.push({
        title: item.name,
        img: item.thumb || "https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg@Referer=",
        url: $(encodeURI(alistapi.server+path)).lazyRule((api,path,pwd,sign,sub) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          return alistUrl(api,path,pwd,sign,sub);
        }, alistapi.server, path, alistapi.password, item.sign, sub),
        col_type: 'avatar',
        extra: {
          id: base64Encode(path),
          cls: typeof(MY_PARAMS)!="undefined"&&contain.test(item.name)?"playlist":typeof(MY_PARAMS)=="undefined"&&contain.test(item.name)?"alist playlist":"alist",
          longClick: [{
              title: "📋复制链接",
              js: $.toString((url) => {
                  copy(url);
                  return "hiker://empty";
              },encodeURI(alistapi.server+'/d'+path+'?sign='+item.sign))
          }]
        }
      })
    }
  })
  return d;
}

function alistUrl(api,path,pwd,sign,sub) {
  let url = encodeURI(api + "/d"+ path) + "?sign=" + sign;
  if(contain.test(path)){
    try{
      let json = JSON.parse(gethtml(api + "/api/fs/get", path, pwd));
      if(json.code==200){
        url = json.data.raw_url + (/\.mp3|\.m4a|\.wav|\.flac/.test(path)?"#isMusic=true#":"#isVideo=true#");
        if(sub.length==0){
          return url;
        }else{
          sub.unshift('不挂载字幕');
          return $(sub,1).select((url,sub)=>{
            if(input==sub[0]){
              return url;
            }else{
              let urls = [];
              urls.push(url);
              return JSON.stringify({
                    urls: urls,
                    subtitle: url.match(/http(s)?:\/\/.*\//)[0] + input
                }); 
            }
          },url,sub)
        }
      }
    }catch(e){ }
    return url;
  }else if(/\.jpg|\.png|\.gif|\.bmp|\.ico|\.svg/.test(path)){
    return url;
  }else{
    return "download://" + url;
  }
}

function alistSearch(alistapi,key) {
  showLoading('搜索中，请稍后...');
  try{
    let json = JSON.parse(fetch(alistapi.server + "/api/fs/search", {headers:{'content-type':'application/json;charset=UTF-8' },body:{"per_page":100,"page":1,"parent":"/","keywords":key},method:'POST',timeout:10000}));
    if(json.code==200){
      deleteItemByCls('alist');
      let dirlist = getlist(json.data.content,1);
      addItemBefore('homeloading', arrayAdd(dirlist,1,alistapi));
      let filelist = getlist(json.data.content,0);
      addItemBefore('homeloading', arrayAdd(filelist,0,alistapi));
      if(dirlist.length==0&&filelist.length==0){
        addItemBefore('homeloading', {
          title: "未搜索到“"+key+"”",
          url: "hiker://empty",
          col_type: "text_center_1",
          extra: {
              cls: "alist"
          }
        });
      }
    }else if(json.code==500){
      toast('搜索出错了，此网盘不支持搜索');
    }
  }catch(e){
    log('搜索出错了>'+e.message);
  }
  hideLoading();
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