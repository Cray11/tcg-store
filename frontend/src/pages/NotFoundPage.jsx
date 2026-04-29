import { Link } from "react-router-dom";
import PageWrapper from "../components/layout/PageWrapper";

export default function NotFoundPage() {
  return (
    <PageWrapper className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="drac-panel max-w-2xl p-10 text-center">
        <p className="font-heading text-8xl tracking-[0.2em] text-drac-gold/30">404</p>
        <h1 className="mt-3 font-heading text-5xl tracking-[0.18em] text-drac-gold">
          Page Not Found
        </h1>
        <p className="mt-4 text-sm leading-7 text-drac-muted">
          Looks like this card doesn&apos;t exist in our collection.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to Home
        </Link>
      </div>
    </PageWrapper>
  );
}
