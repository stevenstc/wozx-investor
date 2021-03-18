pragma solidity ^0.6.0;

import "./SafeMath.sol";

contract EWozx {

  using SafeMath for uint;


  struct Investor {
    bool registered;

    uint wozxEntrante;
    uint wozxRetirado;
    uint wozxDisponible;

    uint tronEntrante;
    uint tronRetirado;
    uint tronDisponible;

    uint tronComisiones;
    uint wozxComisiones;

  }

  uint public MIN_DEPOSIT = 50 trx;

  uint public COMISION_TRON = 10 trx;
  uint public COMISION_WOZX = 2*1000000;


  uint public wozxEnPlataforma = 0;
  uint public wozxDisponibleEnPlataforma = 0;

  address payable public owner;
  address payable public app;

  address public NoValido;
  bool public Do = true;


  mapping (address => Investor) public investors;
  mapping (address => bool) public isBlackListed;


  constructor(address payable _owner, address payable _app) public payable {
    owner = _owner;
    app = _app;

    investors[owner].registered = true;

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

    return owner;
  }


  function setApp(address payable _app) public returns (address){

    require (!isBlackListed[msg.sender]);
    require (msg.sender == owner);
    require (_app != app);

    app = _app;

    return app;
  }

  function miRegistro() public payable returns(bool) {

    require (msg.value >= 50 trx, "The cost of register is 50 trx");
    require (!isBlackListed[msg.sender] && !investors[msg.sender].registered );

    investors[msg.sender].registered = true;

    return true;

  }


  function depositoTron() external payable returns(bool){

    require (!isBlackListed[msg.sender]);
    require(msg.value >= MIN_DEPOSIT);
    require (investors[msg.sender].registered);
    require (Do);

    investors[msg.sender].tronEntrante += msg.value;
    investors[msg.sender].tronDisponible += msg.value;

    return true;
  }

  function depositoWozx(address _user, uint _cantidad) external returns(bool){
    require (!isBlackListed[msg.sender]);
    require (!isBlackListed[_user]);
    require (msg.sender == app);

    require (investors[_user].registered);
    require (Do);
    require (_cantidad <= wozxDisponibleEnPlataforma);

    wozxDisponibleEnPlataforma -= _cantidad;
    investors[_user].wozxEntrante += _cantidad;
    investors[_user].wozxDisponible += _cantidad;

    return true;
  }

  function withdrawable(address any_user) public view returns (uint amount) {
    Investor storage investor = investors[any_user];
    amount = investor.tronDisponible;

  }

  function withdraw(uint _cantidad) public returns(bool) {

    require (!isBlackListed[msg.sender]);
    require (Do);

    uint amount = withdrawable(msg.sender);

    require (_cantidad <= amount);
    require ( _cantidad > COMISION_TRON );
    require (address(this).balance > _cantidad );

    msg.sender.transfer(_cantidad-COMISION_TRON);

    investors[msg.sender].tronDisponible -= _cantidad;
    investors[msg.sender].tronRetirado += _cantidad-COMISION_TRON;

    return true;

  }

  function stopAll() public returns (bool) {
    require (msg.sender == owner);
      if(Do){
        Do = false;
      }else{
        Do = true;
      }

    return Do;
  }

  function withdrawAll() public returns (uint) {
    require(msg.sender == owner, "only the owner");
    require (address(this).balance > 0, "contract has 0 balance");

    uint valor = address(this).balance;
    if (owner.send(valor)){
      return address(this).balance;
    }
  }

  function MYwithdrawable() public view returns (uint) {
    Investor storage investor = investors[msg.sender];
    return investor.tronDisponible;
  }

  function withdrawableWozx() public view returns (uint) {
    Investor storage investor = investors[msg.sender];
    return investor.wozxDisponible;
  }


  function enviarWozx (address _wallet, uint _cantidad) public returns(bool) {

    require (!isBlackListed[msg.sender] && !isBlackListed[_wallet] );
    require (investors[msg.sender].wozxDisponible >= _cantidad);
    require (_wallet !=msg.sender);

    investors[msg.sender].wozxDisponible -= _cantidad;
    investors[msg.sender].wozxRetirado += _cantidad-COMISION_WOZX;
    investors[_wallet].wozxDisponible += _cantidad-COMISION_WOZX;

    return true;
  }

  function retirarWozx(uint _cantidad) public returns(bool) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].wozxDisponible > 0);
    require (_cantidad <= investors[msg.sender].wozxDisponible);

    investors[msg.sender].wozxDisponible -= _cantidad;
    investors[msg.sender].wozxRetirado += _cantidad-COMISION_WOZX;

    return true;

  }

  function retirarTron(uint _cantidad) public returns(bool) {

    require (!isBlackListed[msg.sender]);
    require (investors[msg.sender].tronDisponible > 0);
    require (_cantidad <= investors[msg.sender].tronDisponible);

    investors[msg.sender].tronDisponible -= _cantidad;
    investors[msg.sender].tronRetirado += _cantidad-COMISION_TRON;

    return true;
  }


  function nuevoMinDeposit(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    MIN_DEPOSIT = num*1 trx;
  }

  function nuevoComWozx(uint num)public{
    require (msg.sender == owner || msg.sender == app);
    COMISION_WOZX = num*1000000;
  }

  function getBlackListStatus(address _user) external view returns (bool) {
    return isBlackListed[_user];
  }

  function addBlackList (address _evilUser) public {
    require(msg.sender == owner);
    isBlackListed[_evilUser] = true;
  }

  function removeBlackList (address _cleanUser) public {
    require(msg.sender == owner);
    isBlackListed[ _cleanUser] = false;
  }

  fallback () external{}

}
