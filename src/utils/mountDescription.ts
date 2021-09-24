import FormattedError, { ErrorTypes } from '../models/error.model';
import { ACTIONS } from '../constants';
import { IActivity } from '../models';

export function mountDescription(activity: IActivity): string {
	if (activity.action === ACTIONS.FOLLOW) {
		return `
      @${activity.actor} começou a seguir @${activity.target}
    `;
	}

	if (activity.action === ACTIONS.LIKE) {
		return `
      @${activity.actor} favoritou @${activity.target}
    `;
	}

	if (activity.action === ACTIONS.READ) {
		return `
      @${activity.actor} leu @${activity.target}
    `;
	}

	throw new FormattedError(
		ErrorTypes.ValidationError,
		'Atividade desconhecida.'
	);
}
