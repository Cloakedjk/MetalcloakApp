import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getConfig } from '../config';
import { statusTone, type StatusTone } from '../format';
import { colors, radii } from '../theme';
import { AppText } from './AppText';

type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({
  children,
  refresh,
  safeBottom = false,
}: {
  children: ReactNode;
  refresh?: { refreshing: boolean; onRefresh: () => void };
  safeBottom?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: 32 + (safeBottom ? insets.bottom : 12) },
      ]}
      refreshControl={
        refresh ? (
          <RefreshControl
            refreshing={refresh.refreshing}
            onRefresh={refresh.onRefresh}
            tintColor={colors.accent}
            colors={[colors.accent]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
}) {
  const tone = variant === 'primary' || variant === 'danger' ? 'onAccent' : 'text';
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        (disabled || loading) && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.accent : colors.onAccent} />
      ) : (
        <View style={styles.buttonInner}>
          {icon ? (
            <Ionicons
              name={icon}
              size={16}
              color={variant === 'primary' || variant === 'danger' ? colors.onAccent : colors.accent}
            />
          ) : null}
          <AppText variant="micro" tone={tone} style={styles.buttonLabel}>
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

export function TextField({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={styles.field}>
      <AppText variant="label" tone="muted">
        {label}
      </AppText>
      <TextInput
        placeholderTextColor={colors.dim}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        style={styles.input}
      />
    </View>
  );
}

export function StatusPill({ status, label }: { status: string; label: string }) {
  const tone = statusTone(status);
  return (
    <View style={[styles.pill, pillStyles[tone].wrap]}>
      <AppText variant="micro" style={[styles.pillText, pillStyles[tone].text]}>
        {label}
      </AppText>
    </View>
  );
}

export function SampleBanner() {
  if (getConfig().dataSource !== 'mock') return null;
  return (
    <View style={styles.banner}>
      <AppText variant="micro" tone="warn">
        Sample data. This is not a live MetalCloak account, and nothing is sent to the store.
      </AppText>
    </View>
  );
}

export function PageHeader({
  kicker,
  title,
  subtitle,
}: {
  kicker?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.header}>
      {kicker ? (
        <AppText variant="label" tone="accent">
          {kicker}
        </AppText>
      ) : null}
      <AppText variant="display" accessibilityRole="header">
        {title}
      </AppText>
      {subtitle ? (
        <AppText variant="body" tone="muted">
          {subtitle}
        </AppText>
      ) : null}
    </View>
  );
}

export function BackButton({ label }: { label: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={8}
      onPress={() => {
        if (router.canGoBack()) router.back();
        else router.replace('/orders');
      }}
      style={styles.back}
    >
      <Ionicons name="chevron-back" size={20} color={colors.accent} />
      <AppText variant="micro" tone="accent">
        {label}
      </AppText>
    </Pressable>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator color={colors.accent} />
      <AppText variant="micro" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card>
      <AppText variant="title">Couldn’t load this</AppText>
      <AppText variant="body" tone="muted">
        {message}
      </AppText>
      <Button label="Try again" onPress={onRetry} />
    </Card>
  );
}

export function Logo({ large = false }: { large?: boolean }) {
  const badge = large ? 56 : 36;
  return (
    <View style={styles.logoRow}>
      <View style={[styles.badge, { width: badge, height: badge, borderRadius: large ? 12 : 8 }]}>
        <AppText variant="mark" tone="onAccent" style={{ fontSize: badge * 0.34 }}>
          MC
        </AppText>
      </View>
      <View style={{ gap: 2 }}>
        <AppText variant="word" style={{ fontSize: large ? 26 : 18 }}>
          METALCLOAK
        </AppText>
        {large ? (
          <AppText variant="micro" tone="muted">
            Customer account
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const pillStyles: Record<StatusTone, { wrap: ViewStyle; text: { color: string } }> = {
  open: { wrap: { backgroundColor: colors.accentSoft }, text: { color: colors.accent } },
  done: { wrap: { backgroundColor: colors.goodSoft }, text: { color: colors.good } },
  hold: { wrap: { backgroundColor: colors.warnSoft }, text: { color: colors.warn } },
  bad: { wrap: { backgroundColor: colors.badSoft }, text: { color: colors.bad } },
  neutral: { wrap: { backgroundColor: colors.cardAlt }, text: { color: colors.muted } },
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: 20, gap: 16 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 16,
    gap: 10,
  },
  button: {
    minHeight: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonLabel: { fontSize: 15, letterSpacing: 0.3, textTransform: 'none' },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.cardAlt, borderWidth: 1, borderColor: colors.line },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.bad },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.85 },
  field: { gap: 8 },
  input: {
    backgroundColor: colors.bgRaised,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    color: colors.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  pill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, letterSpacing: 0.2 },
  banner: {
    backgroundColor: colors.warnSoft,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(224, 177, 90, 0.35)',
  },
  header: { gap: 4 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start' },
  center: { paddingVertical: 48, alignItems: 'center', gap: 12 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  badge: { backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
});
