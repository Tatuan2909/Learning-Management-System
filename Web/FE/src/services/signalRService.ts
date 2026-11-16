import * as signalR from '@microsoft/signalr';

export interface RealtimeNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private listeners: Array<(notification: RealtimeNotification) => void> = [];
  private isConnecting = false;

  public async startConnection(userId?: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      if (userId) {
        await this.registerUser(userId);
      }
      return;
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://localhost:5000/hubs/notifications', {
          accessTokenFactory: () => localStorage.getItem('access_token') || '',
          transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Warning)
        .build();

      this.connection.on('ReceiveNotification', (data: RealtimeNotification) => {
        this.notifyListeners(data);
      });

      this.connection.on('ReceiveCourseAnnouncement', (data: any) => {
        const notif: RealtimeNotification = {
          id: 'course-ann-' + Date.now(),
          title: data.title || 'Thông báo môn học mới',
          message: data.message || '',
          type: 'ANNOUNCEMENT',
          isRead: false,
          linkUrl: data.linkUrl,
          createdAt: data.createdAt || new Date().toISOString(),
        };
        this.notifyListeners(notif);
      });

      await this.connection.start();

      if (userId) {
        await this.registerUser(userId);
      }
    } catch (err) {
      // SignalR fallback - polling will still work
      console.warn('SignalR Realtime connection warning (will retry automatically):', err);
    } finally {
      this.isConnecting = false;
    }
  }

  public async registerUser(userId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinUserGroup', userId);
      } catch (e) {
        console.warn('Failed to join user SignalR group:', e);
      }
    }
  }

  public async joinCourse(courseId: string): Promise<void> {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke('JoinCourseGroup', courseId);
      } catch (e) {
        console.warn('Failed to join course SignalR group:', e);
      }
    }
  }

  public onNotification(callback: (notification: RealtimeNotification) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  private notifyListeners(notification: RealtimeNotification) {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (err) {
        console.error('Error executing notification listener:', err);
      }
    });
  }

  public async stopConnection(): Promise<void> {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch {}
      this.connection = null;
    }
  }
}

export const signalRService = new SignalRService();
