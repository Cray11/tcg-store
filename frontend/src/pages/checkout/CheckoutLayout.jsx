import PageWrapper from "../../components/layout/PageWrapper";
import CheckoutStepper from "../../components/checkout/CheckoutStepper";

export default function CheckoutLayout({
  currentStep,
  title,
  subtitle,
  children,
}) {
  return (
    <PageWrapper>
      <div className="mb-8">
        <p className="section-kicker">Checkout</p>
        <h1 className="mt-2 font-heading text-5xl tracking-[0.16em] text-drac-gold">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-7 text-drac-muted">{subtitle}</p>
      </div>
      <CheckoutStepper currentStep={currentStep} />
      {children}
    </PageWrapper>
  );
}
