export enum ErrorTypes {
	'UnkownError' = 1,
	'EmptyField' = 2,
	'ValidationError' = 3,
	'DatabaseError' = 4,
	'NotFound' = 5,
	'RedundantAction' = 6,
}

const errorStatus = {
	UnkownError: 500,
	EmptyField: 400,
	ValidationError: 400,
	DatabaseError: 500,
	NotFound: 404,
	RedundantAction: 409,
} as const;

export default class FormattedError {
	public code: number;
	public status: number;
	public name: string;
	public message: string;

	constructor(code: number, error: string | Error) {
		this.code = code;
		this.status = errorStatus[ErrorTypes[code] as keyof typeof errorStatus];
		this.name = ErrorTypes[code];
		this.message = typeof error === 'string' ? error : error.message;
	}
}
