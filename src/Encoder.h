#pragma once

#include <Arduino.h>

class Encoder {
public:
    Encoder(int pinA, int pinB);
    void begin();
    uint8_t getValue();

private:
    static void IRAM_ATTR isr(void* arg);
    void IRAM_ATTR handle();

    uint8_t pinA;
    uint8_t pinB;

    volatile uint8_t value=0;
    volatile uint8_t lastState=0;
};
