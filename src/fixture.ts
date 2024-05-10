import { GerritChangeInfoProjects, JenkinsBuildInfo } from "@/src/types";

export const gerritChangeInfoProjectsData: GerritChangeInfoProjects = {
	web: [
		{
			current_revision: "1111111111",
			project: "webui",
			subject: "USER-111 XXX",
		},
		{
			current_revision: "22222222",
			project: "webui",
			subject: "USER-222 YYY",
		},
	],
	jl: [
		{
			current_revision: "333333333",
			project: "jl",
			subject: "USER-3333 XXX",
			isSelected: true,
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
