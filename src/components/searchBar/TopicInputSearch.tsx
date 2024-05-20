import { FC, PropsWithChildren, useEffect, useState } from "react";
import {
	getGerritAccessTokenFromCookie,
	queryInTopic,
} from "@/src/utils/gerritHelpers";
import { GerritChangeInfo } from "@/src/types";
import { useFormContext } from "react-hook-form";
import { useDebounceEffect } from "ahooks";
import { useSetAtom } from "jotai";
import { changeInfosDisplayAtom } from "@/src/store";

export const TopicInputSearch: FC<PropsWithChildren> = ({ children }) => {
	const formMethods = useFormContext();
	const [gerritAccessToken, setGerritAccessToken] = useState<string>("");
	const [topicResults, setTopicResults] = useState<string[]>();
	// This object is the result of a topic search, containing various relevant topics.
	const [changeInfoResults, setChangeInfoResults] = useState<
		GerritChangeInfo[]
	>([]);
	const inputValue = formMethods.watch("query");
	const [selectedTopic, setSelectedTopic] = useState<string>("");

	const setChangeInfoProjects = useSetAtom(changeInfosDisplayAtom);

	const handleTopicClick = (topic: string) => {
		setSelectedTopic(topic);
		formMethods.setValue("query", topic);
		setTopicResults(undefined);
		formMethods.handleSubmit(() => {
			const changeInfoByTopic = changeInfoResults.filter(
				(changeInfo) => changeInfo.topic === topic
			);
			setChangeInfoProjects(changeInfoByTopic);
		})();
	};

	useDebounceEffect(
		() => {
			if (
				!gerritAccessToken ||
				!inputValue ||
				selectedTopic === inputValue ||
				inputValue.length < 2
			) {
				return;
			}
			queryInTopic(gerritAccessToken, inputValue).then((changes) => {
				setChangeInfoResults(changes);
				const topics = new Set<string>();
				changes.forEach((change) => {
					if (change.topic) {
						topics.add(change.topic);
					}
				});
				if (topics.size > 1) {
					setTopicResults(Array.from(topics));
				}
			});
		},
		[inputValue],
		{
			wait: 1000,
		}
	);

	useEffect(() => {
		getGerritAccessTokenFromCookie()
			.then((accessToken) => setGerritAccessToken(accessToken))
			.catch(() => null);
	}, []);

	if (!topicResults) {
		return <>{children}</>;
	}

	return (
		<>
			{children}
			<ul className="p-2">
				{topicResults.map((topic) => (
					<li
						key={topic}
						className="text-xs cursor-pointer hover:underline"
						onClick={() => handleTopicClick(topic)}
					>
						{topic}
					</li>
				))}
			</ul>
		</>
	);
};
