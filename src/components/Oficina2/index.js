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

var ratetrx = "";
var ratewozx = "";
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
    this.enviarEth = this.enviarEth.bind(this)
    
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

  async rateWozx(){

    function esWozx(cripto) {
          return cripto.symbol === 'WOZX';
      }

    const USER_AGENT = 'stevenSTC';
    let header1 = {
      'Access-Control-Allow-Origin' :'*',
      'User-Agent' : USER_AGENT,
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With'
    };
    await fetch(proxyUrl+'https://data.gateio.life/api2/1/marketlist',{method: 'GET', headers: header1})
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      ratewozx = data.data.find(esWozx).rate; 
      ratewozx = parseFloat(ratewozx).toFixed(6);
      ratewozx = ratewozx - ratewozx*tantoWozx;
      ratewozx = ratewozx.toString();
      //console.log(ratewozx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratewozx: ratewozx
    });

  }

  async venderWozx(){   
    await this.rateWozx();
    ratewozx = ratewozx-ratewozx*tantoWozx;
    const {investedWozx} = this.state;
    
    let amount = investedWozx; 

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
      cantidadusd = cantidadusd-cantidadusd*parseFloat(data.feeValue);
      if (data.result === "true") {
        console.log(cantidadusd)
        this.comprarTRX(cantidadusd);
      }
    })
    .catch(error => console.log('Error:', error));
    

  }

  async rateTRX(){

    function esTrx(cripto) {
          return cripto.symbol === 'TRX';
      }

    const USER_AGENT = 'stevenSTC';
    let header1 = {
      'Access-Control-Allow-Origin' :'*',
      'User-Agent' : USER_AGENT,
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With'
    };
    await fetch(proxyUrl+'https://data.gateio.life/api2/1/marketlist',{method: 'GET', headers: header1})
    .then(res => res.json())
    .then(data => {
      //console.log(data);
      ratetrx = data.data.find(esTrx).rate; 
      ratetrx = parseFloat(ratetrx);
      ratetrx = ratetrx+ratetrx*tantoTrx;
      ratetrx = ratetrx.toString();
      console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratetrx: ratetrx
    });

  }

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
      cantidadTrx = cantidadTrx-cantidadTrx*parseFloat(data.feeValue);
      
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
    console.log("se envio "+trx+" tron a "+wallet+" exitosamente")

    let amount = trx;

    amount = amount.toString();
    let currency = "trx";

    // envia el saldo necesario a la direccion del contrato
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
    await Utils.contract.withdraw().send()
  };

  async withdrawETH(){

    async function sacarwozx(){
      
      this.setState({
        texto: "successful withdrawal"
      });
      await Utils.contract.retirarWozx().send();
    }
    
    const { funcion, investedWozx, fee } = this.state;
    if (funcion) {
      if (investedWozx > fee) {
        let amount = investedWozx-fee+3.6;
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
            sacarwozx();
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
            
              <h3 className="display-2--light">Available: <br></br>{investedWozx} WOZX</h3>
  
              <button type="button" className="btn btn-info" onClick={() => this.venderWozx()}>Sell all WOZX (TRX)</button>
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
              <button type="button" className="btn btn-info" onClick={() => this.withdraw()}>withdrawal TRX</button>
              <p>Fee {feetrx} TRX</p>
              <hr></hr>
            </div>
          </div>
          

        </div>

      </div>
    



    );
  }
}
