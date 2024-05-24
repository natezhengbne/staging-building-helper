import { permissionConfig } from "../permissions";
import {
	GerritAccount,
	GerritChangeInfo,
	GerritChangeInfoProjects,
} from "../types";

const getCleanBody = (body: string): string => body.replace(")]}'", "");

export const fetchGerritChangeInfos = async (
	accessToken: string,
	query: string
): Promise<GerritChangeInfo[]> => {
	const params = new URLSearchParams({
		q: query,
		pp: "0",
		o: "CURRENT_REVISION",
		access_token: accessToken,
	});

	try {
		const response = await fetch(
			`${permissionConfig.GERRIT_API.REST_CHANGES}?${params}`
		);

		if (!response.ok) {
			return Promise.reject(new Error(`Query failed: ${response.status}`));
		}

		const body = await response.text();
		const cleanedBody = getCleanBody(body);
		if (!cleanedBody || cleanedBody === "[]") {
			return Promise.reject(
				new Error(
					"No patches match your search or Gerrit login session expired"
				)
			);
		}

		return JSON.parse(cleanedBody);
	} catch (_) {
		return Promise.reject(new Error("Gerrit Rest API is unreachable"));
	}
};

/**
 * intopic:'TOPIC'
 * If 'TOPIC' starts with ^ it matches topic names by regular expression patterns.
 * https://gerrit-review.googlesource.com/Documentation/user-search.html
 * @param topic whose designated topic contains 'TOPIC', using a full-text search.
 */
export const queryInTopic = (
	accessToken: string,
	topic: string
): Promise<GerritChangeInfo[]> => {
	const queryParameter = `intopic:${topic}`;

	return fetchGerritChangeInfos(accessToken, queryParameter);
};

export const getGerritAccessTokenFromCookie = async (): Promise<string> => {
	const result = await chrome.cookies.getAll({
		domain: permissionConfig.GERRIT_WEB.DOMAIN,
		name: permissionConfig.GERRIT_WEB.COOKIE_ACCESS_TOKEN,
	});
	if (result && result.length > 0) {
		return result[0].value;
	}

	return Promise.reject();
};

export const splitGerritInfoChangesByProject = (
	changes: GerritChangeInfo[]
): GerritChangeInfoProjects => {
	const changeInfoProjects: GerritChangeInfoProjects = {};
	changes.forEach((changeInfo) => {
		const project = changeInfoProjects[changeInfo.project];
		if (project) {
			project.push(changeInfo);
		} else {
			changeInfoProjects[changeInfo.project] = [changeInfo];
		}
	});
	return changeInfoProjects;
};

export const querySelfAccount = async(
	accessToken: string
): Promise<GerritAccount> => {

	const params = new URLSearchParams({
		access_token: accessToken,
	});

	const response = await fetch(
		`${permissionConfig.GERRIT_API.REST_ACCOUNTs}/self?${params}`
	);
	const body = await response.text();
	const cleanedBody = getCleanBody(body);

	return JSON.parse(cleanedBody);
};
