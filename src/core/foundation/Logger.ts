//
// Logger.ts
//

import * as Fs from "fs";

//TODO: Stub
export default class Logger {

	private readonly filePath: string;
	private readonly handler: number;

	public constructor(filePath: string) {
		this.filePath = filePath;
		this.handler = Fs.openSync(this.filePath, Fs.constants.O_RDWR | Fs.constants.O_CREAT | Fs.constants.O_TRUNC);
		this.log("Starting logger at " + new Date().toISOString());
	}

	public log(text: string): void {
		if (this.handler != -1) {
			Fs.writeFileSync(this.handler, text + "\n", {
				mode: Fs.constants.O_APPEND
			});
		}

	}

}
