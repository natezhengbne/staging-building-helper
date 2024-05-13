import { GerritChangeInfo, GerritChangeInfoProjects } from "@/src/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAtom } from "jotai";
import { changeInfoProjectsAtom, selectedRevisionsAtom } from "@/src/store";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { gerritChangeInfoProjectsData } from "../fixture";
import { useEffect, useState } from "react";
import { getCurrentJenkinsPageTab } from "../chromeHelpers";
import { permissionConfig } from "@/src/permissions";
import { useResetAtom } from "jotai/utils";

type SearchForm = {
	query: string;
};

export const SearchBar = () => {
	const { register, handleSubmit, reset, getValues } = useForm<SearchForm>();
	const [changeInfoProjects, setChangeInfoProjects] = useAtom(
		changeInfoProjectsAtom
	);
	const resetSelection = useResetAtom(selectedRevisionsAtom);

	const [error, setError] = useState("");
	const hasNoResults =
		!changeInfoProjects || Object.keys(changeInfoProjects).length <= 0;

	useEffect(() => {
		if (hasNoResults) {
			if (getValues("query")) {
				reset();
			}
		}
	}, [hasNoResults, getValues, reset]);

	const onSubmit: SubmitHandler<SearchForm> = async (data) => {
		if (data.query === "111") {
			setChangeInfoProjects(gerritChangeInfoProjectsData);
			return;
		}
		setError("");
		const [tab] = await getCurrentJenkinsPageTab();
		if (!tab) {
			setError("It is designed to be used on the Jenkins pipeline build page");
			return;
		}

		const accessToken = await getGerritAccessTokenFromCookie();
		if (!accessToken) {
			setError("The Gerrit access token is unreachable");
			return;
		}

		let changeInfos: GerritChangeInfo[] = [];
		try {
			changeInfos = await queryGerritChangeInfos(accessToken, data.query);
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("No Gerrit patches match your search");
			}
		}

		if (changeInfos && changeInfos.length > 0) {
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
			resetSelection();
		} else {
			setError("No Gerrit patches match your search");
		}
	};

	return (
		<>
			<form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
				<div className="flex w-full items-center space-x-2">
					<Input
						autoFocus
						{...register("query")}
						placeholder="Topic/URL/CommitID"
						required
					/>
					<Button type="submit" className="bg-indigo-500">
						Search
					</Button>
				</div>
				{error && (
					<div className="p-2 text-red-600 text-sm">
						<p>{error}</p>
					</div>
				)}
			</form>
			{hasNoResults && (
				<ul className="py-1 px-4 text-xs text-muted-foreground list-disc">
					<p>e.g.</p>
					<li>
						Topic:{" "}
						<span className="italic font-semibold font-sans">
							expand-248-uk-address-lookup
						</span>
					</li>
					<li>
						URL:{" "}
						<span className="italic font-semibold font-sans">
							https://gerrit.dev.benon.com/c/admin-ui/+/124403
						</span>
					</li>
					<li className="break-all">
						Commit SHA:{" "}
						<span className="italic font-semibold font-sans">
							3c7a4f7054f73659595d8b974373352aba0a7d53
						</span>
					</li>
				</ul>
			)}
		</>
	);
};

const getGerritAccessTokenFromCookie = async (): Promise<string | null> => {
	const result = await chrome.cookies.getAll({
		domain: permissionConfig.GERRIT_WEB.DOMAIN,
		name: permissionConfig.GERRIT_WEB.COOKIE_NAME_ACCESS_TOKEN,
	});
	if (result && result.length > 0) {
		return result[0].value;
	}

	return null;
};

const queryGerritChangeInfos = async (
	accessToken: string,
	query: string
): Promise<GerritChangeInfo[]> => {
	let gerritQueryParameter = "";

	// handle url: https://gerrit.dev.benon.com/c/admin-ui/+/124403
	try {
		const url = new URL(query);
		if (url.origin === permissionConfig.GERRIT_WEB.ORIGIN_HTTPS) {
			const pathNames = url.pathname.split("/");
			const idNumber = pathNames[pathNames.length - 1];
			const isNumber = /^\d+$/.test(idNumber);
			if (isNumber) {
				gerritQueryParameter = `change:${idNumber}`;
			}
		} else {
			return Promise.reject(new Error("The Gerrit URL is invalid"));
		}
	} catch (e) {
		// do nothing
	}

	// handle SHA: 3c7a4f7054f73659595d8b974373352aba0a7d53
	if (!gerritQueryParameter && /\b([a-f0-9]{40})\b/.test(query)) {
		gerritQueryParameter = query;
	}

	// handle topic: expand-248-uk-address-lookup
	if (!gerritQueryParameter) {
		gerritQueryParameter = `topic:${query}`;
	}

	if (!gerritQueryParameter) {
		return Promise.reject(new Error("Query parameter is invalid"));
	}

	const params = new URLSearchParams({
		q: gerritQueryParameter,
		pp: "0",
		o: "CURRENT_REVISION",
		access_token: accessToken,
	});

	const response = await fetch(
		`${permissionConfig.GERRIT_API.REST_CHANGES}?${params}`
	);

	if (!response.ok) {
		return Promise.reject(new Error(`Query failed: ${response.status}`));
	}

	const body = await response.text();
	const cleanedBody = body.replace(")]}'", "");
	if (!cleanedBody || cleanedBody === "[]") {
		return Promise.reject(
			new Error("No patches match your search or Gerrit session expired")
		);
	}

	return JSON.parse(cleanedBody);
};
