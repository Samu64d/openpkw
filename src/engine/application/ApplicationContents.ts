//
// ApplicationContents.ts
//

import BiFunction from "../core/common/BiFunction.ts";
import ClassType from "../core/reflection/class/ClassType.ts";
import Record from "../core/reflection/decorators/Record.ts";
import NodePath from "../platform/node/NodePath.ts";
import Application from "./Application.ts";

@Record()
export default class ApplicationContents {

	public static readonly BUILD_FOR: BiFunction<ClassType<Application>, string, ApplicationContents> = (applicationType: ClassType<Application>, entryPointPath: string): ApplicationContents => {
		const template: string = applicationType.getContentsTemplate();
		const templateInstance: string = template.replace("{{entryPointPath}}", entryPointPath);
		const dataUrl: string = "data:text/html;base64," + Buffer.from(templateInstance).toString("base64");
		const baseUrl: string = NodePath.join([__dirname, "../"]);

		return new ApplicationContents(entryPointPath, dataUrl, baseUrl);
	}

	private readonly entryPointPath: string;
	private readonly dataUrl: string;
	private readonly baseUrl: string;

	public constructor(entryPointPath: string, dataUrl: string, baseUrl: string) {
		this.entryPointPath = entryPointPath;
		this.dataUrl = dataUrl;
		this.baseUrl = baseUrl;
	}

	public getEntryPointPath(): string {
		return this.entryPointPath;
	}

	public getDataUrl(): string {
		return this.dataUrl;
	}

	public getBaseUrl(): string {
		return this.baseUrl;
	}

}
