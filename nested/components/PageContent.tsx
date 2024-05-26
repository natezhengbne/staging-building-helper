import Container from "@mui/material/Container";
import { useSideMenuStore } from "nested/store";

export const PageContent = () => {
	const { activeItem } = useSideMenuStore();

	return <Container sx={{ height: "100%" }}>{activeItem}</Container>;
};
