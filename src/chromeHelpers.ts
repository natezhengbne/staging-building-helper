import { permissionConfig } from "@/src/permissions";

export const getCurrentJenkinsPageTab = async () => {
	return chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
		url: `${permissionConfig.JENKINS.CLUSTER_PIPELINE_SITE}*`,
	});
};
