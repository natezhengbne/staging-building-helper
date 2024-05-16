import { GerritChangeInfo, GerritChangeInfoProjects } from "@/src/types";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAtom } from "jotai";
import { changeInfoProjectsAtom, selectedRevisionsAtom } from "@/src/store";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { gerritChangeInfoProjectsData } from "../fixture";
import { useEffect, useState } from "react";
import { permissionConfig } from "@/src/permissions";
import { useResetAtom } from "jotai/utils";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Bird } from "lucide-react";
import { GitGraph } from "lucide-react";
import { X } from "lucide-react";
type SearchType = "topic" | "revision";

type SearchForm = {
	query: string;
};

export const SearchBar = () => {
	const { register, handleSubmit, reset, getValues, watch } = useForm<SearchForm>();
	const searchInput = watch("query");

	const [changeInfoProjects, setChangeInfoProjects] = useAtom(
		changeInfoProjectsAtom
	);
	const resetSelection = useResetAtom(selectedRevisionsAtom);
	const [activeTab, setActiveTab] = useState<SearchType>("topic");

	const [error, setError] = useState<string | React.ReactNode>("");
	const hasNoResults =
		!changeInfoProjects || Object.keys(changeInfoProjects).length <= 0;

	useEffect(() => {
		if (hasNoResults) {
			if (getValues("query")) {
				reset();
			}
		}
	}, [hasNoResults, getValues, reset]);

	const handleClean = () => {
		reset();
		setError("");
	};

	const onSubmit: SubmitHandler<SearchForm> = async (data) => {
		if (data.query === "111") {
			setChangeInfoProjects(gerritChangeInfoProjectsData);
			return;
		}
		setError("");
		const accessToken = await getGerritAccessTokenFromCookie();
		if (!accessToken) {
			setError("The Gerrit access token is unreachable");
			setError(
				<span>
					{"The "}
					<a
						className="underline font-semibold font-sans"
						target="_blank"
						href={permissionConfig.GERRIT_WEB.ORIGIN_HTTPS}
					>
						Gerrit
					</a>
					{" access token is unreachable"}
				</span>
			);
			return;
		}

		let changeInfos: GerritChangeInfo[] = [];
		try {
			changeInfos = await queryGerritChangeInfos(
				accessToken,
				data.query,
				activeTab
			);
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
		<Tabs
			defaultValue="topic"
			onValueChange={(value) => setActiveTab(value as SearchType)}
		>
			<TabsList className="grid w-full grid-cols-2 mb-1">
				<TabsTrigger value="topic">
					<div className="flex gap-1 items-center hover:animate-pulse">
						<Bird size={16} />
						<span>Topic</span>
					</div>
				</TabsTrigger>
				<TabsTrigger value="revision">
					<div className="flex gap-1 items-center hover:animate-pulse">
						<GitGraph size={16} />
						<span>Revision</span>
					</div>
				</TabsTrigger>
			</TabsList>
			<form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
				<div className="flex w-full items-center space-x-2">
					<div className="grow relative">
						<Input
							className="pr-8"
							autoFocus
							{...register("query")}
							required
						/>
						{!!searchInput && (
							<div
								className="absolute top-0 right-0 h-full flex flex-col justify-center mx-1 cursor-pointer"
								onClick={handleClean}
							>
								<X
									strokeWidth={1}
									className="h-6 w-6 rounded-full hover:bg-orange-100 p-1"
								/>
							</div>
						)}
					</div>
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
				<ul className="py-2 px-2 text-xs text-muted-foreground list-disc">
					<p className="text-xs">Search Example:</p>
					<li className="list-inside">
						Topic:{" "}
						<span className="italic font-semibold font-sans">
							expand-248-uk-address-lookup
						</span>
					</li>
					<p className="text-xs">Revision:</p>
					<li className="list-inside">
						URL:{" "}
						<span className="italic font-semibold font-sans">
							https://GERRIT_DOMAIN/c/admin-ui/+/124403
						</span>
					</li>
					<li className="list-inside break-all">
						SHA:{" "}
						<span className="italic font-semibold font-sans">
							3c7a4f7054f73659595d8b974373352aba0a7d53
						</span>
					</li>
					<li className="list-inside break-all">
						Change ID:{" "}
						<span className="italic font-semibold font-sans">127346</span>
					</li>
				</ul>
			)}
		</Tabs>
	);
};

const getGerritAccessTokenFromCookie = async (): Promise<string | null> => {
	const result = await chrome.cookies.getAll({
		domain: permissionConfig.GERRIT_WEB.DOMAIN,
		name: permissionConfig.GERRIT_WEB.COOKIE_ACCESS_TOKEN,
	});
	if (result && result.length > 0) {
		return result[0].value;
	}

	return null;
};

const queryGerritChangeInfos = async (
	accessToken: string,
	query: string,
	type: SearchType
): Promise<GerritChangeInfo[]> => {
	let gerritQueryParameter = "";

	if (type === "topic") {
		// handle topic: expand-248-uk-address-lookup
		gerritQueryParameter = `topic:${query}`;
	} else if (type === "revision") {
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
				return Promise.reject(new Error("The Gerrit patch URL is invalid"));
			}
		} catch (e) {
			// handle SHA: 3c7a4f7054f73659595d8b974373352aba0a7d53
			// handle changId: 124403
			gerritQueryParameter = query;
		}
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
