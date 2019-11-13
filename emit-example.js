const io = require('socket.io-client');
// const socket = io('http://locahost', { path: '/conn_device' });
const msg = {
  uuid: '25e1f21e-ef53-11e9-8ae3-78929cdc6bd5',
  msg: {
    "op": "publish",
    "topic": "/joy",
    "msg": {
      "axes": [ -0.0, -0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0 ],
      "buttons": [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    }
  }
}
//sio.emit('register_geocode', json.dumps(msg), namespace='/conn_device')

const socket = io.connect('http://localhost/conn_device');
socket.on('connect', () => {
  socket.emit('delegate', msg);
  socket.close();
});
