import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Wallet } from "lucide-react";

const SAVING_GUIDES = [
  { to: "/guides/amazon-bin-stores", name: "Amazon Bin Stores" },
  { to: "/guides/costco-coupon-book", name: "Costco Coupon Book" },
  { to: "/guides/liquidation-stores", name: "Liquidation Stores" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.facebook.com/WalletWins2", name: "Facebook", Icon: Facebook },
  { href: "https://www.instagram.com/walletwins2/", name: "Instagram", Icon: Instagram },
] as const;

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-muted/40">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground">
              <Wallet className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-extrabold">
              Wallet<span className="text-primary">Wins</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            The best deals. Updated daily. Save more on the brands you love.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Follow Us</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {SOCIAL_LINKS.map(({ href, name, Icon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <Icon className="h-4 w-4" /> {name}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Saving Guides</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {SAVING_GUIDES.map((g) => (
              <li key={g.to}>
                <a href={g.to} className="hover:text-foreground">{g.name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide">Company</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/deals" className="hover:text-foreground">All Deals</Link></li>
            <li><Link to="/trust" className="hover:text-foreground">Trust & Privacy</Link></li>
            <li><Link to="/admin" className="hover:text-foreground">Dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wallet Wins. Prices and discounts shown are for demonstration.
      </div>
    </footer>
  );
}