#include <Stepper.h>

const int stepsPerRevolution = 200;
const int stepsPerStep = stepsPerRevolution/25;
int motorSpeed = 50;

const int rotaryInput = A0;
const int unlocked = 9;
const int locked = 1023;
//all the way left = 9
//all the way right = 1023
int rotaryValue;

// initialize the stepper library on pins 8 through 11:
Stepper myStepper(stepsPerRevolution, 8, 9, 10, 11);

void setup() {
  pinMode(rotaryInput, INPUT);
  myStepper.setSpeed(motorSpeed);
  Serial.begin(9600);
}

void unlock() {
  rotaryValue = analogRead(rotaryInput);
  while(rotaryValue > unlocked) {
    Serial.print(rotaryValue);
    Serial.print("\n");
    myStepper.step(stepsPerStep);
    rotaryValue = analogRead(rotaryInput);
  }
}

void lock() {
  rotaryValue = analogRead(rotaryInput);
  while(rotaryValue < locked) {
    Serial.print(rotaryValue);
    Serial.print("\n");
    myStepper.step(-stepsPerStep);
    rotaryValue = analogRead(rotaryInput);
  }
}

void loop() {
  //do ble magic
}
