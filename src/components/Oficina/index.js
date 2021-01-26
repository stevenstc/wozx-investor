import React, { Component } from "react";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import Utils from "../../utils";
import contractAddress from "../Contract";


export default class WozxInvestor extends Component {
  constructor(props) {
    super(props);

    this.state = {
      ratetrx: "",
      ratewozx: "",
      datos: {},
      direccion: "",
      link: "Haz una inversión para obtener el LINK de referido",
      registered: false,
      balanceTrx: "0",
      withdrawnTrx: "0",
      investedWozx: "0",
      withdrawnWozx: "0"

    };

    this.Investors = this.Investors.bind(this);
    this.enviarWozx = this.enviarWozx.bind(this);
    
    
  }

  async componentDidMount() {
    await Utils.setContract(window.tronWeb, contractAddress);
    this.Investors();
    setInterval(() => this.Investors(),10000);
  };

  async Investors() {

    let direccion = await window.tronWeb.trx.getAccount();
    let esto = await Utils.contract.investors(direccion.address).call();
    this.setState({
      direccion: window.tronWeb.address.fromHex(direccion.address),
      registered: esto.registered,
      balanceTrx: parseInt(esto.balanceTrx._hex)/1000000,
      withdrawnTrx: parseInt(esto.withdrawnTrx._hex)/1000000,
      investedWozx: parseInt(esto.investedWozx._hex)/1000000,
      withdrawnWozx: parseInt(esto.withdrawnWozx._hex)/1000000
    });

  };

  async enviarWozx(){
    let direccion = document.getElementById("enviartronwozx").value;
    var cantidad = document.getElementById("cantidadwozx").value;

    cantidad = parseInt(cantidad*1000000);

    await Utils.contract.enviarWozx(direccion, cantidad).send();

    document.getElementById("cantidadwozx").value = "";
  }


  render() {
    const { balanceTrx, withdrawnTrx, investedWozx,  withdrawnWozx , direccion, link} = this.state;

    return (
      
      <div className="container">

        <header style={{'text-align': 'center'}} className="section-header">
          <h3 className="white"><span style={{'font-weight': 'bold'}}>
          My office:</span> <br></br>
          <span style={{'font-size': '18px'}}>{direccion}</span></h3><br></br>
          <h3 className="white" style={{'font-weight': 'bold'}}>Referral link:</h3>
          <h6 className="white" ><a href={link}>{link}</a>&nbsp;<br></br><br></br>
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

          <div className="col-eight">
            
              <h3 className="display-2--light"> Send WOZX to:</h3>
              <input type="text" className="form-control" id="enviartronwozx" aria-describedby="emailHelp" placeholder="TBEhx2CjKcr62Zg4PnEm5FQMr2EVrUfXoM" />
              <small id="emailHelp" className="form-text text-muted">make sure the address is well written, once sent, this action cannot be reversed</small>

            
          </div>

          <div className="col-four">

              <h3 className="display-2--light"> Available {investedWozx} </h3>
              <input type="number" className="form-control" id="cantidadwozx" aria-describedby="emailHelp" placeholder="how much WOZX" />
              <a className="btn btn-light"  href="#enviartronwozx" onClick={() => this.enviarWozx()}>send WOZX</a>
            
          </div>

          <hr />
          
        </div>

      </div>
    



    );
  }
}
