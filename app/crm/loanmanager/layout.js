// app/crm/loanmanager/layout.js  (SERVER component)
import Sidebar from '../../../components/crm/Sidebar';
import Topbar from '../../../components/crm/Topbar';
import RequireAuth from '../../../components/crm/RequireAuth'; // CLIENT component is fine to render here

export default function CRMLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      <RequireAuth />
      <div className="mx-auto max-w-7xl flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="p-4 md:p-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}