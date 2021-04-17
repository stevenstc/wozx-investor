import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";

import cons from "../../cons.js";
import TronWeb2 from 'tronweb';

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


export default class PanelOwner extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isowner: false,
      retiros: "",
      saldo: 0
    };

    this.isOwner = this.isOwner.bind(this);
    this.pararRetiros = this.pararRetiros.bind(this);

    this.asignarTron = this.asignarTron.bind(this);
    this.retirarTron = this.retirarTron.bind(this);

    this.asignarWozx = this.asignarWozx.bind(this);
    this.retirarWozx = this.retirarWozx.bind(this);

  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    setInterval(() => this.isOwner(),10*1000);
  };

  async isOwner() {

    var ownerContrato = await Utils.contract.owner().call();
    ownerContrato = window.tronWeb.address.fromHex(ownerContrato);

    var ownerTronlink = await window.tronWeb.trx.getAccount();
    ownerTronlink = window.tronWeb.address.fromHex(ownerTronlink.address);

    if (ownerContrato === ownerTronlink) {
      let sal = await Utils.contract.InContract().call();
      sal = parseInt(sal._hex)/1000000;
      //console.log(sal);
      let si = await Utils.contract.Do().call();

      if (si) {
        this.setState({
          retiros: "Deshabilitar retiros"
        });
      }else{
        this.setState({
          retiros: "Habilitar retiros"
        });
      }

      this.setState({
        saldo: sal,
        isowner: true

      });
    }else{
      this.setState({
        isowner: false

      });
    }


  };

  async pararRetiros() {

    await Utils.contract.stopWithdrawl().send();
    let si = await Utils.contract.Do().call();

    if (si) {
      this.setState({
        retiros: "Deshabilitar retiros y depositos"

      });
      alert("Los retiros y depositos han sido Habilitados")
    }else{
      this.setState({
        retiros: "Habilitar retiros y depositos"

      });
      alert("Los retiros y depositos han sido Deshabilitados")
    }


  };

  async sacarSaldo() {

    await Utils.contract.withdrawAll().send();

  };

  async asignarTron() {

    var dirTron = document.getElementById("paneltrx").value;
    var cantidadTron = document.getElementById("paneltrxnumber").value;
    var result = window.confirm("Seguro?! desea asignar "+cantidadTron+" TRX a la wallet: "+dirTron);
    if (result) {
      var contractApp = await tronApp.contract().at(contractAddress);

      var id = await contractApp.depositoTronUsuario(dirTron, parseInt(cantidadTron*1000000)).send();
      window.alert("TRX: +"+cantidadTron+" wallet: "+dirTron+" hash: "+id);

    }

  };

  async retirarTron() {

    var dirTron = document.getElementById("paneltrx").value;
    var cantidadTron = document.getElementById("paneltrxnumber").value;
    var result = window.confirm("Seguro?! desea retirar "+cantidadTron+" TRX a la wallet: "+dirTron);
    if (result) {
      var contractApp = await tronApp.contract().at(contractAddress);

      var id = await contractApp.depositoTronUsuario(dirTron, parseInt(cantidadTron*1000000)).send();
      window.alert("TRX: -"+cantidadTron+" wallet: "+dirTron+" hash: "+id);

    }

  };

  async asignarWozx() {

    var dirWozx = document.getElementById("panelwozx").value;
    var cantidadWozx = document.getElementById("panelwozxnumber").value;
    var result = window.confirm("Seguro?! desea asignar "+cantidadWozx+" wozx a la wallet: "+dirWozx);
    if (result) {
      var contractApp = await tronApp.contract().at(contractAddress);

      var id = await contractApp.depositoWozx(dirWozx, parseInt(cantidadWozx*1000000)).send();
      window.alert("WOZX: +"+cantidadWozx+" wallet: "+dirWozx+" hash: "+id);

    }

  };

  async retirarWozx() {

    var dirWozx = document.getElementById("panelwozx").value;
    var cantidadWozx = document.getElementById("panelwozxnumber").value;
    var result = window.confirm("Seguro?! desea asignar "+cantidadWozx+" wozx a la wallet: "+dirWozx);
    if (result) {
      var contractApp = await tronApp.contract().at(contractAddress);

      var id = await contractApp.depositoWozx(dirWozx, parseInt(cantidadWozx*1000000)).send();
      window.alert("WOZX: -"+cantidadWozx+" wallet: "+dirWozx+" hash: "+id);

    }

  };


  render() {
    const { isowner, retiros, saldo } = this.state;
    if (isowner) {
      return (
      <div className="container">
        <div className="row">
          <div className="col-twelve">
            <h5 className="card-title">Panel Owner</h5>
          </div>
        </div>

        <div className="row">
          <div className="col-six">
            <button type="button" className="btn btn-info" onClick={() => this.pararRetiros()}>{retiros}</button><hr></hr>
          </div>

          <div className="col-six">
            <button type="button" className="btn btn-info" onClick={() => this.sacarSaldo()}>Sacar {saldo} TRX</button>
          </div>
        </div>

        <div className="row">
          <div className="col-six">
            <h5 className="card-title">Panel TRX</h5>
            <input type="text" className="form-control" id="paneltrx" placeholder="TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"></input>
            <input type="number" className="form-control" id="paneltrxnumber" placeholder="0"></input>
            <button type="button" className="btn btn-info" onClick={() => this.asignarTron()}>asignar TRX</button>
          </div>

          <div className="col-six">
            <h5 className="card-title">Panel WOZX</h5>
            <input type="text" className="form-control" id="panelwozx" placeholder="TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"></input>
            <input type="number" className="form-control" id="panelwozxnumber" placeholder="0"></input>
            <button type="button" className="btn btn-info" onClick={() => this.asignarWozx()}>asignar WOZX</button>
          </div>
        </div>
      </div>);
    }else{
      return (
        <>
        </>
        );

    }

  };
}
