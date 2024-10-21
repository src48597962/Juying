let d = [];
d.push({
    title: "点我播放",
    url: "video://https://www.jqqzx.me/play/614-9-1.html",
    col_type: "text_1",
    desc: "",
    pic_url: "",
    extra: {
        js: $.toString(() => {
            //fy_bridge_app.log(location.href);
            function check() {
                fy_bridge_app.log("check");
                let src = "";
                let iframes = document.querySelectorAll("iframe");
                for(var i = 0; i < iframes.length; i++) {
                    if(iframes[i].src != location.href){
                        fy_bridge_app.log(iframes[i].src);
                        src = iframes[i].src;
                    }
                }
                if (src) {
                    location.href = src;
                } else {
                    setTimeout(check, 200);
                }
            }
            if (location.href.includes("jqqzx.me/play/")) {
                check();
            }
            function check2() {
                fy_bridge_app.log("check2");
                fy_bridge_app.log(document.body);
                let a = document.querySelector("#start");
                if(a) {
                    fy_bridge_app.log("click");
                    a.click();
                } else {
                    setTimeout(check2, 200);
                }
            }
            if (!location.href.includes("jqqzx.me/play/")) {
                check2();
            }
        })
    }
});

setResult(d);
