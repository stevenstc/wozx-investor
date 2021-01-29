import React, { Component } from "react";

import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import querystring from 'querystring';
import sha512 from 'sha512';
import TronWeb2 from 'tronweb';

var amountTrx;
var ratetrx = "";
var ratetrx_usd = "";
var ratewozx = "";
var cantidadusd = "";

var descuento = 0.002 //+ 0.30;// + 0.30|<- se resta para comprar el 70% en wozx para los usuarios
var tantoTrx = 0.02;// para que el TRX se Venda de inmediato
var tantoWozx = 0.06;// para que el WOZX se Compre de inmediato
var minimo_usd = 1;// (100) para dolares (100 USD)
var rango_minimo = 0.1; // 10% de sensibilidad para modificar el precio minimo de inversion

var proxyUrl = 'https://proxy-wozx.herokuapp.com/';

var AccessOrigin = '*';

const KEY  = cons.AK;
const SECRET  = cons.SK;
const pry = cons.WO;


const TRONGRID_API = "https://api.shasta.trongrid.io";

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
      amountTrx: "",
      usdtrx: "",
      min: 3000,
      alerta: "alerta0",
      texto: ""

    }

    this.deposit = this.deposit.bind(this);
    this.deposit2 = this.deposit2.bind(this);
    this.rateWozx = this.rateWozx.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
    this.postComprarWozx = this.postComprarWozx.bind(this);
    this.postVenderTRX = this.postVenderTRX.bind(this);
    this.reatizarTodoPost = this.reatizarTodoPost.bind(this);
    this.ordenEjecutada = this.ordenEjecutada.bind(this);
    this.minDepo = this.minDepo.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    await this.reatizarTodoPost();
    setInterval(() => this.reatizarTodoPost(),120*1000);
    await this.minDepo();
    setInterval(() => this.minDepo(),30*1000);
    
  };

  async minDepo(){

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
      ratetrx_usd = data.data.find(esTrx).rate; 
      ratetrx_usd = parseFloat(ratetrx_usd).toFixed(6);
      //console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));


    var mindepo = await Utils.contract.MIN_DEPOSIT().call();
    var rateApp = await Utils.contract.rateTRON().call();
    mindepo = parseInt(mindepo._hex)/1000000;
    rateApp = parseInt(rateApp._hex)/1000000;

    this.setState({
      min: mindepo,
      rateApp: rateApp
    });
    //console.log(mindepo);

    if (mindepo*ratetrx_usd >= minimo_usd+minimo_usd*rango_minimo || mindepo*ratetrx_usd <= minimo_usd-minimo_usd*rango_minimo) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevoMinDeposit(parseInt(minimo_usd/ratetrx_usd)).send();
      console.log("EVENTO: nuevo minimo de deposito "+parseInt(minimo_usd/ratetrx_usd)+" TRX")

    }

    if (rateApp >= ratetrx_usd+ratetrx_usd*rango_minimo || rateApp <= ratetrx_usd-ratetrx_usd*rango_minimo) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevoRatetron(parseInt(ratetrx_usd*1000000)).send();
      console.log("EVENTO: nuevo rate de TRX "+ratetrx_usd+" // "+rateApp);

    }


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


  }

  async venderTRX(){    

    this.setState({
      alerta: "alerta",
      texto:"Please wait, do not close this window, your investment is being processed"
    });

    await this.rateTRX();
    
    amountTrx = document.getElementById("amount").value;
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
      cantidadTrx=cantidadTrx+cantidadTrx2;
      var precioTrx=parseFloat(data.filledRate);
      cantidadusd = precioTrx*cantidadTrx-precioTrx*cantidadTrx*tantoTrx;
      //console.log(cantidadusd);

      if (data.result === "true") {
        this.setState({
          alerta: "alerta",
          texto:"Buying WOZX"
        });
        this.comprarWozx(cantidadusd);
      }else{
        // cantidad muy alta de TRX pendiente se ejecuta post recepcion de fondos
        this.deposit2();
      }

    })
    .catch(error => console.log('Error:', error));

    
  }

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
    
    let amount = usd/parseFloat(ratewozx).toFixed(6);
    //console.log(parseFloat(amount.toFixed(6)));
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

      console.log(cantidadWozx)
      var orden = window.tronWeb.sha3(data.orderNumber.toString());
      console.log(orden);
      if (data.result === "true") {
        this.deposit(cantidadWozx, orden);
        this.setState({
          alerta: "alerta0"
        });
      }else{
        // se crea una orden post para la compra de solo wozx 
        this.setState({
          alerta: "alerta",
          texto:"Your order is being processed, it may take up to 10 minutes, if you have problems, consult technical support"
        });
      }
    })
    .catch(error => console.log('Error:', error));
    
    
    
  }


  async deposit(orden, firma3) {

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

           document.getElementById('sponsor').value = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
        }
        
        
    }else{
      
        document.getElementById('sponsor').value = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'; 
    }

    let amount = document.getElementById("amount").value;
    let sponsor = document.getElementById("sponsor").value;
    

    document.getElementById("amount").value = "";

    orden = orden * 1000000;
    orden = parseInt(orden);
    //console.log(orden);
    var firma = await window.tronWeb.sha3(orden.toString())

    const account =  await window.tronWeb.trx.getAccount();
    const accountAddress = account.address;
    var firma2 = await window.tronWeb.sha3(accountAddress)
    var wallet = firma2;
    //console.log(firma2);

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato
    await contract.firmarTx(firma3).send();
  
    await Utils.contract.deposit(orden, orden.toString(), wallet, sponsor, firma, firma2, firma3).send({
      shouldPollResponse: true,
      callValue: amount * 1000000 // converted to SUN
    });

    
  };

  async deposit2() {

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

           document.getElementById('sponsor').value = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
        }
        
        
    }else{
      
        document.getElementById('sponsor').value = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb'; 
    }

    let amount = document.getElementById("amount").value;
    let sponsor = document.getElementById("sponsor").value;

    await Utils.contract.depositPost(sponsor).send({
      shouldPollResponse: true,
      callValue: amount * 1000000 // converted to SUN
    });

    await this.crearOrdenPost(amount);

    document.getElementById("amount").value = "";

    
  };

  async crearOrdenPost(amount){

    await this.rateWozx();
    await this.rateTRX();

    this.setState({
          alerta: "alerta",
          texto:"Your order is being processed, it may take up to 10 minutes"
        });

    var orden = amount*ratetrx+ratetrx*tantoTrx;
    orden = orden-orden*descuento;
    orden = orden / ratewozx+ratewozx*tantoWozx;
    orden = parseInt(orden*1000000);
    console.log(orden);
    console.log(amount);
    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);
    console.log(accountAddress);
    var rt = parseInt(ratetrx*1000000); 
    var rw = parseInt(ratewozx*1000000);
    var am = parseInt(amount*1000000);
    console.log(am);
    console.log(rt);
    console.log(rw);

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.ordenPost(accountAddress, am, rt, rw, orden).send();
    
  };

  async reatizarTodoPost(){

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    var orden = await contract.verOrdenPost().call();
    //console.log(orden);

    orden = {nOrden:parseInt(orden[0]._hex), tron:parseInt(orden[1]._hex)/1000000, rTron:parseInt(orden[2]._hex)/1000000, rWozx:parseInt(orden[3]._hex)/1000000, tWozx:parseInt(orden[4]._hex)/1000000 }
    console.log(orden);

    if (orden.tron > 0){
      this.postVenderTRX(orden.nOrden, orden.tron, orden.rTron, orden.rWozx)
    }
     
  }

  async postVenderTRX(numeroDeOrden, _amountTrx, nuevoRate1, nuevoRate2){    

    ratetrx = nuevoRate1;
    amountTrx = _amountTrx;
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
      cantidadTrx=cantidadTrx+cantidadTrx2;
      var precioTrx=parseFloat(data.filledRate);
      cantidadusd = precioTrx*cantidadTrx;
      //console.log(cantidadusd);

      if (data.result === "true") {
        this.postComprarWozx(cantidadusd, nuevoRate2, numeroDeOrden);
      }

    })
    .catch(error => console.log('Error:', error));

  };

  async postComprarWozx(usd, nuevoRate, numeroDeOrden){    
    

    ratewozx = nuevoRate;
    
    let amount = usd/parseFloat(ratewozx).toFixed(6);
    //console.log(parseFloat(amount.toFixed(6)));
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
      //console.log(data);

      var cantidadWozx=parseFloat(data.filledAmount);
      var cantidadWozx2=parseFloat(data.leftAmount);
      cantidadWozx=cantidadWozx+cantidadWozx2;

      console.log(cantidadWozx)
      //console.log(orden);
      if (data.result === "true") {
        //la app actualiza en blockchain la orden se completo
          
        this.ordenEjecutada(numeroDeOrden);
      }else{
        // se tiene que poner una orden post para comprar wozx, falta USD en la plataforma
      }
    })
    .catch(error => console.log('Error:', error));
    
    
    
  };

  async ordenEjecutada(numeroDeOrden){

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.ejecutarOrden(numeroDeOrden).send();
    console.log("Orden N°: "+numeroDeOrden+" se ejecutó exitosamente")
  }

  render() {
    var { min, alerta, texto } = this.state;

    //const alerta = "alerta";
    texto = (<><p>{texto}</p></>);
    
    
    

    min = "Min. deposit "+min+" TRX";
    
    return (
      
      <div className="card wow bounceInUp">
        <div className="card-body">
        <header className="section-header">
              <h3>Make your investment</h3>
          </header>
            <form>
              <div className="form-group">
                <input type="text" className="form-control" id="amount" placeholder={min}></input>
                <p className="card-text">You must have ~ 10 TRX to make the transaction</p>
              </div>
            </form>
          <a className="btn btn-light"  href="#invested_wozx" onClick={() => this.venderTRX()}>Buy WOZX</a>
        </div>
        <div className={alerta}>
          {texto}
        </div>
        
      </div>

    );
  }
}



