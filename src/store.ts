import { atom } from "jotai";
import {
	GerritChangeInfoProjects,
	JenkinsBuildInfo,
	JenkinsImageTag,
	SelectedRevisions,
} from "@/src/types";

export const changeInfoProjectsAtom = atom<GerritChangeInfoProjects>({});

export const selectedRevisionsAtom = atom<SelectedRevisions>({});

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

	return {
		imageTags,
	};
});

const gerritProjectJenkinsImageFieldNameMapping: { [project: string]: string } =
	{
		"admin-ui": "ADMIN_UI_IMAGE_TAG",
		jl: "JL_CMD_IMAGE_TAG",
		web: "WEBUI_IMAGE_TAG",
		"consul-config": "CONSUL_CONFIG_IMAGE_TAG",
		"config-api": "CONFIG_API_IMAGE_TAG",
	};
