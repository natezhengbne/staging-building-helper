import { PrimitiveAtom, useAtom, useAtomValue } from "jotai";
import { changeInfoAtomsAtom, jenkinsBuildInfoAtom } from "@/src/store";
import { Checkbox } from "@/src/components/ui/checkbox";
import { GerritChangeInfo, JenkinsBuildInfo } from "../types";
import { Button } from "./ui/button";

export const ChangeInfoListCard = () => {
	const [itemAtoms] = useAtom(changeInfoAtomsAtom);
	const jenkinsBuildInfo = useAtomValue(jenkinsBuildInfoAtom);

	if (!itemAtoms || itemAtoms.length <= 0) {
		return null;
	}

	const handleBuild = () => {
		fillJenkinsBuildForm(jenkinsBuildInfo);
	};

	return (
		<div className="mt-4">
			<ul className="flex flex-col gap-2">
				{itemAtoms.map((item) => {
					return <ChangeInfoItem itemAtom={item} key={item.toString()} />;
				})}
			</ul>
			<div className="mt-2">
				<Button onClick={handleBuild}>Build</Button>
			</div>
		</div>
	);
};

const ChangeInfoItem = ({
	itemAtom,
}: {
	itemAtom: PrimitiveAtom<GerritChangeInfo>;
}) => {
	const [item, setItem] = useAtom(itemAtom);

	const checkboxId = `checkbox-${item.current_revision}`;

	return (
		<li className="rounded-md border p-2 shadow flex justify-between items-center">
			<div className="items-top flex space-x-2">
				<Checkbox
					id={checkboxId}
					checked={item.isSelected}
					onClick={() =>
						setItem((prev) => ({ ...prev, isSelected: !prev.isSelected }))
					}
				/>
				<div className="grid gap-1.5 leading-none">
					<label
						htmlFor={checkboxId}
						className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
					>
						{item.subject}
					</label>
					<div className="w-14">
						<p className="text-sm text-muted-foreground text-ellipsis overflow-hidden">
							{item.current_revision}
						</p>
					</div>
				</div>
			</div>
			<div>
				<p>{item.project}</p>
			</div>
		</li>
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
