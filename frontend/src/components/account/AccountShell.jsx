import PageWrapper from "../layout/PageWrapper";
import AccountSidebar from "./AccountSidebar";

export default function AccountShell({ title, description, children }) {
  return (
    <PageWrapper>
      <div className="mb-8">
        <p className="section-kicker">Account</p>
        <h1 className="mt-2 font-heading text-5xl tracking-[0.16em] text-drac-gold">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-7 text-drac-muted">{description}</p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AccountSidebar />
        <section className="space-y-6">{children}</section>
      </div>
    </PageWrapper>
  );
}
