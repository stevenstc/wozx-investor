import {APP_AK, APP_SK, APP_WO, APP_MT} from "@env";

const AK = APP_AK;
const SK = APP_SK;
const WO = APP_WO;
const proxy = "https://proxy-wozx.herokuapp.com/";
const mongo = "https://ewozx-mdb.herokuapp.com/";
const MT = APP_MT;
const PRU = "shasta.";// shasta1. para inhabilitar red de pruebas
const WS = "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF";//T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb recibe los huerfanos por defecto
const descuento = 0.01;// 0.14 es el 14% que queda en la plataforma el restante osea el 86% para comprar wozx y repartir los referidos
const WOZX = 0.07; // para que el WOZX se Compre de inmediato
const TRX = 0.035; // para que el TRX se Venda de inmediato
const SC = "TAHWRwbkVYZmcbeQkG9Zfo5L1SDuHeY4c5";// direccion del contrato
const USD = 1; // minimo de inversion en dolares USD (100)
const SD = 0.1; // 10% de sensibilidad para modificar el precio minimo de inversion
const EX = "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"; //wallet de of exchange

const RW = [0.05, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.005, 0.01]; // niveles y recompensas de cada nivel

const MA = 100; //cantidad minima de tron permitida en la wallet de la aplicación

const CR = 50; // costo de registro en la plataforma trx

const CE = 40; // Cantidad extra de tron que hay que tener para cubrir gastos de energia

const FEEW = 0.001; //fee de retiro del wozx por la platafora de ethereum
const FEET = 0; //fee de retiro del Tron por medio del contrato

const withdrawl = 0.1; //10% de los retiros comision extra
const minWithdrawl = 200;

const habilitarRetirosContrato = false;

export default {
  AK, SK, WO,
   proxy, PRU,
    WS, descuento,
     MA, WOZX, TRX,
      SC, USD, SD, EX,
       FEEW, FEET,
        mongo, MT,
         CR, CE, RW,
          withdrawl, minWithdrawl,
          habilitarRetirosContrato
        };
