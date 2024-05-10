// https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#change-info
export type GerritChangeInfo = {
	subject?: string;
	branch?: string;
	project: string;
	status?: string;
	current_revision: string;
};

export type GerritChangeInfoProjects = {
	[project: string]: GerritChangeInfo[];
};

export type SelectedRevisions = {
	[project: string]: string;
}

export type JenkinsImageTag = {
	fieldLabel: string;
	tag: string;
};

export type JenkinsBuildInfo = {
	site?: string;
	cluster?: string;
	imageTags: JenkinsImageTag[];
};
