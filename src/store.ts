import { atom } from "jotai";
import {
	GerritChangeInfo,
	GerritChangeInfoProjects,
	JenkinsBuildInfo,
	JenkinsImageTag,
	SelectedRevisions,
	ServiceConnection,
	ServiceType,
	UnavailableClusters,
} from "@/src/types";
import { atomWithReset } from "jotai/utils";
import { splitGerritInfoChangesByProject } from "./utils/gerritHelpers";
import { gerritProjectJenkinsImageFieldNameMapping } from "./constants";

// GerritChangeInfoProjects storage
const changeInfoProjectsAtom = atomWithReset<GerritChangeInfoProjects>({});
export const changeInfoRefreshedAtAtom = atom<Date | null>(null);
export const changeInfosDisplayAtom = atom(
	(get) => get(changeInfoProjectsAtom),
	(_, set, changeInfos: GerritChangeInfo[]) => {
		const changeInfoProjects: GerritChangeInfoProjects =
			splitGerritInfoChangesByProject(changeInfos);
		set(changeInfoProjectsAtom, changeInfoProjects);
		set(selectedRevisionsAtom, {});
		set(changeInfoRefreshedAtAtom, new Date());
	}
);
export const clearChangeInfosAndSelectedRevisionsAtom = atom(null, (_, set) => {
	set(changeInfoProjectsAtom, {});
	set(selectedRevisionsAtom, {});
	set(changeInfoRefreshedAtAtom, null);
});

/**
 * User interactive data storage - START
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
 * User interactive data storage - END
 */

const servicesConnectionAtom = atom<ServiceConnection>({});
export const derivedServicesConnectionAtom = atom(
	(get) => get(servicesConnectionAtom),
	(get, set, service: ServiceType, available?: boolean) => {
		set(servicesConnectionAtom, {
			...get(servicesConnectionAtom),
			[service]: {
				refreshedAt: new Date(),
				available,
			},
		});
	}
);
