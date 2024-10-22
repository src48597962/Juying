// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
// 一些多处会调用但不用默认加载的方法
// extra.js，可用于注入js模似点击
function extraJS(playUrl) {
    if(/jqqzx\.me|dadazhu\.me/.test(playUrl)){
        return $.toString(() => {
            function check() {
                try {
                    let iframe = document.querySelector('#playleft iframe');
                    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDocument.querySelector("#start").click();
                } catch (e) {
                    setTimeout(check, 100);
                }
            }
            check();
        })
    }else{
        return undefined;
    }
}
// 获取选集对应extra
function getPlayExtra(obj){
    let sniffer = obj.sniffer || {};
    let videocontain = sniffer["contain"] || undefined;
    let videoexclude = sniffer["exclude"] || ['m3u8.js','?url='];
    let extra = {
        id: obj.id,
        jsLoadingInject: true,
        js: obj.js || extraJS(obj.playUrl),
        blockRules: ['.m4a', '.mp3', '.gif', '.jpeg', '.jpg', '.ico', '.png', 'hm.baidu.com', '/ads/*.js', 'cnzz.com'],
        videoRules: videocontain,
        videoExcludeRules: videoexclude,
        cls: "Juloadlist playlist"
    }
    if(!/qq|youku|mgtv|bili|qiyi|sohu|pptv|le/.test(obj.playUrl) && /html/.test(obj.playUrl)){
        extra.referer = obj.playUrl;
    }
    if(obj.cachem3u8){
        extra.cacheM3u8 = true;
    }
    return extra;
}