/**
 * Created by wellington on 26/02/17.
 */


exports.UpdateAsync = function (generico, schema, chave, data, parametros, callback) {
    try {
        delete data.__v;

        generico.update(chave, data, {upsert: true}, function (err, doc) {
            if (err) {
                console.error(err);
                return;
            }
            ;
            callback(doc);
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
            //console.error('Novo limite:', limit);
        }
        if (sort == undefined) {
            generico.find(consulta).limit(limit).exec(function (err, docs) {
                try {
                    callback(docs);
                }
                catch (e) {
                    console.error(e.stack);
                }
            });
        }
        else {
            generico.find(consulta).limit(limit).sort(sort).exec(function (err, docs) {
                console.error('Total de elementos:', docs.length);
                callback(docs);
            });
        }
    }catch(e){
        console.error(e.stack);
    }
}





