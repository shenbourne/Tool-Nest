import type { GlobalThemeOverrides } from 'naive-ui';

const fontFamily =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif";

const radius = {
  borderRadiusSmall: '4px',
  borderRadius: '8px',
  borderRadiusMedium: '8px',
  borderRadiusLarge: '12px',
} as const;

export const naiveLightThemeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary — teal (aligned with --color-primary*)
    primaryColor: '#0f766e',
    primaryColorHover: '#12897f',
    primaryColorPressed: '#0b5c56',
    primaryColorSuppl: '#12897f',
    // Status (aligned with --color-success/warning/error/info)
    successColor: '#1aae39',
    successColorHover: '#1cc24a',
    successColorPressed: '#159233',
    successColorSuppl: '#1cc24a',
    warningColor: '#dd5b00',
    warningColorHover: '#f07a1d',
    warningColorPressed: '#c24e00',
    warningColorSuppl: '#f07a1d',
    errorColor: '#e03131',
    errorColorHover: '#eb5a5a',
    errorColorPressed: '#c92a2a',
    errorColorSuppl: '#eb5a5a',
    infoColor: '#0075de',
    infoColorHover: '#2f8fe8',
    infoColorPressed: '#0062bd',
    infoColorSuppl: '#2f8fe8',
    // Neutral surfaces — canvas(white page) / surface(warm gray section)
    bodyColor: '#ffffff',
    cardColor: '#f6f5f4',
    popoverColor: '#ffffff',
    modalColor: '#ffffff',
    inputColor: '#ffffff',
    actionColor: '#f6f5f4',
    // Text ramp
    textColorBase: '#1a1a1a',
    textColor1: '#1a1a1a',
    textColor2: '#5f5e5b',
    textColor3: '#97958f',
    // Hairlines
    borderColor: '#e5e3df',
    dividerColor: '#e5e3df',
    // Type & shape
    fontFamily,
    fontSize: '14px',
    ...radius,
  },
};

export const naiveDarkThemeOverrides: GlobalThemeOverrides = {
  common: {
    // Primary — lifted teal for dark surfaces
    primaryColor: '#2dd4bf',
    primaryColorHover: '#5eead4',
    primaryColorPressed: '#14b8a6',
    primaryColorSuppl: '#5eead4',
    // Status
    successColor: '#23a55b',
    successColorHover: '#2bc96e',
    successColorPressed: '#1d8a4c',
    successColorSuppl: '#2bc96e',
    warningColor: '#f0a020',
    warningColorHover: '#f5b84d',
    warningColorPressed: '#d18a15',
    warningColorSuppl: '#f5b84d',
    errorColor: '#e03131',
    errorColorHover: '#eb5a5a',
    errorColorPressed: '#c92a2a',
    errorColorSuppl: '#eb5a5a',
    infoColor: '#4ba3f5',
    infoColorHover: '#74bbf8',
    infoColorPressed: '#2f8fe8',
    infoColorSuppl: '#74bbf8',
    // Neutral surfaces — warm dark ramp (aligned with html.dark tokens)
    bodyColor: '#191919',
    cardColor: '#202020',
    popoverColor: '#252525',
    modalColor: '#202020',
    inputColor: '#202020',
    actionColor: '#2a2a2a',
    // Text ramp
    textColorBase: '#e8e6e3',
    textColor1: '#e8e6e3',
    textColor2: '#b0aeab',
    textColor3: '#8a8883',
    // Hairlines
    borderColor: 'rgba(255, 255, 255, 0.13)',
    dividerColor: 'rgba(255, 255, 255, 0.13)',
    // Type & shape
    fontFamily,
    fontSize: '14px',
    ...radius,
  },
};
