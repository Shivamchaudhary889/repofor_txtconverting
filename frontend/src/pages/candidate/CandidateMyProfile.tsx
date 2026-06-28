import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Building2,
  Briefcase,
  Award,
  GraduationCap,
  UserCog,
  Pencil,
  X,
  Check,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  LogOut,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAvatar, avatarInitials } from "@/lib/avatar";

const ME_DEFAULTS = {
  name: "Kishlay Kumar",
  email: "kishlay.kumar@hexaware.com",
  phone: "+91 98765 43210",
  location: "Chennai, IN",
  empId: "HX-EMP-12345",
  doj: "20 Mar 2025",
  cohort: "HX-JAVA-MUM-124",
  technology: "Java Full Stack",
  reportingTo: "Priyalatha Krishnakumar",
};

type ProfileForm = typeof ME_DEFAULTS;
type EditableKey = "name" | "email" | "phone" | "location";
type FieldErrors = Partial<Record<EditableKey, string>>;

// Only these fields are user-editable. Email is locked but kept in the type
// so the form shape stays consistent with the saved record.
const REQUIRED_FIELDS: EditableKey[] = ["name", "phone", "location"];

function validate(form: ProfileForm): FieldErrors {
  const errors: FieldErrors = {};

  for (const f of REQUIRED_FIELDS) {
    if (!String(form[f]).trim()) errors[f] = "This field is required.";
  }

  if (form.name.trim() && form.name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters.";
  }

  if (form.phone.trim()) {
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number (7–15 digits).";
    }
  }

  return errors;
}

const skills = [
  { name: "Java Core", level: 85 },
  { name: "Spring Boot", level: 72 },
  { name: "REST APIs", level: 78 },
  { name: "SQL", level: 80 },
  { name: "Git", level: 88 },
];

const certifications = [
  { id: 1, name: "Java Fundamentals — Internal", earned: "12 Apr 2026" },
  { id: 2, name: "OOP & Collections — Internal", earned: "16 Apr 2026" },
];

export default function CandidateMyProfile() {
  const { toast } = useToast();
  const [me, setMe] = useState<ProfileForm>(ME_DEFAULTS);
  const [draft, setDraft] = useState<ProfileForm>(ME_DEFAULTS);
  const [editing, setEditing] = useState(false);
  const [touched, setTouched] = useState<Partial<Record<EditableKey, boolean>>>(
    {},
  );

  useEffect(() => {
    document.title = "My Profile · Maverick";
  }, []);

  const errors = useMemo(
    () => (editing ? validate(draft) : {}),
    [draft, editing],
  );
  const hasErrors = Object.keys(errors).length > 0;

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
      setTouched({ name: true, phone: true, location: true });
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

  const setField = <K extends EditableKey>(key: K, value: ProfileForm[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const showError = (key: EditableKey) =>
    editing && touched[key] ? errors[key] : undefined;

  const view = editing ? draft : me;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          My Profile
        </h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">
          Personal info, skills, and certifications.
        </p>
      </div>

      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            {/* Avatar locked to saved name so editing the name field doesn't
                reroll the picture mid-edit. */}
            <Avatar className="h-20 w-20 bg-white border-2 border-border">
              <AvatarImage src={getAvatar(me.name)} />
              <AvatarFallback>{avatarInitials(me.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold">{me.name}</h2>
              <p className="text-sm text-muted-foreground">{me.empId}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge>{me.technology}</Badge>
                <Badge variant="outline">{me.cohort}</Badge>
              </div>
            </div>
            {!editing ? (
              <Button
                variant="outline"
                className="self-start sm:self-auto"
                onClick={startEdit}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit profile
              </Button>
            ) : (
              <div className="flex gap-2 self-start sm:self-auto">
                <Button variant="outline" onClick={cancelEdit}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={saveEdit}
                  disabled={hasErrors && Object.keys(touched).length > 0}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Save changes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Personal information
              {editing && (
                <Badge variant="outline" className="text-[10px]">
                  <UserCog className="h-3 w-3 mr-1" /> Editing
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              {editing
                ? "Update your details below. Fields marked * are required."
                : "Click Edit profile to update any field. Email is managed by HR and can't be changed here."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CandField
                id="name"
                label="Full name"
                required
                value={view.name}
                editing={editing}
                error={showError("name")}
                onChange={(v) => setField("name", v)}
                onBlur={() => setTouched((p) => ({ ...p, name: true }))}
              />
              <CandField
                id="email"
                label="Email"
                type="email"
                required
                value={view.email}
                editing={false}
                lockedHint="Managed by HR — contact your reporting manager to change it."
                onChange={() => {}}
              />
              <CandField
                id="phone"
                label="Phone"
                required
                value={view.phone}
                editing={editing}
                error={showError("phone")}
                onChange={(v) => setField("phone", v)}
                onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              />
              <CandField
                id="loc"
                label="Location"
                required
                value={view.location}
                editing={editing}
                error={showError("location")}
                onChange={(v) => setField("location", v)}
                onBlur={() => setTouched((p) => ({ ...p, location: true }))}
              />
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Info icon={Briefcase} label="Employee ID" value={me.empId} />
              <Info icon={Building2} label="Date of joining" value={me.doj} />
              <Info icon={GraduationCap} label="Cohort" value={me.cohort} />
              <Info icon={Mail} label="Reporting to" value={me.reportingTo} />
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

        <div className="space-y-6">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Skill levels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {skills.map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium">{s.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {s.level}%
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Award className="h-4 w-4 text-amber-500" />
                Certifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {certifications.map((c) => (
                <div
                  key={c.id}
                  className="p-2 rounded-md border border-border bg-card"
                >
                  <div className="text-sm font-medium">{c.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Earned {c.earned}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Info({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function CandField({
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
