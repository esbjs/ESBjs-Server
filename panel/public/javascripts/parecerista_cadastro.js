$('#seletor').change(function () {
    var selectedText = $(this).find("option:selected").text();
    $("input[name=formacao]:hidden").val(selectedText);
});

function EnviarParecerista(){
    LimparDiv("div_mensagem");
    Save(function(path, entrada, data, err){
        if(err) {MensagemBotao("div_mensagem", "Por favor:</br>" + err);}
        else {
            alert('deu certo caralho');
        }
    });
}


/*function EnviarParecerista(){
    try {

        var areas = PegarSelectItemData('multiarea');
        LimparDiv("div_mensagem");
        var texto = "";
        var nome = $("#name").val();
        var email = $("#email").val();
        var curso = $("#formacao_nome").val();
        var password = $("#password").val();
        var max_titulacao = $("#formacao").val();
        var inst = $("#inst").val();

        if (nome.trim().length == 0) texto += "Informe o nome completo;</br>";
        if (email.trim().length == 0) texto += "Informe um e-mail válido;</br>";
        if (curso.trim().length == 0) texto += "Informe o curso de sua maior titulação;</br>";
        if (password.trim().length == 0) texto += "Informe uma senha;</br>";
        if (inst.trim().length == 0) texto += "Informe o nome da instituição que atua;</br>";
        if (texto.length > 0) MensagemBotao("div_mensagem", "Por favor:</br>" + texto)
        else{
            EnviarJsonPost('/users/parecerista/cadastro', {"name" : nome, "email": email, "formacao_nome": curso, "formacao" : max_titulacao, "password" : password,
                'areas' : JSON.stringify(areas), 'instituicao' : inst},
                function(path, entrada, data){
                    if(data.ok == 1){
                        window.location.href = '/users/parecerista';
                    }
                    else{
                        alert(data.mensagem);
                    }
            });


        }
    }catch(e){
        alert(e.stack);
    }
}*/




