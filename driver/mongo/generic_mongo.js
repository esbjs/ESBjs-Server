var Mongoose = require('mongoose').Mongoose;
var fs = require('fs');
var path = require('path');
var mongog = require(path.join(__dirname, "..", "..", "api", "mongog.js"));
var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))

// ---------------------------------- SCHEMAS ----------------------

var instancias = {};
function GetSchema(instancia, schema){
    try {


        if (instancias[instancia] == undefined) {

            console.log('Não existe', instancia)
            var mongoose = new Mongoose();

            var stringConexao = 'mongodb://' + CONFIG.mongo.ip + '/' + instancia;
            mongoose.connect(stringConexao);
            instancias[instancia] = {
                "connect": mongoose, "genericModel": [],
                "genericSchemas": []
            }
        }
        //console.log(instancias[instancia])
        //console.log(instancias[instancia]);
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

exports.ConsultarAsync = function (instancia, schema, consulta, sort, params, callback) {
    try {
        //console.log(consulta)
        mongog.ConsultarAsync(GetSchema(instancia, schema), schema, consulta, sort, params, callback);
    }catch(e){
        console.error(e.stack);
    }

}

/*
exports.Count = function (schema, consulta, params, callback) {
    var generico = Esquema(schema);
    generico.count(consulta, function( err, count){
        //console.log( "Number of users:", count );
        callback({"count" :  count });
    })
}
*/


exports.UpdateAsync = function (instancia, schema, chave, data, parametros, callback) {
    try{
        mongog.UpdateAsync(GetSchema(instancia, schema), schema, chave, data, parametros, callback);
    }
    catch (ex) {
        console.log(ex.stack);
    }
}


exports.Remove = function (instancia, schema, chave, parametros, callback) {
    try{
        mongog.Remove(GetSchema(instancia, schema), chave, parametros, callback);
    }
    catch (ex) {
        console.log(ex.stack);
    }
}







/*function Esquema(schema) {
    if(genericModel[schema] == undefined){
        genericModel[schema] = mongoose.model(schema, genericSchema);
    }
    return genericModel[schema];
}*/













