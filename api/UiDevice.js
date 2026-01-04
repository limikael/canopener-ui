import ReactiveTui, {useRef} from "./ReactiveTui.js";
import {RemoteDevice, awaitEvent} from "canopener";
import {ResolvablePromise} from "./js-util.js";

function useUiDevice() {
	return UiDevice.instance;
}

export function useEncoderDelta() {
	let encoder=useEncoder();
	let currentRef=useRef();
	if (currentRef.current===undefined)
		currentRef.current=encoder;

	let delta=encoder-currentRef.current;
	if (delta>32)
		delta-=64;

	if (delta<-32)
		delta+=64;

	currentRef.current=encoder;

	return delta;
}

export function useClampedEncoder(min, max) {
	let encoder=useEncoder();
	let currentRef=useRef();
	let valueRef=useRef(min);
	if (currentRef.current===undefined)
		currentRef.current=encoder;

	let delta=encoder-currentRef.current;
	if (delta>32)
		delta-=64;

	if (delta<-32)
		delta+=64;
	//console.log("delta: "+delta);

	valueRef.current+=delta;
	if (valueRef.current<min)
		valueRef.current=min;

	if (valueRef.current>=max)
		valueRef.current=max-1;

	currentRef.current=encoder;
	return valueRef.current;
}

export function useEncoder() {
	let uiDevice=useUiDevice();

	return uiDevice.encoderEntry.get();
}

export function useEncoderButton(fn) {
	let uiDevice=useUiDevice();
	let ref=useRef();
	if (ref.current!==undefined &&
			ref.current!=uiDevice.buttonCountEntry.get()) {
		fn();
	}

	ref.current=uiDevice.buttonCountEntry.get();
}

export default class UiDevice {
	constructor({nodeId, element}) {
		this.reactiveTui=new ReactiveTui(element);
		this.reactiveTui.on("refresh",()=>{
			this.refreshPromise.resolve();
		});
		this.remoteDevice=new RemoteDevice({nodeId});

		for (let row=0; row<4; row++)
			for (let chunk=0; chunk<5; chunk++)
				this.chunkEntry(row,chunk).setType("uint32");

		this.refreshPromise=new ResolvablePromise();
		this.encoderEntry=this.remoteDevice.entry(0x5f00,0).setType("uint8").subscribe({interval: 100});
		this.buttonCountEntry=this.remoteDevice.entry(0x5f02,0).setType("uint8").subscribe({interval: 100});

		this.encoderEntry.on("change",()=>this.refreshPromise.resolve());
		this.buttonCountEntry.on("change",()=>this.refreshPromise.resolve());
	}

	chunkEntry(row, chunk) {
		return this.remoteDevice.entry(0x7000+row,chunk+1);
	}

	async init() {
		//let promises=[];

		for (let row=0; row<4; row++)
			for (let chunk=0; chunk<5; chunk++)
				await this.chunkEntry(row,chunk).set(0x20202020);
				//promises.push(this.chunkEntry(row,chunk).set(0x20202020));

		//await Promise.all(promises);

		await this.encoderEntry.refresh();
		await this.buttonCountEntry.refresh();
	}

	async setLines(lines) {
		//console.log(lines);

		for (let lineIndex=0; lineIndex<4; lineIndex++) {
			let line=lines[lineIndex];
			if (!line)
				line="";

			line=line.padEnd(20);
			for (let chunkIndex=0; chunkIndex<5; chunkIndex++) {
				let data=
					(line.charCodeAt(chunkIndex*4+0)<<24)+
					(line.charCodeAt(chunkIndex*4+1)<<16)+
					(line.charCodeAt(chunkIndex*4+2)<<8)+
					(line.charCodeAt(chunkIndex*4+3)<<0);

				if (data!=this.chunkEntry(lineIndex,chunkIndex).get()) {
					//console.log("update "+lineIndex+" "+chunkIndex+" "+data);
					await this.chunkEntry(lineIndex,chunkIndex).set(data);
				}
			}
		}
	}

	async refresh() {
		this.refreshPromise=new ResolvablePromise();
		UiDevice.instance=this;
		let unflatContent=this.reactiveTui.render();
		let content=unflatContent.flat(Infinity);
		//console.log(content);

		await this.setLines(content);
	}

	async run() {
		while (1) {
			await this.refresh();
			await this.refreshPromise;
		}
	}
}

export async function createUiDevice({masterDevice, nodeId, element}) {
	let uiDevice=new UiDevice({nodeId,element});

	masterDevice.addDevice(uiDevice.remoteDevice);
	await uiDevice.remoteDevice.awaitState("operational");

	await uiDevice.init();

	uiDevice.run();

	return uiDevice;
}