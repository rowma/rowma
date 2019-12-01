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

const socket = io.connect('http://localhost/rowma');
socket.on('connect', () => {
  socket.emit('delegate', msg, (res) => {
    console.log(res)
  });
  // socket.close();
});

//const jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9ERkNPVEV4TXprNU5VVXlORGt5TTBZeFFUTkVORE5GTnpZeVFqTXpPRFEzTTBFMFFURXlNZyJ9.eyJnaXZlbl9uYW1lIjoiYXNtc3VlY2hhbiIsIm5pY2tuYW1lIjoic3VlbmFnYXJ5b3V0YWFiYyIsIm5hbWUiOiJhc21zdWVjaGFuIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hLS9BQXVFN21DaHhNX3RPcEMxVDdtXzViQXdqVzFYU3ljWXNYWGd5OVk3aVdOayIsImxvY2FsZSI6ImphIiwidXBkYXRlZF9hdCI6IjIwMTktMTEtMjdUMDE6NTE6MzUuMDk3WiIsImVtYWlsIjoic3VlbmFnYXJ5b3V0YWFiY0BnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6Ly9kZXYtODFndWx5dTEuYXV0aDAuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTA1MjE4MTAzMjQ0MTkwODAxNjI2IiwiYXVkIjoielJHV0VHSXVMOHJwNnNtNTdBb2w2Y1owcERrMEY1V1oiLCJpYXQiOjE1NzQ4MTk0OTUsImV4cCI6MTU3NDg1NTQ5NSwiYXRfaGFzaCI6Ik4zSncxakF5Nm9sME93NHVIOGM5cVEiLCJub25jZSI6IlotMWVOYzRQdkdsdWU1NHhCSFRFNzBNTkJmSn5zdHZHIn0.izj8xBJlFbq_oR1fNbWzi9177FXvVdVp4BkzxZXrtigTnH7xRS8-v8c-3-Kt9qjPs27aRDBgzbgTI4B1EaWATG-0bEMqym-OvGqIGOaEBz_4TwScYkSZAyOHiXSF0xw-9k86_Nfm8kVL_bGdFnR2Aasxh31Wz9L_MmjDe2HSj_yr2Wx7BzqyDiSkFIyGQRbQkhcE0YJtw_cYHX3RLevqucy6EhgKS4en5kbTNDluRl7XnmQCYzxyw_UoAVxDLX1Bjdl64O_r82tA65ShZOCcJ_IRsx8CEyJ6IZPkcNgFZD_gh7b7nZwyDLm_O4OR69fh7lFPUlmiWxVe30ZHgD47Qg"
//
//const socket = io.connect('http://localhost/rowma?prj=sss');
//socket.on('connect', () => {
//  socket
//    .emit('authenticate', { token: jwt }) //send the jwt
//    .on('authenticated', () => {
//      console.log('authenticated')
//      socket.emit('delegate', msg, (res) => {
//        console.log(res)
//      });
//      //do other things
//    })
//    .on('unauthorized', (msg) => {
//      console.lo
//      console.log(`unauthorized: ${JSON.stringify(msg.data)}`);
//      throw new Error(msg.data.type);
//    })
//});
