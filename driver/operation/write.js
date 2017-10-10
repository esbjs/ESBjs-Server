var path = require('path');
var fs = require('fs');
var driver_fs = require(path.join(__dirname, '..', "driver.js"));
var utilitario = require(path.join(__dirname, '..', '..', "..", 'api', "utilitario.js"));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        var repostiorio = driver_fs.Repositorio(req.body);

        // CRIANDO RECURSIVAMENTE O DIRETÓRIO DO PROJETO CASO NÃO TENHA
        //      SIDO CRIADO NO SISTEMA OPERACIONAL
        var buffer_path_array = req.body.path.split('/');
        var buffer_path_string = repostiorio.path;
        for(var i = 0; i < buffer_path_array.length - 1; i++){
            var buffer_path_string = path.join(buffer_path_string, buffer_path_array[i] );
            if(!fs.existsSync(buffer_path_string)){
                fs.mkdirSync(buffer_path_string);
            }
        }

        // SALVA O ARQUIVO, ONDE PODE SER SALVO COMO TEXTO OU EM BINÁRIO
        var key = utilitario.KeyFilePath(repostiorio.path + req.body.path);
        if(req.body.type == 'base64') {
            fs.writeFile(repostiorio.path + req.body.path, req.body.data, 'base64', function (err) {
                if (err) throw err;
                processResponse(req, res, true, {"return": true, "keyfile": key});

            });
        }
        else{
            fs.writeFile(repostiorio.path + req.body.path, req.body.data, function (err) {
                if (err) throw err;
                processResponse(req, res, true, {"return": true, "keyfile": key});

            });
        }
    }
    catch (e){
        processResponse(req, res, false, e);
    }
}

