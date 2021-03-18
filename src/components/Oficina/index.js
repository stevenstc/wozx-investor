import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import ccxt from 'ccxt';

const exchange = new ccxt.bithumb({
    nonce () { return this.milliseconds () }
});

exchange.proxy = cons.proxy;
exchange.apiKey = cons.AK;
exchange.secret = cons.SK;


export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      rango: "N/A",
      ganancia: 0,
      refe: [],
      direccion: "",
      link: "Make an investment to get the referral LINK",
      registered: false,
      balanceTrx: "0",
      withdrawnTrx: "0",
      investedWozx: "0",
      withdrawnWozx: "0",
      wozxPe: false,
      wozxCa: 0,
      miPrecioWozx: 0,
      priceUSDWOZX: 0

    };

    this.Investors = this.Investors.bind(this);
    this.enviarWozx = this.enviarWozx.bind(this);
    this.Link = this.Link.bind(this);
    this.Wozx = this.Wozx.bind(this);
    this.rateW = this.rateW.bind(this);

  }

  async componentDidMount() {

    await Utils.setContract(window.tronWeb, contractAddress);
    this.rateW();
    await this.Link();
    setInterval(() => this.Link(),3*1000);
    await this.Investors();
    setInterval(() => this.Investors(),10*1000);
  };

  async rateW(){
    var proxyUrl = cons.proxy;
    var apiUrl = 'https://api.coingecko.com/api/v3/coins/wozx';
    fetch(proxyUrl+apiUrl).then(response => {
      return response.json();
    }).then(data => {
      // Work with JSON data
      this.setState({
        priceUSDWOZX: data.market_data.current_price.usd
      });

    }).catch(err => {
        console.log(err)

    });

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
        loc = loc.split('?')[0]
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

    let direccion = await window.tronWeb.trx.getAccount();
    var esto = await Utils.contract.investors(direccion.address).call();
    var refe = [];
    for (var i = 0; i < 10; i++) {
      var a = 0;
      if(true){
        refe[i] = "N/A";
      }else{
        refe[i] = parseInt(a.cantidad._hex);
      }

    }
    //console.log(refe);
    //console.log(a);
    var r = 0;
    var range = "N/A";
    var prof = r;

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

    var wozxPe = 0;// consulta del wozx pendiente por llegar

    var wozxCa = wozxPe;

    wozxCa = wozxCa.toFixed(4);

    wozxPe = wozxPe.res;


    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceTrx: 1000000,
      withdrawnTrx: 1000000,
      investedWozx: 1000000,
      withdrawnWozx: 1000000,
      wozxPe: wozxPe,
      wozxCa: wozxCa,
      refe: refe,
      rango: range,
      ganancia: prof,
      miPrecioWozx: investedWozx*priceUSDWOZX
    });

  };

  async enviarWozx(){

    const {investedWozx} = this.state;

    let direccion = document.getElementById("enviartronwozx").value;
    var cantidad = document.getElementById("cantidadwozx").value;

    var account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var result= false;

    console.log(direccion.length);
    if ( !window.tronWeb.isAddress(direccion) || accountAddress === direccion ) {

      window.alert("Please enter a correct address");
      document.getElementById("enviartronwozx").value = "";

    }else{


      if (cantidad <= 0 || cantidad === "" || cantidad > investedWozx) {
        window.alert("Please enter a correct amount");
        document.getElementById("cantidadwozx").value = "";

      }else{

        result = window.confirm("You are sure that you want to SEND "+cantidad+" Wozx?, remember that this action cannot be reversed");

      }

    }

    if (result) {

      cantidad = parseInt(cantidad*1000000);

      account =  await window.tronWeb.trx.getAccount();
      accountAddress = account.address;
      accountAddress = window.tronWeb.address.fromHex(accountAddress);

      await Utils.contract.enviarWozx(accountAddress, direccion, cantidad).send();

      document.getElementById("cantidadwozx").value = "";

    }

  };


  render() {
    var {miPrecioWozx, wozxPe, wozxCa, refe, balanceTrx, withdrawnTrx, investedWozx,  withdrawnWozx , direccion, link, rango, ganancia} = this.state;




    if ( wozxPe ) {
      wozxPe ="(~ "+wozxCa+" WOZX)";
    }else{
      wozxPe ="";
    }


    withdrawnTrx = parseFloat(withdrawnTrx);
    withdrawnTrx = withdrawnTrx.toFixed(4);

    investedWozx = parseFloat(investedWozx);
    investedWozx  = investedWozx.toFixed(4);

    withdrawnWozx = parseFloat(withdrawnWozx);
    withdrawnWozx = withdrawnWozx.toFixed(4);

    balanceTrx = parseFloat(balanceTrx);
    balanceTrx = balanceTrx.toFixed(2);

    return (

      <div id="officer" className="container">

        <header style={{'textAlign': 'center'}} className="section-header">
          <h3 className="white"><span style={{'fontWeight': 'bold'}}>
          My office:</span> <br></br>
          <span style={{'fontSize': '18px'}}>

            {direccion} <br />
            <span className="subhead">{investedWozx} WOZX =</span> $ {miPrecioWozx.toFixed(2)} USD <br />
            <span className="subhead">Career range:</span><a href="/range.html"> {rango} </a> <br />
            <span className="subhead">Profits:</span> $ {ganancia} USD

          </span></h3><br />
          <ul className="stats-tabs">
            <li><a href="#officer">{refe[0]} <em>Level 1</em></a></li>
            <li><a href="#officer">{refe[1]} <em>Level 2</em></a></li>
            <li><a href="#officer">{refe[2]} <em>Level 3</em></a></li>
            <li><a href="#officer">{refe[3]} <em>Level 4</em></a></li>
            <li><a href="#officer">{refe[4]} <em>Level 5</em></a></li>
            <li><a href="#officer">{refe[5]} <em>Level 6</em></a></li>
            <li><a href="#officer">{refe[6]} <em>Level 7</em></a></li>
            <li><a href="#officer">{refe[7]} <em>Level 8</em></a></li>
            <li><a href="#officer">{refe[8]} <em>Level 9</em></a></li>
            <li><a href="#officer">{refe[9]} <em>Level 10</em></a></li>
          </ul>

          <h3 className="white" style={{'fontWeight': 'bold'}}>Referral link:</h3>
          <h6 className="white" ><a href={link}>{link}</a>&nbsp;<br /><br />
          <CopyToClipboard text={link}>
            <button type="button" className="btn btn-info">Copy to clipboard</button>
          </CopyToClipboard>
          </h6>
          <hr></hr>

        </header>

        <div className="row centrartexto">

          <div className="col-five">

              <h1 className="subhead">Balance</h1>
              <h3 className="display-2--light">{investedWozx} WOZX</h3>
              <h3 className="display-2--light">{wozxPe}</h3>
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

          <div className="col-seven">

              <h3 className="display-2--light"> Send WOZX to USER:</h3>
              <input type="text" className="form-control" id="enviartronwozx" aria-describedby="emailHelp" placeholder="Tron wallet Member" />
              <small id="emailHelp" className="form-text text-muted">make sure the address is well written, once sent, this action cannot be reversed</small>


          </div>

          <div className="col-five">

              <h3 className="display-2--light" onClick={() => this.Wozx()}> Available {investedWozx} WOZX</h3>
              <input type="number" className="form-control" id="cantidadwozx" aria-describedby="emailHelp" placeholder="how much WOZX" />
              <a className="btn btn-light"  href="#enviartronwozx" style={{'backgroundColor': 'red','color': 'white','borderBlockColor': 'red'}} onClick={() => this.enviarWozx()}>send WOZX</a>

          </div>

          <hr />

        </div>

      </div>




    );
  }
}
