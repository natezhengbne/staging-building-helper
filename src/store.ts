import { atom } from "jotai";
import {
	GerritChangeInfoProjects,
	JenkinsBuildInfo,
	JenkinsImageTag,
	SelectedRevisions,
	UnavailableClusters,
} from "@/src/types";
import { atomWithReset } from "jotai/utils";

export const changeInfoProjectsAtom = atomWithReset<GerritChangeInfoProjects>(
	{}
);

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

const gerritProjectJenkinsImageFieldNameMapping: { [project: string]: string } =
	{
		"admin-ui": "ADMIN_UI_IMAGE_TAG",
		"bulk-import": "BULK_IMPORT_IMAGE_TAG",
		"client-cms-2": "CLIENT_CMS_IMAGE_TAG",
		"consul-config": "CONSUL_CONFIG_IMAGE_TAG",
		"connectid-rp-connector": "CONNECTID_RP_CONNECTOR_IMAGE_TAG",
		"config-api": "CONFIG_API_IMAGE_TAG",
		"customer-verify": "CUSTOMER_VERIFY_IMAGE_TAG",
		emailcms: "EMAILCMS_IMAGE_TAG",
		emailrelay: "EMAILREPAY_IMAGE_TAG",
		hermes: "HERMES_IMAGE_TAG",
		jl: "JL_CMD_IMAGE_TAG",
		"jl-db-update": "JL_DB_UPDATE_IMAGE_TAG",
		"msg-filestore": "MSG_FILESTORE_IMAGE_TAG",
		ruth: "RUTH_IMAGE_TAG",
		web: "WEBUI_IMAGE_TAG",
	};

// ["Staging1", "rocket1"]
export const unavailableClustersAtom = atomWithReset<UnavailableClusters>(new Set(""));

export const stagingsStatusLastRefreshTimeAtom = atom<Date | undefined>(undefined);
