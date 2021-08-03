class UsuarioController {

    constructor(idFormularioCadastrar, idFormularioEditar, idTabela){
        this.idFormulario = document.getElementById(idFormularioCadastrar);
        this.idFormularioEditar = document.getElementById(idFormularioEditar);
        this.idTabela = document.getElementById(idTabela);
        this.enviarFormulario();
        this.edicaoUsuario();
        this.selecionarTodosSessionStorage();
    }

    getValores(formulario){
        let usuario = {};
        let validado = true;

        [...formulario.elements].forEach(function(campoElemento, index){

            if (['nome', 'email', 'senha'].indexOf(campoElemento.name) > -1 && !campoElemento.value) {
                campoElemento.parentElement.classList.add("has-error");
                validado = false;
            } 

            if (campoElemento.name == "genero"){
                if (campoElemento.checked) {
                    usuario[campoElemento.name] = campoElemento.value; 
                }
            } else if(campoElemento.name == "admin"){
                    usuario[campoElemento.name] = campoElemento.checked;
            } 
            else {
                usuario[campoElemento.name] = campoElemento.value; 
            } 
        }); 

        if (!validado){
            return false;
        }

        return new Usuario(
            usuario.nome, 
            usuario.genero, 
            usuario.nascimento, 
            usuario.nacionalidade, 
            usuario.email, 
            usuario.senha, 
            usuario.foto, 
            usuario.admin
        );
    }

    enviarFormulario(){
        this.idFormulario.addEventListener("submit", evento => {
            evento.preventDefault();

            let botao = this.idFormulario.querySelector("[type=submit]");
            botao.disabled = true;

            let valores = this.getValores(this.idFormulario);

            if (!valores) return false;

            this.getImagem(this.idFormulario).then(
                (conteudo) => {
                    valores.foto = conteudo;
                    valores.salvarcomId();
                    this.addLinha(valores);
                    this.idFormulario.reset();
                    botao.disabled = false;
                }, (erro)=> {
                    console.log(erro);
            });
        });
    }

    edicaoUsuario(){
        document.querySelector("#box-user-update .btn-cancelar").addEventListener("click", e=>{
            this.mostrarFormularioCadastrar();
        });

        this.idFormularioEditar.addEventListener("submit", e=> {

            e.preventDefault();
            let botao = this.idFormularioEditar.querySelector("[type=submit]");
            botao.disabled = true;
            let valores = this.getValores(this.idFormularioEditar);

            let indexLinha = this.idFormularioEditar.dataset.trIndex;

            let tr = this.idTabela.rows[indexLinha];
            
            let dadosAntigos = JSON.parse(tr.dataset.usuario);

            let resultado = Object.assign({}, dadosAntigos, valores);
            
            console.log(resultado);

            this.getImagem(this.idFormularioEditar).then(
                (conteudo) => {

                if (!resultado._foto) {
                    resultado._foto = dadosAntigos._foto;
                }else {
                    resultado._foto = conteudo;
                }

                let usuario = new Usuario();

                usuario.carregarDeJson(resultado);
                usuario.salvarcomId();
                console.log(usuario);
                console.log(resultado);
                this.getTr(usuario, tr);

                this.idFormularioEditar.reset();
                this.atualizarEstatistica();
                botao.disabled = false;

                },(erro)=> {
                    console.log(erro);
            });
            this.mostrarFormularioCadastrar();

        });
    }

    getImagem(formulario){

        return new Promise((executar, falha) => {
        let leitorArquivo = new FileReader();

        let elemento = [...formulario.elements].filter(item => {
            if (item.name === 'foto') {
                return item;
            }
        });

        let arquivo = elemento[0].files[0];

        leitorArquivo.onload = ()=> {
            executar(leitorArquivo.result);
        };

        leitorArquivo.onerror = (evento)=>{
            falha(evento);
        };

        if (arquivo) {
            leitorArquivo.readAsDataURL(arquivo);
        } else {
            [...formulario.elements].filter(item => {
                this.definirGeneroImagem(item, executar);
            });        
        }

        });      
    }

    getTr(resultado, tr = null){

        if (tr== null) tr = document.createElement('tr');

        tr.dataset.usuario = JSON.stringify(resultado);
         
        tr.innerHTML = ` 
            <td>
                <img src="${resultado.foto}" alt="User Image" class="img-circle img-sm">
            </td>
                <td>${resultado.nome}</td>
                <td>${resultado.email}</td>
                <td>${(resultado.admin) ? 'Sim' : 'Não'}</td>
                <td>${Utils.formatarData(resultado.dataRegistro)}</td>
            <td> 
                <button type="button" class="btn btn-primary btn-editar btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-excluir btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventosTr(tr);

        return tr;
    }

    addEventosTr(tr){

        tr.querySelector(".btn-excluir").addEventListener("click", e => {

            if (confirm("Deseja Realmente excluir esse usuário ?")) {

                let usuario = new Usuario();

                usuario.carregarDeJson(JSON.parse(tr.dataset.usuario));
                console.log(usuario);
                usuario.remover();
                tr.remove();
                this.atualizarEstatistica();
            }
        });

        tr.querySelector(".btn-editar").addEventListener("click", e => {

            let json = JSON.parse(tr.dataset.usuario);

            this.idFormularioEditar.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {

                let campo = this.idFormularioEditar.querySelector("[name=" + name.replace("_", "") + "]");

                if (campo){
                    switch (campo.type) {
                        case 'file' :
                            continue;
                        case 'radio':
                            campo = this.idFormularioEditar.querySelector("[name=" + name.replace("_", "") + 
                            "][value="+ json[name] + "]");
                            campo.checked = true;
                        break;

                        case 'checkbox':
                            campo.checked = json[name];
                        break;

                        default:
                            campo.value = json[name];
                    }
                }
            }

            this.idFormularioEditar.querySelector(".fotoPadrao").src = json._foto;
            this.mostrarFormularioEditar();
        }); 
    }

    definirGeneroImagem(item, acao){
        if (item.name == "genero"){
            if (item.checked) {
                if (item.value == "M") {
                    acao('dist/img/avatar5.png');
                }
            }else {
                acao('dist/img/avatar3.png');
            }                
        }
    }

    selecionarTodosSessionStorage(){

        let users = Usuario.getUsuariosStorage();

        users.forEach(dados => {

            let novoUsuario = new Usuario();
            
            novoUsuario.carregarDeJson(dados);
            this.addLinha(novoUsuario);
        });

    } 

    addLinha(dadosUsuario){

        let tr = this.getTr(dadosUsuario);

        this.idTabela.appendChild(tr);

        this.atualizarEstatistica();
    }

    atualizarEstatistica() {

        let numeroUsuarios = 0;
        let numeroAdministradores = 0;

        [...this.idTabela.children].forEach(tr => {
            
            numeroUsuarios++;
            let usuario = JSON.parse(tr.dataset.usuario);

            if (usuario._admin) numeroAdministradores++;
        });
         
        document.querySelector("#numero-usuarios").innerHTML = numeroUsuarios;
        document.querySelector("#numero-administradores").innerHTML = numeroAdministradores;
    }

    mostrarFormularioCadastrar(){
        document.querySelector("#box-user-create").style.display = "block";
        document.querySelector("#box-user-update").style.display = "none";
    }

    mostrarFormularioEditar(){
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";
    }
}