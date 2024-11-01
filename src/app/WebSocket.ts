
// const WebSocket = require('ws');

// const espSocketServer = new WebSocket.Server({ port: 8080 });
// const feSocketServer = new WebSocket.Server({ port: 8081 });

// espSocketServer.on('connection', (espWs) => {
//   console.log('ESP connected');

//   // Khi nhận được dữ liệu từ ESP, gửi dữ liệu này tới tất cả các client FE
//   espWs.on('message', (data) => {
//     console.log('Received from ESP:', data);

//     feSocketServer.clients.forEach((feWs) => {
//       if (feWs.readyState === WebSocket.OPEN) {
//         feWs.send(data);
//       }
//     });
//   });

//   espWs.on('close', () => console.log('ESP disconnected'));
// });

// feSocketServer.on('connection', (feWs) => {
//   console.log('Frontend client connected');
//   feWs.on('close', () => console.log('Frontend client disconnected'));
// });
