import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Receipt, FileSpreadsheet } from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useInvoice } from '../../hooks/useInvoice';
import { InvoicesScreen } from './InvoicesScreen';
import { QuotationsScreen } from './QuotationsScreen';

export const FinanceScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();

  const [topTab, setTopTab] = useState<'invoices' | 'quotations'>(
    route.params?.initialTab === 'quotations' ? 'quotations' : 'invoices'
  );

  const { invoices } = useInvoice();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Segmented Bar: [ Invoices | Quotations ] */}
      <View style={styles.topSegmentedWrapper}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'invoices' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('invoices');
            }}
            activeOpacity={0.8}
          >
            <Receipt
              size={16}
              color={topTab === 'invoices' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'invoices' && styles.segmentBtnTextActive,
              ]}
            >
              Invoices {invoices.length > 0 ? `(${invoices.length})` : ''}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentBtn, topTab === 'quotations' && styles.segmentBtnActive]}
            onPress={() => {
              Keyboard.dismiss();
              setTopTab('quotations');
            }}
            activeOpacity={0.8}
          >
            <FileSpreadsheet
              size={16}
              color={topTab === 'quotations' ? colors.primary : colors.textSecondary}
            />
            <Text
              style={[
                styles.segmentBtnText,
                topTab === 'quotations' && styles.segmentBtnTextActive,
              ]}
            >
              Quotations
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Render Selected View */}
      {topTab === 'quotations' ? (
        <View style={styles.contentContainer}>
          <QuotationsScreen embedded={true} />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <InvoicesScreen embedded={true} />
        </View>
      )}
    </View>
  );
};

export default FinanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topSegmentedWrapper: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 14,
    padding: 3,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentBtnTextActive: {
    color: colors.text,
    fontWeight: '700',
  },
  contentContainer: {
    flex: 1,
  },
});
