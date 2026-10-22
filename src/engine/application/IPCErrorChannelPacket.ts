//
// IPCErrorChannelPacket.ts
//

import Function from "../core/common/Function.ts";

interface IPCErrorChannelPacket {
	errorName: string;
	errorMessage: string;
}

namespace IPCErrorChannelPacket {

	export const FROM_ERROR: Function<unknown, IPCErrorChannelPacket> = (e: unknown): IPCErrorChannelPacket => {
		if (e instanceof Error) {
			return {
				errorName: e.name,
				errorMessage: e.message
			};
		}

		return {
			errorName: "Unknow",
			errorMessage: "Unknow error"
		};
	};

}

export default IPCErrorChannelPacket;
