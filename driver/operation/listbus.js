var path = require('path');
var fs = require('fs');


exports.ExecuteV2 = function (req, res, processResponse) {
    try{
        processResponse(req, res, true, global.CONFIG.others);
    }
    catch (e){
        processResponse(req, res, false, e);
    }
}

