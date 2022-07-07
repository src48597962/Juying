/**
 * 本地网页插件链接 hiker://files/rules/js/UrlProcessor.js
 * 子页面链接 hiker://page/url-processor
 * 道长仓库链接 http://hiker.nokia.press/hikerule/rulelist.json?id=2849
 * 码云 Gitee 链接 https://gitee.com/reborn0/HikerRules/raw/master/plugins/UrlProcessor.js
 */
function UrlProcessor() {
    this.params = {}
    this.regexMap = [
        {
            reg: 'vodtype\\/(\\d+)',
            exec: () => {
                return this.params.url
                    .replace(/vodtype(\/\d+)\.html/, 'vodshow$1-----------.html')
                    .replace(/\d*(---\d*(\.html|\/))/, this.params.page + '$1')
            }
        },
        {
            reg: 'type\\/\\w+',
            exec: () => {
                return this.params.url
                    .replace(/type(\/\w+)\//, 'show$1-----------/')
                    .replace(/\d*(---\d*(\.html|\/))/, this.params.page + '$1')
            }
        },
        {
            reg: '(vodtype|videot)\\/\\w+',
            exec: () => {
                return this.params.url
                    .replace(/-\d+\.html/, '-' + this.params.page + '.html')
                    .replace(/((vodtype|videot)\/\w+)\.html/, '$1-' + this.params.page + '.html')
            }
        },
        {
            reg: '\\/?[\\w\\d]+-.*?-.*?-.*?-.*?-.*?-.*?-.*?-\\d*---\\d*(\\.html|\\/)',
            exec: () => {
                return this.params.url
                    .replace(/\d*(---\d*(\.html|\/))/, this.params.page + '$1') // 拼接页码
            }
        },
        {
            reg: '((\\/vod\\/show)?(\\/area\\/[\\w\\d%]+)?(\\/by\\/[\\w\\d%]+)?(\\/id\\/\\d+)?(\\/letter\\/[\\w\\d%]+)?)(\\/page\\/\\d+)?(\\/year\\/\\d+)?\\.html',
            exec: () => {
                let regExp = /((\/vod\/show)?(\/area\/[\w\d%]+)?(\/by\/[\w\d%]+)?(\/id\/\d+)?(\/letter\/[\w\d%]+)?)(\/page\/\d+)?(\/year\/\d+)?\.html/
                return this.params.url
                    .replace(regExp, '$1' + ("/page/" + this.params.page) + '$8' + ".html")
            }
        }
    ]
}

Object.assign(UrlProcessor.prototype, {
    constructor: UrlProcessor,
    checkParams() {
        if (!this.params.url) {
            throw new Error("请先调用 .baseUrl(url) 传入链接进行初始化!")
        }
        if (!this.params.page) {
            throw new Error("请先调用 .page(page) 传入页码进行初始化!")
        }
    },
    baseUrl(url){
        this.params.url = url
        return this
    },
    page(page){
        this.params.page = page
        return this
    },
    addExtra(regExp) {
        if (regExp.constructor === Array) {
            this.regexMap = this.regexMap.concat(regExp)
        } else {
            this.regexMap.push(regExp)
        }
        return this;
    },
    debug() {
        this.params.debug = true
        return this;
    },
    exec() {
        this.checkParams()
        let true_url = ''
        for (let i = 0; i < this.regexMap.length; i++) {
            let regObj = this.regexMap[i];
            let urlExp = regObj.reg;
            if (typeof urlExp === 'string') {
                urlExp = new RegExp(urlExp)
            }
            if (urlExp.test(this.params.url)) {
                if (this.params.debug) {
                    log(urlExp.toString())
                }
                true_url = regObj.exec();
                break;
            }
        }
        if (true_url) {
            return true_url;
        } else {
            return this.params.url
        }
    },
    获取处理结果() {
        return this.exec()
    },
    链接(url) {
        return this.baseUrl(url)
    },
    页码(page) {
        return this.page(page)
    },
    插入新处理规则(regExp) {
        return this.addExtra(regExp)
    },
    调试模式() {
        return this.debug();
    }
})
$.exports=new UrlProcessor()
$.exports