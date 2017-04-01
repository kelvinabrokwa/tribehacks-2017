const int touchInput = 3;
const int buzzerOutput = 2;

int touchValue = 0;
int buzzerOn = 0;

void setup() {
   pinMode(touchInput, INPUT);
   pinMode(buzzerOutput, OUTPUT);
   Serial.begin(9600);
}

void checkJar() {
  touchValue = digitalRead(touchInput);
  if (touchValue == 0) {
    if (!buzzerOn) {
      buzzerOn = 1;
      digitalWrite(buzzerOutput, HIGH);
    }
  } else {
    if (buzzerOn) {
      buzzerOn = 0;
      digitalWrite(buzzerOutput, LOW);
    }
  }
}

void loop() {
  checkJar();
}
