import { StyleSheet, View } from 'react-native';
import { AppText } from '../../../components/AppText';
import { PointsHero } from '../../../components/PointsHero';
import { ErrorBlock, LoadingBlock, PageHeader, SampleBanner, Screen } from '../../../components/ui';
import { useAccountData } from '../../../data/AccountData';
import { formatDate, signedPoints } from '../../../format';
import { colors } from '../../../theme';

export default function RewardsScreen() {
  const { rewards, loading, refreshing, error, refresh, customer } = useAccountData();

  return (
    <Screen refresh={{ refreshing, onRefresh: () => void refresh() }}>
      <PageHeader
        kicker="Your points"
        title="Rewards"
        subtitle="Balance and history. Spending points still happens at checkout on the website."
      />
      <SampleBanner />
      {loading && !customer ? <LoadingBlock label="Loading rewards" /> : null}
      {error && !customer ? <ErrorBlock message={error} onRetry={() => void refresh()} /> : null}
      {rewards ? (
        <View style={styles.stack}>
          <PointsHero rewards={rewards} />
          <AppText variant="title">History</AppText>
          {rewards.history.length === 0 ? (
            <AppText variant="body" tone="muted">
              No rewards activity yet.
            </AppText>
          ) : (
            rewards.history.map((entry) => (
              <View key={entry.id} style={styles.row}>
                <View style={styles.copy}>
                  <AppText variant="body">{entry.label}</AppText>
                  <AppText variant="micro" tone="muted">
                    {formatDate(entry.date)}
                    {entry.comment ? ` · ${entry.comment}` : ''}
                  </AppText>
                </View>
                <AppText
                  variant="title"
                  tone={entry.points < 0 ? 'bad' : 'good'}
                  style={styles.points}
                >
                  {signedPoints(entry.points)}
                </AppText>
              </View>
            ))
          )}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 14 },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  copy: { flex: 1, gap: 2 },
  points: { fontSize: 20 },
});
