import React, { Component } from "react";

import Utils from "../../utils";
import contractAddress from "../Contract";

export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      historial: []

    }

    this.verHistorial = this.verHistorial.bind(this);
    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.verHistorial();
    setInterval(() => this.verHistorial(),360*1000);
  };


  async verHistorial(){

    var {historial} = this.state;

    var account =  await window.tronWeb.trx.getAccount();
    var accountAddress = account.address;
    accountAddress = window.tronWeb.address.fromHex(accountAddress);

    var investors = await Utils.contract.investors(accountAddress).call();
    
    if ( investors.registered ) {

      var cont = await Utils.contract.contadorHistorial().call();
      //console.log(cont);
      //console.log(parseInt(cont.cantidad._hex));
      if (cont.res && parseInt(cont.cantidad._hex) > 0 ) {
        historial.splice(0);
        var o = 0
        if (parseInt(cont.cantidad._hex) > 10) {
          o = parseInt(cont.cantidad._hex)-10;
        }
        for (var i = o; i < parseInt(cont.cantidad._hex); i++) {

          var ver = await Utils.contract.miHistorial(i).call();
          //console.log(ver);
          ver.valor = parseInt(ver.valor._hex)/1000000;
          ver.tiempo = Date(parseInt(ver.tiempo._hex));
          //console.log(ver);

          let evento = (
            <div className="col-full" key={i.toString()}>
              <span style={{fontSize: '18px'}} title={ver.tiempo}> {ver.valor} | {ver.moneda} | {ver.operacion} </span>
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



