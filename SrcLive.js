function Live() {
    addListener("onClose", $.toString(() => {
        //clearMyVar('guanlicz');
    }));
    
    var d = [];
    let livefile = "hiker://files/rules/Src/Juying/live.txt";
    let JYlive=fetch(livefile);
    if(JYlive){
        var datalist = JYlive.split('\n');
    }else{
        var datalist = [];
    }
    if(datalist.length>0){

        //writeFile(livefile, "");
        for (let i=0;i<datalist.length;i++) {
            if(datalist[i].indexOf('#genre#')==-1){
                d.push({
                    title: datalist[i].split(',')[0],
                    col_type:'text_4',
                    url: datalist[i].split(',')[1]
                });
            }
        }
        d.push({
            title: '<br>',
            col_type: 'rich_text'
        });
    }else{
        d.push({
            title: '没有直播源数据',
            col_type: 'rich_text'
        });
    }
    setHomeResult(d);
}