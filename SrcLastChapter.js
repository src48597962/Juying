function sougou() {
    try{
        var html = request(MY_URL.split('##')[1], { headers: { 'User-Agent': PC_UA } });
        var json = JSON.parse(html.match(/INITIAL_STATE.*?({.*});/)[1]).detail.itemData;
        var plays = json.play.item_list;
        var shows = json.play_from_open_index;
        var list = plays[0].info;
    }catch(e){
        log('获取最新失败>'+e.message);
        var list = [];
    }
    
    if(list&&list.length > 0){
        setResult('更新至：' + list[list.length-1].index);
    }else if (shows&&plays.length>0) {
        var arr = [];
        var zy = shows.item_list[0];
        for (var ii in zy.date) {
            date = zy.date[ii];
            day = zy.date[ii].day;
            for (j in day) {
                dayy = day[j][0] >= 10 ? day[j][0] : "0" + day[j][0];
                Tdate = date.year + date.month + dayy;
                arr.push(Tdate);
                if (getMyVar('shsort') == '1') {
                    arr.sort(function(a, b) {
                        return a - b
                    })
                } else {
                    arr.sort(function(a, b) {
                        return b - a
                    })
                }
            }
        }
        setResult('更新至：' + "第" + arr[arr.length-1] + "期");
    }
}