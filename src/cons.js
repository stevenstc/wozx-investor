import {APP_AK, APP_SK, APP_WO} from "@env";

const AK = APP_AK;
const SK = APP_SK;
const WO = APP_WO;
const proxy = "https://proxy-ewozx.herokuapp.com/";
const PRU = "shasta.";// shasta1. para inhabilitar red de pruebas
const WS = "T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb";//T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb recibe los huerfanos por defecto
const descuento = 0.002;// 0.24 o 24% queda en la plataforma el restante se usa para comprar el 76% en wozx para los usuarios
const WOZX = 0.07; // para que el WOZX se Compre de inmediato
const TRX = 0.035; // para que el TRX se Venda de inmediato
const SC = "TANqX8PXtt1kYYDAZjXzHASTPtStf8Bw29";// direccion del contrato
const USD = 1; // minimo de inversion en dolares USD (100)
const SD = 0.1; // 10% de sensibilidad para modificar el precio minimo de inversion
const EX = "TB7RTxBPY4eMvKjceXj8SWjVnZCrWr4XvF"; //wallet de of exchange

const FEEW = 4; //fee de retiro del wozx por la platafora de ethereum
const FEET = 10; //fee de retiro del Tron por medio del contrato

export default {AK, SK, WO, proxy, PRU, WS, descuento, WOZX, TRX, SC, USD, SD, EX, FEEW, FEET};
