import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { NotificationItem } from '../types';

interface NotificationsScreenProps {
  onNotificationRead?: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onNotificationRead }) => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD'>('ALL');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [listRes, countRes] = await Promise.all([
        api.get<any>('/notifications?pageNumber=1&pageSize=30').catch(() => []),
        api.get<any>('/notifications/unread-count').catch(() => ({ unreadCount: 0 }))
      ]);

      const items = Array.isArray(listRes) ? listRes : listRes?.items || [];
      setNotifications(items);
      setUnreadCount(countRes?.unreadCount || 0);
    } catch (err: any) {
      console.log('Lỗi tải thông báo:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await api.put(`/notifications/${item.id}/read`, {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      if (onNotificationRead) onNotificationRead();
    } catch (err: any) {
      console.log('Lỗi đánh dấu đã đọc:', err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all', {});
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      if (onNotificationRead) onNotificationRead();
      Alert.alert('Thành công', 'Đã đánh dấu tất cả thông báo là đã đọc.');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Không thể đánh dấu đã đọc.');
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      if (diffMinutes < 1) return 'Vừa xong';
      if (diffMinutes < 60) return `${diffMinutes} phút trước`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `${diffHours} giờ trước`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays < 7) return `${diffDays} ngày trước`;
      return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    } catch {
      return '';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'GRADE':
      case 'SCORE':
        return { icon: 'award' as const, bg: '#ECFDF5', color: '#059669' };
      case 'ASSIGNMENT':
      case 'QUIZ':
        return { icon: 'book-open' as const, bg: '#EFF6FF', color: '#2563EB' };
      case 'ANNOUNCEMENT':
        return { icon: 'volume-2' as const, bg: '#FEF3C7', color: '#D97706' };
      default:
        return { icon: 'bell' as const, bg: '#F1F5F9', color: '#475569' };
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    return true;
  });

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#2563EB']}
            tintColor="#2563EB"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Banner matching Web */}
        <View style={styles.banner}>
          <View style={styles.bannerPill}>
            <Feather name="bell" size={12} color="#1E40AF" />
            <Text style={styles.bannerPillText}>TRUNG TÂM THÔNG BÁO</Text>
          </View>
          <Text style={styles.bannerTitle}>Thông báo & Tin tức</Text>
          <Text style={styles.bannerSubtitle}>
            Cập nhật kết quả làm bài tập, bài kiểm tra và các thông báo mới từ giảng viên.
          </Text>
        </View>

        {/* Filter & Action Row */}
        <View style={styles.filterActionRow}>
          <View style={styles.filterTabs}>
            <TouchableOpacity
              style={[styles.filterTab, filterType === 'ALL' && styles.filterTabActive]}
              onPress={() => setFilterType('ALL')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterType === 'ALL' && styles.filterTabTextActive
                ]}
              >
                Tất cả ({notifications.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterTab, filterType === 'UNREAD' && styles.filterTabActive]}
              onPress={() => setFilterType('UNREAD')}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filterType === 'UNREAD' && styles.filterTabTextActive
                ]}
              >
                Chưa đọc ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          {unreadCount > 0 && (
            <TouchableOpacity
              style={styles.markAllBtn}
              onPress={handleMarkAllAsRead}
              activeOpacity={0.7}
            >
              <Feather name="check" size={13} color="#2563EB" />
              <Text style={styles.markAllText}>Đã đọc tất cả</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notification List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#2563EB" />
            <Text style={styles.loadingText}>Đang tải danh sách thông báo...</Text>
          </View>
        ) : filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={40} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>Không có thông báo mới</Text>
            <Text style={styles.emptySubtitle}>
              {filterType === 'UNREAD'
                ? 'Bạn đã đọc toàn bộ thông báo.'
                : 'Hộp thư thông báo của bạn hiện đang trống.'}
            </Text>
          </View>
        ) : (
          filteredNotifications.map((item) => {
            const config = getNotificationIcon(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.notificationCard, !item.isRead && styles.notificationCardUnread]}
                onPress={() => handleMarkAsRead(item)}
                activeOpacity={0.7}
              >
                {/* Icon Column */}
                <View style={[styles.iconWrap, { backgroundColor: config.bg }]}>
                  <Feather name={config.icon} size={18} color={config.color} />
                </View>

                {/* Content Column */}
                <View style={styles.contentCol}>
                  <View style={styles.titleRow}>
                    <Text
                      style={[styles.itemTitle, !item.isRead && styles.itemTitleUnread]}
                      numberOfLines={2}
                    >
                      {item.title}
                    </Text>
                    {!item.isRead && <View style={styles.unreadDot} />}
                  </View>

                  <Text style={styles.itemMessage} numberOfLines={3}>
                    {item.message}
                  </Text>

                  <View style={styles.footerRow}>
                    <Feather name="clock" size={11} color="#94A3B8" />
                    <Text style={styles.itemTime}>{formatTime(item.createdAt)}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC'
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24
  },

  // Banner
  banner: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DBEAFE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  bannerPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1E40AF',
    letterSpacing: 0.5
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A'
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#475569',
    marginTop: 4,
    lineHeight: 18
  },

  // Filter Action Row
  filterActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 7
  },
  filterTabActive: {
    backgroundColor: '#2563EB'
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B'
  },
  filterTabTextActive: {
    color: '#FFFFFF'
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE'
  },
  markAllText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1D4ED8'
  },

  // Loading & Empty
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B'
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 6
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center'
  },

  // Card
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1
  },
  notificationCardUnread: {
    backgroundColor: '#F8FAFF',
    borderColor: '#BFDBFE'
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  contentCol: {
    flex: 1
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  itemTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 18
  },
  itemTitleUnread: {
    color: '#0F172A',
    fontWeight: '800'
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#2563EB',
    marginLeft: 6,
    marginTop: 4
  },
  itemMessage: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 8
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  itemTime: {
    fontSize: 10,
    color: '#94A3B8'
  }
});
