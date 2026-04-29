import { Link } from "react-router-dom";

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-drac-bg px-4 py-10">
      <div className="scene-particles absolute inset-0 opacity-40">
        {Array.from({ length: 7 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
        <div className="drac-panel w-full p-8">
          <Link to="/" className="block text-center">
            <img
              src="/DracNest-PNG.png"
              alt="DracNest"
              className="mx-auto mb-6 h-auto w-48 object-contain"
            />
          </Link>
          <p className="section-kicker text-center">DracNest Access</p>
          <h1 className="mt-2 text-center font-heading text-5xl tracking-[0.16em] text-drac-gold">
            {title}
          </h1>
          <p className="mt-3 text-center text-sm leading-7 text-drac-muted">
            {subtitle}
          </p>
          <div className="mt-8">{children}</div>
          {footer ? <div className="mt-6 text-center text-sm text-drac-muted">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
