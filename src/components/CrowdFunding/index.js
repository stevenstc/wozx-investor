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

var descuento = 0.002; //+ 0.30;// + 0.30|<- se resta para comprar el 70% en wozx para los usuarios
var tantoTrx = 0.02;// para que el TRX se Venda de inmediato
var tantoWozx = 0.06;// para que el WOZX se Compre de inmediato
var minimo_usd = 1;// (100) para dolares (100 USD)
var rango_minimo = 0.1; // 10% de sensibilidad para modificar el precio minimo de inversion
var walletSponsor = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";//T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb
var proxyUrl = cons.proxy;

//console.log(contractAddress);

var AccessOrigin = '*';

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
      amountTrx: "",
      usdtrx: "",
      min: 3000,
      texto: "Buy WOZX",
      tronEnApp: 0

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
    this.saldoApp = this.saldoApp.bind(this);

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
      min: mindepo+1,
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

    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);
    var investors = await Utils.contract.investors(accountAddress).call();

    if (!investors.registered) {
      document.getElementById("amount").value = "";
      this.setState({
        texto:"Click to register"
      });
    }else{
      this.setState({
        texto:"Buy WOZX"
      });
    }
    const contract = await tronApp.contract().at(contractAddress);
    var transPe = await contract.verTransfersPendientes().call();
    transPe.valor = parseInt(transPe.valor._hex);
    //console.log(transPe.valor_hex)
    if (transPe.valor > 0) {
      await contract.transfers().send();
    }
    

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

      if (investors.registered) {

        var montoTrx = parseInt(amountTrx);
        var haytron = parseInt(tronEnApp);
        if (amountTrx >= depomin) {
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
            console.log(data);
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
          this.setState({
            texto:"Enter a higher amount"
          });

        }

      }else{
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

    let amount = document.getElementById("amount").value;
    document.getElementById("amount").value = "";

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
    
      var sidep = await Utils.contract.deposit().send({
        shouldPollResponse: true,
        callValue: amount * 1000000 // converted to SUN
      });

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

    
  };

  async deposit2() {

    await this.rateWozx();
    await this.rateTRX();

    let amount = document.getElementById("amount").value;
    document.getElementById("amount").value = "";

    this.setState({
      texto:"Don't close the window"
    });

    await Utils.contract.depositPost().send({
      callValue: amount * 1000000 // converted to SUN
    });

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
    
  };

  async reatizarTodoPost(){

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    var orden = await contract.verOrdenPost().call();
    //console.log(orden);

    orden = {nOrden:parseInt(orden[0]._hex), tron:parseInt(orden[1]._hex)/1000000, tWozx:parseInt(orden[2]._hex)/1000000, acc: orden[3] }
    console.log(orden);

    if (orden.acc){
      await this.postVenderTRX(orden.nOrden, orden.tron);
    }
    
     
  }

  async postVenderTRX(numeroDeOrden, _amountTrx){    

    await this.rateTRX();

    ratetrx = ratetrx-ratetrx*tantoTrx;

    amountTrx = _amountTrx*ratetrx;
    amountTrx = amountTrx-amountTrx*descuento;

    ratetrx = ratetrx.toString();
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
      console.log(data);
      var cantidadTrx=parseFloat(data.filledAmount);
      var cantidadTrx2=parseFloat(data.leftAmount);
      cantidadTrx=cantidadTrx+cantidadTrx2;
      var precioTrx=parseFloat(data.filledRate);
      cantidadusd = precioTrx*cantidadTrx;
      cantidadusd = cantidadusd-cantidadusd*parseFloat(data.feeValue);
      console.log(cantidadusd);

      if (data.result === "true") {
        this.postComprarWozx(cantidadusd, numeroDeOrden);
      }else{
        console.log("Ingrese más TRON a Gate.io");
      }

    })
    .catch(error => console.log('Error:', error));

  };

  async postComprarWozx(usd, numeroDeOrden){    
    
    await this.rateWozx();

    ratewozx = ratewozx+ratewozx*tantoWozx
    var amount = usd/parseFloat(ratewozx).toFixed(6);

    console.log(amount);

    amount = amount.toString();
    ratewozx = ratewozx.toString();

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

      console.log(cantidadWozx);

      if (data.result === "true") {
        //la app actualiza en blockchain la orden POST se completo
        this.ordenEjecutada(numeroDeOrden, parseInt(cantidadWozx*1000000));
      }else{
        console.log("Ingrese más USD a Gate.io");
      }
      
    })
    .catch(error => console.log('Error:', error));
    
    
    
  };

  async ordenEjecutada(numeroDeOrden, cantidadWozx){

    // se emite que la orden POST ya fue ejecutada

    let contract = await tronApp.contract().at(contractAddress);
    await contract.fillPost(numeroDeOrden, cantidadWozx).send();

    console.log("Orden POST N°: "+numeroDeOrden+" se ejecutó exitosamente por: "+cantidadWozx/1000000+"WOZX");
  
  }

  render() {
    var { min, texto} = this.state;

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
          <button type="button" className="btn btn-light" onClick={() => this.venderTRX()}>{texto}</button>
        </div>
        
      </div>

    );
  }
}



