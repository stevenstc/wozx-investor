pragma solidity ^0.5.14;

import "./SafeMath.sol";

contract EWozx {
  using SafeMath for uint;

  struct Referer {
    address myReferer;
    uint porciento;
  }
  
  struct Firma {
    bytes32 numero;
    bool valida;
  }

  struct Pendiente{
    bool pending;
    address wallet;
    uint tron;
    uint rateTrx; 
    uint rateWozx;
    uint orden;
  }

  struct Nivel {
    uint n;

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
    uint withdrawnWozx;
    
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
  uint public InContract;
  

  mapping (address => Investor) public investors;
  mapping (address => bool) public isBlackListed;
  Firma[] firmas;
  Pendiente[] pendientes;
  
  constructor() public payable {
    owner = msg.sender;
    marketing = msg.sender;
    gateio = msg.sender;
    app = msg.sender;
    start();
    Do = true;

  }

  function setstate() public view  returns(uint Investors,uint Invested,uint RefRewards){
      return (totalInvestors, totalInvested, totalRefRewards);
  }

  function Do2() public view returns (bool){
    return Do;
  }

  function InContract2() public view returns (uint){
    return address(this).balance;
  }

  function owner2() public view returns (address){
    return owner;
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
      investors[msg.sender].registered = true;
      investors[msg.sender].sponsor = owner;
      totalInvestors++;

  }
  
  function register() internal {
    if (!investors[msg.sender].registered) {
      investors[msg.sender].registered = true;
      totalInvestors++;
    }
  }

  function registerSponsor(address sponsor) internal {
    if (!investors[msg.sender].exist){
      investors[msg.sender].sponsor = sponsor;
      investors[msg.sender].exist = true;
    }
  }

  function registerReferers(address ref, address spo) internal {
      
    uint nvl = 0;

      
    if (investors[spo].registered) {

      investors[spo].referers.push(Referer(ref,8000));
      investors[spo].niveles[nvl].n++;
      nvl++;
      
     
      if (investors[spo].exist){
        spo = investors[spo].sponsor;
        if (investors[spo].registered){
          investors[spo].referers.push(Referer(ref,2000));
          investors[spo].niveles[nvl].n++;
          nvl++;
     
          
          if (investors[spo].exist){
            spo = investors[spo].sponsor;
            if (investors[spo].registered){
              investors[spo].referers.push(Referer(ref,1000));
              investors[spo].niveles[nvl].n++;
              nvl++;
              
              
              if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,500));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,500));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,250));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,250));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,250));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,125));
                   investors[spo].niveles[nvl].n++;
                    nvl++;
                   
                   
                   if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,125));
                   investors[spo].niveles[nvl].n++;
                   
                   
                }
              }
                   
                }
              }
                   
                }
              }
                   
                }
              }
                   
                }
              }
                   
                }
              }
                   
                }
              }
            }
          }
        }
      }
    }
  }
  
  function rewardReferers(address yo, uint amount, address sponsor) internal {
    address spo = sponsor;
    for (uint i = 0; i < 10; i++) {

      if (investors[spo].exist) {

        for (uint e = 0; e < investors[spo].referers.length; e++) {
          if (!investors[spo].registered) {
            break;
          }
          if ( investors[spo].referers[e].myReferer == yo){
              uint b = investors[spo].referers[e].porciento;
              uint a = amount.mul(b).div(100000);
              investors[spo].balanceTrx += a;
              totalRefRewards += a;
              investors[spo].rango += a.mul(rateTRON);
              
              
          }
        }

        spo = investors[spo].sponsor;
      }
    }
    
    
  }
  
  function firmarTx(bytes32 veri) public{
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app);
    firmas.push(Firma(veri,true));
  }
    
  
  function deposit(uint orden, string calldata orden2, bytes32 wallet, address _sponsor, bytes32 firma, bytes32 firma2, bytes32 firma3) external payable  {
    require (!isBlackListed[msg.sender]);
    require(msg.value >= MIN_DEPOSIT);
    require (_sponsor != msg.sender);
    require(keccak256(abi.encodePacked(orden2)) == firma);
    require(wallet == firma2);
    
    for (uint i = 0; i < firmas.length; i++) {
        
      if (keccak256(abi.encodePacked(firmas[i].numero)) == keccak256(abi.encodePacked(firma3))) {
          require (firmas[i].valida);
          firmas[i].numero = firma3;
          firmas[i].valida = false;
          
        break;
      }
      
    }
    
    register();

    if (_sponsor != owner && investors[_sponsor].registered && _sponsor != NoValido){
      if (!investors[msg.sender].exist){
        registerSponsor(_sponsor);
        registerReferers(msg.sender, investors[msg.sender].sponsor);
      }
    }

    if (investors[msg.sender].exist){
      rewardReferers(msg.sender, msg.value, investors[msg.sender].sponsor);
    } 
    
    investors[msg.sender].investedWozx += orden;
    totalInvested += orden;
    
    
    owner.transfer(msg.value.mul(9).div(100));
    marketing.transfer(msg.value.mul(9).div(100));
    gateio.transfer(msg.value.mul(70).div(100));
    setInContract();
    
  }

  function ordenPost(address _w , uint _t, uint _rt, uint _rw, uint _o) public{
    require (!isBlackListed[msg.sender]);
    require (_t >= MIN_DEPOSIT );
    require (_o > 0);
    require (msg.sender == app);
    pendientes.push(Pendiente(true, _w, _t, _rt, _rw, _o));
    setInContract();
  }

  function verOrdenPost() public view returns(uint, uint, uint, uint, uint){
    require (msg.sender == app || msg.sender == owner);
    uint ordenNumero = 0;
    uint totaltron = 0;
    uint totalrateTrx = 0;
    uint totalrateWozx = 0;
    uint totalorden = 0;


    for (uint i = 0; i < pendientes.length; i++) {
        
      if (pendientes[i].pending) {
        ordenNumero = i;
        totaltron = pendientes[i].tron;
        totalrateTrx = pendientes[i].rateTrx;
        totalrateWozx = pendientes[i].rateWozx;
        totalorden = pendientes[i].orden;

        break;
      }
      
    }
    return (ordenNumero, totaltron, totalrateTrx, totalrateWozx, totalorden);
    

  }

  function verOrdenPost2(uint _numero) public view returns(bool, uint, uint, uint, uint){
    require (msg.sender == app || msg.sender == owner);
    require (_numero < pendientes.length);

    bool pendiente = pendientes[_numero].pending;
    uint tron = pendientes[_numero].tron;
    uint rateTrx = pendientes[_numero].rateTrx;
    uint rateWozx = pendientes[_numero].rateWozx;
    uint orden = pendientes[_numero].orden;


    return (pendiente, tron, rateTrx, rateWozx, orden);
    

  }

  function myFunction (uint _nivel) public view returns(uint cantidad){
    
    require (_nivel < investors[msg.sender].niveles.length && _nivel >= 0 );
    
    return investors[msg.sender].niveles[_nivel].n;
      
  }

  function myRango () public view returns(uint cantidad){
    
    return investors[msg.sender].rango;
      
  }
  

  function ejecutarOrden(uint _numero) public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == app || msg.sender == owner);
    require (_numero < pendientes.length);
    require (pendientes[_numero].pending);

    setInContract();
    investors[pendientes[_numero].wallet].investedWozx += pendientes[_numero].orden;
    totalInvested += pendientes[_numero].orden;
    pendientes[_numero].pending = false;
        
  }

  function ejecutarTodasOrdenes() public {
    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);

    setInContract();
    for (uint i = 0; i < pendientes.length; i++) {
        
      if (pendientes[i].pending) {
          
        investors[pendientes[i].wallet].investedWozx += pendientes[i].orden;
        totalInvested += pendientes[i].orden;
        pendientes[i].pending = false;
        
      }
      
    }
  }
  

  function depositPost(address _sponsor) external payable {
    require (!isBlackListed[msg.sender]);
    require(msg.value >= MIN_DEPOSIT);
    require (_sponsor != msg.sender);
    
    register();

    if (_sponsor != owner && investors[_sponsor].registered && _sponsor != NoValido){
      if (!investors[msg.sender].exist){
        registerSponsor(_sponsor);
        registerReferers(msg.sender, investors[msg.sender].sponsor);
      }
    }

    if (investors[msg.sender].exist){
      rewardReferers(msg.sender, msg.value, investors[msg.sender].sponsor);
    } 
    
    owner.transfer(msg.value.mul(9).div(100));
    marketing.transfer(msg.value.mul(9).div(100));
    gateio.transfer(msg.value.mul(70).div(100));
    setInContract();
    
  }

  function setInContract() public returns (uint){
    InContract = address(this).balance; 
    return InContract;
  }
  
  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];
    amount = investor.balanceTrx;
    
  }

  function withdraw() external returns(bool envio, uint) {

    require (!isBlackListed[msg.sender]);
    
    setInContract();
    uint amount = withdrawable(msg.sender);
    if (Do && amount > COMISION_RETIRO && address(this).balance > amount ){
      
      msg.sender.transfer(amount-COMISION_RETIRO);
      app.transfer(5 trx);
      investors[msg.sender].balanceTrx = 0;
      investors[msg.sender].withdrawnTrx += amount-COMISION_RETIRO;

      return (true, amount-COMISION_RETIRO);
    }else{
      return (false, amount-COMISION_RETIRO);
    }

    
  }
    
  function withdraw000() public returns (bool set_Do) {
    require (msg.sender == owner);
      if(Do){
        Do = false;
      }else{
        Do = true;
      }

    return Do;
  }

  function withdraw001() public returns (uint) {
    require(msg.sender == owner);
    require (InContract > 0);
    
    uint valor = address(this).balance;
    if (msg.sender.send(valor)){
      uint IC = InContract;
      InContract = address(this).balance;
      return IC;
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
    investors[_wallet].balanceTrx += amount-5 trx;
    InContract = address(this).balance;
    return true;
    
  }
  
  function enviarWozx (address _wallet, uint _cantidad) public returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].investedWozx >= _cantidad);
    
    InContract = address(this).balance; 
    investors[msg.sender].investedWozx -= _cantidad;
    investors[msg.sender].withdrawnWozx += _cantidad;
    investors[_wallet].investedWozx += _cantidad;
    return true;
  }

  function retirarWozx () external  returns(bool res) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].investedWozx > 0);
    
    uint iwozx = investors[msg.sender].investedWozx;
    investors[msg.sender].investedWozx = 0;
    investors[msg.sender].withdrawnWozx += iwozx;

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


    require (msg.sender == owner || msg.sender == app);
    
    require (!isBlackListed[msg.sender]);

    investors[_direccion].eth = true;

    return (investors[_direccion].eth, _direccion);
  }
  
  function nuevoMinDeposit(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    MIN_DEPOSIT = num*1 trx;
    InContract = address(this).balance; 
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

  function () external payable {
    setInContract();
  }  
  
}