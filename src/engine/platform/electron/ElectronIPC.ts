//
// ElectronIPC.ts
//

import * as Electron from "electron";

import Nullable from "../../core/common/Nullable.ts";
import Supplier from "../../core/common/Supplier.ts";
import EventListener from "../../core/common/EventListener.ts";
import InvalidOperationException from "../../core/exception/InvalidOperationException.ts";
import NodeProcess from "../node/NodeProcess.ts";

class ElectronIPC {

	public static readonly FROM_GLOBAL_REFERENCE: Supplier<ElectronIPC> = (): ElectronIPC => {
		const processType: NodeProcess.Type = NodeProcess.getType();
		let register: Nullable<ElectronIPC.Register> = null;
		let invoker: Nullable<ElectronIPC.Invoker> = null;

		if (processType == NodeProcess.Type.MAIN) {
			register = Electron.ipcMain.handle.bind(Electron.ipcMain);
		}

		if (processType == NodeProcess.Type.RENDERER) {
			invoker = Electron.ipcRenderer.invoke.bind(Electron.ipcRenderer);
		}

		return new ElectronIPC(register, invoker);
	};

	private readonly register: Nullable<ElectronIPC.Register> = null;
	private readonly invoker: Nullable<ElectronIPC.Invoker> = null;

	private constructor(register: Nullable<ElectronIPC.Register>, invoker: Nullable<ElectronIPC.Invoker>) {
		this.register = register;
		this.invoker = invoker;
	}

	public registerRequestListener(channel: ElectronIPC.Channel, listener: EventListener<ElectronIPC.Channel>): void {
		if (this.register == null) {
			throw new InvalidOperationException("Cannot register an IPC listener for current context");
		}

		this.register(channel, (event: Electron.IpcMainInvokeEvent, ...args: any[]) => {
			return listener(channel, ...args);
		});
	}

	public sendRequest(channel: ElectronIPC.Channel, ...args: any[]): any {
		if (this.invoker == null) {
			throw new InvalidOperationException("Cannot send an IPC message for current context");
		}

		return this.invoker(channel, ...args);
	}

}

namespace ElectronIPC {

	export type Channel = string;

	export type Register = (channel: Channel, listener: EventListener<Electron.IpcMainInvokeEvent>) => void;

	export type Invoker = (channel: Channel, ...args: any[]) => any;

}

export default ElectronIPC;
