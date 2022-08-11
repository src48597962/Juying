function SrcXPath(html,note,array){
    try{
        if(array==1){
            return xpathArray(html, note);
        }else{
            return xpath(html, note);
        }
    }catch(e){
        log(e.message)
    }
    return "";
}
