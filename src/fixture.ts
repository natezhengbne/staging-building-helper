import { GerritChangeInfo, GerritChangeInfoProjects, JenkinsBuildInfo } from "@/src/types";

export const gerritChangeInfos: GerritChangeInfo[] = [
	{
		current_revision: "1111111111",
		project: "webui",
		subject: "USER-1976 Duplicate location is displayed in address card",
		branch: "master",
		status: "Merged",
		revisions: {
			"1111111111": {
				created: "2024-01-25 23:37:32.000000000",
			},
		},
	},
	{
		current_revision: "22222222",
		project: "webui",
		subject: "USER-1972 JumboWin incorrectly highlighting optional field",
		branch: "master",
		revisions: {
			"22222222": { created: "2024-03-25 23:37:32.000000000" },
		},
		submit_records: [
			{
				rule_name: "gerrit~DefaultSubmitRule",
				status: "NOT_READY",
				labels: [
					{
						label: "CI-Verified",
						status: "OK",
					},
				],
			},
		],
	},
	{
		current_revision: "333333333",
		project: "jl",
		subject: "USER-1950 Gold Plating the Ideal Postcodes Experience",
		branch: "master",
		revisions: {
			"333333333": { created: "2024-04-25 23:37:32.000000000" },
		},
		submit_records: [
			{
				rule_name: "gerrit~DefaultSubmitRule",
				status: "NOT_READY",
				labels: [
					{
						label: "CI-Verified",
						status: "REJECT",
					},
				],
			},
		],
	},
]

export const gerritChangeInfoProjectsData: GerritChangeInfoProjects = {
	web: [
		{
			current_revision: "1111111111",
			project: "webui",
			subject: "USER-1976 Duplicate location is displayed in address card",
			branch: "master",
			status: "Merged",
			revisions: {
				"1111111111": {
					created: "2024-01-25 23:37:32.000000000",
				},
			},
		},
		{
			current_revision: "22222222",
			project: "webui",
			subject: "USER-1972 JumboWin incorrectly highlighting optional field",
			branch: "master",
			revisions: {
				"22222222": { created: "2024-03-25 23:37:32.000000000" },
			},
			submit_records: [
				{
					rule_name: "gerrit~DefaultSubmitRule",
					status: "NOT_READY",
					labels: [
						{
							label: "CI-Verified",
							status: "OK",
						},
					],
				},
			],
		},
	],
	jl: [
		{
			current_revision: "333333333",
			project: "jl",
			subject: "USER-1950 Gold Plating the Ideal Postcodes Experience",
			branch: "master",
			revisions: {
				"333333333": { created: "2024-04-25 23:37:32.000000000" },
			},
			submit_records: [
				{
					rule_name: "gerrit~DefaultSubmitRule",
					status: "NOT_READY",
					labels: [
						{
							label: "CI-Verified",
							status: "REJECT",
						},
					],
				},
			],
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
