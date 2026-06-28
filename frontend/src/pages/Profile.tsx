import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Building2,
  Briefcase,
  Calendar,
  ShieldCheck,
  Award,
  Activity as ActivityIcon,
  KeyRound,
  LogOut,
  Pencil,
  X,
  Check,
  UserCog,
  AlertCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvatar, avatarInitials } from "@/lib/avatar";
import { Link } from "wouter";

const profileStats = [
  { label: "Batches Managed", value: "47" },
  { label: "Active Trainers", value: "18" },
  { label: "Candidates Tracked", value: "1,240" },
  { label: "Reports Generated", value: "326" },
];

const recentActivity = [
  { action: "Approved batch HX-JAVA-MUM-124", time: "10 minutes ago" },
  { action: "Generated weekly attendance report", time: "1 hour ago" },
  { action: "Reassigned 4 candidates between batches", time: "3 hours ago" },
  { action: "Updated trainer mapping for Cloud Native track", time: "Yesterday" },
  { action: "Closed feedback window for HX-DATA-CHE-112", time: "Yesterday" },
  { action: "Onboarded 22 new candidates to Java Full Stack", time: "2 days ago" },
];

const certifications = [
  { name: "Hexaware Operations Lead — Level III", issued: "Apr 2024" },
  { name: "Internal Trainer Certification", issued: "Nov 2023" },
  { name: "Six Sigma Green Belt", issued: "Aug 2023" },
];

const ME_DEFAULTS = {
  name: "Anup Pal",
  title: "Operations Lead — Talent Engagement",
  email: "anup.pal@hexaware.com",
  phone: "+91 98765 43210",
  location: "Chennai, India",
  department: "Talent Transformation",
  bio: "Operations lead at Hexaware overseeing high-volume technical training programs across India and EMEA. Focused on candidate outcomes, trainer enablement, and reducing time-to-deploy across enterprise tracks.",
};

type ProfileForm = typeof ME_DEFAULTS;
type FieldErrors = Partial<Record<keyof ProfileForm, string>>;

// Required vs. optional fields. Bio + phone are optional, everything else required.
// Note: email is required in the data model but the field is locked (managed by
// HR/SSO), so it can't actually become invalid through the UI.
const REQUIRED_FIELDS: (keyof ProfileForm)[] = [
  "name",
  "title",
  "email",
  "location",
  "department",
];

function validate(form: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};

  for (const f of REQUIRED_FIELDS) {
    if (!form[f].trim()) errors[f] = "This field is required.";
  }

  if (form.name.trim() && form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (form.email.trim()) {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email.trim())) {
      errors.email = "Enter a valid work email address.";
    }
  }

  if (form.phone.trim()) {
    // Loose international phone check: digits, spaces, +, -, parens, min 7 digits.
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number (7–15 digits).";
    }
  }

  if (form.bio.length > 500) {
    errors.bio = "Bio must be 500 characters or fewer.";
  }

  return errors;
}

export default function Profile() {
  const { toast } = useToast();
  const [me, setMe] = useState<ProfileForm>(ME_DEFAULTS);
  const [draft, setDraft] = useState<ProfileForm>(ME_DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<keyof ProfileForm, boolean>>>({});

  useEffect(() => {
    document.title = "Profile · Maverick";
  }, []);

  const errors = useMemo(() => (editing ? validate(draft) : {}), [draft, editing]);
  const hasErrors = Object.keys(errors).length > 0;

  // The avatar is always rendered against the SAVED name (`me.name`), never the
  // in-flight `draft.name`. That way editing your display name doesn't reroll
  // the avatar — it only updates after you actually save.
  const view = editing ? draft : me;

  const startEdit = () => {
    setDraft(me);
    setTouched({});
    setEditing(true);
  };

  const cancelEdit = () => {
    setDraft(me);
    setTouched({});
    setEditing(false);
  };

  const saveEdit = () => {
    const errs = validate(draft);
    if (Object.keys(errs).length > 0) {
      // Mark every field touched so all errors show.
      setTouched({
        name: true,
        title: true,
        email: true,
        phone: true,
        location: true,
        department: true,
        bio: true,
      });
      toast({
        title: "Please fix the highlighted fields",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }
    setMe(draft);
    setEditing(false);
    setTouched({});
    toast({
      title: "Profile updated",
      description: "Your changes have been saved.",
    });
  };

  const setField = <K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const showError = (key: keyof ProfileForm) =>
    editing && touched[key] ? errors[key] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Your account information and recent activity.
          </p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={cancelEdit}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={saveEdit} disabled={hasErrors && Object.keys(touched).length > 0}>
                <Check className="h-4 w-4 mr-2" />
                Save changes
              </Button>
            </>
          ) : (
            <Button onClick={startEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="relative inline-block">
                {/* Avatar is locked to the saved name so editing the name field
                    doesn't change the picture mid-edit. */}
                <Avatar className="h-24 w-24 mx-auto border-4 border-background ring-2 ring-primary/30">
                  <AvatarImage src={getAvatar(me.name)} alt={me.name} />
                  <AvatarFallback>{avatarInitials(me.name)}</AvatarFallback>
                </Avatar>
              </div>
              <h2 className="mt-4 text-xl font-semibold">{view.name || me.name}</h2>
              <p className="text-sm text-muted-foreground">{view.title || me.title}</p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <Badge className="bg-primary/15 text-primary border-primary/30">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
                <Badge variant="outline">SSO Verified</Badge>
              </div>
              <Separator className="my-5" />
              <div className="space-y-2.5 text-sm text-left">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{view.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>{view.phone || "—"}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <MapPin className="h-4 w-4 shrink-0" />
                  <span>{view.location}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>{view.department}</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Calendar className="h-4 w-4 shrink-0" />
                  <span>Joined March 2022</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                asChild
              >
                <Link href="/settings">
                  <KeyRound className="h-4 w-4 mr-2 shrink-0" />
                  <span className="min-w-0">Change password</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-2 whitespace-normal text-left"
                asChild
              >
                <Link href="/settings">
                  <ShieldCheck className="h-4 w-4 mr-2 shrink-0" />
                  <span className="min-w-0">Two-factor auth</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start h-auto py-2 whitespace-normal text-left text-destructive hover:text-destructive"
                asChild
              >
                <Link href="/login">
                  <LogOut className="h-4 w-4 mr-2 shrink-0" />
                  <span className="min-w-0">Sign out</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                Personal details
                {editing && (
                  <Badge variant="outline" className="text-[10px]">
                    <UserCog className="h-3 w-3 mr-1" /> Editing
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {editing
                  ? "Update your information below. Fields marked * are required."
                  : "Your name, contact information, and role."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  id="name"
                  label="Full name"
                  required
                  value={view.name}
                  editing={editing}
                  error={showError("name")}
                  onChange={(v) => setField("name", v)}
                  onBlur={() => setTouched((p) => ({ ...p, name: true }))}
                />
                <Field
                  id="title"
                  label="Job title"
                  required
                  value={view.title}
                  editing={editing}
                  error={showError("title")}
                  onChange={(v) => setField("title", v)}
                  onBlur={() => setTouched((p) => ({ ...p, title: true }))}
                />
                <Field
                  id="email"
                  label="Work email"
                  type="email"
                  required
                  value={view.email}
                  editing={false}
                  lockedHint="Managed by SSO — contact IT to change."
                  onChange={() => {}}
                />
                <Field
                  id="phone"
                  label="Phone"
                  hint="Optional"
                  value={view.phone}
                  editing={editing}
                  error={showError("phone")}
                  onChange={(v) => setField("phone", v)}
                  onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
                />
                <Field
                  id="location"
                  label="Location"
                  required
                  value={view.location}
                  editing={editing}
                  error={showError("location")}
                  onChange={(v) => setField("location", v)}
                  onBlur={() => setTouched((p) => ({ ...p, location: true }))}
                />
                <Field
                  id="department"
                  label="Department"
                  required
                  value={view.department}
                  editing={editing}
                  error={showError("department")}
                  onChange={(v) => setField("department", v)}
                  onBlur={() => setTouched((p) => ({ ...p, department: true }))}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">
                    About <span className="text-muted-foreground text-xs ml-1">(Optional)</span>
                  </Label>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {view.bio.length}/500
                  </span>
                </div>
                <Textarea
                  id="bio"
                  rows={4}
                  value={view.bio}
                  disabled={!editing}
                  onChange={(e) => setField("bio", e.target.value)}
                  onBlur={() => setTouched((p) => ({ ...p, bio: true }))}
                  className={!editing ? "bg-muted" : ""}
                  aria-invalid={!!showError("bio")}
                />
                {showError("bio") && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {showError("bio")}
                  </p>
                )}
              </div>
              {editing && (
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button onClick={saveEdit}>Save changes</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {profileStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                  <div className="text-2xl font-bold font-mono mt-1">
                    {stat.value}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ActivityIcon className="h-4 w-4 text-primary" />
                  Recent activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivity.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-sm pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground/90">{item.action}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-4 w-4 text-primary" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {certifications.map((cert) => (
                  <div
                    key={cert.name}
                    className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0"
                  >
                    <div className="p-2 rounded-md bg-primary/10 text-primary shrink-0">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">{cert.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Issued {cert.issued}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Field({
  id,
  label,
  value,
  editing,
  required,
  hint,
  lockedHint,
  type = "text",
  error,
  onChange,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  editing: boolean;
  required?: boolean;
  hint?: string;
  lockedHint?: string;
  type?: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive ml-0.5">*</span>
        ) : hint ? (
          <span className="text-muted-foreground text-xs ml-1">({hint})</span>
        ) : null}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        disabled={!editing}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        className={`${!editing ? "bg-muted" : ""} ${
          error ? "border-destructive focus-visible:ring-destructive" : ""
        }`}
      />
      {lockedHint && (
        <p className="text-[11px] text-muted-foreground">{lockedHint}</p>
      )}
      {error && (
        <p className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}
