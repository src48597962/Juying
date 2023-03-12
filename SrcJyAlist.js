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
let audiovisual = alistconfig.contain?alistconfig.contain.replace(/\./,""):'mp4|avi|mkv|rmvb|flv|mov|ts|mp3|m4a|wma|flac';//影音文件
let contain = new RegExp(audiovisual,"i");//设置可显示的影音文件后缀
let music = new RegExp("mp3|m4a|wma|flac","i");//进入音乐播放器
let image = new RegExp("jpg|png|gif|bmp|ico|svg","i");//进入图片查看
const transcoding = {UHD: "4K 超清",QHD: "2K 超清",FHD: "1080 全高清",HD: "720 高清",SD: "540 标清",LD: "360 流畅"};

function getlist(data,isdir,filter) {
    let list = data.filter(item => {
        let suffix = item.name.substring(item.name.lastIndexOf('.')+1);//后缀名
        return isdir ? item.is_dir : filter? ((contain.test(suffix) || /srt|vtt|ass/.test(suffix))) && !item.is_dir : !item.is_dir;
    })
    try{    
        if(!isdir){
            list.sort(SortList);
        }
    }catch(e){
      log('排序修正失败>'+e.message);
    }
    return list || [];
}

function gethtml(alistapi,int,path){
    let pwd = "";
    if(alistapi.password){
      if(alistapi.password[path]){
        pwd = alistapi.password[path]
      }else{
        let paths = path.split('/');
        let patht = path.split('/');
        for (let i = 0; i < paths.length-1; i++) {
          patht.length = patht.length-1;
          let onpath = patht.join('/') || "/";
          if(alistapi.password[onpath]){
            pwd = alistapi.password[onpath];
            break;
          }
        }
      }
    }
    let headers = {'content-type':'application/json;charset=UTF-8'}
    if(alistapi.token){
      headers.Authorization = alistapi.token;
    }
    let body = {"path":path,"password":pwd}
    if(int=="/api/fs/other"){
      body.method = "video_preview";
    }
    let html = request(alistapi.server + int, {headers:headers,body:body,method:'POST',timeout:10000});
    return html;
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
      url: $('hiker://empty#noRecordHistory##noHistory#').rule(() => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          alistSet();
      }),
      col_type: 'scroll_button',
      extra: {
          longClick: [{
              title: "🔑阿里token",
              js: $.toString((alistfile) => {
                  try{
                    var alistData = JSON.parse(fetch(alistfile));
                  }catch(e){
                    var alistData = {};
                  }
                  let alistconfig = alistData.config || {};

                  let alitoken = alistconfig.alitoken;
                  if(!alitoken){
                    try{
                      //节约资源，如果云盘汇影有获取过用户信息，就重复利用一下
                      let filepath = "hiker://files/rules/icy/icy-ali-token.json";
                      let icyalifile = fetch(filepath);
                      if(icyalifile){
                        let icyalitoken = eval(icyalifile);
                        if(icyalitoken.length>0){
                          alitoken = icyalitoken[0].refresh_token;
                        }
                      }
                    }catch(e){
                      log('从云盘汇影取ali-token失败'+e.message)
                    }
                  }
                  return $(alitoken||"","refresh_token").input((alistfile,alistData,alistconfig)=>{
                    alistconfig.alitoken = input;
                    alistData.config = alistconfig;
                    writeFile(alistfile, JSON.stringify(alistData));
                    return "toast://已设置";
                  },alistfile,alistData,alistconfig)
              },alistfile)
          }]
      }
  });
  d.push({
      title: '🔍搜索',
      url: $(getItem('searchtestkey', ''),"搜索关键字").input((alistapi)=>{
        setItem("searchtestkey",input);
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
        showLoading('搜索中，请稍后...');
        deleteItemByCls('loadlist');
        let searchlist = alistSearch(alistapi,input);
        if(searchlist.length>0){
          addItemBefore('listloading', searchlist);
        }else{
          addItemBefore('listloading', {
            title: alistapi.name+" 未搜索到 “"+input+"”",
            url: "hiker://empty",
            col_type: "text_center_1",
            extra: {
                cls: "loadlist"
            }
          });
        }
        hideLoading();
        return "toast://搜索完成";
      },alistapi),
      col_type: 'scroll_button'
  });
  d.push({
      title: '🔎聚合',
      url: $(getItem('searchtestkey', ''),"搜索关键字").input(()=>{
        setItem("searchtestkey",input);
        require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
        showLoading('搜索中，请稍后...');
        alistSearch2(input);
        hideLoading();
        return "toast://搜索完成";
      }),
      col_type: 'scroll_button'
  });
  if(alistapi.token){
    d.push({
        title: '🔗挂载',
        url: $(["挂载阿里分享"],2).select((alistapi,alistconfig)=>{
          if(input=='挂载阿里分享'){
            if(alistconfig.alitoken){
              return $("","阿里分享链接").input((alistapi,alitoken)=>{
                input = input.replace('https://www.aliyundrive.com/s/','');
                let share_id = input.indexOf('/folder/')>-1?input.split('/folder/')[0]:input;
                let folder_id = input.indexOf('/folder/')>-1?input.split('/folder/')[1]:"root";
                let html = request("https://api.aliyundrive.com/adrive/v3/share_link/get_share_by_anonymous", {body:{"share_id":share_id},method:'POST',timeout:10000});
                let folderlist = JSON.parse(html).file_infos;
                if(folderlist.length==1){
                  let body = {
                    "mount_path": "/阿里分享/自动挂载/"+folderlist[0].file_name,
                    "order": 0,
                    "remark": "",
                    "cache_expiration": 30,
                    "web_proxy": false,
                    "webdav_policy": "302_redirect",
                    "down_proxy_url": "",
                    "extract_folder": "",
                    "driver": "AliyundriveShare",
                    "addition": "{\"refresh_token\":\""+alitoken+"\",\"share_id\":\""+share_id+"\",\"share_pwd\":\"\",\"root_folder_id\":\""+folder_id+"\",\"order_by\":\"\",\"order_direction\":\"\"}"
                  }
                  let result = JSON.parse(request(alistapi.server+"/api/admin/storage/create", {headers:{"Authorization":alistapi.token},body:body,method:'POST',timeout:10000}));
                  if(result.code==200){

                    return "toast://成功";
                  }else if(result.code==500){
                    return "toast://已存在";
                  }
                }
              },alistapi,alistconfig.alitoken)
            }else{
              return "toast://阿里token还未填写，无法挂载";
            }
          }
        },alistapi,alistconfig),
        col_type: 'scroll_button'
    });
  }
  d.push({
      col_type: 'line'
  });
  d.push({
    title: "加载中，请稍后...",
    url: "hiker://empty",
    col_type: "text_center_1",
    extra: {
        id: "listloading",
        lineVisible: false
    }
  })
  setResult(d);

  if (datalist.length > 0) {
    setPageTitle(alistapi.name+' | Alist网盘');
    try{
      let json = JSON.parse(gethtml(alistapi,"/api/fs/list",'/'));
      if(json.code==200){
        let dirlist = getlist(json.data.content||[],1);
        addItemBefore('listloading', arrayAdd(dirlist,1,alistapi));
        
        let filelist = getlist(json.data.content||[],0,alistapi.nofilter?0:fileFilter);
        addItemBefore('listloading', arrayAdd(filelist,0,alistapi));
      }else if(json.code==401){
        toast('登录令牌token失效，需要重新获取');
      }else if(json.code==500){
        toast('获取列表失败，下拉刷新重试.'+json.message);
      }
      updateItem('listloading', {
        title: "““””<small><font color=#f20c00>此规则仅限学习交流使用，请于导入后24小时内删除，任何团体或个人不得以任何方式方法传播此规则的整体或部分！</font></small>"
      });
    }catch(e){
      updateItem('listloading', {
        title: "超时或出错了,下拉刷新重试."
      });
    }
  } else {
    setPageTitle('Alist网盘 | 聚影√');
    updateItem('listloading', {
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
    let json = JSON.parse(gethtml(alistapi,"/api/fs/list",MY_PARAMS.path));
    if(json.code==200){
      let dirlist = getlist(json.data.content||[],1);
      addItemBefore(listid, arrayAdd(dirlist,1,alistapi));

      let filelist = getlist(json.data.content||[],0,alistapi.nofilter?0:fileFilter);
      addItemBefore(listid, arrayAdd(filelist,0,alistapi));
      if(dirlist.length==0&&filelist.length==0){
        addItemBefore(listid, {
          title: "列表为空",
          url: "hiker://empty",
          col_type: "text_center_1"
        });
      }
    }else if(json.code==401){
      toast('登录令牌token失效，需要重新获取');
    }else if(json.code==500){
      toast('获取列表失败，下拉刷新重试.'+json.message);
    }
    updateItem(listid, {
      title: !alistapi.nofilter&&fileFilter?"““””<small><font color=#f20c00>已开启文件过滤，仅显示音视频文件</font></small>":""
    });
  }catch(e){
    log(alistapi.name+'>获取列表失败>'+e.message);
    updateItem(listid, {
      title: "超时或出错了,下拉刷新重试."
    });
  }
}

function arrayAdd(list,isdir,alistapi){
  let d = [];
  if(!isdir){
    var sublist = list.filter(item => {
        return /srt|vtt|ass/.test(item.name.substring(item.name.lastIndexOf('.')+1));
    })
    if(!alistapi.nofilter&&fileFilter&&!isdir){
      list = list.filter(item => {
          return contain.test(item.name.substring(item.name.lastIndexOf('.')+1));
      })
    }
  }

  list.forEach(item => {
    let path = ((item.parent=="/"?"":item.parent)||(typeof(MY_PARAMS)!="undefined"&&MY_PARAMS.path)||"") + "/" + item.name; 
    if(isdir){
      d.push({
        title: item.name,
        img: item.thumb || "hiker://files/cache/src/文件夹.svg",//#noRecordHistory##noHistory#
        url: $("hiker://empty##" + encodeURI(alistapi.server + path)).rule((alistapi,dirname) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          alistList(alistapi,dirname);
        },alistapi,item.name),
        col_type: 'avatar',
        extra: {
          path: path,
          cls: "loadlist"
        }
      })
    }else{
      let name = item.name.substring(0,item.name.lastIndexOf("."));//文件名
      let suffix = item.name.substring(item.name.lastIndexOf('.')+1);//后缀名
      let subtitles = [];
      sublist.forEach(item => {
        if(item.name.indexOf(name)>-1){
          subtitles.push(item.name+"?sign="+(item.sign||""));
        }
      })
      d.push({
        title: item.name,
        img: item.thumb || (music.test(suffix)?"hiker://files/cache/src/音乐.svg":contain.test(suffix)?"hiker://files/cache/src/影片.svg":image.test(suffix)?"hiker://files/cache/src/图片.png":"hiker://files/cache/src/Alist.svg"),
        url: $(encodeURI(alistapi.server+path)).lazyRule((alistapi,path,sign,subtitle) => {
          require(config.依赖.match(/http(s)?:\/\/.*\//)[0] + 'SrcJyAlist.js');
          return alistUrl(alistapi,path,sign,subtitle);
        }, alistapi, path, item.sign||"", subtitles.length>0?subtitles[0]:""),
        col_type: 'avatar',
        extra: {
          id: encodeURI(path),
          cls: typeof(MY_PARAMS)!="undefined"&&contain.test(suffix)?"playlist":typeof(MY_PARAMS)=="undefined"&&contain.test(suffix)?"loadlist playlist":"loadlist",
          longClick: [{
              title: "📋复制链接",
              js: $.toString((url) => {
                  copy(url);
                  return "hiker://empty";
              },encodeURI(alistapi.server+'/d'+path)+'?sign='+(item.sign||""))
          }]
        }
      })
    }
  })
  return d;
}

function alistUrl(alistapi,path,sign,subtitle) {
  let suffix = path.substring(path.lastIndexOf('.')+1);//后缀名
  let url = encodeURI(alistapi.server + "/d"+ path) + "?sign=" + sign;
  subtitle = subtitle?url.match(/http(s)?:\/\/.*\//)[0] + subtitle:"";
  let provider;
  if(contain.test(suffix)){
    try{
      let json = JSON.parse(gethtml(alistapi,"/api/fs/get",path));
      if(json.code==200){
        url = json.data.raw_url || url;
        provider = json.data.provider;
      }
    }catch(e){}
    try{
      if(!music.test(suffix)){
        if(provider=="AliyundriveOpen"){
          try{
            let json = JSON.parse(gethtml(alistapi,"/api/fs/other",path));
            if(json.code==200){
              let playurl = json.data.video_preview_play_info.live_transcoding_task_list;
              playurl.reverse();
              let urls = [];
              let names = [];
              let heads = [];
              urls.push(url);
              names.push('原始 文件');
              heads.push({'Referer':'https://www.aliyundrive.com/'});
              playurl.forEach((item) => {
                urls.push(item.url+"#isVideo=true##pre#");
                names.push(transcoding[item.template_id]?transcoding[item.template_id]:item.template_height);
                heads.push({'Referer':'https://www.aliyundrive.com/'});
              })
              return JSON.stringify({
                  urls: urls,
                  names: names,
                  headers: heads,
                  subtitle: subtitle
              });
            }
          }catch(e){
            log('阿里开放获取多线程失败>'+e.message);
          }
        }else if(provider=="AliyundriveShare"){
          if(typeof(startProxyServer)=="undefined"){
            return "toast://软件需升级新版本才能支持代理播放";
          }
          try{
            let redirect = JSON.parse(request(url,{onlyHeaders:true,redirect:false,timeout:3000}));
            let rurl = redirect.headers.location[0];
            let share_id = rurl.split('&sl=')[1].split('&')[0];
            let file_id = rurl.split('&f=')[1].split('&')[0];
            let alitoken = alistconfig.alitoken;
            let play = getAliUrl(share_id,file_id,alitoken);
            if(play.urls){
              if(subtitle){
                play['subtitle'] = subtitle;
              }
              return JSON.stringify(play);
            }
          }catch(e){}
        }
      } 
        url = url + (music.test(suffix)?"#isMusic=true#":"#isVideo=true#") + (url.indexOf('baidu.com')>-1?';{User-Agent@Lavf/57.83.100}':url.indexOf('aliyundrive')>-1?';{Referer@https://www.aliyundrive.com/}':'');
        if(!subtitle){
          return url;
        }else{
          let urls = [];
          urls.push(url);
          return JSON.stringify({
              urls: urls,
              subtitle: subtitle?url.match(/http(s)?:\/\/.*\//)[0] + subtitle:""
          });
        }
    }catch(e){ }
    return url;
  }else if(image.test(suffix)){
    return url+"@Referer=";
  }else{
    return "download://" + url;
  }
}

function alistSearch(alistapi,input,notoast) {
  let dirlist = [];
  let filelist = [];
  try{
    let headers = {'content-type':'application/json;charset=UTF-8'};
    if(alistapi.token){
      headers.Authorization = alistapi.token;
    }
    let json = JSON.parse(fetch(alistapi.server + "/api/fs/search", {headers:headers,body:{"per_page":100,"page":1,"parent":"/","keywords":input},method:'POST',timeout:10000}));
    if(json.code==200){
      dirlist = getlist(json.data.content,1);
      filelist = getlist(json.data.content,0,alistapi.nofilter?0:fileFilter);
    }else if(json.code==500){
      if(!notoast){toast(alistapi.name+' 搜索失败.'+json.message);}
    }else if(json.code==401){
      if(!notoast){toast(alistapi.name+' 登录令牌token失效，需要重新获取');}
    }
  }catch(e){
    //log(alistapi.name+' 内置搜索出错,偿试小雅搜索>'+e.message);
    try{
      let html = fetch(alistapi.server+'/search?box='+input+'&url=&type=video');
      let list = pdfa(html,'body&&div&&a');
      list.forEach(item => {
        let txt = pdfh(item,"a&&href");
        let parent = txt.substring(0,txt.lastIndexOf("/"));
        let name = txt.substring(txt.lastIndexOf('/')+1);
        let suffix = name.substring(name.lastIndexOf('.')+1);
        if(suffix.length>3 && !contain.test(suffix) && !dirlist.some(d => d.parent+'/'+d.name==parent)){
          dirlist.push({
              "parent": parent,
              "name": name,
              "is_dir": true
          })
        }else if(contain.test(suffix) && !dirlist.some(d => d.parent+'/'+d.name==parent)){
          filelist.push({
              "parent": parent,
              "name": name,
              "is_dir": false
          }) 
        }
      })
    }catch(e){
      log(alistapi.name+'>偿试小雅搜索失败');
    }
  }
  let searchlist = [];
  try{
    let templist = [];
    dirlist.forEach(item => {
      if(!templist.some(s => item.parent.indexOf(s.parent)>-1 && s.parent !='/')){
        templist.push(item);
      }
    })
    
    searchlist = searchlist.concat(arrayAdd(templist,1,alistapi));

    templist =[];
    filelist.forEach(item => {
      if(!dirlist.some(d => item.parent.indexOf(d.parent)>-1 && d.parent !='/') || item.parent =='/'){
        templist.push(item);
      }
    })
    searchlist = searchlist.concat(arrayAdd(templist,0,alistapi));
  }catch(e){
    log(alistapi.name+'>生成搜索数据失败>'+e.message);
  }
  return searchlist;
}

function alistSearch2(input,notoast){
    if(datalist.length==0){
      toast('无接口，无法搜索');
    }
    deleteItemByCls('loadlist');
    let task = function(obj) {
        try{
            let searchlist = alistSearch(obj,input,notoast);
            if(searchlist.length>0){
              searchlist.unshift({
                title: obj.name + " 找到" + searchlist.length + "条 “"+input+"” 相关",
                url: "hiker://empty",
                col_type: "text_center_1",
                extra: {
                    cls: "loadlist"
                }
              });
              searchlist.unshift({
                  col_type: "line_blank",
                  extra: {
                      cls: "loadlist"
                  }
              });
              addItemBefore('listloading', searchlist);
            }else{
              if(!notoast){log(obj.name+">未搜索到 “"+input+"”");}
            }
        }catch(e){
          if(!notoast){log(obj.name+'>搜索失败>'+e.message);}
        }
        return 1;
    }
    let list = datalist.map((item)=>{
        return {
          func: task,
          param: item,
          id: item.server
        }
    });
    if(list.length>0){
        be(list, {
            func: function(obj, id, error, taskResult) {
            },
            param: {
            }
        });
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

function alistSet() {
  setPageTitle('⚙设置 | Alist网盘');
  try{
    eval("var alistData=" + fetch(alistfile));
    let jknum = alistData.drives.length;
  }catch(e){
    var alistData= {drives:[]};
  }
  let alistconfig = alistData.config || {};
  let contain = alistconfig.contain || audiovisual;
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
        if(input){
          alistconfig['contain'] =input.replace(/\./g,"");
        }else{
          delete alistconfig['contain'];
        }
        alistData.config = alistconfig;
        writeFile(alistfile, JSON.stringify(alistData));
        refreshPage(false);
        return 'toast://已设置音视频文件格式后缀';
      }, alistData, alistfile),
      img: "https://lanmeiguojiang.com/tubiao/messy/145.svg",
      col_type: "icon_2"
  });
  d.push({
      col_type: "line"
  });
  d.push({
      title: '增加',
      url: $("","alist链接地址\n如：https://alist.abc.com").input((alistfile) => {
          if(!input.startsWith('http')){
              return 'toast://链接有误';
          }
          if(input.endsWith('/')){
            input = input.slice(0,input.length-1);
          }
          showLoading('正在较验有效性');
          let apiurl = input + "/api/public/settings";
          try{
            let getapi = JSON.parse(fetch(apiurl,{timeout:10000}));
            hideLoading();
            if(getapi.code==200 && /^v3|^3/.test(getapi.data.version)){
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
              return 'toast://不支持v2版本，仅支持v3以上版本';
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
        url: $(["复制地址","分享接口","删除接口","密码管理",item.nofilter?"全局过滤":"禁止过滤","登录令牌","向上进位","向下落位","列表置顶","列表置底"],2).select((item,alistfile)=>{
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
          }else if(input=="登录令牌"){
            return $("","此接口的登录用户名\n留空则清除令牌token").input((api,alistfile) => {
              if(input==""){
                  eval("var alistData=" + fetch(alistfile));
                  let datalist = alistData.drives;
                  let index = datalist.indexOf(datalist.filter(d=>d.server == api)[0]);
                  delete datalist[index].token;
                  alistData.drives = datalist;
                  writeFile(alistfile, JSON.stringify(alistData));
                  return "toast://已清除令牌token，取消登录状态";
              }
              return $("","此接口的登录密码").input((user,api,alistfile) => {
                try{
                  let html = fetch(api+"/api/auth/login", {headers:{'content-type':'application/json;charset=UTF-8' },body: {"Username":user,"Password":input},method:'POST',timeout:10000});
                  let json = JSON.parse(html);
                  if(json.code==200){
                    eval("var alistData=" + fetch(alistfile));
                    let datalist = alistData.drives;
                    let index = datalist.indexOf(datalist.filter(d=>d.server == api)[0]);
                    datalist[index].token = json.data.token;
                    alistData.drives = datalist;
                    writeFile(alistfile, JSON.stringify(alistData));
                    return "toast://登录用户令牌已获取成功";
                  }else{
                    return "toast://" + json.message;
                  }
                }catch(e){
                  return "toast://" + e.message;
                }
              },input,api,alistfile)
            },item.server,alistfile)
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
            } else if (input == "全局过滤" || input == "禁止过滤") {
              let datalist = alistData.drives;
              let index = datalist.indexOf(datalist.filter(d=>d.server == item.server)[0]);
              let sm = "";
              if(input == "禁止过滤"){
                datalist[index].nofilter = true;
                sm = "已设置此接口不过滤文件";
              }else{
                delete datalist[index].nofilter;
                sm = "此接口是否过滤文件交由全局设置";
              }
              alistData.drives = datalist;
              writeFile(alistfile, JSON.stringify(alistData));
              refreshPage(false);
              return 'toast://'+sm;
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
}

evalPrivateJS('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')