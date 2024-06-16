import { SearchBar } from "./components/SearchBar";
import { JenkinsBuildCard } from "./components/JenkinsBuildCard";
import { Footer } from "./components/Footer";

function App() {
	return (
		<div className="w-screen max-w-screen-md p-2 bg-amber-50">
			<SearchBar />
			<JenkinsBuildCard />
			{/* <Footer /> */}
		</div>
	);
}

export default App;
