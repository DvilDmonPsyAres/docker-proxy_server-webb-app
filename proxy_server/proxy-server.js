//IMPORTAMOS LAS DEPENDENCIAS
const http = require("http");
const httpProxy = require("http-proxy");

// configuramos el objetivo al que apuntara nuestro proxyserver
const proxy = httpProxy.createProxyServer({
  target: "http://app:3000", //aqui es donde corre nuestra otra app
  changeOrigin: true,
});

//CONFIGURAMOS LAS RUTAS PUBLICAS QUE NO NECESITARAN SESSION NI COOCKIE
const PUBLIC_ROUTES = ["/", "/login", "/public"];

// METODOS PERMITIDOS EN NUESTRA APP ("hardening básico")
const ALLOWED_METHODS = ["GET", "POST"];

//CREAMOS EL SERVIDOR PROXY

const server = http.createServer((req, res) => {
  //creamos los logs en consola para testear
  console.log("-----NUEVA SOLICITUD-----");
  console.log("IP:", req.socket.remoteAddress);
  console.log("METHOD:", req.method);
  console.log("URL: ", req.url);
  console.log("Cookie: ", req.headers.cookie);
  console.log("User-Agent: ", req.headers["user-agent"]);

  console.log("------------------------------");

  //BLOQUEAMOS LOS METODOS NO PERMITIDOS
  if (!ALLOWED_METHODS.includes(req.method)) {
    res.writeHead(405);
    //log en consola
    console.log("metodo no permitido");
    //log en navergador
    res.end("METODO NO PERMITIDO");
    return;
  }
  //ESTO DEBE IR MAS ARRIBA
  //PROTEGEMOS RUTAS PRIVADAS COMO /private EN NUESTRA APP A proxyservear :)
  if (req.url.startsWith("/private")) {
    //creamos logs para testear
    console.log("routing /private");
    //SI NO HAY COOKIE - NO HAY SESION --- corregimos aqui para que tenga el mismo nombre de sesion FUNCIONAAAAA :) THANKS FOR WATCHING
    if (!req.headers.cookie || !req.headers.cookie.includes("my-session_id")) {
      //redireccionar al /login route de nuestra app a proxyservear
      res.writeHead(302, { Location: "/login" });
      //testeamos en consola la ruta
      console.log("necesitas hacer el login correcto");
      res.end();
      return;
    }
  }

  // FILTRO BASICO CONTRA ESCANEO
  const blockedPaths = ["/.env", "/phpadmin", "/wp-admin", "/.git"];

  if (blockedPaths.some((path) => req.url.includes(path))) {
    //probando las funciones en consola a fin de probar su funcionalidad "testing"
    console.log("probando paths blockeadas para determinar un escaneo");
    //corregimos aqui
    res.writeHead(403);
    res.end("acceso denegado");
  }
  //funciona ahora probemos /private nos envio al login excelente :)
  //DETECCION DE RUTAS PUBLICAS
  const isPublic = PUBLIC_ROUTES.some((route) => req.url.startsWith(route));

  if (isPublic) {
    //CONFIRMAMOS LA RUTO Y ENVIAMOS A NUESTRA APP
    proxy.web(req, res);
    return;
  }

  //LISTO SI PASA TODOS LOS FILTROS VA A NUESTRA EXPRESS APP
  proxy.web(req, res);
});

//MANEJO DE ERRORES
proxy.on("error", (err, req, res) => {
  console.error("ERROR EN PROXY", err.message);
  res.writeHead(500);
  res.end("Error en el proxy");
});
//INICIAMOS EL PROXY

server.listen(3001, () => {
  console.log("Proxy de seguridad corriendo en http:localhost:3001");
});

//LISTO VAMOS A PROBARLO
//AHORA VAMOS A ARRANCAR NUESTRA APP QUE ESCUCHA EN EL PUERTO 3000 AL QUE APUNTA NUESTRO PROXY
