import { createContext, useContext, type ReactNode } from 'react';
import { Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { colors } from '../theme';

const FontContext = createContext(false);

export function FontsProvider({ loaded, children }: { loaded: boolean; children: ReactNode }) {
  return <FontContext.Provider value={loaded}>{children}</FontContext.Provider>;
}

export function useFontsLoaded(): boolean {
  return useContext(FontContext);
}

type Variant = 'display' | 'title' | 'body' | 'label' | 'micro' | 'word' | 'mark';
type Tone = 'text' | 'muted' | 'dim' | 'accent' | 'good' | 'bad' | 'warn' | 'info' | 'onAccent';

const families: Record<Variant, string> = {
  display: 'Oswald_600SemiBold',
  title: 'Oswald_500Medium',
  word: 'Oswald_500Medium',
  mark: 'Oswald_600SemiBold',
  body: 'Barlow_400Regular',
  label: 'Barlow_600SemiBold',
  micro: 'Barlow_500Medium',
};

const variantStyle: Record<Variant, TextStyle> = {
  display: { fontSize: 34, lineHeight: 40, letterSpacing: 0.3 },
  title: { fontSize: 22, lineHeight: 28, letterSpacing: 0.3 },
  word: { fontSize: 18, lineHeight: 22, letterSpacing: 2.4 },
  mark: { fontSize: 16, lineHeight: 20, letterSpacing: 0.5 },
  body: { fontSize: 16, lineHeight: 22 },
  label: { fontSize: 12, lineHeight: 16, letterSpacing: 1.2, textTransform: 'uppercase' },
  micro: { fontSize: 13, lineHeight: 18 },
};

const toneColor: Record<Tone, string> = {
  text: colors.text,
  muted: colors.muted,
  dim: colors.dim,
  accent: colors.accent,
  good: colors.good,
  bad: colors.bad,
  warn: colors.warn,
  info: colors.info,
  onAccent: colors.onAccent,
};

export function AppText({
  variant = 'body',
  tone = 'text',
  style,
  ...props
}: TextProps & { variant?: Variant; tone?: Tone; style?: StyleProp<TextStyle> }) {
  const fonts = useFontsLoaded();
  return (
    <Text
      {...props}
      style={[
        { color: toneColor[tone] },
        variantStyle[variant],
        fonts ? { fontFamily: families[variant] } : null,
        style,
      ]}
    />
  );
}
