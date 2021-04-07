import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import ccxt from 'ccxt';

const delay = ms => new Promise(res => setTimeout(res, ms));

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;


export default class Oficina extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rango: "N/A",
      ganancia: 0,
      refe: [[],[],[],[],[],[],[],[],[],[]],
      direccion: "",
      link: "Make an investment to get the referral LINK",
      registered: false,
      balanceTrx: "0",
      withdrawnTrx: "0",
      investedWozx: "0",
      withdrawnWozx: "0",
      miPrecioWozx: 0,
      priceUSDWOZX: 0

    };

    this.Investors = this.Investors.bind(this);
    this.enviarWozx = this.enviarWozx.bind(this);
    this.Link = this.Link.bind(this);
    this.Wozx = this.Wozx.bind(this);
    this.rateW = this.rateW.bind(this);

    this.consultarUsuario = this.consultarUsuario.bind(this);
    this.actualizarDireccion = this.actualizarDireccion.bind(this);
    this.actualizarUsuario = this.actualizarUsuario.bind(this);

    this.consultarTransaccion = this.consultarTransaccion.bind(this);
    this.syncBlockChain = this.syncBlockChain.bind(this);

  }

  async componentDidMount() {

    await Utils.setContract(window.tronWeb, contractAddress);
    this.rateW();
    await this.Link();
    setInterval(() => this.Link(),3*1000);
    await this.Investors();
    setInterval(() => this.Investors(),3*1000);
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

  async actualizarDireccion() {

    var account =  await window.tronWeb.trx.getAccount();
    account = window.tronWeb.address.fromHex(account.address);

    this.setState({
      direccionTRX: account
    });

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

  async rateW(){
    var proxyUrl = cons.proxy;
    var apiUrl = cons.mongo+'precio/usd/wozx';
    const response = await fetch(proxyUrl+apiUrl)
    .catch(error =>{console.error(error)})
    const json = await response.json();
    //console.log(json);
    this.setState({
      priceUSDWOZX: json.data.wozx.usd
    });

    return json.data.wozx.usd;

  };

  async Wozx (){

    const { investedWozx } = this.state;

    document.getElementById("cantidadwozx").value = investedWozx;

  };

  async Link() {
    const {registered} = this.state;
    if(registered){

      let loc = document.location.href;
      if(loc.indexOf('?')>0){
        loc = loc.split('?')[0];
        loc = loc.split('#')[0];
      }
      let mydireccion = await window.tronWeb.trx.getAccount();
      mydireccion = window.tronWeb.address.fromHex(mydireccion.address)
      mydireccion = loc+'?ref='+mydireccion;
      this.setState({
        link: mydireccion,
      });
    }else{
      this.setState({
        link: "Haz una inversión para obtener el LINK de referido",
      });
    }
  }

  async Investors() {

    this.rateW();

    const {investedWozx, priceUSDWOZX} = this.state;

    var direccion = await window.tronWeb.trx.getAccount();
    direccion = direccion = window.tronWeb.address.fromHex(direccion.address);

    var usuario =  await this.consultarUsuario(direccion, false);
    var range = "N/A";
    var prof = usuario.rango;

    prof = prof.toFixed(2);
    prof = parseFloat(prof);
    //console.log(prof);
    if (prof > 0 && prof < 1000  ) {
      range = "PIONEER"
    }
    if (prof >= 1000 && prof < 5000  ) {
      range = "ZAPHIRE"
    }
    if (prof >= 5000 && prof < 20000  ) {
      range = "RUBY"
    }
    if (prof >= 20000 && prof < 50000  ) {
      range = "ESMERALDA"
    }
    if (prof >= 50000 && prof < 140000  ) {
      range = "DIAMANTE"
    }
    if (prof >= 140000 && prof < 400000  ) {
      range = "DIAMANTE AZUL"
    }
    if (prof >= 400000 && prof < 1000000  ) {
      range = "DIAMANTE NEGRO"
    }
    if (prof >= 1000000) {
      range = "DIAMANTE CORONA"
    }
    //console.log(prof);


    this.setState({
      direccion: direccion,
      registered: usuario.registered,
      balanceTrx: usuario.balanceTrx,
      withdrawnTrx: usuario.withdrawnTrx,
      investedWozx: usuario.investedWozx,
      withdrawnWozx: usuario.withdrawnWozx,
      refe: usuario.niveles,
      rango: range,
      ganancia: prof,
      miPrecioWozx: investedWozx*priceUSDWOZX
    });

  };

  async syncBlockChain(){
    var account =  await window.tronWeb.trx.getAccount();
    account = window.tronWeb.address.fromHex(account.address);
    var informacionCuenta = await this.consultarUsuario(account,false);

    console.log(informacionCuenta);

    var investor = await Utils.contract.investors(account).call();

    console.log(investor);

    if ( investor.registered && informacionCuenta.registered ) {

      investor.tronEntrante = parseInt(investor.tronEntrante._hex)/1000000;
      investor.tronDisponible = parseInt(investor.tronDisponible._hex)/1000000;
      investor.tronRetirado = parseInt(investor.tronRetirado._hex)/1000000;
      investor.wozxEntrante = parseInt(investor.wozxEntrante._hex)/1000000;
      investor.wozxDisponible = parseInt(investor.wozxDisponible._hex)/1000000;
      investor.wozxRetirado = parseInt(investor.wozxRetirado._hex)/1000000;

      informacionCuenta.balanceTrx = investor.tronDisponible;
      informacionCuenta.investedWozx = investor.wozxDisponible;
      informacionCuenta.withdrawnTrx = investor.tronEntrante-investor.tronDisponible;
      informacionCuenta.withdrawnWozx = investor.wozxEntrante-investor.wozxDisponible;

      await this.actualizarUsuario( informacionCuenta, null );
    }
  }

  async enviarWozx(){

    const {investedWozx} = this.state;

    let direccion = document.getElementById("enviartronwozx").value;
    var cantidad = document.getElementById("cantidadwozx").value;
    cantidad = parseFloat(cantidad);

    var account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var result= false;

    console.log(direccion.length);
    if ( !window.tronWeb.isAddress(direccion) || accountAddress === direccion ) {

      window.alert("Please enter a correct address");
      document.getElementById("enviartronwozx").value = "";

    }else{


      if (cantidad <= 0 || isNaN(cantidad) || cantidad > investedWozx || cantidad < cons.FEEW) {
        window.alert("Please enter a correct amount");
        document.getElementById("cantidadwozx").value = "";

      }else{

        result = window.confirm("You are sure that you want to SEND "+cantidad+" Wozx?, remember that this action cannot be reversed - fee: "+cons.FEEW);

      }

    }

    account =  await window.tronWeb.trx.getAccount();
    accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var informacionCuenta = await this.consultarUsuario(accountAddress, true);
    var informacionDestino = await this.consultarUsuario(direccion, true);

    var id = await Utils.contract.enviarWozx(direccion, parseInt(cantidad*1000000)).send();
    await delay(3000);
    var pago = await this.consultarTransaccion(id);

    if (result && pago && informacionCuenta.registered && informacionDestino.registered) {

      informacionCuenta.investedWozx -= cantidad;
      informacionCuenta.withdrawnWozx += cantidad;
      informacionCuenta.historial.push({
          tiempo: Date.now(),
          valor: cantidad,
          moneda: 'WOZX',
          accion: 'Send to: '+direccion,
          link: id

      })

      await this.actualizarUsuario( informacionCuenta, informacionCuenta.direccion);

      informacionDestino.investedWozx += cantidad-cons.FEEW;
      informacionDestino.historial.push({
          tiempo: Date.now(),
          valor: cantidad,
          moneda: 'WOZX',
          accion: 'Received from: '+accountAddress,
          link: id

      })

      await this.actualizarUsuario( informacionDestino, informacionDestino.direccion);

      document.getElementById("cantidadwozx").value = "";

    }

  };


  render() {
    var {miPrecioWozx, balanceTrx, withdrawnTrx, investedWozx,  withdrawnWozx } = this.state;


    withdrawnTrx = parseFloat(withdrawnTrx);
    withdrawnTrx = withdrawnTrx.toFixed(2);

    investedWozx = parseFloat(investedWozx);
    investedWozx  = investedWozx.toFixed(4);

    withdrawnWozx = parseFloat(withdrawnWozx);
    withdrawnWozx = withdrawnWozx.toFixed(4);

    balanceTrx = parseFloat(balanceTrx);
    balanceTrx = balanceTrx.toFixed(2);

    //console.log(this.state.refe);

    return (

      <div id="officer" className="container">

        <header style={{'textAlign': 'center'}} className="section-header">
          <h3 className="white"><span style={{'fontWeight': 'bold'}}>
          My office:</span> <br></br>
          <span style={{'fontSize': '18px'}}>

            {this.state.direccion} <br />
            <span className="subhead">{investedWozx} WOZX =</span> $ {miPrecioWozx.toFixed(2)} USD <br />
            <span className="subhead">Career range:</span><a href="/range.html"> {this.state.rango} </a> <br />
            <span className="subhead">Profits:</span> $ {this.state.ganancia} USD

          </span></h3><br />
          <ul className="stats-tabs">
            <li><a href="#officer">{this.state.refe[0].length} <em>Level 1</em></a></li>
            <li><a href="#officer">{this.state.refe[1].length} <em>Level 2</em></a></li>
            <li><a href="#officer">{this.state.refe[2].length} <em>Level 3</em></a></li>
            <li><a href="#officer">{this.state.refe[3].length} <em>Level 4</em></a></li>
            <li><a href="#officer">{this.state.refe[4].length} <em>Level 5</em></a></li>
            <li><a href="#officer">{this.state.refe[5].length} <em>Level 6</em></a></li>
            <li><a href="#officer">{this.state.refe[6].length} <em>Level 7</em></a></li>
            <li><a href="#officer">{this.state.refe[7].length} <em>Level 8</em></a></li>
            <li><a href="#officer">{this.state.refe[8].length} <em>Level 9</em></a></li>
            <li><a href="#officer">{this.state.refe[9].length} <em>Level 10</em></a></li>
          </ul>

          <h3 className="white" style={{'fontWeight': 'bold'}}>Referral link:</h3>
          <h6 className="white" ><a href={this.state.link}>{this.state.link}</a>&nbsp;<br /><br />
          <CopyToClipboard text={this.state.link}>
            <button type="button" className="btn btn-info">Copy to clipboard</button>
          </CopyToClipboard>
          </h6>
          <hr></hr>

        </header>

        <div className="row centrartexto">

          <div className="col-five">

              <h1 className="subhead">Balance</h1>
              <h3 className="display-2--light">{investedWozx} WOZX</h3>
              <hr></hr>

          </div>

          <div className="col-seven">

              <h1 className="subhead">Withdrawn</h1>
              <h3 className="display-2--light">{withdrawnWozx} WOZX</h3>
              <hr></hr>

          </div>
        </div>
        <div className="row centrartexto">

          <div className="col-five">

              <h1 className="subhead">Balance</h1>
              <h3 className="display-2--light">{balanceTrx} TRX</h3>
              <hr></hr>

          </div>

          <div className="col-seven">

              <h1 className="subhead">Withdrawn</h1>
              <h3 className="display-2--light">{withdrawnTrx} TRX</h3>
              <hr></hr>

          </div>

        </div>

        <div className="row centrartexto">
          <div className="col-twelve">
            <button type="button" className="btn btn-light" style={{'backgroundColor': 'green','color': 'white','borderBlockColor': 'green'}} onClick={() => this.syncBlockChain()}>Sync whit BlockChain</button><br />
            <small id="syncHelp" className="form-text text-muted">Use it with caution, only when you have questions about your balance</small><br /><br />
          </div>
        </div>
        <div className="row centrartexto">

          <div className="col-seven">

              <h3 className="display-2--light"> Send WOZX to USER:</h3>
              <input type="text" className="form-control" id="enviartronwozx" aria-describedby="emailHelp" placeholder="Tron wallet Member" />
              <small id="wozxHelp" className="form-text text-muted">Make sure the address is well written, once sent, this action cannot be reversed</small>


          </div>

          <div className="col-five">

              <h3 className="display-2--light" style={{cursor: "pointer"}} onClick={() => this.Wozx()}> Available {investedWozx} WOZX</h3>
              <input type="number" className="form-control" id="cantidadwozx" aria-describedby="emailHelp" placeholder="how much WOZX" />
              <button type="button" className="btn btn-light" style={{'backgroundColor': 'red','color': 'white','borderBlockColor': 'red'}} onClick={() => this.enviarWozx()}>send WOZX</button>

          </div>

          <hr />

        </div>

      </div>




    );
  }
}
