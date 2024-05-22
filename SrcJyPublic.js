let cfgfile = "hiker://files/rules/Src/Ju/config.json";
let Jucfg=fetch(cfgfile);
if(Jucfg != ""){
    eval("var Juconfig=" + Jucfg+ ";");
}else{
    var Juconfig= {};
    Juconfig["依赖"] = config.依赖 || "https://gitcode.net/src48597962/hk/-/raw/Ju/SrcJuPublic.js";
    writeFile(cfgfile, JSON.stringify(Juconfig));
}

let runTypes = ["漫画","小说","听书","图集","影视","音频","聚合","其它"];
let runMode = Juconfig["runMode"] || "漫画";
let sourcename = Juconfig[runMode+'sourcename'] || "";//主页源名称
let stopTypes = storage0.getItem('stopTypes',[]);

let sourcefile = "hiker://files/rules/Src/Ju/jiekou.json";
let sourcedata = fetch(sourcefile);
if(sourcedata != ""){
    try{
        eval("var datalist=" + sourcedata+ ";");
    }catch(e){
        var datalist = [];
    }
}else{
    var datalist = [];
}

datalist.reverse();

let yxdatalist = datalist.filter(it=>{
    return !it.stop;
});
let yidatalist = yxdatalist.filter(it=>{
    return it.parse;
});
let erdatalist = yxdatalist.filter(it=>{
    return it.erparse;
});
//获取类型名称数组
function getTypeNames(is) {
    let snames = [];
    if(is=="主页"){
        runTypes.forEach(it=>{
            if(stopTypes.indexOf(it)==-1){
                snames.push(it);
            }
        })
    }else if(is=="搜索页"){
        snames = ["漫画","小说","听书","影视","聚合"];
    }else{
        snames = runTypes;
    }
    return snames;
}
//获取类型名称数组
function getGroupNames() {
    let gnames = [];
    erdatalist.forEach(it=>{
        if(it.group && gnames.indexOf(it.group)==-1){
            gnames.push(it.group);
        }
    })
    return gnames;
}