'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/crm/loanmanager', label: 'Dashboard' },
  { href: '/crm/loanmanager/leads', label: 'Leads' },
  { href: '/crm/loanmanager/kanban', label: 'Kanban' },
  { href: '/crm/loanmanager/followups', label: 'Follow-ups' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full md:w-64 border-r bg-white">
      <div className="p-5 text-xl font-semibold tracking-tight">StudySahara CRM</div>
      <nav className="px-4 pb-4 space-y-2">
        {items.map((i) => {
          const active = pathname === i.href;
          return (
            <Link
              key={i.href}
              href={i.href}
              className={[
                "block rounded-lg text-sm px-3 py-2 border transition",
                active
                  ? "bg-gray-900 text-white border-gray-900 shadow-sm"
                  : "bg-white hover:bg-gray-50 border-gray-300"
              ].join(" ")}
            >
              {i.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}