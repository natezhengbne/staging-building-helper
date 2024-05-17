import { permissionConfig } from "@/src/permissions";

export const getCurrentJenkinsPageTab = async () => {
	return chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
		url: `${permissionConfig.JENKINS.CLUSTER_PIPELINE_SITE}*`,
	});
};

export const getServiceStatusPageTab = async () => {
	const [tab] = await chrome.tabs.query({
		url: `${permissionConfig.SERVICE_STATUS.ORIGIN_HTTPS}/*`,
	});

	return tab;
};
