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

      console.log('discovered ' + services.length + ' services');

      for (var i = 0; i < services.length; i++) {
        services[i].discoverCharacteristics([], function(err, characteristics) {
          if (err) {
            console.log(err);
          }

          console.log('discovered ' + characteristics.length + ' characteristics');

          for (var j = 0; j < characteristics.length; j++) {
            characteristics[j].on('data', function onData(data, isNotification) {
              console.log(data.readInt32LE(0));
            });
            characteristics[j].subscribe();
          }

        });
      }
    });
  });
});

