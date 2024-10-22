// 本代码仅用于个人学习，请勿用于其他作用，下载后请24小时内删除，代码虽然是公开学习的，但请尊重作者，应留下说明
// 一些多处会调用但不用默认加载的方法
// 注入js模似点击
function jsClick(playUrl) {
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