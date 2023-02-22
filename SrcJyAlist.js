//本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
let alistfile = "hiker://files/rules/Src/Juying/Alist.json";
try{
  eval("var alistData=" + fetch(alistfile));
  let jknum = alistData.drives.length;
}catch(e){
  var alistData = {};
}
let datalist = alistData.drives || [];
let alistconfig = alistData.config || {};
let fileFilter = alistconfig['fileFilter']==0?0:1;
let contain = new RegExp(alistconfig.contain||'.mp4|.avi|.mkv|.rmvb|.flv|.mov|.ts|.mp3|.m4a|.wma|.flac');//设置可显示的文件后缀

function gethtml(api,path,password) {
  try{
    path = path || "";
    password = password || "";
    let html = fetch(api, {body: {"path":path,"password":password},method:'POST',timeout:10000});
    return html;
  }catch(e){
    log(e.message);
    return "";
  }
}
function getlist(data,isdir) {
    let list = data.filter(item => {
        return isdir ? item.is_dir : fileFilter? (contain.test(item.name) || /\.srt|\.vtt|\.ass/.test(item.name)) : item.is_dir==0;
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
  let getapi = datalist.filter(item => {
      return item.server == getItem('Alistapi',datalist.length>0?datalist[0].server:"");
  });
  let alistapi = getapi.length>0?getapi[0]:datalist.length>0?datalist[0]:{};
  let d = [];
  datalist.forEach(item => {
    d.push({
      title: alistapi.server==item.server?`““””<b><span style="color: #3399cc">`+item.name+`</span></b>`:item.name,
      url: $(item.server+'#noLoading#').lazyRule((item) => {
        setItem('Alistapi', item.server);
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
      url: $('hiker://empty#noRecordHistory##noHistory#').rule((alistfile) => {
          setPageTitle('⚙设置 | Alist网盘');
          try{
            eval("var alistData=" + fetch(alistfile));
            let jknum = alistData.drives.length;
          }catch(e){
            var alistData= {drives:[]};
          }
          let alistconfig = alistData.config || {};
          let contain = alistconfig.contain || '.mp4|.avi|.mkv|.rmvb|.flv|.mov|.ts|.mp3|.m4a|.wma|.flac';
          let fileFilter = alistconfig['fileFilter']==0?0:1;
          let datalist = alistData.drives;
          var d = [];
          d.push({
              title: fileFilter?'音视频过滤开':'音视频过滤关',
              url: $('#noLoading#').lazyRule((fileFilter,alistData,alistfile) => {
                let alistconfig = alistData.config || {};
                let sm = "";
                if(fileFilter){
                  alistconfig['fileFilter'] =0;
                  sm = "已关闭音视频文件过滤，将显示全部文件";
                }else{
                  alistconfig['fileFilter'] =1;
                  sm = "已开启文件过滤，仅显示音视频文件";
                }
                alistData.config = alistconfig;
                writeFile(alistfile, JSON.stringify(alistData));
                refreshPage(false);
                return 'toast://'+sm;
              }, fileFilter, alistData, alistfile),
              img: fileFilter?"https://lanmeiguojiang.com/tubiao/messy/55.svg":"https://lanmeiguojiang.com/tubiao/messy/56.svg",
              col_type: "icon_2"
          });
          d.push({
              title: '音视频后缀名',
              url: $(contain,"开启过滤后，仅允许显示的音频或视频文件格式，用|隔开").input((alistData,alistfile) => {
                let alistconfig = alistData.config || {};
                alistconfig['contain'] =input;
                alistData.config = alistconfig;
                writeFile(alistfile, JSON.stringify(alistData));
                refreshPage(false);
                return 'toast://已设置音视频文件格式后缀';
              }, alistData, alistfile),
              img: fileFilter?"https://lanmeiguojiang.com/tubiao/messy/55.svg":"https://lanmeiguojiang.com/tubiao/messy/56.svg",
              col_type: "icon_2"
          });
          d.push({
              col_type: "line"
          });
          d.push({
              title: '增加',
              url: $("","alist链接地址\n如：https://alist.abc.com").input((alistfile) => {
                  if(!input.startsWith('http') || input.endsWith('/')){
                      return 'toast://链接有误';
                  }
                  showLoading('正在较验有效性');
                  let apiurl = input + "/api/public/settings";
                  try{
                    let getapi = JSON.parse(fetch(apiurl,{timeout:10000}));
                    hideLoading();
                    if(getapi.code==200 && /^v3/.test(getapi.data.version)){
                      return $("","当前链接有效，起个名保存吧").input((alistfile,api) => {
                          try{
                            eval("var alistData=" + fetch(alistfile));
                            let jknum = alistData.drives.length;
                          }catch(e){
                            var alistData= {drives:[]};
                          }
                          if(alistData.drives.some(item => item.server==input)){
                              return 'toast://已存在';
                          }
                          if(input!=""){
                            alistData.drives.push({
                              "name": input,
                              "server": api
                            })
                            writeFile(alistfile, JSON.stringify(alistData));
                            refreshPage(false);
                            return 'toast://已保存';
                          }else{
                              return 'toast://名称为空，无法保存';
                          }
                      }, alistfile, input);
                    }else{
                      return 'toast://仅支持alist v3版本';
                    }
                  }catch(e){
                    hideLoading();
                    return 'toast://链接无效';
                  }
              }, alistfile),
              img: "https://lanmeiguojiang.com/tubiao/more/25.png",
              col_type: "icon_small_3"
          });
          d.push({
              title: '导入',
              url: $("","alist分享口令的云剪贴板").input((alistfile) => {
                try{
                    let inputname = input.split('￥')[0];
                    if(inputname=="聚影Alist"){
                      showLoading("正在导入，请稍后...");
                      let parseurl = aesDecode('Juying', input.split('￥')[1]);
                      let content = parsePaste(parseurl);
                      let datalist = JSON.parse(aesDecode('Juying', content));
                      try{
                        eval("var alistData=" + fetch(alistfile));
                        let jknum = alistData.drives.length;
                      }catch(e){
                        hideLoading();
                        var alistData= {drives:[]};
                      }
                      let newdatalist = alistData.drives;
                      let num =0;
                      for (let i = 0; i < datalist.length; i++) {
                        if(!newdatalist.some(item => item.server==datalist[i].server)){
                            newdatalist.push(datalist[i]);
                            num = num+1;
                        }
                      }
                      alistData.drives = newdatalist;
                      writeFile(alistfile, JSON.stringify(alistData));
                      hideLoading();
                      refreshPage(false);
                      return "toast://合计"+datalist.length+"个，导入"+num+"个";
                    }else{
                      return "toast://聚影√：非Alist口令";
                    }
                }catch(e){
                    return "toast://聚影√：口令有误";
                }
              }, alistfile),
              img: "https://lanmeiguojiang.com/tubiao/more/43.png",
              col_type: "icon_small_3"
          });
          d.push({
              title: '分享',
              url: datalist.length==0?"toast://alist接口为0，无法分享":$().lazyRule((datalist)=>{
                  let pasteurl = sharePaste(aesEncode('Juying', JSON.stringify(datalist)));
                  if(pasteurl){
                    let code = '聚影Alist￥'+aesEncode('Juying', pasteurl)+'￥共'+datalist.length+'条';
                    copy(code);
                    return "toast://(全部)Alist分享口令已生成";
                  }else{
                    return "toast://分享失败，剪粘板或网络异常";
                  }
              },datalist),
              img: "https://lanmeiguojiang.com/tubiao/more/3.png",
              col_type: "icon_small_3"
          });
          d.push({
              col_type: "line"
          });
          
          datalist.forEach(item => {
            d.push({
                title: item.name,
                url: $(["复制地址","分享接口","删除接口","密码管理","向上进位","向下落位","列表置顶","列表置底"],2).select((item,alistfile)=>{
                  if(input=="复制地址"){
                    copy(item.name+item.server);
                    return "hiker://empty";
                  }else if(input=="分享接口"){
                    showLoading('分享上传中，请稍后...');
                    let oneshare = []
                    oneshare.push(item);
                    let pasteurl = sharePaste(aesEncode('Juying', JSON.stringify(oneshare)));
                    hideLoading();
                    if(pasteurl){
                      let code = '聚影Alist￥'+aesEncode('Juying', pasteurl)+'￥共1条';
                      copy(code);
                      return "toast://(单个)Alist分享口令已生成";
                    }else{
                      return "toast://分享失败，剪粘板或网络异常";
                    }
                  }else{
                    function Move(arr, a, b) {
                        let arr_temp = [].concat(arr);
                        arr_temp.splice(b, 0, arr_temp.splice(a, 1)[0]);
                        return arr_temp;
                    }

                    eval("var alistData=" + fetch(alistfile));
                    if (input == "删除接口") {
                      let datalist = alistData.drives;
                      let index = datalist.indexOf(datalist.filter(d=>d.server == item.server)[0]);
                      datalist.splice(index, 1);
                      alistData.drives = datalist;
                      writeFile(alistfile, JSON.stringify(alistData));
                      refreshPage(false);
                      return 'toast://已删除';
                    } else if (input=="向上进位" || input=="向下落位" || input=="列表置顶" || input=="列表置底"){
                      let datalist = alistData.drives;
                      let index = datalist.indexOf(datalist.filter(d=>d.server == item.server)[0]);
                      if((index==0&&(input=="向上进位"||input=="列表置顶")) || (index==datalist.length-1&&(input=="向下落位"||input=="列表置底"))){
                        return 'toast://位置移动无效';
                      }else{
                        if (input=="向上进位" || input=="向下落位"){
                          let newindex = input=="向上进位"?index-1:index+1;
                          datalist.splice(newindex, 0, datalist.splice(index, 1)[0]);
                        }else{
                          let data = datalist[index];
                          datalist.splice(index, 1);
                          if(input=="列表置顶"){
                            datalist.unshift(data);
                          }else{
                            datalist.push(data);
                          }
                        }
                      }
                      alistData.drives = datalist;
                      writeFile(alistfile, JSON.stringify(alistData));
                      refreshPage(false);
                      return 'toast://已移动';
                    } else if (input == "密码管理") {
                      return $('hiker://empty#noRecordHistory##noHistory#').rule((item,alistfile) => {
                        setPageTitle(item.name+' | 密码管理');
                        eval("var alistData=" + fetch(alistfile));
                        let datalist = alistData.drives;
                        let d = [];
                        d.push({
                            title: '🔢 添加密码',
                            url: $("","有密码的路径").input((api,alistData,alistfile) => {
                              return $("","此路径的密码").input((path,api,alistData,alistfile) => {
                                let datalist = alistData.drives;
                                for (let i = 0; i < datalist.length; i++) {
                                  if (datalist[i].server == api) {
                                    let password = datalist[i].password || {};
                                    password[path] = input;
                                    datalist[i].password = password;
                                    break;
                                  }
                                }
                                alistData.drives = datalist;
                                writeFile(alistfile, JSON.stringify(alistData));
                                refreshPage(false);
                                return "hiker://empty";
                              },input,api,alistData,alistfile)
                            },item.server,alistData,alistfile),
                            img: "https://lanmeiguojiang.com/tubiao/movie/98.svg",
                            col_type: "text_center_1"
                        });
                        for (let i = 0; i < datalist.length; i++) {
                          if (datalist[i].server == item.server) {
                            var pwdlist = datalist[i].password || {}
                            break;
                          }
                        }
                        for(let key in pwdlist){
                          d.push({
                              title: key,
                              desc: pwdlist[key],
                              url: $("确定删除："+key).confirm((api,key,alistData,alistfile)=>{
                                let datalist = alistData.drives;
                                for (let i = 0; i < datalist.length; i++) {
                                  if (datalist[i].server == api) {
                                    let password = datalist[i].password;
                                    delete password[key];
                                    datalist[i].password = password;
                                    break;
                                  }
                                }
                                alistData.drives = datalist;
                                writeFile(alistfile, JSON.stringify(alistData));
                                refreshPage(false);
                                return "hiker://empty";
                              },item.server,key,alistData,alistfile),
                              col_type: "text_1"
                          });
                        }
                        setResult(d);
                      }, item, alistfile)
                    }
                  }
                }, item ,alistfile),
                desc: item.server,
                col_type: "text_1"
            });
          })
          
          setResult(d);
      }, alistfile),
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
      let pwd = alistapi.password?alistapi.password['/']||"":"";
      let json = JSON.parse(gethtml(alistapi.server + "/api/fs/list", "", pwd));
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
    let pwd = alistapi.password?alistapi.password[MY_PARAMS.path]||"":"";
    let json = JSON.parse(gethtml(alistapi.server + "/api/fs/list", MY_PARAMS.path, pwd));
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

  if(isdir==0){
    var sublist = list.filter(item => {
        return /\.srt|\.vtt|\.ass/.test(item.name);
    })
    if(fileFilter){
      list = list.filter(item => {
          return contain.test(item.name);
      })
    }
  }

  list.forEach(item => {
    let path = ((item.parent=="/"?"":item.parent)||(typeof(MY_PARAMS)!="undefined"&&MY_PARAMS.path)||"") + "/" + item.name; 
    if(isdir){
      d.push({
        title: item.name,
        img: item.thumb || config.依赖.match(/http(s)?:\/\/.*\//)[0] + "img/文件夹.svg",//#noRecordHistory##noHistory#
        url: $("hiker://empty##" + encodeURI(alistapi.server + path)).rule((alistapi,dirname) => {
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
      let name = item.name.substring(0,item.name.lastIndexOf("."));
      let subtitles = [];
      sublist.forEach(item => {
        if(item.indexOf(name)>-1){
          subtitles.push(item.name+"?sign="+item.sign);
        }
      })
      d.push({
        title: item.name,
        img: item.thumb || "https://cdn.jsdelivr.net/gh/alist-org/logo@main/logo.svg@Referer=",
        url: $(encodeURI(alistapi.server+path)).lazyRule((api,path,sign,subtitle) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          return alistUrl(api,path,sign,subtitle);
        }, alistapi.server, path, item.sign, subtitles.length>0?subtitles[0]:""),
        col_type: 'avatar',
        extra: {
          id: encodeURI(path),
          cls: typeof(MY_PARAMS)!="undefined"&&contain.test(item.name)?"playlist":typeof(MY_PARAMS)=="undefined"&&contain.test(item.name)?"alist playlist":"alist",
          longClick: [{
              title: "📋复制链接",
              js: $.toString((url) => {
                  copy(url);
                  return "hiker://empty";
              },encodeURI(alistapi.server+'/d'+path)+'?sign='+item.sign)
          }]
        }
      })
    }
  })
  return d;
}

function alistUrl(api,path,sign,subtitle) {
  let url = encodeURI(api + "/d"+ path) + "?sign=" + sign;
  if(contain.test(path)){
    try{
        url = url + (/\.mp3|\.m4a|\.wma|\.flac/.test(path)?"#isMusic=true#":"#isVideo=true#");
        if(!subtitle){
          return url;
        }else{
          let urls = [];
          urls.push(url);
          return JSON.stringify({
              urls: urls,
              subtitle: url.match(/http(s)?:\/\/.*\//)[0] + subtitle
          });
        }
    }catch(e){ }
    return url;
  }else if(/\.jpg|\.png|\.gif|\.JPG|\.PNG|\.bmp|\.ico|\.svg/.test(path)){
    return url+"@Referer=";
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