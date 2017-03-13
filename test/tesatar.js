/**
 * Created by wellington on 07/03/17.
 */

var request = require('request');


var url = 'http://apps5.genexus.com/Idfd73801a5a460a49314888e9a30c55e3/rest/service.uni0002?Id=0&Cod=0';

var options = {
        headers: {'content-type' : 'application/json',
        Authorization : '8c27519d-cab1-4c2b-afc7-e2b0c6e45dae!48AXhMFf0IQG5BJXnpBqEtFNuKyRNSVCI1lPpaUA7lhgre2cIGCjuQmcSLpVgbYsWDpotKGztGt4Hx'},
    method : "GET",
    url:     url

};
request(options, function (error, response, body) {
    console.log('body:', body);

});

//