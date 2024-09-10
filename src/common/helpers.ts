import { Dashboard } from '../dashboards/entities/dashboard.entity';
import { Period } from '../periods/entities/period.entity';
import { Task } from '../tasks/entities/task.entity';
import { User } from '../users/entities/user.entity';
import { SortDirection, ColumnSortType, PERMISSION_LEVELS } from 'src/types';

export function sortByProperty(
	arr: Record<string, any>[],
	property: string,
	direction: SortDirection = 'asc',
	type: ColumnSortType = 'string',
	enumOrder?: Record<string, number>,
) {
	return arr.sort((a, b) => {
		// Extract the values of the property from the nested objects using property.split('.')
		const aValue = property.split('.').reduce((acc, prop) => acc[prop], a);
		const bValue = property.split('.').reduce((acc, prop) => acc[prop], b);

		// Handle case when aValue or bValue is null/undefined
		if (aValue == null && bValue == null) return 0;
		if (aValue == null) return direction === 'asc' ? -1 : 1;
		if (bValue == null) return direction === 'asc' ? 1 : -1;

		if (type === 'date') {
			return direction === 'desc'
				? new Date(bValue).getTime() - new Date(aValue).getTime()
				: new Date(aValue).getTime() - new Date(bValue).getTime();
		} else if (type === 'number') {
			return direction === 'desc' ? bValue - aValue : aValue - bValue;
		} else if (type === 'enum' && enumOrder) {
			// Sort according to the provided enum order
			return direction === 'asc' ? enumOrder[aValue] - enumOrder[bValue] : enumOrder[bValue] - enumOrder[aValue];
		} else {
			// Sort alphabetically
			return direction === 'asc'
				? String(aValue).localeCompare(String(bValue))
				: String(bValue).localeCompare(String(aValue));
		}
	});
}

export function getDefaultOrg(user: User) {
	return user.userOrganizationRoles.find((u) => u.isDefaultAccount).organization;
}

export function formatDate(date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

/* Function to extract the user ids from the HTML text with @param "inputString" using @param "attributeName"
 * i.e <p><span data-id="USER_UUID">User Name</span> example text</p>
 */
export function extractUserIds<T extends string>(inputString: string, attributeName: string): T[] {
	const regex = new RegExp(`${attributeName}="([^"]+)"`, 'g');
	const values: T[] = [];

	[...(inputString || '').matchAll(regex)].forEach((match) => {
		values.push(match[1] as T);
	});

	return values;
}

/**
 * Function to compares two lists of ids (previous and new) and returns a list of ids
 * that are either new or have been mentioned more frequently in the new list.
 * It first counts the occurrences of each id in both lists using the `countIds` helper function.
 * Then, it filters the new ids, keeping only those that are not in the previous list or have a higher count.
 * This function is typically used to track new or more frequent user mentions in updated content.
 */
export function extractNewUserIds(previousIds: string[], newIds: string[]): string[] {
	function countIds(ids: string[]): { [id: string]: number } {
		return ids.reduce((countMap, id) => {
			countMap[id] = (countMap[id] || 0) + 1;
			return countMap;
		}, {} as { [id: string]: number });
	}

	const countInPreviousIds = countIds(previousIds);
	const countNewIds = countIds(newIds);

	const newData = Object.keys(countNewIds).filter(
		(id) => !(id in countInPreviousIds) || countNewIds[id] > countInPreviousIds[id],
	);

	return newData;
}

export const generateSubQueryForDashboards = (
	queryBuilder,
	queryParams: Record<string, any>,
	extraConditions: string[] = [],
) => {
	const subQuery = queryBuilder
		.subQuery()
		.select('dashboard.id')
		.from(Dashboard, 'dashboard')
		.leftJoin('dashboard.userDashboards', 'userDashboard')
		.leftJoin('dashboard.roleDashboards', 'roleDashboard')
		.where(
			`(userDashboard.userId = :userId OR roleDashboard.roleId = :roleId) ${
				extraConditions.length ? `AND ${extraConditions.join(' AND ')}` : ''
			}`,
			{
				...queryParams,
			},
		)
		.getQuery();

	return queryBuilder.where(`dashboard.id IN (${subQuery})`);
};

export const generateSubQueryForTasks = (
	queryBuilder,
	queryParams: Record<string, any>,
	extraConditions: string[] = [],
) => {
	const subQuery = queryBuilder
		.subQuery()
		.select('task.id')
		.from(Task, 'task')
		.leftJoin('task.userTasks', 'userTask')
		.leftJoin('task.roleTaskPermissions', 'roleTaskPermission')
		.where(
			`task.isArchived = false AND (userTask.userId = :userId OR task.approverId = :userId OR roleTaskPermission.roleId = :roleId) ${
				extraConditions.length ? `AND ${extraConditions.join(' AND ')}` : ''
			}`,
			{
				...queryParams,
				today: new Date(),
			},
		)
		.getQuery();

	return queryBuilder.where(`task.id IN (${subQuery})`);
};

export const getRandomInt = (minimum = 0, maximum = 79) =>
	Math.floor(Math.random() * (maximum - minimum + 1)) + minimum;

export const isSuperAdmin = (user: User) => user.permissionLevel === PERMISSION_LEVELS.SUPER_ADMIN;

export const formatPeriod = (period: Period) => {
	return period.timePeriod === 'annually'
		? `${period.year}`
		: `${period.year} ${capitalize(period.correspondingNumber)}`;
};

export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1);
};
