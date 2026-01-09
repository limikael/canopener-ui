import {RemoteDevice, MasterDevice} from "canopener";
import * as canopener from "canopener";
import {createUiDevice, useEncoder, useEncoderButton, useClampedEncoder,
		useRef, Menu, useBack, useEncoderDelta} from "../api/exports.js";

function App() {
	return (
		<Menu title="Flatpak">
			<Menu title="Start Que Job">
				<Menu title="Job #123"/>
				<Menu title="Job #124"/>
				<Menu title="Job #125"/>
				<Menu title="Job #126"/>
				<Menu title="Job #127"/>
				<Menu title="Job #128"/>
			</Menu>
			<Menu title="Status">
			</Menu>
			<Menu title="Test">
				<Menu title="Jog Rail Axis"/>
				<Menu title="Jog Vert. Axis"/>
			</Menu>
			<Menu title="Settings">
				<Menu title="Wifi Settings"/>
				<Menu title="Device Homing"/>
			</Menu>
		</Menu>
	);
}

async function run() {
	if (global.digitalWrite)
		global.digitalWrite(8,0);

	let bus;
	if (global.canBus) {
		bus=global.canBus;
	}

	else {
		let co=canopener;
		bus=await co.openSlcanBus({path: "/dev/ttyESP-50:78:7D:8F:D7:D0", baudRate: 115200}); // ui
	}

	let masterDevice=new MasterDevice({bus});
	let uiDevice=masterDevice.createRemoteDevice(6);
	await uiDevice.awaitState("operational");

	let ui=createUiDevice(<App />);
	await ui.setRemoteDevice(uiDevice);

	console.log("UI Started...");
	if (global.digitalWrite)
		global.digitalWrite(8,1);

}

if (global.waitFor)
	waitFor(run);

else
	run();