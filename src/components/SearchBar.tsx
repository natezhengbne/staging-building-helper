import { GerritChangeInfo } from "../types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSetAtom } from "jotai";
import { changeInfoListAtom } from "../store";
import { Input } from "./ui/input";
import { Button } from "@/src/components/ui/button";

type SearchForm = {
	topic: string;
};

export const SearchBar = () => {
	const { register, handleSubmit } = useForm<SearchForm>();
	const setGerritChangeList = useSetAtom(changeInfoListAtom);

	const onSubmit: SubmitHandler<SearchForm> = (data) => {
		setGerritChangeList([
			{
				current_revision: "1111111111",
				project: "webui",
				subject: "USER-111 XXX",
			},
			{
				current_revision: "22222222",
				project: "webui",
				subject: "USER-222 YYY",
			},
			{
				current_revision: "333333333",
				project: "jl",
				subject: "USER-3333 XXX",
				isSelected: true
			},
		]);
		// getGerritAccessTokenFromCookie().then((accessToken) => {
		// 	getGerritChangeInfosByTopic({
		// 		topic: data.topic,
		// 		accessToken,
		// 	}).then((changeInfos) => {
		// 		const sorted = changeInfos.sort((a, b) => {
		// 			if (a.project < b.project) {
		// 				return -1;
		// 			}
		// 			if (a.project > b.project) {
		// 				return 1;
		// 			}
		// 			return 0;
		// 		});
		// 		const initSelectedProjects: string[] = [];
		// 		sorted.forEach((changeInfo) => {
		// 			if (!initSelectedProjects.includes(changeInfo.project)) {
		// 				changeInfo.isSelected = true;
		// 				initSelectedProjects.push(changeInfo.project);
		// 			}
		// 		});
		// 		setGerritChangeList(sorted);
		// 	});
		// });
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<div className="flex w-full max-w-sm items-center space-x-2">
				<Input {...register("topic")} placeholder="Topic" required />
				<Button type="submit">Search</Button>
			</div>
		</form>
	);
};

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
