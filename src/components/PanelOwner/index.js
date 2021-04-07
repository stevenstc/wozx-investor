import React, { Component } from "react";
import Utils from "../../utils";
import contractAddress from "../Contract";


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


  render() {
    const { isowner, retiros, saldo } = this.state;
    if (isowner) {
      return (
      <div className="container">
        <div className="row">
          <div className="col-six">
            <h5 className="card-title">Panel Owner</h5>
            <button type="button" className="btn btn-info" onClick={() => this.pararRetiros()}>{retiros}</button><hr></hr>
            <button type="button" className="btn btn-info" onClick={() => this.sacarSaldo()}>Sacar {saldo} TRX</button>
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
