
function Entrar(){
    EnviarJsonPost('/user/login/post', {"key" : $("#txt_registro").val(), "password" : $("#txt_password").val()}, function (path, entrada, data, parametros, erro){
        if(data.error == undefined) {
            window.location.href = data.url;
        }
        else{
            alert('Mensagem: ' + data.error);
        }
    }, {});
}

function Forgot(){
    window.location.href = '/user/forgot';
}




