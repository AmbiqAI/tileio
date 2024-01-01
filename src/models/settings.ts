import { Theme } from '@mui/material/styles';
import { Instance, SnapshotIn, types } from 'mobx-state-tree';
import { darkTheme } from '../theme/theme';

export enum ThemeModeType {
  light = "light",
  dark = 'dark',
  system = 'system'
}
export const ThemeMode = types.enumeration<ThemeModeType>('ThemeMode', Object.values(ThemeModeType));

const Settings = types
.model('Settings', {
  themeMode: types.optional(ThemeMode, ThemeModeType.system)
})
.views( self => ({
  get isDarkMode() { return self.themeMode === ThemeModeType.dark; },
  get isLightMode() { return self.themeMode === ThemeModeType.light; },
}))
.volatile(self => ({
  theme: darkTheme as |Theme
}))
.actions(self => ({
  setTheme: function(theme: Theme) {
    self.theme = theme;
  },
  setThemeMode: function(themeMode: ThemeModeType) {
    self.themeMode = themeMode;
  }
}));

export default Settings;
export interface ISettings extends Instance<typeof Settings> {}
export interface ISettingsSnapshot extends SnapshotIn<typeof Settings> {}
