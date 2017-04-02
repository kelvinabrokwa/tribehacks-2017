/**
 *
 */

var noble = require('noble');
var cors = require('cors');
var morgan = require('morgan');
var express = require('express');
var app = express();

app.use(cors());
app.use(morgan('combined'));

var WebSocket = require('ws');
var server = require('http').createServer(app);
var wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', ws => {
  console.log('new connection');
});

function broadcast() {
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(bleData));
    }
  });
}

//
// BLE stuff
//
var bleData = {};

var bleCharacteristics = {};

var characteristicNames = {
  lockOpenClose: '33b698449c9d4493a1029ca17db2d5b7'
};

var serviceNames = {
  lockOpenClose: '9d0c027c9ed148e984f3f59dd2a204b2'
};

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning();
  }
});

noble.on('scanStart', function() {
  console.log('starting peripheral scan');
});

noble.on('discover', peripheral => {
  console.log('discovered peripheral');

  peripheral.on('disconnect', () => {
    console.log('disconnected');
  });

  peripheral.connect(err => {
    if (err) {
      console.log(err);
    }

    console.log('connected to peripheral');

    peripheral.discoverServices([], (err, services) => {
      if (err) {
        console.log(err);
      }

      console.log('discovered ' + services.length + ' services');

      for (var i = 0; i < services.length; i++) {
        console.log('new service: ' + services[i].uuid);
        bleData[services[i].uuid] = {};
        bleCharacteristics[services[i].uuid] = {};
        discoverCharacteristics(services[i]);
      }
    });
  });
});

function discoverCharacteristics(service) {
  service.discoverCharacteristics([], (err, characteristics) => {
    if (err) {
      console.log(err);
    }

    console.log('discovered ' + characteristics.length + ' characteristics');

    for (var j = 0; j < characteristics.length; j++) {
      console.log('new characteristic\n\tservice: ' + service.uuid + '\n\tcharacteristic: ' +
        characteristics[j].uuid);
      bleCharacteristics[service.uuid][characteristics[j].uuid] = characteristics[j];
      setDataListener(service, characteristics[j]);
      characteristics[j].subscribe();
    }
  });
}

function setDataListener(service, characteristic) {
  characteristic.on('data', (data, isNotification) => {
    console.log('new data\n\tservice: ' + service.uuid + '\n\tcharacteristic: ' +
      characteristic.uuid + '\n\tdata: ' + data.readInt32LE(0));
    bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0);
    broadcast(); // send data to all websocket clients
  });
}

//
// server stuff
//
app.get('/', (req, res) => {
  res.send(';)');
});

app.get('/data', (req, res) => {
  res.json(bleData);
});

app.post('/devices/lock/:lock', (req, res) => {
  var val = req.params.lock === 'lock' ? 1 : 0;
  var buf = Buffer.allocUnsafe(4);
  buf.writeInt32LE(val, 0);
  if (!(serviceNames['lockOpenClose'] in bleCharacteristics)) {
    console.log('attempt to accessed unconnected lock');
    return res.send('device is not connected');
  }
  if (!(characteristicNames['lockOpenClose'] in bleCharacteristics[serviceNames['lockOpenClose']])) {
    console.log('attempt to accessed unconnected lock');
    return res.send('device is not connected');
  }
  var characteristic = bleCharacteristics[serviceNames['lockOpenClose']][characteristicNames['lockOpenClose']];
  characteristic.once('write', () => {
    console.log('writing\n\tservice:' + serviceNames['lockOpenClose'] +
      '\n\tcharacteristic: ' + characteristicNames['lockOpenClose'] + '\n\tdata: ' + val);
  });
  characteristic.write(buf, true, err => {
    if (err) {
      console.log(err);
      res.send('error');
    } else {
      res.send('ok');
    }
  });
});

app.listen(8080, () => {
  console.log('http server listening on port :80');
});

