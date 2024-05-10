import { GerritChangeInfo, GerritChangeInfoProjects } from "@/src/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useSetAtom } from "jotai";
import { changeInfoProjectsAtom } from "@/src/store";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";

type SearchForm = {
	topic: string;
};

/**
 * example: https://gerrit.dev.benon.com/q/topic:%22expand-248-uk-address-lookup%22
 *
 */
export const SearchBar = () => {
	const { register, handleSubmit } = useForm<SearchForm>();
	const setChangeInfoProjects = useSetAtom(changeInfoProjectsAtom);

	const onSubmit: SubmitHandler<SearchForm> = (data) => {
		// setChangeInfoProjects(gerritChangeInfoProjectsData);
		getGerritAccessTokenFromCookie().then((accessToken) => {
			getGerritChangeInfosByTopic({
				topic: data.topic,
				accessToken,
			}).then((changeInfos) => {
				const changeInfoProjects: GerritChangeInfoProjects = {};

				changeInfos.forEach((changeInfo) => {
					const project = changeInfoProjects[changeInfo.project];
					if (project) {
						project.push(changeInfo);
					} else {
						changeInfoProjects[changeInfo.project] = [changeInfo];
					}
				});
				setChangeInfoProjects(changeInfoProjects);
			});
		});
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
