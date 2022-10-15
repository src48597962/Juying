function SRCSet() {
    addListener("onClose", $.toString(() => {
        clearMyVar('guanlicz');
        clearMyVar('duoselect');
        clearMyVar('datalist');
        //refreshPage(false);
    }));
    setPageTitle("♥管理"+getMyVar('SrcJuying-Version', ''));
    clearMyVar('duoselect');
    clearMyVar('datalist');
    function getTitle(title, Color) {
        return '<font color="' + Color + '">' + title + '</font>';
    }
    var d = [];
}