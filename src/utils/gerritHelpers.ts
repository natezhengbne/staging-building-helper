import { permissionConfig } from "../permissions";
import { GerritChangeInfo } from "../types";

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

	const response = await fetch(
		`${permissionConfig.GERRIT_API.REST_CHANGES}?${params}`
	);

	if (!response.ok) {
		return Promise.reject(new Error(`Query failed: ${response.status}`));
	}

	const body = await response.text();
	const cleanedBody = body.replace(")]}'", "");
	if (!cleanedBody || cleanedBody === "[]") {
		return Promise.reject(
			new Error("No patches match your search or Gerrit login session expired")
		);
	}

	return JSON.parse(cleanedBody);
};
