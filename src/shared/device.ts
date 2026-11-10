// 设备配置（docs/design.md 5.5）

export interface DeviceProfile {
	id: string;
	label: string;
	platform: "phone" | "tablet" | "cmp";
	widthDp: number;
	heightDp: number;
	/** 像素密度。 */
	density: number;
	frameRadiusPx: number;
	showStatusBar: boolean;
	/** CMP 额外。 */
	cmpTarget?: "android" | "ios" | "desktop" | "web";
}

export const BUILTIN_DEVICES: DeviceProfile[] = [
	{
		id: "phone",
		label: "Phone",
		platform: "phone",
		widthDp: 360,
		heightDp: 800,
		density: 2.75,
		frameRadiusPx: 32,
		showStatusBar: true,
	},
	{
		id: "tablet",
		label: "Tablet",
		platform: "tablet",
		widthDp: 834,
		heightDp: 1194,
		density: 2.0,
		frameRadiusPx: 24,
		showStatusBar: true,
	},
	{
		id: "cmp",
		label: "CMP",
		platform: "cmp",
		widthDp: 1200,
		heightDp: 800,
		density: 1.0,
		frameRadiusPx: 12,
		showStatusBar: false,
		cmpTarget: "desktop",
	},
];

export function getBuiltinDevice(id: string): DeviceProfile | undefined {
	return BUILTIN_DEVICES.find((d) => d.id === id);
}
