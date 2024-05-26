import { SideMenu } from "./components/SideMenu";
import { PageContent } from "./components/PageContent";
import Box from "@mui/material/Box";

function App() {
	chrome.storage.local.get(["defaultClusterName"]).then((result) => {
		const storedClusterName = result["defaultClusterName"];
		console.log("---> storedClusterName", storedClusterName);
	});

	return (
		<Box display="flex">
			<SideMenu />
			<PageContent />
		</Box>
	);
}

export default App;
