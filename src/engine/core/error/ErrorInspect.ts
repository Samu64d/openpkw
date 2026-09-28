//
// ErrorInspect.ts
//

export default class ErrorInspect {

	public static castToErrnoException(error: unknown): error is NodeJS.ErrnoException {
		return error instanceof Error;
	}

	private constructor() {
	}

}
