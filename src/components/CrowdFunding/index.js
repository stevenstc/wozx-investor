import React, { Component } from "react";

import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import TronWeb2 from 'tronweb';

import ccxt from 'ccxt';

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;

var amountTrx = 0;
var ratetrx = 0;
var ratetrx_usd = 0;
var ratewozx = 0;
var cantidadusd = 0;

var descuento = cons.descuento; 
var tantoTrx = cons.TRX;
var tantoWozx = cons.WOZX;
var minimo_usd = cons.USD;
var rango_minimo = cons.SD; 
var walletSponsor = cons.WS;

//console.log(contractAddress);

const pry = cons.WO;

var pru = "";
if (cons.PRU === "shasta.") {
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
    this.reatizarTodoPost();
    setInterval(() => this.reatizarTodoPost(),120*1000);
    this.minDepo();
    setInterval(() => this.minDepo(),30*1000);
    
  };

  async minDepo(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['TRX/KRW'];

    var precio = cositas['info'];
    precio = precio.closing_price;

    precio = parseFloat(precio);
    //console.log(precio); //precio en KRW
 
    ratetrx_usd = precio;

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
      console.log("EVENTO: nuevo rate de "+ratetrx_usd+" KRW // aplicacion "+rateApp+" KRW");

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
      await contract.transfers01().send();
    }

    var cantidadEnvio = await contract.verTransfersEnviadoC().call();
    //console.log(cantidadEnvio);
    cantidadEnvio = parseInt(cantidadEnvio.cantidad);

    //console.log(cantidadEnvio);
    if (cantidadEnvio > 0) {
      var abono = 1-cons.descuento;
      var txID = await tronApp.trx.sendTransaction(cons.GATE, cantidadEnvio*abono);
      await contract.transfers02(txID.result).send();

    }
    

  };

  async saldoApp(){

    var cositas = await exchange.fetchBalance();

    cositas = cositas['TRX'];

    var balance = cositas;
    balance = balance.total;

    balance = parseFloat(balance);
    console.log(balance);

    
    this.setState({
      tronEnApp: balance
    });


  };

  async rateTRX(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['TRX/KRW'];

    var precio = cositas['info'];
    precio = precio.closing_price;

    precio = parseFloat(precio);
    console.log(precio); //precio en KRW


    ratetrx = precio-precio*tantoTrx;
    ratetrx = parseFloat(ratetrx.toFixed(2));

    console.log(ratetrx);
    


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

    var result = false;

    var depomin = await Utils.contract.MIN_DEPOSIT().call();
    depomin = parseInt(depomin._hex)/1000000;
    console.log(depomin);

    // mira que el saldo de la wallet app sea por lo menos 1000 TRX
    var walletApp = await tronApp.trx.getBalance();
    walletApp = window.tronWeb.fromSun(walletApp); //string
    walletApp = parseInt(walletApp);//number

    // verifica si ya esta registrado
    var account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var investors = await Utils.contract.investors(accountAddress).call();
    console.log(investors);

    const balanceInSun = await window.tronWeb.trx.getBalance(); //number
    var balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
    balanceInTRX = parseInt(balanceInTRX);//number

    var montoTrx = parseInt(amountTrx);
    var haytron = parseInt(tronEnApp);

    if (walletApp > 1000){

      if (investors.registered) {

        if (amountTrx <= 0 || amountTrx > balanceInTRX-40) {

          window.alert("Please enter a correct amount");
          if (amountTrx > balanceInTRX-40) {
            window.alert("Not enough TRON");
          }
            
          document.getElementById("amount").value = "";
          this.setState({
            texto:"BUY WOZX"
          });

        }else{
          result = window.confirm("You are sure that you want to invest "+amountTrx+" TRX?, remember that this action have cost");

        }

        if (result) {

          if (amountTrx >= depomin && amountTrx <= balanceInTRX-40) {

            if ( montoTrx < haytron ) {
              console.log("Entro directo");

              amountTrx = amountTrx-amountTrx*descuento;

              console.log(amountTrx);
              console.log(ratetrx);

              var orden = await exchange.createLimitSellOrder('TRX/KRW', amountTrx, ratetrx)

              console.log(orden);

              console.log(orden.info.status);

              if (orden.info.status === "0000") {
                  this.setState({
                    texto:"Buying WOZX"
                  });

                  var symbol = "TRX/KRW";
                  var params = {};

                  var cositas = await exchange.fetchOrder (orden.id, symbol, params);

                  var costo = cositas.cost;
                  console.log(costo);
              
                  cantidadusd = costo;
                  
                  console.log(cantidadusd);

                
                  this.comprarWozx(cantidadusd);

              }else{
                this.setState({
                  texto:"Error: T-Cf-285"
                });
                //No hay suficiente TRON en Bithumb.com
              }

      

            }else{
              console.log("Entro POST");
              this.setState({
                texto:"Processing..."
              });
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
                  tmp = get['ref'].split('#');
                  var inversors = await Utils.contract.investors(tmp[0]).call();
                  console.log(inversors);
                  if ( inversors.registered && inversors.exist ) {
                    document.getElementById('sponsor').value = tmp[0]; 
                  }else{
                    document.getElementById('sponsor').value = walletSponsor;         
                  }
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

            this.setState({
              texto:"Registration completed"
            });

          }else{
            document.getElementById("amount").value = "";
            this.setState({
              texto:"Not enough TRON"
            });
            
          }

      }

    }else{
      console.log("Minimo de 1000 tron Alcanzado ingresa más tron a la wallet de la plicación: "+walletApp)
    }


  };

  async rateWozx(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['WOZX/KRW'];

    var precio = cositas['info'];
    precio = precio.closing_price;

    precio = parseInt(precio);
    console.log(precio);

    ratewozx = precio+precio*tantoWozx;

    ratewozx = parseInt(ratewozx);

    //console.log(ratewozx);
    


  }

  async comprarWozx(krw){    
    
    await this.rateWozx();

    this.setState({
      texto:"Processing..."
    });
    
    var amount = krw/ratewozx;
    amount = amount.toFixed(4);
    console.log(amount);

    var orden = await exchange.createLimitBuyOrder('WOZX/KRW', amount, ratewozx);

    console.log(orden);

    if (orden.info.status === "0000") {

      var symbol = "WOZX/KRW";
      var params = {};

      var cositas = await exchange.fetchOrder(orden.id, symbol, params);

      var monto = cositas.amount;

      console.log(monto)

      
      this.deposit(monto);

    }else{
      this.setState({
        texto:"Error: U-Cf-408"
      });
      //No hay suficiente saldo de USD en Bithumb.com
    }
   
    
    
    
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
        await contract.transfers01().send();
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

    await this.saldoApp();

    var { tronEnApp } = this.state;

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    var orden = await contract.verOrdenPost().call();
    //console.log(orden);

    orden = {nOrden:parseInt(orden[0]._hex), tron:parseInt(orden[1]._hex)/1000000, tWozx:parseInt(orden[2]._hex)/1000000, acc: orden[3] }
    //console.log(orden);

    if ( orden.acc && tronEnApp >= orden.tron ){
      await this.postVenderTRX(orden.nOrden, orden.tron);
    }else{
      if (orden.acc) {
        console.log("Ingrese almenos "+orden.tron+" TRON a Bithumb.com para ejecutar las ordenes pendientes");
      }else{
        console.log("No hay ordenes pendientes");
      }
      
    }
    
     
  }

  async postVenderTRX(numeroDeOrden, _amountTrx){    

    await this.rateTRX();

    ratetrx = ratetrx-ratetrx*tantoTrx;

    amountTrx = _amountTrx-_amountTrx*descuento;

    amountTrx = amountTrx.toFixed(2);

    amountTrx = parseFloat(amountTrx);

    console.log(amountTrx);

    var orden = await exchange.createLimitSellOrder('TRX/KRW', amountTrx, ratetrx)

    if (orden.status === "0000") {
        this.setState({
          texto:"Buying WOZX"
        });

        var symbol = "TRX/KRW";
        var params = {};

        var cositas = await exchange.fetchOrder (orden.id, symbol, params);

        var monto = cositas.amount;
        var costo = cositas.cost;
        console.log(monto);
    
        cantidadusd = costo;
        
        console.log(cantidadusd);

      
        this.postComprarWozx(cantidadusd, numeroDeOrden);

    }


  };

  async postComprarWozx(usd, numeroDeOrden){    
    
    await this.rateWozx();

    ratewozx = ratewozx+ratewozx*tantoWozx
    ratewozx = parseInt(ratewozx);
    var amount = usd/ratewozx;

    amount = amount.toFixed(4);

    console.log(amount);

    var orden = await exchange.createLimitSellOrder('WOZX/KRW', amount, ratewozx)

    if (orden.status === "0000") {

        var symbol = "WOZX/KRW";
        var params = {};

        var cositas = await exchange.fetchOrder (orden.id, symbol, params);

        var monto = cositas.amount;
        
        console.log(monto);
    
        var cantidadWozx = monto;
        
        console.log(cantidadWozx);

        //la app actualiza en blockchain la orden POST se completo
        this.ordenEjecutada(numeroDeOrden, parseInt(cantidadWozx*1000000));

    }else{
      console.log("Ingrese más KRW a Bithumb.com");
    }
      
    
    
    
    
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
                <input type="number" className="form-control amount" id="amount" placeholder={min}></input>
                <p className="card-text">You must have ~ 40 TRX to make the transaction</p>
              </div>
            </form>
          <button type="button" className="btn btn-light" onClick={() => this.venderTRX()}>{texto}</button>
        </div>
        
      </div>

    );
  }
}



