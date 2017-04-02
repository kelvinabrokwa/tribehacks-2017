#include <CurieBLE.h>

//PINS
const int noiseInput = A0;
const int lightInput = A1;
const int tempInput = A2;

//VALUES
int noiseValue;
int lightValue;
int tempValue;

//BLE
const char identify_ServiceUUID[] = "73d28854-1c4c-4f59-9c85-06b3fd542b9d";
const char identify_Name_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char tempNoiseLight_ServiceUUID[] = "847b26d9-5ee4-4940-9474-f564d8e594cc";
const char tempNoiseLight_Temp_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char tempNoiseLight_Noise_CharacteristicUUID[] = "14f10df2-c5c8-4082-8889-2c3864f26870";
const char tempNoiseLight_Light_CharacteristicUUID[] = "7a81387b-2ca1-4977-b650-98685e818970";
const char localName[] = "TNL";
BLEPeripheral blePeripheral;
BLEService identify_Service(identify_ServiceUUID);
BLEIntCharacteristic identify_Name_Characteristic(identify_Name_CharacteristicUUID, BLERead);
BLEService tempNoiseLight_Service(tempNoiseLight_ServiceUUID);
BLEIntCharacteristic tempNoiseLight_Temp_Characteristic(tempNoiseLight_Temp_CharacteristicUUID, BLERead | BLENotify);
BLEIntCharacteristic tempNoiseLight_Noise_Characteristic(tempNoiseLight_Noise_CharacteristicUUID, BLERead | BLENotify);
BLEIntCharacteristic tempNoiseLight_Light_Characteristic(tempNoiseLight_Light_CharacteristicUUID, BLERead | BLENotify);

void setup() {

  //BLE STUFF
  // set advertised local name and service UUID:
  blePeripheral.setLocalName(localName);
  blePeripheral.setAdvertisedServiceUuid(identify_Service.uuid());

  // add services and characteristics:
  blePeripheral.addAttribute(identify_Service);
  blePeripheral.addAttribute(identify_Name_Characteristic);
  blePeripheral.addAttribute(tempNoiseLight_Service);
  blePeripheral.addAttribute(tempNoiseLight_Temp_Characteristic);
  blePeripheral.addAttribute(tempNoiseLight_Noise_Characteristic);
  blePeripheral.addAttribute(tempNoiseLight_Light_Characteristic);

  // set the initial value for the characteristic:
  identify_Name_Characteristic.setValue(0);
  tempNoiseLight_Temp_Characteristic.setValue(0);
  tempNoiseLight_Noise_Characteristic.setValue(0);
  tempNoiseLight_Light_Characteristic.setValue(0);

  // event handlers
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  // begin advertising BLE service:
  blePeripheral.begin();

  //OTHER STUFF
  Serial.begin(9600);
}

void updateTemp() {
  tempValue = analogRead(tempInput);
  tempNoiseLight_Temp_Characteristic.setValue(tempValue);
  Serial.print(tempValue);
  Serial.print("\n");
}

void updateNoise() {
  noiseValue = analogRead(noiseInput);
  tempNoiseLight_Noise_Characteristic.setValue(noiseValue);
  Serial.print(noiseValue);
  Serial.print("\n");
}

void updateLight() {
  lightValue = analogRead(lightInput);
  tempNoiseLight_Light_Characteristic.setValue(lightValue);
  Serial.print(lightValue);
  Serial.print("\n");
}

void loop() {
  blePeripheral.poll();
  updateNoise();
  updateLight();
  updateTemp();
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
