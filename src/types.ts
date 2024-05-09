// https://gerrit-review.googlesource.com/Documentation/rest-api-changes.html#change-info
export type GerritChangeInfo = {
	subject?: string;
	branch?: string;
	project: string;
	status?: string;
	current_revision: string;
	isSelected?: boolean;
};

export type JenkinsImageTag = {
	project: string;
	tag: string;
};

export type JenkinsBuildInfo = {
	imageTags: JenkinsImageTag[];
};
