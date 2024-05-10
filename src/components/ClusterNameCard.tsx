import { useAtom } from "jotai";
import { Badge } from "./ui/badge";
import { selectedClusterNameAtom, selectedClusterIdAtom } from "../store";

export const ClusterNameCard = () => {
	const [selectedCluster, setSelectedCluster] = useAtom(
		selectedClusterNameAtom
	);
	const [selectedId, setSelectedId] = useAtom(selectedClusterIdAtom);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex gap-1 flex-wrap">
				{CLUSTER_NAMES.map((cluster) => {
					return (
						<Badge
							key={cluster}
							variant={selectedCluster === cluster ? "default" : "outline"}
							onClick={() => setSelectedCluster(cluster)}
						>
							{cluster}
						</Badge>
					);
				})}
			</div>
			<div className="flex gap-1 flex-wrap">
				{CLUSTER_IDS.map((clusterId) => {
					return (
						<Badge
							key={clusterId}
							variant={selectedId === clusterId ? "default" : "outline"}
							onClick={() => setSelectedId(clusterId)}
						>
							{clusterId}
						</Badge>
					);
				})}
			</div>
		</div>
	);
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
