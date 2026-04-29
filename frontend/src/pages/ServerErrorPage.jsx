import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";

export default function ServerErrorPage() {
  return (
    <PageWrapper className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="drac-panel max-w-2xl p-10 text-center">
        <p className="font-heading text-8xl tracking-[0.2em] text-drac-gold/30">500</p>
        <h1 className="mt-3 font-heading text-5xl tracking-[0.18em] text-drac-gold">
          Something Went Wrong
        </h1>
        <p className="mt-4 text-sm leading-7 text-drac-muted">
          The duel arena hit a snag on our side. Try again or head back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={() => window.location.reload()} className="btn-secondary">
            Try Again
          </button>
          <Link to="/" className="btn-primary">
            Home
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
