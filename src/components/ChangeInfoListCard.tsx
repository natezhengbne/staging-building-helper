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

const fillJenkinsBuildForm = (jenkinsBuildInfo: JenkinsBuildInfo) => {
	console.log("handleClick", jenkinsBuildInfo);

	chrome.tabs
		.query({
			active: true,
			url: "https://build.dev.benon.com/view/Cluster/job/cluster.pipeline/*",
		})
		.then((tabs) => {
			console.log(tabs);
		});
};

/**
  var nodes = document.querySelectorAll('input[value="ADMIN_UI_IMAGE_TAG"]');
  var field = nodes[0];
  field.nextElementSibling.value="123";

// chrome.scripting.executeScript({
		// 	target: { tabId: 437564020 },
		// 	func: () =>
		// 		console.log(
		// 			"changes",
		// 			console.log(document.getElementsByName("BUILD_DESCRIPTION"))
		// 		),
		// });


 */
