import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";


import cons from "../../cons.js";

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
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
    this.comprarWozx = this.comprarWozx.bind(this);
    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.Investors(),1000);
    setInterval(() => this.Link(),1000);
  };

  async comprarWozx(){

    var proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    var targetUrl = 'https://data.gateapi.io/api2/1/marketlist';

      function esWozx(cripto) {
          return cripto.symbol === 'WOZX';
      }

    fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(data => {
        console.log(data.data.find(esWozx).rate);
        return data;
      })
      .catch(e => {
        console.log(e);
        return e;
      });
      function esTrx(cripto) {
          return cripto.symbol === 'TRX';
      }

    fetch(proxyUrl + targetUrl)
      .then(blob => blob.json())
      .then(data => {
        console.log(data.data.find(esTrx).rate);
        return data;
      })
      .catch(e => {
        console.log(e);
        return e;
      });

    


      const GateApi = require('gate-api');
const client = new GateApi.ApiClient();
// uncomment the next line to change base path
// client.basePath = "https://some-other-host"

const api = new GateApi.DeliveryApi(client);
const settle = "usdt"; // 'usdt' | Settle currency
api.listDeliveryContracts(settle, 
  {headers: {
      'Content-Type': 'Not defined',
      'Accept': 'application/json'
    }})
   .then(value => console.log('API called successfully. Returned data: ', value.body),
         error => console.error(error));


   /*
     const token = '111111111111111111'; //token from local.storage 
       //const hash = Base64.encode(token);
        //const Basic = 'Basic ' + hash;
        const username= 'john.asd@gmail.com';
        const password= 'aZdfgHkL12'
        const url= "https://beta.application.com/api/v1/projects/";

        axios.get
            axios({
                "url": url,
                "withCredentials": true,
                "method": "GET",
                "headers": {
                    'Authorization': `Bearer ${token}`
                },
                "auth": {
                    username: username,
                    password: password
                }
            })
            .then(response => {
                this.setState({
                    projects: response
                });
            })
            .catch(error => {
                console.log('error');
            })
        }
   */

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

    let direccion = await window.tronWeb.trx.getAccount();
    let esto = await Utils.contract.investors(direccion.address).call();
    let My = await Utils.contract.MYwithdrawable().call();
    //console.log(esto);
    //console.log(My);
    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceRef: parseInt(esto.balanceRef._hex)/1000000,
      totalRef: parseInt(esto.totalRef._hex)/1000000,
      invested: parseInt(esto.invested._hex)/1000000,
      paidAt: parseInt(esto.paidAt._hex)/1000000,
      my: parseInt(My.amount._hex)/1000000,
      withdrawn: parseInt(esto.withdrawn._hex)/1000000
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

        <div className="row">

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-analytics-outline" style={{color: '#ff689b'}}></i></div>
              <h4 className="title"><a href="#services">{invested} TRX</a></h4>
              <p className="description">Total invertido</p>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-bookmarks-outline" style={{color: '#e9bf06'}}></i></div>
              <h4 className="title"><a href="#services">{totalRef} TRX</a></h4>
              <p className="description">Total ganancias por referidos</p>
            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Mi balance</p>
              <h4 className="title"><a href="#services">{my} TRX</a></h4>
              
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-paper-outline" style={{color: '#3fcdc7'}}></i></div>
              <p className="description">Balance por referidos</p>
              <h4 className="title"><a href="#services"> {balanceRef} TRX</a></h4>
              
            </div>
          </div>

          <div className="col-md-6 col-lg-5 offset-lg-1 wow bounceInUp" data-wow-delay="0.1s" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-speedometer-outline" style={{color:'#41cf2e'}}></i></div>
              <h4 className="title"><a href="#services">Disponible</a></h4>
              <p className="description">{balanceRef+my} TRX <button type="button" className="btn btn-info" onClick={() => this.comprarWozx()}>llamar API</button></p>
            </div>
          </div>
          <div className="col-md-6 col-lg-5 wow bounceInUp" data-wow-delay="0.2s" data-wow-duration="1.4s">
            <div className="box">
              <div className="icon"><i className="ion-ios-clock-outline" style={{color: '#4680ff'}}></i></div>
              <h4 className="title"><a href="#services">Retirado</a></h4>
              <p className="description">{withdrawn} TRX</p>
            </div>
          </div>

        </div>

      </div>
    



    );
  }
}
