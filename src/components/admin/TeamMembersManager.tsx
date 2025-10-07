import { useState } from 'react';
import { Shield, Crown, Users as UsersIcon, MoreVertical, Trash2, Edit, Mail } from 'lucide-react';
import { UserRole, canManageAdmins, UserPermissions } from '../../types/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface TeamMembersManagerProps {
  userRole: UserRole;
  userEmail: string;
}

// Mock team members data
const mockTeamMembers: UserPermissions[] = [
  {
    userId: '1',
    email: 'admin@ktirio.ai',
    role: UserRole.OWNER,
    grantedBy: 'system',
    grantedAt: new Date('2023-01-01'),
  },
  {
    userId: '2',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
    grantedBy: 'admin@ktirio.ai',
    grantedAt: new Date('2024-02-15'),
  },
  {
    userId: '3',
    email: 'colaborador@example.com',
    role: UserRole.COLLABORATOR,
    grantedBy: 'admin@ktirio.ai',
    grantedAt: new Date('2024-03-20'),
  },
];

export default function TeamMembersManager({ userRole, userEmail }: TeamMembersManagerProps) {
  const [teamMembers] = useState<UserPermissions[]>(mockTeamMembers);
  const [selectedMember, setSelectedMember] = useState<UserPermissions | null>(null);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

  const canManage = canManageAdmins(userRole);

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.OWNER:
        return Crown;
      case UserRole.ADMIN:
        return Shield;
      case UserRole.COLLABORATOR:
        return UsersIcon;
      default:
        return UsersIcon;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const badges = {
      owner: { label: 'Owner', className: 'bg-red-500 text-white' },
      admin: { label: 'Admin', className: 'bg-orange-500 text-white' },
      collaborator: { label: 'Collaborator', className: 'bg-blue-500 text-white' },
      user: { label: 'User', className: 'bg-gray-500 text-white' },
    };
    return badges[role];
  };

  const getRoleDescription = (role: UserRole) => {
    const descriptions = {
      owner: 'Acesso total ao sistema, incluindo gerenciamento de equipe',
      admin: 'Gerenciar usuários, cupons e trial links',
      collaborator: 'Visualizar dashboards e criar cupons/links',
      user: 'Sem permissões administrativas',
    };
    return descriptions[role];
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleRemoveMember = () => {
    console.log('Removing team member:', selectedMember?.email);
    // TODO: Implement remove team member logic
    setIsRemoveModalOpen(false);
    setSelectedMember(null);
  };

  const handleResendInvite = (email: string) => {
    console.log('Resending invite to:', email);
    // TODO: Implement resend invite logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-foreground">Equipe Ktirio</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Membros da equipe com permissões administrativas ({teamMembers.length} membros)
        </p>
      </div>

      {/* Team Members List */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="divide-y divide-black/[0.06]">
          {teamMembers.map((member) => {
            const RoleIcon = getRoleIcon(member.role);
            const roleBadge = getRoleBadge(member.role);
            const isCurrentUser = member.email === userEmail;
            const isOwner = member.role === UserRole.OWNER;

            return (
              <div 
                key={member.userId}
                className="p-6 hover:bg-[#FAFAFA] transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar with Role Icon */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#030213] to-[#252525] flex items-center justify-center text-white">
                      {member.email.charAt(0).toUpperCase()}
                    </div>
                    <div 
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                        member.role === UserRole.OWNER 
                          ? 'bg-red-500' 
                          : member.role === UserRole.ADMIN 
                          ? 'bg-orange-500' 
                          : 'bg-blue-500'
                      }`}
                    >
                      <RoleIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-foreground truncate">
                        {member.email}
                      </h4>
                      {isCurrentUser && (
                        <Badge className="bg-green-100 text-green-700">Você</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={roleBadge.className}>{roleBadge.label}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {getRoleDescription(member.role)}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Adicionado em {formatDate(member.grantedAt)}</span>
                      {member.grantedBy !== 'system' && (
                        <span>por {member.grantedBy}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    {canManage && !isOwner && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Alterar permissões
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResendInvite(member.email)}>
                            <Mail className="w-4 h-4 mr-2" />
                            Reenviar convite
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setIsRemoveModalOpen(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remover da equipe
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Permission Levels Info */}
      <div className="bg-[#FAFAFA] rounded-2xl border border-black/[0.06] p-6">
        <h4 className="text-foreground mb-4">Níveis de Permissão</h4>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <Crown className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Owner</p>
              <p className="text-xs text-muted-foreground">
                Acesso total ao sistema, pode adicionar/remover admins e colaboradores, acessar dados financeiros
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Admin</p>
              <p className="text-xs text-muted-foreground">
                Gerenciar usuários (editar, alterar plano, adicionar créditos), criar/editar cupons e trial links
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <UsersIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-foreground mb-1">Collaborator</p>
              <p className="text-xs text-muted-foreground">
                Visualizar dashboards e métricas, criar cupons e trial links (não pode editar existentes)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Member Confirmation Modal */}
      <Dialog open={isRemoveModalOpen} onOpenChange={setIsRemoveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover da Equipe</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover <strong>{selectedMember?.email}</strong> da equipe Ktirio?
              Esta ação removerá todas as permissões administrativas deste usuário.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRemoveMember}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
