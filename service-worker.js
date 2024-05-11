const JENKINS_ORIGIN = "https://build.dev.benon.com";

function setupContextMenu() {
	chrome.contextMenus.create({
		id: "stagingBuildingHelper",
		title: "Open Staging Helper",
		contexts: ["all"],
		documentUrlPatterns: ["*://build.dev.benon.com/*"],
	});
}

chrome.runtime.onInstalled.addListener(() => {
	setupContextMenu();
});

chrome.contextMenus.onClicked.addListener((data, tab) => {
    if (isJenkinsBuildPage(tab) && data.menuItemId === "stagingBuildingHelper") {
        chrome.sidePanel.open({ tabId: tab.id });
    }
});

// Allows users to open the side panel by clicking on the action toolbar icon
chrome.sidePanel
	.setPanelBehavior({ openPanelOnActionClick: true })
	.catch((error) => console.error(error));

function isJenkinsBuildPage(tab) {
	if (!tab.url) return false;
	const url = new URL(tab.url);
	return url.origin === JENKINS_ORIGIN;
}
