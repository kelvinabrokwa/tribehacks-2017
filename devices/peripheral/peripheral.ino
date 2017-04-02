/**
 * 
 */

#include <CurieBLE.h>

BLEPeripheral blePeripheral;  // BLE Peripheral Device (the board you're programming)
BLEService sensorService("19B10000-E8F2-537E-4F6C-D104768A1214"); // BLE LED Service

// BLE LED Switch Characteristic - custom 128-bit UUID, read and writable by central
BLEIntCharacteristic valueCharacteristic("19B10001-E8F2-537E-4F6C-D104768A1214", BLERead | BLENotify);

//const int ledPin = 13; // pin to use for the LED
const int sensorPin = A0;

void setup() {
  Serial.begin(9600);

  // set LED pin to output mode
  //pinMode(ledPin, OUTPUT);

  // set advertised local name and service UUID:
  blePeripheral.setLocalName("LED");
  blePeripheral.setAdvertisedServiceUuid(sensorService.uuid());

  // add service and characteristic:
  blePeripheral.addAttribute(sensorService);
  blePeripheral.addAttribute(valueCharacteristic);

  // event handlers
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  // set the initial value for the characteristic:
  valueCharacteristic.setValue(0);

  // begin advertising BLE service:
  blePeripheral.begin();

  Serial.println("BLE sensor peripheral");
}

void loop() {
  int val = analogRead(sensorPin);
  Serial.println(val);
  valueCharacteristic.setValue(val);
}

void blePeripheralConnectHandler(BLECentral& central) {
  // central connected event handler
  Serial.print("Connected event, central: ");
  Serial.println(central.address());
}

void blePeripheralDisconnectHandler(BLECentral& central) {
  // central disconnected event handler
  Serial.print("Disconnected event, central: ");
  Serial.println(central.address());
}
