import { GerritChangeInfoProjects, JenkinsBuildInfo } from "@/src/types";

export const gerritChangeInfoProjectsData: GerritChangeInfoProjects = {
	web: [
		{
			current_revision: "1111111111",
			project: "webui",
			subject: "USER-1976 Duplicate location is displayed in address card",
            branch: "master",
            status: "Merged"
		},
		{
			current_revision: "22222222",
			project: "webui",
			subject: "USER-1972 JumboWin incorrectly highlighting optional field",
            branch: "master"
		},
	],
	jl: [
		{
			current_revision: "333333333",
			project: "jl",
			subject: "USER-1950 Gold Plating the Ideal Postcodes Experience",
            branch: "master"
		},
	],
};

export const jenkinsBuildInfoData: JenkinsBuildInfo = {
	imageTags: [
		{
			fieldLabel: "ADMIN_UI_IMAGE_TAG",
			tag: "1111",
		},
	],
};
