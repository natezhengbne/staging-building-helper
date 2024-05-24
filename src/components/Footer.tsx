import { BadgeCheck, Settings, Unplug } from "lucide-react";
import { derivedServicesConnectionAtom } from "../store";
import { useAtom } from "jotai";
import { ServiceType } from "../types";
import {
	getGerritAccessTokenFromCookie,
	querySelfAccount,
} from "../utils/gerritHelpers";
import { useInterval } from "ahooks";
import { permissionConfig } from "../permissions";
import {
	TooltipProvider,
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@radix-ui/react-tooltip";

export const Footer = () => {
	const [servicesConnection, updateConnection] = useAtom(
		derivedServicesConnectionAtom
	);

	useInterval(
		() => {
			if (
				!servicesConnection.gerrit ||
				servicesConnection.gerrit.refreshedAt.getTime() + 60000 <
					new Date().getTime()
			) {
				getGerritAccessTokenFromCookie()
					.then((accessToken) => {
						querySelfAccount(accessToken)
							.then((self) => {
								console.log("self", self);
								if (self) {
									updateConnection("gerrit");
								}
							})
							.catch(() => updateConnection("gerrit", false));
					})
					.catch(() => {
						updateConnection("gerrit", false);
					});
			}
		},
		60000,
		{
			immediate: true,
		}
	);

	const handleClick = (service: ServiceType) => {
		if (service === "gerrit") {
			window.open(permissionConfig.GERRIT_WEB.ORIGIN_HTTPS, "_blank");
		}
	};

	return (
		<div className="p-2 fixed inset-x-0 bottom-0">
			<div className="flex items-center justify-between">
				<div className="flex justify-start gap-4">
					<StatusIndicator
						label="Gerrit"
						isConnected={!!servicesConnection.gerrit?.available}
						onClick={() => handleClick("gerrit")}
					/>
					{/* <StatusIndicator
						label="Jenkins"
						isConnected={!!servicesConnection.jenkins?.available}
						onClick={() => handleClick("jenkins")}
					/> */}
				</div>
				<Settings className="mx-2 size-4 text-indigo-500 cursor-pointer hover:animate-spin" />
			</div>
		</div>
	);
};

type StatusIndicatorProps = {
	label: string;
	isConnected: boolean;
	onClick: () => void;
};

const StatusIndicator = ({
	label,
	isConnected,
	onClick,
}: StatusIndicatorProps) => {
	return (
		<TooltipProvider>
			<Tooltip disableHoverableContent={isConnected}>
				<TooltipTrigger>
					<div
						className="flex items-center gap-1 cursor-pointer"
						onClick={onClick}
					>
						<StatusIcon isConnected={isConnected} />
						<p className={isConnected ? "text-green-400" : "text-orange-300"}>
							{label}
						</p>
					</div>
				</TooltipTrigger>
				<TooltipContent sideOffset={4}>
					<p className="bg-indigo-500 text-white px-1 rounded">Open {label}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
};

const StatusIcon = ({ isConnected }: { isConnected: boolean }) => {
	return isConnected ? (
		<BadgeCheck className="size-4 text-green-400" />
	) : (
		<Unplug className="size-4 text-orange-300" />
	);
};
