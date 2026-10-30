//
// BrowserDocument.ts
//

import EventListener from "../../core/common/EventListener.ts";
import Supplier from "../../core/common/Supplier.ts";

export default class BrowserDocument {

	public static readonly FROM_GLOBAL_REFERENCE: Supplier<BrowserDocument> = (): BrowserDocument => {
		return new BrowserDocument(document);
	};

	private readonly documentObject: Document;

	private constructor(documentObject: Document) {
		this.documentObject = documentObject;
	}

	public getDocumentObject(): Document {
		return this.documentObject;
	}

	public getBody(): HTMLElement {
		return this.documentObject.body;
	}

	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T] {
		return this.documentObject.createElement(tagName);
	}

	public appendNodeToBody(node: Node): void {
		this.getBody().appendChild(node);
	}

	public registerEventListener<T extends keyof DocumentEventMap>(eventName: T, listener: EventListener<DocumentEventMap[T]>): void {
		this.documentObject.addEventListener(eventName, listener);
	}

	public unregisterEventListener<T extends keyof DocumentEventMap>(eventName: T, listener: EventListener<DocumentEventMap[T]>): void {
		this.documentObject.removeEventListener(eventName, listener);
	}

}
