import { useAtom } from "jotai";
import { Badge } from "./ui/badge";
import { selectedSiteAtom } from "../store";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { useEffect } from "react";

export const SiteCard = () => {
	return (
		<Accordion type="single" collapsible className="w-full">
			<AccordionItem value="item-1">
				<AccordionTrigger>
					<SitesContainer sites={primarySiteTypes} />
				</AccordionTrigger>
				<AccordionContent>
					<SitesContainer sites={secondarySiteTypes} />
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
};

type SitesContainerProps = {
	sites: string[];
};

const SitesContainer = ({ sites }: SitesContainerProps) => {
	const [selected, setSelected] = useAtom(selectedSiteAtom);

	useEffect(() => {
		if (selected) {
			return;
		}
		chrome.storage.local.get(["defaultSite"]).then((result) => {
			const storedSite = result["defaultSite"];
			if (storedSite) {
				setSelected(storedSite);
			}
		});
	}, [setSelected, selected]);

	return (
		<div className="flex gap-1 flex-wrap cursor-pointer">
			{sites.map((site) => {
				const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
					const updated = selected === site ? "" : site;
					setSelected(updated);

					if (updated) {
						chrome.storage.local.set({ defaultSite: site });
					}

					e.preventDefault();
				};
				return (
					<Badge
						key={site}
						variant={selected === site ? "default" : "outline"}
						onClick={handleClick}
					>
						{site}
					</Badge>
				);
			})}
		</div>
	);
};

const primarySiteTypes = [
	"integration",
	"ozl",
	"jumbowin",
	"mater",
	"lotterywest",
	"endeavour",
	"playjumbo",
];

const secondarySiteTypes = [
	"deaf",
	"demo",
	"deploytest",
	"lifeflight",
	"makesmile",
	"pbjtest",
	"stjohn",
	"sunshine",
	"yourhospice",
	"yourjetlife",
];
