let cfgfile = "hiker://files/rules/Src/Juying2/config.json";
let Juconfig= {};
let Jucfg=fetch(cfgfile);
if(Jucfg != ""){
    eval("Juconfig=" + Jucfg+ ";");
}else{
    Juconfig["依赖"] = config.依赖;
    writeFile(cfgfile, JSON.stringify(Juconfig));
}

let jkfile = "hiker://files/rules/Src/Juying2/jiekou.json";
let jxfile = "hiker://files/rules/Src/Juying2/jiexi.json";

function getFile(lx) {
    let file = lx=='jk'?jkfile:jxfile;
    return file;
}
//获取所有接口或解析
function getDatas(lx) {
    let datalist = [];
    let sourcefile = getFile(lx);
    let sourcedata = fetch(sourcefile);
    if(sourcedata != ""){
        try{
            eval("datalist=" + sourcedata+ ";");
        }catch(e){
            datalist = [];
        }
    }

    datalist.reverse();
    // 禁用的放到最后
    let withStop = datalist.filter(item => item.stop);
    let withoutStop = datalist.filter(item => !item.stop);
    // 合并数组
    let result = withoutStop.concat(withStop);
    return result;
}

//获取接口列表数据
function getListData(lx, group) {
    let datalist = getDatas(lx).filter(it=>{
        return !group || it.group==group;
    })
    if(getItem('ListSort','update') == 'update'){
        datalist = sortByPinyin(datalist);
    }
    
    return datalist;
}


// 按拼音排序
function sortByPinyin(arr) {
    var arrNew = arr.sort((a, b) => a.name.localeCompare(b.name));
    for (var m in arrNew) {
        var mm = /^[\u4e00-\u9fa5]/.test(arrNew[m].name) ? m : '-1';
        if (mm > -1) {
            break;
        }
    }
    for (var n = arrNew.length - 1; n >= 0; n--) {
        var nn = /^[\u4e00-\u9fa5]/.test(arrNew[n].name) ? n : '-1';
        if (nn > -1) {
            break;
        }
    }
    if (mm > -1) {
        var arrTmp = arrNew.splice(m, parseInt(n - m) + 1);
        arrNew = arrNew.concat(arrTmp);
    }
    return arrNew
}