var path = require('path');
var fs = require('fs');
var driver = require(path.join(__dirname, '..', "driver.js"));
var utilitario = require(path.join(__dirname, '..', '..', "..", 'api', "utilitario.js"));
const uuidv4 = require('uuid/v4');
const CONFIG = JSON.parse(fs.readFileSync(path.join(__dirname, "..", 'config.json')));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        // se não informa o tipo de repositório, então vamos pegar
        //  o repositório mais importante que é o primeiro da lista de repositorios
        if(req.body.repository == ""){
            req.body.repository = CONFIG.repositories[0].token;
        }

        var repositorio = CONFIG.repositories.find(function(value){ return value.token == req.body.repository;})
        const path_file = path.join(repositorio.path, req.body.project, req.body.domain, req.body.name);
        fs.exists(path_file, function(retorno){
            if(retorno) {
                fs.readFile(path_file, function (err, data) {
                    if (err){
                        console.error(err);
                        processResponse(req, res, false, err);
                        return;
                    }
                    processResponse(req, res, true, data.toString());
                });
            }
            else{
                console.error('O arquivo não existe.')
                processResponse(req, res, false, "O arquivo não existe.");
            }
        });
    }
    catch (e){
        console.error(e.stack);
        processResponse(req, res, false, e);
    }

}
// project, domain, data
