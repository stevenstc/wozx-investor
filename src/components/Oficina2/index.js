import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import querystring from 'querystring';
import sha512 from 'sha512';
import TronWeb2 from 'tronweb';

import web3 from 'web3';

var tantoTrx = 0.02;// para que el TRX se Venda de inmediato
var tantoWozx = 0.06;// para que el WOZX se venda de inmediato

var amountTrx = 0;
var cantidadusd = 0;
var ratetrx = 0;
var ratewozx = 0;

var descuento = cons.descuento; 
var walletSponsor = cons.WS;


var AccessOrigin = '*';

var proxyUrl = cons.proxy;
const KEY  = cons.AK;
const SECRET  = cons.SK;
const pry = cons.WO;

var pru = "";
if (cons.PRU) {
  pru = cons.PRU;
}

const TRONGRID_API = "https://api."+pru+"trongrid.io";
console.log(TRONGRID_API);

const tronApp = new TronWeb2(
  TRONGRID_API,
  TRONGRID_API,
  TRONGRID_API,
  pry
);

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ratetrx: "",
      ratewozx: "",
      tipo: "button",
      auth: "/auth.html",
      texto: "Loading...",
      value: "",
      fee: 4,
      feetrx: 10,
      funcion: false,
      alerta: "alerta0",
      direccion: "",
      registered: false,
      balanceRef: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      withdrawn: 0

    };

    this.Investors = this.Investors.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.rateWozx = this.rateWozx.bind(this);
    this.venderWozx = this.venderWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.comprarTRX = this.comprarTRX.bind(this);
    this.enviarTron = this.enviarTron.bind(this);
    this.vereth = this.vereth.bind(this);
    this.withdrawETH = this.withdrawETH.bind(this);
    this.enviarEth = this.enviarEth.bind(this);
    this.saldoApp = this.saldoApp.bind(this);
    this.wozx = this.wozx.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.postComprarWozx = this.postComprarWozx.bind(this);
    this.postVenderTRX = this.postVenderTRX.bind(this);
    this.deposit = this.deposit.bind(this);
    this.deposit2 = this.deposit2.bind(this);

    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.Investors();
    
    this.vereth();
    this.enviarEth();
    setInterval(() => this.Investors(),10*1000);
    setInterval(() => this.vereth(),10*1000);
    setInterval(() => this.enviarEth(),3*1000);
  };

  async saldoApp(){

    let body = "";
    let header = {};

    var hasher = sha512.hmac(SECRET);
    var hash = hasher.finalize(body);
    var firma = hash.toString('hex');

    header.KEY = KEY;
    header.SIGN = firma;

    await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/balances',{method: 'POST', headers: header, form:body})
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      //console.log(data.available.TRX);
      this.setState({
        tronEnApp: data.available.TRX
      });


    })
    .catch(error => console.log('Error:', error));
  };


  async rateTRX(){

    function esTrx(cripto) {
          return cripto.symbol === 'TRX';
      }

    const USER_AGENT = 'stevenSTC';
    let header1 = {
      'Access-Control-Allow-Origin' :AccessOrigin,
      'User-Agent' : USER_AGENT,
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With',
      'mode':'no-cors'
    };
    await fetch(proxyUrl+'https://data.gateio.life/api2/1/marketlist',{method: 'GET', headers: header1})
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      ratetrx = data.data.find(esTrx).rate; 
      ratetrx = parseFloat(ratetrx).toFixed(6);
      ratetrx = ratetrx-ratetrx*tantoTrx;
      ratetrx = ratetrx.toString();
      //console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));


  };

  async venderTRX(){  

    await this.saldoApp();
    await this.rateTRX();

    const {tronEnApp} = this.state;

    this.setState({
      texto:"Please wait"
    });
    
    // verifica el monto sea mayor a minimo
    amountTrx = document.getElementById("amount").value;

    let depomin = await Utils.contract.MIN_DEPOSIT().call();

    

      // verifica si ya esta registrado
      const account =  await window.tronWeb.trx.getAccount();
      var accountAddress = account.address;
      accountAddress = window.tronWeb.address.fromHex(accountAddress);

      var investors = await Utils.contract.investors(accountAddress).call();
      //console.log(investors);

      const balanceInSun = await window.tronWeb.trx.getBalance(); //number
      var balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
      balanceInTRX = parseInt(balanceInTRX);//number

      var montoTrx = parseInt(amountTrx);
      var haytron = parseInt(tronEnApp);

      if (investors.registered) {
        if (amountTrx >= depomin && amountTrx <= balanceInTRX-40) {
          if ( montoTrx < haytron ) {
            console.log("Entro directo");
          amountTrx = amountTrx - amountTrx*descuento;
          amountTrx = amountTrx.toString();

          let currencyPair = "trx_usdt";

          let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratetrx,'amount':amountTrx});

          let header = {
            'Content-Type': 'application/x-www-form-urlencoded'
          };

          var hasher = sha512.hmac(SECRET);
          var hash = hasher.finalize(body);
          var firma = hash.toString('hex');

          header.KEY = KEY;
          header.SIGN = firma;

          await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/sell/',{method: 'POST', headers: header, body:body})
          .then(res => res.json())
          .then(data => {
            //console.log(data);
            var cantidadTrx=parseFloat(data.filledAmount);
            var cantidadTrx2=parseFloat(data.leftAmount);
            cantidadTrx = cantidadTrx+cantidadTrx2;

            var precioTrx=parseFloat(data.filledRate);
            cantidadusd = precioTrx*cantidadTrx;
            cantidadusd = cantidadusd-cantidadusd*parseFloat(data.feeValue);
            
            console.log(cantidadusd);

            if (data.result === "true") {
              this.setState({
                texto:"Buying WOZX"
              });
              this.comprarWozx(cantidadusd);
            }else{
              this.setState({
                texto:"Error: T-Cf-285"
              });
              //No hay suficiente TRON en Gate.io
            }

          })
          .catch(error => console.log('Error:', error));

          }else{
            console.log("Entro POST");
            // cantidad muy alta de TRX pendiente se ejecuta post recepcion de fondos
            this.deposit2();
          }

        }else{
          if ( depomin >= amountTrx ){
            this.setState({
              texto:"Enter a higher amount"
            });
          }

          if (balanceInTRX-40 <= amountTrx ){
            this.setState({
              texto:"Not enough TRON"
            });
          }
          
        }

      }else{

        if ( balanceInTRX >= 40) {
          //registra a la persona con los referidos
          var loc = document.location.href;
          if(loc.indexOf('?')>0){
              var getString = loc.split('?')[1];
              var GET = getString.split('&');
              var get = {};
              for(var i = 0, l = GET.length; i < l; i++){
                  var tmp = GET[i].split('=');
                  get[tmp[0]] = unescape(decodeURI(tmp[1]));
              }
              
              if (get['ref']) {
                tmp = get['ref'].split('#')
                document.getElementById('sponsor').value = tmp[0];            
              }else{

                 document.getElementById('sponsor').value = walletSponsor;
              }
                 
          }else{
            
              document.getElementById('sponsor').value = walletSponsor; 
          }

          let sponsor = document.getElementById("sponsor").value;

          document.getElementById("amount").value = "";
          

          var verispo = await Utils.contract.esponsor().call();
          //console.log(verispo);

          if (verispo.res) {
            sponsor = window.tronWeb.address.fromHex(verispo.sponsor);
          }

          await Utils.contract.miRegistro(sponsor).send();

        }else{
          document.getElementById("amount").value = "";
          this.setState({
            texto:"Not enough TRON"
          });
          
        }

      }


  };

  async rateWozx(){

    function esWozx(cripto) {
      return cripto.symbol === 'WOZX';
    }

    const USER_AGENT = 'stevenSTC';
    let header1 = {
      'Access-Control-Allow-Origin' :AccessOrigin,
      'User-Agent' : USER_AGENT,
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With'
    };
    await fetch(proxyUrl+'https://data.gateio.life/api2/1/marketlist',{method: 'GET', headers: header1})
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      ratewozx = data.data.find(esWozx).rate; 
      ratewozx = parseFloat(ratewozx);
      ratewozx = ratewozx+ratewozx*tantoWozx;
      ratewozx = ratewozx.toString();
      //console.log(ratewozx);
    })
    .catch(error => console.log('Error:', error));


  }

  async comprarWozx(usd){    
    
    await this.rateWozx();

    this.setState({
      texto:"Processing..."
    });
    
    let amount = usd/parseFloat(ratewozx).toFixed(6);
    console.log(parseFloat(amount.toFixed(6)));

    amount = amount.toString();
    let currencyPair = "wozx_usdt";

    let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratewozx,'amount':amount});

    let header = {'Content-Type': 'application/x-www-form-urlencoded'};

    var hasher = sha512.hmac(SECRET);
    var hash = hasher.finalize(body);
    var firma = hash.toString('hex');

    header.KEY = KEY;
    header.SIGN = firma;
    await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/buy/',{method: 'POST', headers: header, body:body })
    .then(res => res.json())
    .then(data => {
      console.log(data);

      var cantidadWozx = parseFloat(data.filledAmount);
      var cantidadWozx2 = parseFloat(data.leftAmount);
      cantidadWozx = cantidadWozx+cantidadWozx2;
      cantidadWozx = cantidadWozx-cantidadWozx*parseFloat(data.feeValue);

      console.log(cantidadWozx)
      if (data.result === "true") {
        this.deposit(cantidadWozx);
      }else{
        this.setState({
          texto:"Error: U-Cf-408"
        });
        //No hay suficiente saldo de USD en Gate.io
      }
    })
    .catch(error => console.log('Error:', error));
    
    
    
  }


  async deposit(orden) {

    let amount = document.getElementById("amountTRX").value;

      orden = orden * 1000000;
      orden = parseInt(orden);
      console.log(orden);

      const account =  await window.tronWeb.trx.getAccount();
      var accountAddress = account.address;
      accountAddress = window.tronWeb.address.fromHex(accountAddress);

      this.setState({
        texto:"Sign order"
      });

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato

      var pending = await contract.depositpendiente(accountAddress).call();

      console.log(pending);
      //cancela cualquier deposito inconcluso para hacer uno nuevo
      if (pending.res) {
        console.log(pending);
        await contract.cancelDepo(accountAddress).send();
      }
      

      //crea una nueva orden directa
      await contract.firmarTx(accountAddress, orden).send();

      this.setState({
        texto:"Reciving TRON"
      });
    
      var sidep = await Utils.contract.redeposit(amount * 1000000).send();

      console.log(sidep);

      if (sidep.res) {
        await contract.transfers().send();
        this.setState({
          texto:"Buy WOZX"
        });
      }else{
        await contract.cancelDepo(accountAddress).send();
        this.setState({
          texto:"Canceled for User"
        });
      }

    document.getElementById("amountTRX").value = "";

    
  };

  async deposit2() {

    await this.rateWozx();
    await this.rateTRX();

    let amount = document.getElementById("amountTRX").value;
    

    this.setState({
      texto:"Don't close the window"
    });

    await Utils.contract.redepositPost(amount * 1000000).send();

    var orden = amount*ratetrx-ratetrx*tantoTrx;
    orden = orden-orden*descuento;
    orden = orden / ratewozx+ratewozx*tantoWozx;
    orden = parseInt(orden*1000000);
    console.log(orden);
    console.log(amount);
    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);
    console.log(accountAddress);

    var am = parseInt(amount*1000000);
    console.log(am);

    this.setState({
      texto:"Saving order"
    });
    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.ordenPost(accountAddress, am, orden).send();

    this.setState({
      texto:"Buy WOZX"
    });

    document.getElementById("amountTRX").value = "";
    
  };

  async venderWozx(){   
    await this.rateWozx();
    ratewozx = ratewozx-ratewozx*tantoWozx;
    const {investedWozx} = this.state;
    
    var amount = document.getElementById("amountWOZX").value;

    const result = window.confirm("You are sure you want to SELL "+amount+" Wozx?, remember that this action cost 4 WOZX");

    if (result && amount > 0 && investedWozx > 0 && amount <= investedWozx){

      amount = amount.toString();
      let currencyPair = "wozx_usdt";

      let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratewozx,'amount':amount});

      let header = {'Content-Type': 'application/x-www-form-urlencoded'};

      var hasher = sha512.hmac(SECRET);
      var hash = hasher.finalize(body);
      var firma = hash.toString('hex');

      header.KEY = KEY;
      header.SIGN = firma;

      await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/sell/',{method: 'POST', headers: header, body:body })
      .then(res => res.json())
      .then(data => {
        console.log(data);
        var cantidadWozx=parseFloat(data.filledAmount);
        var cantidadWozx2=parseFloat(data.leftAmount);
        cantidadWozx=cantidadWozx+cantidadWozx2;
        var precioWozx=parseFloat(data.filledRate);
        var cantidadusd = precioWozx*cantidadWozx;
        cantidadusd = cantidadusd-parseFloat(data.feeValue);
        if (data.result === "true") {
          console.log(cantidadusd)
          this.comprarTRX(cantidadusd);
        }
      })
      .catch(error => console.log('Error:', error));

    }
    
    document.getElementById("amountWOZX").value = "";

  };


  async comprarTRX(c){    

    await this.rateTRX();

    ratetrx = ratetrx+ratetrx*tantoTrx;
    
    let amount = c/parseFloat(ratetrx).toFixed(6);

    amount = amount.toString();
    ratetrx = ratetrx.toString();

    console.log(amount);

    let currencyPair = "trx_usdt";

    let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratetrx,'amount':amount});

    let header = {'Content-Type': 'application/x-www-form-urlencoded'};

    var hasher = sha512.hmac(SECRET);
    var hash = hasher.finalize(body);
    var firma = hash.toString('hex');

    header.KEY = KEY;
    header.SIGN = firma;
    await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/buy/',{method: 'POST', headers: header, body:body })
    .then(res => res.json())
    .then(data => {
      console.log(data);
      var cantidadTrx = parseFloat(data.filledAmount);
      var cantidadTrx2 = parseFloat(data.leftAmount);
      cantidadTrx = cantidadTrx+cantidadTrx2;
      cantidadTrx = cantidadTrx-parseFloat(data.feeValue);
      
      console.log(cantidadTrx);

      if (data.result === "true") {
        this.enviarTron(cantidadTrx);
      }
    })
    .catch(error => console.log('Error:', error));
    

  }

  async enviarTron(trx){

    await this.rateTRX();
    await this.rateWozx();

    //enviar el tron a la direccion del contrato
    let wallet = await window.tronWeb.trx.getAccount();
    wallet = window.tronWeb.address.fromHex(wallet.address)

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.wozxToTron(wallet, parseInt(ratetrx*1000000), parseInt(ratewozx*1000000)).send();
    console.log("se envio "+trx+" TRX a "+wallet+" exitosamente")

    let amount = trx;

    amount = amount.toString();
    let currency = "trx";

    // envia el saldo necesario a la direccion del contrato // si está en pruebas se lo envia al owner
    var address;
    if (cons.PRU) {
      let ownerContrato = await Utils.contract.owner().call();
      ownerContrato = window.tronWeb.address.fromHex(ownerContrato);
      address = ownerContrato;
    }else{
      address = contractAddress;
    }    

    console.log(address);

    let body = querystring.stringify({'currency':currency,'amount':amount, 'address':address});

    let header = {'Content-Type': 'application/x-www-form-urlencoded'};

    var hasher = sha512.hmac(SECRET);
    var hash = hasher.finalize(body);
    var firma = hash.toString('hex');

    header.KEY = KEY;
    header.SIGN = firma;
    await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/withdraw',{method: 'POST', headers: header, body:body })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.log('Error:', error));
  }   

  async Investors() {

    let direccion = await window.tronWeb.trx.getAccount();
    let esto = await Utils.contract.investors(direccion.address).call();
    let My = await Utils.contract.MYwithdrawable().call();
    //console.log(esto);
    //console.log(My);
    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceTrx: parseInt(esto.balanceTrx._hex)/1000000,
      investedWozx: parseInt(esto.investedWozx._hex)/1000000,
      mywithdrawableWozx: parseInt(My.amount._hex)/1000000
    });

  };

  async withdraw(){
    var hay = await Utils.contract.MYwithdrawable().call();
    var minre = await Utils.contract.COMISION_RETIRO().call();
    var balanceContract = Utils.contract.InContract().call();

    var amount = document.getElementById("amountTRX").value;

    balanceContract = parseInt(balanceContract._hex)/1000000;
    hay = parseInt(hay.amount._hex)/1000000;
    minre = parseInt(minre._hex)/1000000;

    console.log(hay);
    console.log(minre);

    var result = false;

    result = window.confirm("You are sure that you want to WITHDRAW "+amount+" TRX?, remember that this action cost "+minre+" TRX");

    if (result && amount > 0){

      if (hay > minre && amount <= hay && balanceContract >= amount) {

        amount = parseInt(amount*1000000);
        
        await Utils.contract.withdraw(amount).send();
      }else{
        window.alert("Try again Later");
      }
    }
    
  };

  async withdrawETH(){

    async function sacarwozx(c){

      this.setState({
        texto: "Wait for sing..."
      });
      
      await Utils.contract.retirarWozx(parseInt(c)*1000000).send();

      this.setState({
        texto: "successful withdrawal"
      });
    }
    
    const { funcion, investedWozx, fee } = this.state;

    var amount = document.getElementById("amountWOZX").value;

    const result = window.confirm("You are sure that you want to WITHDRAW "+amount+" Wozx?, remember that this action cannot be reversed");

    if (result && amount > 0 && investedWozx > 0){

    if (funcion) {
      if (amount <= investedWozx && investedWozx > fee) {
        amount = amount-fee+3.6;
        amount = amount.toString();
        let currency = "wozx";

        let direccion = await window.tronWeb.trx.getAccount();
        var address = await Utils.contract.miETH(window.tronWeb.address.fromHex(direccion.address)).call()
        address = address.ethdireccion;
        //address ="0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d";

        let body = querystring.stringify({'currency':currency,'amount':amount, 'address':address});

        let header = {'Content-Type': 'application/x-www-form-urlencoded'};

        var hasher = sha512.hmac(SECRET);
        var hash = hasher.finalize(body);
        var firma = hash.toString('hex');

        header.KEY = KEY;
        header.SIGN = firma;
        await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/withdraw',{method: 'POST', headers: header, body:body })
        .then(res => res.json())
        .then(data => {
          console.log(data);
          
          if (data.result === "true") {
            this.setState({
              texto: "Sendig WOZX"
            });
            sacarwozx(amount);
          }else{
            this.setState({
              texto: "Error: SW-Of2-347"
            });
            //no hay saldo de WOZX en gate.io
          }
        })
        .catch(error => console.log('Error:', error));


        
      }
      

      
    }else{
      this.setState({
          texto:"Error: ETH-Of2-361"
        });
      //No tienes billetera de Ethereum registrada
    }
  }

  document.getElementById("amountWOZX").value = "";
    
  };

  async escribireth(wallet){

    await Utils.contract.setETH(wallet).send();
     this.setState({
        tipo:"button",
        boton: "Enabling address",
        cosa: false
      });
    

  };

  async enviarEth(atuh){

    var dirETH = document.getElementById("direccioneth").value;
    var esEth = web3.utils.isAddress(dirETH);
    //console.log(esEth);
    if (esEth) {
      this.setState({
        tipo:"submit",
        boton: "Enable address",
        cosa: true
      });
      if (atuh) {
        this.escribireth(dirETH);
      }
      

    }else{
      this.setState({
        tipo:"button",
        boton: "Check address",
        cosa: false
      });

    }
  }

  async vereth(){
    let direccion = await window.tronWeb.trx.getAccount();
    var eth = await Utils.contract.miETH(window.tronWeb.address.fromHex(direccion.address)).call()
    //console.log(eth);
    let wallet = await window.tronWeb.trx.getAccount();
    wallet = window.tronWeb.address.fromHex(wallet.address)
      
    if (eth.habilitado) {
      this.setState({
        alerta: "alerta0",
        funcion:true,
        auth: "#invested_wozx2",
        texto: "Withdrawal WOZX",
        walleteth: eth.ethdireccion
      });
    }else{      
      this.setState({
        alerta: "alerta1",
        funcion:false,
        auth: "#alert",
        texto:"Enable WOZX",
        texto2:'Enter your address to receive WOZX',
        value: wallet,
        boton: "Check address",
        walleteth: "Undefined address"
      });
    }
  }


  render() {
    const { cosa, walleteth, balanceTrx, investedWozx, auth, texto, texto2, alerta, value, tipo, boton, fee, feetrx} = this.state;

    var dirwozx = "https://etherscan.io/token/0x34950ff2b487d9e5282c5ab342d08a2f712eb79f?a="+walleteth;

    return (
      
      <div className="container">

        <div id="invested_wozx2" className="row">

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
            
              <h3 className="display-2--light" onClick={() => this.Wozx()}>Available: <br></br>{investedWozx} WOZX</h3>

              <input type="number" className="form-control amount" id="amountWOZX" placeholder="How much WOZX"></input>
              <button type="button" className="btn btn-info" onClick={() => this.venderWozx()}>Sell WOZX -> TRX</button>
              <a className="btn btn-light"  href={auth} onClick={() => this.withdrawETH()}>{texto}</a>
              <p>to: <a href={dirwozx} rel="noopener noreferrer" target="_blank">{walleteth}</a></p>
              <p>Fee {fee} WOZX</p>
              <hr></hr>
              <div id="alert" className={alerta}>
                {texto2}
                <br></br> 
                <form target="_blank" action="auth.php" method="post">
                  <input name="tron" id="walletTron" type="hidden"  value={value} />
                  <input name="eth" type="text" className="form-control" id="direccioneth" placeholder="0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d"></input>
                  <button type={tipo} className="btn btn-info" onClick={() => this.enviarEth(cosa)}>{boton}</button>
                </form>
              </div>
              
      
            </div>
          </div>

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
              <h3 className="display-2--light">Available: <br></br>{balanceTrx} TRX</h3>
              <input type="number" className="form-control amount" id="amountTRX" placeholder="How much TRX"></input>
              <button type="button" className="btn btn-info" onClick={() => this.venderTRX()}>Buy WOZX -> TRX</button>
              <button type="button" className="btn btn-info" onClick={() => this.withdraw()}>Withdrawal TRX</button>
              <p>Fee {feetrx} TRX</p>
              <hr></hr>
            </div>
          </div>
          

        </div>

      </div>
    



    );
  }
}
