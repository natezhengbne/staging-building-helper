export type SideMenuItem = "projectMapping";

export type SideMenuStore = {
	activeItem: SideMenuItem;
	setActive: (item: SideMenuItem) => void;
};
