function (input) {
    let list = JSON.parse(request('https://yunpan1.com/api/discussions?include=user,lastPostedUser,mostRelevantPost,mostRelevantPost.user,tags,tags.parent,firstPost&filter[q]='+input+' tag:video1&filter[tag]=video1&sort&page[offset]=0', {
        timeout: 5000
    })).included;

    let data = [];
    list.forEach(item => {
        if(item.type == "posts"){
            let html = item.attributes.contentHtml;
            let htmls = html.split('<br>\n');
            for(let i=0;i<htmls.length;i++){
                if(htmls[i].includes('aliyundrive.com') && i>0){
                    let name = htmls[i-1].replace(/]+>/g,"");
                    let url = htmls[i].match(/https.*?\"/)[0].replace(`"`,"");
                    if(name.includes(input)&&url.includes('aliyundrive.com')){
                        data.push({
                            title: name,
                            url: url
                        })
                    }
                }
            }
        }
    })
    return data;
}
