import { atom } from "jotai";
import { GerritChangeInfo } from "./types";

export const changeInfoListAtom = atom<GerritChangeInfo[]>([]);

export const filteredChangeInfoListAtom = atom<GerritChangeInfo[]>((get) => {
	const originAtom = get(changeInfoListAtom);
	const sortByProject = originAtom.sort((a, b) => {
		if (a.project < b.project) {
			return -1;
		}
		if (a.project > b.project) {
			return 1;
		}
		return 0;
	});
    const selectedProjects: string[] = [];
    sortByProject.forEach(changeInfo => {
        if(!selectedProjects.includes(changeInfo.project)){
            changeInfo.isSelected = true;
            selectedProjects.push(changeInfo.project);
        }
    })

	return sortByProject;
});
