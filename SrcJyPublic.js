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

    return datalist;
}



