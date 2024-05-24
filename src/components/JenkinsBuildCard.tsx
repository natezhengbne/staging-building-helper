import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
	changeInfosDisplayAtom,
	clearChangeInfosAndSelectedRevisionsAtom,
	derivedServicesConnectionAtom,
	jenkinsBuildInfoAtom,
	selectedRevisionsAtom,
} from "@/src/store";
import { Checkbox } from "@/src/components/ui/checkbox";
import { GerritChangeInfo, JenkinsBuildInfo } from "@/src/types";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { SiteCard } from "@/src/components/SiteCard";
import { Separator } from "@/src/components/ui/separator";
import { ClusterStatusCard } from "./ClustersStatusCard";
import { getCurrentJenkinsPageTab } from "@/src/utils/chromeHelpers";
import { useState } from "react";
import dayjs from "dayjs";
import { permissionConfig } from "@/src/permissions";
import { ComponentEvent } from "../constants";

export const JenkinsBuildCard = () => {
	const projects = useAtomValue(changeInfosDisplayAtom);
	const clearChangeInfosAndSelectedRevisions = useSetAtom(
		clearChangeInfosAndSelectedRevisionsAtom
	);
	const updateConnection = useSetAtom(derivedServicesConnectionAtom);

	const jenkinsBuildInfo = useAtomValue(jenkinsBuildInfoAtom);
	const [error, setError] = useState<string | React.ReactNode>("");

	const handlePrefill = async () => {
		setError("");
		const [jenkinsTab] = await getCurrentJenkinsPageTab();
		if (!jenkinsTab || !jenkinsTab.id) {
			setError(
				<span>
					{"Run it on the "}
					<a
						className="underline font-semibold font-sans"
						target="_blank"
						href={permissionConfig.JENKINS.CLUSTER_PIPELINE_SITE}
					>
						Jenkins pipeline build page
					</a>
				</span>
			);
			return;
		}
		updateConnection("jenkins");
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
		setError("");
		clearChangeInfosAndSelectedRevisions();
		window.dispatchEvent(new Event(ComponentEvent.ClearAll));
	};

	if (!projects || Object.keys(projects).length <= 0) {
		return null;
	}

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
			<ClusterStatusCard />
			<div className="mt-4 flex justify-end gap-4">
				<Button size="sm" className="bg-indigo-500" onClick={handlePrefill}>
					Prefill
				</Button>
				<Button size="sm" variant="destructive" onClick={handleClearAll}>
					Clear All
				</Button>
			</div>
			{error && (
				<div className="p-1 text-red-600 text-xs text-end">{error}</div>
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
			<Badge className="rounded-none px-2" variant="secondary">
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
		setSelected((prev) => {
			return {
				...prev,
				[changeInfo.project]: checked ? changeInfo.current_revision : "",
			};
		});
	};

	const created =
		changeInfo.revisions &&
		changeInfo.revisions[changeInfo.current_revision]?.created;
	const createdTime =
		created &&
		dayjs(created).add(dayjs().utcOffset(), "m").format("DDMMM HH:mm");

	const isCiPassed = isCommitCiVerified(changeInfo);

	return (
		<div className="items-top flex space-x-2">
			<Checkbox
				id={checkboxId}
				checked={isSelected}
				onCheckedChange={handleClick}
			/>
			<div className="grow grid">
				<label
					htmlFor={checkboxId}
					className="text-xs font-medium cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
				>
					{changeInfo.subject}
				</label>
				<div className="flex justify-between">
					<div className="w-20 self-center">
						<p className="text-xs text-muted-foreground text-ellipsis overflow-hidden font-mono hover:font-serif">
							{changeInfo.current_revision}
						</p>
					</div>
					<div className="flex gap-1 items-center">
						{isCiPassed && (
							<p className="text-xs text-green-500 font-medium">CI</p>
						)}
						<Separator orientation="vertical" />
						<span className="text-xs text-muted-foreground font-mono">
							{createdTime}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
};

const runPopulateFieldsScripts = (jenkinsBuildInfo: JenkinsBuildInfo) => {
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

const isCommitCiVerified = (changeInfo: GerritChangeInfo) => {
	return !!changeInfo.submit_records?.find((submitRecord) => {
		if (submitRecord.rule_name === "gerrit~DefaultSubmitRule") {
			const ciVerifiedRecord = submitRecord.labels.find((recordLabel) => {
				return (
					recordLabel.label === "CI-Verified" && recordLabel.status === "OK"
				);
			});
			return !!ciVerifiedRecord;
		}
		return false;
	});
};
