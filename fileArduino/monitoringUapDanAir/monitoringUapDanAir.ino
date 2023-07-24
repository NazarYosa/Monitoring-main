#include "ThingSpeak.h"
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <UrlEncode.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

const int pinSensorAsap = D6;
const int pinSensorAir = A0;
const int pinBuzzer = D8; // Buzzer pin

const char* wifiSsid = "Home";
const char* wifiPassword = "home4321";
WiFiClient client;

unsigned long myChannelNumber = 2220709; // ThingSpeak Channel ID
const char *myWriteAPIKey = "0P7BWJQMMCLAGN23"; // ThingSpeak API Key

String phoneNumber = "+6288227990636";
String apiKey = "2688456";

LiquidCrystal_I2C lcd(0x27, 16, 2);
bool air = false;
bool asap = false;
String customData = ""; // Variable to hold custom data

void sendMessage(String message) {
  String url = "http://api.callmebot.com/whatsapp.php?phone=" + phoneNumber + "&apikey=" + apiKey + "&text=" + urlEncode(message);
  WiFiClient client;
  HTTPClient http;
  http.begin(client, url);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  int httpResponseCode = http.POST(url);
  if (httpResponseCode == 200) {
    Serial.println("Message sent successfully");
  } else {
    Serial.println("Error sending the message");
    Serial.print("HTTP response code: ");
    Serial.println(httpResponseCode);
  }
  http.end();
}

void sendDataToThingSpeak() {
  // Update ThingSpeak with smoke, water, and custom data
  if (WiFi.status() == WL_CONNECTED) {
    ThingSpeak.writeField(myChannelNumber, 1, asap ? 1 : 0, myWriteAPIKey); // Field 1 for smoke detection (1 for detected, 0 for not detected)
    ThingSpeak.writeField(myChannelNumber, 2, air ? 1 : 0, myWriteAPIKey); // Field 3 for water detection (1 for detected, 0 for not detected)

    // Uncomment the following line if you want to see the custom data being sent to ThingSpeak
    // Serial.println("Custom data sent: " + customData);

    // Reset custom data after sending
    customData = "";
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  ThingSpeak.begin(client);

  Wire.begin();
  lcd.begin(16, 2);
  lcd.backlight();
  lcd.clear();


  // Connect to Wi-Fi
  WiFi.begin(wifiSsid, wifiPassword);
  Serial.print("Connecting to WiFi...");
  lcd.setCursor(0, 0);
  lcd.print("Connecting to ");
  lcd.setCursor(0, 1);
  lcd.print("WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nConnected to WiFi.");

  lcd.setCursor(0, 0);
  lcd.print("Connected to ");
  lcd.setCursor(0, 1);
  lcd.print("WiFi");
  delay(2000);
  lcd.clear();
  sendMessage("Device started");

  pinMode(pinBuzzer, OUTPUT);
  digitalWrite(pinBuzzer, LOW);
}

void loop() {
  // Smoke and Water Sensor Logic
  int tingkatAsap = digitalRead(pinSensorAsap);
  int nilaiAir = analogRead(pinSensorAir);
  bool airTerdeteksi = (nilaiAir > 400);

  if (tingkatAsap == 1) {
    asap = false;
    digitalWrite(pinBuzzer, LOW); // Turn off the buzzer when smoke is not detected
  } else {
    asap = true;
    digitalWrite(pinBuzzer, HIGH); // Turn on the buzzer for smoke detection
    sendMessage("Ada asap terdeteksi");
  }

  if (airTerdeteksi) {
    air = true;
    unsigned long currentMillis = millis();
    digitalWrite(pinBuzzer, HIGH); // Turn on the buzzer for water detection
    tone(pinBuzzer, 5000,1000);
    sendMessage("Ada air terdeteksi");
  } else {
    air = false;
    digitalWrite(pinBuzzer, LOW); // Turn off the buzzer when water is not detected
  }



  // Send data to ThingSpeak
  sendDataToThingSpeak();

  // Display Data on LCD
  String adaAir = air ? "Ada air" : "Tidak ada air";
  String adaAsap = asap ? "Ada asap" : "Tidak ada asap";
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(adaAsap);
  lcd.setCursor(0, 1);
  lcd.print(adaAir);

  delay(200);
}