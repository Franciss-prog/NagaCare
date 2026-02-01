// ============================================================================
// AUTH SERVICE
// Handles resident authentication for Aramon AI
// ============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';
import type { Resident, User } from '../types/database';

const AUTH_STORAGE_KEY = '@aramon_auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  resident: Resident | null;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  barangay: string;
  purok: string;
  birthDate?: string;
  sex?: 'Male' | 'Female' | 'Other';
  contactNumber?: string;
  philhealthNo?: string;
}

// Simple hash function for password (in production, use bcrypt on server-side)
// Note: This is a simplified approach. In production, use Supabase Auth or server-side hashing
const simpleHash = async (password: string): Promise<string> => {
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password
  );
  return hash;
};

class AuthService {
  private currentUser: User | null = null;
  private currentResident: Resident | null = null;
  private initialized: boolean = false;

  // ============================================================================
  // INITIALIZE - Load persisted session
  // ============================================================================
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return this.currentUser !== null;
    }

    try {
      const storedAuth = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      
      if (storedAuth) {
        const { userId, residentId } = JSON.parse(storedAuth);
        
        // Verify user still exists in database
        const { data: user } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single() as { data: User | null; error: any };

        if (user) {
          this.currentUser = user;
          
          // Get resident profile
          if (residentId) {
            const { data: resident } = await supabase
              .from('residents')
              .select('*')
              .eq('id', residentId)
              .single() as { data: Resident | null; error: any };
            
            this.currentResident = resident;
          }
        } else {
          // User no longer exists, clear storage
          await this.clearStorage();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      await this.clearStorage();
    }

    this.initialized = true;
    return this.currentUser !== null;
  }

  // ============================================================================
  // PERSIST SESSION
  // ============================================================================
  private async persistSession(): Promise<void> {
    try {
      if (this.currentUser) {
        await AsyncStorage.setItem(
          AUTH_STORAGE_KEY,
          JSON.stringify({
            userId: this.currentUser.id,
            residentId: this.currentResident?.id || null,
          })
        );
      }
    } catch (error) {
      console.error('Failed to persist auth session:', error);
    }
  }

  private async clearStorage(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear auth storage:', error);
    }
  }

  // ============================================================================
  // LOGIN
  // ============================================================================
  async login(credentials: LoginCredentials): Promise<{
    success: boolean;
    user?: User;
    resident?: Resident;
    error?: string;
  }> {
    try {
      const passwordHash = await simpleHash(credentials.password);

      // Find user by username and password
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', credentials.username)
        .eq('password_hash', passwordHash)
        .single() as { data: User | null; error: any };

      if (userError || !user) {
        return { success: false, error: 'Invalid username or password' };
      }

      // Get linked resident profile
      const { data: resident } = await supabase
        .from('residents')
        .select('*')
        .eq('auth_id', user.id)
        .single() as { data: Resident | null; error: any };

      this.currentUser = user;
      this.currentResident = resident || null;

      // Persist session
      await this.persistSession();

      return { success: true, user, resident: resident || undefined };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'An error occurred during login' };
    }
  }

  // ============================================================================
  // REGISTER
  // ============================================================================
  async register(data: RegisterData): Promise<{
    success: boolean;
    user?: User;
    resident?: Resident;
    error?: string;
  }> {
    try {
      // Check if username already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', data.username)
        .single() as { data: { id: string } | null; error: any };

      if (existingUser) {
        return { success: false, error: 'Username already taken' };
      }

      const passwordHash = await simpleHash(data.password);

      // Create user
      const { data: newUser, error: userError } = await (supabase
        .from('users') as any)
        .insert({
          username: data.username,
          password_hash: passwordHash,
          user_role: 'residence',
          assigned_barangay: data.barangay,
        })
        .select()
        .single() as { data: User | null; error: any };

      if (userError || !newUser) {
        console.error('User creation error:', userError);
        return { success: false, error: 'Failed to create user account' };
      }

      // Create resident profile linked to user
      const { data: newResident, error: residentError } = await (supabase
        .from('residents') as any)
        .insert({
          auth_id: newUser.id,
          full_name: data.fullName,
          barangay: data.barangay,
          purok: data.purok,
          birth_date: data.birthDate || null,
          sex: data.sex || null,
          contact_number: data.contactNumber || null,
          philhealth_no: data.philhealthNo || null,
        })
        .select()
        .single() as { data: Resident | null; error: any };

      if (residentError || !newResident) {
        // Rollback user creation
        await supabase.from('users').delete().eq('id', newUser.id);
        console.error('Resident creation error:', residentError);
        return { success: false, error: 'Failed to create resident profile' };
      }

      this.currentUser = newUser;
      this.currentResident = newResident;

      // Persist session
      await this.persistSession();

      return { success: true, user: newUser, resident: newResident };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'An error occurred during registration' };
    }
  }

  // ============================================================================
  // LOGOUT
  // ============================================================================
  async logout(): Promise<void> {
    this.currentUser = null;
    this.currentResident = null;
    await this.clearStorage();
  }

  // ============================================================================
  // GETTERS
  // ============================================================================
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentResident(): Resident | null {
    return this.currentResident;
  }

  getResidentId(): string | null {
    return this.currentResident?.id || null;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // ============================================================================
  // UPDATE PROFILE
  // ============================================================================
  async updateProfile(updates: Partial<Omit<Resident, 'id' | 'auth_id' | 'created_at'>>): Promise<{
    success: boolean;
    resident?: Resident;
    error?: string;
  }> {
    if (!this.currentResident) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      const { data, error } = await (supabase
        .from('residents') as any)
        .update(updates)
        .eq('id', this.currentResident.id)
        .select()
        .single() as { data: Resident | null; error: any };

      if (error || !data) {
        return { success: false, error: 'Failed to update profile' };
      }

      this.currentResident = data;
      return { success: true, resident: data };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'An error occurred while updating profile' };
    }
  }
}

export const authService = new AuthService();
