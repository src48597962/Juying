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