import { useAtom } from "jotai";
import { Collapsible, CollapsibleContent } from "./ui/collapsible";
import { CollapsibleTrigger } from "./ui/collapsible";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { clusterMoreParametersSwitchAtom, clusterTimeoutAtom } from "../store";
import { Input } from "./ui/input";

export const MoreParameters = () => {
	const [isOpen, setIsOpen] = useAtom(clusterMoreParametersSwitchAtom);
	const [timeout, setTimeout] = useAtom(clusterTimeoutAtom);

	return (
		<Collapsible open={isOpen} onOpenChange={setIsOpen}>
			<CollapsibleTrigger asChild>
				<div className="flex items-center justify-end gap-2">
					<Label className="text-xs" htmlFor="more-parameters">
						More parameters
					</Label>
					<Switch id="more-parameters" checked={isOpen} />
				</div>
			</CollapsibleTrigger>
			<CollapsibleContent className="my-2">
				<Input
					defaultValue={
						timeout ? `${timeout?.hours}:${timeout?.reason}` : undefined
					}
					placeholder="Timeout 8:xxx = 8 hours with reason"
					onBlur={(event) => {
						const value = event.target.value;
						if (!value) {
							return;
						}
						const hours = value.substring(0, value.indexOf(":"));
						const reason = value.substring(value.indexOf(":") + 1);
						if (!hours || Number.isNaN(hours)) {
							return;
						}
						setTimeout({
							hours,
							reason,
						});
					}}
				/>
			</CollapsibleContent>
		</Collapsible>
	);
};
