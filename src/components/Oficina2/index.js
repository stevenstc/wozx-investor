import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import TronWeb2 from 'tronweb';

import web3 from 'web3';

import ccxt from 'ccxt';

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;

var tantoTrx = cons.TRX;// para que el TRX se Venda de inmediato
var tantoWozx = cons.WOZX;// para que el WOZX se venda de inmediato

var minimo_usd = cons.USD;

var amountTrx = 0;
var cantidadusd = 0;
var ratetrx = 0;
var ratewozx = 0;

var descuento = cons.descuento; 

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
      ratetrx: "",
      ratewozx: "",
      tipo: "button",
      auth: "/auth.html",
      texto: "Loading...",
      texto3: "Buy WOZX <- TRX",
      texto4:"Sell WOZX -> TRX",
      value: "",
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
    this.enviarTron = this.enviarTron.bind(this);
    this.vereth = this.vereth.bind(this);
    this.withdrawETH = this.withdrawETH.bind(this);
    this.enviarEth = this.enviarEth.bind(this);
    this.saldoApp = this.saldoApp.bind(this);
    this.Wozx = this.Wozx.bind(this);
    this.Tron = this.Tron.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.deposit = this.deposit.bind(this);
    this.deposit2 = this.deposit2.bind(this);

    
  }

  async Wozx (){

    const { investedWozx } = this.state;

    document.getElementById("amountWOZX").value = investedWozx;

  };

  async Tron (){

    const { balanceTrx } = this.state;

    document.getElementById("amountTRX").value = balanceTrx;

  };

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    await this.Investors();
    await this.vereth();
    await this.enviarEth();
    setInterval(() => this.Investors(),10*1000);
    setInterval(() => this.vereth(),10*1000);
    setInterval(() => this.enviarEth(),3*1000);
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

    //console.log(ratetrx);


  };

  async venderTRX(){  

    await this.saldoApp();
    await this.rateTRX();

    const {tronEnApp} = this.state;

    this.setState({
      texto3:"Please wait"
    });
    
    // verifica el monto sea mayor a minimo
    amountTrx = document.getElementById("amountTRX").value;

    var depomin = await Utils.contract.MIN_DEPOSIT().call();
    depomin = parseInt(depomin._hex)/1000000;
    // verifica si ya esta registrado
    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var investors = await Utils.contract.investors(accountAddress).call();
    //console.log(investors);

    var montoTrx = parseInt(amountTrx);
    var haytron = parseInt(tronEnApp);

    var result = false;
    var balanceTrxContrato = parseInt(investors.balanceTrx._hex)/1000000;
    //console.log(balanceTrxContrato);

    if ( parseInt(amountTrx) <= 0 || amountTrx === "" || balanceTrxContrato < amountTrx ) {
      window.alert("Please enter a correct amount");
      document.getElementById("amountTRX").value = "";
      this.setState({
        texto3:"Buy WOZX <- TRX"
      });

    }else{
      result = window.confirm("You are sure you want to reinvest "+amountTrx+" TRX?");
    }
    

    if ( result ) {

      if ( investors.registered ) {
        if ( amountTrx >= depomin ) {
          if ( montoTrx < haytron ) {
            console.log("Entro directo");
          amountTrx = amountTrx - amountTrx*descuento;
          amountTrx = amountTrx.toFixed(2);

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

              this.setState({
                texto3:"Buying WOZX"
              });

              this.comprarWozx(cantidadusd);

          }else{
              this.setState({
                texto3:"Error: T-Of2-267"
              });
              //No hay suficiente TRON en Gate.io
            }


          }else{
            console.log("Entro POST");
            // cantidad muy alta de TRX pendiente se ejecuta post recepcion de fondos
            this.deposit2();
          }

        }else{
          if ( depomin >= amountTrx ){
            this.setState({
              texto3:"Enter a higher amount"
            });
          }
          
        }

      }else{


          document.getElementById("amount").value = "";
          this.setState({
            texto3:"Not registered"
          });
          

      }

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
    console.log(precio);

    ratewozx = precio+precio*tantoWozx;

    ratewozx = parseInt(ratewozx);


  }

  async comprarWozx(usd){    
    
    await this.rateWozx();

    this.setState({
      texto3:"Processing..."
    });
    
    let amount = usd/parseFloat(ratewozx);

    amount = amount.toFixed(4);
    amount = parseFloat(amount);
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
          texto3:"Error: U-Of2-422"
        });
        //No hay suficiente saldo de USD en Gate.io
      }
   
    
    
    
  };


  async deposit(orden) {

    let amount = document.getElementById("amountTRX").value;

      orden = orden * 1000000;
      orden = parseInt(orden);
      console.log(orden);

      const account =  await window.tronWeb.trx.getAccount();
      var accountAddress = account.address;
      accountAddress = window.tronWeb.address.fromHex(accountAddress);

      this.setState({
        texto3:"Sign order"
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
        texto3:"Reciving TRON"
      });
      
      await Utils.contract.redeposit(amount * 1000000).send();

      this.setState({
        texto3:"Handing out rewards"
      });

      await contract.transfers().send();
      await contract.transfers01().send();
      this.setState({
        texto3:"Buy WOZX -> TRX"
      });
      

    document.getElementById("amountTRX").value = "";

    
  };

  async deposit2() {

    await this.rateWozx();
    await this.rateTRX();

    let amount = document.getElementById("amountTRX").value;

    this.setState({
      texto3:"Don't close the window"
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
      texto3:"Saving order"
    });
    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.ordenPost(accountAddress, am, orden).send();

    this.setState({
      texto3:"Buy WOZX <- TRX"
    });

    document.getElementById("amountTRX").value = "";
    
  };

  async venderWozx(){   

    this.setState({
      texto4:"Please wait..."
    });

    await this.rateWozx();

    ratewozx = ratewozx-ratewozx*tantoWozx*2;
    ratewozx = parseInt(ratewozx);

    console.log(tantoWozx);
    console.log(ratewozx);

    const {investedWozx} = this.state;
    
    var amount = document.getElementById("amountWOZX").value;

    var ope = minimo_usd/ratewozx;
    ope = ope.toFixed(4);
    ope = parseFloat(ope);

    var result = false;
    if ( amount >= ope ) {

      if (amount <= 0 || amount === "" || amount > investedWozx) {
        window.alert("Please enter a correct amount");

      }else{
        result = window.confirm("You are sure you want to SELL "+amount+" Wozx?, remember that this action cannot be reversed");

      }
    }else{
      window.alert("The minimum to operate is "+ope+" WOZX");
    }


    if (result && amount > 0 && investedWozx > 0 && amount <= investedWozx){

      
      amount = amount.toFixed(4);
      amount = parseFloat(amount);

      console.log(amount);
      console.log(ratewozx);

      var orden = await exchange.createLimitSellOrder('WOZX/KRW', amount, ratewozx)

      console.log(orden);

      console.log(orden.info.status);

      if (orden.info.status === "0000") {
          this.setState({
            texto4:"Selling WOZX"
          });

          var symbol = "WOZX/KRW";
          var params = {};

          var cositas = await exchange.fetchOrder (orden.id, symbol, params);

          var costo = cositas.cost;
          var monto = cositas.amount;

          console.log(costo);
          console.log(monto);

          var cantidadusd = costo;
          var cantidadWozx = monto;
          
          console.log(cantidadusd);

        this.comprarTRX(cantidadusd, cantidadWozx);
      }
      

    }
    
    document.getElementById("amountWOZX").value = "";

    this.setState({
      texto4:"Sell WOZX -> TRX"
    });

  };


  async comprarTRX(c, w){    

    await this.rateTRX();

    ratetrx = ratetrx+ratetrx*tantoTrx*2;
    ratetrx = ratetrx.toFixed(2);
    ratetrx = parseInt(ratetrx);
    console.log(ratetrx);
    
    let amount = c/ratetrx;

    amount = amount.toFixed(2)
    amount = parseFloat(amount);

    var orden = await exchange.createLimitBuyOrder('TRX/KRW', amount, ratetrx);

    console.log(orden);

    if (orden.info.status === "0000") {

      var symbol = "TRX/KRW";
      var params = {};

      var cositas = await exchange.fetchOrder(orden.id, symbol, params);

      var monto = cositas.amount;

      console.log(monto)


      this.enviarTron(monto, w);
    }
    
    

  }

  async enviarTron(trx, wozx){

    await this.rateTRX();
    await this.rateWozx();

    //enviar el tron a la direccion del contrato
    let wallet = await window.tronWeb.trx.getAccount();
    wallet = window.tronWeb.address.fromHex(wallet.address)

    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.wozxToTron(wallet, parseInt(ratetrx*1000000), parseInt(ratewozx*1000000), parseInt(wozx*1000000)).send();
    console.log("se envio "+trx+" TRX a "+wallet+" exitosamente")

    let amount = trx;

    let currency = "TRX";

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

    var tag = undefined;
    var params = {};

    var versacado = await exchange.withdraw(currency, amount, address, tag, params);
    console.log(versacado);
   
  };

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
    var balanceContract = await Utils.contract.InContract().call();

    var amount = document.getElementById("amountTRX").value;
    
    hay = parseInt(hay.amount._hex)/1000000;
    minre = parseInt(minre._hex)/1000000;
    balanceContract = parseInt(balanceContract._hex)/1000000;

    const account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);
    var investors = await Utils.contract.investors(accountAddress).call();
    var balanceTrxYo = parseInt(investors.balanceTrx._hex)/1000000;

    console.log(balanceTrxYo);
    console.log(balanceContract);
    console.log(hay);
    console.log(minre);

    var result = false;

    if (amount <= 0 || amount === "" || amount > balanceTrxYo ) {
      window.alert("Please enter a correct amount")
      document.getElementById("amountTRX").value = "";

    }else{
      result = window.confirm("You are sure that you want to WITHDRAW "+amount+" TRX?, remember that this action cost "+minre+" TRX");

    }


    if ( result ){

      if ( hay >= minre*2 && balanceContract >= amount && amount >= minre*2 ) {

        amount = parseInt(amount*1000000);
        
        await Utils.contract.withdraw(amount).send();
      }else{

        if ( hay < minre*2 ) {
          window.alert("Youn no have TRX aviable, minimum of withdraw is "+minre*2+" TRX");
        }

        if ( amount < minre*2 ) {
          window.alert("Minimum of withdraw is "+minre*2+" TRX");
        }

        if ( balanceContract < amount ){
          window.alert("The Aplication in this moment no have TRX aviable, Try again Later");
        }
        
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

    var result = false;

    

    if ( funcion ) {

      if ( amount >= fee*2 ) {

        if (amount <= 0 || amount === "" || amount > investedWozx) {
          window.alert("Please enter a correct amount");
          document.getElementById("amountWOZX").value = "";
        }else{

          result = window.confirm("You are sure that you want to WITHDRAW "+amount+" Wozx?, remember that this action cannot be reversed");
        }

        if (result && investedWozx > 0){

          if (amount <= investedWozx && investedWozx > fee) {
            amount = amount-fee;
            amount = amount.toString();

            var direccion = await window.tronWeb.trx.getAccount();
            direccion = window.tronWeb.address.fromHex(direccion.address);
            var address = await Utils.contract.miETH(direccion).call()
            address = address.ethdireccion;

            if (cons.PRU  === "shasta.") {
              var owner = await Utils.contract.owner().call();
              address = await Utils.contract.miETH(window.tronWeb.address.fromHex(owner)).call()

              if (web3.utils.isAddress(address.ethdireccion)) {
                address = address.ethdireccion;
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

              var sacado = await exchange.withdraw(currency2, amount, address, tag2, params2);

              console.log(sacado);
              
              if (sacado.info.status  === "0000") {
                
                sacarwozx(amount);
                this.setState({
                  texto: "WOZX Sended"
                });
              }else{
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

      if ( web3.utils.isAddress(eth.ethdireccion) ){

        this.setState({
          alerta: "alerta1",
          funcion:false,
          auth: "#alert",
          texto:"Pending to approval",
          texto2:'Your WOZX wallet then wait the validation  to use it',
          value: eth.ethdireccion,
          boton: "Change address",
          walleteth: eth.ethdireccion
        });


      }else{

        this.setState({
          alerta: "alerta1",
          funcion:false,
          auth: "#alert",
          texto:"Register WOZX wallet",
          texto2:'Enter your address to receive WOZX',
          value: wallet,
          boton: "Check address",
          walleteth: "Undefined address"
        });

      }
        
    }
  }


  render() {
    const { cosa, walleteth, balanceTrx, investedWozx, auth, texto, texto2, texto3, texto4, alerta, value, tipo, boton, fee, feetrx} = this.state;

    var dirwozx = "https://etherscan.io/token/0x34950ff2b487d9e5282c5ab342d08a2f712eb79f?a="+walleteth;

    return (
      
      <div className="container">

        <div id="invested_wozx2" className="row">

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
            
              <h3 className="display-2--light" style={{cursor: "pointer"}} onClick={() => this.Wozx()}>Available: <br></br>{investedWozx} WOZX</h3>

              <input type="number" className="form-control amount" id="amountWOZX" placeholder="Min 8 WOZX"></input>
              <button type="button" className="btn btn-info" onClick={() => this.venderWozx()}>{texto4}</button>
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
              <h3 className="display-2--light" style={{cursor: "pointer"}} onClick={() => this.Tron()}>Available: <br></br>{balanceTrx} TRX</h3>
              <input type="number" className="form-control amount" id="amountTRX" placeholder="Min. 20 TRX"></input>
              <button type="button" className="btn btn-info" onClick={() => this.venderTRX()}>{texto3}</button>
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
