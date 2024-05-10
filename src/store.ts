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
			return {
				project: projectName,
				tag: revision,
			};
		}
	);

	return {
		imageTags,
	};
});
