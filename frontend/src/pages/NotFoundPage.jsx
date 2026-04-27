import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-extrabold text-gray-100">404</p>
      <p className="text-5xl mb-4">🃏</p>
      <h1 className="text-2xl font-bold text-primary-700 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-6">
        Looks like this card doesn't exist in our collection.
      </p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}