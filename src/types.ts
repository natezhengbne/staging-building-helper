// https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#change-info
export type GerritChangeInfo = {
	subject?: string;
	branch?: string;
	project: string;
	status?: string;
	current_revision: string;
	topic?: string;
	revisions?: {
		[revision: string]: {
			created: string; // 2024-02-25 23:37:32.000000000
		};
	};
	submit_records?: [
		{
			rule_name: string;
			status: string;
			labels: [
				{
					label: string;
					status: string;
				},
			];
		},
	];
};

export type GerritChangeInfoProjects = {
	[project: string]: GerritChangeInfo[];
};

export type GerritAccount = {
	username: string;
};

export type SelectedRevisions = {
	[project: string]: string;
};

export type JenkinsImageTag = {
	fieldLabel: string;
	tag: string;
};

export type JenkinsTimeout = {
	hours: string;
	reason: string;
};

export type JenkinsBuildInfo = {
	site?: string;
	cluster?: string;
	imageTags: JenkinsImageTag[];
	timeout?: JenkinsTimeout;
};

// ["Staging1", "rocket1"]
export type UnavailableClusters = Set<string>;

export type ServiceStatusSiteAuthentication = {
	token: string;
	expire: string;
};

export type StagingsClusterStatus = {
	name: string; // Staging1
	builds?: [
		{
			name: string; //rocket1
			pbj: string;
			expires: string; // 2024-05-04T04:01:27+10:00
		},
	];
};

export type ServiceType = "jenkins" | "gerrit" | "staging";
export type ServiceConnection = {
	[service in ServiceType]?: {
		refreshedAt: Date;
		available: boolean;
	};
};
