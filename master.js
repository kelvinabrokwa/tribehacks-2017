/**
 *
 */

var noble = require('noble');

noble.on('stateChange', function onStateChange(state) {
  noble.startScanning();
});

noble.on('discover', function onDiscover(peripheral) {
  noble.stopScanning();

  peripheral.on('disconnect', function onDisconnect() {
    console.log('disconnected');
  });

  peripheral.connect(function connect() {
    peripheral.discoverServices([], function(err, services) {
      if (err) {
        console.log(err);
      }

      console.log('discovered service');

      for (var i = 0; i < services.length; i++) {
        services[i].discoverCharacteristics([], function(err, characteristics) {
          if (err) {
            console.log(err);
          }

          for (var j = 0; j < characteristics.length; j++) {
            var data = new Buffer(1);
            data.writeUInt8(0, 0);
            characteristics[j].write(data);
          }

        });
      }
    });
  });
});

