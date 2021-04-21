import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import TronWeb2 from 'tronweb';

import web3 from 'web3';

import ccxt from 'ccxt';

const delay = ms => new Promise(res => setTimeout(res, ms));

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.verbose = false;

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;

var tantoTrx = cons.TRX;// para que el TRX se Venda de inmediato

var amountTrx = 0;
var ratetrx = 0;
var ratewozx = 0;

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

export default class Oficina2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pago: false,
      ratetrx: "",
      ratewozx: "",
      tipo: "button",
      auth: "/auth.html",
      texto: "Loading...",
      texto3: "Buy WOZX <- TRX",
      texto4:"Sell WOZX -> TRX",
      fee: cons.FEEW,
      feetrx: cons.FEET,
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
    this.vereth = this.vereth.bind(this);
    this.reset = this.reset.bind(this);
    this.withdrawETH = this.withdrawETH.bind(this);
    this.enviarEth = this.enviarEth.bind(this);
    this.saldoApp = this.saldoApp.bind(this);
    this.Wozx = this.Wozx.bind(this);
    this.Tron = this.Tron.bind(this);
    this.rateT = this.rateT.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);

    this.consultarUsuario = this.consultarUsuario.bind(this);
    this.actualizarDireccion = this.actualizarDireccion.bind(this);
    this.actualizarUsuario = this.actualizarUsuario.bind(this);

    this.consultarTransaccion = this.consultarTransaccion.bind(this);
    this.repartirReferidos = this.repartirReferidos.bind(this);


  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    await this.Investors();
    await this.vereth();
    await this.enviarEth();
    setInterval(() => this.Investors(),2*1000);
    setInterval(() => this.vereth(),9*1000);
    setInterval(() => this.enviarEth(),3*1000);

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

    console.log(json);
    return json;

  };

  async repartirReferidos(datos){

      var body = {};
      body.token = cons.MT;
      body.datos = datos;
      var proxyUrl = cons.proxy;
      var apiUrl = cons.mongo+'referidos';
      const response = await fetch(proxyUrl+apiUrl, {
         method: 'POST',
         headers: {
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
         body: JSON.stringify(body)
      })
      .catch(error =>{console.error(error)})
      const json = await response.json();

      console.log(json);

  };

  async actualizarDireccion() {

    var account =  await window.tronWeb.trx.getAccount();
    account = window.tronWeb.address.fromHex(account.address);

    this.setState({
      direccionTRX: account
    });

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

      console.log(json);
      return json;
    }

  };

  async consultarTransaccion(id){

    this.setState({
      texto3: "Updating balance..."
    });
    await delay(3000);
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'consultar/transaccion/'+id;
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)});
    const json = await response.json();
    this.setState({
      texto3: "Buy WOZX <- TRX"
    });

    return json.result;

  };

  async Wozx (){

    const { investedWozx } = this.state;
    document.getElementById("amountWOZX").value = investedWozx;

  };

  async Tron (){

    const { balanceTrx } = this.state;
    document.getElementById("amountTRX").value = balanceTrx;

  };

  async saldoApp(){

    var consulta = await exchange.fetchBalance();

    var balance = parseFloat(consulta['TRX'].free);//balance trx en el exchange

    this.setState({
      tronEnApp: balance
    });

    return balance;

  };


  async rateTRX(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['TRX/KRW'];

    var precio = cositas['info'];
    precio = precio.closing_price;

    ratetrx = precio-precio*tantoTrx;
    ratetrx = parseFloat(ratetrx.toFixed(2));
    console.log(ratetrx)
    return ratetrx;

  };

  async rateT(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'precio/usd/trx';
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();
    //console.log(json);
    this.setState({
      priceUSDTRON: json.data.tron.usd
    });

    return json.data.tron.usd;




  };

  async venderTRX(){

    await this.saldoApp();
    await this.rateTRX();

    this.setState({
      texto3:"Please wait"
    });

    // verifica el monto sea mayor a minimo
    amountTrx = document.getElementById("amountTRX").value;
    amountTrx = parseFloat(amountTrx);
    var amountTrxsindescuento = amountTrx;

    var depomin = await Utils.contract.MIN_DEPOSIT().call();
    depomin = parseInt(depomin._hex)/1000000;
    // verifica si ya esta registrado
    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var investors = await Utils.contract.investors(accountAddress).call();
    //investors.
    console.log(investors);

    if ( amountTrx <= 0 || isNaN(amountTrx) || amountTrx > parseInt(investors.tronDisponible._hex )/1000000) {
      window.alert("Please enter a correct amount");
      document.getElementById("amountTRX").value = "";
      this.setState({
        texto3:"Buy WOZX <- TRX"
      });

    }else{
      var COMISION_RETIRO = await Utils.contract.COMISION_TRON().call();
      COMISION_RETIRO = parseInt(COMISION_RETIRO._hex)/1000000;
      window.alert("!!! WARNING, DON’T REFRESH OR CLOSE THE PAGE WHEN YOU ARE BUYING WOZX !!!");
      var result = window.confirm("You are sure you want to invest "+amountTrx+" TRX? this action cost "+COMISION_RETIRO+" TRX");
    }


    if ( result && investors.registered && parseInt(investors.tronDisponible)/1000000 >= amountTrx ) {
        if ( amountTrx >= depomin ) {
          amountTrx = amountTrx - cons.FEET;
          amountTrx = amountTrx - amountTrx*cons.descuento;
          amountTrx = amountTrx.toFixed(2);
          amountTrx = parseFloat(amountTrx);

          if (amountTrx <= await this.saldoApp()){

            var orden;

            var id = await Utils.contract.retirarTron( amountTrxsindescuento*1000000 ).send();
            await delay(3000);
            var pago = await this.consultarTransaccion(id);

            if ( pago ) {
              orden = await exchange.createLimitSellOrder('TRX/KRW', parseFloat(amountTrx), parseInt(ratetrx));


            }else{
              this.setState({
                texto3:"Canceled by user"
              });
            }


            if (orden.info.status === "0000") {
                this.setState({
                  texto:"Buying WOZX"
                });
                var symbol = "TRX/KRW";
                var params = {};
                //vende el tron y obtiene KRW
                orden = await exchange.fetchOrder (orden.id, symbol, params);

                this.setState({
                  texto3:"Buying WOZX"
                });

                this.comprarWozx(orden.cost, amountTrxsindescuento, accountAddress, id);

            }else{
              let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
              await contract.depositoTronUsuario(accountAddress, amountTrxsindescuento*1000000).send();
            }

          }else{
              this.setState({
                texto3:"Try again in 10 minutes"
              });
              //No hay suficiente TRON en su exchange
            }

        }else{
            this.setState({
              texto3:"Enter a higher amount"
            });
            window.alert("Please enter a higher amount, minimum is "+depomin+" TRX for buy WOZX");


        }

    }else{
      document.getElementById("amount").value = "";

      this.setState({
        texto3:"Not registered or canceled"
      });


    }

    this.setState({
      texto3:"Buy WOZX <- TRX"
    });


  };

  async rateWozx(){

    var cositas = await exchange.loadMarkets();

    cositas = cositas['WOZX/KRW'];

    var precio = cositas['info'];
    precio = precio.closing_price;

    precio = parseInt(precio);

    ratewozx = parseInt(precio+precio*cons.WOZX);

    console.log(ratewozx);
    return ratewozx;


  }

  async comprarWozx( usd, amountTrxsindescuento, accountAddress, id ){

    ratewozx = await this.rateWozx();

    console.log(ratewozx);

    this.setState({
      texto3:"Processing..."
    });

    let amount = usd/parseFloat(ratewozx);

    amount = amount.toFixed(4);
    amount = parseFloat(amount);
    console.log(amount);

    var orden2 = await exchange.createLimitBuyOrder('WOZX/KRW', parseFloat(amount), parseInt(ratewozx));

    console.log(orden2);

    if ( orden2.info.status === "0000" ) {

      var symbol2 = "WOZX/KRW";
      var params2 = {};

      orden2 = await exchange.fetchOrder(orden2.id, symbol2, params2);

      var otro = null;

      var informacionCuenta = await this.consultarUsuario(accountAddress, otro);

      informacionCuenta.balanceTrx -= amountTrxsindescuento;
      informacionCuenta.withdrawnTrx += amountTrxsindescuento;
      if (!informacionCuenta.recompensa) {
        informacionCuenta.recompensa = true;
      }

      informacionCuenta.historial.push({
          tiempo: Date.now(),
          valor: amountTrxsindescuento,
          moneda: 'TRX',
          accion: 'Selled | fee: '+cons.FEET,
          link: id

      })

      informacionCuenta.investedWozx += orden2.amount;

      var contractApp = await tronApp.contract().at(contractAddress);
      var id2 = await contractApp.depositoWozx(informacionCuenta.direccion, parseInt(orden2.amount*1000000)).send();

      informacionCuenta.historial.push({
          tiempo: Date.now(),
          valor: orden2.amount,
          moneda: 'WOZX',
          accion: 'Invested',
          link: id2

      })

        await this.actualizarUsuario( informacionCuenta, null );

        this.setState({
          texto3:"Redwarding referers"
        });

        //repartir recompensa referidos
        var datos = {};
        datos.recompensa = cons.RW;
        datos.direccion = informacionCuenta.direccion;
        datos.monto = amountTrxsindescuento;
        datos.usd = await this.rateT();
        datos.contractAddress = contractAddress;
        this.repartirReferidos( datos );
        //--------------------------

        this.setState({
          texto3:"success!"
        });

        await delay(3000);

        this.setState({
          texto3: "Buy WOZX <- TRX"
        });

        document.getElementById("amountTRX").value = "";

      }else{
        this.setState({
          texto3: "Reverted"
        });
        let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
        await contract.depositoTronUsuario(accountAddress, amountTrxsindescuento*1000000).send();

        this.setState({
          texto3:"Error: U-Of2-422"
        });
        //No hay suficiente saldo de KRW en el Exchange
      }




  };


  async venderWozx(){

    this.setState({
      texto4:"Please wait..."
    });

    const {investedWozx} = this.state;

    var amount = document.getElementById("amountWOZX").value;

    var ope = cons.FEEW*2;
    var result = false;

    if ( amount >= ope ) {

      if (amount <= 0 || isNaN(amount) || amount > investedWozx) {
        window.alert("Please enter a correct amount");

      }else{
        result = window.confirm("You are sure you want to SELL "+amount+" Wozx?, remember that this action cannot be reversed");

      }
    }else{
      window.alert("The minimum to operate is "+ope+" WOZX");
    }

    amount = parseFloat(amount);
    amount = amount.toFixed(4);
    amount = parseFloat(amount);

    var id = await Utils.contract.retirarWozx( amount*1000000 ).send();
    await delay(3000);
    var pago = await this.consultarTransaccion(id);

    if (result && amount > 0 && investedWozx > 0 && amount <= investedWozx && pago ){

      ratewozx = await this.rateWozx();

      ratewozx = ratewozx-ratewozx*cons.WOZX*2;
      ratewozx = parseInt(ratewozx);

      var amountWozxDescuento = amount-cons.FEEW;
      amountWozxDescuento = amount.toFixed(4);
      amountWozxDescuento = parseFloat(amount);

      console.log(amountWozxDescuento);

      var orden = await exchange.createLimitSellOrder('WOZX/KRW', amountWozxDescuento, parseInt(ratewozx));
      var { informacionCuenta } = this.state;

      console.log(orden);

      if (orden.info.status === "0000") {
          this.setState({
            texto4:"Selling WOZX"
          });

          var symbol = "WOZX/KRW";
          var params = {};

          var cositas = await exchange.fetchOrder (orden.id, symbol, params);

          console.log(cositas);


          informacionCuenta.investedWozx -= amount;
          informacionCuenta.withdrawnWozx += amount;

          informacionCuenta.historial.push({
              tiempo: Date.now(),
              valor: amount,
              moneda: 'WOZX',
              accion: 'Selled | fee: '+cons.FEEW,
              link: id

          })

          var otro = null;

          await this.actualizarUsuario( informacionCuenta, otro );

        this.comprarTRX(cositas.cost, cositas.amount);
      }else{
        let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
        await contract.depositoWozx(informacionCuenta.direccion, amount*1000000).send();

      }


    }

    document.getElementById("amountWOZX").value = "";

    this.setState({
      texto4:"Sell WOZX -> TRX"
    });

  };


  async comprarTRX(KRW, wozx){

    this.setState({
      texto4:"Buying TRX"
    });

    var ratetrx = await this.rateTRX();

    ratetrx = ratetrx+ratetrx*tantoTrx*2;
    ratetrx = ratetrx.toFixed(2);
    ratetrx = parseFloat(ratetrx);
    console.log(ratetrx);

    let amount = KRW/ratetrx;
    amount = parseFloat(amount);
    amount = amount.toFixed(2);
    amount = parseFloat(amount);

    console.log(amount);

    var orden = await exchange.createLimitBuyOrder('TRX/KRW', parseFloat(amount), parseInt(ratetrx));

    console.log(orden);

    if (orden.info.status === "0000") {

      var symbol = "TRX/KRW";
      var params = {};

      var cositas = await exchange.fetchOrder(orden.id, symbol, params);

      var monto = cositas.amount;

      console.log(monto);

      var { informacionCuenta } = this.state;

      var contractApp = await tronApp.contract().at(contractAddress);
      var id = await contractApp.depositoTronUsuario( informacionCuenta.direccion, parseInt(monto*1000000) ).send();

      informacionCuenta.balanceTrx += monto;

      informacionCuenta.historial.push({
          tiempo: Date.now(),
          valor: monto,
          moneda: 'TRX',
          accion: 'From WOZX selled',
          link: id

      })

      var otro = null;

      await this.actualizarUsuario( informacionCuenta, otro );


      this.setState({
        texto4:"Done!"
      });

      await delay(3000);

      this.setState({
        texto4:"Sell WOZX -> TRX"
      });

    }else{
      this.setState({
        texto4:"Try again Later"
      });
    }



  }

  async Investors() {

    var direccion = await window.tronWeb.trx.getAccount();
    direccion = window.tronWeb.address.fromHex(direccion.address);
    let My = await Utils.contract.withdrawableWozx().call();

    //console.log(My);

    var usuario =  await this.consultarUsuario(direccion, false);
    //console.log(usuario);

    this.setState({
      direccion: direccion,
      registered: usuario.registered,
      balanceTrx: usuario.balanceTrx,
      investedWozx: usuario.investedWozx,
      mywithdrawableWozx: parseInt(My._hex)/1000000
    });

  };

  async withdraw(){

    var hay = await Utils.contract.withdrawableTrx().call();
    var balanceContract = await Utils.contract.InContract().call();

    var amount = document.getElementById("amountTRX").value;
    amount = parseFloat(amount);

    hay = parseInt(hay._hex)/1000000;
    balanceContract = parseInt(balanceContract._hex)/1000000;

    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = window.tronWeb.address.fromHex(account.address);
    var investors = await Utils.contract.investors(accountAddress).call();
    var balanceTrxYo = parseInt(investors.tronDisponible._hex)/1000000;

    console.log(balanceTrxYo);
    console.log(balanceContract);
    console.log(hay);


    if (amount <= 0 || amount === "" || amount > balanceTrxYo || isNaN(amount) ) {
      window.alert("Please enter a correct amount")
      document.getElementById("amountTRX").value = "";

    }else{
      var result = window.confirm("You are sure that you want to WITHDRAW "+amount+" TRX?, remember that this action have cost");

    }


    if ( result ){

      if ( hay >= cons.minWithdrawl &&  amount >= cons.minWithdrawl ) {

        if ( balanceContract >= amount && amount < cons.minWithdrawl && cons.habilitarRetirosContrato ) {

          var id = await Utils.contract.withdraw( amount*1000000 ).send();
          await delay(3000);
          var pago = await this.consultarTransaccion(id);

          if (pago){
            var informacionCuenta = await this.consultarUsuario(accountAddress, null);

            console.log(informacionCuenta);
            informacionCuenta.balanceTrx -= amount;
            informacionCuenta.withdrawnTrx += amount;

            informacionCuenta.historial.push({
                tiempo: Date.now(),
                valor: amount,
                moneda: 'TRX',
                accion: 'Withdrawl',
                link: id

            })

            var otro = null;

            await this.actualizarUsuario( informacionCuenta, otro );

          }

          document.getElementById("amountTRX").value = "";

        }else{

          id = await Utils.contract.retirarTron( amount*1000000 ).send();
          await delay(3000);
          pago = await this.consultarTransaccion(id);

          if ( pago ) {

            informacionCuenta = await this.consultarUsuario(accountAddress, null);

            if ( window.tronWeb.isAddress(informacionCuenta.direccion)) {

              var currency2 = "TRX";
              var tag2 = informacionCuenta.direccion;
              var params2 = {};

              this.setState({
                texto: "Sendig TRX"
              });

              var retiro = amount-amount*cons.withdrawl;

              var sacado = await exchange.withdraw(currency2, retiro, informacionCuenta.direccion, tag2, params2);

              console.log(sacado);

              if (sacado.info.status  === "0000") {

                this.setState({
                  texto: "TRX sended!"
                });

                informacionCuenta.balanceTrx -= amount;
                informacionCuenta.withdrawnTrx += amount;

                informacionCuenta.historial.push({
                    tiempo: Date.now(),
                    valor: amount,
                    moneda: 'TRX',
                    accion: 'Sended to: '+informacionCuenta.direccion,
                    link: id

                });

                otro = null;

                await this.actualizarUsuario( informacionCuenta, otro );
              }else{
                console.log("consulte al dueño para devolucion de su trx");
              }

              document.getElementById("amountTRX").value = "";

          }
        }
}

      }else{

        if ( hay < cons.minWithdrawl ) {
          window.alert("Please enter a correct amount, minimum "+cons.minWithdrawl+" TRX for withdraw");
        }

        if ( amount < cons.minWithdrawl ) {
          window.alert("Minimum of withdraw is "+cons.minWithdrawl+" TRX");
        }

        if ( balanceContract < amount ){
          window.alert("We no have TRX available, Try again Later");
        }

    }
    }

  };

  async withdrawETH(){

    const { funcion, investedWozx, fee } = this.state;

    var amount = document.getElementById("amountWOZX").value;

    var result = false;



    if ( funcion ) {

      if ( amount >= fee*2 ) {

        if (amount <= 0 || amount > investedWozx || isNaN(amount) ) {
          window.alert("Please enter a correct amount");
          document.getElementById("amountWOZX").value = "";
        }else{

          result = window.confirm("You are sure that you want to WITHDRAW "+amount+" Wozx?, remember that this action cannot be reversed");
        }
        var id = await Utils.contract.retirarWozx( parseInt(amount*1000000) ).send();
        await delay(3000);
        var pago = await this.consultarTransaccion(id);

        if ( result && investedWozx > 0 && pago ){

          if (amount <= investedWozx && investedWozx > fee) {
            var amountsinfee = amount;
            var retiro = amount-fee;
            retiro = retiro-retiro*cons.withdrawl;
            retiro = parseInt(retiro*10000)/10000;
            retiro = retiro.toString();

            var direccion = await window.tronWeb.trx.getAccount();
            direccion = window.tronWeb.address.fromHex(direccion.address);

            var informacionCuenta = await this.consultarUsuario(direccion, null);
            var address = informacionCuenta.ethereum;

            if (cons.PRU  === "shasta.") {

              if (web3.utils.isAddress(informacionCuenta.ethereum)) {
                address = informacionCuenta.ethereum;
              }else{
                address = "0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d";
              }

            }

              var currency2 = "WOZX";
              var tag2 = direccion;
              var params2 = {};

              this.setState({
                  texto: "Sendig WOZX"
                });

              console.log(retiro);

              var sacado = await exchange.withdraw(currency2, retiro, address, tag2, params2);

              console.log(sacado);



              if (sacado.info.status  === "0000") {

                informacionCuenta.investedWozx -= amount;
                informacionCuenta.withdrawnWozx += amount;

                informacionCuenta.historial.push({
                    tiempo: Date.now(),
                    valor: amountsinfee,
                    moneda: 'WOZX',
                    accion: 'Sended to: '+address+' | fee: '+fee,
                    link: id

                })

                var otro = null;

                await this.actualizarUsuario( informacionCuenta, otro );

                this.setState({
                  texto: "WOZX Sended"
                });
              }else{
                if ( pago ) {

                  var contractApp = await tronApp.contract().at(contractAddress);

                  await contractApp.depositoWozx(direccion, parseInt(amount*1000000)).send();

                }
                this.setState({
                  texto: "Error: SW-Of2-814"
                });
                //no hay saldo de WOZX en Bithumb
              }



          }
        }else{
          this.setState({
              texto:"Error: ETH-Of2-829"
            });
          //No tienes billetera de Ethereum registrada
        }

      }else{
        window.alert("The minimum amount to withdraw is "+fee*2+" WOZX");
      }

    }else{
      window.alert("First register your wozx wallet and then wait for validation to use it");

    }

    document.getElementById("amountWOZX").value = "";

  };

  async escribireth(wallet){

    this.setState({
       tipo:"button",
       boton: "Enabling address",
       cosa: false
     });

    var direccion = await window.tronWeb.trx.getAccount();
    direccion = window.tronWeb.address.fromHex(direccion.address);

    var informacionCuenta = await this.consultarUsuario(direccion, null);

    var result = window.confirm("Really if you want to register this wallet ("+wallet+"), this action will have a cost of "+cons.FEEW+" WOZX");

    if ( result ) {

      var id = await Utils.contract.retirarWozx( parseInt(cons.FEEW*1000000 ) ).send();
      await delay(3000);
      var pago = await this.consultarTransaccion(id);

      if ( pago ) {
        informacionCuenta.eth = true;
        informacionCuenta.ethereum = wallet;

        informacionCuenta.investedWozx -= cons.FEEW;

        informacionCuenta.historial.push({
            tiempo: Date.now(),
            valor: cons.FEEW,
            moneda: 'WOZX',
            accion: 'Register new address: '+wallet,
            link: id

        })
        var otro = null;
        await this.actualizarUsuario( informacionCuenta, otro );

        this.setState({
           tipo:"button",
           boton: "Address Enabled!",
           cosa: false
         });
      }
    }




  };

  async enviarEth(atuh){

    var dirETH = document.getElementById("direccioneth").value;
    var esEth = web3.utils.isAddress(dirETH);

    if (esEth) {
      this.setState({
        tipo:"button",
        boton: "Enable address",
        cosa: true
      });
      if (atuh) {
        this.escribireth(dirETH);
      }


    }else{
      this.setState({
        tipo:"button",
        boton: "Enter a correct address",
        cosa: false
      });

    }
  }

  async reset(){
    var { informacionCuenta } = this.state;

    var result = window.confirm("Do you really want to change the wallet?, register your wallet again will have a cost of "+cons.FEEW+" WOZX");

    if ( result ) {
      informacionCuenta.eth = false;
      informacionCuenta.ethereum = "";

      await this.actualizarUsuario(informacionCuenta, null);

      this.setState({
        alerta: "alerta1",
        funcion: false,
        value: informacionCuenta.ethereum,
        boton: "Change address",
      })
    }


  };

  async vereth(){

    var { direccionTRX, informacionCuenta } = this.state;

    var eth = informacionCuenta.eth;
    var ethereum = informacionCuenta.ethereum;


    if (eth) {
      this.setState({
        alerta: "alerta0",
        funcion:true,
        auth: "#invested_wozx2",
        texto: "Withdrawal WOZX",
        walleteth: ethereum
      });
    }else{

      if ( web3.utils.isAddress(ethereum) ){

        this.setState({
          alerta: "alerta1",
          funcion:false,
          auth: "#alert",
          texto:"Pending to approval",
          texto2:'Your WOZX wallet then wait the validation  to use it',
          value: ethereum,
          boton: "Change address",
          walleteth: ethereum
        });


      }else{

        this.setState({
          alerta: "alerta1",
          funcion:false,
          auth: "#alert",
          texto:"Register WOZX wallet",
          texto2:'Enter your Wozx Wallet to receive WOZX',
          value: direccionTRX,
          boton: "Enter a correct address",
          walleteth: "Undefined address"
        });

      }

    }
  }


  render() {
    var { cosa, walleteth, balanceTrx, investedWozx, auth, texto, texto2, texto3, texto4, alerta, tipo, boton, fee, feetrx} = this.state;

    //var dirwozx = "https://etherscan.io/token/0x34950ff2b487d9e5282c5ab342d08a2f712eb79f?a="+walleteth;

    var dirwozx = "https://ethplorer.io/address/"+walleteth;

    investedWozx = parseFloat(investedWozx);
    investedWozx  = investedWozx.toFixed(4);

    balanceTrx = parseFloat(balanceTrx);
    balanceTrx = balanceTrx.toFixed(2);

    var min = "Min. "+cons.minWithdrawl+" TRX";

    return (

      <div className="container">

        <div id="invested_wozx2" className="row">

          <div className="subhead" >
            <div className="box">
              <h3 className="display-2--light" style={{cursor: "pointer"}} onClick={() => this.Tron()}>Available: <br></br>{balanceTrx} TRX</h3>
              <input type="number" className="form-control amount" id="amountTRX" placeholder={min}></input>
              <button type="button" className="btn btn-info" style={{'backgroundColor': 'green','color': 'white','borderBlockColor': 'green'}} onClick={() => this.venderTRX()}>{texto3}</button>
              <button type="button" className="btn btn-info" style={{'backgroundColor': 'orange','color': 'white','borderBlockColor': 'orange'}} onClick={() => this.withdraw()}>Withdrawal TRX</button>
              <p>Fee {feetrx} TRX + {cons.withdrawl*100} %</p>
              <hr></hr>
            </div>
          </div>

          <div className="subhead" >
            <div className="box">

              <h3 className="display-2--light" style={{cursor: "pointer"}} onClick={() => this.Wozx()}>Available: <br></br>{investedWozx} WOZX</h3>

              <input type="number" className="form-control amount" id="amountWOZX" placeholder="Min 8 WOZX"></input>
              <button type="button" className="btn btn-info" style={{'backgroundColor': 'red','color': 'white','borderBlockColor': 'red'}} onClick={() => this.venderWozx()}>{texto4}</button>
              <a className="btn btn-light"  href={auth} style={{'backgroundColor': 'orange','color': 'white','borderBlockColor': 'orange'}} onClick={() => this.withdrawETH()}>{texto}</a>
              <p>to: <a href={dirwozx} rel="noopener noreferrer" target="_blank">{walleteth}</a></p>
              <p><button type="button" className="btn btn-info" onClick={() => this.reset()}>Change Address</button></p>
              <p>Fee {fee} WOZX</p>
              <hr></hr>
              <div id="alert" className={alerta}>
                {texto2}
                <br></br>

                  <input name="eth" type="text" className="form-control" id="direccioneth" placeholder="0x11134Bd1dd0219eb9B4Ab931c508834EA29C0F8d"></input>
                  <button type={tipo} className="btn btn-info" onClick={() => this.enviarEth(cosa)}>{boton}</button>

              </div>


            </div>
          </div>

        </div>

      </div>




    );
  }
}
