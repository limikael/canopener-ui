#include "Screen.h"
#include <Wire.h>
#include <Arduino.h>

Screen::Screen()
		: lcd(0x27,20,4) {
    for (int i=0; i<5*4; i++)
        screen[i]=0;
}

void Screen::begin() {
	Wire.begin(8, 9); 
	Wire.setClock(100000);
    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0,0);
    //lcd.print("Starting...");
}

void Screen::setChunk(int row, int chunk, uint32_t data) {
	if (screen[row*5+chunk]==data)
		return;

	//Serial.printf("updating chunk: r=%d c=%d\n",row,chunk);

	screen[row*5+chunk]=data;
	lcd.setCursor(chunk*4,row);
	lcd.write((screen[row*5+chunk]>>24)&0xff);
	lcd.write((screen[row*5+chunk]>>16)&0xff);
	lcd.write((screen[row*5+chunk]>>8)&0xff);
	lcd.write((screen[row*5+chunk]>>0)&0xff);
}