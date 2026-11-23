import { formatHeaderDate } from '../utils/format.js';
import { LogoIcon } from './icons.jsx';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <div className="brand">
          <LogoIcon className="brand-icon" />
          <span className="brand-name">Ledgerline</span>
        </div>
        <time className="mono header-date" dateTime={new Date().toISOString().slice(0, 10)}>
          {formatHeaderDate()}
        </time>
      </div>
    </header>
  );
}
