// invocamos las dependencias para utilizarlas en este proyecto

const http = require("http");
const httpProxy = require("http-proxy");

//creamos el proxy server para que escuche en el puerto local donde nuestra otra aplicacion esta corriendo
const proxy = httpProxy.createProxyServer({ target: "http://localhost:3000" });

//servidor proxy

const server = http.createServer((req, res) => {
  //configuramos las tareas de nuestro proxy server
  console.log(`Solicitud entrante: ${req.method} ${req.url} en ${new Date()}`);

  //ejemplo de politic para rechazar la falta de autenticacion
  if (!req.headers["authorization"]) {
    res.writeHead(401);
    res.end("Authorizacion requerida");
    return;
  }

  // reenvio al servicio principal - nuestra otra aplicacion que serviremos de proxy server
  proxy.web(req, res);
});

// manejo de errores
proxy.on("error", (err, req, res) => {
  res.writeHead(500);
  res.end("Error en el proxy");
});

// cargamos el puerto donde nuestro proxy server estara corriendo

server.listen(3001, () => {
  console.log("Proxy sidecar corriendo en puerto 3001");
});

//listo probemos
//olvide el nombre :)

//funciona :)
