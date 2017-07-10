  class CFG {

    /*
      Construtor da Gramatica livre de contexto
      define o simbolo inicial como null
      cria um objeto vazio para as producoes
      e
      cria um array para o conjunto de terminar com epsilon (Ne);
      
    */
    constructor() {
      this.start = null;
      this.prod = {};
      this.ne = [];
    }

    /*
      Permite definir o simbolo inicial da gramatica
      parametro: string simbolo incial = start
    */
    set_start_symbol(start) {
      this.start = start;
    }

    /*
      Permite adicionar producoes a gramatica
      parametros: lhs = NT a direita, rhs = producoes
    */
    add_prod(lhs, rhs) {
      var prods = rhs.replace(/ /g,"").split('|');
      this.prod[lhs] = [];
      for (var prod in prods) {
        this.prod[lhs].push(prods[prod]);
      } 
    }

    /*
      Permite remover as epsilon producoes da gramatica
      Basicamente seguinte o algoritmo apresentado na apostila

    */
    remove_eps_productions() {

      // 1) Construa o conjunto Ne
      var ne = Array();
      while(true){
        for (var p in this.prod){
          for(var s in this.prod[p]){
            var analize = this.prod[p][s];
            var pieces = analize.split("");
            if (analize === "&" && ne.indexOf(p) === -1){
              ne.push(p);
            } 
            else {
              var count = 0;
              for (var m in pieces){
                if(ne.indexOf(pieces[m]) !== -1 && pieces[m] === pieces[m].toUpperCase()){
                  count++
                }
              }
              if(count === analize.length && ne.indexOf(p) === -1){
                ne.push(p);
              }
            }
            // while(true) construa Ne pare quando Ne for estavel (sem alteracoes)
          }
        }
        if (this.ne === ne){
          break;
        } else {
          this.ne = ne;
        }
      }

      // Construa P' (novo conjunto de producoes)
      // a) {inclua em P' todas as producoes de P com excessao daquelas da forma A -> &}

      this.prod_new = this.prod;

      for (var p in this.prod_new){
        var index = this.prod_new[p].indexOf("&");
        if(index != -1){
          this.prod_new[p].splice(index, 1);
        }
      }

      // b) para cada producao da forma aBX | B pertence a Ne e a, X pertence a V* 
      // inclua en P' a producao A -> aX

      for (var p in this.prod_new){
        for (var fs in this.prod[p]){
          for (var n in ne){
            var array2 = this.prod[p][fs].split("");
            var array = this.prod[p][fs].split("");

              var index = array.indexOf(ne[n]);
              if (index !== -1 && array.length > 0){ // evita remover quando existe apenas 1 simbolo
                array.splice(index, 1);
                this.prod[p].push(array.join(""))
              }

          }
        }
      }

      this.prod = this.prod_new

      // Se S pertence a Ne colocar a producao S' -> S | &

      if (this.ne.indexOf(this.start) != -1){
        //usa o simbolo Ω -> ["\u03A9"] como novo simbolo inicial para evitar usar S' (mais complexo para analisar)
        var prod = {};
        prod["\u03A9"] = [this.start,"&"];
        this.start = "\u03A9";
        for (var i in this.prod){
          prod[i] = this.prod[i];
        }
        this.prod = prod;
      }
    }

    /*
      Remove as producoes simples (ciclos) da grammatica
      Basicamente implementa o algoritmo apresentado na apostila;\
    */
    remove_simple_productions(){
    // 1) construir o cjt NA
     this.nx = {};
     while(true){
       var nx = {};
       for (var p in this.prod){
         if(!nx[p] && p != "\u03A9")
           nx[p] = [p];
         for (var s in this.prod[p]){
           if (this.prod[p][s].length === 1 && p != "\u03A9"
               && this.prod[p][s] == this.prod[p][s].toUpperCase()){
               nx[p].push(this.prod[p][s]);
           }
         }

         if (p != "\u03A9"){
           for (var i in nx[p]){
             if (nx[p][i] !== p && nx[p][i] !== undefined){
                if (nx[nx[p][i]] !== undefined){
                  for (var k in nx[nx[p][i]]){
                    if (nx[p].indexOf(nx[nx[p][i]][k]) === -1){
                      nx[p].push(nx[nx[p][i]][k]);
                    }
                  } 
                }
             }
           }
         }
       }
       if (JSON.stringify(this.nx) == JSON.stringify(nx)){
         break;
       } 
       else {
         this.nx = nx;
       }
      }

      // construir P'

      for (var p in this.prod){
        for (var fs in this.prod[p]){
          for (var n in this.nx){
            var index = this.prod[p].indexOf(n);
            if (index !== -1 && p !== "\u03A9"){
              this.prod[p].splice(index, 1);
            }
          }
        }
      }

      // Copiar producoes dos terminais em NA

      for (var p in this.prod){
        if (p !== "Ω"){
          for (var l in this.nx[p]){
            if (p !== this.nx[p][l]){
              for (var m in this.prod[this.nx[p][l]]){
                if (this.prod[p].indexOf(this.prod[this.nx[p][l]][m]) === -1){
                  this.prod[p].push(this.prod[this.nx[p][l]][m]);
                }
              }
            }
          }
        }   
      }
    }
    /*
      Remove os simbolos imferteis
      Aplica o algoritmo visto na apostila;
    */
    remove_infertiles_symbols(){
      var x = 0;
      var n = {};

      while(true){
        n[x] = Array();
        for (var i in this.prod){
          for (var j in this.prod[i]){

            if ((this.prod[i][j] === this.prod[i][j].toLowerCase() || this.prod[i][j] === "&")  
                && n[x].indexOf(i) === -1){
              n[x].push(i);
            }
            var explode = this.prod[i][j].split("");
            var status = false;
            for(var k in explode){
              if (x !== 0){
                if (explode[k] === explode[k].toLowerCase()){
                  status = true;
                }
                else if (n[x-1].indexOf(explode[k]) !== -1){
                  status = true;
                }
                else {
                  status = false;
                  break;
                }
              }
            }
            if (status && n[x].indexOf(i) === -1){
              n[x].push(i);
            }
          }
        }
        // imprime todos os conjuntos a cada iteracao
        if ( x !== 0){
          if (n[x].toString() === n[x-1].toString()){
            break;
          }
        }
        x++;
      }
      this.nf = n[x-1];
      for (var p in this.prod){
        for ( var fs in this.prod[p]){
          var explode = this.prod[p][fs].split("");
          var status = false;
          for (var s in explode){
            if (explode[s] === explode[s].toLowerCase()){
              status = false;
            }
            else if (explode[s] === explode[s].toUpperCase() && this.nf.indexOf(explode[s]) !== -1){
              status = false;
            }
            else {
              status = true;
              break;
            }
          }
          if (status){
            this.prod[p].splice(fs, 1);
          }
        }
      }
    }

    /*
      Remove os simbolos inalcancaveis da Gramatica
      Aplicado como visto na Apostila
    */
    remove_unreachable_symbols(){
      var x = 0;
      var v = {};
      while(true){
        if(x === 0){
          v[x] = [this.start];
        }
        else {
          v[x] = v[x-1];
        }
        for (var i in v[x]){
          for (var j in this.prod[v[x][i]]){
            var explode = this.prod[v[x][i]][j].split("");
            for(var k in explode){
              if (v[x].indexOf(explode[k]) === -1){
                v[x].push(explode[k]);
              }
            }
          }
        }
        this.vf = v[x];
        if ( x !== 0){
          if (v[x].toString() === v[x-1].toString()){
            break;
          }
        }
        x++;
      }

      for (var p in this.prod){
        if (this.vf.indexOf(p) === -1 ){
          delete this.prod[p];
        }
      }
    }
    /*
      Metodo que obtem o first da gramatica
      basicamente itera sobre a gramatica multiplas vezes obtendo os firsts
      terminais e depois o firts dependentes de outros nao terminais
    */
    first(){

      var prod_new = {};
      for (var i in this.prod){
        prod_new[i] = [];
        for (var j in this.prod[i]){
          prod_new[i].push(this.prod[i][j]);
        }
      }

      var criterio = {};
      for (var i in this.prod){
        criterio[i] = [];
        for (var j in this.prod[i]){
          criterio[i].push(this.prod[i][j]);
        }
      }

      var x = 0;
      while(true){
        // 1) Se X pertence a Vt entao first(x) = {X}
        for (var i in prod_new){
          for(var j in prod_new[i]){
            var explode = prod_new[i][j].split("");
            for (var e in explode){
              if(explode[e] === explode[e].toLowerCase()){
                prod_new[i].splice(prod_new[i].indexOf(prod_new[i][j]), 1);
                prod_new[i].push(explode[e]);
                break;
              }
              else if (explode[e] === explode[e].toUpperCase()){
                // first(X)
                var firstX = prod_new[explode[e]];
                for (var k in firstX){
                  if (firstX[k].length  === 1 && 
                  prod_new[i].indexOf(firstX[k]) === -1 &&
                  firstX[k] !== "&"){
                    prod_new[i].push(firstX[k]);
                  }
                }

                if (firstX.indexOf("&") !== -1){
                  explode.splice(explode[e], 1);
                  if (prod_new[i].indexOf(explode.join("")) === -1)
                    prod_new[i].push(explode.join(""));
                }

                break;
              }
            }
          }
        }

        for (var i in criterio){
          criterio[i].sort();
        }
        for (var i in prod_new){
          prod_new[i].sort();
        }

        if (JSON.stringify(criterio) == JSON.stringify(prod_new) ){
          break;
        }
        else {
          for (var i in prod_new){
            criterio[i] = [];
            for (var j in prod_new[i]){
              criterio[i].push(prod_new[i][j]);
            }
          }
        }

        x++;
      }

      var aux = {};
      for (var i in prod_new){
        aux[i] = [];
        for (var j in prod_new[i]){
          aux[i].push(prod_new[i][j]);
        }
      }

      // remove todas as formas sentenciais
      this.first_result = {};
      for (var l in aux){
        this.first_result[l] = [];
        for (var m in aux[l]){
          if (aux[l][m].length === 1 && aux[l][m] === aux[l][m].toLowerCase()){
            this.first_result[l].push(aux[l][m]);
          }
        }
      }
    }

    /*
      Obtem os follow da Gramatica
      De maneira similar aos outros algoritmos implementados
      passa uma certa quantidade de vezes por cada producao 
      com o foco de completar o conjunto dos follows
    */
    follow(){
      if (!this.first_result){
        this.first();
      }

      var aux = {};
      for (var i in this.prod){
        aux[i] = [];
      }

      aux[this.start] = ["$"];

      for (var i in this.prod){
        for (var j in this.prod[i]){
          var explode = this.prod[i][j].split("");
          for (var k = 0; k < explode.length;k++){
            if (explode[k] === explode[k].toUpperCase()
            // problemas com simbolos que nao sao nem maisculo nem minusculo
                && explode[k] !== "+"
                && explode[k] !== "*"
                && explode[k] !== "("
                && explode[k] !== ")"
                && explode[l] !== "-"
                && explode[l] !== "/"
                && k < explode.length -1){
              for (var l = k+1; l <= explode.length -1; l++){
                // Encontramos um Vn
                if (explode[l] === explode[l].toUpperCase() 
                     && explode[l] !== "+"
                     && explode[l] !== "*"
                     && explode[l] !== "("
                     && explode[l] !== ")"
                     && explode[l] !== "-"
                     && explode[l] !== "/"
                     && explode[l] !== "&"){
                  // first do proximo
                  var frt = this.first_result[explode[l]];
                  var epsilon = false;
                  for (var m in frt){
                    if (aux[explode[k]].indexOf(frt[m]) === -1 && frt[m] !== "&"){
                      aux[explode[k]].push(frt[m]);
                    }
                    else if(frt[m] === "&"){
                      epsilon = true;
                    }
                  }
                  if (epsilon){
                    break;
                  }
                }
                // Encontramos um Vt
                else if ((explode[l] === explode[l].toLowerCase()  
                         || explode[l] === "+"
                         || explode[l] === "*"
                         || explode[l] === "("
                         || explode[l] === ")")
                         || explode[l] === "-"
                         || explode[l] === "/"
                         && explode[l] !== "&"){
                    if (aux[explode[k]].indexOf(explode[l]) === -1){
                      aux[explode[k]].push(explode[l]);
                      break;
                    }
                }
              }
            }
          }
        }
      }

      for (var i in this.prod){
        for ( var j in this.prod[i]){
          var explode = this.prod[i][j].split("");
          for (var k = explode.length -1; k >=0 ;k--){
            var flw = aux[i]; // pegando o follow do simbolo em analise
            if(explode[k] === explode[k].toLowerCase()){
              break;
            }
            if (explode[k] === explode[k].toUpperCase() && explode[k] !== "&"){
              for (var l in flw){
                if (k < explode.length -1){
                  if (aux[explode[k]].indexOf(flw[l]) === -1 && flw[l] === flw[l].toUpperCase()
                        && this.first_result[explode[k+1]].indexOf("&") !== -1){
                    aux[explode[k]].push(flw[l]);
                  }
                  else if (this.first_result[explode[k+1]].indexOf("&") === -1){
                    break;
                  }
                }
                else if (aux[explode[k]].indexOf(flw[l]) === -1 && flw[l] === flw[l].toUpperCase()){
                  aux[explode[k]].push(flw[l]);
                }
              }
            }
          }
        }
      }
      this.follow_result = aux;
    }

    /*
      Este metodo basicamente utiliza o first para criar um novo conjunto
      dos NT's que sao first dos lados direitos de alguma gramatica
    */
    first_nt(){
      if (!this.first_result){
        this.first();
      }
      var aux = {};
      for (var i in this.prod){
        aux[i] = [];
      }
      
      for (var i in this.prod){
        for (var j in this.prod[i]){
          var explode = this.prod[i][j].split("");
          for (var k in explode){
            if (explode[k] === explode[k].toLowerCase()){
              break;
            }
            if (explode[k] === explode[k].toUpperCase() && explode[k] !== "&"){
              if (aux[i].indexOf(explode[k]) === -1){
                aux[i].push(explode[k]);
              }
              
              if (this.first_result[explode[k]].indexOf("&") === -1){
                break;
              }
            }

          }
        }
      }
      this.first_nt_result = aux;
    }

    /*
      Metodo que testa se uma gramatica livre de contexto esta fatorada
      basicamente ele realiza a intersecao entre os firts(alpha) do lado
      esquerdo da gramatica.
    */
    is_factored(){
      var aux = {};
      for (var i in this.prod){
        aux[i] = [];
      }
      
      if (!this.first_result){
        this.first();
      }
      
      for (var i in this.prod){
        for (var j in this.prod[i]){
          var explode = this.prod[i][j].split("");
          for (var k in explode){
            if (explode[k] === explode[k].toLowerCase()){
              aux[i].push(explode[k]);
              break;
            }
            if (explode[k]  === explode[k].toUpperCase() && explode[k] !== "&"){
              var epsilon = false;
              for (var l in this.first_result[explode[k]]){
                if (this.first_result[explode[k]][l] === "&"){
                  epsilon = true;
                  continue;
                } else {
                  aux[i].push(this.first_result[explode[k]][l]);
                }
              }
              if (!epsilon){
                break;
              }
            }
          }
        }
      }
      
      var status;
      for (var i in aux){
        for (var j in aux[i]){
          if (aux[i].indexOf(aux[i][j]) !== aux[i].lastIndexOf(aux[i][j])){
            var status = true;
          }
        }
      }
      if (status){
        this.is_factored_result = "NÃO!";
      }
      else {
         this.is_factored_result = "SIM";
      }
      
      this.is_factored_status = status;
      return status;
    }
    
    /*
      Metodo que checa se uma gramatica possui recursao a esquerda
      direta ou indireta utilizando o first da gramatica
    */
    left_recursion(){
      if (!this.first_nt_result){
        this.first_nt();
      }
      
      var status;
      for (var i in this.first_nt_result){
        for (var j in this.first_nt_result[i]){
          if (i.toString() === this.first_nt_result[i][j].toString()){
            status = true;
          }
        }
      }
            
      if (status){
        this.left_rec = "SIM";
      }
      else{
        this.left_rec = "NÃO!";
      }
      
      this.left_rec_status = status;
      return status;
      
    }

    /*
      Este metodo analisa se a gramatica nao possui recursao a esquerda, ciclos, 
      e para as producoes que levam a epsilo em zero ou mais passos
      a intersecao do first e follow e igual a vazio
    */
    ll1(){
      this.numbered_prod = "";
      
      if (!this.first_result){
        this.first();
      }

      if (!this.follow_result){
        this.follow();
      }
      
      var header = [];
      for (var i in this.first_result){
        for (var j in this.first_result[i]){
          if (header.indexOf(this.first_result[i][j]) === -1 &&     
               this.first_result[i][j] !== "&"){
            header.push(this.first_result[i][j]);
          }
        }
      }
      
      for (var i in this.follow_result){
        for (var j in this.follow_result[i]){
          if (header.indexOf(this.follow_result[i][j]) === -1 &&     
               this.follow_result[i][j] !== "&"){
            header.push(this.follow_result[i][j]);
          }
        }
      }
      this.alphabet = header;
      
      var ll1 = {};
      
      for (var i in this.prod){
        ll1[i] = {};
        for (var j in this.alphabet){
          ll1[i][this.alphabet[j]]= "-";
        }
      }
      
      var numbered_prod = {};
      for (var i in  this.prod){
        numbered_prod[i] = [];
      }

      var counter = 1;
      for (var i in this.prod){
        for (var j in this.prod[i]){
          // index = simbolo, posicao 0 = numero da producao 
          // e posicao 1 = producao
          numbered_prod[i].push([counter , this.prod[i][j]]);
          counter++;
        }
      }
      
      this.numbered_prod = numbered_prod;
      
      for (var i in this.numbered_prod){
        for (var l in this.numbered_prod[i]){
          var explode = this.numbered_prod[i][l][1].split("");
          var first_resumem = [];
          for (var j in explode){
            if(explode[j] === explode[j].toLowerCase() &&
                explode[j] !== "&"){
              first_resumem.push(explode[j]);
              break;
            } else if (explode[j] === explode[j].toUpperCase() &&
                explode[j] !== "&"){
              var aux = this.first_result[explode[j]];
              for (var k in aux){
                first_resumem.push(aux[k]);
              }
              if (this.first_result[explode[j]].indexOf("&") === -1){
                break;
              }
            }
            else if (explode[j] === "&"){
              first_resumem.push("&");
              break;
            }
          }
          this.numbered_prod[i][l].push(first_resumem);
        }
        
      }
      
      for (var i in ll1){

        var first_alpha;
        var number_prod;
        for (var l in this.numbered_prod[i]){
          var status = false;
          if (i !== "#"){
            first_alpha = this.numbered_prod[i][l][2];
            number_prod = this.numbered_prod[i][l][0];
          }

          for (var j in this.alphabet){
            if (i !== "#"){
            }
            if (i !== "#"){
              if (first_alpha.indexOf(this.alphabet[j]) !== -1){
                ll1[i][this.alphabet[j]] = number_prod;
              }
              else{
                if (ll1[i][this.alphabet[j]] === "-" || ll1[i][this.alphabet[j]] === "" ){
                  ll1[i][this.alphabet[j]] = "-";
                }
              }
            }
          }

        }

        if (i !== "#"){
            if (this.first_result[i].indexOf("&")  !== -1){
              
              for (var j in this.alphabet){
                  if (this.follow_result[i].indexOf(this.alphabet[j]) !== -1){
                    ll1[i][this.alphabet[j]] = number_prod;
                  }
                  else {
                    if (ll1[i][this.alphabet[j]] === "-" || ll1[i][this.alphabet[j]] === "" ){
                      ll1[i][this.alphabet[j]] = "-";
                    }
                  }
              }
            }
            else {
              for (var j in this.alphabet){
                if (ll1[i][this.alphabet[j]] === "-" || ll1[i][this.alphabet[j]] === "" ){
                  ll1[i][this.alphabet[j]] = "-";
                }
              }
            }
        }
      }
      

      this.ll1_result = ll1;
      
    }
    /*
      Metodo que faz a intersecao do first e do follow
    */
    ff_intersection(){
      if (!this.first_result){
        this.first();
      }
      
      if (!this.follow_result){
        this.follow();
      }

      var status = false;
      for (var i in this.first_result){
        if (this.first_result[i].indexOf("&") !== -1){
          for (var j in this.follow_result[i]){
            if (this.first_result[i].indexOf(this.follow_result[j]) !== -1){
              status = true;
              break;
            }
          }
        }
      }
      this.ff_intersection_result = status;
      return status;
    }

  }

  // criacao da gramatica regular
  var cfg = new CFG();
  // criacao do banco de dados
  var db = openDatabase('olinto', '1.0', 'CFG db', 2 * 1024 * 1024);
  // alerta se o banco de dados nao foi criado
  if(!db){
    alert("Problemas ao criar o banco de dados");
  }
  // criacao da tabela base do sistema
  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS grammar (id INTEGER PRIMARY KEY ASC, description VARCHAR(255) NOT NULL, grammar VARCHAR(255) NOT NULL)');
  });

  // Query inicial do sistema
  db.transaction(function (tx) {
    tx.executeSql('SELECT * FROM grammar', [], function (tx, results) {
      var len = results.rows.length, i;
      for (i = 0; i < len; i++) {
        this.gramaticas.innerHTML += '<option value="'+results.rows[i].id+'">'+results.rows[i].description+'</option>';
      }
    });
  });

  // conjunto de letras gregas substitutivas para nao terminais
  // e terminar com tamanho maior um, bem como fucao que obtem 
  // o proximo simbolo
  var greek_upper = {};
  greek_upper["\u0393"] = null;//Γ
  greek_upper["\u0394"] = null;//Δ
  greek_upper["\u0398"] = null;//Θ
  greek_upper["\u0399"] = null;//Ι
  greek_upper["\u039B"] = null;//Λ
  greek_upper["\u039E"] = null;//Ξ
  greek_upper["\u039F"] = null;//Ο
  greek_upper["\u03A0"] = null;//Π
  greek_upper["\u03A1"] = null;//Ρ
  greek_upper["\u03A3"] = null;//Σ
  greek_upper["\u03D2"] = null;//ϒ
  greek_upper["\u03A6"] = null;//Φ
  greek_upper["\u03A7"] = null;//Χ
  greek_upper["\u03A8"] = null;//Ψ
  greek_upper["\u03B1"] = null;//α
  greek_upper["\u03B2"] = null;//β
  greek_upper["\u03B3"] = null;//γ

  var next_greek_upper = function(){
    for (var i in greek_upper){
      if (!greek_upper[i]){
        return i;
      }
    }
  }

  var greek_lower = {};
  greek_lower["\u03B9"] = null; //ι
  greek_lower["\u03BA"] = null; //κ
  greek_lower["\u03BB"] = null; //λ
  greek_lower["\u03BC"] = null; //μ
  greek_lower["\u03BD"] = null; //ν
  greek_lower["\u03BE"] = null; //ξ
  greek_lower["\u03BF"] = null; //ο
  greek_lower["\u03C0"] = null; //π
  greek_lower["\u03D6"] = null; //ϖ
  greek_lower["\u03C1"] = null; //ρ
  greek_lower["\u03C2"] = null; //ς
  greek_lower["\u03C3"] = null; //σ
  greek_lower["\u03C4"] = null; //τ
  greek_lower["\u03C5"] = null; //υ
  greek_lower["\u03C6"] = null; //φ
  greek_lower["\u03C7"] = null; //χ
  greek_lower["\u03C8"] = null; //ψ
  greek_lower["\u03C9"] = null; //ω
  
  var next_greek_lower = function(){
    for (var i in greek_lower){
      if (!greek_lower[i]){
        return i;
      }
    }
  }

  // conjunto de metodos ligados a visao do sistema

  // Metodo que analisa uma palavra
  window.analize_grammar = function(){

    var e = this.gramaticas;
    var id = e.options[e.selectedIndex];
    if (id){

      id = id.value;
      db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM grammar where id='+id, [], function (tx, results) {
          var len = results.rows.length, i;
          for (i = 0; i < len; i++) {
            this.gramatica.innerHTML = results.rows[i].grammar;
            this.descricao.value = results.rows[i].description;
          }
        });
      });

    }
    
  }
  
  // metodo que remove uma gramatica da visao e do banco de dados
  window.remove_grammar = function(){

      var id = document.getElementById("gramaticas");
      var value = id.value;
      id.remove(id.selectedIndex);
    if (id){
      //Query out the data
      db.transaction(function (tx) {
        tx.executeSql('delete from grammar where id='+value);
      });


    }
  }

  // metodo que reinicia o objeto que contem a gramatica
  refresh = function(){
    if (cfg){
      delete cfg;
      cfg = {};
      cfg = new CFG();
    }

    for (var i in greek_lower){
      greek_lower[i] = null;
    }

    for (var i in greek_upper){
      greek_upper[i] = null;
    }
  }

  //metodo principal ultizado ao adicionar uma nova gramatica
  window.main = function(existe = false){
    refresh();
    var grammar = document.getElementById("gramatica").value;
    grammar = grammar.replace(/ /g, "");
    //armanezenamento de uma gramatica no banco de dados
    if (!existe){
      var errorCB;
      var description = this.descricao.value;
      db.transaction(function (tx) {
        tx.executeSql(
          'INSERT INTO grammar (description, grammar) VALUES (?,?)',
          [description, grammar],
          function(tx, results) { this.gramaticas.innerHTML += '<option value="'+results.insertId+'">'+description+'</option>'; },
          errorCB
        );
      });
    }

    var aux2 = grammar.split("\n");

    for (var i in aux2){
      var two = aux2[i].split("->");
      var productions = two[1].split("|");
      for (var j in productions){
        if (productions[j] === productions[j].toLowerCase() && productions[j] !== "&"){
          var choice = next_greek_lower();
          var re = new RegExp(productions[j],"g");
          grammar = grammar.replace(re, choice);
          greek_lower[choice] = productions[j];
        }
      }
    }

    var aux = grammar.split("\n");
    for (var i in aux){
      var two = aux[i].split("->");
      if (two[0].length > 1){
        var choice = next_greek_upper();
        var re = new RegExp(two[0],"g");
        grammar = grammar.replace(re, choice);
        greek_upper[choice] = two[0];
      }
    }
    aux = grammar.split("\n");
    var explode = aux[0].split("");
    cfg.set_start_symbol(explode[0]);
    
    for (var i in aux){
      var two = aux[i].split("->");
      cfg.add_prod(two[0], two[1]);
    }
  }
  
  // metodo de controle do processo de remocao das epsilon transicoes
  window.remove_eps_productions = function(){
    this.main(true);
    cfg.remove_eps_productions();
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.elivre.innerHTML = "<h3>Gramatica Sem Epsilon Producoes</h3>"+replace_greek(grammar);
  }

  // metodo de controle da remocao de ciclos
  window.remove_simple_productions = function(){
    this.main(true);
    cfg.remove_simple_productions();
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.sem_ciclos.innerHTML = "<h3>Gramatica Sem Ciclos</h3>"+replace_greek(grammar);
  }

  // metodo de controle da remocao de producoes inferteis
  window.remove_infertiles_symbols = function(){
    this.main(true);
    cfg.remove_infertiles_symbols();
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.ferteis.innerHTML = "<h3>Gramatica Ferteis</h3>"+replace_greek(grammar);
  }

  // metodo de controle da remocao de simbolos inalcancaveis
  window.remove_unreachable_symbols = function(){
    this.main(true);
    cfg.remove_unreachable_symbols();
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.alcancaveis.innerHTML = "<h3>Gramatica Alcancaveis</h3>"+replace_greek(grammar);
  }

  // metodo de controle da traformacao em gramatica propria
  window.all_actions = function(){
    this.main(true);
    cfg.remove_eps_productions();
    cfg.remove_simple_productions();
    cfg.remove_infertiles_symbols();
    cfg.remove_unreachable_symbols();
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.propria.innerHTML = "<h3>Gramatica Propria</h3>"+replace_greek(grammar);
  }

  // metodo de controle da analize de sentenca
  window.analize = function(){
    this.main(true);

    var sentence = this.sentence.value;
    for (var j in this.greek_lower){
      if (this.greek_lower[j] !== null){
        if (sentence.indexOf(this.greek_lower[j]) !== -1){
          var choice = j;
          var re = new RegExp(this.greek_lower[j],"g");
          sentence = sentence.replace(re, choice);
        }
      }
    }
    var analize = sentence.split("");
    analize.push("$");
    cfg.ll1();
    var stack = ["$"];
    stack.push(cfg.start);
    var productions = [];

    var counter = 0;
    while(true){
      var top_of_stack = stack[stack.length-1];
      var simbolo = analize[0];

      if (top_of_stack === top_of_stack.toUpperCase() 
                && top_of_stack !== "+"
                && top_of_stack !== "*"
                && top_of_stack !== "("
                && top_of_stack !== ")" 
                && top_of_stack !== "&"
                ){
        var prod_number = cfg.ll1_result[top_of_stack][simbolo];
        if (prod_number === "-"){
          var array = [];
          for (var i in cfg.ll1_result[top_of_stack]){
            if (cfg.ll1_result[top_of_stack][i] !== "-"){
              array.push(i);
            }
          }
          this.result_sentence.innerHTML = "Esperava-se: "+replace_greek(array.toString());
          this.ll1_no.style.display = "";
          this.ll1_yes.style.display = "none";
          break;
        }
        productions.push(prod_number);
        var prods = cfg.numbered_prod[top_of_stack];
        var prod;

        for (var i in prods){
          if (prods[i][0] == prod_number){
            prod = prods[i][1];
          }
        }
        if (prod === "&"){
          stack.pop();
        }
        else {
          var prod_explode = prod.split("").reverse();
          stack.pop();
          for (var i in prod_explode){
            stack.push(prod_explode[i]);
          }
        }
      } else if (top_of_stack === top_of_stack.toLowerCase()) {
        stack.pop();
        analize = analize.join("").substring(1).split("");
      }

      if(stack.toString() === "$" && analize.toString() === "$"){
        this.result_sentence.innerHTML = "Parse: "+productions;
        this.ll1_yes.style.display = "";
        this.ll1_no.style.display = "none";
        break;
      }
      counter++
    }
    this.parse = productions;
  }
  
  // metodo de controle do first
  window.first = function(){
    cfg.first();
    var output = "<h3>First</h3>";
    for (var i in cfg.first_result){
      output += "<p>"+i+": "+cfg.first_result[i].join()+"</p>";
    }
    this.first_html.innerHTML = replace_greek(output);
  }
  
  // metodo de controle do follow
  window.follow = function(){
  
    cfg.follow();
    var output = "<h3>Follow</h3>";
    for (var i in cfg.follow_result){
      output += "<p>"+i+": "+cfg.follow_result[i].join()+"</p>";
    }
    
    this.follow_html.innerHTML = replace_greek(output);
  
  }

  // metodo de controle do first NT
  window.first_nt = function(){
    cfg.first_nt();
    var output = "<h3>FirstNT</h3>";
    for (var i in cfg.first_nt_result){
      output += "<p>"+i+": "+cfg.first_nt_result[i].join()+"</p>";
    }
    
    this.firstNT.innerHTML = replace_greek(output);
  }

  // metodo auxiliar que converte de 
  // letras gregas para letras do alfabeto original
  replace_greek = function(output){
    for (var i in greek_upper){
      if (this.greek_upper[i] !== null){
        var choice = this.greek_upper[i];
        var re = new RegExp(i,"g");
        output = output.replace(re, choice);
      }
    }
    for (var i in greek_lower){
      if (this.greek_lower[i] !== null){
        var choice = this.greek_lower[i];
        var re = new RegExp(i,"g");
        output = output.replace(re, choice);
      }
    }
    var omega = "\u03A9";
    var re = new RegExp(omega,"g");
    output = output.replace(re,"S'");

    return output;
  }
  
  // metodo de controle do teste de fatoracao
  window.factored = function(){
    cfg.is_factored();
    this.response.innerHTML = "<h3>G esta fatorada? "+cfg.is_factored_result+"</h3>";
  }
  
  // meto de contro do teste de recursao a esquerda
  window.left_rec = function(){
    cfg.left_recursion();
    this.response.innerHTML = "<h3>G possui Rec. Esq? "+cfg.left_rec+"</h3>";
  }
  // metodo de controle do teste para gramaticas LL(1)
  window.eh_ll1 = function(){
    this.ff_intersection_result;
    if (!cfg.is_factored()  && !cfg.left_recursion() && !cfg.ff_intersection()){
       this.response.innerHTML = "<h3>LL(1)? SIM</h3>";
       // constroi a tabela de parsing pois ela eh LL(1)
       cfg.ll1();
        var globalCounter = 0;
        var table = document.getElementById('table');
        this.title_table.innerHTML = "Tabela Parsing LL(1)";
        var aux = "<tr><th>Estados</th>";
        for (var i in cfg.alphabet){
          aux += "<th>"+cfg.alphabet[i]+"</th>"; 
        }
        aux += "</tr>";

        for (var i in cfg.ll1_result){
          if (i !== "#"){
            var tr = "";
            for (var j in cfg.ll1_result[i]) {
              tr += "<th>"+cfg.ll1_result[i][j]+"</th>";
            }
            aux += "<tr><th>"+i+"</th>"+tr+"</tr>";
          } 

          table.innerHTML = replace_greek(aux);
         
        }

     } else {
       this.response.innerHTML = "<h3>LL(1)? NÃO!</h3>";
     }
  }