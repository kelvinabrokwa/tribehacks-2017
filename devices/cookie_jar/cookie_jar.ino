#include <CurieBLE.h>

//PINS
const int touchInput = 3;
const int buzzerOutput = 2;

//VALUES
int touchValue = 0;
int buzzerOn = 0;

//BLE
const char identify_ServiceUUID[] = "73d28854-1c4c-4f59-9c85-06b3fd542b9d";
const char identify_Name_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char cookieJar_ServiceUUID[] = "7f0a4c78-173d-4944-8af1-d836680a8bf1";
const char cookieJar_Status_CharacteristicUUID[] = "33b69844-9c9d-4493-a102-9ca17db2d5b7";
const char localName[] = "CookJar";
BLEPeripheral blePeripheral;
BLEService identify_Service(identify_ServiceUUID);
BLEIntCharacteristic identify_Name_Characteristic(identify_Name_CharacteristicUUID, BLERead);
BLEService cookieJar_Service(cookieJar_ServiceUUID);
//Opened = 0
//Closed = 1
BLEIntCharacteristic cookieJar_Status_Characteristic(cookieJar_Status_CharacteristicUUID, BLERead | BLENotify);

void setup() {
  //BLE STUFF
  // set advertised local name and service UUID:
  blePeripheral.setLocalName(localName);
  blePeripheral.setAdvertisedServiceUuid(identify_Service.uuid());

  // add services and characteristics:
  blePeripheral.addAttribute(identify_Service);
  blePeripheral.addAttribute(identify_Name_Characteristic);
  blePeripheral.addAttribute(cookieJar_Service);
  blePeripheral.addAttribute(cookieJar_Status_Characteristic);

  // set the initial value for the characteristic:
  identify_Name_Characteristic.setValue(0);
  cookieJar_Status_Characteristic.setValue(0);

  // event handlers
  blePeripheral.setEventHandler(BLEConnected, blePeripheralConnectHandler);
  blePeripheral.setEventHandler(BLEDisconnected, blePeripheralDisconnectHandler);

  // begin advertising BLE service:
  blePeripheral.begin();
  
  //OTHER STUFF
  pinMode(touchInput, INPUT);
  pinMode(buzzerOutput, OUTPUT);
  Serial.begin(9600);
}

void checkJar() {
  touchValue = digitalRead(touchInput);
  if (touchValue == 0) {
    if (!buzzerOn) {
      cookieJar_Status_Characteristic.setValue(touchValue);
      buzzerOn = 1;
      digitalWrite(buzzerOutput, HIGH);
    }
  } else {
    if (buzzerOn) {
      cookieJar_Status_Characteristic.setValue(touchValue);
      buzzerOn = 0;
      digitalWrite(buzzerOutput, LOW);
    }
  }
}

void loop() {
  checkJar();
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
