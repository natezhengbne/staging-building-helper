import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Badge } from "./ui/badge";
import {
	selectedClusterNameAtom,
	selectedClusterIdAtom,
	stagingsStatusLastRefreshTimeAtom,
	unavailableClustersAtom,
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

export const ClusterStatusCard = () => {
	const [selectedCluster, setSelectedCluster] = useAtom(
		selectedClusterNameAtom
	);
	const [selectedId, setSelectedId] = useAtom(selectedClusterIdAtom);
	const unavailableClusters = useAtomValue(unavailableClustersAtom);

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
				<div className="flex gap-2 flex-wrap">
					{CLUSTER_IDS.map((clusterId) => {
						const isAvailable =
							stagingsStatusLastRefreshTime &&
							!unavailableClusters.has(`${selectedCluster}${clusterId}`) &&
							!unavailableClusters.has(`Staging${clusterId}`);

						return (
							<div key={clusterId} className="relative">
								<Badge
									className={"cursor-pointer "}
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
	const setUnavailableClusters = useSetAtom(unavailableClustersAtom);

	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState("");

	const handleRefresh = useCallback(async () => {
		const tab = await getServiceStatusPageTab();
		if (!tab || !tab.id) {
			setError(
				"You need to open the service-status page to obtain access authorization"
			);
			return;
		}

		const token = await getAuthenticationsFromServiceStatus(tab.id);
		if (!token) {
			setError("You need to login service-status.");
			return;
		}

		setError("");
		setIsRefreshing(true);
		const clustersStatus = await queryClustersStatus(token);
		setUnavailableClusters(new Set(""));

		clustersStatus.forEach((staging) => {
			let currentStagingClustersCount = 0;
			const maxClustersForSlot = 4;
			staging.builds?.forEach((cluster) => {
				const expires = dayjs(cluster.expires);

				if (expires.isAfter(dayjs())) {
					currentStagingClustersCount++;
					setUnavailableClusters((curr) => curr.add(cluster.name));
				}
			});
			if (currentStagingClustersCount === maxClustersForSlot) {
				setUnavailableClusters((curr) => curr.add(staging.name));
			}
		});
		setStagingsStatusLastRefreshTime(new Date());
		setIsRefreshing(false);
	}, [setStagingsStatusLastRefreshTime, setUnavailableClusters]);

	return (
		<div className="px-2 text-xs text-muted-foreground">
			<span>
				Last refreshed:{" "}
				{!isRefreshing ? (
					stagingsStatusLastRefreshTime ? (
						dayjs(stagingsStatusLastRefreshTime).format("HH:mm:ss")
					) : (
						"n/a"
					)
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
				<div className="text-red-600 text-sm">
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
	"agrajag",
	"fire",
	"frontier",
	"handy",
	"hydra",
	"mutants",
	"nightly",
	"sanic",
	"rocket",
	"zim",
] as const;
const CLUSTER_IDS = ["1", "2", "3", "4", "5", "6"] as const;
