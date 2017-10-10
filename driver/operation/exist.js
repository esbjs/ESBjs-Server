var path = require('path');
var fs = require('fs');
var driver_fs = require(path.join(__dirname, '..', "driver.js"));

exports.ExecuteV2 = function (req, res, processResponse) {
    try{

        var repostiorio = driver_fs.Repositorio(req.body);

        fs.exists(repostiorio.path + req.body.path, function (existe) {
            processResponse(req, res, true, {"return": true, "exist": existe});
        });



    }
    catch (e){
        processResponse(req, res, false, e);
    }
}

