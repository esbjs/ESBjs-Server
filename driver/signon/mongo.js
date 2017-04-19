var Mongoose = require('mongoose').Mongoose;
var fs = require('fs');
var path = require('path');
var mongog = require(path.join(__dirname, "..", "..", "api", "mongog.js"));
var mongoose = new Mongoose();

var CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json')))
var stringConexao = 'mongodb://'+ CONFIG.mongo.ip +'/signon';
mongoose.connect(stringConexao);

// ---------------------------------- SCHEMAS ----------------------
var Schema = mongoose.Schema;
var genericSchema = new Schema({
    "domain": String
}, {strict: false});


var genericModel = [];
var genericSchemas = [];

genericSchemas['person'] = new Schema({





    "email":  {type:Array},
    "data" : Date,
    "teste" : ""
}, {strict: false});
genericModel['person'] = mongoose.model('person', genericSchemas['person']);


// ------------------------------------------------------------------

exports.ConsultarSchema = function (schema, req, res) {
    //console.log(schema);
    res.end(JSON.stringify(genericSchemas[schema].paths));
}

exports.ConsultarAsync = function (schema, consulta, sort, params, callback) {
    try {
        mongog.ConsultarAsync(Esquema(schema), schema, consulta, sort, params, callback);
    }catch(e){
        console.error(e.stack);
    }

}

exports.Count = function (schema, consulta, params, callback) {
    var generico = Esquema(schema);
    generico.count(consulta, function( err, count){
        //console.log( "Number of users:", count );
        callback({"count" :  count });
    })
}


exports.UpdateAsync = function (schema, chave, data, parametros, callback) {
    try{
        mongog.UpdateAsync(Esquema(schema), schema, chave, data, parametros, callback);
    }
    catch (ex) {
        console.log(ex.stack);
    }
}
//InsertAsync           function (generico, chave, data, parametros, callback) {
exports.InsertAsync = function (schema, chave, data, callback) {
    try{
        console.log(schema);

        mongog.InsertAsync(Esquema(schema), chave, data, undefined, callback);
    }
    catch (ex) {
        console.log(ex.stack);
    }
}


exports.Remove = function (schema, chave, parametros, callback) {
    try{
        mongog.Remove(Esquema(schema), chave, parametros, callback);
    }
    catch (ex) {
        console.log(ex.stack);
    }
}


// Retorna uma variável des schema baseado em um array de collections
function Esquema(schema) {
    if(genericModel[schema] == undefined){
        console.error("Shcema nao localizado:", schema)
        genericModel[schema] = mongoose.model(schema, genericSchema);
    }
    console.error('Retornando:', schema);
    return genericModel[schema];
}