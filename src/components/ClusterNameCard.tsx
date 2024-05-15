import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Badge } from "./ui/badge";
import {
	selectedClusterNameAtom,
	selectedClusterIdAtom,
	unavailableStagingsAtom,
	stagingsStatusLastRefreshTimeAtom,
} from "../store";
import { useCallback, useEffect, useState } from "react";
import { getServiceStatusPageTab } from "../chromeHelpers";
import { permissionConfig } from "../permissions";
import {
	StagingsClusterStatus,
	ServiceStatusSiteAuthentication,
} from "../types";
import dayjs from "dayjs";
import { Button } from "./ui/button";

export const ClusterNameCard = () => {
	const [selectedCluster, setSelectedCluster] = useAtom(
		selectedClusterNameAtom
	);
	const [selectedId, setSelectedId] = useAtom(selectedClusterIdAtom);
	const unavailableStagings = useAtomValue(unavailableStagingsAtom);
	const stagingsStatusLastRefreshTime = useAtomValue(
		stagingsStatusLastRefreshTimeAtom
	);

	useEffect(() => {
		if (selectedCluster) {
			return;
		}
		chrome.storage.local.get(["defaultClusterName"]).then((result) => {
			const storedClusterName = result["defaultClusterName"];
			if (storedClusterName) {
				setSelectedCluster(storedClusterName);
			}
		});
	}, [setSelectedCluster, selectedCluster]);

	return (
		<>
			<div className="flex flex-col gap-2">
				<div className="flex gap-1 flex-wrap">
					{CLUSTER_NAMES.map((cluster) => {
						return (
							<Badge
								className="cursor-pointer"
								key={cluster}
								variant={selectedCluster === cluster ? "default" : "outline"}
								onClick={() => {
									setSelectedCluster(cluster);
									chrome.storage.local.set({ defaultClusterName: cluster });
								}}
							>
								{cluster}
							</Badge>
						);
					})}
				</div>
				<div className="flex gap-1 flex-wrap">
					{CLUSTER_IDS.map((clusterId) => {
						const isAvailable =
							stagingsStatusLastRefreshTime &&
							!unavailableStagings.includes(`${selectedCluster}${clusterId}`);

						return (
							<div className="relative">
								<Badge
									className={"cursor-pointer "}
									key={clusterId}
									variant={selectedId === clusterId ? "default" : "outline"}
									onClick={() => setSelectedId(clusterId)}
								>
									{clusterId}
								</Badge>
								{isAvailable && (
									<span className="absolute -top-0.5 -right-0.5 flex size-1.5">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full size-1.5 bg-green-400"></span>
									</span>
								)}
							</div>
						);
					})}
				</div>
			</div>
			<StagingRefreshingStatus />
		</>
	);
};

const StagingRefreshingStatus = () => {
	const [stagingsStatusLastRefreshTime, setStagingsStatusLastRefreshTime] =
		useAtom(stagingsStatusLastRefreshTimeAtom);
	const setUnavailableStagings = useSetAtom(unavailableStagingsAtom);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState("");

	const handleRefresh = useCallback(async () => {
		setIsRefreshing(true);
		const tab = await getServiceStatusPageTab();
		if (!tab || !tab.id) {
			setError("You need to open service-status to refresh.");
			return;
		}

		const token = await getAuthenticationsFromServiceStatus(tab.id);
		if (!token) {
			setError("You need to login service-status to refresh.");
			return;
		}

		const clustersStatus = await queryClustersStatus(token);

		clustersStatus.forEach((staging) => {
			staging.builds?.forEach((cluster) => {
				const expires = dayjs(cluster.expires);

				if (expires.isAfter(dayjs())) {
					setUnavailableStagings((curr) => [...curr, cluster.name]);
				}
			});
		});
		setStagingsStatusLastRefreshTime(new Date());
		setIsRefreshing(false);
	}, [setStagingsStatusLastRefreshTime, setUnavailableStagings]);

	useEffect(() => {
		handleRefresh();
	}, [handleRefresh]);

	return (
		<div className="px-2 text-xs text-muted-foreground">
			<span>
				Last refreshed:{" "}
				{!isRefreshing ? (
					dayjs(stagingsStatusLastRefreshTime).format("HH:mm:ss")
				) : (
					<span className="text-xs animate-pulse">Refreshing now</span>
				)}
			</span>
			<Button
				variant="link"
				onClick={() => {
					if (isRefreshing) {
						return;
					}
					handleRefresh();
				}}
				className={isRefreshing ? "text-xs cursor-not-allowed" : "text-xs"}
			>
				Refresh
			</Button>
			{error && (
				<div className="p-2 text-red-600 text-sm">
					<p>{error}</p>
				</div>
			)}
		</div>
	);
};

const getAuthenticationsFromServiceStatus = async (tabId: number) => {
	const [scriptResult] = await chrome.scripting.executeScript({
		target: { tabId },
		func: () => {
			return window.localStorage.authentications;
		},
	});

	try {
		const authentications = JSON.parse(
			scriptResult.result
		) as ServiceStatusSiteAuthentication[];
		const token = authentications.find(
			(authentication) => authentication.token
		)?.token;
		if (token) {
			return token;
		}
		return Promise.reject();
	} catch (e) {
		return Promise.reject();
	}
};

const queryClustersStatus = async (
	token: string
): Promise<StagingsClusterStatus[]> => {
	const response = await fetch(permissionConfig.SERVICE_STATUS.REST_CLUSTERS, {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	});

	if (!response.ok) {
		return Promise.reject();
	}

	const data = await response.json();

	return data["result"];
};

const CLUSTER_NAMES = [
	"rocket",
	"handy",
	"agrajag",
	"fire",
	"frontier",
	"hydra",
	"mutants",
	"nightly",
	"sanic",
	"zim",
] as const;
const CLUSTER_IDS = ["1", "2", "3", "4", "5", "6"] as const;
