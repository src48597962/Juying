js:
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
                fy_bridge_app.log("check2");
                let a = document.querySelector("#start");
                if(a) {
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
