js:
let d = [];
setPageTitle(MY_PARAMS.title);
MY_URL = MY_URL.split('##')[1];
let html = request(MY_URL);
let lists = pdfa(html, "body&&item");
//log(lists)
lists.forEach(item => {
    d.push({
        title: item.match(/<title>(.*?)<\/title>/)[1],
        desc: pdfh(item, "description&&Text"),
        url: pdfh(item, "enclosure&&url"),
        img: item.match(/image href="(.*?)"/)[1],
        col_type: 'movie_1_left_pic'
    })
})

setResult(d);