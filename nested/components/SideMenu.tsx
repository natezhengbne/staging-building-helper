import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import GraphicEqIcon from "@mui/icons-material/GraphicEq";
import { useSideMenuStore } from "nested/store";

type SideMenuItem = "projectMapping";

export const SideMenu = () => {
	const { activeItem, setActive } = useSideMenuStore();

	const handleClick = (item: SideMenuItem) => {
		setActive(item);
	};

	return (
		<Paper sx={{ width: 320, maxWidth: "100%" }}>
			<MenuList>
				<MenuItem
					onClick={() => handleClick("projectMapping")}
					selected={activeItem === "projectMapping"}
				>
					<ListItemIcon>
						<GraphicEqIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText>Project mapping</ListItemText>
				</MenuItem>
			</MenuList>
		</Paper>
	);
};
