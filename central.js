/**
 *
 */

var noble = require('noble');
var express = require('express');
var cors = require('cors');

var app = express();
app.use(cors());

//
// BLE stuff
//
var serviceUUIDs = {
  temperature: '19B10000-E8F2-537E-4F6C-D104768A1214'
};

var characteristicUUID;

var bleServices = {};

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

        bleServices[services[i].uuid] = {};

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
      setDataListener(service, characteristics[j]);
      characteristics[j].subscribe();
    }
  });
}

function setDataListener(service, characteristic) {
  characteristic.on('data', (data, isNotification) => {
    bleServices[service.uuid][characteristic.uuid] = data.readInt32LE(0);
  });
}

//
// server stuff
//
app.get('/', (req, res) => {
  res.send(';)');
});

app.get('/data', (req, res) => {
  res.json(bleServices);
});

app.listen(8080, () => {
  console.log('http server listening on port :80');
});

