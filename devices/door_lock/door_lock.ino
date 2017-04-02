#include <Stepper.h>
#include <CurieBLE.h>

//STEPPER MOTOR
const int stepsPerRevolution = 200;
const int stepsPerStep = stepsPerRevolution/25;
int motorSpeed = 50;
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);

//ROTARY SENSOR
const int rotaryInput = A0;
const int unlocked = 870;
const int locked = 320;
int rotaryValue;

//BLE
const char identify_ServiceUUID[] = "73d28854-1c4c-4f59-9c85-06b3fd542b9d";
const char identify_Name_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char doorLock_ServiceUUID[] = "9d0c027c-9ed1-48e9-84f3-f59dd2a204b2";
const char doorLock_Status_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char localName[] = "DoorLock";
BLEPeripheral blePeripheral;
BLEService identify_Service(identify_ServiceUUID);
BLEIntCharacteristic identify_Name_Characteristic(identify_Name_CharacteristicUUID, BLERead);
BLEService doorLock_Service(doorLock_ServiceUUID);
//Unlocked = 0
//Locked = 1
BLEIntCharacteristic doorLock_Status_Characteristic(doorLock_Status_CharacteristicUUID, BLERead | BLEWrite | BLENotify);

void setup() {

  //BLE STUFF
  // set advertised local name and service UUID:
  blePeripheral.setLocalName(localName);
  blePeripheral.setAdvertisedServiceUuid(identify_Service.uuid());

  // add services and characteristics:
  blePeripheral.addAttribute(identify_Service);
  blePeripheral.addAttribute(identify_Name_Characteristic);
  blePeripheral.addAttribute(doorLock_Service);
  blePeripheral.addAttribute(doorLock_Status_Characteristic);

  // set the initial value for the characteristic:
  identify_Name_Characteristic.setValue(0);
  doorLock_Status_Characteristic.setValue(0);

  // event handlers
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);
  doorLock_Status_Characteristic.setEventHandler(BLEWritten, doorLockServiceWritten);

  // begin advertising BLE service:
  blePeripheral.begin();
  
  //OTHER STUFF
  pinMode(rotaryInput, INPUT);
  myStepper.setSpeed(motorSpeed);
  Serial.begin(9600);
  while (!Serial) ;
}

void unlock() {
  rotaryValue = analogRead(rotaryInput);
  while(rotaryValue < unlocked) {
    Serial.print(rotaryValue);
    Serial.print("\n");
    myStepper.step(-stepsPerStep);
    rotaryValue = analogRead(rotaryInput);
  }
}

void lock() {
  rotaryValue = analogRead(rotaryInput);
  while(rotaryValue > locked) {
    Serial.print(rotaryValue);
    Serial.print("\n");
    myStepper.step(stepsPerStep);
    rotaryValue = analogRead(rotaryInput);
  }
}

void updateState(int newState) {
  doorLock_Status_Characteristic.setValue(newState);
}

void loop() {
  blePeripheral.poll();
  rotaryValue = analogRead(rotaryInput);
  Serial.println(rotaryValue);
  //door manually unlocked
  if ((int)doorLock_Status_Characteristic.value() == 1 && rotaryValue >= unlocked) {
    Serial.print("door manually unlocked\n");
    updateState(0);
  //door manually locked
  } else if ((int)doorLock_Status_Characteristic.value() == 0 && rotaryValue <= locked) {
    Serial.print("door manually locked\n");
    updateState(1);
  }
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

void doorLockServiceWritten(BLECentral& central, BLECharacteristic& characteristic) {
  // central wrote new value to characteristic
  digitalWrite(13, HIGH);
  Serial.print("Characteristic event, written: ");

  //lock door
  if (*characteristic.value() == 1) {
    lock();
    Serial.print("lock door\n");
  //unlock door
  } else if (*characteristic.value() == 0) {
    unlock();
    Serial.print("unlock door\n");
  //bad value
  } else {
    Serial.print("BAD VALUE WRITTED\n");
  }
}
