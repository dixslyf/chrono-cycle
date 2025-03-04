"use client";
import {
    ArrowBigLeft,
    ArrowBigRight,
    Calendar,
    ChartNoAxesGantt,
    ClipboardList,
} from "lucide-react";
import {
    MenuRoot,
    MenuContent,
    MenuItem,
    MenuTrigger,
    Text,
    SelectRoot,
    SelectLabel,
    SelectTrigger,
    SelectContent,
    SelectItem,
    createListCollection,
    SelectValueText,
} from "@chakra-ui/react";

const months = createListCollection({
    items: [
        { label: "January", value: "january" },
        { label: "February", value: "february" },
        { label: "March", value: "march" },
        { label: "April", value: "april" },
        { label: "May", value: "may" },
        { label: "June", value: "june" },
        { label: "July", value: "july" },
        { label: "August", value: "august" },
        { label: "September", value: "september" },
        { label: "October", value: "october" },
        { label: "November", value: "november" },
        { label: "December", value: "december" },
    ],
});

function DashNav() {
    return (
        <>
            <nav className="flex h-12 border-b-2 border-gray-300">
                {/* year arrows */}
                <div className="ml-4 flex items-center gap-2 w-1/3">
                    {/* button wrapper */}
                    <div className="flex items-center">
                        {/* change month arrow */}
                        <button>
                            <ArrowBigLeft />
                        </button>
                        <button>
                            <ArrowBigRight />
                        </button>
                    </div>
                    {/* choose month input */}
                    {/* for now will be january */}
                    <SelectRoot
                        variant="subtle"
                        collection={months}
                        className="relative"
                        positioning={{ placement: "bottom-end" }}
                    >
                        <SelectTrigger>
                            <SelectValueText
                                placeholder="January"
                                className="hover:bg-[#00000030]"
                            />
                        </SelectTrigger>
                        <SelectContent className="absolute top-full bg-palette3">
                            {months.items.map((month) => (
                                <SelectItem item={month} key={month.value}>
                                    {month.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </SelectRoot>
                </div>

                {/* calendar / timeline button */}
                <div className="flex gap-2 w-1/3 justify-center">
                    <button className="flex items-center">
                        <Calendar />
                        Calendar
                    </button>
                    <button className="flex items-center">
                        <ChartNoAxesGantt />
                        Timeline
                    </button>
                </div>

                {/* Choose template button */}
                <div className="mr-4 w-1/3 flex justify-end relative">
                    <MenuRoot>
                        <MenuTrigger asChild>
                            <button className="focus:outline-none">
                                Create
                            </button>
                        </MenuTrigger>
                        <MenuContent className="absolute top-full bg-palette3 p-0 rounded-lg">
                            <Text className="bg-palette2 p-2 font-semibold flex justify-between text-lg">
                                <span className="text-palette3">Create</span>
                                <span className="text-palette4">Manage</span>
                            </Text>
                            <MenuItem
                                asChild
                                value="template"
                                className="text-palette5 text-lg p-2 hover:bg-[#00000030] transition-colors duration-200 ease-linear"
                            >
                                <button>
                                    <ClipboardList />
                                    Choose a template
                                </button>
                            </MenuItem>
                        </MenuContent>
                    </MenuRoot>
                </div>
            </nav>
        </>
    );
}

export default DashNav;
