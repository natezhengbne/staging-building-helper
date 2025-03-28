import { GerritChangeInfo } from "@/src/types";
import { useForm, SubmitHandler, FormProvider } from "react-hook-form";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	changeInfoRefreshedAtAtom,
	changeInfosDisplayAtom,
	derivedServicesConnectionAtom,
} from "@/src/store";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { gerritChangeInfos } from "../fixture";
import { useCallback, useEffect, useState } from "react";
import { permissionConfig } from "@/src/permissions";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Bird } from "lucide-react";
import { GitGraph } from "lucide-react";
import { X } from "lucide-react";
import {
	fetchGerritChangeInfos,
	getGerritAccessTokenFromCookie,
} from "../utils/gerritHelpers";
import { TopicInputSearch } from "./searchBar/TopicInputSearch";
import { ComponentEvent } from "../constants";
import dayjs from "dayjs";

type SearchType = "topic" | "revision";

type SearchForm = {
	query: string;
};

export const SearchBar = () => {
	const formMethods = useForm<SearchForm>();
	const searchInput = formMethods.watch("query");

	const [changeInfoProjects, setChangeInfoProjects] = useAtom(
		changeInfosDisplayAtom
	);
	const changeInfoRefreshedAt = useAtomValue(changeInfoRefreshedAtAtom);
	const [activeTab, setActiveTab] = useState<SearchType>("topic");
	const updateConnection = useSetAtom(derivedServicesConnectionAtom);
	const [error, setError] = useState<string | React.ReactNode>("");
	const hasNoResults =
		!changeInfoProjects || Object.keys(changeInfoProjects).length <= 0;

	const handleClean = useCallback(() => {
		formMethods.reset();
		setError("");
	}, [formMethods, setError]);

	const onSubmit: SubmitHandler<SearchForm> = async (data) => {
		setError("");
		if (data.query === "111" && import.meta.env.MODE === "development") {
			setChangeInfoProjects(gerritChangeInfos);
			return;
		}
		const accessToken = await getGerritAccessTokenFromCookie().catch(() => {
			setError(<GerritTokenUnreachable />);
		});

		if (!accessToken) {
			return;
		}

		try {
			const param = buildGerritQueryParameter(data.query, activeTab);
			const changeInfos: GerritChangeInfo[] = await fetchGerritChangeInfos(
				accessToken,
				param
			);
			updateConnection("gerrit");
			if (changeInfos && changeInfos.length > 0) {
				setChangeInfoProjects(changeInfos);
			} else {
				setError("No Gerrit patches match your search");
			}
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message);
			} else {
				setError("No Gerrit patches match your search");
			}
		}
	};

	useEffect(() => {
		window.addEventListener(ComponentEvent.ClearAll, handleClean);
		return () => {
			window.removeEventListener(ComponentEvent.ClearAll, handleClean);
		};
	}, [handleClean]);

	return (
		<Tabs
			defaultValue="topic"
			onValueChange={(value) => setActiveTab(value as SearchType)}
		>
			<TabsList className="grid w-full grid-cols-2 mb-1">
				<TabsTrigger value="topic">
					<div className="flex gap-1 items-center hover:animate-pulse">
						{activeTab === "topic" && <Bird size={16} />}
						<span>Topic</span>
					</div>
				</TabsTrigger>
				<TabsTrigger value="revision">
					<div className="flex gap-1 items-center hover:animate-pulse">
						{activeTab === "revision" && <GitGraph size={16} />}
						<span>Revision</span>
					</div>
				</TabsTrigger>
			</TabsList>
			<FormProvider {...formMethods}>
				<form onSubmit={formMethods.handleSubmit(onSubmit)} autoComplete="off">
					<TopicInputSearch>
						<div className="flex w-full items-center space-x-2">
							<div className="grow relative">
								<Input
									className="pr-8"
									autoFocus
									{...formMethods.register("query")}
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
						{changeInfoRefreshedAt && (
							<p className="px-2 text-xs text-muted-foreground font-mono">{`search at: ${dayjs(changeInfoRefreshedAt).format("DDMMM HH:mm:ss")}`}</p>
						)}
					</TopicInputSearch>
					{error && (
						<div className="p-1 text-red-600 text-xs">
							<p>{error}</p>
						</div>
					)}
				</form>
			</FormProvider>
			<SearchIntroduction isDisplay={hasNoResults} />
		</Tabs>
	);
};

const buildGerritQueryParameter = (
	queryContent: string,
	type: SearchType
): string => {
	let gerritQueryParameter = "";

	if (type === "topic") {
		// handle topic: expand-248-uk-address-lookup
		gerritQueryParameter = `topic:${queryContent}`;
	} else if (type === "revision") {
		// handle url: https://gerrit.dev.benon.com/c/admin-ui/+/124403
		try {
			const url = new URL(queryContent);
			if (url.origin === permissionConfig.GERRIT_WEB.ORIGIN_HTTPS) {
				const pathNames = url.pathname.split("/");
				const idNumber = pathNames[pathNames.length - 1];
				const isNumber = /^\d+$/.test(idNumber);
				if (isNumber) {
					gerritQueryParameter = `change:${idNumber}`;
				}
			} else {
				throw new Error("The Gerrit patch URL is invalid");
			}
		} catch (e) {
			// handle SHA: 3c7a4f7054f73659595d8b974373352aba0a7d53
			// handle changId: 124403
			gerritQueryParameter = queryContent;
		}
	}

	if (!gerritQueryParameter) {
		throw new Error("Query parameter is invalid");
	}

	return gerritQueryParameter;
};

const SearchIntroduction = ({ isDisplay }: { isDisplay: boolean }) => {
	if (!isDisplay) {
		return null;
	}

	return (
		<>
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
				<li className="list-inside break-all">
					Jira:{" "}
					<span className="italic font-semibold font-sans">INCIDENT-621</span>
				</li>
			</ul>
		</>
	);
};

const GerritTokenUnreachable = () => {
	return (
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
};
