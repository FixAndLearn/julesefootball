"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { normalizePhoneNumber } from "@/lib/utils/phone";
import {
  User,
  Mail,
  Lock,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
  Save,
  ArrowRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function ProfileContent() {
  const router = useRouter();
  const [loadingUser, setLoadingUser] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [updatingEmail, setUpdatingEmail] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // User & Profile State
  const [userId, setUserId] = useState("");
  const [currentEmail, setCurrentEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isVerifiedSeller, setIsVerifiedSeller] = useState(false);
  const [createdAt, setCreatedAt] = useState("");

  // Email update state
  const [newEmail, setNewEmail] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Profile message
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const {
          data: { user },
          error: userErr,
        } = await supabase.auth.getUser();

        if (userErr || !user) {
          router.push("/login?redirect=/profile");
          return;
        }

        setUserId(user.id);
        setCurrentEmail(user.email || "");
        setCreatedAt(user.created_at || "");

        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile) {
          setFirstName(profile.first_name || "");
          setLastName(profile.last_name || "");
          setUsername(profile.username || "");
          setPhoneNumber(profile.phone_number || "");
          setIsVerifiedSeller(profile.is_verified_seller || false);
        } else {
          const meta = user.user_metadata || {};
          setFirstName(meta.first_name || "");
          setLastName(meta.last_name || "");
          setUsername(meta.username || user.email?.split("@")[0] || "");
          setPhoneNumber(meta.phone_number || "");
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUserData();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess("");
    setProfileError("");

    const normPhone = normalizePhoneNumber(phoneNumber);
    if (phoneNumber && !normPhone.isValid) {
      setProfileError("Please enter a valid phone number (e.g. 0794400365 or +254794400365).");
      setSavingProfile(false);
      return;
    }

    try {
      const supabase = createClient();
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, "");

      const { error: upsertErr } = await supabase.from("profiles").upsert({
        id: userId,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: cleanUsername,
        phone_number: normPhone.isValid ? normPhone.international : phoneNumber,
        country: "KEN",
      });

      if (upsertErr) {
        throw new Error(upsertErr.message);
      }

      setProfileSuccess("Personal details updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Failed to save profile changes.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || newEmail.trim() === currentEmail) {
      setEmailError("Please enter a different email address.");
      return;
    }

    setUpdatingEmail(true);
    setEmailSuccess("");
    setEmailError("");

    try {
      const supabase = createClient();
      const { error: emailErr } = await supabase.auth.updateUser(
        { email: newEmail.trim() },
        { emailRedirectTo: "https://www.efootballmarket.co.ke/auth/callback?redirect=/profile" }
      );

      if (emailErr) {
        throw new Error(emailErr.message);
      }

      setEmailSuccess(
        `Verification email sent to ${newEmail.trim()}. Please enter the verification token received in your new inbox to complete the update.`
      );
      setNewEmail("");
    } catch (err: any) {
      setEmailError(err.message || "Could not update email address. Please try again.");
    } finally {
      setUpdatingEmail(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    setUpdatingPassword(true);
    setPasswordSuccess("");
    setPasswordError("");

    try {
      const supabase = createClient();
      const { error: passErr } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (passErr) {
        throw new Error(passErr.message);
      }

      setPasswordSuccess("Your password was updated successfully. Your account is secured.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs">Loading profile settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-pitch-border/60 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display flex items-center gap-2.5">
            <User className="w-7 h-7 text-brand-400" />
            <span>Profile &amp; Account Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage your personal credentials, contact numbers, email, and security safeguards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/buyer">
            <Button variant="secondary" size="sm" className="text-xs">
              Buyer Hub
            </Button>
          </Link>
          <Link href="/dashboard/seller">
            <Button variant="secondary" size="sm" className="text-xs">
              Seller Hub
            </Button>
          </Link>
        </div>
      </div>

      {/* Trust & Account Status Card */}
      <div className="p-5 rounded-2xl bg-pitch-card border border-pitch-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Escrow Trading Status</span>
              {isVerifiedSeller ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Seller
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  Verified Buyer
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Account Protected under KDPA institutional escrow rules
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 sm:text-right shrink-0">
          <p>
            Member since:{" "}
            <strong className="text-slate-200">
              {createdAt ? new Date(createdAt).toLocaleDateString() : "Active"}
            </strong>
          </p>
          <p className="font-mono text-[11px] text-slate-500 mt-0.5">UID: {userId.slice(0, 13)}...</p>
        </div>
      </div>

      {/* Grid: Personal Info & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Personal Details */}
        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pitch-border/60 pb-3">
            <User className="w-5 h-5 text-brand-400" />
            <h2 className="text-base font-bold text-white font-display">Personal Details</h2>
          </div>

          {profileError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{profileSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Username"
              placeholder="e.g. pesmaster254"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              helperText="Lowercase letters, numbers, and underscores only"
              required
            />

            <Input
              label="Phone Number (M-Pesa Payouts & WhatsApp Alerts)"
              type="tel"
              placeholder="0794400365 or +254794400365"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-emerald-400" />}
              helperText="Used for automated Lipa Na M-Pesa escrow transfers"
            />

            <Button type="submit" variant="primary" size="md" className="w-full font-bold" isLoading={savingProfile}>
              <Save className="w-4 h-4 mr-2" />
              Save Details
            </Button>
          </form>
        </div>

        {/* Card 2: Email Management (Gmail) */}
        <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-5">
          <div className="flex items-center gap-2.5 border-b border-pitch-border/60 pb-3">
            <Mail className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white font-display">Email Address</h2>
          </div>

          <div className="p-3.5 rounded-xl bg-pitch-card border border-pitch-border/80">
            <span className="text-[11px] text-slate-400 block">Current Active Email:</span>
            <div className="flex items-center gap-2 mt-1">
              <strong className="text-white text-sm font-mono truncate">{currentEmail}</strong>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded font-bold shrink-0">
                Verified
              </span>
            </div>
          </div>

          {emailError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{emailError}</span>
            </div>
          )}

          {emailSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{emailSuccess}</span>
            </div>
          )}

          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <Input
              label="New Email Address"
              type="email"
              inputMode="email"
              placeholder="newaddress@domain.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              helperText="A confirmation code will be dispatched to this new address"
              required
            />

            <Button type="submit" variant="secondary" size="md" className="w-full font-bold" isLoading={updatingEmail}>
              <Mail className="w-4 h-4 mr-2" />
              Update Email Address
            </Button>
          </form>
        </div>
      </div>

      {/* Card 3: Password & Security Safeguards */}
      <div className="p-6 rounded-2xl bg-pitch-surface border border-pitch-border space-y-5">
        <div className="flex items-center gap-2.5 border-b border-pitch-border/60 pb-3">
          <Lock className="w-5 h-5 text-rose-400" />
          <h2 className="text-base font-bold text-white font-display">Change Password</h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          If you suspect unauthorized access or feel your password might be compromised, update it immediately. Updating your password will protect your account and all active escrow transactions.
        </p>

        {passwordError && (
          <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
          <Input
            label="New Password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirm New Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Button type="submit" variant="primary" size="md" className="font-bold" isLoading={updatingPassword}>
            <KeyRound className="w-4 h-4 mr-2" />
            Update Password
          </Button>
        </form>
      </div>

      {/* Card 4: Invite & Referral Hub */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-pitch-surface border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 font-bold text-sm">
            <Users className="w-4 h-4" />
            <span>Invite Friends &amp; Traders</span>
          </div>
          <p className="text-xs text-slate-300">
            Share your personal referral link to help friends trade safely with Safaricom Till 1572931 escrow.
          </p>
        </div>
        <Link href="/invite" className="shrink-0 w-full sm:w-auto">
          <Button variant="primary" size="md" className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs">
            Open Invite Hub
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400 text-sm">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
