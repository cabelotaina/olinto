  class CFG {
    constructor() {
      this.start = null;
      this.prod = {};
      this.ne = Array();
    }

    set_start_symbol(start) {
      this.start = start;
    }

    add_prod(lhs, rhs) {
      var prods = rhs.replace(/ /g,"").split('|');
      this.prod[lhs] = [];
      for (var prod in prods) {
        this.prod[lhs].push(prods[prod]);
      } 
    }

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
              // console.log(count);
              // console.log(pieces.length);
              // console.log(analize);
              if(count === analize.length && ne.indexOf(p) === -1){
                ne.push(p);
              }
              console.log("Status cjt NE: "+ne);
            }
            // while(true) pare quando ne nao tiver novas alteracoes
          }
        }
        if (this.ne === ne){
          break;
        } else {
          this.ne = ne;
        }
      }
      console.log("NT com & producoes");
      console.log(this.ne);

      // Construa P' 
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
        //console.log("Quem sou eu: "+p)
        for (var fs in this.prod[p]){
          for (var n in ne){
            console.log(ne[n]);
            console.log(this.prod[p][fs]);
            var array2 = this.prod[p][fs].split("");
            console.log(array2);
            var array = this.prod[p][fs].split("");
            //console.log(array);

              var index = array.indexOf(ne[n]);
              //console.log(index);
              if (index !== -1 && array.length > 0){ // evita remover quando existe apenas 1 simbolo
                console.log(array);
                array.splice(index, 1);
                this.prod[p].push(array.join(""))
              }

          }
        }
      }

      this.prod = this.prod_new

      // Se S pertence a Ne colocar a producao S' -> S | &

      if (this.ne.indexOf(this.start) != -1){
        //greek_upper["\u03A9"] = null;//Ω
        var prod = {};
        prod["\u03A9"] = [this.start,"&"];
        this.start = "\u03A9";
        for (var i in this.prod){
          prod[i] = this.prod[i];
        }
        this.prod = prod;

      }
      console.log("eliminacao de epsilon transicoes")
      console.log(this.prod);

    }

    remove_simple_productions(){
    // 1) construir o cjt NA
     this.nx = {};
     //while(true){
     for (var i in [1,2,3]){
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
                //console.log("Quem esta sendo avaliado: "+p);
                //console.log("conjunto em avaliacao: "+nx[p]);
                //console.log("Item sendo avaliado:"+nx[p][i]);
                if (nx[nx[p][i]] !== undefined){
                  //console.log("cjt que deve ser copiado: "+nx[nx[p][i]]);
                  //console.log(nx[nx[p][i]] !== undefined);
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

       if (this.nx == nx){
         break;
       } else {
         this.nx = nx;
       }
      }
      console.log("eliminacao de producao simples")
      console.log(this.nx);

      // construir P'

      for (var p in this.prod){
        for (var fs in this.prod[p]){
          for (var n in this.nx){
            //console.log(p);
            //console.log(n)
            //console.log(this.prod[p])
            //console.log(this.prod[p].indexOf(n))
            var index = this.prod[p].indexOf(n);
            //console.log(index)
            if (index !== -1 && p !== "\u03A9"){
              this.prod[p].splice(index, 1);
            }
          }
        }
      }
      console.log("P'")
      console.log(this.prod)

      // Copiar producoes dos terminais em NA

      for (var p in this.prod){
        if (p !== "Ω"){
          //console.log(this.prod[p])
          //console.log(nx[p])
          //console.log(this.nx[p])
          for (var l in this.nx[p]){
            //console.log("Quem esta sendo avaliado: "+p)

            if (p !== this.nx[p][l]){
              for (var m in this.prod[this.nx[p][l]]){
                //console.log(this.prod[this.nx[p][l]][m])
                //console.log(this.prod[p].indexOf(this.prod[this.nx[p][l]][m]))
                //console.log(this.prod[this.nx[p][l]][m])
                if (this.prod[p].indexOf(this.prod[this.nx[p][l]][m]) === -1){
                  //console.log("pode pah!");
                  //console.log(this.prod[p])
                  this.prod[p].push(this.prod[this.nx[p][l]][m]);
                }
              }
            }
          }
        }   
      }

      console.log("P' completo")
      console.log(this.prod)

    }

    remove_infertiles_symbols(){
      console.log("De violeta!");

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

              //console.log(explode[k])
              //console.log(status)

            }
            if (status && n[x].indexOf(i) === -1){
              n[x].push(i);
            }
          }
        }
        // imprime todos os conjuntos a cda iteracao
        //console.log(n);
        if ( x !== 0){
          //console.log(n[x]);
          //console.log(n[x-1]);
          if (n[x].toString() === n[x-1].toString()){
            //console.log("eh igual!");
            break;
          }
        }
        x++;
      }
      this.nf = n[x-1];
      // imprime o conjuntos dos nao terminais ferteis
      //console.log(this.nf);
      //console.log(this.nf);
      //console.log(this.nf.indexOf("B"))
      for (var p in this.prod){
        //console.log(this.prod[p]);
        for ( var fs in this.prod[p]){
          //console.log(this.prod[p][fs]);
          var explode = this.prod[p][fs].split("");
          var status = false;
          for (var s in explode){
            //console.log(explode[s]);
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
          //console.log(status);
          if (status){
            //console.log("Quem vai sair: "+this.prod[p][fs]);
            //console.log(fs)
            //console.log(status)
            this.prod[p].splice(fs, 1);
          }
        }
      }
      console.log(this.prod)

    }

    remove_unreachable_symbols(){
      console.log("Mathita Pereira!");

      var x = 0;
      var v = {};
      while(true){
        if(x === 0){
          v[x] = [this.start];
        }
        else {
          v[x] = v[x-1];
        }
        //console.log(x)
        //console.log(v[x])
        for (var i in v[x]){

          //console.log(this.prod[v[x][i]]);
          for (var j in this.prod[v[x][i]]){
            //console.log(this.prod[v[x][i]][j])
            var explode = this.prod[v[x][i]][j].split("");
            for(var k in explode){
              //if (explode[k] == explode[k].toUpperCase() && v[x].indexOf(explode[k]) === -1){
              if (v[x].indexOf(explode[k]) === -1){
                //console.log(explode[k]);
                v[x].push(explode[k]);
              }
            }
          }
        }
        //console.log(v);
        this.vf = v[x];
        // imprime o conjunto dos terminais alcancaveis

        if ( x !== 0){
          //console.log(n[x]);
          //console.log(n[x-1]);
          if (v[x].toString() === v[x-1].toString()){
            //console.log(this.vf)
            //console.log("eh igual!");
            break;
          }
        }
        x++;
      }

      for (var p in this.prod){
        //console.log(p);
        if (this.vf.indexOf(p) === -1 ){
          delete this.prod[p];
        }
      }
      console.log(this.prod);
    }

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

      console.log("first");
      var x = 0;
      while(true){
        //console.log("Iteration: "+x);
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
          //console.log("ja eh igual pode parar: "+x);
          break;
        }
        else {
          //console.log("diferente "+x);
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

      //console.log("remover as formas sentenciais e deixar apenas vt U &")

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

      console.log(this.first_result);
      //console.log(criterio);
      //console.log(this.prod);
    }

    follow(){

      console.log("follow me os bons!");

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
          //console.log("Producao em Analise: "+this.prod[i][j]);
          var explode = this.prod[i][j].split("");
          for (var k = 0; k < explode.length;k++){
            if (explode[k] === explode[k].toUpperCase()
            // problemas com simbolos que nao sao nem maisculo nem minusculo
                && explode[k] !== "+"
                && explode[k] !== "*"
                && explode[k] !== "("
                && explode[k] !== ")"
                && k < explode.length -1){
              //console.log("indice: "+k);
              //console.log("NT en analise: "+explode[k+1]);
              for (var l = k+1; l <= explode.length -1; l++){
                // Encontramos um Vn
                if (explode[l] === explode[l].toUpperCase() 
                     && explode[l] !== "+"
                     && explode[l] !== "*"
                     && explode[l] !== "("
                     && explode[l] !== ")"
                     && explode[l] !== "&"){
                  // first do proximo que vamos pegar
                  //console.log("NT Atual:"+explode[k])
                  //console.log("NT em analise: "+explode[l]);
                  //console.log("First deste NT: "+this.first_result[explode[l]]);
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
          // tenho que fazer um while aqui.
          for (var k = explode.length -1; k >=0 ;k--){
            var flw = aux[i]; // pegando o follow do simbolo em analise
            //console.log(this.prod[i][j])
            //console.log("follow "+i+" no follow "+explode[k]);
            if(explode[k] === explode[k].toLowerCase()){
              break;
            }
            if (explode[k] === explode[k].toUpperCase() && explode[k] !== "&"){
              for (var l in flw){
                //console.log(flw[l]);
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
      console.log(aux);
      this.follow_result = aux;
    }

    first_nt(){
      if (!this.first_result){
        this.first();
      }
      console.log("first_nt");

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
              //console.log(explode[k]);
              aux[i].push(explode[k])
              if (this.first_result[explode[k]].indexOf("&") === -1){
                break;
              }
            }

          }
        }
      }
      console.log(aux);
      this.first_nt_result = aux;
    }
    
    is_factored(){
      console.log("is_factored");
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
            //console.log(explode[k]);
            if (explode[k] === explode[k].toLowerCase()){
              aux[i].push(explode[k]);
              break;
            }
            if (explode[k]  === explode[k].toUpperCase() && explode[k] !== "&"){
              //console.log(this.first_result[explode[k]]);
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
      
      console.log(aux);
      var status;
      for (var i in aux){
        for (var j in aux[i]){
          if (aux[i].indexOf(aux[i][j]) !== aux[i].lastIndexOf(aux[i][j])){
            var status = true;
          }
        }
      }
      if (status){
        this.is_factored_result = "GLC nao esta fatorada";
      }
      else {
         this.is_factored_result = "GLC esta fatorada!";
      }
      
      this.is_factored_status = status;
      return status;
    }
    
    
    left_recursion(){
      console.log("left_recursion");
      if (!this.first_nt_result){
        this.first_nt();
      }
      
      //console.log(this.first_nt_result);
      var status;
      for (var i in this.first_nt_result){
        //console.log(this.first_nt_result[i].toString());
        for (var j in this.first_nt_result[i]){
          //console.log(this.first_nt_result[i][j].toString());
          if (i.toString() === this.first_nt_result[i][j].toString()){
            status = true;
          }
        }
      }
      
      console.log(this.first_nt_result);
      
      if (status){
        this.left_rec = "GLC possui recursao a esquerda";
      }
      else{
        this.left_rec = "GLC nao possui recursao a esquerda!";
      }
      
      this.left_rec_status = status;
      return status;
      
    }
    
    ll1(){
      console.log("LL(1)");
      this.numbered_prod = "";
      
      if (!this.first_result){
        this.first();
      }

      if (!this.follow_result){
        this.follow();
      }
      //console.log(this.follow_result);
      //console.log(this.first_result);
      
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
      //console.log(header);
      this.alphabet = header;
      
      var ll1 = {};
      //this.alphabet = this.alphabet;
      //this.alphabet.push("$");
      
      for (var i in this.prod){
        ll1[i] = {};
        for (var j in this.alphabet){
          ll1[i][this.alphabet[j]]= "-";
        }
      }

      console.log("Tabela LL(1) Vazia");
      console.log(ll1);
      
      var numbered_prod = {};
      for (var i in  this.prod){
        numbered_prod[i] = [];
      }

      var counter = 1;
      for (var i in this.prod){
        for (var j in this.prod[i]){
          // console.log(counter+": "+this.prod[i][j]);
          // index = simbolo, posicao 0 = numero da producao e posicao 1 = producao
          numbered_prod[i].push([counter , this.prod[i][j]]);
          counter++;
        }
      }
      
      this.numbered_prod = numbered_prod;
      // console.log("producoes numeradas");
      // console.log(this.numbered_prod);
      
      for (var i in this.numbered_prod){
        // console.log("producao");
        // console.log(i);
        for (var l in this.numbered_prod[i]){
          var explode = this.numbered_prod[i][l][1].split("");
          // console.log("alpha");
          // console.log(explode);
          // console.log(this.numbered_prod[i][l][1]);
          var first_resumem = [];
          for (var j in explode){
            if(explode[j] === explode[j].toLowerCase() &&
                explode[j] !== "&"){
              //console.log([explode[j]]);
              first_resumem.push(explode[j]);
              break;
            } else if (explode[j] === explode[j].toUpperCase() &&
                explode[j] !== "&"){
              //console.log(explode[j]);
              //console.log(this.first_result[explode[j]]);
              var aux = this.first_result[explode[j]];
              for (var k in aux){
                first_resumem.push(aux[k]);
              }
              if (this.first_result[explode[j]].indexOf("&") === -1){
                break;
              }
            }
            else if (explode[j] === "&"){
              console.log("analise");
              console.log(explode[j]);
              console.log(this.numbered_prod[i][j]);
              first_resumem.push("&");
              console.log("first_resumem")
              console.log(first_resumem);
              //this.numbered_prod[i][j].push(["&"]);
              break;
            }
          }
          this.numbered_prod[i][l].push(first_resumem);
        }
        
      }
      
      // producoes numeradas e com seus respectivos first's
      //console.log("Producoes numeradas");
      //console.log(this.numbered_prod);
      //console.log(ll1);
      
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
            console.log("producoes do simbolo: ");
            console.log(i);
            if (i !== "#"){
              console.log(this.numbered_prod[i][l]);
            }
            if (i !== "#"){
              if (first_alpha.indexOf(this.alphabet[j]) !== -1){
                // fazer if para o caso de de ja existir um numero no local colocando uma virgula entre eles
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
              //console.log("NT: "+i);
              //console.log("First: "+this.first_result[i])
              //console.log("Follow: "+this.follow_result[i]);
              
              for (var j in this.alphabet){
                  if (this.follow_result[i].indexOf(this.alphabet[j]) !== -1){
                    // fazer if para o caso de ja existir um numero no local
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
    
    ff_intersection(){
      if (!this.first_result){
        this.first();
      }
      
      if (!this.follow_result){
        this.follow();
      }

      var status = false;
      for (var i in this.first_result){
        console.log(this.first_result[i]);
        if (this.first_result[i].indexOf("&") !== -1){
          for (var j in this.follow_result[i]){
            if (this.first_result[i].indexOf(this.follow_result[j]) !== -1){
              status = true;
              break;
            }
          }
        }
      }
      if(status){
        console.log("intersecao...");
      } else {
        console.log("Obaaaa!");
      }
      this.ff_intersection_result = status;
      return status;
    }

  }

  var cfg = new CFG();
  var db = openDatabase('olinto', '1.0', 'CFG db', 2 * 1024 * 1024);
  
  // criando a tabela base do sistema
  db.transaction(function (tx) {
    tx.executeSql('CREATE TABLE IF NOT EXISTS grammar (id unique, description, grammar)');
  });

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

  refresh = function(){
    if (cfg){
      delete cfg;
      cfg = new CFG();
    }

    for (var i in greek_lower){
      greek_lower[i] = null;
    }

    for (var i in greek_upper){
      greek_upper[i] = null;
    }
  }

  window.main = function(){
    refresh();

    var grammar = document.getElementById("gramatica").value;
    grammar = grammar.replace(/ /g, "");

    var aux2 = grammar.split("\n");
    for (var i in aux2){
      var two = aux2[i].split("->");
      //console.log(two);
      var productions = two[1].split("|");
      for (var j in productions){
        if (productions[j] === productions[j].toLowerCase() && productions[j] !== "&"){
          //console.log(productions[j]);
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
    console.log(grammar);
    aux = grammar.split("\n");
    var explode = aux[0].split("");
    cfg.set_start_symbol(explode[0]);
    
    for (var i in aux){
      var two = aux[i].split("->");
      cfg.add_prod(two[0], two[1]);
    }

    // armanenamento description e grammar
    // var errorCB;
    // var description = this.descricao.value;
    // db.transaction(function (tx) {
    //   tx.executeSql(
    //     'INSERT INTO locations (description, grammar) VALUES (?,?)',
    //     [description, grammar],
    //     function(tx, results) { alert('ID Retornado: ' + results.insertId); },
    //     errorCB
    //   );
    // });

    // this.gramaticass.innerHTML += '<option value="'+description+'">'+description+'</option>';
    
  }
  
  //cfg.remove_eps_productions();

  window.remove_eps_productions = function(){
    this.main();
    cfg.remove_eps_productions();

    console.log(cfg.prod);
    var grammar = "";
    for (var i in cfg.prod){
      grammar += i + " -> " + cfg.prod[i].join(" | ") + "<br>";
    }
    this.elivre.innerHTML = grammar;
  }

  //cfg.remove_simple_productions();
  //cfg.remove_infertiles_symbols();
  //cfg.remove_unreachable_symbols();

  window.analize = function(){
    console.log("Analization");
    this.main();

    console.log("greek_lower:");
    console.log(this.greek_lower);
    var sentence = this.sentence.value;
    for (var j in this.greek_lower){
      console.log(this.greek_lower[j]);
      if (this.greek_lower[j] !== null){
        console.log("possui substring");
        console.log(sentence.indexOf(this.greek_lower[j]) !== -1);
        if (sentence.indexOf(this.greek_lower[j]) !== -1){

          console.log(j);
          var choice = j;
          var re = new RegExp(this.greek_lower[j],"g");
          console.log(this.greek_lower[j]);
          sentence = sentence.replace(re, choice);
        }
      }
    }
    console.log("Sentenca em analize: "+sentence);
    var analize = sentence.split("");
    analize.push("$");
    // depois tirar isso e deixar o botao desabilitado ate que o usuario clique em criar ll1
    cfg.ll1();
    var stack = ["$"];
    stack.push(cfg.start);
    var productions = [];


    var counter = 0;
    while(true){
      console.log("iteracao: "+counter);

      //console.log(cfg.ll1_result);
      var top_of_stack = stack[stack.length-1];
      var simbolo = analize[0];

      if (top_of_stack === top_of_stack.toUpperCase() 
                && top_of_stack !== "+"
                && top_of_stack !== "*"
                && top_of_stack !== "("
                && top_of_stack !== ")" 
                && top_of_stack !== "&"
                ){
        console.log("problemas");
        console.log(top_of_stack);
        console.log(simbolo);
        console.log(cfg.ll1_result[top_of_stack][simbolo]);
        var prod_number = cfg.ll1_result[top_of_stack][simbolo];
        if (prod_number === "-"){
          console.log(cfg.ll1_result[top_of_stack]);
          var array = [];
          for (var i in cfg.ll1_result[top_of_stack]){
            if (cfg.ll1_result[top_of_stack][i] !== "-"){
              array.push(i);
            }
          }
          console.log("Esperava-se: "+array);
          this.result_sentence.innerHTML = "Esperava-se: "+array;
          break;
        }
        productions.push(prod_number);
        console.log(cfg.numbered_prod[top_of_stack]);
        console.log("producoes numeradas");
        var prods = cfg.numbered_prod[top_of_stack];
        console.log(prods);
        var prod;

        for (var i in prods){
          if (prods[i][0] == prod_number){
            prod = prods[i][1];
          }
        }
        if (prod === "&"){
          console.log("Epsilon!!!!");
          stack.pop();
        }
        else {
          console.log("producao escolhida: "+prod);
          var prod_explode = prod.split("").reverse();
          stack.pop();
          for (var i in prod_explode){
            stack.push(prod_explode[i]);
          }
        }
      } else if (top_of_stack === top_of_stack.toLowerCase()) {
        console.log("opa meu primeiro id");
        stack.pop();
        analize = analize.join("").substring(1).split("");
      }

      console.log("pilha")
      console.log(stack);
      if(stack.toString() === "$" && analize.toString() === "$"){
        console.log("Sentenca Aceita!")
        this.result_sentence.innerHTML = "Sentenca Aceita! Parse: "+productions;
        break;
      }
      counter++
    }
    console.log("Pilha: "+stack);
    console.log("Entrada: "+analize);
    console.log("parse: "+productions);
    this.parse = productions;

  }
  
  window.first = function(){
  
    cfg.first();
    var output = "<h3>First<h3>";
    for (var i in cfg.first_result){
      output = "<p>"+output+i+": "+cfg.first_result[i].join()+"</p>";
    }
    
    document.getElementById('first').innerHTML = output;
  
  }
  
  window.follow = function(){
  
    cfg.follow();
    var output = "<h3>Follow<h3>";
    for (var i in cfg.follow_result){
      output = "<p>"+output+i+": "+cfg.follow_result[i].join()+"</p>";
    }
    
    document.getElementById('follow').innerHTML = output;
  
  }

  //cfg.first_nt();
  window.first_nt = function(){
    cfg.first_nt();
    var output = "<h3>FirstNT<h3>";
    for (var i in cfg.first_nt_result){
      output = "<p>"+output+i+": "+cfg.first_nt_result[i].join()+"</p>";
    }
    
    document.getElementById('firstNT').innerHTML = output;
  }
  
  //cfg.is_factored();
  window.factored = function(){
    cfg.is_factored();
    document.getElementById('fatorada').innerHTML = "<h3>Fatorada<h3><p>"+cfg.is_factored_result+"</p>";
  }
  
  //cfg.left_recursion();
  window.left_rec = function(){
    cfg.left_recursion();
    document.getElementById('recursao_esquerda').innerHTML = "<h3>Rec. a Esquerda<h3><p>"+cfg.left_rec+"</p>";
  }
  //cfg.ll1();
  window.eh_ll1 = function(){
    this.ff_intersection_result;
    if (!cfg.is_factored()  && !cfg.left_recursion() && !cfg.ff_intersection()){
       document.getElementById('ll1').innerHTML = "<h3>LL(1)<h3><p>OK LL(1)</p>";
       // constroi a tabela de parsing pois ela eh LL(1)
       cfg.ll1();
       console.log(cfg.alphabet);
       console.log(cfg.ll1_result);
       //this.tabela.innerHTML = "Teste";

        var globalCounter = 0;
        var table = document.getElementById('table');

        var aux = "<tr><th>Estados</th>";
        for (var i in cfg.alphabet){
          aux += "<th>"+cfg.alphabet[i]+"</th>"; 
        }
        aux += "</tr>";
        table.innerHTML = aux;

        for (var i in cfg.ll1_result){
          if (i !== "#"){
            var tr = "";
            for (var j in cfg.ll1_result[i]) {
              tr += "<th>"+cfg.ll1_result[i][j]+"</th>";
            }
            table.innerHTML += "<tr><th>"+i+"</th>"+tr+"</tr>";
          } 
         
        }

     } else {
       document.getElementById('ll1').innerHTML = "<h3>LL(1)<h3><p>NOT OK LL(1)</p>";
     }
  }


  // old code

  //cfg.set_start_symbol("S");
  //cfg.set_start_symbol("E");
  //cfg.add_prod("S", "aS | AB");
  //cfg.add_prod("A", "aA|BS|BBB");
  //cfg.add_prod("B", "aB|&|A");
  //cfg.add_prod("C", "cB|&");

  // gramatica para testar eliminacao de simbolos inuteis obtida no livro
  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "aS | BC | BD");
  //cfg.add_prod("A", "cC | AB");
  //cfg.add_prod("B", "bB | &");
  //cfg.add_prod("C", "aA | BC");
  //cfg.add_prod("D", "dDd | c");

  // para testar eliminacao de simbolos inalcancaveis
  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "aSa | dDd ");
  //cfg.add_prod("A", "aB | Cc | a ");
  //cfg.add_prod("B", "dD | bB | b ");
  //cfg.add_prod("C", "Aa | dD | c");
  //cfg.add_prod("D", "bbB | d ");


  // exemplo gramatica para obter first

  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "Ab | ABc ");
  //cfg.add_prod("B", "bB | Ad | & ");
  //cfg.add_prod("A", "aA | & ");

  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "ABC | C");
  //cfg.add_prod("A", "aA | &");
  //cfg.add_prod("B", "bB | ACd" );
  //cfg.add_prod("C", "cC | &" );

  //Teste fatoracao 

  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "aS'");
  //cfg.add_prod("S'", "SS' | &");

  // teste recursao a esquerda
  //cfg.set_start_symbol("S");
  //cfg.add_prod("S", "Sa | b");

  // Teste LL(1)
  //TODO: permitir o uso de E' e permitir o uso de id (terminas de um ou mais caracteres)
  //cfg.set_start_symbol("E");
  //cfg.add_prod("E", "TX");
  //cfg.add_prod("X", "+TX | &");
  //cfg.add_prod("T", "FY");
  //cfg.add_prod("Y", "*FY | &");
  //cfg.add_prod("F", "(E) | i");

  //cfg.remove_eps_productions();
  //cfg.remove_simple_productions();

  //cfg.remove_infertiles_symbols();
  //cfg.remove_unreachable_symbols();
  //cfg.first();
  //cfg.follow();
  //cfg.first_nt();
  //cfg.is_factored();
  //cfg.left_recursion();
  //cfg.ll1();
