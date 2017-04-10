# arqui-chat-app

TEC - S12017 - Arquitectura de Aplicaciones - Tarea Chat

## Aplicación móvil

_Aplicación phonegap con push notifications_

1. Instalar *PhoneGap Desktop* y *PhoneGap Developer App*
http://phonegap.com/getstarted/
2. En PhoneGap Desktop: definir el proyecto en `/app`
2.1. Abrir la consola de logs
3. En PhoneGap Developer App: cargar la URL

Cargar el proyecto en consola (ideal para ver los logs):
```bash
cd app
npm install -g phonegap
phonegap serve
```

Para enviar notificaciones push manualmente:
```bash
phonegap push --deviceID {COPIAR-DEL-SERVE} --service apns --payload '{"aps":{"alert":"Hello World"}}'
```

## Base de datos

```bash
mongod --dbpath db
```
```bash
mongo
use local

db.createCollection('chat')
db.chat.remove({});
db.chat.find();

db.createCollection('message')
db.message.remove({});
db.message.find();

db.createCollection('session')
db.session.remove({});
db.session.find();

db.createCollection('users')
db.users.remove({});
db.users.find();
```

## Servidor

_Servidor nodejs + express_

```bash
npm install nodemon -g

cd server
npm install
PORT=8080, DEBUG=arquiChatServer:* npm start
```