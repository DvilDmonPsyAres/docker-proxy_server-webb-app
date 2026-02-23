# escogemos una base ligera
FROM node:20-slim

#DIRECCIONAMOS AL DIRECTORIO DENTRO DEL CONTENEDOR
WORKDIR /web_app

#copiamos package.json
COPY package*.json ./

#INSTALAMOS DEPENDENCIAS EN EL CONTENEDOR
RUN npm install

#COPIAMOS EL RESTO DEL PROYECTO
COPY . . 

#EXPONEMOS EL PUERTO INTERNO (solo entre contenedores)
EXPOSE 3000

#COMANDOS DE ARRANQUE
CMD ["sh", "-c", "node init-db.js && node app.js"]
