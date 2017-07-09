  //old code

  cfg.set_start_symbol("S");
  cfg.set_start_symbol("E");
  cfg.add_prod("S", "aS | AB");
  cfg.add_prod("A", "aA|BS|BBB");
  cfg.add_prod("B", "aB|&|A");
  cfg.add_prod("C", "cB|&");

  //gramatica para testar eliminacao de simbolos inuteis obtida no livro
  cfg.set_start_symbol("S");
  cfg.add_prod("S", "aS | BC | BD");
  cfg.add_prod("A", "cC | AB");
  cfg.add_prod("B", "bB | &");
  cfg.add_prod("C", "aA | BC");
  cfg.add_prod("D", "dDd | c");

  //para testar eliminacao de simbolos inalcancaveis
  cfg.set_start_symbol("S");
  cfg.add_prod("S", "aSa | dDd ");
  cfg.add_prod("A", "aB | Cc | a ");
  cfg.add_prod("B", "dD | bB | b ");
  cfg.add_prod("C", "Aa | dD | c");
  cfg.add_prod("D", "bbB | d ");


  //exemplo gramatica para obter first

  cfg.set_start_symbol("S");
  cfg.add_prod("S", "Ab | ABc ");
  cfg.add_prod("B", "bB | Ad | & ");
  cfg.add_prod("A", "aA | & ");

  cfg.set_start_symbol("S");
  cfg.add_prod("S", "ABC | C");
  cfg.add_prod("A", "aA | &");
  cfg.add_prod("B", "bB | ACd" );
  cfg.add_prod("C", "cC | &" );

  //Teste fatoracao 

  cfg.set_start_symbol("S");
  cfg.add_prod("S", "aS'");
  cfg.add_prod("S'", "SS' | &");

  //teste recursao a esquerda
  cfg.set_start_symbol("S");
  cfg.add_prod("S", "Sa | b");

  //Teste LL(1)

  cfg.set_start_symbol("E");
  cfg.add_prod("E", "TX");
  cfg.add_prod("X", "+TX | &");
  cfg.add_prod("T", "FY");
  cfg.add_prod("Y", "*FY | &");
  cfg.add_prod("F", "(E) | i");

  cfg.remove_eps_productions();
  cfg.remove_simple_productions();

  cfg.remove_infertiles_symbols();
  cfg.remove_unreachable_symbols();
  cfg.first();
  cfg.follow();
  cfg.first_nt();
  cfg.is_factored();
  cfg.left_recursion();
  cfg.ll1();
