var path = require('path');
var utilitario = require(path.join(__dirname,  "utilitario.js"));

/**
 * Created by wellington on 26/02/17.
 */
//mongo.Insert("person", key, envelope.data, function (resultadoinsert)
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



exports.ConsultarAsync = function (generico, schema, consulta, sort, params, callback) {
    try {
        var limit = 99999;
        if (params.limit != "") {
            limit = parseInt(params.limit);
        }
        console.log(consulta)
        if (sort == undefined) {
            generico.find(consulta).limit(limit).exec(function (err, docs) {
                try {
                    console.log(docs);
                    callback(utilitario.FormataObjeto(docs));
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else {
            generico.find(consulta).limit(limit).sort(sort).exec(function (err, docs) {
                console.log(docs);
                callback(utilitario.FormataObjeto(docs));
            });
        }
    }catch(e){
        console.error(e.stack);
    }
}


exports.ConsultarAsyncV2 = function (generico, consulta, sort, fiedls, params, callback) {
    try {
        var limit = 99999;
        if (params.limit != "") {
            limit = parseInt(params.limit);
        }
        console.error(fiedls)
        if(sort == undefined || sort == null) sort = "_id";

        var query = generico.find(consulta).limit(limit).sort(sort).select(fiedls);
        query.exec(function (err, docs) {
            try {
                //console.log(docs);
                callback(utilitario.FormataObjeto(docs));
            }
            catch (e) {
                console.error(e.stack);
            }
        });

    }catch(e){
        console.error(e.stack);
    }
}




