import { Link } from "react-router-dom";
import { CheckCircle2, MailCheck } from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";

export default function VerifyEmailPage() {
  return (
    <PageWrapper className="py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
        <div className="drac-panel p-8">
          <div className="mb-6 inline-flex rounded-full border border-drac-border bg-drac-surface2 p-4 text-drac-gold">
            <MailCheck className="h-8 w-8" />
          </div>
          <p className="section-kicker">Verification</p>
          <h1 className="mt-3 font-heading text-5xl tracking-[0.18em] text-drac-gold">
            Check Your Inbox
          </h1>
          <p className="mt-4 max-w-md text-sm leading-7 text-drac-muted">
            DracNest’s backend does not expose a live email verification endpoint yet,
            so this screen is ready as branded UI and messaging for when that flow lands.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button type="button" className="btn-secondary">
              Resend Verification
            </button>
            <Link to="/login" className="btn-primary">
              Back to Login
            </Link>
          </div>
        </div>

        <div className="drac-elevated p-8">
          <div className="mb-6 inline-flex rounded-full border border-drac-border bg-drac-bg/60 p-4 text-drac-green">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-heading text-4xl tracking-[0.18em] text-drac-text">
            Success State Ready
          </h2>
          <p className="mt-4 text-sm leading-7 text-drac-muted">
            Once backend verification is implemented, this page can switch to a confirmed
            state and unlock checkout messaging instantly without another visual redesign.
          </p>
          <div className="mt-6 rounded-2xl border border-drac-border bg-drac-surface p-5 text-sm text-drac-muted">
            Email verified! You can now checkout.
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
