//
// IPCErrorChannel.ts
//

import EventListener from "../core/common/EventListener.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import IPCErrorChannelPacket from "./IPCErrorChannelPacket.ts";

export default class IPCErrorChannel {

	private static readonly CHANNEL_NAME: ElectronIPC.Channel = "ERROR_CHANNEL";

	private readonly electronIPC: ElectronIPC;

	public constructor(electronIPC: ElectronIPC) {
		this.electronIPC = electronIPC;
	}

	public registerErrorListener(listener: EventListener<IPCErrorChannelPacket>): void {
		this.electronIPC.registerRequestListener(IPCErrorChannel.CHANNEL_NAME, (channel: ElectronIPC.Channel, packet: IPCErrorChannelPacket) => {
			listener(packet);
		});
	}

	public sendError(e: unknown): void {
		const packet: IPCErrorChannelPacket = IPCErrorChannelPacket.FROM_ERROR(e);

		void this.electronIPC.sendRequest(IPCErrorChannel.CHANNEL_NAME, packet);
	}

}
