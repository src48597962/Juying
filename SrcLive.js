function SRCSet() {
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