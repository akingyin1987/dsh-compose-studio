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
export declare const BUILTIN_DEVICES: DeviceProfile[];
export declare function getBuiltinDevice(id: string): DeviceProfile | undefined;
//# sourceMappingURL=device.d.ts.map