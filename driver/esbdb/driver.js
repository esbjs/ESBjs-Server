var fs = require('fs');
var path = require('path');
var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
const MAX_DIR = 120000;
const uuidv4 = require('uuid/v4');

exports.Execute = function (envelope, req, res) {

}

exports.Init = function () {

}

exports.Log = function (envelope) {
    return undefined;
}

exports.Repository = function(){
    return queue.pop();
}

exports.Domain = function(req, res){
    if(req.body.domain != undefined && req.body.domain != ""){
        return req.body.domain;
    }

    if(global.esbdb == null){
        global.esbdb = {};
    }

    // já existe um diretório com menos de 120.000 arquivos
    console.error(global.esbdb[req.body.project]);
    if(global.esbdb[req.body.project] != undefined && global.esbdb[req.body.project].count < MAX_DIR){
        global.esbdb[req.body.project].count += 1;
        return global.esbdb[req.body.project].domain;
    }

    // vamos criar um
    req.body.domain = "generic/" + uuidv4().toString();
    global.esbdb[req.body.project] = {};
    global.esbdb[req.body.project].domain = req.body.domain;
    global.esbdb[req.body.project].count = 1;
    return req.body.domain;
}

// ---------------- LISTA CIRCULAR DE REPOSITÓRIOS POR PADRÃO SERÁ USADO UM MODELO ROUND ROBIN --------------
var CircularQueueItem = function (value, next, back) {
    this.next = next;
    this.value = value;
    this.back = back;
    return this;
};

var CircularQueue = function (queueLength) {
    this._current = new CircularQueueItem(undefined, undefined, undefined);
    var item = this._current;
    for (var i = 0; i < queueLength - 1; i++) {
        item.next = new CircularQueueItem(undefined, undefined, item);
        item = item.next;
    }
    item.next = this._current;
    this._current.back = item;

    this.push = function (value) {
        this._current.value = value;
        this._current = this._current.next;
    };
    this.pop = function () {
        this._current = this._current.back;
        return this._current.value;
    };
    return this;
}

var queue = new CircularQueue(CONFIG.repositories.length);
for(var i = 0; i < CONFIG.repositories.length; i++){
    queue.push(CONFIG.repositories[i]);
}
// ---------------------------------------------------------------------------------------