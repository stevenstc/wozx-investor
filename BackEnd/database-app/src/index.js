const express = require('express')
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const TronWeb = require('tronweb');

const app = express();
const port = process.env.PORT || 3003;
const token = process.env.APP_MT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb+srv://userwozx:wozx1234567890@ewozx.neief.mongodb.net/registro';
const options = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, options).then(
  () => { console.log("Conectado Exitodamente!");},
  err => { console.log(err); }
);

var user = mongoose.model('usuarios', {
        direccion: String,
        registered: Boolean,
        sponsor: String,
        exist: Boolean,
        ethereum: String,
        eth: Boolean,
        rango: Number,
        recompensa: Boolean,
        nivel: [Number],
        balanceTrx: Number,
        withdrawnTrx: Number,
        investedWozx: Number,
        withdrawnWozx: Number,
        wozxPendig: Number,
        p: Boolean,
        historial: [{
            tiempo: Number,
            valor: Number,
            moneda: String,
            accion: String

        }]

    });

  var aplicacion = mongoose.model('aplicacions', {
          nombre: String,
          wozxSaldo: Number,
          wozxSaldoAsignado: Number,
          wozxSaldoRecibido: Number,
          wozxSaldoRetirado: Number,
          tronSaldo: Number,
          tronSaldoAsignado: Number,
          tronSaldoRecibido: Number,
          tronSaldoRetirado: Number,
          permitirRegistros: Boolean,
          permitirRetiros: Boolean,
          depositoMinimo: Number

      });

var usuariobuscado = 'TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF';

app.get('/', async(req,res) => {

    mongoose.connect(uri, options).then(
      () => { res.send("Conectado a mongoDB Exitodamente!");},
      err => { res.send(err); }
    );


});


app.get('/consultar/todos', async(req,res) => {

    usuario = await user.find({}, function (err, docs) {});

    console.log(usuario);

    res.send(usuario);

});

app.get('/consultar/ejemplo', async(req,res) => {

    usuario = await user.find({ direccion: usuariobuscado }, function (err, docs) {});

    console.log(usuario);

    res.send(usuario[0]);

});

app.get('/consultar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let respuesta = {};
    usuario = await user.find({ direccion: cuenta }, function (err, docs) {});

    //console.log(usuario);

    if ( usuario == "" ) {


        respuesta.status = "200";
        respuesta.txt = "Esta cuenta no está registrada";
        res.status(200).send(respuesta);

    }else{
        respuesta = usuario[0];
        res.status(200).send(respuesta);
    }

});

app.post('/registrar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let sponsor = req.body.sponsor;
    let token2 = req.body.token;
    let respuesta = {};
    respuesta.status = "200";

    usuario = await user.find({ direccion: cuenta }, function (err, docs) {});

    if (await TronWeb.isAddress(cuenta) && token == token2) {

        if ( usuario != "" ) {
            respuesta.status = "303";
            respuesta.txt = "Cuenta ya registrada";
            respuesta.usuario = usuario[0];

            res.send(respuesta);

        }else{

             var users = new user({
                direccion: cuenta,
                registered: true,
                sponsor: sponsor,
                exist: false,
                ethereum: '',
                eth: false,
                rango: 0,
                recompensa: false,
                nivel: [0,0,0,0,0,0,0,0,0,0],
                balanceTrx: 0,
                withdrawnTrx: 0,
                investedWozx: 0,
                withdrawnWozx: 0,
                wozxPendig: 0,
                p: false,
                historial: [{
                    tiempo: Date.now(),
                    valor: 50,
                    moneda: 'TRX',
                    accion: 'Cost register in plataform'

                }]
            });

            users.save().then(() => {
                respuesta.status = "200";
                respuesta.txt = "Usuario creado exitodamente";
                respuesta.usuario = users;

                res.send(respuesta);
            });

        }
    }else{
        respuesta.txt = "Ingrese una direccion de TRX";
        res.send(respuesta);
    }


});


app.post('/actualizar/:direccion', async(req,res) => {

    let cuenta = req.params.direccion;
    let token2 = req.body.token;
    let datos = req.body

    if ( token == token2 ) {
      usuario = await user.updateOne({ direccion: cuenta }, datos);
      res.send(usuario);

    }else{
      res.send("No autorizado");

    }

});

app.get('/registrar/aplicacion', async(req,res) => {

    let cuenta = "ewozx";

    let respuesta = {};
    respuesta.status = "200";

    var miApp = await aplicacion.find({ nombre: cuenta }, function (err, docs) {});

    if ( miApp != "" ) {
        respuesta.status = "303";
        respuesta.txt = "Aplicacion ya registrada";
        respuesta.usuario = miApp[0];

        res.send(respuesta);

    }else{

         var apps = new aplicacion({
           nombre: cuenta,
           wozxSaldo: 0,
           wozxSaldoAsignado: 0,
           wozxSaldoRecibido: 0,
           wozxSaldoRetirado: 0,
           tronSaldo: 0,
           tronSaldoAsignado: 0,
           tronSaldoRecibido: 0,
           tronSaldoRetirado: 0,
           permitirRegistros: true,
           permitirRetiros: true,
           depositoMinimo: 0
        });

        apps.save().then(() => {
            respuesta.status = "200";
            respuesta.txt = "Aplicacion creada exitodamente";
            respuesta.usuario = apps;

            res.send(respuesta);
        });

    }



});


app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))
