import { useState } from 'react';
import { Shield } from 'lucide-react';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import AdminDashboard from './admin/Dashboard';
import UsersTable from './admin/UsersTable';
import CouponsManager from './admin/CouponsManager';
import TrialLinksManager from './admin/TrialLinksManager';
import TeamMembersManager from './admin/TeamMembersManager';
import { UserRole } from '@/types/roles';

type AdminTab = 'dashboard' | 'users' | 'coupons' | 'trial-links' | 'team';

export default function SettingsAdmin() {
  const { user } = useFirebaseUser();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  // Check if user is admin or owner
  const userRole: UserRole = (user?.role as UserRole) || 'user';
  const isAdmin = userRole === 'admin' || userRole === 'owner';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Shield className="w-16 h-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-gray-600">
          Você não tem permissão para acessar esta página.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header com Tabs */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-2" style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-[#030213] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-[#030213] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Usuários
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'coupons'
                ? 'bg-[#030213] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Cupons
          </button>
          <button
            onClick={() => setActiveTab('trial-links')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'trial-links'
                ? 'bg-[#030213] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Links de Trial
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'team'
                ? 'bg-[#030213] text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Equipe
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'dashboard' && <AdminDashboard userRole={userRole} />}
        {activeTab === 'users' && <UsersTable userRole={userRole} userEmail={user?.email || ''} />}
        {activeTab === 'coupons' && <CouponsManager userRole={userRole} userEmail={user?.email || ''} />}
        {activeTab === 'trial-links' && <TrialLinksManager userRole={userRole} userEmail={user?.email || ''} />}
        {activeTab === 'team' && <TeamMembersManager userRole={userRole} userEmail={user?.email || ''} />}
      </div>
    </div>
  );
}
