#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// WiFi settings
const char* ssid = "AlzateLopez";
const char* password = "1036936137";

// Server endpoint
const char* serverName = "http://192.168.x.x:3000/btc-value";

// OLED setup
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

void setup() {
  Serial.begin(115200);
  delay(100);

  // OLED start
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { 
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
  
  display.clearDisplay();
  display.setTextSize(2); // Medium font
  display.setTextColor(WHITE);
  display.setCursor(0,0);
  display.println("Connecting...");
  display.display();

  // WiFi connect
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi...");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println(WiFi.localIP());

  // Show connected screen
  display.clearDisplay();
  display.setCursor(0,0);
  display.println("WiFi OK!");
  display.display();
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    WiFiClient client;
    
    http.begin(client, serverName);
    int httpCode = http.GET();

    if (httpCode > 0) {
      String payload = http.getString();
      Serial.println(payload);

      // Parse JSON
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload);

      String btcValue = doc["btc"];

      Serial.print("BTC VALUE: ");
      Serial.println(btcValue);

      // DISPLAY ON OLED
      display.clearDisplay();
      display.setTextSize(1);
      display.setCursor(0,0);
      display.println("BTC PRICE:");
      display.setTextSize(2);
      display.setCursor(0, 20);
      display.println("$" + btcValue);
      display.display();
    }
    else {
      Serial.print("Error on HTTP request: ");
      Serial.println(http.errorToString(httpCode));
    }
    
    http.end();
  }

  delay(5000); // Fetch every 5 seconds
}
