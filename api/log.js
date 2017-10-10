var fs = require('fs');


exports.Log = function(req, res, message){
    try {
        fs.appendFile('/tmp/log_bus.array',  JSON.stringify(
            {
                "bus" : req.body.bus, "driver" : req.body.driver, "operation" : req.body.operation,
                "message" : message, "ip" : req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress}) + "," , function(err){
            if (err) console.error(err);
        });
    }
    catch(e){
        console.error(e)
    }
}