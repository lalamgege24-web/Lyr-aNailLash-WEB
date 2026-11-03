/**
 * Push / Background Notification Utility
 * Provides native OS and browser background notifications for Owner and Customer
 */

import { Reservation } from '../types/salon';
import { audioManager } from './audioNotification';

export type NotificationPermissionState = 'granted' | 'denied' | 'default' | 'unsupported';

export class PushNotificationService {
  public static isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermission(): NotificationPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as NotificationPermissionState;
  }

  public static async requestPermission(): Promise<NotificationPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const result = await Notification.requestPermission();
      return result as NotificationPermissionState;
    } catch (e) {
      console.warn('Notification permission error:', e);
      return 'denied';
    }
  }

  /**
   * Send background notification
   */
  public static send(title: string, options?: NotificationOptions): Notification | null {
    if (!this.isSupported()) return null;
    if (Notification.permission !== 'granted') return null;

    try {
      const notif = new Notification(title, {
        badge: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=96&auto=format&fit=crop&q=80',
        icon: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=192&auto=format&fit=crop&q=80',
        ...options
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };

      return notif;
    } catch (e) {
      console.warn('Failed to display native notification:', e);
      return null;
    }
  }

  /**
   * For Owner: Notify when a new customer reservation arrives
   */
  public static notifyOwnerNewReservation(res: Reservation): void {
    audioManager.playNewReservationChime();

    const title = `🔔 Reservasi Baru Masuk! (${res.bookingCode})`;
    const body = `${res.fullName} memesan treatment untuk ${res.appointmentDate} jam ${res.appointmentTime} WIB. Total: Rp ${res.totalPrice.toLocaleString('id-ID')}`;

    this.send(title, {
      body,
      tag: `new-res-${res.id}`,
      requireInteraction: true
    });
  }

  /**
   * For Customer: Notify when owner approves the reservation
   */
  public static notifyCustomerReservationApproved(res: Reservation): void {
    audioManager.playApprovedChime();

    const title = `💖 Reservasi Anda Telah Disetujui!`;
    const body = `Halo ${res.fullName}, reservasi Anda #${res.bookingCode} untuk ${res.appointmentDate} pukul ${res.appointmentTime} WIB telah disetujui oleh Owner Lyra's Nail-Lash.`;

    this.send(title, {
      body,
      tag: `approved-res-${res.id}`,
      requireInteraction: true
    });
  }
}
