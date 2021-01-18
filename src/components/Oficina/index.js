import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import querystring from 'querystring';
import sha512 from 'sha512';

var ratetrx = "";
var ratewozx = "";
var proxyUrl = 'https://proxy-wozx.herokuapp.com/';

const KEY  = cons.API_KEY;
const SECRET  = cons.secretKey;

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ratetrx: "",
      estado:{
        result:false,
        texto1:"cargando.",
        texto2:"cargando..",
        texto3:"cargando...",
      },
      ratewozx: "",
      datos: {},
      direccion: "",
      link: "Haz una inversión para obtener el LINK de referido",
      registered: false,
      balanceRef: 0,
      totalRef: 0,
      invested: 0,
      paidAt: 0,
      my: 0,
      withdrawn: 0

    };

    this.Investors = this.Investors.bind(this);
    this.Link = this.Link.bind(this);
    this.withdraw = this.withdraw.bind(this);
    this.rateWozx = this.rateWozx.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
    this.prueba = this.prueba.bind(this);
    
    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.Investors();
    this.Link();
    setInterval(() => this.Investors(),10000);
    setInterval(() => this.Link(),10000);
  };

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
      ratetrx = parseFloat(ratetrx).toFixed(6);
      ratetrx = ratetrx-ratetrx*0.01;
      ratetrx = ratetrx.toString();
      //console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratetrx: ratetrx
    });

  }

  async venderTRX(){    

    await this.rateTRX();
    
    let amount = "40";
    let currencyPair = "trx_usdt";

    let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratetrx,'amount':amount});

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
    })
    .catch(error => console.log('Error:', error));
    

  }

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
      ratewozx = ratewozx+ratewozx*0.01;
      ratewozx = ratewozx.toString();
      //console.log(ratewozx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratewozx: ratewozx
    });

  }

  async comprarWozx(){    

    await this.rateWozx();
    
    let amount = "1";
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
    })
    .catch(error => console.log('Error:', error));
    

  }

  async prueba(){ 
  /* 
    await request(
      { url: 'https://data.gateio.life/api2/1/marketlist' },
      (error, response, body) => {
        if (error || response.statusCode !== 200) {
          console.log(error)
        }

        console.log(response);
        console.log(body);
        //JSON.parse(body)

        
      }
    )*/

    // Ejemplo implementando el metodo POST:
async function postData(url = '', data = {}) {
  // Opciones por defecto estan marcadas con un *
  const response = await fetch(url, {
    method: 'GET', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      "Access-Control-Allow-Origin": "*",
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept-Language' : 'x-requested-with'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'origin', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    //body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

postData('https://data.gateio.life/api2/1/marketlist', {})
  .then(data => {
    console.log(data); // JSON data parsed by `data.json()` call
  });
  }

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

    let direccion = await window.tronWeb.trx.getAccount();
    let esto = await Utils.contract.investors(direccion.address).call();
    let My = await Utils.contract.MYwithdrawable().call();
    //console.log(esto);
    //console.log(My);
    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceRef: parseInt(esto.balanceTrx._hex)/1000000,
      totalRef: parseInt(esto.withdrawnTrx._hex)/1000000,
      invested: parseInt(esto.investedWozx._hex)/1000000,
      my: parseInt(My.amount._hex)/1000000,
      withdrawn: parseInt(esto.withdrawnWozx._hex)/1000000
    });

  };

  async withdraw(){
    await Utils.contract.withdraw().send()
  };


  render() {
    const { balanceRef, totalRef, invested,  withdrawn , my, direccion, link} = this.state;

    return (
      
      <div className="container">

        <header style={{'text-align': 'center'}} className="section-header">
          <h3 className="white"><span style={{'font-weight': 'bold'}}>
          Mi Oficina:</span> <br></br>
          <span style={{'font-size': '18px'}}>{direccion}</span></h3><br></br>
          <h3 className="white" style={{'font-weight': 'bold'}}>Link de referido:</h3>
          <h6 className="white" ><a href={link}>{link}</a>&nbsp;
          <CopyToClipboard text={link}>
            <button type="button" className="btn btn-info">COPIAR</button>
          </CopyToClipboard>
          </h6>
          <hr></hr>
          
        </header>

        <div id="invested_wozx" className="row">

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
              <p className="description">Balance</p>
              <h4 className="display-2 display-2--light">{invested} WOZX</h4>
            </div>
          </div>
          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
              <p className="description">Withdrawn</p>
              <h4 className="display-2--light">{totalRef} WOZX</h4>
            </div>
          </div>

          <div className="subhead" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <p className="description">Balance</p>
              <h4 className="display-2--light">{my} TRX</h4>
            </div>
          </div>
          <div className="subhead" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
            <p className="description">Withdrawn</p>
              <h4 className="display-2--light">{balanceRef} TRX</h4>
              
            </div>
          </div>

          <div className="subhead" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <h4 className="display-2--light">Disponible: <br></br>{invested} WOZX</h4>
              <button type="button" className="btn btn-info" onClick={() => this.prueba()}>Vender WOZX</button>
              <button type="button" className="btn btn-info" onClick={() => this.venderTRX()}>Retirar WOZX</button>
      
            </div>
          </div>

          <div className="subhead" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <h4 className="display-2--light">Disponible: <br></br>{invested} TRX</h4>
              <p className="description"> wait time: 0 seconds</p>
              <button type="button" className="btn btn-info" onClick={() => this.comprarWozx()}>Retirar TRX</button>
            </div>
          </div>
          

        </div>

      </div>
    



    );
  }
}
