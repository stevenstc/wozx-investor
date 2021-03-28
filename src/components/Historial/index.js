import React, { Component } from "react";

import Utils from "../../utils";
import contractAddress from "../Contract";
import cons from "../../cons.js";

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      historial: []

    }

    this.verHistorial = this.verHistorial.bind(this);
    this.consultarUsuario = this.consultarUsuario.bind(this);

  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.verHistorial();
    setInterval(() => this.verHistorial(),360*1000);
  };

  async consultarUsuario(direccionTRX, otro){

    var proxyUrl = cons.proxy;
    var apiUrl = 'https://ewozx-mdb.herokuapp.com/consultar/'+direccionTRX;
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

  async verHistorial(){

    var { historial } = this.state;

    var direccion =  await window.tronWeb.trx.getAccount();
    direccion = window.tronWeb.address.fromHex(direccion.address);

    var usuario =  await this.consultarUsuario(direccion, false);

    if ( usuario.registered ) {

      if ( usuario.historial.length > 0) {
        historial.splice(0);
        var o = 0
        if (usuario.historial.length > 10) {
          o = usuario.historial.length-10;
        }
        for (var i = o; i < usuario.historial.length; i++) {

          var ver = usuario.historial[i];
          ver.tiempo = new Date(ver.tiempo);
          var pru = "";
          if (cons.PRU === "shasta.") {
            pru = cons.PRU;
          }
          ver.link = "https://"+pru+"tronscan.io/#/transaction/"+ver.link
          //console.log(ver);

          let evento = (

              <div className="col-full" key={i.toString()}>
                <a href={ver.link} target="_blank" rel="noopener noreferrer">
                  <span style={{fontSize: '18px'}} title={ver.tiempo}> {ver.valor} | {ver.moneda} | {ver.accion} </span>
                </a>
              </div>

          );
          historial.splice(0,0,evento);
          this.setState({
            historial: historial
          });

        }

      }
    }





  };

  render() {
    var { historial } = this.state;

    const divStyle = {
      width: '100%',
      height:'115px',
      overflow: 'scroll'
    };

    return (

      <div>
        <h3>Transactions <button type="button" className="btn btn-light" onClick={() => this.verHistorial()}>Reload</button></h3>

        <div style={divStyle}>

          {historial}

        </div>
      </div>

    );
  }
}
