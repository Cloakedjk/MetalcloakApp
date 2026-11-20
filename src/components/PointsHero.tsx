import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';
import type { RewardsSnapshot } from '../domain';
import { money, pointsCount } from '../format';
import { colors, radii } from '../theme';
import { AppText } from './AppText';

export function PointsHero({
  rewards,
  onPress,
}: {
  rewards: RewardsSnapshot;
  onPress?: () => void;
}) {
  const body = (
    <View style={styles.card}>
      <View style={styles.top}>
        <AppText variant="label" tone="accent">
          Rewards balance
        </AppText>
        {onPress ? <Ionicons name="chevron-forward" size={18} color={colors.accent} /> : null}
      </View>
      <View style={styles.figure}>
        <AppText variant="display" style={styles.points}>
          {pointsCount(rewards.balance.points)}
        </AppText>
        <AppText variant="title" tone="muted" style={styles.unit}>
          pts
        </AppText>
      </View>
      {rewards.balance.currencyValue != null ? (
        <AppText variant="body">
          {money(rewards.balance.currencyValue, rewards.balance.currency)} value
        </AppText>
      ) : (
        <AppText variant="micro" tone="muted">
          Dollar value shows when the store sends a conversion rate.
        </AppText>
      )}
      {rewards.balance.conversionNote ? (
        <AppText variant="micro" tone="dim">
          {rewards.balance.conversionNote}
        </AppText>
      ) : null}
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {body}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
    gap: 6,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  figure: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  points: { fontSize: 52, lineHeight: 58 },
  unit: { marginBottom: 8 },
  pressed: { opacity: 0.9 },
});
