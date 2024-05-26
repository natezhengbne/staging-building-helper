import { create } from "zustand";
import { SideMenuStore } from "./types";

export const useSideMenuStore = create<SideMenuStore>((set) => ({
	activeItem: "projectMapping",
	setActive: (item) => set({ activeItem: item }),
}));
