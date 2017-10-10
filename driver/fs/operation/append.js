var path = require('path');
var fs = require('fs');
var driver_fs = require(path.join(__dirname, '..', "driver.js"));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{

        var repostiorio = driver_fs.Repositorio(req.body);

        fs.appendFile(repostiorio.path + req.body.path, req.body.data, 'base64' , function (err) {
            if (err) throw err;
            else {
                var key = utilitario.KeyFilePath(repostiorio.path + req.body.path);
                //console.log('Key:', key, 'Arquivo:',repostiorio.path + req.body.path);
                //res.end(JSON.stringify({"return": true, "keyfile" : key}))
                processResponse(req, res, true, {"return": true, "keyfile" : key})
            }
        });



    }
    catch (e){
        processResponse(req, res, false, e);
    }
}

