/*
var path = require('path');
var utilitario = require(path.join(__dirname,  "utilitario.js"));
var Mongoose = require('mongoose').Mongoose;

var instancias = {};
function GetSchema(CONFIG, instancia, schema){
    try {
        instancia = instancia || CONFIG.mongo.instancia;

        if (instancias[instancia] == undefined) {
            var mongoose = new Mongoose();

            var stringConexao = 'mongodb://' + CONFIG.mongo.ip + '/' + instancia;
            mongoose.connect(stringConexao);
            instancias[instancia] = {
                "connect": mongoose, "genericModel": [],
                "genericSchemas": []
            }
        }

        if (instancias[instancia].genericModel[schema] == undefined) {
            var Schema = instancias[instancia].connect.Schema;
            var genericSchema = new Schema({
                "domain": String
            }, {strict: false});
            instancias[instancia].genericModel[schema] = instancias[instancia].connect.model(schema, genericSchema);
        }
        return instancias[instancia].genericModel[schema];
    }
    catch(e){
        console.error(e.stack)
    }
}




exports.InsertAsync = function (generico, chave, data, parametros, callback) {
    try {

        generico.update({"registro" : data.registro}, data, {upsert: true}, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            };
            callback(doc);
        });
    }
    catch (ex) {
        console.error(ex.stack);
    }
}


exports.UpdateAsync = function (generico, schema, chave, data, parametros, callback) {
    try {
        delete data.__v;
        delete data._id

        generico.update(chave, data, {upsert: true}, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            };
            callback(doc);
        });
    }
    catch (ex) {
        console.error(ex.stack);
    }
}

exports.UpdateAsyncV2 = function (CONFIG, instance, schema, chave, data, callback) {
    try {
        delete data.__v;
        delete data._id
        var generico = GetSchema(CONFIG, instance, schema );
        generico.update(chave, data, {upsert: true}, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            };
            callback(doc);
        });
    }
    catch (ex) {
        console.error(ex.stack);
    }
}

exports.Remove = function (generico, chave, parametros, callback) {
    try {
        //delete data.__v;

        generico.remove(chave, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            callback({"return" : true});
        });
    }
    catch (ex) {
        console.error(ex.stack);
    }
}


exports.RemoveV2 = function (CONFIG, instance, schema, chave, callback) {
    try {
        var generico = GetSchema(CONFIG, instance, schema );

        generico.remove(chave, function (err) {
            if (err) {
                console.error(err);
                return;
            }
            callback({"return" : true});
        });
    }
    catch (ex) {
        console.error(ex.stack);
    }
}


exports.Drop = function (generico, collection, callback) {
    try {

        generico.db.db.dropCollection(collection, function(err, result) {
            if(err) console.error(err);

            callback({"status" : true, "result" : result});
        });

    }
    catch (ex) {
        callback(ex.stack);
    }
}


exports.ConsultarAsync = function (generico, schema, consulta, sort, params, callback) {
    try {
        var limit = 99999;
        if (params.limit != "") {
            limit = parseInt(params.limit);
        }
        if (sort == undefined) {
            generico.find(consulta).limit(limit).exec(function (err, docs) {
                try {
                    // TODO: TIRAR LINHA ABAIXO
                    callback(docs);
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else {
            generico.find(consulta).limit(limit).sort(sort).exec(function (err, docs) {
                // TODO: TIRAR LINHA ABAIXO
                callback(utilitario.FormataObjeto(docs));
            });
        }
    }catch(e){
        console.error(e.stack);
    }
}

exports.CursorCreate = function(CONFIG, sort, instancia){
    // primeiro bloqueio de região critica, para evitar multiplas instancias pedindo do banco de dados
    //while(instancia.array == undefined && instancia.aguarde != undefined) require('deasync').sleep(100);
    try {
        if (instancia.array == undefined) {
            instancia.aguarde = true; // bloqueio so semáforo

            var generico = GetSchema(CONFIG, instancia.instance, instancia.schema);

            //var data = utilitario.DataFormatada(undefined, "YYYYMMDDHHMM");
            /!*var key = {
             "$or": [
             {
             "status.status": "processando",
             "status.data": {"$lt": parseInt(data)}
             },
             {"status": {"$exists": false}}]
             };*!/
            var query = generico.find({}).sort(sort);
            query.exec(function (err, docs) {
                try {
                    //console.log('Carregado:', instancia.instance, instancia.schema, docs.length);
                    if (docs.length > 0) {

                        instancia.pos = 0;
                        instancia.array = docs;
                        instancia.aguarde = undefined;
                    }
                }
                catch (e) {
                    console.error(e.stack);
                }
            });

            // aguardar a primeira instancia retornar o array....
            //while(instancia.array == undefined) require('deasync').sleep(100);
        }
    }catch(e){
        console.log(e);
        console.log(e.stack);
    }
}

exports.Cursor = function(CONFIG, req, res, instancia, callretorno){
    if(instancia.array != undefined && instancia.pos < instancia.array.length){
        callretorno({"pos" : instancia.pos ,"item" : instancia.array[instancia.pos++]} );
    }

}

exports.CursorClear = function(CONFIG, req, res, instancia, callretorno){
    if(instancia.array == undefined) {
        callretorno(undefined);
        return;
    }

    callretorno(instancia.array[req.body.pos]);

}



exports.ConsultarAsyncV2 = function (generico, consulta, sort, fiedls, params, callback, pos, retornos) {
    try {
        var count = undefined;
        var limit = 999999;
        if (params.limit != "") {
            limit = parseInt(params.limit);
        }

        if(sort == undefined || sort == null) sort = "_id";

        if(isArray(consulta) && retornos == undefined){
            retornos = [];
            pos = 0;
        }

        if( isArray(consulta))
        {
            var query = generico.find(consulta[pos]).limit(limit).sort(sort).select(fiedls);
            query.exec(function (err, docs) {
                try {
                    if(consulta.length > pos + 1) {
                        retornos.push(docs);
                        exports.ConsultarAsyncV2(generico, consulta, sort, fiedls, params, callback, pos + 1, retornos);
                    }
                    else{
                        if(count != undefined){
                            callback(retornos.length);
                        }
                        else{
                            callback(retornos);
                        }

                    }
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else{
            var query = generico.find(consulta).limit(limit).sort(sort).select(fiedls);
            query.exec(function (err, docs) {
                try {
                    // TODO: TIRAR LINHA ABAIXO
                    if(count != undefined){
                        callback(docs.length);
                    }
                    else{
                        callback(docs);
                    }
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }

    }catch(e){
        console.error(e.stack);
    }
}

exports.ConsultarAsyncV3 = function (CONFIG, instancia, schema, consulta, sort, fiedls, params, callback, pos, retornos) {
    try {
        var count = undefined;
        var limit = 999999;
        if (params.limit != "") {
            limit = parseInt(params.limit);
        }

        if(sort == undefined || sort == null) sort = "_id";

        if(isArray(consulta) && retornos == undefined){
            retornos = [];
            pos = 0;
        }

        var generico = GetSchema(CONFIG, instancia, schema );
        if( isArray(consulta))
        {
            var query = generico.find(consulta[pos]).limit(limit).sort(sort).select(fiedls);
            query.exec(function (err, docs) {
                try {
                    if(consulta.length > pos + 1) {
                        retornos.push(docs);
                        exports.ConsultarAsyncV2(generico, consulta, sort, fiedls, params, callback, pos + 1, retornos);
                    }
                    else{
                        if(count != undefined){
                            callback(retornos.length);
                        }
                        else{
                            callback(retornos);
                        }

                    }
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else{
            var query = generico.find(consulta).limit(limit).sort(sort).select(fiedls);
            query.exec(function (err, docs) {
                try {
                    // TODO: TIRAR LINHA ABAIXO
                    if(count != undefined){
                        callback(docs.length);
                    }
                    else{
                        callback(docs);
                    }
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }

    }catch(e){
        console.error(e.stack);
    }
}


function isArray (ar) {
    return ar instanceof Array
        || Array.isArray(ar)
        || (ar && ar !== Object.prototype && isArray(ar.__proto__));
}

*/
