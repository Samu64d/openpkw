//
// IPCErrorChannel.ts
//

import EventListener from "../core/common/EventListener.ts";
import ElectronIPC from "../platform/electron/ElectronIPC.ts";
import IPCErrorChannelPacket from "./IPCErrorChannelPacket.ts";

export default class IPCErrorChannel {

	public static registerErrorListener(listener: EventListener<IPCErrorChannelPacket>): void {
		ElectronIPC.registerRequestListener(IPCErrorChannel.CHANNEL_NAME, (channel: ElectronIPC.Channel, packet: IPCErrorChannelPacket) => {
			listener(packet);
		});
	}

	public static sendError(e: unknown): void {
		const packet: IPCErrorChannelPacket = IPCErrorChannelPacket.FROM_ERROR(e);

		void ElectronIPC.sendRequest(IPCErrorChannel.CHANNEL_NAME, packet);
	}

	private static readonly CHANNEL_NAME: ElectronIPC.Channel = "ERROR_CHANNEL";

}
