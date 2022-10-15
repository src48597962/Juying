function Live() {
    addListener("onClose", $.toString(() => {
        //clearMyVar('guanlicz');
    }));
    
    var d = [];
    let livefile = "hiker://files/rules/Src/Juying/live.txt";
    let JYlive=fetch(livefile);
    if(JYlive){
        var JYlives = JYlive.split('\n');
    }else{
        var JYlives = [];
    }
    if(JYlives.length>0){
        let datalist = [];
        let datalist2 = [];
        let group = "";
        for(let i=0;i<JYlives.length;i++){
            if(JYlives[i].indexOf('#genre#')>-1){
                group = JYlives[i].split(',')[0];
            }else if(JYlives[i].trim()!=""&&JYlives[i].indexOf(',')>-1&&!datalist.some(item => item.name==JYlives[i].split(',')[0])){
                datalist.push({group: group, name: JYlives[i].split(',')[0]});
            }
        }
        log(1)
        let grouplist = datalist.map((list)=>{
            return list.group;
        })
        log(2)
        //去重复
        function uniq(array){
            var temp = []; //一个新的临时数组
            for(var i = 0; i < array.length; i++){
                if(temp.indexOf(array[i]) == -1){
                    temp.push(array[i]);
                }
            }
            return temp;
        }
        grouplist = uniq(grouplist);
        log(3)
        for(var i in grouplist){
            var lists = datalist.filter(item => {
                return item.group==grouplist[i];
            })
            d.push({
                title: grouplist[i],
                url: $('#noLoading#').lazyRule(()=>{
                        
                        return'hiker://empty';
                    }),
                col_type: "scroll_button",
                extra: {
                    id: grouplist[i]
                }
            });
            if(i==0){
                datalist2 = lists;
            }
        }
        log(4)
        datalist = datalist2;
        //writeFile(livefile, "");
        for (let i=0;i<datalist.length;i++) {
            d.push({
                title: datalist[i].name,
                col_type:'text_4',
                url: ""
            });
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