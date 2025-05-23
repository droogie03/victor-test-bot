# Usa la imagen oficial de Node.js
FROM node:21

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /

# Copia los archivos de tu proyecto al contenedor
COPY package*.json ./
RUN npm install

# Copia el resto de tu código
COPY . .
COPY .env .env
# Expón el puerto si lo necesitas (opcional)
# EXPOSE 3000

# Comando para ejecutar tu app
CMD [ "npm", "run", "dev" ]
