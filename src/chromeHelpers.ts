export const getCurrentJenkinsPageTab = async () => {
    return chrome.tabs.query({
		active: true,
		lastFocusedWindow: true,
		url: "https://build.dev.benon.com/view/Cluster/job/cluster.pipeline/build*",
	});
}
