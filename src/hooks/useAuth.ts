"use client";

import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { User } from "@supabase/supabase-js";
import { useEffect, useState, useCallback } from "react";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (!error && data) {
        setProfile(data as Profile);
      }
    } catch (err) {
      console.warn("Could not load user profile:", err);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // 1. Initial user check
    const checkUser = async () => {
      try {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser();

        setUser(currentUser);
        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.warn("Auth status verification error:", err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 2. Real-time auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchProfile(authUser.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const displayName =
    profile?.first_name
      ? `${profile.first_name}${profile.last_name ? ` ${profile.last_name}` : ""}`.trim()
      : profile?.username
      ? `@${profile.username}`
      : user?.user_metadata?.first_name
      ? `${user.user_metadata.first_name}`.trim()
      : user?.email
      ? user.email.split("@")[0]
      : "My Account";

  return {
    user,
    profile,
    loading,
    signOut,
    isAuthenticated: Boolean(user),
    displayName,
  };
}
