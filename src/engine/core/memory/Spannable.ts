//
// Spannable.ts
//

interface Spannable {

	readonly length: number;

	[index: number]: number;

}

namespace Spannable {

	export function copyTo(source: Spannable, destination: Spannable, sourceStartIndex: number = 0, sourceEndIndex: number = source.length, destinationStartIndex: number = 0): void {

		if (source instanceof Uint8Array && destination instanceof Uint8Array) {
			const src: Uint8Array = source.subarray(sourceStartIndex, sourceEndIndex);

			destination.set(src, destinationStartIndex);
			return;
		}

		for (let i: number = 0; i < source.length; i++) {
			destination[destinationStartIndex + i] = source[i];
		}
	}

}

export default Spannable;
