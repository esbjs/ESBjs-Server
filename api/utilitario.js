var fs = require('fs');

exports.GetDirectory = function(currentpath){
    const fs = require('fs')
    const path = require('path')

    var files = fs.readdirSync(currentpath);
    for(i in files){
        console.log(files[i]);
    }
    return files;
}

exports.KeyFile = function(str){
    return keyFile(str);
}

exports.KeyFilePath = function(path){
    if (!fs.existsSync(path)) {
        //console.error('Arquivo não existe:', path)
        return undefined;
    }
    return keyFile(fs.readFileSync(path).toString());
}


function leftpad(texto) {
    var pad = "00"
    return pad.substring(0, pad.length - texto.length) + texto
}


exports.DataFormatada = function(data, formato) {
    if (data == undefined) {
        data = new Date();
    }
    if (formato == 'YYYYMMDDHH') {
        return data.getFullYear() + formataCasas(data.getMonth() + 1, 2) + formataCasas(data.getDate(), 2) + formataCasas(data.getHours(), 2);
    }
    if (formato == 'YYYYMMDDHHMM') {
        return data.getFullYear() + formataCasas(data.getMonth() + 1, 2) + formataCasas(data.getDate(), 2)
            + formataCasas(data.getHours(), 2) + formataCasas(data.getMinutes(), 2);
    }
    if (formato == 'DD/MM/YYYY HH:MM') {
        return formataCasas(data.getDate(), 2) +"/" + formataCasas(data.getMonth() + 1, 2) + "/" + data.getFullYear()
            + " " + formataCasas(data.getHours(), 2) + ":" + formataCasas(data.getMinutes(), 2);
    }
    if (formato == 'YYYYMMDD') {
        //console.error(data.toString());
        return data.getFullYear() + formataCasas(data.getMonth() + 1, 2) + formataCasas(data.getDate(), 2);
    }
    if (formato == 'YYYY') {
        //console.error(data.toString());
        return data.getFullYear() ;
    }
    if (formato == 'YYYYMM') {
        //console.error(data.toString());
        return data.getFullYear() + formataCasas(data.getMonth() + 1, 2) ;
    }
    if (formato == 'FULL') {
        return data.getFullYear() + formataCasas(data.getMonth() + 1, 2) + formataCasas(data.getDate(), 2) + formataCasas(data.getHours(), 2) + formataCasas(data.getMinutes(), 2) + formataCasas(data.getSeconds(), 2);
    }

    throw 'Formato inválido';
}

function keyFile(str){
    var key = 0;
    for(var i = 0; i < str.length; i++){
        key += str.charCodeAt(i) * (i + 1);
    }
    return key;
}

function formataCasas(numero, casas) {
    if (numero.toString().length >= casas) return numero.toString();
    var retorno = '';
    for (var i = 0; i < casas - numero.toString().length; i++) {
        retorno += "0";
    }
    return retorno + numero.toString();
    return date.getFullYear() + separador + data.getMonth() + separador + data.getDate();

}

exports.FormataObjeto = function(js){
    if(js == null || js == undefined){
        return js;
    }

    FormataObjetoRecursivo(js);
    return js;
}

function FormataObjetoRecursivo(js){
    if(Array.isArray(js)){
        console.error(typeof(js));
        js.forEach(function(item){
            FormataObjetoRecursivo(item);
        });
        return;
    }
    for(var key in js){
        if(key.indexOf('[]') > 0){
            console.log(js[key]);
            if(Array.isArray(js[key])) {
                js[key.substring(0, key.length - 2)] = js[key];
            }
            else{
                js[key.substring(0, key.length - 2)] = [ js[key] ];
            }

            delete js[key];
        }
    }
}