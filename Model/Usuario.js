class Usuario {

    constructor(nome, genero, nascimento, nacionalidade, email, senha, foto, administrador){
        this._id;
        this._nome = nome;
        this._genero = genero;
        this._nascimento = nascimento;
        this._nacionalidade = nacionalidade;
        this._email = email;
        this._senha = senha;
        this._foto = foto;
        this._admin = administrador;
        this._dataRegistro = new Date();
    }

    get id(){
        return this._id;
    }

    get dataRegistro() {
        return this._dataRegistro; 
    }

    get nome(){
        return this._nome;
    }

    get genero(){
        return this._genero;
    }

    get nascimento(){
        return this._dataNascimento;
    }

    get nacionalidade(){
        return this._nacionalidade;
    }

    get email(){
        return this._email;
    }

    get senha(){
        return this._senha;
    }

    get foto(){
        return this._foto;
    }

    set foto(novaImagem){
        this._foto = novaImagem;
    }

    get admin(){
        return this._admin;
    }

    carregarDeJson(json) {
        for (let name in json) {
            switch (name){
                case '_dataRegistro':
                    this[name] = new Date(json[name]);
                break;
                default:
                    this[name] = json[name];
            }
        }
    }

    getNovoId(){

        let idUsuario = parseInt(localStorage.getItem("users._id"));

        if (!idUsuario > 0) idUsuario = 0;

        idUsuario++;

        localStorage.setItem("users._id", idUsuario);

        return idUsuario;
    }

    salvarcomId(){
        let users = Usuario.getUsuariosStorage();


        console.log(users);
        if (this.id > 0){
            
            users.map(u => {

                if (u._id == this.id) {
                    Object.assign(u, this)
                }

                console.log(u);
                return u;
            });

        } else {
            this._id = this.getNovoId();
            users.push(this);
        }

        localStorage.setItem("users",JSON.stringify(users));
    }

    static getUsuariosStorage(){
        let users = [];

        if (localStorage.getItem("users")) {
            users = JSON.parse(localStorage.getItem("users"));
        }

        return users;
    }

    remover() {
        let usuarios = Usuario.getUsuariosStorage();

        usuarios.forEach((dados, index) => {
            if (this._id == dados._id) {
                usuarios.splice(index, 1);
            }
        });

        localStorage.setItem("users",JSON.stringify(usuarios));
    }
}
