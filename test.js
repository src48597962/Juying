let d = [];
d.push({
    title: "点我播放",
    url: "video://https://www.jqqzx.me/play/614-9-1.html",
    col_type: "text_1",
    desc: "",
    pic_url: "",
    extra: {
        js: $.toString(() => {
            function check() {
                fy_bridge_app.log("check");
                let src = document.querySelectorAll("iframe")[1];
                if (src) {
                    location.href = src.src;
                } else {
                    setTimeout(check, 200);
                }
            }
            if (location.href.includes(".xiangdao.me/")) {
                check();
            }
            function check2() {
                //let src = document.querySelectorAll("iframe")[1];
                //fy_bridge_app.log(src);
                let a = document.querySelector(".player-box-main");
                if(a) {
                    fy_bridge_app.log("click");
                    a.click();
                } else {
                    setTimeout(check2, 200);
                }
            }
            check2();
        })
    }
});

setResult(d);
