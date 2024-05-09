import { useAtomValue } from "jotai";
import { filteredChangeInfoListAtom } from "../store";

export const ChangeInfoListCard = () => {
	const filteredChangeInfoList = useAtomValue(filteredChangeInfoListAtom);

	if (!filteredChangeInfoList || filteredChangeInfoList.length <= 0) {
		return null;
	}

	return (
		<div>
			<ul>
				{filteredChangeInfoList.map((changeInfo) => {
					const shortRevision = changeInfo.current_revision.substring(0, 6);
					return (
						<li key={changeInfo.current_revision} className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
							<div className="flex items-center">
								<input
									id={`checkbox-${changeInfo.current_revision}`}
									type="checkbox"
									value={""}
                                    onChange={e=>console.log(e.target.value)}
								/>
								<label>{shortRevision}</label>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};
