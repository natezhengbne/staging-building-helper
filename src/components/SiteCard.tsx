import { useAtom } from "jotai";
import { Badge } from "./ui/badge";
import { selectedSiteAtom } from "../store";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

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

	return (
		<div className="flex gap-1 flex-wrap">
			{sites.map((site) => {
				const handleClick = (e: React.MouseEvent<Element, MouseEvent>) => {
					setSelected(selected === site ? "" : site);
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
	"lotteryest",
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
