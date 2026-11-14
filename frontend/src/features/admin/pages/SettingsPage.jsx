import { useState } from "react";
import { Save, RotateCcw, Building2, Palette, SlidersHorizontal, Bell, GraduationCap, UserCog } from "lucide-react";
import PageHeader from "../shared/PageHeader.jsx";
import Tabs from "../shared/Tabs.jsx";
import Field from "../shared/Field.jsx";
import FileDrop from "../shared/FileDrop.jsx";
import TagInput from "../shared/TagInput.jsx";
import ConfirmDialog from "../shared/ConfirmDialog.jsx";
import { SkeletonRows, ErrorState } from "../shared/AsyncState.jsx";
import { useToast } from "../shared/ToastProvider.jsx";
import { settingsService } from "../../../services/settingsService.js";
import { useAsync } from "../../../hooks/useAsync.js";
import { useUnsavedChanges } from "../../../hooks/useUnsavedChanges.js";
import { readFileAsDataUrl, INLINE_LIMIT_BYTES } from "../../../utils/files.js";
import s from "../shared/adminUi.module.css";

const TABS = [
  { id: "identity", label: "Identity", icon: Building2 }, { id: "branding", label: "Branding", icon: Palette },
  { id: "admin", label: "Administration", icon: SlidersHorizontal }, { id: "notifications", label: "Notifications", icon: Bell },
  { id: "learning", label: "Learning", icon: GraduationCap }, { id: "account", label: "Account", icon: UserCog },
];

function Switch({ label, hint, checked, onChange }) {
  return (
    <label className={s.switchRow}>
      <span><strong style={{ fontSize: 14 }}>{label}</strong>{hint && <span className={s.hint} style={{ display: "block" }}>{hint}</span>}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function SettingsPage() {
  const { data, loading, error, reload } = useAsync(() => settingsService.get());
  const header = <PageHeader title="Platform settings" description="Configure how the platform looks and behaves. Sensitive configuration such as passwords and keys is never shown or edited here." />;
  if (loading || !data) return <main className="page-content">{header}{error ? <ErrorState error={error} onRetry={reload} /> : <SkeletonRows rows={8} />}</main>;
  return <SettingsEditor initial={data} header={header} />;
}

function SettingsEditor({ initial, header }) {
  const toast = useToast();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [tab, setTab] = useState("identity");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const dirty = JSON.stringify(form) !== saved;
  useUnsavedChanges(dirty);
  const update = (section, patch) => setForm((f) => ({ ...f, [section]: { ...f[section], ...patch } }));

  async function save() {
    const found = {};
    if (!form.identity.platformName.trim()) found.platformName = "Enter the platform name.";
    if (form.identity.supportEmail && !/^\S+@\S+\.\S+$/.test(form.identity.supportEmail)) found.supportEmail = "Enter a valid email address.";
    if (!(Number(form.learning.defaultPassMark) >= 1 && Number(form.learning.defaultPassMark) <= 100)) found.defaultPassMark = "Pass mark must be between 1 and 100.";
    setErrors(found);
    if (Object.keys(found).length) { setTab(found.defaultPassMark ? "learning" : "identity"); toast.error("Please fix the highlighted items first."); return; }
    setBusy(true);
    try {
      const next = { ...form, learning: { ...form.learning, defaultPassMark: Number(form.learning.defaultPassMark) }, admin: { ...form.admin, defaultPageSize: Number(form.admin.defaultPageSize) } };
      await settingsService.save(next);
      setForm(next); setSaved(JSON.stringify(next));
      toast.success("Settings saved.");
    } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  }

  async function onLogo(file) {
    if (!file.type.startsWith("image/")) return setErrors((e) => ({ ...e, logo: "Please choose an image file." }));
    if (file.size > INLINE_LIMIT_BYTES) return setErrors((e) => ({ ...e, logo: "Logo is too large for this demo. Use one under 600 KB." }));
    update("branding", { logoData: await readFileAsDataUrl(file) });
    setErrors((e) => ({ ...e, logo: undefined }));
  }

  const { identity, branding, admin, notifications, learning, account } = form;
  return (
    <main className="page-content">
      {header}
      <p className={s.noticeBox}>Settings are stored in this browser for the demo. Once the backend is connected they will be saved on the server and apply to everyone.</p>
      <Tabs tabs={TABS} active={tab} onChange={setTab} />
      <div className={s.card}>
        {tab === "identity" && <div className={`${s.formGrid} ${s.cols2}`}>
          <Field label="Platform name" required error={errors.platformName}>{(p) => <input {...p} maxLength={60} value={identity.platformName} onChange={(e) => update("identity", { platformName: e.target.value })} />}</Field>
          <Field label="Tagline">{(p) => <input {...p} maxLength={100} value={identity.tagline} onChange={(e) => update("identity", { tagline: e.target.value })} />}</Field>
          <Field label="Support email" error={errors.supportEmail} hint="Shown to learners on the help page.">{(p) => <input {...p} type="email" value={identity.supportEmail} onChange={(e) => update("identity", { supportEmail: e.target.value })} />}</Field>
          <Field label="Website">{(p) => <input {...p} type="url" placeholder="https://" value={identity.website} onChange={(e) => update("identity", { website: e.target.value })} />}</Field>
        </div>}

        {tab === "branding" && <div className={s.grid}>
          <div><span className={s.label}>Logo</span>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 6 }}>
              {branding.logoData ? <img src={branding.logoData} alt="Uploaded logo" style={{ maxHeight: 64, maxWidth: 200 }} /> : <span className={s.hint}>The JTAH logo is used until you upload another.</span>}
              <div style={{ flex: 1, minWidth: 220 }}><FileDrop accept="image/*" label="Choose logo" file={branding.logoData ? { fileName: "Custom logo" } : null} onFile={onLogo} onClear={() => update("branding", { logoData: "" })} />{errors.logo && <span className={s.error} role="alert">{errors.logo}</span>}</div>
            </div>
          </div>
          <Field label="Footer text">{(p) => <input {...p} maxLength={120} value={branding.footerText} onChange={(e) => update("branding", { footerText: e.target.value })} />}</Field>
          <div className={s.noticeBox} style={{ marginBottom: 0 }}>Brand colours (primary purple #5B3FA8, deep purple #2E1F5E, lavender #F3EEFB) are part of the JTAH identity and are managed by the design team, not editable here.</div>
        </div>}

        {tab === "admin" && <div>
          <Field label="Rows per page in admin tables">{(p) => <select {...p} value={admin.defaultPageSize} onChange={(e) => update("admin", { defaultPageSize: e.target.value })}>{[5, 8, 10, 20].map((n) => <option key={n}>{n}</option>)}</select>}</Field>
          <Switch label="Show sample analytics" hint="Shows clearly-labelled sample engagement charts until real tracking exists." checked={admin.showSampleAnalytics} onChange={(v) => update("admin", { showSampleAnalytics: v })} />
        </div>}

        {tab === "notifications" && <div>
          <p className={s.hint}>Choose which events should notify administrators. Email delivery starts once the backend is connected.</p>
          <Switch label="New learner registrations" checked={notifications.newRegistration} onChange={(v) => update("notifications", { newRegistration: v })} />
          <Switch label="Course completions" checked={notifications.courseCompleted} onChange={(v) => update("notifications", { courseCompleted: v })} />
          <Switch label="Assessment submissions" checked={notifications.assessmentSubmitted} onChange={(v) => update("notifications", { assessmentSubmitted: v })} />
          <Switch label="Weekly summary digest" checked={notifications.weeklyDigest} onChange={(v) => update("notifications", { weeklyDigest: v })} />
        </div>}

        {tab === "learning" && <div className={s.grid}>
          <div className={`${s.formGrid} ${s.cols2}`}>
            <Field label="Default assessment pass mark (%)" error={errors.defaultPassMark}>{(p) => <input {...p} type="number" min="1" max="100" value={learning.defaultPassMark} onChange={(e) => update("learning", { defaultPassMark: e.target.value })} />}</Field>
          </div>
          <Switch label="Allow learners to enrol themselves" hint="Saved now; enforced once enrolment runs on the backend." checked={learning.selfEnrolment} onChange={(v) => update("learning", { selfEnrolment: v })} />
          <Switch label="Issue certificates on completion" hint="Saved now; certificate issuing is a backend feature." checked={learning.certificatesEnabled} onChange={(v) => update("learning", { certificatesEnabled: v })} />
          <div><span className={s.label}>Course categories</span><TagInput label="Course categories" value={learning.categories} onChange={(categories) => update("learning", { categories })} /></div>
          <div><span className={s.label}>Material categories</span><TagInput label="Material categories" value={learning.materialCategories} onChange={(materialCategories) => update("learning", { materialCategories })} /></div>
        </div>}

        {tab === "account" && <div className={`${s.formGrid} ${s.cols2}`}>
          <Field label="Time zone">{(p) => <select {...p} value={account.timezone} onChange={(e) => update("account", { timezone: e.target.value })}>{["Africa/Lagos", "Africa/Accra", "Africa/Nairobi", "Europe/London", "UTC"].map((z) => <option key={z}>{z}</option>)}</select>}</Field>
          <Field label="Language">{(p) => <select {...p} value={account.language} onChange={(e) => update("account", { language: e.target.value })}><option>English</option></select>}</Field>
          <Field label="Date format">{(p) => <select {...p} value={account.dateFormat} onChange={(e) => update("account", { dateFormat: e.target.value })}><option>DD MMM YYYY</option><option>MM/DD/YYYY</option><option>YYYY-MM-DD</option></select>}</Field>
          <div className={s.span2}><div className={s.noticeBox} style={{ marginBottom: 0 }}>Password and sign-in security are managed by the authentication system once the backend is connected.</div></div>
          <div className={s.span2} style={{ borderTop: "1px solid var(--line)", paddingTop: 16 }}>
            <strong>Demo data</strong><p className={s.hint} style={{ margin: "4px 0 12px" }}>Restore every course, user, material and setting to the original demo content. Your changes in this browser will be lost.</p>
            <button type="button" className={`btn btn-danger ${s.btnInline}`} onClick={() => setConfirmReset(true)}><RotateCcw size={16} />Reset demo data</button>
          </div>
        </div>}
      </div>

      <div className={s.sticky}>
        <span className={s.sub}>{dirty ? "You have unsaved changes." : "All changes saved."}</span>
        <button type="button" className={`btn ${s.btnInline}`} disabled={busy || !dirty} onClick={save}><Save size={16} />{busy ? "Saving…" : "Save settings"}</button>
      </div>
      <ConfirmDialog open={confirmReset} title="Reset all demo data?" confirmLabel="Reset everything" message="This removes everything you added or changed in this browser, restores the original demo content, and signs you out."
        onCancel={() => setConfirmReset(false)} onConfirm={async () => { setConfirmReset(false); await settingsService.resetDemoData(); window.location.reload(); }} />
    </main>
  );
}
