//drpy运行环境相关
const MAX_ENVIRONMENTS = 10;
let environments = {};
let nextId = 0;

function createOrGetEnvironment(id) {
    if (id === undefined) {
        // 如果没有提供ID，创建一个新环境并分配ID
        id = nextId++;
    }

    if (environments[id]) {
        // 如果环境已存在，直接返回
        return environments[id];
    }

    // 如果环境数量达到上限，销毁最早的环境
    if (Object.keys(environments).length >= MAX_ENVIRONMENTS) {
        const oldestId = Object.keys(environments).sort((a, b) => a - b)[0];
        environments[oldestId].destroy();
        delete environments[oldestId];
    }

    // 创建新环境
    environments[id] = (function() {
        let data = {};
        return {
            id,
            execute: function(code) {
                const fn = new Function('data', code);
                fn(data);
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