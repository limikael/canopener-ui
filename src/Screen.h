#pragma once

#include <LiquidCrystal_I2C.h>

class Screen {
public:
	Screen();
	void begin();
	void setChunk(int row, int chunk, uint32_t data);

private:
	int32_t screen[5*4];
	LiquidCrystal_I2C lcd;
};
