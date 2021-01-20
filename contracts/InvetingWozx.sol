pragma solidity ^0.5.14;

import "./SafeMath.sol";

contract InvetingWozx {
  using SafeMath for uint;

  struct Referer {
    address myReferer;
    uint nivel;
  }
  
  struct Firma {
    bytes32 numero;
    bool valida;
  }

  struct Investor {
    bool registered;
    address sponsor;
    bool exist;
    Referer[] referers;
    string ethereum;
    bool eth;
    uint balanceTrx;
    uint withdrawnTrx;
    uint investedWozx;
    uint withdrawnWozx;
    
  }
  
  uint public MIN_DEPOSIT = 50 trx;
  
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
  Firma[] firmas;

  
  constructor() public {
    owner = msg.sender;
    marketing = msg.sender;
    gateio = msg.sender;
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
    return InContract;
  }

  function owner2() public view returns (address){
    return owner;
  }

  function setOwner(address payable _owner) public returns (address){
    require (msg.sender == owner);
    require (_owner != owner);

    owner = _owner;
    investors[owner].registered = true;
    investors[owner].sponsor = owner;
    investors[owner].exist = false;
    totalInvestors++;

    return owner;
  }
  
  function setMarketing(address payable _marketing) public returns (address){
    require (msg.sender == owner);
    require (_marketing != marketing);

    marketing = _marketing;
    
    return marketing;
  }
  
  function setGateio(address payable _gateio) public returns (address){
    require (msg.sender == owner);
    require (_gateio != gateio);

    gateio = _gateio;

    return gateio;
  }

  function setGateio(address payable _app) public returns (address){
    require (msg.sender == owner);
    require (_app != app);

    app = _app;

    return app;
  }
  
  
  function start() internal {
    require (msg.sender == owner);
      investors[msg.sender].registered = true;
      investors[msg.sender].sponsor = owner;
      investors[msg.sender].exist = false;
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

      investors[spo].referers.push(Referer(ref,3));
      nvl++;
     
      if (investors[spo].exist){
        spo = investors[spo].sponsor;
        if (investors[spo].registered){
          investors[spo].referers.push(Referer(ref,2));
          nvl++;
          
          if (investors[spo].exist){
            spo = investors[spo].sponsor;
            if (investors[spo].registered){
              investors[spo].referers.push(Referer(ref,1));
              nvl++;
              
              if (investors[spo].exist){
                spo = investors[spo].sponsor;
                if (investors[spo].registered){
                   investors[spo].referers.push(Referer(ref,1));
                   nvl++;
                   
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
    for (uint i = 0; i < 4; i++) {

      if (investors[spo].exist) {

        for (i = 0; i < investors[spo].referers.length; i++) {
          if (!investors[spo].registered) {
            break;
          }
          if ( investors[spo].referers[i].myReferer == yo){
              uint b = investors[spo].referers[i].nivel;
              uint a = amount * b / 100;
              investors[spo].balanceTrx += a;
              totalRefRewards += a;
          }
        }

        spo = investors[spo].sponsor;
      }
    }
    
    
  }
  
  function firmarTx(bytes32 veri) public{
      require (msg.sender == owner);
      firmas.push(Firma(veri,true));
  }
    
  
  function deposit(uint orden, string calldata orden2, bytes32 wallet, address _sponsor, bytes32 firma, bytes32 firma2, bytes32 firma3) external payable  {
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
      rewardReferers(msg.sender, orden, investors[msg.sender].sponsor);
    }
    
    investors[msg.sender].investedWozx += orden;
    totalInvested += orden;
    
    
    owner.transfer(msg.value.mul(18).div(100));
    marketing.transfer(msg.value.mul(10).div(100));
    gateio.transfer(msg.value.mul(55).div(100));
    InContract += msg.value.mul(17).div(100);
    
  }
  
  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];
    amount = investor.balanceTrx;
    
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
    //require (InContract > 0);
    
    uint valor = address(this).balance;
    if (msg.sender.send(valor)){
      uint IC = InContract;
      InContract = 0;
      return IC;
    }
  }

  function MYwithdrawable() public view returns (uint amount) {
    Investor storage investor = investors[msg.sender];
    amount = investor.balanceTrx;
  }

  function miETH (address  _direccion) public view returns(string memory eth)  {
    Investor storage inv = investors[_direccion];
    eth = inv.ethereum;

    return eth;
  }
  
  function setETH (string memory _direccion) public returns (bool, string memory){
    Investor storage inv = investors[msg.sender];
    inv.ethereum = _direccion;

    return (true, _direccion);
  }
  
  function nuevoMinDeposit(uint num)public{
    require (msg.sender == owner);
    MIN_DEPOSIT = num*1 trx;
  }
 
  
  function withdraw() external {
    if (Do){
      uint amount = withdrawable(msg.sender);
        investors[msg.sender].withdrawnTrx += amount;
        InContract -= amount;
      
      }
    
  }
  

  function () external payable {}  
  
}