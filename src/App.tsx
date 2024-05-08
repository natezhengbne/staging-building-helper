import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
	const [count, setCount] = useState(0);
  const [gerritChangeInfos, setGerritChangeInfos] = useState<GerritChangeInfo[] | []>([]);

	const handleClick = () => {
		setCount((count) => count + 1);

		getGerritAccessTokenFromCookie().then((accessToken) => {
			getGerritChangeInfosByTopic({
				topic: "expand-248-uk-address-lookup",
				accessToken,
			}).then(changeInfos => {
        setGerritChangeInfos(changeInfos);
      });
		});
	};

	return (
		<>
			<div>
				<a href="https://vitejs.dev" target="_blank">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Vite + React</h1>
			<div className="card">
				<button onClick={handleClick}>count is - {count}</button>
        <div>{`found patches: ${gerritChangeInfos.length}`}</div>
				<p>
					Edit <code>src/App.tsx</code> and save to test HMR
				</p>
			</div>
			<p className="read-the-docs">
				Click on the Vite and React logos to learn more
			</p>
		</>
	);
}

export default App;

const getGerritAccessTokenFromCookie = async (): Promise<string> => {
	const result = await chrome.cookies.getAll({
		domain: "gerrit.dev.benon.com",
		name: "GerritAccount",
	});
	if (result && result.length > 0) {
		return result[0].value;
	}

	return Promise.reject();
};

// https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#change-info
type GerritChangeInfo = {
	subject: string;
  branch: string;
  project: string;
  status: string;
  current_revision: string;
};

const getGerritChangeInfosByTopic = async (search: {
	topic: string;
	accessToken: string;
}): Promise<GerritChangeInfo[]> => {
	const params = new URLSearchParams({
		q: `topic:${search.topic}`,
		pp: "0",
		o: "CURRENT_REVISION",
		access_token: search.accessToken,
	});

	const response = await fetch(
		`https://gerrit.dev.benon.com/changes?${params}`
	);

  if (!response.ok) {
    return Promise.reject();
  }

	const body = await response.text();
  const cleanedBody = body.replace(")]}'", "");

	return JSON.parse(cleanedBody);
};
