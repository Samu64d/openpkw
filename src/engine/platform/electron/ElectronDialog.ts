//
// ElectronDialog.ts
//

import * as Electron from "electron";

import Supplier from "../../core/common/Supplier.ts";
import ElectronWindow from "./ElectronWindow.ts";

class ElectronDialog {

	public static readonly FROM_GLOBAL_REFERENCE: Supplier<ElectronDialog> = (): ElectronDialog => {
		return new ElectronDialog(Electron.dialog);
	};

	private readonly dialogObject: Electron.Dialog;

	private constructor(dialog: Electron.Dialog) {
		this.dialogObject = dialog;
	}

	public showForWindow(window: ElectronWindow, type: ElectronDialog.Type, message: string): void {
		this.dialogObject.showMessageBoxSync(window.getWindowObject(), {
			type: type,
			title: window.getTitle(),
			message: "",
			detail: message,

		});
	}

}

namespace ElectronDialog {

	export enum Type {
		NONE = "none",
		INFO = "info",
		QUESTION = "question",
		WARNING = "warning",
		ERROR = "error"
	}

}

export default ElectronDialog;
