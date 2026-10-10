import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="SixSevenLabs home">
        <span className="mark" aria-hidden="true" />
        <span>SixSevenLabs</span>
      </Link>
      <nav className="site-nav" aria-label="Primary">
        <Link href="/fitness">Fitness</Link>
        <Link href="/motorsports">Motorsports</Link>
        <Link href="/about">About</Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
