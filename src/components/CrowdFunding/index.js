import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import querystring from 'querystring';
import sha512 from 'sha512';

var amountTrx;
var ratetrx = "";
var ratewozx = "";
var cantidadusd = "";

var descuento = 0.002;

var proxyUrl = 'https://proxy-wozx.herokuapp.com/';

var AccessOrigin = '*';

const KEY  = cons.API_KEY;
const SECRET  = cons.secretKey;

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      amountTrx: "",
      usdtrx: "",

    }

    this.deposit = this.deposit.bind(this);
    this.firma = this.firma.bind(this);
    this.rateWozx = this.rateWozx.bind(this);
    this.comprarWozx = this.comprarWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.venderTRX = this.venderTRX.bind(this);
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
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
      ratetrx = ratetrx-ratetrx*0.01;
      ratetrx = ratetrx.toString();
      //console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));


  }

  async venderTRX(){    

    await this.rateTRX();
    
    amountTrx = document.getElementById("amount").value;
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
      cantidadusd = precioTrx*cantidadTrx-precioTrx*cantidadTrx*descuento;
      //console.log(cantidadusd);

      if (data.result === "true") {
        this.comprarWozx(cantidadusd);
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
      ratewozx = ratewozx+ratewozx*0.01;
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
      //console.log(data);

      var cantidadWozx=parseFloat(data.filledAmount);
      var cantidadWozx2=parseFloat(data.leftAmount);
      cantidadWozx=cantidadWozx+cantidadWozx2;

      console.log(cantidadWozx)
      var orden = window.tronWeb.sha3(data.orderNumber.toString());
      //console.log(orden);
      if (data.result === "true") {
        this.deposit(cantidadWozx, orden);
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
          document.getElementById('sponsor').value = get['ref'];            
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
  
    await Utils.contract.deposit(orden, orden.toString(), wallet, sponsor, firma, firma2, firma3).send({
      shouldPollResponse: true,
      callValue: amount * 1000000 // converted to SUN
    });

    
  };

  async firma() {
    console.log(await window.tronWeb.sha3('0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'));
  }

  render() {
    
    return (
      
      <div className="card wow bounceInUp">
          <i className="fa fa-diamond"></i>
        <div className="card-body">
          <h5 className="card-title">Diamante</h5>
          <h6 className="card-text">
            Retorno: <strong>200%</strong><br></br>
            <strong>2%</strong> por día<br></br>
          </h6>
            <form>
              <div className="form-group">
                <input type="text" className="form-control" id="amount" placeholder="Min. 50 TRX"></input>
                <p className="card-text">Debes tener ~10 TRX para hacer la transacción</p>
              </div>
            </form>
          <button type="button" className="btn btn-light" onClick={() => this.venderTRX()}>Invertir</button>
          <button type="button" className="btn btn-light" onClick={() => this.firma()}>firma</button>
        </div>
      </div>

    );
  }
}
