import { atom } from "jotai";
import { GerritChangeInfo, JenkinsBuildInfo, JenkinsImageTag } from "./types";
import { splitAtom } from "jotai/utils";

export const changeInfoListAtom = atom<GerritChangeInfo[]>([]);

export const changeInfoAtomsAtom = splitAtom(changeInfoListAtom);

export const jenkinsBuildInfoAtom = atom<JenkinsBuildInfo>((get) => {
	const changeInfoList = get(changeInfoListAtom);
	const imageTags: JenkinsImageTag[] = changeInfoList
		.filter((changeInfo) => changeInfo.isSelected)
		.map((selected) => {
			return {
				project: selected.project,
				tag: selected.current_revision,
			};
		});

	return {
		imageTags,
	};
});
