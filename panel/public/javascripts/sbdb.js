


function Select (table, key, driver, bus, server, param, callback){
    var evelope = {"operation": "select","table": table, "key" : key, "driver" : driver, "bus" : bus};
    EnviarJsonPost('http://' + server + ":5007/request",evelope, param, callback);
}

function Count (table, key, driver, bus, server, param, callback){
    var evelope = {"operation": "count","table": table, "key" : key, "driver" : driver, "bus" : bus};
    EnviarJsonPost('http://' + server + ":5007/request",evelope, param, callback);
}

function TestInsert(table, key, data, driver, bus, server, param, callback){
    var envelope = {"operation": "testinsert", "table": table,
        "version": 0, "key": key, "data": data, "driver" : driver}
    EnviarJsonPost(envelope, server, param, callback);
}
