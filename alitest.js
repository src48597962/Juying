// ==UserScript==
// @name         阿里云盘助手
// @namespace    http://tampermonkey.net/
// @version      2.0.5
// @author       罗根大人
// @description  支持生成文件下载链接、修改文件后缀,支持第三方播放器Artplayer(突破视频2分钟限制,长按倍速,选集,历史播放)
// @license      MIT
// @icon         https://img.alicdn.com/imgextra/i1/O1CN01JDQCi21Dc8EfbRwvF_!!6000000000236-73-tps-64-64.ico
// @match        https://www.aliyundrive.com/*
// @require      https://cdn.bootcdn.net/ajax/libs/vue/3.2.47/vue.global.min.js
// @require      data:application/javascript,window.Vue%3DVue%3B
// @require      https://cdn.bootcdn.net/ajax/libs/jquery/3.6.3/jquery.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/axios/1.3.4/axios.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/hls.js/1.3.3/hls.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/artplayer/4.6.2/artplayer.min.js
// @require      https://cdn.bootcdn.net/ajax/libs/element-plus/2.2.32/index.full.min.js
// @resource     element-plus/dist/index.css  https://cdn.bootcdn.net/ajax/libs/element-plus/2.2.32/index.min.css
// @grant        GM_getResourceText
// @grant        unsafeWindow
// ==/UserScript==

(t=>{const e=document.createElement("style");e.dataset.source="vite-plugin-monkey",e.innerText=t,document.head.appendChild(e)})(".breadcrumb-item--tV9dn[data-v-c202f97e]{font-size:12px}.player[data-v-12e915cd]{display:flex;height:100%;align-items:center;justify-content:center;flex-direction:column}.notice[data-v-5d43769b]{color:#6592f9;font-size:10pt}.notice1[data-v-5d43769b]{margin:2px 0 0;color:#e6a23c;font-size:8pt}");

var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
(function(elementPlus, $2, axios2, vue, Hls2, Artplayer2) {
  "use strict";
  var monkeyWindow = window;
  var unsafeWindow = /* @__PURE__ */ (() => {
    return monkeyWindow.unsafeWindow;
  })();
  let hideShow = function() {
    let t = $2(".aDrive-notice");
    t.length && "function" == typeof t.remove ? t.remove() : "function" == typeof t.removeNode && t.removeNode(true);
  };
  let showError$1 = function(msg, timeout) {
    let jq = $2;
    hideShow();
    var element = jq(".aDrive div");
    var elementhtml = '<div class="aDrive-notice"><div class="aDrive-notice-content"><div class="aDrive-custom-content aDrive-error"><span data-role="icon" data-render-as="svg" data-icon-type="PDSCloseCircleFill" class="error-icon--1Ov4I icon--d-ejA "><svg viewBox="0 0 1024 1024"><use xlink:href="#PDSCloseCircleFill"></use></svg></span><span><div class="content-wrapper--B7mAG" data-desc="false" style="margin-left: 44px; padding-right: 20px;"><div class="title-wrapper--3bQQ2">' + msg + '<div class="desc-wrapper--218x0"></div></div></div></span></div></div></div>';
    if (element.length) {
      element.append(elementhtml);
    } else {
      jq(document.body).append('<div><div class="aDrive"><div>' + elementhtml + "</div></div></div>");
    }
    var hide = hideShow;
    setTimeout(function() {
      hide();
    }, timeout || 3e3);
  };
  let showSuccess = function(msg, timeout) {
    let jq = $2;
    hideShow();
    let element = jq(".aDrive div");
    let elementhtml = '<div class="aDrive-notice"><div class="aDrive-notice-content"><div class="aDrive-custom-content aDrive-success"><span data-role="icon" data-render-as="svg" data-icon-type="PDSCheckmarkCircleFill" class="success-icon--2Zvcy icon--d-ejA "><svg viewBox="0 0 1024 1024"><use xlink:href="#PDSCheckmarkCircleFill"></use></svg></span><span><div class="content-wrapper--B7mAG" data-desc="false" style="margin-left: 44px; padding-right: 20px;"><div class="title-wrapper--3bQQ2">' + msg + '<div class="desc-wrapper--218x0"></div></div></div></span></div></div>';
    if (element.length) {
      element.append(elementhtml);
    } else {
      jq(document.body).append('<div><div class="aDrive"><div>' + elementhtml + "</div></div></div>");
    }
    var hide = hideShow;
    setTimeout(function() {
      hide();
    }, timeout || 3e3);
  };
  let showDiv = function(title2, app) {
    function format(s, c) {
      return s.replace(/{(\w+)}/g, function(m, p) {
        return c[p];
      });
    }
    let html2 = '<div class="ant-modal-root ant-modal-Link"><div class="ant-modal-mask"></div><div tabindex="-1" class="ant-modal-wrap" role="dialog"><div role="document" class="ant-modal modal-wrapper--2yJKO" style="width: 666px;"><div class="ant-modal-content"><div class="ant-modal-header"><div class="ant-modal-title" id="rcDialogTitle1">{title}</div></div><div class="ant-modal-body"><div class="icon-wrapper--3dbbo"><span data-role="icon" data-render-as="svg" data-icon-type="PDSClose" class="close-icon--33bP0 icon--d-ejA "><svg viewBox="0 0 1024 1024"><use xlink:href="#PDSClose"></use></svg></span></div>';
    html2 = format(html2, {
      title: title2
    });
    html2 += "</div></div></div></div></div></div>";
    $2("body").append(html2);
    app.mount(
      (() => {
        const app2 = document.createElement("div");
        $2(".ant-modal-body").append(app2);
        return app2;
      })()
    );
    $2(".ant-modal-Link .icon-wrapper--3dbbo").one("click", function() {
      $2(".ant-modal-Link").remove();
      app.unmount();
    });
    $2(".ant-modal-Link .ant-modal-wrap").on("click", function(event) {
      if ($2(event.target).closest(".ant-modal-content").length === 0) {
        $2(".ant-modal-Link").remove();
        app.unmount();
      }
    });
  };
  class Store {
    constructor() {
      this.prefix = "LGZS_";
    }
    getAliyun(key = "") {
      let item = localStorage.getItem(key);
      if (!item) {
        return "";
      }
      try {
        return JSON.parse(item);
      } catch (e) {
        return item;
      }
    }
    getItem(key = "") {
      return this.getAliyun(this.prefix + key);
    }
    setItem(key = "", value) {
      localStorage.setItem(this.prefix + key, value instanceof Object ? JSON.stringify(value) : value);
    }
    removeItem(key) {
      if (key == null || key == "") {
        return;
      }
      localStorage.removeItem(this.prefix + key);
    }
  }
  const store = new Store();
  const getDownloadUrl = (data) => axios2.post("/v2/file/get_download_url", data);
  const search = (data) => axios2.post("/adrive/v3/file/search", data);
  const videoUpdate = (data) => axios2.post("/adrive/v2/video/update", data);
  const homeWidgets = () => axios2.post("/apps/v1/users/home/widgets", { "context": { "recentUsed": { "limit": 20 }, "recentSaved": { "limit": 1 } } });
  const shareVideoInfo = (fileId, share_id, shareToken) => axios2({
    method: "post",
    url: "/v2/file/get_share_link_video_preview_play_info",
    data: {
      category: "live_transcoding",
      file_id: fileId,
      get_preview_url: true,
      share_id,
      template_id: "",
      get_subtitle_info: true
    },
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "x-share-token": shareToken
    }
  });
  const videoPreviewPlayInfo = (data) => axios2.post("/v2/file/get_video_preview_play_info", data);
  const shareLinkDownloadUrl = (data, shareToken) => axios2({
    method: "post",
    url: "/v2/file/get_share_link_download_url",
    data: {
      ...data
    },
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "x-share-token": shareToken
    }
  });
  const createSessionUrl = (data, signature, deviceId) => axios2({
    method: "post",
    url: "/users/v1/users/device/create_session",
    data: {
      ...data
    },
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "x-canary": "client=web,app=adrive,version=v3.17.0",
      "_token": false,
      "x-signature": signature,
      "x-device-id": deviceId
    }
  });
  function copy(obj) {
    var newobj = obj.constructor === Array ? [] : {};
    if (typeof obj !== "object") {
      return;
    }
    for (var i in obj) {
      newobj[i] = typeof obj[i] === "object" ? copy(obj[i]) : obj[i];
    }
    return newobj;
  }
  class User {
    constructor() {
      this.is_login = false;
      this.vip_status = 0;
      this.mid = "";
      this.uname = "";
      this.has_init = false;
      this.page = {
        id: "",
        order: "",
        order_by: "",
        // 当前路径文件夹名称
        folderName: "",
        items: []
      };
      this.video = {
        id: "",
        // 时长
        duration: "",
        // 播放的时长
        play_cursor: "",
        // 视频名称
        name: "",
        thumbnail: "",
        // 0 首页自己的视频 1分享的视频
        type: -1,
        //当前视频所在的文件夹名称
        folderName: "",
        //跳转地址
        href: ""
      };
    }
    getVideoPage() {
      return this.video;
    }
    //保存当前播放器设置
    saveVideoPlayerSet(art) {
      let playerSet = {
        // 全屏
        fullscreen: art.fullscreen,
        //网页全屏
        fullscreenWeb: art.fullscreenWeb,
        // 播放速度
        playbackRate: art.playbackRate,
        // 清晰度
        qualityHtml: art.qualityHtml
      };
      store.setItem("playerSet", playerSet);
    }
    // 获取播放器设置页面
    getVideoPlayerSet() {
      let playerSet = store.getItem("playerSet");
      if (playerSet == "") {
        playerSet = {};
      }
      return playerSet;
    }
    // 保存视频信息
    saveVideoInfo(id, name, progress, folderName, href, share2, play_cursor) {
      let videoInfo = {
        "category": "video",
        "name": name,
        "progress": progress,
        "id": id,
        "folderName": folderName,
        "href": href,
        "share": share2,
        "play_cursor": play_cursor
      };
      let list = store.getItem("historyVideo");
      if (list == "") {
        list = [];
      }
      let newList = [videoInfo];
      list.forEach(function(item, index) {
        if (item.id !== id && newList.length <= 5) {
          newList.push(item);
        }
      });
      store.setItem("historyVideo", newList);
    }
    clearAll() {
      store.removeItem("LG_session");
      store.removeItem("x-device-id");
      store.removeItem("x-signature");
      user.clearVideoHistory();
    }
    clearVideoHistory() {
      store.removeItem("historyVideo");
    }
    //获取视频历史列表
    getVideoLookList() {
      let historyVideo = store.getItem("historyVideo");
      if (historyVideo == "") {
        historyVideo = [];
      }
      return historyVideo;
    }
    getDeviceId() {
      return store.getItem("x-device-id");
    }
    getSignature() {
      return store.getItem("x-signature");
    }
    getPage() {
      var page = this.page;
      if (!page.items) {
        page.items = [];
      }
      return page;
    }
    getAria2Set() {
      let aria2Set = store.getItem("Aria2Set");
      if (aria2Set == "") {
        aria2Set = {
          link: "http://localhost:6800/jsonrpc",
          path: "D:/aliyundriveDownloads",
          token: "",
          dirCreate: false
        };
      }
      return aria2Set;
    }
    getVideoSet() {
      let videoSet = store.getItem("VideoSet");
      if (videoSet == "") {
        videoSet = {
          quality: null
        };
      }
      return videoSet;
    }
    setVideoSet(videoSet) {
      store.setItem("VideoSet", videoSet);
    }
    setAria2Set(aria2Set) {
      store.setItem("Aria2Set", aria2Set);
    }
    refSession() {
      let now = new Date().getTime();
      let time = store.getItem("LG_session") || 0;
      let token = user.getToken();
      if (token == null) {
        showError$1("获取当前凭证失败,请刷新或重新登录");
        return;
      } else if (!user.isExpires(token)) {
        showError$1("Token已失效,请刷新或重新登录");
        return;
      }
      let d = user.getDeviceId();
      let s = user.getSignature();
      if (now - time > 18e4 && token.user_id || d == "" || s == "") {
        store.setItem("LG_session", now);
        store.setItem("LG_session_Ref", "true");
      } else {
        console.log("未到刷新时间或者时机");
        return;
      }
      user.session(token, function(a, b) {
        store.removeItem("LG_session_Ref");
      });
    }
    session(token, callback) {
      if (token == null) {
        showError$1("刷新Session失败,token为空,请刷新或重新登录");
        return {};
      }
      return new Promise((resolve, reject) => {
        let deviceId = token.user_id.split("").reverse().join("").substring(0, 20);
        let userId = token.user_id;
        unsafeWindow.luoGenSession(function(p, signature, nd) {
          deviceId = nd;
          console.log("你好,罗根！");
          createSessionUrl({
            "deviceName": "Edge浏览器",
            "modelName": "Windows网页版",
            "pubKey": p
          }, signature, deviceId).then((res) => {
            store.setItem("x-device-id", deviceId);
            store.setItem("x-signature", signature);
            resolve({
              deviceId,
              signature
            });
            callback && callback(p, signature);
          }).catch((e) => {
            reject(e);
            callback && callback();
          });
        }, window.atob("NWRkZTRlMWJkZjllNDk2NmIzODdiYTU4ZjRiM2ZkYzM="), deviceId, userId);
      });
    }
    /**
     * 是否在首页
     */
    home() {
      return location.href.indexOf("com/drive") > 0;
    }
    // 没过期返回true 过期 false
    isExpires(item) {
      if (item == null || !item.expire_time) {
        return false;
      }
      let time = Date.parse(item.expire_time) - Date.now();
      return time > 0;
    }
    getShareToken() {
      return store.getAliyun("shareToken");
    }
    getToken() {
      let token = localStorage.getItem(`token`);
      if (token != null) {
        return JSON.parse(token);
      }
      return token;
    }
    // 获取当前页面上所有的文件
    getAllFileList() {
      let fileList2 = this.getPage().items;
      if (fileList2.length === 0) {
        console.error("获取文件列表失败");
        return [];
      }
      return copy(fileList2);
    }
    // 获取已选择的文件
    selectedFileList() {
      let jq = $2;
      let selectedFileList = [], fileList2 = this.getAllFileList();
      if (fileList2.length === 0) {
        console.error("获取文件列表失败");
        return [];
      }
      let node = "";
      if (jq(".tbody--3Y4Fn  .tr--5N-1q.tr--3Ypim").length) {
        node = jq(".tbody--3Y4Fn  .tr--5N-1q.tr--3Ypim");
      } else if (jq(".outer-wrapper--25yYA").length) {
        node = jq(".outer-wrapper--25yYA");
      }
      node.each(function(index) {
        var $this = jq(node[index]);
        if ($this.attr("data-is-selected") === "true") {
          let data_index = $this.closest("[data-index]").attr("data-index");
          data_index && selectedFileList.push(fileList2[data_index]);
        }
      });
      return copy(selectedFileList);
    }
  }
  const user = new User();
  function handler$2(res) {
    let data = res.data;
    let response = res.response;
    let page = user.getPage();
    let items = [];
    if (page.id === data.parent_file_id && page.order === data.order_direction && page.order_by === data.order_by) {
      items = response.items;
    } else {
      page.id = data.parent_file_id;
      page.order = data.order_direction;
      page.order_by = data.order_by;
      page.items = response.items;
    }
    let folderName = $2(".breadcrumb-item-link--M-p4b:last").text();
    page.folderName = folderName;
    if (items.length > 0) {
      if (!page.items) {
        page.items = [];
      }
      page.items = page.items.concat(response.items);
    }
    console.log(`已加载${page.items.length}个文件`);
    showSuccess(`已加载${page.items.length}个文件`);
  }
  const fileList = () => {
    http.onResponse(function(res, url) {
      let config = res.config;
      try {
        config.data = JSON.parse(config.data);
      } catch (error) {
        config.data = {};
      }
      let response = {
        response: res.response,
        data: config.data
      };
      if (url.indexOf("/file/list") > 0 || url.indexOf("/file/search") > 0) {
        handler$2(response);
      }
    });
  };
  function title(html2) {
    let name = html2.split(" ")[1];
    let css = "display:flex;flex-direction:row;align-items:center;";
    let htmlDiv = `<div style='${css}padding-left:10px;padding-right:10px'>
        <svg t="1677381500723" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2845" width="20" height="20"><path d="M170.666667 213.333333v597.333334h682.666666V213.333333H170.666667zM128 128h768a42.666667 42.666667 0 0 1 42.666667 42.666667v682.666666a42.666667 42.666667 0 0 1-42.666667 42.666667H128a42.666667 42.666667 0 0 1-42.666667-42.666667V170.666667a42.666667 42.666667 0 0 1 42.666667-42.666667z m192 352h85.333333V384H469.333333v256H405.333333v-96h-85.333333V640H256V384h64v96z m298.666667-32v128H682.666667a21.333333 21.333333 0 0 0 21.333333-21.333333v-85.333334a21.333333 21.333333 0 0 0-21.333333-21.333333h-64zM554.666667 384h128a85.333333 85.333333 0 0 1 85.333333 85.333333v85.333334a85.333333 85.333333 0 0 1-85.333333 85.333333h-128V384z" p-id="2846" fill="#ffffff"></path></svg> 
        <p>${name}</p>
    </div>`;
    return htmlDiv;
  }
  function artplayPluginQuality(option) {
    return (art) => {
      let def = option[option.length - 1];
      let loc = user.getVideoPlayerSet().quality;
      var storageQuality;
      if (loc) {
        let quality2 = option.find((item) => item.html === loc);
        if (quality2) {
          quality2["default"] = true;
          storageQuality = quality2.html;
        }
      }
      if (!storageQuality) {
        storageQuality = def.html;
        def["default"] = true;
      }
      let index = option.findIndex(function(item, index2) {
        return item.html === storageQuality;
      });
      var quality = {
        name: "quality",
        position: "right",
        html: title(storageQuality) || "Quality",
        selector: option,
        index: 2,
        onSelect: function(item) {
          art.switchQuality(item.url, item.html);
          console.log(item.html);
          console.log(item.url);
          art.qualityHtml = item.html;
          return title(item.html);
        }
      };
      art.quality_ = quality;
      art.controls.add(quality);
      if (storageQuality) {
        const quality2 = option[index];
        if (quality2) {
          art.url = quality2.url;
          art.qualityHtml = quality2.html;
        } else {
          art.url = option[0].url;
          art.qualityHtml = option[0].html;
        }
      } else {
        art.url = option[0].url;
        art.qualityHtml = option[0].html;
      }
    };
  }
  var cur = `<span  data-role="icon"data-render-as="svg"data-icon-type="PDSPlayCircle"class="icon--2AFV7 icon--d-ejA ">
<svg viewBox="0 0 1024 1024"><use xlink:href="#PDSPlayCircle"></use></svg>
</span>`;
  function html(item, def) {
    let htmlDiv = `<div style='display:flex;flex-direction:row;align-items:center;'  title="${item.name}">
    <p class="title--2vewu " >
        ${def ? cur : ""}
    </p>
        <span class="filename--3hcxw filename_luogen" style="font-size:14px">${item.name}</span>
    </div>
    `;
    return htmlDiv;
  }
  function selector(call) {
    let items = user.getPage().items;
    if (items.length == 0 || $2("#videoHistory").length > 0) {
      return (art) => {
      };
    }
    let fileList2 = items;
    let id = user.getVideoPage().id;
    var videoList = fileList2.filter(function(item, index) {
      return item.category === "video";
    }), fileIndex = videoList.findIndex(function(item, index) {
      return item.file_id === id;
    });
    if (!(fileIndex > -1 && videoList.length > 1))
      return () => {
      };
    console.log("视频数量为：：" + videoList.length);
    return (art) => {
      let option = [];
      videoList.forEach((it, index) => {
        option.push({
          default: index == fileIndex,
          index,
          file: it,
          html: html(it, index == fileIndex)
        });
      });
      let svg = '<svg viewBox="0 0 1024 1024"><use xlink:href="#PDSForwardEndFill" data-spm-anchor-id="0.0.0.i1.54a06c75pIn1n5"></use></svg>';
      if (fileIndex + 1 < videoList.length) {
        art.controls.add({
          name: "next_selector",
          position: "left",
          html: `<i class="art-icon"  title="${videoList[fileIndex + 1].name}">` + svg + "</i>",
          tooltip: videoList[fileIndex + 1].name,
          style: {
            marginRight: "10px"
          },
          click: function() {
            let item = videoList[fileIndex + 1];
            call && call(item);
          }
        });
      }
      art.controls.add({
        name: "selector",
        position: "right",
        html: "选集",
        index: 1,
        selector: option,
        onSelect: function(item) {
          item = item.file;
          call && call(item);
          return "选集 ";
        }
      });
    };
  }
  function subtitle(click) {
    return (art) => {
      art.controls.add({
        name: "subtitle",
        position: "right",
        html: '<i class="" ><svg t="1677394079494" class="icon" viewBox="0 0 1030 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4280" width="18" height="18"><path d="M682.262363 538.229198h-81.871484l-26.684039-68.832692h-121.291086l-25.167901 68.832692h-80.355345l118.25881-303.227717h95.516731z m-137.362156-144.942849l-32.748593-87.936038-31.83891 87.63281z" fill="#dbdbdb" p-id="4281"></path><path d="M197.401244 90.968315v613.429671a90.968315 90.968315 0 0 0 90.968315 90.968315h454.841575a90.968315 90.968315 0 0 0 90.968315-90.968315V90.968315a90.968315 90.968315 0 0 0-90.968315-90.968315h-454.841575a90.968315 90.968315 0 0 0-90.968315 90.968315z m515.487118 613.732899h-394.196032a30.322772 30.322772 0 0 1-30.322771-30.322772V121.291087a30.322772 30.322772 0 0 1 30.322771-30.322772h394.196032a30.322772 30.322772 0 0 1 30.322772 30.322772v552.784128a30.322772 30.322772 0 0 1-30.625999 30.625999z" fill="#dbdbdb" p-id="4282"></path><path d="M985.49008 568.855197a45.484158 45.484158 0 0 0-45.484158 45.484157v287.763104a30.322772 30.322772 0 0 1-30.322771 30.322771H121.291087a30.322772 30.322772 0 0 1-30.322772-30.322771v-287.763104a45.484158 45.484158 0 0 0-45.484157-45.484157 45.484158 45.484158 0 0 0-45.484158 45.484157v318.692331a90.968315 90.968315 0 0 0 90.968315 90.968315h849.037607a90.968315 90.968315 0 0 0 90.968315-90.968315V614.339354a45.484158 45.484158 0 0 0-45.484157-45.484157zM682.262363 538.229198h-81.871484l-26.684039-68.832692h-121.291086l-25.167901 68.832692h-80.355345l118.25881-303.227717h95.516731z m-137.362156-144.942849l-32.748593-87.936038-31.83891 87.63281z" fill="#dbdbdb" p-id="4283"></path><path d="M197.401244 90.968315v613.429671a90.968315 90.968315 0 0 0 90.968315 90.968315h454.841575a90.968315 90.968315 0 0 0 90.968315-90.968315V90.968315a90.968315 90.968315 0 0 0-90.968315-90.968315h-454.841575a90.968315 90.968315 0 0 0-90.968315 90.968315z m515.487118 613.732899h-394.196032a30.322772 30.322772 0 0 1-30.322771-30.322772V121.291087a30.322772 30.322772 0 0 1 30.322771-30.322772h394.196032a30.322772 30.322772 0 0 1 30.322772 30.322772v552.784128a30.322772 30.322772 0 0 1-30.625999 30.625999z" fill="#dbdbdb" p-id="4284"></path><path d="M985.49008 568.855197a45.484158 45.484158 0 0 0-45.484158 45.484157v287.763104a30.322772 30.322772 0 0 1-30.322771 30.322771H121.291087a30.322772 30.322772 0 0 1-30.322772-30.322771v-287.763104a45.484158 45.484158 0 0 0-45.484157-45.484157 45.484158 45.484158 0 0 0-45.484158 45.484157v318.692331a90.968315 90.968315 0 0 0 90.968315 90.968315h849.037607a90.968315 90.968315 0 0 0 90.968315-90.968315V614.339354a45.484158 45.484158 0 0 0-45.484157-45.484157z" fill="#dbdbdb" p-id="4285"></path></svg></i>字幕',
        index: 2,
        style: {
          marginLeft: "10px"
        },
        click
      });
    };
  }
  var doubleSpeed = function(art) {
    art.notice.show = "倍速播放 x3";
    art.playbackRate = 3;
  };
  function hotkey() {
    return (art) => {
      var rightCount = 0;
      var playbackRate = null;
      var rightInterval = null;
      var logKey = false;
      document.onkeyup = function(event) {
        if (event.code === "ArrowRight") {
          if (rightCount === 1) {
            art.currentTime = art.currentTime + 5;
          }
          logKey = false;
          if (rightInterval) {
            window.clearInterval(rightInterval);
          }
          rightInterval = null;
          rightCount = 0;
          if (playbackRate) {
            art.playbackRate = playbackRate;
            playbackRate = null;
          }
        }
      };
      document.onkeydown = function(event) {
        if (event.code === "ArrowRight") {
          rightCount += 1;
          if (!playbackRate) {
            playbackRate = art.playbackRate;
          }
          if (!rightInterval) {
            rightInterval = setInterval(function() {
              if (rightCount > 100) {
                rightCount = 2;
              }
              if (rightCount > 1 && !logKey) {
                doubleSpeed(art);
                logKey = true;
              }
            }, 100);
          }
        } else if (event.code === "ArrowLeft") {
          art.currentTime = art.currentTime - 5;
        } else if (event.code === "ArrowUp") {
          art.volume = art.volume + 0.01;
        } else if (event.code === "ArrowDown") {
          art.volume = art.volume - 0.01;
        } else if (event.code === "Space") {
          art.toggle();
        } else if (event.code === "Enter") {
          art.fullscreen = !art.fullscreen;
        }
      };
    };
  }
  function saveCloud(art) {
    let token = user.getToken();
    if (token == null) {
      return;
    }
    let v = user.getVideoPage();
    videoUpdate({
      drive_id: token.default_drive_id,
      duration: art.duration,
      file_id: v.id,
      play_cursor: art.currentTime
    }).then((res) => {
    });
  }
  function saveExit() {
    return (art) => {
      art.on("ready", () => {
        let v = user.getVideoPage();
        if (v.play_cursor) {
          art.seek = v.play_cursor;
        } else {
          let list = user.getVideoLookList();
          let index = list.findIndex((item) => {
            return item.id == v.id;
          });
          if (index != -1) {
            art.seek = list[index].play_cursor;
          }
        }
        let plset = user.getVideoPlayerSet();
        if (plset.fullscreen) {
          art.fullscreen = true;
        }
        if (plset.fullscreenWeb) {
          art.fullscreenWeb = true;
        }
        if (plset.playbackRate) {
          art.playbackRate = plset.playbackRate;
        }
      });
      art.on("destroy", () => {
        let v = user.getVideoPage();
        if (v.type == 0) {
          saveCloud(art);
        }
        user.saveVideoPlayerSet(art);
        let currentTime = art.currentTime;
        let progress = parseInt(currentTime / art.duration * 100);
        art.hls.destroy();
        let items = user.getPage().items;
        let index = items.findIndex((it) => {
          return it.file_id == v.id;
        });
        if (index != -1) {
          if (!items[index].user_meta) {
            items[index].user_meta = "{}";
          }
          let meta = JSON.parse(items[index].user_meta);
          meta.play_cursor = currentTime;
          items[index].user_meta = JSON.stringify(meta);
        }
        let folderName;
        let href = v.href;
        if (v.type == 1) {
          folderName = "来自分享";
        } else {
          folderName = v.folderName;
        }
        user.saveVideoInfo(v.id, v.name, progress, folderName, href, v.type == 1, currentTime);
      });
    };
  }
  const SubTitle_vue_vue_type_style_index_0_scoped_c202f97e_lang = "";
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _withScopeId$1 = (n) => (vue.pushScopeId("data-v-c202f97e"), n = n(), vue.popScopeId(), n);
  const _hoisted_1$3 = { class: "bread-container--npII5" };
  const _hoisted_2$3 = {
    class: "breadcrumb-wrap--2iqqe",
    "data-align": "left"
  };
  const _hoisted_3$3 = {
    class: "breadcrumb--2FqFQ",
    "data-calc": "true"
  };
  const _hoisted_4$3 = ["data-label", "onClick", "data-key"];
  const _hoisted_5$3 = {
    class: "breadcrumb-item-link--M-p4b",
    "data-spm-anchor-id": "0.0.0.i5.54a06c75zaT9h6"
  };
  const _hoisted_6$3 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("div", { class: "breadcrumb-item-separator--r1w8a" }, "›", -1));
  const _hoisted_7$3 = {
    key: 0,
    class: "list--13IBL"
  };
  const _hoisted_8$3 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("div", { class: "placeholder---npkN" }, [
    /* @__PURE__ */ vue.createElementVNode("img", {
      src: "https://img.alicdn.com/imgextra/i2/O1CN018yXBXY1caApf7qUew_!!6000000003616-2-tps-224-224.png",
      alt: "empty folder"
    }),
    /* @__PURE__ */ vue.createElementVNode("span", null, "文件夹为空")
  ], -1));
  const _hoisted_9$3 = [
    _hoisted_8$3
  ];
  const _hoisted_10$3 = ["onClick"];
  const _hoisted_11$3 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("img", {
    alt: "folder",
    class: "file-icon--3CoKG fileicon--vNn4M",
    draggable: "false",
    src: "https://img.alicdn.com/imgextra/i1/O1CN01rGJZac1Zn37NL70IT_!!6000000003238-2-tps-230-180.png"
  }, null, -1));
  const _hoisted_12$3 = ["title", "onClick"];
  const _hoisted_13$3 = /* @__PURE__ */ _withScopeId$1(() => /* @__PURE__ */ vue.createElementVNode("img", {
    alt: "others",
    class: "file-icon--3CoKG fileicon--vNn4M",
    draggable: "false",
    src: "https://img.alicdn.com/imgextra/i2/O1CN01ROG7du1aV18hZukHC_!!6000000003334-2-tps-140-140.png"
  }, null, -1));
  const _sfc_main$4 = {
    __name: "SubTitle",
    emits: ["selectSubTitle"],
    setup(__props, { expose, emit }) {
      const data = vue.ref([]);
      const path = vue.ref([]);
      vue.onMounted(() => {
        getFileList("root", "全部文件");
      });
      function selectFile(fileInfo) {
        elementPlus.ElMessageBox.confirm(
          `确认加载《${fileInfo.name}》字幕文件吗？`,
          "字幕选择",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消"
          }
        ).then(() => {
          emit("selectSubTitle", fileInfo);
        });
      }
      function getFileList(parent_file_id, name) {
        if (path.value.length != 0) {
          let last = path.value[path.value.length - 1];
          if (last.id == parent_file_id) {
            return;
          }
          let index = path.value.findIndex((item, index2) => {
            return item.id === parent_file_id;
          });
          if (index != -1) {
            path.value = path.value.splice(0, index);
          }
        }
        path.value.push({
          id: parent_file_id,
          name
        });
        search({
          "drive_id": "723102202",
          "query": `parent_file_id = "${parent_file_id}" and (type = "folder" or file_extension in ["srt", "ass", "vtt"])`,
          "order_by": "type ASC,updated_at DESC",
          "limit": 20,
          "image_thumbnail_process": "image/resize,w_256/format,jpeg",
          "image_url_process": "image/resize,w_1920/format,jpeg/interlace,1",
          "video_thumbnail_process": "video/snapshot,t_1000,f_jpg,ar_auto,w_256"
        }).then((res) => {
          data.value.length = 0;
          data.value = res.data.items;
        }).catch((e) => {
          console.log(e);
          if (e && e + "" == "AxiosError: Request failed with status code 429") {
            showError$1("您操作的太快了! 请稍候点击下方按钮，刷新尝试");
          } else {
            showError$1(e + "");
          }
        });
      }
      expose({
        getFileList
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", null, [
          vue.createElementVNode("div", _hoisted_1$3, [
            vue.createElementVNode("div", _hoisted_2$3, [
              vue.createElementVNode("div", _hoisted_3$3, [
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(path.value, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    key: index,
                    class: "breadcrumb-item--tV9dn",
                    "data-label": item.name,
                    onClick: vue.withModifiers(($event) => getFileList(item.id, item.name), ["stop"]),
                    "data-key": item.id,
                    "data-hide": "false",
                    "data-more": "false"
                  }, [
                    vue.createElementVNode("div", _hoisted_5$3, vue.toDisplayString(item.name), 1),
                    _hoisted_6$3
                  ], 8, _hoisted_4$3);
                }), 128))
              ])
            ])
          ]),
          data.value.length == 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_7$3, _hoisted_9$3)) : vue.createCommentVNode("", true),
          (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(data.value, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("div", { key: index }, [
              item.type == "folder" ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 0,
                class: "item--18Z6t",
                onClick: vue.withModifiers(($event) => getFileList(item.file_id, item.name), ["stop"])
              }, [
                _hoisted_11$3,
                vue.createElementVNode("span", null, vue.toDisplayString(item.name), 1)
              ], 8, _hoisted_10$3)) : vue.createCommentVNode("", true),
              item.type == "file" ? (vue.openBlock(), vue.createElementBlock("div", {
                key: 1,
                class: "item--18Z6t",
                title: item.name,
                onClick: vue.withModifiers(($event) => selectFile(item), ["stop"])
              }, [
                _hoisted_13$3,
                vue.createElementVNode("span", null, vue.toDisplayString(item.name), 1)
              ], 8, _hoisted_12$3)) : vue.createCommentVNode("", true)
            ]);
          }), 128))
        ]);
      };
    }
  };
  const SubTitle = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-c202f97e"]]);
  const VideoPage_vue_vue_type_style_index_0_scoped_12e915cd_lang = "";
  const _sfc_main$3 = {
    __name: "VideoPage",
    setup(__props) {
      const artRef = vue.ref();
      const subtitleRef = vue.ref();
      const table = vue.ref(false);
      const retry = vue.reactive({
        error: false,
        text: "",
        title: "",
        loading: false
      });
      const transcoding = {
        UHD: "4K 超清",
        QHD: "2K 超清",
        FHD: "1080 全高清",
        HD: "720 高清",
        SD: "540 标清",
        LD: "360 流畅"
      };
      var options = {};
      let instance;
      vue.onMounted(() => {
        getVideoInfo(artp);
      });
      function getOption(video) {
        let play_info = video.video_preview_play_info;
        let task_list = play_info.live_transcoding_task_list;
        var option = [];
        task_list.forEach(function(item, index) {
          let name = transcoding[item.template_id];
          if (!name) {
            return;
          }
          if (item.url != "") {
            option.push({
              html: name,
              url: item.url || item.preview_url
            });
          }
        });
        return option;
      }
      function artp(video) {
        var option = getOption(video);
        instance = new Artplayer2({
          container: artRef.value,
          settings: [
            {
              html: "画中画",
              icon: '<i class="art-icon art-icon-pip"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" height="32" width="32"><path d="M25 17h-8v6h8v-6Zm4 8V10.98C29 9.88 28.1 9 27 9H9c-1.1 0-2 .88-2 1.98V25c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2Zm-2 .02H9V10.97h18v14.05Z"></path></svg></i>',
              switch: false,
              tooltip: "Close",
              onSwitch: function(item, $dom, event) {
                console.info(item, $dom, event);
                const nextState = !item.switch;
                instance.pip = nextState;
                item.tooltip = nextState ? "Open" : "Close";
                return nextState;
              }
            }
          ],
          plugins: [
            // 清晰度
            artplayPluginQuality(option),
            // 上下集
            selector(function(item) {
              instance.destroy(false);
              let vInfo = user.getVideoPage();
              vInfo.id = item.file_id;
              if (!item.user_meta) {
                item.user_meta = "{}";
              }
              let meta = JSON.parse(item.user_meta);
              vInfo.duration = meta.duration;
              vInfo.play_cursor = meta.play_cursor;
              vInfo.name = item.name;
              vInfo.thumbnail = item.thumbnail;
              getVideoInfo(artp);
            }),
            //快捷键
            hotkey(),
            // 字幕插件
            subtitle(openSubTitle),
            // 偏好设置
            saveExit()
          ],
          ...options
        });
        instance.on("error", function(e) {
          console.log(e);
        });
        instance.on("ready", () => {
          console.log(instance.qualityHtml);
          instance.play();
        });
        instance.on("destroy", () => {
          console.info("destroy");
        });
      }
      function getExt(url) {
        if (url.includes("?")) {
          return getExt(url.split("?")[0]);
        }
        if (url.includes("#")) {
          return getExt(url.split("#")[0]);
        }
        return url.trim().toLowerCase().split(".").pop();
      }
      function selectSubTitle(fileInfo) {
        console.log(fileInfo.download_url);
        table.value = false;
        instance.subtitle.switch(fileInfo.download_url, {
          type: getExt(fileInfo.name)
        });
        instance.play();
      }
      function openSubTitle() {
        instance.pause();
        table.value = true;
      }
      function retryClick() {
        retry.loading = true;
        getVideoInfo(artp);
      }
      var hlsErrorHandler = function(event, data, art) {
        if (art.hls.error == -1) {
          console.log("在处理了");
          return;
        }
        var errorType = data.type;
        var errorDetails = data.details;
        var errorFatal = data.fatal;
        console.log(errorType);
        console.log(errorDetails);
        console.log(errorFatal);
        if (art.hls.error) {
          art.hls.error += 1;
        } else {
          art.hls.error = 1;
        }
        if (data.details == "fragLoadError" && (errorFatal || art.hls.error >= 4)) {
          art.hls.error = -1;
          retry403(art);
        } else if (errorType == "networkError" && errorFatal) {
          elementPlus.ElNotification({
            title: "网络错误",
            message: "请检查网络配置后，刷新页面",
            type: "error"
          });
        }
      };
      function m3u8Hls(video, url, art) {
        art.hls = new Hls2();
        art.hls.loadSource(url);
        art.hls.attachMedia(video);
        video.addEventListener("loadstart", function(e) {
          console.log("提示视频的元数据已加载" + video.src);
          if (art.hlsCurrentTime403) {
            video.currentTime = art.hlsCurrentTime403;
          }
        });
        art.hls.on(Hls2.Events.ERROR, function(e, d) {
          hlsErrorHandler(e, d, art);
        });
      }
      function retry403(art) {
        getVideoInfo(function(data) {
          let option = getOption(data);
          let index = option.findIndex(function(item2, index2) {
            return item2.html === art.qualityHtml;
          });
          if (index == -1) {
            index = option.length - 1;
          }
          let item = option[index];
          item["default"] = true;
          art.quality_.selector = option;
          art.hlsCurrentTime403 = art.currentTime;
          art.hls.destroy();
          art.hls.error = 0;
          art.hls = new Hls2();
          art.hls.loadSource(item.url);
          art.hls.attachMedia(art.video);
          art.hls.on(Hls2.Events.ERROR, function(e, d) {
            hlsErrorHandler(e, d, art);
          });
        });
      }
      function getVideoInfo(call) {
        let token = user.getToken();
        if (token == null) {
          elementPlus.ElMessageBox.alert("当前登录凭证获取为空，请刷新或重新登录", {
            confirmButtonText: "获取凭证失败",
            callback: (action) => {
              location.href = location.href;
            }
          });
          return;
        }
        let videoInfo = user.getVideoPage();
        let req;
        if (videoInfo.type == 0) {
          req = videoPreviewPlayInfo({
            category: "live_transcoding",
            drive_id: token.default_drive_id,
            file_id: videoInfo.id,
            template_id: "FHD|HD|SD|LD",
            url_expire_sec: 14400,
            get_subtitle_info: true
          });
        } else if (videoInfo.type == 1) {
          let shareToken = user.getShareToken();
          if (!user.isExpires(shareToken)) {
            elementPlus.ElMessageBox.alert("很抱歉，当前页面太久没活动了，请点击刷新后再来观看吧", "分享凭证失效", {
              confirmButtonText: "刷新",
              callback: (action) => {
                location.href = location.href;
              }
            });
          }
          req = shareVideoInfo(videoInfo.id, shareToken.share_id, shareToken.share_token);
        }
        req.then((res) => {
          retry.error = false;
          options = {
            id: videoInfo.id,
            poster: videoInfo.thumbnail,
            title: videoInfo.name,
            type: "m3u8",
            customType: {
              m3u8: m3u8Hls
            },
            subtitleOffset: true,
            flip: true,
            setting: true,
            playbackRate: true,
            aspectRatio: true,
            fullscreen: true,
            fullscreenWeb: true,
            miniProgressBar: true,
            autoplay: true,
            screenshot: true,
            hotkey: false,
            airplay: true,
            volume: 1,
            contextmenu: []
          };
          if (videoInfo.type == 0) {
            $2(".text--2KGvI").text(videoInfo.name);
          } else if (videoInfo.type == 1) {
            $2(".header-file-name--CN_fq").text(videoInfo.name);
          }
          call && call(res.data);
        }).catch((e) => {
          if (instance) {
            instance.pause();
            instance.destroy(false);
          }
          console.log(e);
          if (e && e + "" == "AxiosError: Request failed with status code 429") {
            retry.text = "请稍候点击下方按钮，刷新尝试";
            retry.title = "您操作的太快了";
          } else {
            retry.title = "接口问题";
            retry.text = e + "";
          }
          retry.error = true;
        }).finally(() => {
          retry.loading = false;
        });
      }
      vue.onUnmounted(() => {
        if (instance) {
          instance.destroy(false);
        }
        console.log("视频页面销毁");
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(vue.unref(elementPlus.ElDrawer), {
            modelValue: table.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => table.value = $event),
            title: "请选择字幕文件",
            direction: "rtl",
            size: "25%"
          }, {
            default: vue.withCtx(() => [
              vue.createVNode(SubTitle, {
                onSelectSubTitle: selectSubTitle,
                ref_key: "subtitleRef",
                ref: subtitleRef
              }, null, 512)
            ]),
            _: 1
          }, 8, ["modelValue"]),
          vue.withDirectives(vue.createElementVNode("div", {
            class: "player",
            ref_key: "artRef",
            ref: artRef
          }, null, 512), [
            [vue.vShow, !retry.error]
          ]),
          vue.withDirectives(vue.createVNode(vue.unref(elementPlus.ElResult), {
            title: retry.title,
            "sub-title": retry.text
          }, {
            extra: vue.withCtx(() => [
              vue.createVNode(vue.unref(elementPlus.ElButton), {
                type: "primary",
                loading: retry.loading,
                onClick: vue.withModifiers(retryClick, ["stop"])
              }, {
                default: vue.withCtx(() => [
                  vue.createTextVNode("刷新")
                ]),
                _: 1
              }, 8, ["loading", "onClick"])
            ]),
            _: 1
          }, 8, ["title", "sub-title"]), [
            [vue.vShow, retry.error]
          ])
        ], 64);
      };
    }
  };
  const VideoPage = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-12e915cd"]]);
  var interval;
  function initVideoPlayer(videoFile) {
    let node = $2(".video-previewer--1vo5c");
    if (node.length <= 0) {
      if (interval == null) {
        interval = setInterval(function() {
          initVideoPlayer(videoFile);
        }, 200);
      }
      return;
    } else {
      clearInterval(interval);
      interval = null;
    }
    let vInfo = user.getVideoPage();
    vInfo.id = videoFile.file_id;
    if (videoFile.user_meta) {
      try {
        let meta = JSON.parse(videoFile.user_meta);
        if (meta.duration) {
          vInfo.duration = meta.duration;
        }
        if (meta.play_cursor) {
          vInfo.play_cursor = meta.play_cursor;
        }
      } catch (error) {
        console.error(error);
      }
    }
    vInfo.name = videoFile.name;
    vInfo.thumbnail = videoFile.thumbnail;
    vInfo.folderName = user.getPage().folderName;
    vInfo.type = 0;
    vInfo.href = location.href;
    var app = vue.createApp(VideoPage);
    app.mount(
      (() => {
        console.log("我创建了1");
        const app2 = $2(`<div id="videoPage" class='video-previewer--1vo5c'></div>`)[0];
        node.replaceWith(app2);
        return app2;
      })()
    );
    $2(".header-left--3QcN-").on("click", function() {
      app.unmount();
    });
  }
  function homeVideo(videoFile) {
    if (interval != null) {
      clearInterval(interval);
    }
    initVideoPlayer(videoFile);
  }
  function shareVideo$1(videoFile) {
    let node = $2(".video-previewer--1ESTK");
    if (node.length <= 0) {
      if (interval == null) {
        interval = setInterval(function() {
          shareVideo$1(videoFile);
        }, 200);
      }
      return;
    } else {
      clearInterval(interval);
      interval = null;
    }
    let it = user.getPage().items;
    let index = it.findIndex((item) => {
      return item.file_id == videoFile.file_id;
    });
    console.log(index);
    if (index == -1) {
      elementPlus.ElMessageBox.alert("手速太快啦，请回到文件列表中，随便点击排序，看到已加载多少文件时,在进来吧", "操作页面过快", {
        confirmButtonText: "去排序",
        callback: (action) => {
          location.href = location.href;
        }
      });
      return;
    }
    let v = it[index];
    v.user_meta = "{}";
    let vInfo = user.getVideoPage();
    let list = user.getVideoLookList();
    index = list.findIndex((item) => {
      return item.id == videoFile.file_id;
    });
    if (index != -1) {
      vInfo.play_cursor = list[index].play_cursor;
    }
    vInfo.id = v.file_id;
    vInfo.name = v.name;
    vInfo.thumbnail = v.thumbnail;
    vInfo.type = 1;
    vInfo.folderName = "来自分享";
    vInfo.href = location.href;
    var app = vue.createApp(VideoPage);
    app.mount(
      (() => {
        const app2 = $2(`<div id="videoPage" class='video-previewer--1vo5c'></div>`)[0];
        node.replaceWith(app2);
        return app2;
      })()
    );
    $2(".header-icon--bJn--").on("click", function() {
      app.unmount();
    });
  }
  function handler$1(res) {
    let response = res.response;
    if (response.category && response.category === "video") {
      homeVideo(response);
    }
  }
  const fileGet = () => {
    http.onResponse(function(res, url) {
      let config = res.config;
      try {
        config.data = JSON.parse(config.data);
      } catch (error) {
        config.data = {};
      }
      let response = {
        response: res.response,
        data: config.data
      };
      if (url.endsWith("/file/get")) {
        handler$1(response);
      }
    });
  };
  function handler(res) {
    let response = res.response;
    let shareToken = user.getShareToken();
    if (!user.isExpires(shareToken) || shareToken.share_id != response.share_id) {
      showError("当前页面已过期，请刷新重试");
      return;
    }
    shareVideo$1(response);
  }
  const shareVideo = () => {
    http.onResponse(function(res, url) {
      let config = res.config;
      try {
        config.data = JSON.parse(config.data);
      } catch (error) {
        config.data = {};
      }
      let response = {
        response: res.response,
        data: config.data
      };
      if (url.indexOf("get_video_preview_play_info_by_share") > 0) {
        handler(response);
      }
    });
  };
  const fileUpdate = () => {
    http.onRequest(function(req) {
      if (req.url.endsWith("v3/file/update")) {
        let reqbody = JSON.parse(req.data[0]);
        let name = reqbody.name;
        let i = name.lastIndexOf(".");
        if (i === -1) {
          return;
        }
        let newName = name.substring(0, i);
        if (newName.lastIndexOf(".") !== -1) {
          reqbody.name = newName;
          req.data[0] = JSON.stringify(reqbody);
        }
      }
    });
  };
  const xhrHandler = () => {
    fileList();
    fileGet();
    shareVideo();
    fileUpdate();
  };
  class XMLHttp {
    constructor() {
      __publicField(this, "request", function(param) {
      });
      __publicField(this, "response", function(param) {
      });
      __publicField(this, "onRequest", function(cal) {
        this.requestListen.push(cal);
      });
      __publicField(this, "onResponse", function(cal) {
        this.responseListen.push(cal);
      });
      this.responseListen = [];
      this.requestListen = [];
    }
  }
  function initXMLHttpRequest(http2) {
    let open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(...args) {
      let send = this.send;
      let _this = this;
      let post_data = [];
      this.send = function(...data) {
        post_data = data;
        let dataBody = {
          url: args[1],
          method: args[0],
          headers: {},
          data
        };
        if (_this._header_) {
          dataBody.headers = _this._header_;
        }
        http2.request(dataBody);
        return send.apply(_this, data);
      };
      this.addEventListener("readystatechange", function() {
        if (this.readyState === 4) {
          let config = {
            url: args[1],
            status: this.status,
            method: args[0],
            data: post_data
          };
          let res = this.response;
          if (_this._header_ && _this._header_["fileId"]) {
            return;
          }
          if (typeof res == "string") {
            try {
              res = JSON.parse(this.response);
            } catch (e) {
              console.log("解析出问题了， ", e);
              return;
            }
          }
          http2.response({ config, response: res });
        }
      }, false);
      return open.apply(this, args);
    };
  }
  const http = new XMLHttp();
  function listen() {
    xhrHandler();
    http.request = function(req) {
      if (this.requestListen.length > 0) {
        this.requestListen.forEach((i) => {
          i(req);
        });
      }
    };
    http.response = function(res) {
      if (this.responseListen.length > 0) {
        let config = res.config;
        this.responseListen.forEach((i) => {
          i(res, config.url);
        });
      }
    };
    initXMLHttpRequest(http);
  }
  function loadScript(src) {
    if (!window.instances) {
      window.instances = {};
    }
    if (!window.instances[src]) {
      window.instances[src] = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.type = "text/javascript";
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return window.instances[src];
  }
  /*! Element Plus Icons Vue v2.0.10 */
  var export_helper_default = (sfc, props) => {
    let target = sfc.__vccOpts || sfc;
    for (let [key, val] of props)
      target[key] = val;
    return target;
  };
  var refresh_vue_vue_type_script_lang_default = {
    name: "Refresh"
  };
  var _hoisted_1217 = {
    viewBox: "0 0 1024 1024",
    xmlns: "http://www.w3.org/2000/svg"
  }, _hoisted_2217 = /* @__PURE__ */ vue.createElementVNode("path", {
    fill: "currentColor",
    d: "M771.776 794.88A384 384 0 0 1 128 512h64a320 320 0 0 0 555.712 216.448H654.72a32 32 0 1 1 0-64h149.056a32 32 0 0 1 32 32v148.928a32 32 0 1 1-64 0v-50.56zM276.288 295.616h92.992a32 32 0 0 1 0 64H220.16a32 32 0 0 1-32-32V178.56a32 32 0 0 1 64 0v50.56A384 384 0 0 1 896.128 512h-64a320 320 0 0 0-555.776-216.384z"
  }, null, -1), _hoisted_3216 = [
    _hoisted_2217
  ];
  function _sfc_render217(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("svg", _hoisted_1217, _hoisted_3216);
  }
  var refresh_default = /* @__PURE__ */ export_helper_default(refresh_vue_vue_type_script_lang_default, [["render", _sfc_render217], ["__file", "refresh.vue"]]);
  const cssLoader = (e) => {
    const t = GM_getResourceText(e), o = document.createElement("style");
    return o.innerText = t, document.head.append(o), t;
  };
  cssLoader("element-plus/dist/index.css");
  const _hoisted_1$2 = {
    key: 0,
    class: "ant-modal-root",
    id: "aria2-set-box"
  };
  const _hoisted_2$2 = /* @__PURE__ */ vue.createElementVNode("div", { class: "ant-modal-mask" }, null, -1);
  const _hoisted_3$2 = {
    tabindex: "-1",
    class: "ant-modal-wrap",
    role: "dialog"
  };
  const _hoisted_4$2 = {
    role: "document",
    class: "ant-modal modal-wrapper--2yJKO",
    style: { "width": "340px", "transform-origin": "-14px 195px" }
  };
  const _hoisted_5$2 = { class: "ant-modal-content" };
  const _hoisted_6$2 = /* @__PURE__ */ vue.createElementVNode("div", { class: "ant-modal-header" }, [
    /* @__PURE__ */ vue.createElementVNode("div", { class: "ant-modal-title" }, " Aria2设置 ")
  ], -1);
  const _hoisted_7$2 = { class: "ant-modal-body" };
  const _hoisted_8$2 = /* @__PURE__ */ vue.createElementVNode("span", {
    "data-role": "icon",
    "data-render-as": "svg",
    "data-icon-type": "PDSClose",
    class: "close-icon--33bP0 icon--d-ejA"
  }, [
    /* @__PURE__ */ vue.createElementVNode("svg", { viewBox: "0 0 1024 1024" }, [
      /* @__PURE__ */ vue.createElementVNode("use", { "xlink:href": "#PDSClose" })
    ])
  ], -1);
  const _hoisted_9$2 = [
    _hoisted_8$2
  ];
  const _hoisted_10$2 = /* @__PURE__ */ vue.createElementVNode("div", null, " 推送链接： ", -1);
  const _hoisted_11$2 = { class: "content-wrapper--1_WJv" };
  const _hoisted_12$2 = /* @__PURE__ */ vue.createElementVNode("div", null, " 推送路径： ", -1);
  const _hoisted_13$2 = { class: "content-wrapper--1_WJv" };
  const _hoisted_14$2 = /* @__PURE__ */ vue.createElementVNode("div", null, " RPC密钥： ", -1);
  const _hoisted_15$2 = { class: "content-wrapper--1_WJv" };
  const _hoisted_16$2 = /* @__PURE__ */ vue.createElementVNode("div", null, " 其他： ", -1);
  const _hoisted_17$2 = { class: "content-wrapper--1_WJv" };
  const _hoisted_18$1 = { class: "ant-input ant-input-borderless input--3oFR6" };
  const _hoisted_19$1 = { class: "ant-modal-footer" };
  const _hoisted_20$1 = { class: "footer--3Q0je" };
  const _hoisted_21$1 = ["onClick"];
  const _sfc_main$2 = {
    __name: "Aria2Set",
    setup(__props, { expose }) {
      const data = vue.reactive({
        isShowAria2Set: false,
        pushBtonText: "Aria2 推送",
        aria2Model: user.getAria2Set()
      });
      function saveAria2() {
        user.setAria2Set(data.aria2Model);
        data.isShowAria2Set = false;
        showSuccess("Aria2配置保存成功");
      }
      function aria2Push(fileList2, call) {
        if (data.pushBtonText == "正在推送") {
          return;
        }
        let folderName = "";
        if (data.aria2Model.dirCreate) {
          let dir = $2(".breadcrumb--2FqFQ[data-calc=true] > .breadcrumb-item--tV9dn > .breadcrumb-item-link--M-p4b");
          folderName = "/阿里云盘";
          for (let i = 0; i < dir.length; i++) {
            folderName += "/" + dir[i].innerText;
          }
        }
        let sendDownLoad = [];
        fileList2.forEach(function(item, index) {
          sendDownLoad.push({
            id: "",
            jsonrpc: "2.0",
            method: "aria2.addUri",
            params: [
              "token:" + data.aria2Model.token,
              [item.url],
              {
                out: item.name,
                dir: data.aria2Model.path + folderName,
                referer: "https://www.aliyundrive.com/",
                "user-agent": navigator.userAgent
              }
            ]
          });
        });
        let text = data.pushBtonText;
        data.pushBtonText = "正在推送";
        $2.ajax({
          type: "POST",
          url: data.aria2Model.link,
          data: JSON.stringify(sendDownLoad),
          crossDomain: true,
          processData: false,
          contentType: "application/json",
          success: function(result) {
            showSuccess("Aria2推送成功");
            data.pushBtonText = text;
            call(true);
          },
          error: function(error) {
            showError$1("Aria2 推送失败,请检查配置，或刷新后重试");
            data.pushBtonText = text;
            call(flase);
          }
        });
      }
      function show() {
        data.isShowAria2Set = true;
      }
      function hide() {
        data.isShowAria2Set = false;
      }
      expose({
        aria2Push,
        show,
        hide
      });
      return (_ctx, _cache) => {
        return data.isShowAria2Set ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$2, [
          _hoisted_2$2,
          vue.createElementVNode("div", _hoisted_3$2, [
            vue.createElementVNode("div", _hoisted_4$2, [
              vue.createElementVNode("div", _hoisted_5$2, [
                _hoisted_6$2,
                vue.createElementVNode("div", _hoisted_7$2, [
                  vue.createElementVNode("div", {
                    class: "icon-wrapper--3dbbo",
                    id: "aria2-set-icon",
                    onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => data.isShowAria2Set = false, ["stop"]))
                  }, _hoisted_9$2),
                  _hoisted_10$2,
                  vue.createElementVNode("div", _hoisted_11$2, [
                    vue.withDirectives(vue.createElementVNode("input", {
                      id: "aria2-link",
                      class: "ant-input ant-input-borderless input--3oFR6",
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => data.aria2Model.link = $event),
                      type: "text"
                    }, null, 512), [
                      [vue.vModelText, data.aria2Model.link]
                    ])
                  ]),
                  _hoisted_12$2,
                  vue.createElementVNode("div", _hoisted_13$2, [
                    vue.withDirectives(vue.createElementVNode("input", {
                      id: "aria2-path",
                      class: "ant-input ant-input-borderless input--3oFR6",
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => data.aria2Model.path = $event),
                      type: "text"
                    }, null, 512), [
                      [vue.vModelText, data.aria2Model.path]
                    ])
                  ]),
                  _hoisted_14$2,
                  vue.createElementVNode("div", _hoisted_15$2, [
                    vue.withDirectives(vue.createElementVNode("input", {
                      id: "aria2-token",
                      class: "ant-input ant-input-borderless input--3oFR6",
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => data.aria2Model.token = $event),
                      type: "text"
                    }, null, 512), [
                      [vue.vModelText, data.aria2Model.token]
                    ])
                  ]),
                  _hoisted_16$2,
                  vue.createElementVNode("div", _hoisted_17$2, [
                    vue.createElementVNode("div", _hoisted_18$1, [
                      vue.createTextVNode(" 不创建对应目录： "),
                      vue.createVNode(vue.unref(elementPlus.ElSwitch), {
                        modelValue: data.aria2Model.dirCreate,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => data.aria2Model.dirCreate = $event)
                      }, null, 8, ["modelValue"])
                    ])
                  ])
                ]),
                vue.createElementVNode("div", _hoisted_19$1, [
                  vue.createElementVNode("div", _hoisted_20$1, [
                    vue.createElementVNode("button", {
                      id: "aria2-set-save",
                      class: "button--2Aa4u primary--3AJe5 small---B8mi",
                      onClick: vue.withModifiers(saveAria2, ["stop"])
                    }, " 确定 ", 8, _hoisted_21$1)
                  ])
                ])
              ])
            ])
          ])
        ])) : vue.createCommentVNode("", true);
      };
    }
  };
  const DwoloadPage_vue_vue_type_style_index_0_scoped_5d43769b_lang = "";
  const _withScopeId = (n) => (vue.pushScopeId("data-v-5d43769b"), n = n(), vue.popScopeId(), n);
  const _hoisted_1$1 = { key: 0 };
  const _hoisted_2$1 = { key: 1 };
  const _hoisted_3$1 = { key: 0 };
  const _hoisted_4$1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("p", { class: "notice1" }, "1. 因阿里云盘接口限制,短期大量请求会出现接口请求频繁,可以先选择需要下载的文件，在点击显示链接按钮。 ", -1));
  const _hoisted_5$1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("p", { class: "notice1" }, "2. 接口请求频繁,也可尝试点击下载,不过文件名需要重新命名 ", -1));
  const _hoisted_6$1 = /* @__PURE__ */ _withScopeId(() => /* @__PURE__ */ vue.createElementVNode("p", { class: "notice1" }, "3. 在点击刷新按钮时,不要连续点击,可等几秒在点一次尝试获取 ", -1));
  const _hoisted_7$1 = [
    _hoisted_4$1,
    _hoisted_5$1,
    _hoisted_6$1
  ];
  const _hoisted_8$1 = { class: "notice" };
  const _hoisted_9$1 = {
    class: "item-list",
    style: { "padding": "20px", "height": "410px", "overflow-y": "auto" }
  };
  const _hoisted_10$1 = { key: 0 };
  const _hoisted_11$1 = { key: 1 };
  const _hoisted_12$1 = { style: { "margin": "10px 0px", "overflow": "hidden", "white-space": "nowrap", "text-overflow": "ellipsis" } };
  const _hoisted_13$1 = { class: "footer--1r-ur" };
  const _hoisted_14$1 = { class: "buttons--nBPeo" };
  const _hoisted_15$1 = ["onClick"];
  const _hoisted_16$1 = ["onClick"];
  const _hoisted_17$1 = ["onClick"];
  const _sfc_main$1 = {
    __name: "DwoloadPage",
    setup(__props) {
      let list = user.selectedFileList();
      if (list.length == 0) {
        list = user.getAllFileList();
      }
      const fileList2 = vue.reactive(list);
      const aria2SetRef = vue.ref();
      const data = vue.reactive({
        pushBtonText: "Aria2 推送"
      });
      const home2 = vue.ref(user.home());
      const laterLoad = vue.ref(getCount() != 0 && list == 0);
      function getCount() {
        let text = $2(".left-wrapper--zzDY4").text();
        if (!text) {
          return 0;
        }
        var reg = /\d+/g;
        var num = text.match(reg);
        if (num.length == 0) {
          return 0;
        }
        return num[0];
      }
      function group(array, subGroupLength) {
        var index = 0;
        var newArray = [];
        while (index < array.length) {
          newArray.push(array.slice(index, index += subGroupLength));
        }
        return newArray;
      }
      var shareToken;
      const shareTokenV = vue.reactive(user.getShareToken());
      vue.onMounted(async () => {
        if (!user.home()) {
          shareToken = user.getShareToken();
          if (!user.isExpires(shareToken)) {
            showError$1("当前页面已过期，请刷新重试");
            return;
          }
        }
        var groupedCountries = group(fileList2, 1);
        for (const index in groupedCountries) {
          await loadingUrl(groupedCountries[index]);
        }
        function loadingUrl(array) {
          return new Promise((resolve, reject) => {
            let length = array.length;
            let initLength = 0;
            array.forEach((item) => {
              if (item.type == "file") {
                getFileUrl(item, function() {
                  initLength += 1;
                  if (initLength == length) {
                    resolve();
                  }
                });
              } else {
                initLength += 1;
                if (initLength == length) {
                  resolve();
                }
              }
            });
          });
        }
      });
      function showSet() {
        aria2SetRef.value.show();
      }
      function IDMPush() {
        var content = "", referer = "https://www.aliyundrive.com/", userAgent = navigator.userAgent;
        fileList2.forEach(function(item, index) {
          if (item.url != "" && item.url != null) {
            content += ["<", item.url, "referer: " + referer, "User-Agent: " + userAgent, ">"].join("\r\n") + "\r\n";
          }
        });
        var a = document.createElement("a");
        var blob = new Blob([content]);
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = "IDM导出文件_阿里云盘.ef2";
        a.click();
        window.URL.revokeObjectURL(url);
      }
      function aria2Push() {
        if (data.pushBtonText == "正在推送") {
          return;
        }
        var text = data.pushBtonText;
        data.pushBtonText = "正在推送";
        aria2SetRef.value.aria2Push(fileList2, (res) => {
          data.pushBtonText = text;
        });
      }
      function getFileUrl(item, call) {
        item.loading = true;
        item.text = "正在获取下载地址中";
        let showDnload;
        if (item.share_id) {
          showDnload = shareLinkDownloadUrl({
            file_id: item.file_id,
            share_id: item.share_id
          }, shareToken.share_token).then((response) => {
            item.error = false;
            item.text = response.data.download_url;
            item.url = response.data.download_url;
          });
        } else {
          showDnload = getDownloadUrl({
            expire_sec: 14400,
            drive_id: item.drive_id,
            file_id: item.file_id
          }).then((response) => {
            item.error = false;
            item.text = response.data.url;
            item.url = response.data.url;
          });
        }
        showDnload.catch((e) => {
          if (e && e + "" == "AxiosError: Request failed with status code 429") {
            item.error = true;
            item.text = "接口请求频繁，请稍后点击文件旁边的刷新按钮，重新获取 (也可点击我尝试跳转下载)";
          } else {
            item.text = "刷新失败，错误异常:" + e;
          }
        }).finally(() => {
          item.loading = false;
          call && call();
        });
      }
      vue.onUnmounted(() => {
        console.log("文件下载窗口关闭");
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock(vue.Fragment, null, [
          vue.createVNode(_sfc_main$2, {
            ref_key: "aria2SetRef",
            ref: aria2SetRef
          }, null, 512),
          laterLoad.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_1$1, [
            vue.createVNode(vue.unref(elementPlus.ElResult), {
              icon: "error",
              title: "获取文件失败",
              "sub-title": "请回到文件列表中，随便点击排序，看到已加载多少文件时，在回到这里吧"
            })
          ])) : vue.createCommentVNode("", true),
          !laterLoad.value ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_2$1, [
            fileList2.length > 0 ? (vue.openBlock(), vue.createElementBlock("div", _hoisted_3$1, _hoisted_7$1)) : vue.createCommentVNode("", true),
            vue.createElementVNode("p", _hoisted_8$1, " 共加载了" + vue.toDisplayString(fileList2.length) + "个文件", 1),
            vue.createElementVNode("div", _hoisted_9$1, [
              (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(fileList2, (item, index) => {
                return vue.openBlock(), vue.createElementBlock("div", { key: index }, [
                  item.type == "folder" ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_10$1, vue.toDisplayString(index + 1) + ". " + vue.toDisplayString(item.name), 1)) : vue.createCommentVNode("", true),
                  item.type == "file" ? (vue.openBlock(), vue.createElementBlock("p", _hoisted_11$1, [
                    vue.createTextVNode(vue.toDisplayString(index + 1) + ". " + vue.toDisplayString(item.name) + " ", 1),
                    vue.createVNode(vue.unref(elementPlus.ElButton), {
                      type: "primary",
                      icon: vue.unref(refresh_default),
                      loading: item.loading,
                      circle: "",
                      size: "small",
                      onClick: vue.withModifiers(($event) => getFileUrl(item), ["stop"])
                    }, null, 8, ["icon", "loading", "onClick"])
                  ])) : vue.createCommentVNode("", true),
                  vue.createElementVNode("p", _hoisted_12$1, [
                    item.type == "folder" ? (vue.openBlock(), vue.createBlock(vue.unref(elementPlus.ElLink), {
                      key: 0,
                      type: "primary",
                      href: home2.value ? "/drive/folder/" + item.file_id : "/s/" + shareTokenV.share_id + "/folder/" + item.file_id
                    }, {
                      default: vue.withCtx(() => [
                        vue.createTextVNode("点击进入文件夹")
                      ]),
                      _: 2
                    }, 1032, ["href"])) : vue.createCommentVNode("", true),
                    item.type == "file" && !item.error ? (vue.openBlock(), vue.createBlock(vue.unref(elementPlus.ElLink), {
                      key: 1,
                      type: "primary",
                      href: item.url,
                      target: "_blank"
                    }, {
                      default: vue.withCtx(() => [
                        vue.createTextVNode(vue.toDisplayString(item.text), 1)
                      ]),
                      _: 2
                    }, 1032, ["href"])) : vue.createCommentVNode("", true),
                    item.type == "file" && item.error ? (vue.openBlock(), vue.createBlock(vue.unref(elementPlus.ElLink), {
                      key: 2,
                      type: "danger",
                      href: item.url,
                      target: "_blank"
                    }, {
                      default: vue.withCtx(() => [
                        vue.createTextVNode(vue.toDisplayString(item.text), 1)
                      ]),
                      _: 2
                    }, 1032, ["href"])) : vue.createCommentVNode("", true)
                  ])
                ]);
              }), 128))
            ]),
            vue.createElementVNode("div", null, [
              vue.createElementVNode("div", _hoisted_13$1, [
                vue.createElementVNode("div", _hoisted_14$1, [
                  vue.createElementVNode("button", {
                    class: "button--2Aa4u primary--3AJe5 small---B8mi appreciation",
                    onClick: _cache[0] || (_cache[0] = vue.withModifiers(($event) => vue.unref(monkeyWindow).open("https://greasyfork.org/zh-CN/scripts/458626", "_blank"), ["stop"]))
                  }, "👍 点个赞"),
                  vue.createElementVNode("button", {
                    class: "button--2Aa4u primary--3AJe5 small---B8mi aria2-download",
                    onClick: vue.withModifiers(IDMPush, ["stop"])
                  }, "IDM 导出文件", 8, _hoisted_15$1),
                  vue.createElementVNode("button", {
                    class: "button--2Aa4u primary--3AJe5 small---B8mi aria2-download",
                    onClick: vue.withModifiers(aria2Push, ["stop"])
                  }, vue.toDisplayString(data.pushBtonText), 9, _hoisted_16$1),
                  vue.createElementVNode("button", {
                    class: "button--2Aa4u primary--3AJe5 aria2-set",
                    onClick: vue.withModifiers(showSet, ["stop"]),
                    style: { "margin-left": "0", "width": "auto", "border": "0 solid transparent" }
                  }, "⚙️", 8, _hoisted_17$1)
                ])
              ])
            ])
          ])) : vue.createCommentVNode("", true)
        ], 64);
      };
    }
  };
  const DwoloadPage = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-5d43769b"]]);
  const _hoisted_1 = { style: { "padding-bottom": "10px" } };
  const _hoisted_2 = { style: { "height": "410px", "overflow-y": "auto" } };
  const _hoisted_3 = {
    key: 0,
    align: "center",
    width: "100%",
    color: "#1890ff",
    size: "1/"
  };
  const _hoisted_4 = { style: { "padding-bottom": "13px" } };
  const _hoisted_5 = ["onClick"];
  const _hoisted_6 = /* @__PURE__ */ vue.createElementVNode("a", null, "清空本地历史", -1);
  const _hoisted_7 = [
    _hoisted_6
  ];
  const _hoisted_8 = {
    "data-index": "0",
    class: "tr-wrapper--3qYK2",
    style: { "height": "52px", "width": "100%" }
  };
  const _hoisted_9 = /* @__PURE__ */ vue.createElementVNode("div", {
    class: "padding-element-horizontal--39l8Q",
    style: { "width": "32px" }
  }, null, -1);
  const _hoisted_10 = {
    class: "drop-wrapper--1I5zO",
    "data-drop-target": "false"
  };
  const _hoisted_11 = {
    "data-is-dragging": "false",
    class: "drag-wrapper--2Z_J-",
    draggable: "true"
  };
  const _hoisted_12 = {
    class: "tr--5N-1q tr--3Ypim",
    "data-is-selected": "false",
    "data-clickable": "true",
    "data-has-checkbox": "true",
    style: { "cursor": "pointer" }
  };
  const _hoisted_13 = ["onClick"];
  const _hoisted_14 = /* @__PURE__ */ vue.createElementVNode("span", {
    "data-role": "icon",
    "data-render-as": "svg",
    "data-icon-type": "PDSMore",
    class: "ant-dropdown-trigger icon--d-ejA"
  }, [
    /* @__PURE__ */ vue.createElementVNode("svg", {
      t: "1676180557921",
      class: "icon",
      viewBox: "0 0 1024 1024",
      version: "1.1",
      xmlns: "http://www.w3.org/2000/svg",
      "p-id": "3478",
      width: "16",
      height: "16"
    }, [
      /* @__PURE__ */ vue.createElementVNode("path", {
        d: "M374.6 636.5c4.4 0 8.5-1.2 12.1-3.3l171.7-100c8-3.6 13.6-11.9 13.6-21.5 0-8.8-4.8-16.6-11.9-20.7l-167.8-97.8c-4.3-5-10.7-8.1-17.7-8.1-13.1 0-23.6 10.7-23.6 23.8v1.3l-0.3 0.2 0.4 199.8c-0.1 0.8-0.1 1.6-0.1 2.5 0 13.2 10.6 23.8 23.6 23.8z",
        fill: "#4D4D4D",
        "p-id": "3479"
      }),
      /* @__PURE__ */ vue.createElementVNode("path", {
        d: "M64.7 586.3a32.2 32.1 0 1 0 64.4 0 32.2 32.1 0 1 0-64.4 0Z",
        fill: "#4D4D4D",
        "p-id": "3480"
      }),
      /* @__PURE__ */ vue.createElementVNode("path", {
        d: "M960 398.3c0.1-1.6 0.2-3.2 0.2-4.8 0-35-28.5-63.3-63.6-63.3-11.7 0-22.7 3.2-32.2 8.7l-0.5-0.3-31.5 18.2v-64.7c-0.1-73.1-59.9-133-133.1-133H197.4c-73.1 0-133 59.8-133 133v165.8h0.2c0 17.7 14.4 32.1 32.2 32.1s32.2-14.4 32.2-32.1h0.2V287c0-35.2 28.8-64 64-64h510.2c35.2 0 64 28.8 64 64v448.9c0 35.2-28.8 64-64 64H193.3c-35.2 0-64-28.8-64-64v-21.4c0-17.7-14.4-32.1-32.2-32.1-17.8 0-32.2 14.4-32.2 32.1h-0.4v15.3c0 73.2 59.9 133 133 133h501.9c73.2 0 133-59.8 133-133v-64.1l33.1 19.1 0.1-0.1c9.2 5.1 19.8 8 31 8 35.1 0 63.6-28.4 63.6-63.3 0-1.6-0.1-3.2-0.2-4.8V398.3z m-63.6 205.1c-0.3 7.8-6.9 14.1-15 14.1-2.7 0-5.3-0.7-7.5-2l-41.5-23.7V430.1l40.9-23.2c2.3-1.5 5.1-2.3 8.1-2.3 8.3 0 15 6.6 15 14.6v184.2z",
        fill: "#4D4D4D",
        "p-id": "3481"
      })
    ])
  ], -1);
  const _hoisted_15 = [
    _hoisted_14
  ];
  const _hoisted_16 = ["onClick"];
  const _hoisted_17 = /* @__PURE__ */ vue.createElementVNode("div", {
    class: "cover--2UinW file-cover--37ssA",
    "data-size": "XXS",
    "data-thumbnail": "normal"
  }, [
    /* @__PURE__ */ vue.createElementVNode("div", { class: "is-loaded--31jGX thumbnail-wrapper--3fR8n" }, [
      /* @__PURE__ */ vue.createElementVNode("div", { class: "thumbnail--2LF21 fill-mode-cover--OFezO size-xxs--2rm_b" }, [
        /* @__PURE__ */ vue.createElementVNode("img", {
          alt: "video",
          class: "fileicon--2Klqk fileicon--vNn4M",
          draggable: "false",
          src: "https://img.alicdn.com/imgextra/i2/O1CN01H7FCkb1P6mPJxDEFa_!!6000000001792-2-tps-80-80.png"
        })
      ])
    ])
  ], -1);
  const _hoisted_18 = ["title"];
  const _hoisted_19 = ["onClick"];
  const _hoisted_20 = { class: "text-secondary--38-Of" };
  const _hoisted_21 = {
    class: "td--GiK_C td--3QAAr",
    "data-col-key": "size",
    style: { "width": "160px", "flex": "0 0 auto" }
  };
  const _hoisted_22 = { class: "text-secondary--38-Of" };
  const _hoisted_23 = ["href"];
  const _hoisted_24 = /* @__PURE__ */ vue.createElementVNode("div", {
    class: "padding-element-horizontal--39l8Q",
    style: { "width": "32px" }
  }, null, -1);
  const _sfc_main = {
    __name: "VideoHistoryPage",
    setup(__props) {
      let locList = vue.ref(user.getVideoLookList());
      let clodList = vue.ref([]);
      let listData = vue.ref([
        {
          key: "本地历史",
          list: locList
        },
        {
          key: "云端历史",
          list: clodList
        }
      ]);
      vue.onMounted(() => {
        videoHistoryList(listFuction);
      });
      function listFuction(data) {
        if (data.length != 0) {
          clodList.value = data;
        }
      }
      function clearHistory() {
        user.clearVideoHistory();
      }
      function playInfo(videoItem) {
        if (videoItem.share) {
          location.href = videoItem.href;
          return;
        }
        let vInfo = user.getVideoPage();
        vInfo.id = videoItem.id;
        vInfo.play_cursor = videoItem.play_cursor;
        vInfo.name = videoItem.name;
        vInfo.thumbnail = "";
        vInfo.folderName = videoItem.folderName;
        vInfo.type = 0;
        vInfo.href = videoItem.href;
        let html2 = `<div class="modal--2-twY" id="videoHistory"><div class="web--X2m_s container--1KDdZ">
            <div class="content--2h39N">
                <div class="header--2Vw8Y"data-layout-sider-open="true">
                    <div class="header-right--15o8Y">
                        <div class="nav-actions--3xj7P">
                            <span class="nav-action--3wGIv nav-next--2clOM">
                                <span data-role="icon"data-render-as="svg"data-icon-type="PDSRightNormal"class="nav-icon--3M-2m icon--d-ejA "style="color:#1890ff">
                                    <svg viewBox="0 0 1024 1024"><use xlink:href="#PDSRightNormal"></use></svg></span><span class="nav-text--2o_Eh">
                                        <a href="${vInfo.href}">进入到当前目录</a></span></span></div><div class="separator--2A8C0"></div></div><div class="header-center--3bFO1"><div class="filename--zkxdz">
                                        <span class="text--2KGvI">${vInfo.name}</span>
                                                </div></div><div  style="padding:10px" id="header-close"><span data-role="icon"data-render-as="svg"data-icon-type="PDSClose"class="icon--2RYr- icon--d-ejA "><svg viewBox="0 0 1024 1024"data-spm-anchor-id="0.0.0.i4.54a06c75hUkxKw"><use xlink:href="#PDSClose"></use></svg></span></div></div><div class="previewer--3q5IV"><div class="video-previewer--1vo5c"><div class="video-previewer-container--3N0eI"tabindex="-1"data-fullscreen="false"><div class="video-stage--3LCB4 cursor--w3p8T"><video class="video--26SLZ"preload="metadata"src=""></video></div></div></div></div></div></div></div>`;
        $2("#root").append(html2);
        var app = vue.createApp(VideoPage);
        app.mount(
          (() => {
            const app2 = $2(`<div id="videoPage" class='video-previewer--1vo5c'></div>`)[0];
            $2(".previewer--3q5IV").replaceWith(app2);
            $2(".ant-modal-Link .icon-wrapper--3dbbo").click();
            return app2;
          })()
        );
        $2("#header-close").one("click", function() {
          app.unmount();
          $2("#videoHistory").remove();
        });
      }
      let videoHistoryList = function(callback) {
        homeWidgets().then((res) => {
          if (res.data && res.data.recentUsed) {
            let videoList = res.data.recentUsed.items.filter(function(item, index) {
              return item.category === "video";
            });
            videoList = videoList.map((item) => {
              let href = "https://www.aliyundrive.com/drive/";
              if (item.compilationId) {
                let i = item.compilationId.indexOf("_");
                let compilationId = item.compilationId.substring(i + 1, item.compilationId.length);
                href = "https://www.aliyundrive.com/drive/folder/" + compilationId;
              }
              return {
                "category": "video",
                "name": item.name,
                "progress": item.progressPercentage,
                "id": item.fileId,
                "folderName": item.fromSourceDescription,
                "href": href,
                "share": false,
                "play_cursor": item.playCursor
              };
            });
            callback && callback(videoList);
            return;
          }
          callback && callback([]);
        }).catch((err) => {
          callback && callback([]);
        });
      };
      vue.onUnmounted(() => {
        console.log("历史页面销毁");
      });
      return (_ctx, _cache) => {
        return vue.openBlock(), vue.createElementBlock("div", null, [
          vue.createElementVNode("p", _hoisted_1, " 最近观看了" + vue.toDisplayString(vue.unref(locList).length + vue.unref(clodList).length) + "个视频", 1),
          vue.createElementVNode("div", _hoisted_2, [
            (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(vue.unref(listData), (data, i1) => {
              return vue.openBlock(), vue.createElementBlock("div", { key: i1 }, [
                data.key == "云端历史" ? (vue.openBlock(), vue.createElementBlock("hr", _hoisted_3)) : vue.createCommentVNode("", true),
                vue.createElementVNode("h1", _hoisted_4, vue.toDisplayString(data.key), 1),
                data.key == "本地历史" ? (vue.openBlock(), vue.createElementBlock("p", {
                  key: 1,
                  class: "text-secondary--38-Of clearHistory",
                  style: { "padding-bottom": "13px" },
                  onClick: vue.withModifiers(clearHistory, ["stop"])
                }, _hoisted_7, 8, _hoisted_5)) : vue.createCommentVNode("", true),
                (vue.openBlock(true), vue.createElementBlock(vue.Fragment, null, vue.renderList(data.list, (item, index) => {
                  return vue.openBlock(), vue.createElementBlock("div", {
                    style: { "height": "52px", "width": "100%" },
                    key: index
                  }, [
                    vue.createElementVNode("div", _hoisted_8, [
                      _hoisted_9,
                      vue.createElementVNode("div", _hoisted_10, [
                        vue.createElementVNode("div", _hoisted_11, [
                          vue.createElementVNode("div", _hoisted_12, [
                            vue.createElementVNode("div", {
                              onClick: ($event) => playInfo(item),
                              class: "checkbox--3xYhn checkbox-container--TNndw",
                              role: "checkbox",
                              "aria-checked": "false",
                              "data-checked": "false",
                              "data-partial": "false",
                              "data-disabled": "false",
                              "data-no-padding": "false"
                            }, _hoisted_15, 8, _hoisted_13),
                            vue.createElementVNode("div", {
                              class: "td--GiK_C td--3QAAr history_video",
                              compilationid: "",
                              "data-col-key": "name",
                              style: { "flex": "1 1 0%", "min-width": "160px" },
                              onClick: ($event) => playInfo(item)
                            }, [
                              _hoisted_17,
                              vue.createElementVNode("p", {
                                class: "text-primary--3DHOJ",
                                title: item.name
                              }, vue.toDisplayString(item.name), 9, _hoisted_18)
                            ], 8, _hoisted_16),
                            vue.createElementVNode("div", {
                              compilationid: "",
                              class: "history_video td--GiK_C td--3QAAr",
                              "data-col-key": "updated_at",
                              style: { "width": "200px", "flex": "0 0 auto" },
                              onClick: ($event) => playInfo(item)
                            }, [
                              vue.createElementVNode("p", _hoisted_20, "已观看" + vue.toDisplayString(item.progress) + "%", 1)
                            ], 8, _hoisted_19),
                            vue.createElementVNode("div", _hoisted_21, [
                              vue.createElementVNode("p", _hoisted_22, [
                                vue.createElementVNode("a", {
                                  href: item.href
                                }, vue.toDisplayString(item.folderName), 9, _hoisted_23)
                              ])
                            ])
                          ])
                        ])
                      ]),
                      _hoisted_24
                    ])
                  ]);
                }), 128))
              ]);
            }), 128))
          ])
        ]);
      };
    }
  };
  let showDownloadHomePage = function() {
    let app = vue.createApp(DwoloadPage);
    showDiv("文件下载", app);
  };
  function initMenuButton(menuName) {
    if ($2(".button-download-aliyun").length !== 0) {
      $2(".button-download-aliyun").remove();
      $2(".history-video").remove();
    }
    var css = "#root header:eq(0)";
    if (menuName === "密码箱") {
      css = ".actions--2qvID:eq(0)";
    }
    if ($2(css).length > 0) {
      var html2 = "";
      html2 += '<div style="margin:1px 8px;"></div><div class="button--2Aa4u primary--3AJe5 small---B8mi history-video"><span style="margin-right:2px" data-role="icon"data-render-as="svg"data-icon-type="PDSAddS"class="icon--d-ejA "><svg t="1676170067530"class="icon"viewBox="0 0 1024 1024"version="1.1"xmlns="http://www.w3.org/2000/svg"p-id="2764"width="200"height="200"><path d="M512 1024C229.248 1024 0 794.752 0 512S229.248 0 512 0s512 229.248 512 512-229.248 512-512 512z m42.666667-486.869333V298.538667C554.666667 275.328 535.552 256 512 256c-23.722667 0-42.666667 19.029333-42.666667 42.538667v256.256a41.984 41.984 0 0 0 12.202667 29.866666l121.258667 121.258667a42.368 42.368 0 0 0 60.032-0.298667 42.666667 42.666667 0 0 0 0.298666-60.032L554.666667 537.130667z"fill="#ffffff"p-id="2765"></path></svg></span>最近在看</div>';
      html2 += '<div style="margin:1px 8px;"></div><div class="button--2Aa4u primary--3AJe5 small---B8mi button-download-aliyun">显示链接</div>';
      $2(css).append(html2);
      $2(".button-download-aliyun").on("click", showDownloadHomePage);
      $2(".history-video").on("click", () => {
        let app = vue.createApp(_sfc_main);
        showDiv(`<div style="display:flex; justify-content:center;  align-items:center;">
                    <span data-role="icon" data-render-as="svg" data-icon-type="PDSRecent" class="icon--d-ejA ">
                        <svg viewBox="0 0 1024 1024"><use xlink:href="#PDSRecent"></use></svg>
                        </span>最近再看</div>`, app);
      });
    } else {
      setTimeout(function() {
        initMenuButton(menuName);
      }, 1e3);
    }
  }
  const home = (menuName) => {
    initMenuButton(menuName);
  };
  let shareId = function() {
    var url = location.href;
    var match = url.match(/aliyundrive\.com\/s\/([a-zA-Z\d]+)/);
    return match ? match[1] : null;
  };
  let showDownloadSharePage = function() {
    let shareToken = user.getShareToken();
    if (!user.isExpires(shareToken)) {
      showError$1("当前页面已过期，请刷新重试");
      return;
    } else if (shareId() != shareToken.share_id) {
      location.reload();
      return;
    }
    let app = vue.createApp(DwoloadPage);
    showDiv("文件下载", app);
  };
  function initShareButton() {
    if ($2(".button-download-aliyun").length !== 0) {
      $2(".button-download-aliyun").remove();
    }
    if ($2("#root [class^=banner] [class^=right]").length !== 0 && $2(".button--fep7l").length == 0) {
      var html2 = "";
      html2 += '<div style="margin:1px 7px;"></div><button class="button--2Aa4u primary--3AJe5 small---B8mi button-download-aliyun">显示链接</button>';
      $2("#root [class^=banner] [class^=right]").prepend(html2);
      $2(".button-download-aliyun").on("click", showDownloadSharePage);
    } else {
      setTimeout(initShareButton, 1e3);
    }
  }
  const share = () => {
    initShareButton();
  };
  var globalMenuName;
  function showHomeUi(menuName) {
    globalMenuName = menuName;
    console.log(globalMenuName);
    if (menuName === "文件" || menuName === "收藏夹" || menuName === "密码箱") {
      setTimeout(function() {
        home(menuName);
      }, 200);
    }
  }
  function initHomeUi() {
    let menu = $2(".nav-menu--1wQUw");
    if (menu.length !== 0) {
      $2(".nav-menu-item--2oDIG").on("click", function(e) {
        showHomeUi(e.currentTarget.textContent);
      });
      setInterval(function() {
        let node = $2(".is-active--BX1xN:eq(0)");
        if (node.length > 0) {
          if (node.text() !== globalMenuName) {
            showHomeUi(node.text());
          }
        }
      }, 700);
      setTimeout(function() {
        let node = $2(".is-active--BX1xN:eq(0)");
        if (node.length > 0) {
          showHomeUi(node.text());
        }
      }, 300);
    } else {
      setTimeout(initHomeUi, 500);
    }
  }
  const ui = () => {
    if (user.home()) {
      initHomeUi();
    } else {
      share();
    }
  };
  var sessionLoadding = false;
  var listenArray = new Array();
  let interceptRequest = function() {
    axios2.interceptors.request.use(async function(config) {
      let token = user.getToken();
      if (token == null) {
        showError$1("当前登录凭证获取为空，请刷新或重新登录");
        throw "token 为空了";
      } else if (!user.isExpires(token)) {
        showError$1("Token已失效,请刷新或重新登录");
        throw "Token已失效,请刷新或重新登录";
      }
      let isToken = config.headers._token;
      config.headers["authorization"] = "".concat(token.token_type || "", " ").concat(token.access_token || "");
      config.headers["fileId"] = token.user_id;
      if (isToken != null && isToken == false) {
        delete config.headers._token;
        return config;
      }
      let session_ref = store.getItem("LG_session_Ref");
      if (session_ref != "" && session_ref == "true") {
        await new Promise((resolve, reject) => {
          function check() {
            if (store.getItem("LG_session_Ref") == "") {
              resolve();
            } else {
              setTimeout(check, 200);
            }
          }
          check();
        });
      }
      if (sessionLoadding) {
        await new Promise((resolve, reject) => {
          listenArray.push(function() {
            resolve();
          });
        });
      }
      let d = user.getDeviceId();
      let s = user.getSignature();
      if (d == "" || s == "") {
        sessionLoadding = true;
        let rest = await user.session(token, function() {
        });
        if (rest.deviceId) {
          d = rest.deviceId;
        }
        if (rest.signature) {
          s = rest.signature;
        }
      }
      sessionLoadding = false;
      if (listenArray.length > 0) {
        listenArray.forEach((i) => {
          i && i();
        });
        listenArray = new Array();
      }
      config.headers["x-device-id"] = d;
      config.headers["x-signature"] = s;
      return config;
    }, function(error) {
      console.log("出现异常", error);
      return Promise.reject(error);
    });
  };
  const apiConfig = () => {
    axios2.defaults.baseURL = "https://api.aliyundrive.com";
    interceptRequest();
  };
  function start() {
    let token = user.getToken();
    if (token == null) {
      elementPlus.ElMessage("阿里云助手：末登录，请登陆后使用");
      user.clearAll();
      return;
    }
    apiConfig();
    console.log(`${"\n"} %c ali.video.user.js v${"2.0.5"} 罗根大人 %c https://greasyfork.org/zh-CN/scripts/458626  ${"\n"}${"\n"}`, "color: #fadfa3; background: #030307; padding:5px 0;", "background: #fadfa3; padding:5px 0;");
    listen();
    async function init() {
      elementPlus.ElMessage("脚本加载中");
      await loadScript("https://gitee.com/lord-logan/aliEccJs/releases/download/v0.3/main.js").then((val) => {
        run();
      });
    }
    init();
    function run(val) {
      setInterval(user.refSession, 3e5);
      user.refSession();
      ui();
      elementPlus.ElMessage({
        message: "阿里云助手加载成功",
        type: "success"
      });
    }
  }
  start();
})(ElementPlus, $, axios, Vue, Hls, Artplayer);