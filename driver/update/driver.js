var path = require('path');
var fs = require('fs');
var utilitario = require(path.join(__dirname, '..', '..', 'api', 'utilitario.js'));


exports.Execute = function (envelope, req, res) {
    if (envelope.operation == 'read') {
        try {
            fs.readFile(envelope.path, function (err, data) {
                if (err) {
                    res.end(JSON.stringify({"status": false, "data": ""}));
                }
                else {
                    res.end(JSON.stringify({"status": true, "data": data.toString()}));
                }
            });

        } catch (e) {
            console.error(e)
        }
    }
    else if (envelope.operation == 'list') {
        var retorno = [];
        try {
            for (i in envelope.files) {
                var file = envelope.files[i];

                if (file.path.indexOf("/sbdb/bus/") > 0){
                    console.log('Ingornar:', file.path);
                    continue;
                }

                var key_local = utilitario.KeyFilePath(file.path);
                if (key_local != file.key) {
                    retorno.push(file);
                }
            }
        } catch (e) {
            console.error(e)
        }
        ;
        res.end(JSON.stringify(retorno));
    }

}

exports.Init = function () {

}

exports.Log = function (envelope) {
    return undefined;
}




