
var http = require('http');
var sessionId = "";//str(uuid.uuid4());

function Request(envelope, server, callback){

    envelope['sessionId'] = sessionId;
    envelope['trasactionId'] = '';    //str(uuid.uuid4());
    envelope['system'] = {
        'nome': "",
        'sistema': ""
    }
    envelope['tokenId'] = ""//self.tokenId;
    var options = {
        hostname: server,
        port: 5007,
        path: '/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    };
    var retorno_funcao = '';
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (body) {
            retorno_funcao += body;

        });
        res.on('end', function (body) {
            callback(JSON.stringify(retorno_funcao));

        });
    });
    req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });
    req.write(JSON.stringify(envelope));
    req.end();
}

exports.Select = function(table, key, driver, bus, server, callback){
    var evelope = {"operation": "select","table": table, "key" : key, "driver" : driver, "bus" : bus};
    Request(evelope, server, callback);
}

exports.TestInsert = function(table, key, data, driver, bus, server, callback){
    var envelope = {"operation": "testinsert", "table": table,
        "version": 0, "key": key, "data": data, "driver" : driver}
    Request(envelope, server, callback);
}

