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
let drpymuban = "https://raw.gitmirror.com/hjdhnx/hipy-server/master/app/t4/files/drpy_libs/%E6%A8%A1%E6%9D%BF.js";

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

//获取分组接口列表
function getGroupLists(datas, k) {
    k = k=="全部"?"":k;
    datas = datas.filter(it=>{
        let group = it.group||it.type;
        return !k || (k==group);
    })
    if(getItem('sourceListSort','name') == 'update'){
        datas = sortByPinyin(datas);
    }
    return datas;
}
//获取接口分组名arry
function getJiekouGroups(datas) {
    let groupNams = [];
    datas.forEach(it => {
        let group = it.group||it.type;
        if (groupNams.indexOf(group)==-1){
            groupNams.push(group);
        }
    })
    return groupNams;
}
//删除统一入口
function deleteData(lx, data){
    let sourcefile = getFile(lx);
    let sourcedata = fetch(sourcefile);
    eval("let datalist=" + sourcedata + ";");
    let dellist= [];
    if(!data){
        dellist = Object.assign(dellist, datalist);
    }else if($.type(data)=='object'){
        dellist.push(data);
    }else if($.type(data)=='array'){
        dellist = data;
    }

    dellist.forEach(it => {
        if(lx=='jk' && /^hiker:\/\/files\/cache\/src\//.test(it.url)){
            deleteFile(it.url);
        }
        let dataurl = lx=='jk'?it.url:it.parse;
        let index = datalist.indexOf(datalist.filter(d => dataurl==(lx=='jk'?d.url:d.parse) )[0]);
        datalist.splice(index, 1);
    })

    writeFile(sourcefile, JSON.stringify(datalist));
    if(lx=='jk'){
        clearMyVar('SrcJu_searchMark');
    }
    clearMyVar('SrcJu_duoselect');
}
//接口禁用启用
function dataEnable(lx, data, input) {
    let sourcefile = getFile(lx);
    let sourcedata = fetch(sourcefile);
    eval("let datalist=" + sourcedata + ";");

    let waitlist= [];
    if($.type(data)=='object'){
        waitlist.push(data);
    }else if($.type(data)=='array'){
        waitlist = data;
    }
    let sm;
    waitlist.forEach(it => {
        let dataurl = lx=='jk'?it.url:it.parse;
        let index = datalist.indexOf(datalist.filter(d => dataurl==(lx=='jk'?d.url:d.parse) )[0]);
        if(input == "禁用"){
            datalist[index].stop = 1;
            sm = waitlist.length==1?'已禁用：'+it.name:'已禁用所选的'+waitlist.length+'个';
        }else{
            delete datalist[index].stop;
            sm = waitlist.length==1?'已启用：'+it.name:'已启用所选的'+waitlist.length+'个';
        }
    })
    writeFile(sourcefile, JSON.stringify(datalist));
    if(lx='jk'){
        clearMyVar('SrcJu_searchMark');
    }
    clearMyVar('SrcJu_duoselect');
    return sm;
}
// 获取接口对应的显示标题
function getDataTitle(data) {
    if(data.url){
        return data.name + ' ('+data.type+')' + (data.group&&data.group!=data.type?' [' + data.group + ']':"");
    }else{
        return data.sort+'-'+data.name+'-'+data.parse;
    }
}
//接口管理多选方法
function duoselect(datas){
    let datalist = [];
    if($.type(datas)=="array"){
        datalist = datalist.concat(datas);
    }else if($.type(datas)=="object"){
        datalist.push(datas);
    }
    let duoselect = storage0.getMyVar('SrcJu_duoselect') || [];
    datalist.forEach(data=>{
        let id = data.url?data.url:data.parse;
        if(!duoselect.some(item => id==(item.url?item.url:item.parse))){
            duoselect.push(data);
            updateItem(id, {title:'‘‘’’'+colorTitle(getDataTitle(data),'#3CB371')});
        }else{
            for(var i = 0; i < duoselect.length; i++) {
                if(id == (duoselect[i].url?duoselect[i].url:duoselect[i].parse)) {
                    duoselect.splice(i, 1);
                    break;
                }
            }
            updateItem(id, {title:data.stop?`‘‘’’`+colorTitle(getDataTitle(data),'#f20c00'):getDataTitle(data)});
        }
    })
    storage0.putMyVar('SrcJu_duoselect',duoselect);
}
// 点播主页选择源接口
function selectSource(group, k) {
    let datalist = getDatas('jk');
    let yxdatalist = datalist.filter(it=>{
        return !it.stop;
    });
    let jkdatalist = getGroupLists(yxdatalist, group);
    let sitenames = jkdatalist.map(it=>{
        return it.name;
    })
    if(k){
        sitenames = sitenames.filter(it => {
            return it.indexOf(k)>-1;
        })
    }

    return $(sitenames, 2, "选择主页源").select((group, cfgfile, Juconfig) => {
        Juconfig['indexSource'] = group+'_'+input;
        writeFile(cfgfile, JSON.stringify(Juconfig));
        clearMyVar('SrcJu_dianbo$分类');
        clearMyVar('SrcJu_dianbo$类型');
        clearMyVar('SrcJu_dianbo$地区');
        clearMyVar('SrcJu_dianbo$年份');
        clearMyVar('SrcJu_dianbo$排序');
        clearMyVar('SrcJu_dianbo$fold');
        clearMyVar('SrcJu_dianbo$classCache');
        refreshPage(true);
        return 'toast://' + input;
    }, group, cfgfile, Juconfig)
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
//文字上色
function colorTitle(title, Color) {
    return '<font color="' + Color + '">' + title + '</font>';
}