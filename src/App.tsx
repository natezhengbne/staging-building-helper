import { SearchBar } from "./components/SearchBar";
import { ChangeInfoListCard } from "./components/ChangeInfoListCard";

function App() {
	return (
		<div className="w-screen max-w-screen-lg p-2 bg-amber-50">
			<SearchBar />
			<ChangeInfoListCard />
		</div>
	);
}

export default App;
