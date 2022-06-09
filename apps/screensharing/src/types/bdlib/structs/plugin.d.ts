import * as Settings from "../ui/settings";
export default function (meta: any): {
    new (): {
        getName(): any;
        getDescription(): any;
        getVersion(): any;
        getAuthor(): any;
        load(): void;
        start(): Promise<void>;
        stop(): void;
        readonly isEnabled: any;
        strings: any;
        showSettingsModal(): void;
        showChangelog(footer: any): void;
        saveSettings(settings?: any): void;
        loadSettings(defaultSettings: any): any;
        buildSetting(data: any): null;
        buildSettingsPanel(): Settings.SettingPanel;
    };
};
