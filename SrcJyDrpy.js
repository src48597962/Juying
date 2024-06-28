//drpy运行环境相关

const isCloseLog = !getItem("useLog", "");
const localKey = "drpy";
const CryptoUtil = $.require("hiker://assets/crypto-java.js");
globalThis.local = {
    set(rulekey, k, v) {
        storage0.setItem(localKey + "@" + rulekey + "@" + k, v);
    },
    get(rulekey, k, v) {
        return storage0.getItem(localKey + "@" + rulekey + "@" + k, "") || v;
    },
    delete(rulekey, k) {
        storage0.clearItem(localKey + "@" + rulekey + "@" + k);
    }
};
eval(getCryptoJS());
globalThis.CryptoJS = CryptoJS;

let $request = request;
let $post = post;
globalThis.req = function (url, cobj) {
    try {
        let res = {};
        let obj = Object.assign({}, cobj);
        if (obj.data) {
            obj.body = obj.data;
            delete obj.data;
        }

        if (obj.hasOwnProperty("redirect")) obj.redirect = !!obj.redirect;
        if (obj.buffer === 2) {
            obj.toHex = true;
        }
        obj.headers = Object.assign({
            Cookie: "#noCookie#"
        }, obj.headers);
        if (url === "https://api.nn.ci/ocr/b64/text" && obj.headers) {
            obj.headers["Content-Type"] = "text/plain";
        }

        if (url.startsWith("file://") && (url.includes("?type=") || url.includes("?params="))) {
            url = url.slice(0, url.lastIndexOf("?"));
        }
        for (let key in obj.headers) {
            if (typeof obj.headers[key] !== "string") {
                obj.headers[key] = String(obj.headers[key]);
            }
        }
        let r = "";
        r = $request(url, obj);
        if (obj.withHeaders) {
            r = JSON.parse(r);
            res.content = r.body;
            res.headers = {};
            for (let [k, v] of Object.entries(r.headers || {})) {
                res.headers[k] = v[0];
            }
        } else {
            res.content = r;
        }
        if (obj.buffer === 2) {
            res.content = CryptoUtil.Data.parseHex(res.content).toBase64(_base64.NO_WRAP);
        }
        return res;
    } catch (e) {
        log("Error" + e.toString());
    }
}

String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
};
let $toString = Function.prototype.toString;
Function.prototype.toString = function () {
    return $toString.apply(this).trim();
};
if (isCloseLog) {
    // 重写console.log函数
    console.log = function () {
        // 检查传入参数的数量
        if (arguments.length > 1) {
            // 如果参数数量大于1，调用原始的console.log函数
            //originalLog.apply(console, arguments);
        } else {
            return;
        }
        // 如果参数只有一个，则不做任何操作
    };
}

const MAX_ENVIRONMENTS = 10;
let environments = {};
let nextId = 0;

function createOrGetEnvironment(id) {
    if (id === undefined) {
    id = nextId++;
    }

    if (environments[id]) {
        log(id+'>取初始化缓存');
        return environments[id];
    }

    if (Object.keys(environments).length >= MAX_ENVIRONMENTS) {
        const oldestId = Object.keys(environments).sort((a, b) => a - b)[0];
        delete environments[oldestId];
    }

    environments[id] = (function() {
        let drpy2 = $.require(module.modulePath.slice(0, module.modulePath.lastIndexOf("/")) +'/drpy/drpy2.js');
        return {
            runMain: drpy2.runMain,
            getRule: drpy2.getRule,
            init: drpy2.init,
            home: drpy2.home,
            homeVod: drpy2.homeVod,
            category: drpy2.category,
            detail: drpy2.detail,
            play: drpy2.play,
            search: drpy2.search,
            proxy: drpy2.proxy,
            sniffer: drpy2.sniffer,
            isVideo: drpy2.isVideo,
            fixAdM3u8Ai: drpy2.fixAdM3u8Ai,
        }
    })();

    return environments[id];
}
/*
// 示例使用
const env1 = createOrGetEnvironment('aa');
env1.init('https://raw.liucn.cc/box/libs/js/%E4%B8%8A%E5%A4%B4%E7%9F%AD%E5%89%A7.js'); 
log(env1.getRule()); 
const env2 = createOrGetEnvironment('aa');
//env2.init('https://raw.liucn.cc/box/libs/js/a8%E9%9F%B3%E4%B9%90.js'); 
log(env2.getRule()); 

// 继续创建直到达到最大限制
for (let i = 0; i < MAX_ENVIRONMENTS; i++) {
    createOrGetEnvironment();
}

// 现在只有最近的10个环境存在
log(Object.keys(environments).length); // 输出: 10
*/

$.exports = {
    createOrGetEnvironment
}

/*
const MAX_ENVIRONMENTS = 10;
let environments = {};
let nextId = 0;

function createOrGetEnvironment(id) {
    if (id === undefined) {
        id = nextId++;
    }

    if (environments[id]) {
        return environments[id];
    }

    if (Object.keys(environments).length >= MAX_ENVIRONMENTS) {
        const oldestId = Object.keys(environments).sort((a, b) => a - b)[0];
        environments[oldestId].destroy();
        delete environments[oldestId];
    }

    environments[id] = (function() {
        let data = {};
        return {
            id,
            execute: function(code) {
                eval(code);

            },
            getVariable: function(name) {
                return data[name];
            },
            setVariable: function(name, value) {
                data[name] = value;
            },
            destroy: function() {
                delete environments[id];
            }
        };
    })();

    return environments[id];
}
// 示例使用
const env1 = createOrGetEnvironment();
env1.execute('data.x = 10;'); // 确保在获取变量值前执行代码
console.log(env1.getVariable('x')); // 应输出: 10

const env2 = createOrGetEnvironment(123);
env2.execute('data.y = 20;');
console.log(env2.getVariable('y')); // 输出: 20

// 重复获取环境2，应当直接返回之前的环境
const env2Again = createOrGetEnvironment(123);
console.log(env2Again.getVariable('y')); // 输出: 20，验证环境重用

// 继续创建直到达到最大限制
for (let i = 0; i < MAX_ENVIRONMENTS - 2; i++) {
    createOrGetEnvironment();
}

// 超过最大限制时，最旧的环境会被销毁
const env11 = createOrGetEnvironment();
env11.execute('data.z = 30;');
console.log(env11.getVariable('z')); // 输出: 30

// 现在只有最近的10个环境存在
console.log(Object.keys(environments).length); // 输出: 10
*/