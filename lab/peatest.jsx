import {RemoteDevice, MasterDevice} from "canopener";
import {createUiDevice, useEncoder, useEncoderButton, useClampedEncoder,
		useRef, Menu, useBack, useEncoderDelta} from "../api/exports.js";

function App({motor}) {
	//let targetEntry=motor.entry(0x607A,0x00);

	return (
		<Menu title="Flatpak">
			<Menu title="Start Queued Job">
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
				{/*<ObjectEditor dev={motor} index={0x607A} subIndex={0x00} 
						name={"Motor"}
						title={"Motor: "+targetEntry.get()} 
						min={0} max={10000} step={100}/>*/}
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
	let masterDevice=new MasterDevice({bus: global.canBus});
	let motor=null;
	let ui=await createUiDevice({masterDevice, nodeId: 6, element: <App motor={motor}/>});
	console.log("**** UI operational...");
}

run();
