function SrcXPath(html,note,array){
    try{
        if(array==1){
            return xpathArray(html, note);
        }else{
            return xpath(html, note).trim();
        }
    }catch(e){
        log(e.message)
    }
    return "";
}
