js:
let d = [];
let Color = "#f13b66a";
let html = request("https://getpodcast.xyz/");
//log(html)
let class_ids = pdfa(html, "body&&.classify_title");
let classlists = pdfa(html, "body&&.pic_list");
for (let i in class_ids) {
    let classname = pdfh(class_ids[i],"body&&Text");
    d.push({
        title: getMyVar('SrcBoKe$classname', '播客') === classname ? '““””<b><span style="color:' + Color + '">' + classname + '</span></b>' : class,
        url: $('#noLoading#').lazyRule((classname, i) => {
                putMyVar('SrcBoKe$classname', classname);
                                putMyVar('SrcBoKe$classid', i);
                refreshPage(false);
                return "hiker://empty";
            }, classname, i),
        col_type: 'scroll_button'
    });
}

let lists = pdfa(classlists[parseInt(getMyVar('SrcBoKe$classid','0'))], "body&li");
lists.forEach(item => {
    d.push({
        title: pdfh(item, ".title&&Text"),
        url: "hiker://empty##" + pdfh(item, "a&&href"),
        col_type: 'card_pic_2'
    });
})
            
           

setResult(d);