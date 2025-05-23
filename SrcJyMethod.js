// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
// 一些多处会调用但不用默认加载的方法
// extra.js，可用于注入js模似点击
function extraJS(playUrl) {
    function click1(p1,p2) {
        return $.toString((p1,p2) => {
            function check() {
                try {
                    let iframe = document.querySelector(p1);
                    let iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDocument.querySelector(p2).click();
                } catch (e) {
                    setTimeout(check, 100);
                }
            }
            check();
        },p1,p2)
    }
    function click2() {
        return $.toString(() => {
            function check() {
                var is = 0;
                // 获取所有具有 id 属性的元素
                var elementsWithId = Array.from(document.querySelectorAll('[id]'));
                // 遍历每个元素，检查文本内容并触发点击事件
                elementsWithId.forEach(element => {
                    // 检查元素的文本内容是否包含 "点击播放"
                    if (element.outerHTML.includes("播放")) {
                        element.click();
                        is = 1;
                    }
                });
                if(is==0){
                    setTimeout(check, 100);
                }
            }
            check();
        })
    }
    function click3(p1) {
        return $.toString((p1) => {
            function check() {
                try {
                    document.getElementsByClassName(p1)[0].click();
                } catch (e) {
                    setTimeout(check, 100);
                }
            }
            check();
        },p1)
    }
    if(/jqqzx\.|dadazhu\.|dadagui|freeok/.test(playUrl)){
        return click1('#playleft iframe','#start');
    }else if(/media\.staticfile\.link/.test(playUrl)){
        return click2();
    }else if(/maolvys\.com/.test(playUrl)){
        return click3();
    }else{
        return undefined;
    }
}
//"document.getElementsByClassName('swal-button swal-button--confirm')[0].click()"
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
    }else if(sniffer['headers']){
        extra = Object.assign(extra, sniffer['headers']);
    }
    if(obj.cachem3u8){
        extra.cacheM3u8 = true;
    }
    return extra;
}
