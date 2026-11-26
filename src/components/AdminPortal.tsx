import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Download,
  FileUp,
  Lock,
  LogOut,
  Send,
  ShieldCheck,
} from 'lucide-react';
import {
  type PdfParseResult,
  parseRoutinePdf,
} from '../utils/pdfParser';

interface AdminPortalProps {
  onBackHome: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackHome }) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<PdfParseResult | null>(null);
  const [commitMessage, setCommitMessage] = useState(
    'chore: update agricultural science routine'
  );
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSignOut = () => {
    setIsAuthenticated(false);
    setPin('');
    setAuthError(null);
    setParseError(null);
    setParseResult(null);
    setPublishStatus(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    try {
      sessionStorage.removeItem('admin_pin');
      sessionStorage.removeItem('admin_auth');
      localStorage.removeItem('admin_pin');
      localStorage.removeItem('admin_auth');
    } catch {
      // ignore storage errors
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim() || verifying) return;

    setVerifying(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, verifyOnly: true }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setPin('');
        setAuthError('Incorrect Admin PIN. Please try again.');
      }
    } catch {
      setIsAuthenticated(false);
      setPin('');
      setAuthError('Incorrect Admin PIN. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setParseError(null);
    setPublishStatus(null);
    try {
      const result = await parseRoutinePdf(file);
      setParseResult(result);
      setCommitMessage(
        `chore: update routine ${result.routineData.semester} ${result.routineData.version}`
      );
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : 'Failed to parse PDF routine.'
      );
    } finally {
      setParsing(false);
    }
  };

  const handleDownloadJson = () => {
    if (!parseResult) return;
    const blob = new Blob(
      [JSON.stringify(parseResult.routineData, null, 2)],
      { type: 'application/json' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routine.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePublish = async () => {
    if (!parseResult) return;
    setPublishing(true);
    setPublishStatus(null);
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin,
          routineData: parseResult.routineData,
          commitMessage,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPublishStatus({
          ok: false,
          message: data.error || `Publish failed (${res.status})`,
        });
      } else {
        setPublishStatus({
          ok: true,
          message:
            data.message ||
            'Published! GitHub commit created and Vercel deployment triggered.',
        });
      }
    } catch (err) {
      setPublishStatus({
        ok: false,
        message:
          err instanceof Error
            ? err.message
            : 'Network error while calling /api/publish.',
      });
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBackHome}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] px-3 py-1.5 text-xs font-semibold text-[#15803D] dark:text-[#10B981]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Routine
        </button>

        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-1 text-[11px] font-bold text-[#15803D] dark:text-[#10B981]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Publisher
          </span>

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          )}
        </div>
      </div>

      {!isAuthenticated ? (
        <form
          onSubmit={handleUnlock}
          className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-[#15803D] dark:text-[#10B981]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                Department Admin Access
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
                Enter your Admin PIN to parse & publish routine PDFs.
              </p>
            </div>
          </div>

          {authError && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs font-medium text-red-600 dark:text-red-400">
              {authError}
            </div>
          )}

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter Admin PIN / Password"
            className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-slate-50 dark:bg-[#0E1012] px-3.5 py-2.5 text-sm font-medium text-[#0F172A] dark:text-[#F3F4F6] focus:outline-none focus:border-[#16A34A]"
            required
          />

          <button
            type="submit"
            disabled={verifying}
            className="w-full rounded-xl bg-[#15803D] dark:bg-[#16A34A] text-white py-2.5 text-xs font-bold hover:opacity-95 disabled:opacity-50 transition"
          >
            {verifying ? 'Verifying...' : 'Unlock Admin Portal'}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* PDF Upload Card */}
          <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F4F6]">
              1. Upload Department Routine PDF
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#9CA3AF]">
              Upload the official department routine PDF to automatically extract classes, rooms, and teacher schedules.
            </p>

            <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#CBD5E1] dark:border-[#23282E] bg-slate-50 dark:bg-[#0E1012] p-6 cursor-pointer hover:border-[#16A34A] transition">
              <FileUp className="w-7 h-7 text-[#15803D] dark:text-[#10B981]" />
              <span className="text-xs font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                {parsing ? 'Parsing PDF coordinates...' : 'Choose Routine PDF File'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {parseError && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600 dark:text-red-400">
                {parseError}
              </div>
            )}
          </section>

          {/* Verification Preview */}
          {parseResult && (
            <section className="rounded-2xl bg-white dark:bg-[#16191D] border border-[#E2E8F0] dark:border-[#23282E] p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                  2. Verification Preview
                </h2>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#15803D] dark:text-[#10B981]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Parsed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] p-2.5">
                  <span className="text-[10px] uppercase text-[#64748B] dark:text-[#9CA3AF]">
                    Semester & Version
                  </span>
                  <p className="font-bold text-[#0F172A] dark:text-[#F3F4F6]">
                    {parseResult.routineData.semester} •{' '}
                    {parseResult.routineData.version}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] p-2.5">
                  <span className="text-[10px] uppercase text-[#64748B] dark:text-[#9CA3AF]">
                    Effective Date
                  </span>
                  <p className="font-bold truncate text-[#0F172A] dark:text-[#F3F4F6]">
                    {parseResult.routineData.effective_date}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] p-2.5">
                  <span className="text-[10px] uppercase text-[#64748B] dark:text-[#9CA3AF]">
                    Total Classes
                  </span>
                  <p className="font-bold text-[#15803D] dark:text-[#10B981]">
                    {parseResult.routineData.classes.length}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 dark:bg-[#0E1012] border border-[#E2E8F0] dark:border-[#23282E] p-2.5">
                  <span className="text-[10px] uppercase text-[#64748B] dark:text-[#9CA3AF]">
                    Total Teachers
                  </span>
                  <p className="font-bold text-[#15803D] dark:text-[#10B981]">
                    {parseResult.routineData.teachers.length}
                  </p>
                </div>
              </div>

              {/* Sample Rows */}
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#9CA3AF]">
                  Sample Parsed Rows
                </p>
                <div className="max-h-44 overflow-y-auto rounded-xl border border-[#E2E8F0] dark:border-[#23282E] divide-y divide-[#E2E8F0] dark:divide-[#23282E] text-xs">
                  {parseResult.routineData.classes.slice(0, 8).map((c) => (
                    <div key={c.id} className="p-2.5 flex justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold truncate text-[#0F172A] dark:text-[#F3F4F6]">
                          {c.course_name}
                        </p>
                        <p className="text-[11px] text-[#64748B] dark:text-[#9CA3AF]">
                          {c.day} {c.slot} • {c.section_tag}
                          {c.lab_group ? ` (${c.lab_group})` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0 text-[11px]">
                        <p className="font-bold text-[#15803D] dark:text-[#10B981]">
                          {c.teacher_id}
                        </p>
                        <p className="text-[#64748B] dark:text-[#9CA3AF]">
                          {c.room}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unparsed Cells Flagged for Review */}
              {parseResult.unparsedCells.length > 0 && (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    {parseResult.unparsedCells.length} Unparsed Cell(s) Flagged
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-1.5 text-[11px]">
                    {parseResult.unparsedCells.map((u, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg bg-slate-50 dark:bg-[#0E1012] p-2 text-[#0F172A] dark:text-[#F3F4F6]"
                      >
                        <span className="font-bold">
                          {u.day} ({u.slot}):
                        </span>{' '}
                        {u.rawText}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commit Message + Actions */}
              <div className="space-y-2.5 pt-1">
                <input
                  type="text"
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="Commit message"
                  className="w-full rounded-xl border border-[#E2E8F0] dark:border-[#23282E] bg-slate-50 dark:bg-[#0E1012] px-3 py-2 text-xs font-medium text-[#0F172A] dark:text-[#F3F4F6] focus:outline-none focus:border-[#16A34A]"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDownloadJson}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#15803D] dark:border-[#10B981] text-[#15803D] dark:text-[#10B981] py-2.5 text-xs font-bold hover:bg-emerald-500/10 transition"
                  >
                    <Download className="w-4 h-4" />
                    Download JSON
                  </button>

                  <button
                    type="button"
                    disabled={publishing}
                    onClick={handlePublish}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#15803D] dark:bg-[#16A34A] text-white py-2.5 text-xs font-bold hover:opacity-95 disabled:opacity-50 transition"
                  >
                    <Send className="w-4 h-4" />
                    {publishing ? 'Publishing...' : 'Publish to Live Site'}
                  </button>
                </div>

                {publishStatus && (
                  <div
                    className={`rounded-xl p-3 text-xs font-medium border ${
                      publishStatus.ok
                        ? 'bg-emerald-500/10 text-[#15803D] dark:text-[#10B981] border-emerald-500/30'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    {publishStatus.message}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
