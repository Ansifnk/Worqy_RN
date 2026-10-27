import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import dayjs from 'dayjs';
import {
  ArrowLeft,
  Phone,
  Mail,
  Globe,
  MapPin,
  User,
  Building2,
  Clock,
  Tag,
  FileText,
  Plus,
  Edit3,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  ListTodo,
  Receipt,
  UserCheck,
} from 'lucide-react-native';
import { colors } from '../../utils/colors';
import { useClient } from '../../hooks/useClient';
import { useInvoice } from '../../hooks/useInvoice';
import { useTask } from '../../hooks/useTask';
import { ClientItem, ClientStatus, ClientFormData } from './types';
import { ClientLogo } from './components/ClientLogos';
import ClientFormModal from './components/ClientFormModal';
import ThreeDotsMenu, { ActionMenuItem } from '../../components/ThreeDotsMenu';
import { formatCurrency } from '../invoices/components/InvoiceItemCard';
import InvoiceStatusBadge from '../invoices/components/InvoiceStatusBadge';
import { getPriorityColors } from '../tasks/components/TaskItemCard';

type TabKey = 'overview' | 'invoices' | 'tasks';

export const ClientDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { clientId } = route.params || {};

  const { clients, updateClient, deleteClient } = useClient();
  const { invoices } = useInvoice();
  const { tasks } = useTask();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  // Locate the client
  const client: ClientItem | undefined = useMemo(() => {
    return clients.find((c) => c.id === clientId);
  }, [clients, clientId]);

  // Client's associated invoices
  const clientInvoices = useMemo(() => {
    if (!client) return [];
    return invoices.filter(
      (inv) =>
        inv.clientId === client.id ||
        (inv.clientName && inv.clientName.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [invoices, client]);

  // Client's associated tasks
  const clientTasks = useMemo(() => {
    if (!client) return [];
    return tasks.filter(
      (t) =>
        t.clientId === client.id ||
        (t.clientName && t.clientName.trim().toLowerCase() === client.name.trim().toLowerCase())
    );
  }, [tasks, client]);

  // Financial statistics
  const stats = useMemo(() => {
    const totalInvoiced = clientInvoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const paidAmount = clientInvoices
      .filter((inv) => inv.status === 'Paid')
      .reduce((acc, inv) => acc + (inv.total || 0), 0);
    const pendingAmount = clientInvoices
      .filter((inv) => inv.status === 'Sent' || inv.status === 'Overdue')
      .reduce((acc, inv) => acc + (inv.total || 0), 0);

    const totalTasksCount = clientTasks.length;
    const completedTasksCount = clientTasks.filter((t) => t.status === 'Done').length;
    const activeTasksCount = totalTasksCount - completedTasksCount;

    return {
      totalInvoiced,
      paidAmount,
      pendingAmount,
      totalTasksCount,
      completedTasksCount,
      activeTasksCount,
    };
  }, [clientInvoices, clientTasks]);

  // Status badge colors
  const getBadgeStyle = useCallback((status: ClientStatus = 'Active') => {
    switch (status) {
      case 'Active':
        return {
          bg: colors.statusActiveBg || '#EAF6EE',
          text: colors.statusActiveText || '#238349',
        };
      case 'Lead':
        return {
          bg: '#EBF4FF',
          text: '#2563EB',
        };
      case 'Inactive':
        return {
          bg: '#F1F5F9',
          text: '#64748B',
        };
      case 'Completed':
        return {
          bg: colors.statusCompletedBg || '#EAF1FA',
          text: colors.statusCompletedText || '#3566B8',
        };
      case 'On Hold':
        return {
          bg: colors.statusOnHoldBg || '#FEF3E6',
          text: colors.statusOnHoldText || '#BA6F18',
        };
      default:
        return {
          bg: '#F3F4F6',
          text: '#4B5563',
        };
    }
  }, []);

  const formatDate = useCallback((dateVal: any) => {
    if (!dateVal) return 'N/A';
    try {
      if (dateVal.toDate && typeof dateVal.toDate === 'function') {
        return dayjs(dateVal.toDate()).format('D MMM YYYY');
      }
      return dayjs(dateVal).format('D MMM YYYY');
    } catch {
      return 'N/A';
    }
  }, []);

  // Communications & Actions
  const handleCall = useCallback(() => {
    if (!client?.phone) {
      Alert.alert('No Phone Number', 'This client does not have a phone number registered.');
      return;
    }
    const cleanNumber = client.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleanNumber}`).catch(() => {
      Alert.alert('Error', 'Unable to initiate phone call on this device.');
    });
  }, [client?.phone]);

  const handleEmail = useCallback(() => {
    if (!client?.email) {
      Alert.alert('No Email Address', 'This client does not have an email address registered.');
      return;
    }
    Linking.openURL(`mailto:${client.email}`).catch(() => {
      Alert.alert('Error', 'Unable to open mail client on this device.');
    });
  }, [client?.email]);

  const handleWebsite = useCallback(() => {
    if (!client?.website) {
      Alert.alert('No Website', 'This client does not have a website URL registered.');
      return;
    }
    let url = client.website.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    Linking.openURL(url).catch(() => {
      Alert.alert('Invalid Link', 'Could not open the provided URL.');
    });
  }, [client?.website]);

  const handleOpenAddressInMap = useCallback(() => {
    if (!client?.address) return;
    const query = encodeURIComponent(client.address);
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${query}`,
      android: `geo:0,0?q=${query}`,
      default: `https://maps.google.com/?q=${query}`,
    });
    Linking.openURL(mapUrl).catch(() => {
      Alert.alert('Error', 'Could not open maps application.');
    });
  }, [client?.address]);

  const handleShare = useCallback(async () => {
    if (!client) return;
    try {
      const message = [
        `Client: ${client.name}`,
        client.companyName ? `Company: ${client.companyName}` : null,
        client.phone ? `Phone: ${client.phone}` : null,
        client.email ? `Email: ${client.email}` : null,
        client.address ? `Address: ${client.address}` : null,
        client.website ? `Website: ${client.website}` : null,
        client.status ? `Status: ${client.status}` : null,
      ]
        .filter(Boolean)
        .join('\n');

      await Share.share({
        title: `${client.name} - Client Info`,
        message,
      });
    } catch (err: any) {
      console.warn('Share error:', err);
    }
  }, [client]);

  const handleStatusChange = useCallback(
    async (newStatus: ClientStatus) => {
      if (!client) return;
      try {
        await updateClient(client.id, { status: newStatus });
        Alert.alert('Status Updated', `Client status changed to "${newStatus}".`);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update client status.');
      }
    },
    [client, updateClient]
  );

  const handleDelete = useCallback(() => {
    if (!client) return;
    Alert.alert(
      'Delete Client',
      `Are you sure you want to remove "${client.name}"? This will not delete past invoices or tasks, but this action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClient(client.id);
              navigation.goBack();
            } catch (err: any) {
              Alert.alert('Error', err?.message || 'Failed to delete client.');
            }
          },
        },
      ]
    );
  }, [client, deleteClient, navigation]);

  const handleEditSubmit = useCallback(
    async (data: ClientFormData) => {
      if (!client) return;
      try {
        await updateClient(client.id, data);
        setIsEditModalVisible(false);
        Alert.alert('Client Updated', `"${data.name}" has been updated successfully.`);
      } catch (err: any) {
        Alert.alert('Error', err?.message || 'Failed to update client.');
      }
    },
    [client, updateClient]
  );

  const handleCreateInvoice = useCallback(() => {
    if (!client) return;
    navigation.navigate('AddEditInvoice', {
      prefillClientId: client.id,
      prefillClientName: client.name,
      prefillClientEmail: client.email || '',
    });
  }, [client, navigation]);

  const handleCreateTask = useCallback(() => {
    if (!client) return;
    navigation.navigate('TaskDetail', {
      isNew: true,
      prefillClientId: client.id,
      prefillClientName: client.name,
    });
  }, [client, navigation]);

  // Header 3-Dots actions
  const menuActions: ActionMenuItem[] = useMemo(() => {
    if (!client) return [];
    return [
      {
        id: 'edit',
        title: 'Edit Client',
        onPress: () => setIsEditModalVisible(true),
      },
      {
        id: 'status',
        title: 'Change Status',
        subactions: (['Active', 'Lead', 'On Hold', 'Completed', 'Inactive'] as ClientStatus[]).map(
          (st) => ({
            id: `status_${st}`,
            title: `Mark as ${st}`,
            state: st === client.status ? 'on' : 'off',
            onPress: () => handleStatusChange(st),
          })
        ),
      },
      {
        id: 'create_invoice',
        title: 'Create Invoice',
        onPress: handleCreateInvoice,
      },
      {
        id: 'create_task',
        title: 'Create Task',
        onPress: handleCreateTask,
      },
      {
        id: 'share',
        title: 'Share Client',
        onPress: handleShare,
      },
      {
        id: 'delete',
        title: 'Delete Client',
        destructive: true,
        onPress: handleDelete,
      },
    ];
  }, [
    client,
    handleStatusChange,
    handleCreateInvoice,
    handleCreateTask,
    handleShare,
    handleDelete,
  ]);

  if (!client) {
    return (
      <View style={[styles.screen, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={22} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Client Details</Text>
          <View style={styles.navSpacer} />
        </View>
        <View style={styles.notFoundContainer}>
          <AlertCircle size={48} color={colors.textSecondary} />
          <Text style={styles.notFoundTitle}>Client Not Found</Text>
          <Text style={styles.notFoundSubtitle}>
            This client may have been deleted or the link is invalid.
          </Text>
          <TouchableOpacity
            style={styles.backHomeBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Text style={styles.backHomeBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const badgeStyle = getBadgeStyle(client.status);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Top Navigation Bar */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={styles.navTitle}>Client Details</Text>

        <ThreeDotsMenu
          orientation="vertical"
          iconSize={20}
          iconColor={colors.text}
          title={client.name}
          actions={menuActions}
          buttonStyle={styles.navButton}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom + 85, 100) },
        ]}
      >
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={styles.avatarWrapper}>
              <ClientLogo
                type={client.logoType || 'custom'}
                name={client.name}
                size={64}
              />
            </View>

            <View style={styles.heroInfo}>
              <Text style={styles.clientName} numberOfLines={2}>
                {client.name}
              </Text>
              {client.companyName ? (
                <Text style={styles.clientCompany} numberOfLines={1}>
                  {client.companyName}
                </Text>
              ) : null}

              <View style={styles.badgeRow}>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: badgeStyle.bg }]}>
                  <Text style={[styles.statusText, { color: badgeStyle.text }]}>
                    {client.status}
                  </Text>
                </View>

                {/* Client Type Badge */}
                <View style={styles.typeBadge}>
                  {client.clientType === 'Company' ? (
                    <Building2 size={12} color={colors.textSecondary} style={styles.badgeIcon} />
                  ) : (
                    <User size={12} color={colors.textSecondary} style={styles.badgeIcon} />
                  )}
                  <Text style={styles.typeBadgeText}>
                    {client.clientType || 'Individual'}
                  </Text>
                </View>

                {/* Category Badge */}
                {client.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText} numberOfLines={1}>
                      {client.category}
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* Quick Actions Row */}
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={[styles.quickActionBtn, !client.phone && styles.quickActionBtnDisabled]}
              onPress={handleCall}
              activeOpacity={0.7}
              disabled={!client.phone}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  !client.phone && styles.quickActionIconWrapDisabled,
                ]}
              >
                <Phone
                  size={19}
                  color={client.phone ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  !client.phone && styles.quickActionLabelDisabled,
                ]}
              >
                Call
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, !client.email && styles.quickActionBtnDisabled]}
              onPress={handleEmail}
              activeOpacity={0.7}
              disabled={!client.email}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  !client.email && styles.quickActionIconWrapDisabled,
                ]}
              >
                <Mail
                  size={19}
                  color={client.email ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  !client.email && styles.quickActionLabelDisabled,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickActionBtn, !client.website && styles.quickActionBtnDisabled]}
              onPress={handleWebsite}
              activeOpacity={0.7}
              disabled={!client.website}
            >
              <View
                style={[
                  styles.quickActionIconWrap,
                  !client.website && styles.quickActionIconWrapDisabled,
                ]}
              >
                <Globe
                  size={19}
                  color={client.website ? colors.primary : colors.textSecondary}
                />
              </View>
              <Text
                style={[
                  styles.quickActionLabel,
                  !client.website && styles.quickActionLabelDisabled,
                ]}
              >
                Website
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionBtn}
              onPress={handleCreateInvoice}
              activeOpacity={0.7}
            >
              <View style={[styles.quickActionIconWrap, styles.quickActionInvoiceWrap]}>
                <Receipt size={19} color={colors.white} />
              </View>
              <Text style={styles.quickActionInvoiceLabel}>
                Invoice
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial & Activity Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Invoiced</Text>
            <Text style={styles.statValue} numberOfLines={1}>
              {formatCurrency(stats.totalInvoiced)}
            </Text>
            <Text style={styles.statSub}>
              {clientInvoices.length} {clientInvoices.length === 1 ? 'invoice' : 'invoices'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Outstanding</Text>
            <Text
              style={[
                styles.statValue,
                { color: stats.pendingAmount > 0 ? colors.warning : colors.success },
              ]}
              numberOfLines={1}
            >
              {formatCurrency(stats.pendingAmount)}
            </Text>
            <Text style={styles.statSub}>
              {stats.pendingAmount > 0 ? 'Pending payment' : 'All clear'}
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Active Tasks</Text>
            <Text style={[styles.statValue, { color: colors.primary }]} numberOfLines={1}>
              {stats.activeTasksCount}
            </Text>
            <Text style={styles.statSub}>
              of {stats.totalTasksCount} total
            </Text>
          </View>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.tabButtonActive]}
            onPress={() => setActiveTab('overview')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'overview' && styles.tabButtonTextActive]}
            >
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'invoices' && styles.tabButtonActive]}
            onPress={() => setActiveTab('invoices')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'invoices' && styles.tabButtonTextActive]}
            >
              Invoices
            </Text>
            {clientInvoices.length > 0 && (
              <View
                style={[
                  styles.tabCountBadge,
                  activeTab === 'invoices' && styles.tabCountBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === 'invoices' && styles.tabCountTextActive,
                  ]}
                >
                  {clientInvoices.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'tasks' && styles.tabButtonActive]}
            onPress={() => setActiveTab('tasks')}
            activeOpacity={0.7}
          >
            <Text
              style={[styles.tabButtonText, activeTab === 'tasks' && styles.tabButtonTextActive]}
            >
              Tasks
            </Text>
            {clientTasks.length > 0 && (
              <View
                style={[
                  styles.tabCountBadge,
                  activeTab === 'tasks' && styles.tabCountBadgeActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabCountText,
                    activeTab === 'tasks' && styles.tabCountTextActive,
                  ]}
                >
                  {clientTasks.length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            {/* Contact Details Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Contact Details</Text>
              </View>

              <View style={styles.cardBody}>
                {/* Phone */}
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={handleCall}
                  disabled={!client.phone}
                  activeOpacity={client.phone ? 0.7 : 1}
                >
                  <View style={styles.detailIconWrapper}>
                    <Phone size={17} color={colors.primary} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        client.phone ? styles.detailValueClickable : styles.detailValueEmpty,
                      ]}
                    >
                      {client.phone || 'Not provided'}
                    </Text>
                  </View>
                  {client.phone ? <ChevronRight size={16} color={colors.textSecondary} /> : null}
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={handleEmail}
                  disabled={!client.email}
                  activeOpacity={client.email ? 0.7 : 1}
                >
                  <View style={styles.detailIconWrapper}>
                    <Mail size={17} color={colors.primary} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailLabel}>Email Address</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        client.email ? styles.detailValueClickable : styles.detailValueEmpty,
                      ]}
                    >
                      {client.email || 'Not provided'}
                    </Text>
                  </View>
                  {client.email ? <ChevronRight size={16} color={colors.textSecondary} /> : null}
                </TouchableOpacity>

                {/* Contact Person */}
                {client.contactPerson ? (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconWrapper}>
                      <UserCheck size={17} color={colors.primary} />
                    </View>
                    <View style={styles.detailTextWrapper}>
                      <Text style={styles.detailLabel}>Contact Person</Text>
                      <Text style={styles.detailValue}>{client.contactPerson}</Text>
                    </View>
                  </View>
                ) : null}

                {/* Website */}
                <TouchableOpacity
                  style={styles.detailRow}
                  onPress={handleWebsite}
                  disabled={!client.website}
                  activeOpacity={client.website ? 0.7 : 1}
                >
                  <View style={styles.detailIconWrapper}>
                    <Globe size={17} color={colors.primary} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailLabel}>Website</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        client.website ? styles.detailValueClickable : styles.detailValueEmpty,
                      ]}
                    >
                      {client.website || 'Not provided'}
                    </Text>
                  </View>
                  {client.website ? <ExternalLink size={15} color={colors.textSecondary} /> : null}
                </TouchableOpacity>

                {/* Address */}
                <TouchableOpacity
                  style={[styles.detailRow, styles.detailRowNoBorder]}
                  onPress={handleOpenAddressInMap}
                  disabled={!client.address}
                  activeOpacity={client.address ? 0.7 : 1}
                >
                  <View style={styles.detailIconWrapper}>
                    <MapPin size={17} color={colors.primary} />
                  </View>
                  <View style={styles.detailTextWrapper}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text
                      style={[
                        styles.detailValue,
                        client.address ? styles.detailValueClickable : styles.detailValueEmpty,
                      ]}
                    >
                      {client.address || 'Not provided'}
                    </Text>
                  </View>
                  {client.address ? <ExternalLink size={15} color={colors.textSecondary} /> : null}
                </TouchableOpacity>
              </View>
            </View>

            {/* Business Information Card */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>Business Information</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.metaGridRow}>
                  <View style={styles.metaGridItem}>
                    <Text style={styles.detailLabel}>Client Type</Text>
                    <Text style={styles.detailValue}>{client.clientType || 'Company'}</Text>
                  </View>
                  <View style={styles.metaGridItem}>
                    <Text style={styles.detailLabel}>Category</Text>
                    <Text style={styles.detailValue}>{client.category || 'General'}</Text>
                  </View>
                </View>

                <View style={styles.metaGridRow}>
                  <View style={styles.metaGridItem}>
                    <Text style={styles.detailLabel}>Client Source</Text>
                    <Text style={styles.detailValue}>{client.clientSource || 'Direct'}</Text>
                  </View>
                  <View style={styles.metaGridItem}>
                    <Text style={styles.detailLabel}>Client Since</Text>
                    <Text style={styles.detailValue}>{formatDate(client.createdAt)}</Text>
                  </View>
                </View>

                {client.updatedAt ? (
                  <View style={styles.metaGridRow}>
                    <View style={styles.metaGridItem}>
                      <Text style={styles.detailLabel}>Last Updated</Text>
                      <Text style={styles.detailValue}>{formatDate(client.updatedAt)}</Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>

            {/* Tags Section */}
            {client.tags && client.tags.length > 0 ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Tags</Text>
                </View>
                <View style={styles.tagsContainer}>
                  {client.tags.map((tag, idx) => (
                    <View key={`${tag}-${idx}`} style={styles.tagPill}>
                      <Tag size={12} color={colors.primary} style={styles.tagIcon} />
                      <Text style={styles.tagPillText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {/* Notes Section */}
            {client.notes ? (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Notes & Remarks</Text>
                </View>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{client.notes}</Text>
                </View>
              </View>
            ) : null}
          </View>
        )}

        {/* Tab 2: Invoices */}
        {activeTab === 'invoices' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                Invoices ({clientInvoices.length})
              </Text>
              <TouchableOpacity
                style={styles.sectionActionBtn}
                onPress={handleCreateInvoice}
                activeOpacity={0.7}
              >
                <Plus size={15} color={colors.primary} />
                <Text style={styles.sectionActionBtnText}>New Invoice</Text>
              </TouchableOpacity>
            </View>

            {clientInvoices.length > 0 ? (
              <View style={styles.invoicesList}>
                {clientInvoices.map((inv) => (
                  <TouchableOpacity
                    key={inv.id}
                    style={styles.invoiceItemCard}
                    onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: inv.id })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.invoiceItemLeft}>
                      <View style={styles.invoiceIconContainer}>
                        <FileText size={18} color={colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.invoiceNumberText}>{inv.invoiceNumber}</Text>
                        <Text style={styles.invoiceDateText}>
                          Due: {inv.dueDate ? dayjs(inv.dueDate).format('DD MMM YYYY') : 'N/A'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.invoiceItemRight}>
                      <Text style={styles.invoiceAmountText}>
                        {formatCurrency(inv.total)}
                      </Text>
                      <View style={styles.invoiceStatusWrap}>
                        <InvoiceStatusBadge status={inv.status} />
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <View style={styles.emptyIconCircle}>
                  <Receipt size={28} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>No Invoices Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Create your first invoice for {client.name} to track payments and billable work.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={handleCreateInvoice}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.white} style={styles.emptyBtnIcon} />
                  <Text style={styles.emptyActionBtnText}>Create Invoice</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Tab 3: Tasks */}
        {activeTab === 'tasks' && (
          <View style={styles.tabContent}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionHeading}>
                Associated Tasks ({clientTasks.length})
              </Text>
              <TouchableOpacity
                style={styles.sectionActionBtn}
                onPress={handleCreateTask}
                activeOpacity={0.7}
              >
                <Plus size={15} color={colors.primary} />
                <Text style={styles.sectionActionBtnText}>Add Task</Text>
              </TouchableOpacity>
            </View>

            {clientTasks.length > 0 ? (
              <View style={styles.tasksList}>
                {clientTasks.map((t) => {
                  const priorityColors = getPriorityColors(t.priority);
                  const isDone = t.status === 'Done';
                  return (
                    <TouchableOpacity
                      key={t.id}
                      style={styles.taskItemCard}
                      onPress={() => navigation.navigate('TaskDetail', { taskId: t.id })}
                      activeOpacity={0.7}
                    >
                      <View style={styles.taskItemHeader}>
                        <View style={styles.taskTitleRow}>
                          <View
                            style={[
                              styles.taskStatusIndicator,
                              { backgroundColor: isDone ? colors.success : colors.secondary },
                            ]}
                          />
                          <Text
                            style={[
                              styles.taskTitleText,
                              isDone && styles.taskTitleDone,
                            ]}
                            numberOfLines={1}
                          >
                            {t.title}
                          </Text>
                        </View>
                        <ChevronRight size={16} color={colors.textSecondary} />
                      </View>

                      <View style={styles.taskMetaRow}>
                        {t.dueDate ? (
                          <View style={styles.taskMetaItem}>
                            <Clock size={13} color={colors.textSecondary} />
                            <Text style={styles.taskMetaText}>
                              {dayjs(t.dueDate).format('D MMM')}
                            </Text>
                          </View>
                        ) : null}

                        <View style={styles.taskBadgesRow}>
                          <View
                            style={[
                              styles.taskPriorityBadge,
                              { backgroundColor: priorityColors.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.taskPriorityBadgeText,
                                { color: priorityColors.text },
                              ]}
                            >
                              {t.priority}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.taskStatusBadge,
                              {
                                backgroundColor: isDone
                                  ? colors.statusActiveBg
                                  : colors.highlight,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.taskStatusBadgeText,
                                {
                                  color: isDone
                                    ? colors.statusActiveText
                                    : colors.primary,
                                },
                              ]}
                            >
                              {t.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyStateBox}>
                <View style={styles.emptyIconCircle}>
                  <ListTodo size={28} color={colors.textSecondary} />
                </View>
                <Text style={styles.emptyTitle}>No Tasks Yet</Text>
                <Text style={styles.emptySubtitle}>
                  Keep track of client deliverables, meetings, and todos for {client.name}.
                </Text>
                <TouchableOpacity
                  style={styles.emptyActionBtn}
                  onPress={handleCreateTask}
                  activeOpacity={0.8}
                >
                  <Plus size={16} color={colors.white} style={styles.emptyBtnIcon} />
                  <Text style={styles.emptyActionBtnText}>Add First Task</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Sticky Bar */}
      <View
        style={[
          styles.bottomActionBar,
          { paddingBottom: Math.max(insets.bottom, 14) },
        ]}
      >
        <TouchableOpacity
          style={styles.bottomEditBtn}
          onPress={() => setIsEditModalVisible(true)}
          activeOpacity={0.8}
        >
          <Edit3 size={17} color={colors.primary} />
          <Text style={styles.bottomEditBtnText}>Edit Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.bottomInvoiceBtn}
          onPress={handleCreateInvoice}
          activeOpacity={0.8}
        >
          <Receipt size={17} color={colors.white} />
          <Text style={styles.bottomInvoiceBtnText}>New Invoice</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Client Modal */}
      <ClientFormModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onSubmit={handleEditSubmit}
        initialData={client}
      />
    </View>
  );
};

export default ClientDetailScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.background,
  },
  navButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navSpacer: {
    width: 40,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  // Hero Card
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#176B67',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 14,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    marginRight: 14,
  },
  heroInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  clientName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  clientCompany: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  badgeIcon: {
    marginRight: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  typeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryBadge: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textSecondary,
  },

  // Quick Actions
  quickActionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 18,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionBtnDisabled: {
    opacity: 0.5,
  },
  quickActionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  quickActionIconWrapDisabled: {
    backgroundColor: '#F1F5F9',
  },
  quickActionInvoiceWrap: {
    backgroundColor: colors.primary,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  quickActionInvoiceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  quickActionLabelDisabled: {
    color: colors.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statSub: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 10,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
  },
  tabButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabButtonTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  tabCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tabCountBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  tabCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  tabCountTextActive: {
    color: colors.white,
  },

  // Tab Content
  tabContent: {
    gap: 14,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  cardBody: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  detailRowNoBorder: {
    borderBottomWidth: 0,
  },
  detailIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextWrapper: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  detailValueClickable: {
    color: colors.primary,
  },
  detailValueEmpty: {
    color: colors.textSecondary,
    fontStyle: 'italic',
    fontWeight: '400',
  },

  metaGridRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 4,
  },
  metaGridItem: {
    flex: 1,
  },

  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tagIcon: {
    marginRight: 5,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },

  // Notes
  notesBox: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  notesText: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.text,
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.2,
  },
  sectionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  sectionActionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },

  // Invoices List
  invoicesList: {
    gap: 10,
  },
  invoiceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  invoiceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  invoiceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  invoiceNumberText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 3,
  },
  invoiceDateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  invoiceItemRight: {
    alignItems: 'flex-end',
  },
  invoiceAmountText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  invoiceStatusWrap: {},

  // Tasks List
  tasksList: {
    gap: 10,
  },
  taskItemCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  taskStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  taskTitleText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.text,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: colors.textSecondary,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  taskMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  taskMetaText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  taskBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  taskPriorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskPriorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  taskStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  taskStatusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Empty State
  emptyStateBox: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 6,
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 18,
    paddingHorizontal: 12,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyBtnIcon: {
    marginRight: 6,
  },
  emptyActionBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.white,
  },

  // Bottom Sticky Bar
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomEditBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceSecondary,
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  bottomEditBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.primary,
  },
  bottomInvoiceBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  bottomInvoiceBtnText: {
    fontSize: 14.5,
    fontWeight: '600',
    color: colors.white,
  },

  // Not Found Screen
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 6,
  },
  notFoundSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  backHomeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backHomeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
