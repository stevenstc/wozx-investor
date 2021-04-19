import React, { Component } from "react";
import Utils from "../../utils";
import TronWeb2 from 'tronweb';
import ccxt from 'ccxt';

import contractAddress from "../Contract";
import cons from "../../cons.js";

const delay = ms => new Promise(res => setTimeout(res, ms));

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;

var amountTrx = 0;
var ratetrx = 0;
var ratewozx = 0;

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

export default class CrowdFunding extends Component {
  constructor(props) {
    super(props);

    this.state = {
      direccionTRX: "",
      informacionCuenta: {},
      amountTrx: "",
      usdtrx: "",
      min: 3000,
      texto: "Deposit TRX",
      tronEnApp: 0,
      priceUSDTRON: 0

    };

    this.deposit = this.deposit.bind(this);
    this.rateWozx = this.rateWozx.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.venderTRX = this.venderTRX.bind(this);

    this.minDepo = this.minDepo.bind(this);
    this.rateT = this.rateT.bind(this);
    this.saldoApp = this.saldoApp.bind(this);

    this.consultarTodosUsuarios = this.consultarTodosUsuarios.bind(this);
    this.registrarUsuario = this.registrarUsuario.bind(this);
    this.consultarUsuario = this.consultarUsuario.bind(this);
    this.actualizarUsuario = this.actualizarUsuario.bind(this);

    this.actualizarDireccion = this.actualizarDireccion.bind(this);
    this.consultarTransaccion = this.consultarTransaccion.bind(this);



  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.minDepo();
    setInterval(() => this.minDepo(),29*1000);
    setInterval(() => this.actualizarDireccion(),4*1000);
    await this.actualizarDireccion();
    await this.consultarUsuario(this.state.direccionTRX,false);
    setInterval(() => this.consultarUsuario(this.state.direccionTRX,false),5*1000);

  };

  async actualizarDireccion() {

    document.getElementById("linkContrato").innerHTML = "<a class='smoothscroll'   href='https://"+pru+"tronscan.org/#/contract/"+contractAddress+"/code' target='_blank' rel='noopener noreferrer'>Contract</a>";

    var account =  await window.tronWeb.trx.getAccount();
    account = window.tronWeb.address.fromHex(account.address);

    this.setState({
      direccionTRX: account
    });

  };

  async consultarTransaccion(id){

    this.setState({
      texto: "Updating balance..."
    });
    await delay(3000);
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'consultar/transaccion/'+id;

    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)});
    const json = await response.json();

    return json.result;

  };

  async rateT(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'precio/usd/trx';
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();
    //console.log(json);

    return json.data.tron.usd;


  };

  async consultarTodosUsuarios(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'consultar/todos';
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();

    return json;

  };

  async consultarUsuario(direccionTRX, otro){

    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'consultar/'+direccionTRX;
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();

    if (!otro) {
      this.setState({
        informacionCuenta: json
      });
      return json;
    }else{
      return json;
    }

  };

  async actualizarUsuario( datos, otro ){
    //Asegura que es el usuario conectado con tronlink
    await this.actualizarDireccion();
    var { direccionTRX } = this.state;
    //encaso de recibir otro usiario se escoge el uasuario enviado para ser actualizado
    if ( otro ) {
      direccionTRX = otro;
    }

    datos.token = cons.MT;
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'actualizar/'+direccionTRX;
    const response = await fetch(proxyUrl+apiUrl, {
       method: 'POST',
       headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
       body: JSON.stringify(datos)
    })
    .catch(error =>{console.error(error)})
    const json = await response.json();

    return json;

  };

  async registrarUsuario(datos){
    //Asegura que es el usuario conectado
    var { direccionTRX } = this.state;
    //console.log(direccionTRX);
    datos.token = cons.MT;
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'registrar/'+direccionTRX;
    const response = await fetch(proxyUrl+apiUrl, {
       method: 'POST',
       headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
       body: JSON.stringify(datos)
    })
    .catch(error =>{console.error(error)})
    const json = await response.json();
    console.log(json);
    return true;


  };

  async minDepo(){

    var priceUSDTRON = await this.rateT();

    var mini = parseInt(minimo_usd/priceUSDTRON);

    var mindepo = await Utils.contract.MIN_DEPOSIT().call();
    mindepo = parseInt(mindepo._hex)/1000000;

    if ( mini > 0 && mindepo !== mini && ( ( mindepo >= mini+mini*rango_minimo) || ( mindepo <= mini-mini*rango_minimo) ) ) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevoMinDeposit( mini * 1000000 ).send();
      this.setState({
        min: mini+1,

      });
      console.log("EVENTO: Nuevo minimo de deposito "+mini+" TRX // anterior "+mindepo+" TRX");

    }else{
      this.setState({
        min: mindepo+1,
      });
      console.log("INFO: Minimo de deposito "+mini+" TRX // aplicación "+mindepo+" TRX");
    }

    var COMISION_TRON = await Utils.contract.COMISION_TRON().call();
    COMISION_TRON = parseInt(COMISION_TRON._hex)/1000000;

    if ( COMISION_TRON > 0 && COMISION_TRON !== cons.FEET ) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevaComisionTron( cons.FEET * 1000000 ).send();
      console.log("EVENTO: Nueva comision TRON "+cons.FEET +" TRX // anterior "+COMISION_TRON+" TRX");

    }

    var COMISION_WOZX = await Utils.contract.COMISION_WOZX().call();
    COMISION_WOZX = parseInt(COMISION_WOZX._hex)/1000000;

    if ( COMISION_WOZX > 0 && COMISION_WOZX !== cons.FEEW ) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevaComisionWozx( cons.FEEW * 1000000 ).send();
      console.log("EVENTO: Nueva comision WOZX "+cons.FEEW +" WOZX // anterior "+COMISION_WOZX+" WOZX");

    }

    var COSTO_REGISTRO = await Utils.contract.COSTO_REGISTRO().call();
    COSTO_REGISTRO = parseInt(COSTO_REGISTRO._hex)/1000000;

    if ( COSTO_REGISTRO > 0 && COSTO_REGISTRO !== cons.CR ) {

      let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
      await contract.nuevoCostoRegistro( cons.CR * 1000000 ).send();
      console.log("EVENTO: Nuevo costo de registro "+cons.CR +" TRX // anterior "+COSTO_REGISTRO+" TRX");

    }

    await this.actualizarDireccion();// asegura que es la wallet conectada con el tronlik
    var { direccionTRX } = this.state;
    await this.consultarUsuario(direccionTRX,false);
    var { informacionCuenta } = this.state;

    if (!informacionCuenta.registered) {
      document.getElementById("amount").value = "";
      this.setState({
        texto:"Click to register"
      });
    }else{
      this.setState({
        texto:"Deposit TRX"
      });
    }

  };

  async saldoApp(){

    var consulta = await exchange.fetchBalance();

    var balance = parseFloat(consulta['TRX'].free);

    this.setState({
      tronEnApp: balance
    });


  };

  async rateTRX(){

    var consulta = await exchange.loadMarkets();

    consulta = consulta['TRX/KRW'];

    consulta = consulta['info'].closing_price;

    var precio = parseFloat(consulta);
    //console.log(precio); //precio en KRW

    ratetrx = precio-precio*tantoTrx;
    ratetrx = parseFloat(ratetrx.toFixed(2));

    //console.log(ratetrx);

    return ratetrx;



  };

  async venderTRX(){

    await this.saldoApp();
    await this.rateTRX();

    this.setState({
      texto:"Please wait"
    });

    // verifica el monto sea mayor a minimo
    amountTrx = document.getElementById("amount").value;
    amountTrx = parseFloat(amountTrx);

    var result = false;
    var depomin = await Utils.contract.MIN_DEPOSIT().call();
    depomin = parseInt(depomin._hex)/1000000;

    // mira que el saldo de la wallet app sea por lo menos 1000 TRX
    var walletApp = await tronApp.trx.getBalance();
    walletApp = window.tronWeb.fromSun(walletApp); //string
    walletApp = parseInt(walletApp);//number

    // verifica si ya esta registrado
    await this.actualizarDireccion();// asegura que es la wallet conectada con el tronlik
    var { direccionTRX } = this.state;
    await this.consultarUsuario(direccionTRX,false);
    var { informacionCuenta } = this.state;

    const balanceInSun = await window.tronWeb.trx.getBalance(); //number
    var balanceInTRX = window.tronWeb.fromSun(balanceInSun); //string
    balanceInTRX = parseInt(balanceInTRX);//number

    var account =  await window.tronWeb.trx.getAccount();
    account = window.tronWeb.address.fromHex(account.address);

    var investor = await Utils.contract.investors(account).call();

    investor.tronEntrante = parseInt(investor.tronEntrante._hex)/1000000;
    investor.tronDisponible = parseInt(investor.tronDisponible._hex)/1000000;
    investor.tronRetirado = parseInt(investor.tronRetirado._hex)/1000000;
    investor.wozxEntrante = parseInt(investor.wozxEntrante._hex)/1000000;
    investor.wozxDisponible = parseInt(investor.wozxDisponible._hex)/1000000;
    investor.wozxRetirado = parseInt(investor.wozxRetirado._hex)/1000000;
    //console.log(investor);

    if (walletApp > cons.MA){

      if (informacionCuenta.registered) {

        if (amountTrx <= 0 || amountTrx > balanceInTRX-cons.CE || isNaN(amountTrx)) {

          if ( amountTrx <= 0 || isNaN(amountTrx) ) {
            window.alert("Please enter a correct amount");
          }

          if (amountTrx > balanceInTRX-cons.CE) {
            window.alert("You not enough TRON");
          }

          document.getElementById("amount").value = "";
          this.setState({
            texto:"Deposit TRX"
          });

        }else{

          result = window.confirm("You are sure that you want to invest "+amountTrx+" TRX?, remember that this action have cost");

        }

        if (result) {

          if (amountTrx >= depomin && amountTrx <= balanceInTRX-cons.CE) {

            informacionCuenta.registered = investor.registered;
            informacionCuenta.balanceTrx = investor.tronDisponible;
            informacionCuenta.investedWozx = investor.wozxDisponible;
            informacionCuenta.withdrawnTrx = investor.tronEntrante-investor.tronDisponible;
            informacionCuenta.withdrawnWozx = investor.wozxEntrante-investor.wozxDisponible;

            await this.actualizarUsuario( informacionCuenta, null );

            this.deposit(amountTrx);
          }

        }else{
          if ( depomin >= amountTrx ){
            this.setState({
              texto:"Enter a higher amount"
            });
          }

          if (balanceInTRX-cons.CE <= amountTrx ){
            this.setState({
              texto:"Not enough TRON"
            });
          }

        }

      }else{
        if ( balanceInTRX >= 100) {
            //registra a la persona con los referidos
            var sponsor = walletSponsor;
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

                  var infoSponsor = await this.consultarUsuario(tmp[0],true);

                  if ( infoSponsor.registered ) {
                    sponsor = tmp[0];
                  }
                }
            }

            document.getElementById("amount").value = cons.CR;

            await this.actualizarDireccion();
            direccionTRX = this.state;

            var amount = parseInt(cons.CR * 1000000);

            var pago = false;

             if ( !investor.registered ) {
               var id = await Utils.contract.miRegistro().send({ callValue: amount});
               await delay(3000);
               pago = await this.consultarTransaccion(id);
             }else{
               pago = true;
               id = "#"
             }

            if(pago) {

              await this.registrarUsuario({ sponsor: sponsor, id: id });

              await this.actualizarDireccion();// asegura que es la wallet conectada con el tronlik
              direccionTRX = this.state;
              await this.consultarUsuario(direccionTRX,false);
              informacionCuenta = this.state;

              if ( investor.registered ) {

                this.setState({
                  texto:"Syncing with blockchain"
                });

                await delay(3000);

                informacionCuenta.registered = investor.registered;
                informacionCuenta.balanceTrx = investor.tronDisponible;
                informacionCuenta.investedWozx = investor.wozxDisponible;
                informacionCuenta.withdrawnTrx = investor.tronEntrante-investor.tronDisponible;
                informacionCuenta.withdrawnWozx = investor.wozxEntrante-investor.wozxDisponible;

                await this.actualizarUsuario( informacionCuenta, null );
              }

              document.getElementById("amount").value = "";
              this.setState({
                texto:"Registration completed"
              });
              await delay(1000);
               var t = 3;
              setInterval(() => {
                this.setState({
                  texto:"Reload in: "+t
                });
                t--;
              },1*1000);

              setInterval(() => document.location.reload(),3*1000);

            }else{
            document.getElementById("amount").value = "";
            this.setState({
              texto:"Not enough TRON or cancelled"
            });

          }


        }else{
          window.alert("You wallet will has 100 trx to do the register");
        }
      }
    }else {
      window.alert("Please contact the administrator Code: IMT-E-WA");
      // IMT-E-WA = Ingrese Mas Tron En la  Wallet de la Aplicación.
      console.log("Minimo de 1000 tron Alcanzado ingresa más tron a la wallet de la plicación: "+cons.SC)
    }


  };

  async rateWozx(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['WOZX/KRW'];

    var precio = cositas['info'].closing_price;

    precio = parseInt(precio);
    console.log(precio);

    ratewozx = precio+precio*tantoWozx;

    ratewozx = parseInt(ratewozx);


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

    }else{
      this.setState({
        texto:"Error: U-Cf-408"
      });
      //No hay suficiente saldo de USD en Bithumb.com
    }




  }


  async deposit(amountTrx) {

    let amount = amountTrx;

    this.setState({
      texto:"Reciving TRON"
    });

    amount = parseInt(amount * 1000000);

    var id = await Utils.contract.depositoTron().send({callValue:amount});
    await delay(3000);
    var pago = await this.consultarTransaccion(id);

    if ( pago ) {

      var valor = 1-cons.descuento;

      console.log(await tronApp.trx.sendTransaction(cons.EX, amount*valor));

      amount = amount/1000000;

      var { informacionCuenta } = this.state;

      informacionCuenta.balanceTrx += amount;

      informacionCuenta.historial.push({
          tiempo: Date.now(),
          valor: amount,
          moneda: 'TRX',
          accion: 'Deposit to plataform',
          link: id

      })

      var otro = null;

      await this.actualizarUsuario( informacionCuenta, otro );

      this.setState({
        texto:"Deposit is done!"
      });

      await delay(3000);

      this.setState({
        texto:"Deposit TRX"
      });

    }else{

      this.setState({
        texto:"Failed!"
      });
    }

    document.getElementById("amount").value = "";


  };

  render() {
    var { min, texto} = this.state;

    min = "Min. deposit "+min+" TRX";

    return (

      <div className="card wow bounceInUp">
        <div className="card-body">
        <header className="section-header">
              <h3>Make a deposit</h3>
          </header>
            <form>
              <div className="form-group">
                <input type="number" className="form-control amount" id="amount" placeholder={min}></input>
                <p className="card-text">You must have ~ 40 TRX to make the transaction</p>
              </div>
            </form>
          <button type="button" className="btn btn-light" style={{'backgroundColor': 'green','color': 'white','borderBlockColor': 'green'}} onClick={() => this.venderTRX()}>{texto}</button>
        </div>

      </div>

    );
  }
}
