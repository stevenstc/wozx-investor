pragma solidity ^0.5.14;

import "./SafeMath.sol";

contract EWozx {
  using SafeMath for uint;
  
  struct Firma {
    address wallet;
    bool valida;
    uint orden;
  }

  struct Pendiente{
    bool pending;
    address wallet;
    uint tron;
    uint orden;
  }
  
  struct Historia {
      uint tiempo;
      uint valor;
      string moneda;
      string operacion;
  }

  struct Transar {
    address wallet;
    uint monto;
    bool hecho;
    bool pagado;
    bool enviado;
    
  }

  struct Nivel {
    uint n;

  }
  
  struct Investor {
    bool registered;
    address sponsor;
    bool exist;
    string ethereum;
    bool eth;
    uint rango;
    bool recompensa;
    Nivel[10] niveles;
    uint balanceTrx;
    uint withdrawnTrx;
    uint investedWozx;
    uint wozxPendig;
    bool p;
    uint withdrawnWozx;
    Historia[] historial;
    
  }
  
  uint public MIN_DEPOSIT = 50 trx;
  uint public COMISION_RETIRO = 10 trx;
  uint public COMISION_OPERACION = 50 trx;
  uint public COMISION_REDEPOSIT = 7;
  uint public COMISION_WOZX = 2000000;
  uint public rateTRON = 28677;
  
  address payable public owner;
  address payable public app;
  
  address public NoValido;
  bool public Do = true;
  
  uint public totalInvestors;
  uint public totalInvested;
  uint public totalRefRewards;

  uint[10] public porcientos = [50, 5, 5, 5, 5, 5, 5, 5, 5, 10];

  mapping (address => Investor) public investors;
  mapping (address => bool) public isBlackListed;
  Firma[] firmas;
  Pendiente[] pendientes;
  Transar[] transacciones;

  
  constructor(address payable _owner, address payable _app) public payable {
    owner = _owner;
    app = _app;

    investors[owner].registered = true;
    investors[owner].exist = true;
    investors[owner].sponsor = owner;
    
    totalInvestors++;
  }

  function setstate() public view  returns(uint Investors,uint Invested,uint RefRewards){
      return (totalInvestors, totalInvested, totalRefRewards);
  }


  function InContract() public view returns (uint){
    return address(this).balance;
  }


  function setOwner(address payable _owner) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_owner != owner);

    owner = _owner;

    investors[owner].registered = true;
    investors[owner].exist = true;
    investors[owner].sponsor = owner;

    totalInvestors++;

    return owner;
  }
  

  function setApp(address payable _app) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_app != app);

    app = _app;

    return app;
  }

  function miRegistro(address _user , address _sponsor) public {

    require (msg.sender == _user, "Not is your account");
    
    require (!isBlackListed[_user]);
    require (_sponsor != NoValido);
    require (!investors[_user].registered);
    require (investors[_sponsor].registered);
    require (investors[_sponsor].exist);
    require (_user != _sponsor);
    

    investors[_user].registered = true;
    investors[_user].exist = true;
    investors[_user].sponsor = _sponsor;
    
    totalInvestors++;    
    
    address[10] memory referi = column(_user);

    for (uint i = 0; i < 10; i++) {
      if (investors[referi[i]].exist && referi[i] != owner ) {
        investors[referi[i]].niveles[i].n++;
      }else{
        investors[referi[i]].niveles[i].n++;
        break;
      }
    }
  }
  


  function column (address yo) public view returns(address[10] memory res) {

    res[0] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[1] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[2] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[3] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[4] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[5] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[6] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[7] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[8] = investors[yo].sponsor;
    yo = investors[yo].sponsor;
    res[9] = investors[yo].sponsor;

    return res;
  }
  
  
  function rewardReferers(address yo, uint amount) internal {

    address[10] memory referi = column(yo);
    uint[10] memory a;
    uint[10] memory b;

    for (uint i = 0; i < 10; i++) {
      if (investors[referi[i]].exist && referi[i] != owner ) {

        if(investors[referi[i]].recompensa){
          b[i] = porcientos[i];
          a[i] = amount.mul(b[i]).div(1000);
          investors[referi[i]].balanceTrx += a[i];
          investors[referi[i]].historial.push(Historia(now, a[i], "TRX", "Reward Referer"));
          totalRefRewards += a[i];
          investors[referi[i]].rango += a[i].mul(rateTRON);
        }
     
      }else{
        b[i] = porcientos[i];
        a[i] = amount.mul(b[i]).div(1000);
        investors[referi[i]].balanceTrx += a[i];
        investors[referi[i]].historial.push(Historia(now, a[i], "TRX", "Reward Referer"));
        totalRefRewards += a[i];
        investors[referi[i]].rango += a[i].mul(rateTRON);
        break;
      }
    }
    
    
  }
  
  function firmarTx(address wallet, uint orden) public{
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app);
    firmas.push(Firma(wallet,true,orden));
  }

  
  function verFirma(uint _numero) public view returns(address wallet, bool valida, uint wozx) {
    require (msg.sender == app || msg.sender == owner);
    require (_numero < firmas.length);
    
    return (firmas[_numero].wallet, firmas[_numero].valida, firmas[_numero].orden);
      
  }

  function cancelFirma(uint _numero) public returns(bool res){
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);

    if (firmas[_numero].valida){
      firmas[_numero].valida = false;
      return true;
    }
  }

  function buscarfirma(address _w) public view returns(uint) {
    for (uint i = 0; i < firmas.length; i++) {
        
      if (firmas[i].wallet == _w && firmas[i].valida ) {
        return (i);
      }
      
    }
  }

  function depositpendiente(address _w) public view returns(uint cantidad, bool res) {
    uint i = buscarfirma(_w);
    if (i == 0){
      return (0, false);
    }else{
      return (firmas[i].orden, firmas[i].valida);
    }
   
  }

  function cancelDepo(address _w) public returns(address wallet, uint wozx, uint){
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);

    uint orden = buscarfirma(_w);
    require (orden > 0);
    if (firmas[orden].valida){
      firmas[orden].valida = false;
      return (firmas[orden].wallet, firmas[orden].orden, orden);
    }
  }
  
  function deposit(address _user, uint _valor) external payable returns(bool res){
    require (msg.sender == _user, "Not is your account");
    require (msg.value == _valor, "Incorrect value");

    require (!isBlackListed[_user]);
    require(_valor >= MIN_DEPOSIT);
    require (investors[_user].registered);
    require (Do);

    uint orden = buscarfirma(_user);

    require (firmas[orden].valida);

    if(!investors[_user].recompensa){
      investors[_user].recompensa = true;
    }
    
    transacciones.push(Transar(_user, _valor, false, false, false));
    
    investors[_user].investedWozx += firmas[orden].orden;
    totalInvested += firmas[orden].orden;
    firmas[orden].valida = false;

    investors[_user].historial.push(Historia(now, firmas[orden].orden, "WOZX", "Direct Bought"));  
    
    return true;
  }

  function redeposit(address _user, uint _cantidad) external payable returns(bool res){
    require (msg.sender == _user, "Not is your account");

    require (!isBlackListed[_user]);
    require(_cantidad >= MIN_DEPOSIT);
    require (investors[_user].registered);
    require (Do);
    require (_cantidad <= investors[_user].balanceTrx);
    
    uint orden = buscarfirma(_user);

    require (firmas[orden].valida);

    investors[_user].balanceTrx -= _cantidad;

    _cantidad = _cantidad-_cantidad.mul(COMISION_REDEPOSIT).div(100);
    investors[_user].withdrawnTrx += _cantidad;

    transacciones.push(Transar(_user, _cantidad, false, false, false));

    app.transfer(_cantidad.mul(COMISION_REDEPOSIT).div(100));
    
    investors[_user].investedWozx += firmas[orden].orden;
    totalInvested += firmas[orden].orden;
    firmas[orden].valida = false;

    investors[_user].historial.push(Historia(now, _cantidad, "TRX", "Sell to invest"));
    investors[_user].historial.push(Historia(now, firmas[orden].orden, "WOZX", "Bought with TRX"));  
    
    return true;
  }

  function transfers()public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);

    uint i = verTransfersHecho();

    require (investors[transacciones[i].wallet].exist);

      if (!transacciones[i].hecho){
        
        rewardReferers(transacciones[i].wallet, transacciones[i].monto);

        transacciones[i].hecho = true;

      }
      
    

  }

  function transfers01()public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);
    
    uint i = verTransfersPagado();

    require (investors[transacciones[i].wallet].exist);

      if (!transacciones[i].pagado){
        
        owner.transfer(transacciones[i].monto.mul(7).div(100));
        app.transfer(transacciones[i].monto.mul(7).div(100));
        app.transfer(transacciones[i].monto.mul(76).div(100));

        transacciones[i].pagado = true;

      }

  }

  function transfers02(bool senvio) public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);
    
    uint i = verTransfersEnviado();

    require (investors[transacciones[i].wallet].exist);
  

      if (!transacciones[i].enviado){
        
        transacciones[i].enviado = senvio;

      }


  }
  
  function verTransfersHecho()public view returns(uint length){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].hecho){
        return (i);
      }
    }
    
  }
  
  function verTransfersPagado()public view returns(uint length){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].pagado){
        return (i);
      }
    }
    
  }

  function verTransfersEnviado()public view returns(uint length){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].enviado){
        return (i);
      }
    }
    
  }

  function verTransfersEnviadoC()public view returns(uint cantidad){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].enviado){
        return (transacciones[i].monto);
      }
    }
    
  }

  function verTransfersPendientes()public view returns(uint length, address wallet, uint valor, bool hecho, bool pagado){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].hecho){
        return (i, transacciones[i].wallet, transacciones[i].monto, transacciones[i].hecho, transacciones[i].pagado);
      }
    }
    
  }

  function verTransfer(uint _numero) public view returns(uint length, address wallet, uint valor, bool hecho){
    require (!isBlackListed[msg.sender]);
    require (_numero < transacciones.length);

    return (transacciones.length-1, transacciones[_numero].wallet, transacciones[_numero].monto, transacciones[_numero].hecho);
  }

  function transfersEjecutar(uint _numero)public returns(bool res) {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);

      if (!transacciones[_numero].hecho){

        if (investors[transacciones[_numero].wallet].exist){
          rewardReferers(transacciones[_numero].wallet, transacciones[_numero].monto);
        }

        transacciones[_numero].hecho = true;

        owner.transfer(transacciones[_numero].monto.mul(7).div(100));
        app.transfer(transacciones[_numero].monto.mul(7).div(100));
        app.transfer(transacciones[_numero].monto.mul(77).div(100));

        return transacciones[_numero].hecho;

      }
   
  }
  

  function wozxP() public view returns(bool res, uint cantidad){
    return ( investors[msg.sender].p, investors[msg.sender].wozxPendig);
  }

  function contadorHistorial () public view returns(bool res, uint cantidad){
    if (investors[msg.sender].historial.length > 0) {
      return (true, investors[msg.sender].historial.length);
    }

  }
  
  function miHistorial(uint _numero) public view returns(uint tiempo, uint valor, string memory moneda, string memory operacion) {
    
    return (investors[msg.sender].historial[_numero].tiempo, investors[msg.sender].historial[_numero].valor, investors[msg.sender].historial[_numero].moneda, investors[msg.sender].historial[_numero].operacion);
  }

  function ordenPost(address _w , uint _t, uint _o) public{
    require (!isBlackListed[msg.sender]);
    require (_t >= MIN_DEPOSIT );
    require (_o > 0);
    require (msg.sender == app);

    pendientes.push(Pendiente(true, _w, _t, _o));
    investors[_w].historial.push(Historia(now, _t, "TRX", "Deposit | POST"));

    investors[_w].wozxPendig = _o;
    investors[_w].p = true;
  }

  function fillPost(uint _numero, uint _orden) public returns(uint, address){
    require (msg.sender == app || msg.sender == owner);
    require (_numero < pendientes.length);

    if (pendientes[_numero].pending){

      pendientes[_numero].orden = _orden;
      pendientes[_numero].pending = false;

      address _w = pendientes[_numero].wallet;

      investors[_w].investedWozx += _orden;

      investors[_w].historial.push(Historia(now, _orden, "WOZX", "Bought | POST"));
      totalInvested += _orden;

      investors[_w].wozxPendig = 0;
      investors[_w].p = false;

      return (_orden, _w);
    }

  }

  function verOrdenPost() public view returns(uint, uint, uint, bool){
    require (msg.sender == app || msg.sender == owner);
    uint ordenNumero = 0;
    uint totaltron = 0;
    uint totalorden = 0;
    bool pendi = false;

    for (uint i = 0; i < pendientes.length; i++) {
        
      if (pendientes[i].pending) {
        ordenNumero = i;
        totaltron = pendientes[i].tron;
        totalorden = pendientes[i].orden;
        pendi = pendientes[i].pending;
        break;
      }
      
    }

    return (ordenNumero, totaltron, totalorden, pendi);
    
  }

  function verOrdenPost2(uint _numero) public view returns(bool, uint, uint){
    require (msg.sender == app || msg.sender == owner);
    require (_numero < pendientes.length);

    bool pendiente = pendientes[_numero].pending;
    uint tron = pendientes[_numero].tron;
    uint orden = pendientes[_numero].orden;

    return (pendiente, tron, orden);
    
  }

  function myFunction (uint _nivel) public view returns(uint cantidad){
    
    require (_nivel < investors[msg.sender].niveles.length && _nivel >= 0 );
    
    return investors[msg.sender].niveles[_nivel].n;
      
  }

  function myRango () public view returns(uint cantidad){
    
    return investors[msg.sender].rango;
      
  }

  function ejecutarTodasOrdenes() public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);

    for (uint i = 0; i < pendientes.length; i++) {
        
      if (pendientes[i].pending) {
          
        investors[pendientes[i].wallet].investedWozx += pendientes[i].orden;
        totalInvested += pendientes[i].orden;
        pendientes[i].pending = false;

        investors[pendientes[i].wallet].wozxPendig = 0;
        investors[pendientes[i].wallet].p = false;

        investors[pendientes[i].wallet].historial.push(Historia(now, pendientes[i].orden, "WOZX", "Bought | POST"));
        
      }
      
    }

  }


  function esponsor() public view returns(bool res, address sponsor ) {

    return (investors[msg.sender].exist, investors[msg.sender].sponsor);

  }
  

  function depositPost(address _user, uint _valor) external payable {

    require (msg.sender == _user, "Not is your account");
    require (msg.value == _valor, "Incorrect value");
    

    require (!isBlackListed[_user]);
    require(_valor >= MIN_DEPOSIT);
    require (investors[_user].registered);
    require (Do);

    if(!investors[_user].recompensa){
      investors[_user].recompensa = true;
    }

    investors[_user].historial.push(Historia(now, _valor.mul(76).div(100), "TRX", "Received | POST"));
    
    transacciones.push(Transar(_user, _valor, false, false, false));
    
  }

  function redepositPost(address _user, uint _cantidad) external payable {
    require (msg.sender == _user, "Not is your account");

    require (!isBlackListed[_user]);
    require(_cantidad >= MIN_DEPOSIT);
    require (investors[_user].registered);
    require (Do);
    require (_cantidad <= investors[_user].balanceTrx);
 
    investors[_user].balanceTrx -= _cantidad;
    investors[_user].withdrawnTrx += _cantidad-COMISION_REDEPOSIT;

    app.transfer(_cantidad.mul(COMISION_REDEPOSIT).div(100));

    _cantidad = _cantidad-_cantidad.mul(COMISION_REDEPOSIT).div(100);

    transacciones.push(Transar(_user, _cantidad, false, false, false));

    investors[_user].historial.push(Historia(now, _cantidad, "TRX", "Sell to invest | POST"));
    
    
  }
  
  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];
    amount = investor.balanceTrx;
    
  }

  function withdraw(address payable _user, uint _cantidad) public  {

    require (msg.sender == _user, "Not is your account");

    require (!isBlackListed[_user]);
    require (Do);
    
    uint amount = withdrawable(_user);

    require (_cantidad <= amount);
    require ( _cantidad > COMISION_RETIRO );
    require (address(this).balance > _cantidad );
      
    _user.transfer(_cantidad-COMISION_RETIRO);

    investors[_user].balanceTrx -= _cantidad;
    investors[_user].withdrawnTrx += _cantidad-COMISION_RETIRO;
    
    investors[_user].historial.push(Historia(now, _cantidad-COMISION_RETIRO, "TRX", "Withdrawl"));

  }
    
  function stopWithdrawl() public returns (bool set_Do) {
    require (msg.sender == owner);
      if(Do){
        Do = false;
      }else{
        Do = true;
      }

    return Do;
  }

  function withdrawAll() public returns (uint) {
    require(msg.sender == owner);
    require (address(this).balance > 0);
    
    uint valor = address(this).balance;
    if (owner.send(valor)){ 
      return address(this).balance;
    }
  }

  function MYwithdrawable() public view returns (uint amount) {
    Investor storage investor = investors[msg.sender];
    amount = investor.balanceTrx;
  }

  function withdrawableWozx() public view returns (uint amount) {
    Investor storage investor = investors[msg.sender];
    amount = investor.investedWozx;
  }

  function wozxToTron (address _wallet, uint _tron, uint _wozx) external  returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (!isBlackListed[_wallet]);
    require (msg.sender == app);

    uint iwozx = investors[_wallet].investedWozx;
    require ( _wozx <= iwozx );
    
    investors[_wallet].investedWozx -= _wozx;
    investors[_wallet].withdrawnWozx += _wozx;
    
    app.transfer(COMISION_OPERACION);

    investors[_wallet].balanceTrx += _tron - COMISION_OPERACION;

    investors[_wallet].historial.push(Historia(now, _wozx, "WOZX", "Sell"));
    investors[_wallet].historial.push(Historia(now, _tron - COMISION_OPERACION, "TRX", "Buy"));

    return true;
    
  }
  
  function enviarWozx (address _user, address _wallet, uint _cantidad) public returns(bool res) {
    require (msg.sender == _user, "Not is your account");

    require (!isBlackListed[_user]);
    require (investors[_user].investedWozx >= _cantidad);
    require (_wallet != _user);
    
    
    investors[_user].investedWozx -= _cantidad;
    investors[_user].withdrawnWozx += _cantidad-COMISION_WOZX;
    investors[_wallet].investedWozx += _cantidad-COMISION_WOZX;

    investors[_user].historial.push(Historia(now, _cantidad-COMISION_WOZX, "WOZX", "Send | To USER"));
    investors[_wallet].historial.push(Historia(now, _cantidad-COMISION_WOZX, "WOZX", "Deposit | From USER"));

    return true;
  }

  function retirarWozx(address _user, uint _cantidad) public returns(bool res) {
    require (msg.sender == _user, "Not is your account");

    require (!isBlackListed[_user]);
    require (investors[_user].investedWozx > 0);
    require (_cantidad <= investors[_user].investedWozx);
    
    investors[_user].investedWozx -= _cantidad;
    investors[_user].withdrawnWozx += _cantidad;

    investors[_user].historial.push(Historia(now, _cantidad, "WOZX", "Withdrawl (ETH)"));

    return true;
    
  }
  

  function miETH (address  _direccion) public view returns(string memory ethdireccion, bool habilitado) {

    Investor storage inv = investors[_direccion];
    ethdireccion = inv.ethereum;
    habilitado = inv.eth;
    return (ethdireccion, habilitado);
  }
  
  function setETH (string memory _direccion) public returns (bool, string memory){

    require (!isBlackListed[msg.sender]);

    Investor storage inv = investors[msg.sender];
    inv.ethereum = _direccion;
    inv.eth = false;

    return (true, _direccion);
  }

  function habilitarETH (address _direccion) public returns (bool result, address tron){

    require (msg.sender == owner);
    require (!isBlackListed[msg.sender]);

    investors[_direccion].eth = true;

    return (investors[_direccion].eth, _direccion);
  }
  
  function nuevoMinDeposit(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    MIN_DEPOSIT = num*1 trx;
  }

  function nuevoComOperacion(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    COMISION_OPERACION = num*1 trx;
  }

  function nuevoComWozx(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    COMISION_WOZX = num*1000000;
  }

  function nuevoComReDeposit(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    COMISION_REDEPOSIT = num;
  }


  function nuevoRatetron(uint rate)public{
    require (msg.sender == owner || msg.sender == app);
    require (rate != rateTRON);
    rateTRON = rate;
    
  }

  function getBlackListStatus(address _maker) external view returns (bool) {
    return isBlackListed[_maker];
  }

  function addBlackList (address _evilUser) public {
    require(msg.sender == owner);
    isBlackListed[_evilUser] = true;
  }

  function removeBlackList (address _clearedUser) public {
    require(msg.sender == owner);
    isBlackListed[_clearedUser] = false;
  }

  function () external payable {}  
  
}