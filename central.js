/**
 *
 */

var noble = require('noble');
var cors = require('cors');
var morgan = require('morgan');
var express = require('express');
var app = express();
var names = require('./names');

app.use(cors());
app.use(morgan('combined'));

var WebSocket = require('ws');
var server = require('http').createServer(app);
var wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', ws => {
  ws.send(JSON.stringify(bleData));
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

var characteristicNames = names.characteristicNames;
var serviceNames = names.serviceNames;

var peripherals = [];

noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    noble.startScanning(['73d288541c4c4f599c8506b3fd542b9d'], false);
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

  peripherals.push(peripheral);
  connectToPeripherals();
});

function connectToPeripherals() {
  if (peripherals.length < 3) {
    return;
  }
  noble.stopScanning();
  peripherals.forEach(peripheral => {
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
          if (Object.keys(serviceNames).map(k => serviceNames[k]).indexOf(services[i].uuid) === -1) {
            continue;
          }
          console.log('new service: ' + services[i].uuid);
          bleData[services[i].uuid] = {};
          bleCharacteristics[services[i].uuid] = {};
          discoverCharacteristics(services[i]);
        }
      });
    });
  });
}

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
    if (service.uuid === serviceNames.lockOpenClose) {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0) === 1;
    }  else if (service.uuid === serviceNames.cookieJar) {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0) === 1;
    } else {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0);
    }
    broadcast(); // send data to all websocket clients
  });
  characteristic.read((err, data) => {
    if (err) {
      return console.log(err);
    }
    console.log('new data\n\tservice: ' + service.uuid + '\n\tcharacteristic: ' +
      characteristic.uuid + '\n\tdata: ' + data.readInt32LE(0));
    if (service.uuid === serviceNames.lockOpenClose) {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0) === 1;
    }  else if (service.uuid === serviceNames.cookieJar) {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0) === 1;
    } else {
      bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0);
    }
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
  if (!(serviceNames.lockOpenClose in bleCharacteristics)) {
    console.log('attempt to accessed unconnected lock');
    return res.send('device is not connected');
  }
  if (!(characteristicNames.lockOpenClose in bleCharacteristics[serviceNames.lockOpenClose])) {
    console.log('attempt to accessed unconnected lock');
    return res.send('device is not connected');
  }
  var characteristic = bleCharacteristics[serviceNames.lockOpenClose][characteristicNames.lockOpenClose];
  characteristic.once('write', () => {
    console.log('writing\n\tservice:' + serviceNames.lockOpenClose +
      '\n\tcharacteristic: ' + characteristicNames.lockOpenClose + '\n\tdata: ' + val);
  });
  characteristic.write(buf, true, err => {
    if (err) {
      console.log(err);
      res.send('error');
    } else {
      bleData[serviceNames.lockOpenClose][characteristicNames.lockOpenClose] = val === 1;
      broadcast();
      res.send('ok');
    }
  });
});

app.listen(8080, () => {
  console.log('http server listening on port :80');
});

