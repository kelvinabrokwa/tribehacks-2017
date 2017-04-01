
const int noiseInput = A0;
const int lightInput = A1;
const int tempInput = A2;

int noiseValue;
int lightValue;
int tempValue;

void setup() {
  Serial.begin(9600);
}

void updateNoise() {
  noiseValue = analogRead(noiseInput);
  Serial.print(noiseValue);
  Serial.print("\n");
}

void updateLight() {
  lightValue = analogRead(lightInput);
  Serial.print(lightValue);
  Serial.print("\n");
}

void updateTemp() {
  tempValue = analogRead(tempInput);
  Serial.print(tempValue);
  Serial.print("\n");
}

void loop() {
  updateNoise();
  updateLight();
  updateTemp();
}
