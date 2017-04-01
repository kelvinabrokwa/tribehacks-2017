/**
 *
 */

var noble = require('noble');
var express = require('express');
var cors = require('cors');
var morgan = require('morgan');

var app = express();
app.use(cors());
app.use(morgan('combined'));

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
    bleData[service.uuid][characteristic.uuid] = data.readInt32LE(0);
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

app.post('/devices/lock/lock', (req, res) => {
  var buf = Buffer.allocUnsafe(8);
  buf.writeInt32LE(1);
  var characteristic = bleCharacteristics[serviceNames['lockOpenClose']][characteristicNames['lockOpenClose']];
  characteristic.once('write', () => {
    console.log('writing 1 to\n\tservice:' + serviceNames['lockOpenClose'] +
      '\n\tcharacteristic: ' + characteristicNames['lockOpenClose']);
  });
  characteristic.read((err, data) => {
    if (err) {
      return console.log(err);
    }

  });
  characteristic.write(buf, false, err => {
    if (err) {
      console.log(err);
    } else {
      res.send('ok');
    }
  });
});

app.listen(8080, () => {
  console.log('http server listening on port :80');
});

