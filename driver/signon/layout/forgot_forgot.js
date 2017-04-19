
function Recuperar(){
    EnviarJsonPost('/user/forgot/post', {"key" : $("#txt_registro").val()}, function (path, entrada, data, parametros, erro){
        if(erro != undefined){
            alert(erro);
        }
        else {
            if(data.return){
                alert('E-mail enviado com sucesso.');
                window.location.href = '/user/login'
            }
            else{
                alert('Não foi possível enviar o e-mail. Entre em contato com suporte.');
            }
        }
    }, {});
}




