import { useAtom, useAtomValue } from "jotai";
import {
	changeInfoProjectsAtom,
	jenkinsBuildInfoAtom,
	selectedRevisionsAtom,
} from "@/src/store";
import { Checkbox } from "@/src/components/ui/checkbox";
import { GerritChangeInfo, JenkinsBuildInfo } from "@/src/types";
import { Button } from "@/src/components/ui/button";
import { Badge } from "./ui/badge";
import { SiteCard } from "./SiteCard";
import { Separator } from "@/src/components/ui/separator";
import { ClusterNameCard } from "./ClusterNameCard";
import { getCurrentJenkinsPageTab } from "../chromeHelpers";
import { useState } from "react";
import { useResetAtom } from "jotai/utils";

export const JenkinsBuildCard = () => {
	const projects = useAtomValue(changeInfoProjectsAtom);
	const resetProjects = useResetAtom(changeInfoProjectsAtom);

	const jenkinsBuildInfo = useAtomValue(jenkinsBuildInfoAtom);
	const [error, setError] = useState("");

	if (!projects || Object.keys(projects).length <= 0) {
		return null;
	}

	const handlePrefill = async () => {
		setError("");
		const [jenkinsTab] = await getCurrentJenkinsPageTab();
		if (!jenkinsTab || !jenkinsTab.id) {
			setError("should use it in Pipeline build page");
			return;
		}

		const [logoutComponent] = await chrome.scripting.executeScript({
			target: { tabId: jenkinsTab.id },
			func: () => {
				return document.querySelector("a[href='/logout']")?.textContent;
			},
		});
		if (logoutComponent.result !== "log out") {
			setError("It only works after you log in to Jenkins");
			return;
		}

		await chrome.scripting.executeScript({
			target: { tabId: jenkinsTab.id },
			func: runPopulateFieldsScripts,
			args: [jenkinsBuildInfo],
		});
	};

	const handleClearAll = () => {
		resetProjects();
	};

	return (
		<div className="mt-4">
			<ul className="flex flex-col gap-2">
				{Object.keys(projects).map((project) => {
					const projectChangeInfos = projects[project];

					return (
						<ProjectChangeInfoItems
							projectName={project}
							key={project}
							changeInfos={projectChangeInfos}
						/>
					);
				})}
			</ul>
			<Separator className="my-3" />
			<SiteCard />
			<Separator className="my-3" />
			<ClusterNameCard />
			<div className="mt-6 flex justify-end gap-4">
				<Button size="sm" className="bg-indigo-500" onClick={handlePrefill}>
					Prefill
				</Button>
				<Button size="sm" variant="destructive" onClick={handleClearAll}>
					Clear All
				</Button>
			</div>
			{error && (
				<div className="p-2 text-red-600 text-sm">
					<p>{error}</p>
				</div>
			)}
		</div>
	);
};

type ProjectChangeInfoItemsProps = {
	projectName: string;
	changeInfos: GerritChangeInfo[];
};

const ProjectChangeInfoItems = (props: ProjectChangeInfoItemsProps) => {
	const { changeInfos, projectName } = props;

	return (
		<div>
			<Badge className="rounded-none" variant="secondary">
				{projectName}
			</Badge>
			<li className="rounded-none border p-2 shadow flex flex-col gap-y-1">
				{changeInfos.map((changeInfo) => {
					return (
						<ChangeInfoItem
							key={changeInfo.current_revision}
							changeInfo={changeInfo}
						/>
					);
				})}
			</li>
		</div>
	);
};

type ChangeInfoItemProps = {
	changeInfo: GerritChangeInfo;
};

const ChangeInfoItem = (props: ChangeInfoItemProps) => {
	const { changeInfo } = props;
	const [selected, setSelected] = useAtom(selectedRevisionsAtom);
	const isSelected =
		selected[changeInfo.project] === changeInfo.current_revision;

	const checkboxId = `checkbox-${changeInfo.current_revision}`;

	const handleClick = (checked: boolean) => {
		console.log(changeInfo.subject, checked);
		setSelected((prev) => {
			return {
				...prev,
				[changeInfo.project]: checked ? changeInfo.current_revision : "",
			};
		});
	};

	return (
		<div className="items-top flex space-x-2">
			<Checkbox
				id={checkboxId}
				checked={isSelected}
				onCheckedChange={handleClick}
			/>
			<div className="grid">
				<label
					htmlFor={checkboxId}
					className="text-xs font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
				>
					{changeInfo.subject}
				</label>
				<div className="w-1/2 self-center">
					<p className="text-xs text-muted-foreground text-ellipsis overflow-hidden">
						{changeInfo.current_revision}
					</p>
				</div>
			</div>
		</div>
	);
};

const runPopulateFieldsScripts = (jenkinsBuildInfo: JenkinsBuildInfo) => {
	jenkinsBuildInfo.imageTags.forEach((imageTag) => {
		populateInputField(imageTag.fieldLabel, imageTag.tag);
	});

	if (jenkinsBuildInfo.site) {
		populateInputField("POWERED_BY_JUMBO", jenkinsBuildInfo.site);
	}

	if (jenkinsBuildInfo.cluster) {
		populateInputField("CLUSTER_NAME", jenkinsBuildInfo.cluster);
	}
};

const populateInputField = (label: string, value: string) => {
	const [node] = document.querySelectorAll(`input[value="${label}"]`);
	if (node) {
		const inputField = node.nextElementSibling as HTMLInputElement;
		if (inputField) {
			inputField.value = value;
			// @ts-expect-error: it is possible to set an inline style by assigning a string directly to the style property
			inputField.style = "color: white; background-color: blue";
		}
	}
};
