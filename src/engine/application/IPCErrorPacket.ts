//
// IPCErrorPacket.ts
//

import Function from "../core/common/Function.ts";

interface IPCErrorPacket {
	name: string;
	message: string;
}

namespace IPCErrorPacket {

	export const FROM_ERROR: Function<Error, IPCErrorPacket> = (error: Error): IPCErrorPacket => {
		return {
			name: error.name,
			message: error.message
		};
	};

}

export default IPCErrorPacket;
