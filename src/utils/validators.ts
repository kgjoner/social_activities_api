import FormattedError, { ErrorTypes } from '../models/error.model';

//eslint-disable-next-line
export function validateFieldsExistence(target: any, fields?: string[]): void {
	if (!fields) fields = Object.keys(target);

	try {
		fields.forEach(field => {
			existOrError(target[field], `Campo "${field}" está vazio.`);
		});
	} catch (msg) {
		throw new FormattedError(ErrorTypes.EmptyField, msg);
	}
}

export function existOrError(
	value: string | number | any[],
	msg: string
): void {
	if (
		!value ||
		(Array.isArray(value) && value.length == 0) ||
		(typeof value === 'string' && !value.trim())
	)
		throw msg;
}
