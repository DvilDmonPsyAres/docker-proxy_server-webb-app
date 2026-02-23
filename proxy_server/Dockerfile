#escogemos una base ligera tambien un sistema operativo
FROM node:20-alpine

#direccionamos a la carpeta de nuestro proyecto
WORKDIR /proxy_server

#COPIAMOS EL .PACKAGE.JSON
COPY package*.json ./

#instalamos las dependencias
RUN npm install

#COPIAMOS EL RESTO DEL PROYECTO
COPY . .

#EXPONEMOS EL PUERTO AL PUBLICO O BUENO A NUESTRO HOST
EXPOSE 3001

#EJECUTAMOS EL PROYECTO EN EL CONTENEDOR
CMD ["node", "proxy-server.js"]

#LISTO AHORA CREEMOS EL COMPOSE DE DOCKER
