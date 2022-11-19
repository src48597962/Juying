function csp_custom_aicb(name) {
    let list = [];
	eval(getCryptoJS());
	let token = CryptoJS.SHA1(name + "URBBRGROUN").toString();
	try {
		let html = request('https://api.cupfox.app/api/v2/search/?text=' + name + '&type=0&from=0&size=200&token=' + token);
		var lists = JSON.parse(html).resources;
	} catch (e) {
		var lists = [];
	}
    lists.forEach(item => {
        let vodname = item.text.replace(/<em>|<\/em>/g, ''); 
        if (!/qq|mgtv|iptv|iqiyi|youku|bilibili|souhu|cctv/.test(item.url)&&vodname.indexOf(name)>-1) {
            list.push({
                vodname: vodname,
                vodpic: "",
                voddesc: item.website + (item.tags.length > 0 ? '  [' + item.tags.join(' ') + ']' : ''),
                vodurl: item.url
            })
        }
    });
    return list;
}