

function EnviarGet(path, callback, parametros) {
    $.ajax({
        type: "GET",
        url: path,
        //contentType: "application/json; charset=utf-8",
        //dataType: "json",
        async: true,
        success: function (data) {
            callback(path, data, parametros);
        }
    });
}

function EnviarJsonPost(path, envelope, param, callback) {
    envelope['sessionId'] = guid();
    envelope['tokenId'] = '0c33cc7a-69bc-4c79-adfe-56ec1738657d';    //str(uuid.uuid4());
    envelope['trasactionId'] = guid();
    envelope['system'] = { 'nome': "internet", 'sistema': "internet" }
    $.ajax({
        url: path,
        //timeout: 10000,
        crossDomain: true,
        async: true,
        data : JSON.stringify(envelope),
        dataType: 'text',
        type: 'POST',
        contentType: 'application/json',
        headers: {
        },
        success: function (data, textStatus, xhr) {
            callback(JSON.parse(data), param);
        },
        error: function (xhr, textStatus, errorThrown) {
            callback(errorThrown, param);
        }
    });
}


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}
