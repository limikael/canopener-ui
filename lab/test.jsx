import {openSlcanBus, RemoteDevice} from "canopener";
import {createUiDevice, useEncoder, useEncoderButton, useClampedEncoder,
		useRef, h, Fragment, Menu, useBack, useEncoderDelta} from "../api/exports.js";

function ObjectEditor({name, title, dev, index, subIndex, min, max, step}) {
	let back=useBack();
	useEncoderButton(()=>back());
	let delta=useEncoderDelta();
	let entry=dev.entry(index,subIndex);

	if (!step)
		step=1;

	if (delta) {
		let v=entry.get()+delta*step;
		if (v<min)
			v=min;

		if (v>max)
			v=max;

		entry.set(v);
	}

	return (["",name.padStart(9)+": "+entry.get(),"","      [ Back ]      "]);
}

function App({motor}) {
	let targetEntry=motor.entry(0x607A,0x00);

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
				<ObjectEditor dev={motor} index={0x607A} subIndex={0x00} 
						name={"Motor"}
						title={"Motor: "+targetEntry.get()} 
						min={0} max={10000} step={100}/>
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

let bus=await openSlcanBus({path: "/dev/ttyACM0", baudRate: 115200});
await new Promise(r=>setTimeout(r,250));

let motor=new RemoteDevice({bus, nodeId: 5});
let targetPosition=motor.entry(0x607A,0x00).setType("int32");
let actualPosition=motor.entry(0x6064,0x00).setType("int32");

let maxVel=motor.entry(0x6081,0x00).setType("int32");
let maxAccel=motor.entry(0x6083,0x00).setType("int32");
let maxDecel=motor.entry(0x6084,0x00).setType("int32");
let control=motor.entry(0x6040,0x00).setType("uint16");

//await control.set(0x0);
await control.set(0x0f);
await maxAccel.set(10000);
await maxDecel.set(10000);
await maxVel.set(16000);

await targetPosition.set(0);

let ui=await createUiDevice({bus, nodeId: 6, element: <App motor={motor}/>});

console.log("Started...");
