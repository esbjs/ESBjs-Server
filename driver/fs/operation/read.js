var path = require('path');
var fs = require('fs');
var driver_fs = require(path.join(__dirname, '..', "driver.js"));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{

        var repostiorio = driver_fs.Repositorio(req.body);
        fs.exists(repostiorio.path + req.body.path, function(retorno){
            if(retorno) {
                fs.readFile(repostiorio.path + req.body.path, function (err, data) {
                    if (err) throw err;

                    processResponse(req, res, true, data.toString());
                });
            }
            else{
                throw "O arquivo não existe.";
            }
        });
    }
    catch (e){
        processResponse(req, res, false, e);
    }
}

