import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";

import querystring from 'querystring';
import sha512 from 'sha512';
import TronWeb2 from 'tronweb';

var tantoTrx = 0.02;// para que el TRX se Venda de inmediato
var tantoWozx = 0.02;// para que el WOZX se venda de inmediato

var ratetrx = "";
var ratewozx = "";
var proxyUrl = 'https://proxy-wozx.herokuapp.com/';

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
    this.venderWozx = this.venderWozx.bind(this);
    this.rateTRX = this.rateTRX.bind(this);
    this.comprarTRX = this.comprarTRX.bind(this);
    this.enviarTron = this.enviarTron.bind(this);
    
    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.Investors();
    this.Link();
    setInterval(() => this.Investors(),10000);
    setInterval(() => this.Link(),10000);
  };

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
      ratewozx = ratewozx - ratewozx*tantoWozx;
      ratewozx = ratewozx.toString();
      //console.log(ratewozx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratewozx: ratewozx
    });

  }

  async venderWozx(){   
    await this.rateWozx();
    const {investedWozx} = this.state;
    
    let amount = investedWozx; 

    amount = amount.toString();
    let currencyPair = "wozx_usdt";

    let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratewozx,'amount':amount});

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
      var cantidadWozx=parseFloat(data.filledAmount);
      var cantidadWozx2=parseFloat(data.leftAmount);
      cantidadWozx=cantidadWozx+cantidadWozx2;
      var precioWozx=parseFloat(data.filledRate);
      var cantidadusd = precioWozx*cantidadWozx;
      if (data.result === "true") {
        console.log(cantidadusd)
        this.comprarTRX(cantidadusd);
      }
    })
    .catch(error => console.log('Error:', error));
    

  }

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
      ratetrx = parseFloat(ratetrx);
      ratetrx = ratetrx+ratetrx*tantoTrx;
      ratetrx = ratetrx.toString();
      console.log(ratetrx);
    })
    .catch(error => console.log('Error:', error));

    this.setState({
      ratetrx: ratetrx
    });

  }

  async comprarTRX(c){    

    await this.rateTRX();
    
    let amount = c/parseFloat(ratetrx).toFixed(6);

    amount = amount.toString();
    console.log(amount);
    let currencyPair = "trx_usdt";

    let body = querystring.stringify({'currencyPair':currencyPair,'rate':ratetrx,'amount':amount});

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
      var cantidadTrx=parseFloat(data.filledAmount);
      var cantidadTrx2=parseFloat(data.leftAmount);
      cantidadTrx=cantidadTrx+cantidadTrx2;
      
      console.log(cantidadTrx);

      if (data.result === "true") {
        this.enviarTron(cantidadTrx);
      }
    })
    .catch(error => console.log('Error:', error));
    

  }

  async enviarTron(trx){

    //enviar el tron a la direccion del contrato
    let wallet = await window.tronWeb.trx.getAccount();
    wallet = window.tronWeb.address.fromHex(wallet.address)
    let contract = await tronApp.contract().at(contractAddress);//direccion del contrato para la W app
    await contract.wozxToTron(wallet, parseInt(ratetrx*1000000), parseInt(ratewozx*1000000)).send();
    console.log("se envio "+trx+" tron a "+wallet+" exitosamente")

    let amount = trx;

    amount = amount.toString();
    let currency = "trx";

    // envia el saldo necesario a la direccion del contrato
    // let address = contractAddress;
    let address ="TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF";

    let body = querystring.stringify({'currency':currency,'amount':amount, 'address':address});

    let header = {'Content-Type': 'application/x-www-form-urlencoded'};

    var hasher = sha512.hmac(SECRET);
    var hash = hasher.finalize(body);
    var firma = hash.toString('hex');

    header.KEY = KEY;
    header.SIGN = firma;
    await fetch(proxyUrl+'https://api.gateio.life/api2/1/private/withdraw',{method: 'POST', headers: header, body:body })
    .then(res => res.json())
    .then(data => {
      console.log(data);
    })
    .catch(error => console.log('Error:', error));
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
      balanceTrx: parseInt(esto.balanceTrx._hex)/1000000,
      investedWozx: parseInt(esto.investedWozx._hex)/1000000,
      mywithdrawableWozx: parseInt(My.amount._hex)/1000000
    });

  };

  async withdraw(){
    await Utils.contract.withdraw().send()
  };


  render() {
    const { balanceTrx, investedWozx} = this.state;

    return (
      
      <div className="container">

        <div id="invested_wozx2" className="row">

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
              <h3 className="display-2--light">Disponible: <br></br>{investedWozx} WOZX</h3>
  
              <button type="button" className="btn btn-info" onClick={() => this.venderWozx()}>Sell all WOZX (TRX)</button>
              <button type="button" className="btn btn-info" onClick={() => void(0)}>withdrawal WOZX (ETH)</button>
              <hr></hr>
      
            </div>
          </div>

          <div className="subhead" data-wow-duration="1.4s">
            <div className="box">
              <h3 className="display-2--light">Disponible: <br></br>{balanceTrx} TRX</h3>
              <button type="button" className="btn btn-info" onClick={() => this.withdraw()}>withdrawal TRX</button>
              <hr></hr>
            </div>
          </div>
          

        </div>

      </div>
    



    );
  }
}
