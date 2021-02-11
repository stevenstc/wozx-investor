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
    
  }

  struct Nivel {
    uint n;

  }

  struct Referer {
    address myReferer;
    uint porciento;
  }
  
  struct Investor {
    bool registered;
    address sponsor;
    bool exist;
    Referer[] referers;
    string ethereum;
    bool eth;
    uint rango;
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
  uint public rateTRON = 28677;
  
  address payable public owner;
  address payable public marketing;
  address payable public gateio;
  address payable public app;
  
  address public NoValido;
  bool public Do;
  
  uint public totalInvestors;
  uint public totalInvested;
  uint public totalRefRewards;

  uint[10] public porcientos;

  mapping (address => Investor) public investors;
  mapping (address => bool) public isBlackListed;
  Firma[] firmas;
  Pendiente[] pendientes;
  Transar[] transacciones;

  
  constructor() public payable {
    owner = msg.sender;
    marketing = msg.sender;
    gateio = msg.sender;
    app = msg.sender;
    start();
    Do = true;

    porcientos[0] = 5000;
    porcientos[1] = 1000;
    porcientos[2] = 1000;
    porcientos[3] = 500;
    porcientos[4] = 500;
    porcientos[5] = 250;
    porcientos[6] = 250;
    porcientos[7] = 250;
    porcientos[8] = 125;
    porcientos[9] = 125;

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
    investors[owner].sponsor = owner;
    totalInvestors++;

    return owner;
  }
  
  function setMarketing(address payable _marketing) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_marketing != marketing);

    marketing = _marketing;
    
    return marketing;
  }
  
  function setGateio(address payable _gateio) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_gateio != gateio);

    gateio = _gateio;

    return gateio;
  }

  function setApp(address payable _app) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_app != app);

    app = _app;

    return app;
  }
  
  
  function start() internal {
    require (msg.sender == owner);
      investors[msg.sender].exist = true;
      investors[msg.sender].registered = true;
      investors[msg.sender].sponsor = owner;
      totalInvestors++;

  }

  function miRegistro(address _sponsor) public {
    require (!isBlackListed[msg.sender]);
    require (_sponsor != NoValido);
    require (investors[_sponsor].registered);

    investors[msg.sender].sponsor = _sponsor;
    investors[msg.sender].registered = true;
    investors[msg.sender].exist = true;
    totalInvestors++;

    registerReferers(msg.sender, _sponsor);
      
  }

  function registerReferers(address ref, address spo) internal {

    for (uint nvl = 0; nvl < 10; nvl++){

      if (investors[spo].exist && ref != spo){

        investors[spo].referers.push(Referer(ref,porcientos[nvl]));
        investors[spo].niveles[nvl].n++;
        spo = investors[spo].sponsor;
        
      }else{
        break;
      }


    }

    
  }

  function verporciento (address yo,uint numer) public view returns(uint res) {
    return investors[yo].referers[numer].porciento;
  }
  
  
  function rewardReferers(address yo, uint amount, address sponsor) internal {

    address spo = sponsor;
    address ver = yo;

    for (uint i = 0; i < 10; i++) {
      if (investors[spo].exist && investors[spo].sponsor != ver) {
        for (uint e = 0; e < investors[spo].referers.length; e++) {
          
          if ( investors[spo].referers[e].myReferer == yo){
              uint b = investors[spo].referers[e].porciento;
              uint a = amount.mul(b).div(100000);
              investors[spo].balanceTrx += a;
              investors[spo].historial.push(Historia(now, a, "TRX", "Reward Referer"));
              totalRefRewards += a;
              investors[spo].rango += a.mul(rateTRON);
              break; 
          }
        }

        spo = investors[spo].sponsor;
      }else{
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
  
  
  
  function deposit() external payable returns(bool res) {
    require (!isBlackListed[msg.sender]);
    require(msg.value >= MIN_DEPOSIT);
    require (investors[msg.sender].registered);
    require (Do);
    uint orden = buscarfirma(msg.sender);

    require (firmas[orden].valida == true);
    
    if (firmas[orden].valida){

      transacciones.push(Transar(msg.sender, msg.value, false));
      
      investors[msg.sender].investedWozx += firmas[orden].orden;
      totalInvested += firmas[orden].orden;
      firmas[orden].valida = false;

      investors[msg.sender].historial.push(Historia(now, firmas[orden].orden, "WOZX", "Direct Bought"));


      return true;
    }
     
  }

  function transfers()public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);

    for (uint i = 0; i < transacciones.length; i++) {

      if (!transacciones[i].hecho){

        if (investors[transacciones[i].wallet].exist){
          rewardReferers(transacciones[i].wallet, transacciones[i].monto, investors[transacciones[i].wallet].sponsor);
        }

        transacciones[i].hecho = true;

        owner.transfer(transacciones[i].monto.mul(7).div(100));
        marketing.transfer(transacciones[i].monto.mul(7).div(100));
        gateio.transfer(transacciones[i].monto.mul(77).div(100));

        break;

      }
      
    }

    
    
  }

  function verTransfersPendientes()public view returns(uint length, address wallet, uint valor, bool hecho){
    require (!isBlackListed[msg.sender]);

    for (uint i = 0; i < transacciones.length; i++) {
      if (!transacciones[i].hecho){
        return (i, transacciones[i].wallet, transacciones[i].monto, transacciones[i].hecho);
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
          rewardReferers(transacciones[_numero].wallet, transacciones[_numero].monto, investors[transacciones[_numero].wallet].sponsor);
        }

        transacciones[_numero].hecho = true;

        owner.transfer(transacciones[_numero].monto.mul(7).div(100));
        marketing.transfer(transacciones[_numero].monto.mul(7).div(100));
        gateio.transfer(transacciones[_numero].monto.mul(77).div(100));

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
    investors[_w].historial.push(Historia(now, _t, "TRX", "Post Deposit"));
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

    investors[_w].historial.push(Historia(now, _orden, "WOZX", "Post Bought"));
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

        investors[pendientes[i].wallet].historial.push(Historia(now, pendientes[i].orden, "WOZX", "Post Bought"));
        
      }
      
    }

  }


  function esponsor() public view returns(bool res, address sponsor ) {

    return (investors[msg.sender].exist, investors[msg.sender].sponsor);

  }
  
  

  function depositPost() external payable {
    require (!isBlackListed[msg.sender]);
    require(msg.value >= MIN_DEPOSIT);
    require (investors[msg.sender].registered);
    require (Do);
    
    
    if (investors[msg.sender].exist){
      rewardReferers(msg.sender, msg.value, investors[msg.sender].sponsor);
    }
    
    owner.transfer(msg.value.mul(7).div(100));
    marketing.transfer(msg.value.mul(7).div(100));
    gateio.transfer(msg.value.mul(77).div(100));
    
  }
  
  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];
    amount = investor.balanceTrx;
    
  }

  function withdraw() external returns(bool envio, uint) {

    require (!isBlackListed[msg.sender]);
    require (Do);
    
    uint amount = withdrawable(msg.sender);
    if ( amount > COMISION_RETIRO && address(this).balance > amount ){
      
      msg.sender.transfer(amount-COMISION_RETIRO);
      investors[msg.sender].balanceTrx = 0;
      investors[msg.sender].withdrawnTrx += amount-COMISION_RETIRO;
      
      investors[msg.sender].historial.push(Historia(now, amount-COMISION_RETIRO, "TRX", "Withdrawl"));

      return (true, amount-COMISION_RETIRO);
    }else{
      return (false, amount-COMISION_RETIRO);
    }

    
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

  function wozxToTron (address _wallet, uint _rt, uint _rw) external  returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (msg.sender == app);

    uint iwozx = investors[_wallet].investedWozx;
    uint amount = iwozx.mul(_rw).div(_rt);
    investors[_wallet].withdrawnWozx += iwozx;
    investors[_wallet].investedWozx = 0;
    app.transfer(5 trx);
    investors[_wallet].balanceTrx += amount;

    investors[_wallet].historial.push(Historia(now, iwozx, "WOZX", "Sell"));
    investors[_wallet].historial.push(Historia(now, amount, "TRX", "Buy"));



    return true;
    
  }
  
  function enviarWozx (address _wallet, uint _cantidad) public returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].investedWozx >= _cantidad);
    
    investors[msg.sender].investedWozx -= _cantidad;
    investors[msg.sender].withdrawnWozx += _cantidad;
    investors[_wallet].investedWozx += _cantidad;

    investors[msg.sender].historial.push(Historia(now, _cantidad, "WOZX", "Send"));
    investors[_wallet].historial.push(Historia(now, _cantidad, "WOZX", "Deposit"));

    return true;
  }

  function retirarWozx () external  returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].investedWozx > 0);
    
    uint iwozx = investors[msg.sender].investedWozx;
    investors[msg.sender].investedWozx = 0;
    investors[msg.sender].withdrawnWozx += iwozx;

    investors[msg.sender].historial.push(Historia(now, iwozx, "WOZX", "ETH Withdrawl"));

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