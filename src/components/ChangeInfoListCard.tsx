import { useAtom, useAtomValue } from "jotai";
import {
	changeInfoProjectsAtom,
	jenkinsBuildInfoAtom,
	selectedRevisionsAtom,
} from "@/src/store";
import { Checkbox } from "@/src/components/ui/checkbox";
import { GerritChangeInfo, JenkinsBuildInfo } from "../types";
import { Button } from "./ui/button";
export const ChangeInfoListCard = () => {
	const projects = useAtomValue(changeInfoProjectsAtom);
	const jenkinsBuildInfo = useAtomValue(jenkinsBuildInfoAtom);

	if (!projects || Object.keys(projects).length <= 0) {
		return null;
	}

	const handleBuild = () => {
		fillJenkinsBuildForm(jenkinsBuildInfo);
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
			<div className="mt-2">
				<Button onClick={handleBuild}>Build</Button>
			</div>
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
		<li className="rounded-md border p-2 shadow flex justify-between items-center">
			<div>
				{changeInfos.map((changeInfo) => {
					return (
						<ChangeInfoItem
							key={changeInfo.current_revision}
							changeInfo={changeInfo}
						/>
					);
				})}
			</div>
			<div>
				<p>{projectName}</p>
			</div>
		</li>
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
			<div className="grid gap-1.5 leading-none">
				<label
					htmlFor={checkboxId}
					className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
				>
					{changeInfo.subject}
				</label>
				<div className="w-14">
					<p className="text-sm text-muted-foreground text-ellipsis overflow-hidden">
						{changeInfo.current_revision}
					</p>
				</div>
			</div>
		</div>
	);
};

const fillJenkinsBuildForm = async (jenkinsBuildInfo: JenkinsBuildInfo) => {
	const jenkinsTabs = await chrome.tabs.query({
		active: true,
		url: "https://build.dev.benon.com/view/Cluster/job/cluster.pipeline/*",
	});

	if (!jenkinsTabs || jenkinsTabs.length <= 0) {
		return Promise.reject();
	}

	const jenkinsTab = jenkinsTabs[0];

	if (!jenkinsTab || !jenkinsTab.id) {
		return Promise.reject();
	}

	await chrome.scripting.executeScript({
		target: { tabId: jenkinsTab.id },
		func: runImagesTagsScript,
		args: [jenkinsBuildInfo],
	});
};

const runImagesTagsScript = (jenkinsBuildInfo: JenkinsBuildInfo) => {
	jenkinsBuildInfo.imageTags.forEach((imageTag) => {
		const nodes = document.querySelectorAll(
			`input[value="${imageTag.fieldLabel}"]`
		);
		if (nodes && nodes.length > 0) {
			const field = nodes[0];
			const inputField = field.nextElementSibling as HTMLInputElement;
			if (inputField) {
				inputField.value = imageTag.tag;
				// @ts-expect-error: it is possible to set an inline style by assigning a string directly to the style property
				inputField.style = "color: white; background-color: blue";
			}
		}
	});
};
