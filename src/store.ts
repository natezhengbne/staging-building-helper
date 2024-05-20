import { atom } from "jotai";
import {
	GerritChangeInfo,
	GerritChangeInfoProjects,
	JenkinsBuildInfo,
	JenkinsImageTag,
	SelectedRevisions,
	UnavailableClusters,
} from "@/src/types";
import { atomWithReset } from "jotai/utils";
import { splitGerritInfoChangesByProject } from "./utils/gerritHelpers";
import { gerritProjectJenkinsImageFieldNameMapping } from "./constants";

// GerritChangeInfoProjects storage
const changeInfoProjectsAtom = atomWithReset<GerritChangeInfoProjects>({});
export const changeInfosDisplayAtom = atom(
	(get) => get(changeInfoProjectsAtom),
	(_, set, changeInfos: GerritChangeInfo[]) => {
		const changeInfoProjects: GerritChangeInfoProjects =
			splitGerritInfoChangesByProject(changeInfos);
		set(changeInfoProjectsAtom, changeInfoProjects);
		set(selectedRevisionsAtom, {});
	}
);
export const clearChangeInfosAndSelectedRevisionsAtom = atom(null, (_, set) => {
	set(changeInfoProjectsAtom, {});
	set(selectedRevisionsAtom, {});
});

/**
 * User interactive data storage
 */
// For Jenkins form
export const selectedRevisionsAtom = atomWithReset<SelectedRevisions>({});
export const selectedSiteAtom = atom<string>("");
export const selectedClusterNameAtom = atom<string>("");
export const selectedClusterIdAtom = atom<string>("");
export const jenkinsBuildInfoAtom = atom<JenkinsBuildInfo>((get) => {
	const selectedRevisions = get(selectedRevisionsAtom);
	const imageTags: JenkinsImageTag[] = Object.keys(selectedRevisions).map(
		(projectName) => {
			const revision = selectedRevisions[projectName];
			const jenkinsFieldLabel =
				gerritProjectJenkinsImageFieldNameMapping[projectName] ?? "";
			return {
				fieldLabel: jenkinsFieldLabel,
				tag: revision,
			};
		}
	);

	const selectedSite = get(selectedSiteAtom);
	const selectedClusterName = get(selectedClusterNameAtom);
	const selectedClusterId = get(selectedClusterIdAtom);
	const cluster =
		selectedClusterName && selectedClusterId
			? selectedClusterName.concat(selectedClusterId)
			: "";

	return {
		imageTags,
		site: selectedSite,
		cluster,
	};
});

// For Cluster status
export const unavailableClustersAtom = atomWithReset<UnavailableClusters>(
	new Set("")
);

export const stagingsStatusLastRefreshTimeAtom = atom<Date | undefined>(
	undefined
);
/**
 * END
 */



