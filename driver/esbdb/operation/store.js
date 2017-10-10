var path = require('path');
var fs = require('fs');
var driver = require(path.join(__dirname, '..', "driver.js"));
var utilitario = require(path.join(__dirname, '..', '..', "..", 'api', "utilitario.js"));
const uuidv4 = require('uuid/v4');

exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        const repositorio = driver.Repository(); // pegando o repositorio que srá usado para armazenar.
        // Atualmente fs-local, no futuro: fs-network, ftp, http, dropbox, etc...
        if(repositorio.type == 'fs-local'){

            // se é local, então temos que perguntar se já existe um domínio criado
            if(req.body.domain == undefined || req.body.domain == ""){
                req.body.domain = driver.Domain(req, res);
            }

            // criar diretório recursivo
            var name = req.body.name;
            if(name == "")
                name = uuidv4().toString();

            const path_file = path.join(repositorio.path, req.body.project, req.body.domain, name);
            utilitario.CreateDirecotry(path_file);

            // salvar
            fs.writeFile(path_file, JSON.stringify(req.body.data), function (err) {
                if (err) {
                    processResponse(req, res, false, err);
                    return;
                }
                processResponse(req, res, true, {"return": true, "keyfile": utilitario.KeyFilePath(path_file),
                    "name" : name, "domain" : req.body.domain,
                    "repository" : repositorio.token });
            });

        }
        else{
            processResponse(req, res, false, "Tipo de repostório não localizado");
        }
    }
    catch (e){
        console.error(e.stack);
        processResponse(req, res, false, e);
    }

}
// project, domain, data
