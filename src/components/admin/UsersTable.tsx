import { useState } from "react";
import {
  Search,
  MoreVertical,
  UserPlus,
  Edit,
  CreditCard,
  RefreshCw,
  Activity,
  Shield,
  Ban,
  Trash2,
} from "lucide-react";
import {
  UserRole,
  canManageUsers,
  canManageAdmins,
  canDeleteUsers,
  AdminUser,
} from "@/types/roles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface AdminUsersTableProps {
  userRole: UserRole;
  userEmail: string;
}

// Mock users data
const mockUsers: AdminUser[] = [
  {
    id: "1",
    email: "joao.silva@exemplo.com",
    name: "João Silva",
    plan: "professional",
    credits: 245,
    createdAt: new Date("2024-01-15"),
    lastAccess: new Date("2024-04-07"),
    status: "active",
    totalImagesGenerated: 1240,
    totalCreditsUsed: 3520,
  },
  {
    id: "2",
    email: "maria.santos@exemplo.com",
    name: "Maria Santos",
    plan: "business",
    credits: 892,
    createdAt: new Date("2024-02-20"),
    lastAccess: new Date("2024-04-06"),
    status: "active",
    totalImagesGenerated: 3450,
    totalCreditsUsed: 8920,
  },
  {
    id: "3",
    email: "pedro.costa@exemplo.com",
    name: "Pedro Costa",
    plan: "free",
    credits: 3,
    createdAt: new Date("2024-03-10"),
    lastAccess: new Date("2024-04-05"),
    status: "active",
    totalImagesGenerated: 47,
    totalCreditsUsed: 122,
  },
  {
    id: "4",
    email: "ana.oliveira@exemplo.com",
    name: "Ana Oliveira",
    plan: "trial",
    credits: 15,
    createdAt: new Date("2024-04-01"),
    lastAccess: new Date("2024-04-07"),
    status: "trial",
    totalImagesGenerated: 12,
    totalCreditsUsed: 35,
  },
  {
    id: "5",
    email: "admin@example.com",
    name: "Carlos Admin",
    plan: "professional",
    credits: 500,
    createdAt: new Date("2023-12-01"),
    lastAccess: new Date("2024-04-07"),
    status: "active",
    role: UserRole.ADMIN,
    totalImagesGenerated: 5680,
    totalCreditsUsed: 15240,
  },
];

export default function AdminUsersTable({
  userRole,
  userEmail,
}: AdminUsersTableProps) {
  const [users] = useState<AdminUser[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [filterStatus, setFilterStatus] =
    useState<string>("all");
  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] =
    useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] =
    useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<UserRole>(
    UserRole.COLLABORATOR,
  );

  const canManage = canManageUsers(userRole);
  const canAddAdmins = canManageAdmins(userRole);
  const canDelete = canDeleteUsers(userRole);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesPlan =
      filterPlan === "all" || user.plan === filterPlan;
    const matchesStatus =
      filterStatus === "all" || user.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const getPlanBadge = (plan: string) => {
    const badges = {
      free: {
        label: "Free",
        className: "bg-gray-100 text-gray-700",
      },
      professional: {
        label: "Professional",
        className: "bg-blue-100 text-blue-700",
      },
      business: {
        label: "Business",
        className: "bg-purple-100 text-purple-700",
      },
      trial: {
        label: "Trial",
        className: "bg-yellow-100 text-yellow-700",
      },
    };
    return badges[plan as keyof typeof badges] || badges.free;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      active: {
        label: "Ativo",
        className: "bg-green-100 text-green-700",
      },
      inactive: {
        label: "Inativo",
        className: "bg-gray-100 text-gray-700",
      },
      trial: {
        label: "Trial",
        className: "bg-yellow-100 text-yellow-700",
      },
      suspended: {
        label: "Suspenso",
        className: "bg-red-100 text-red-700",
      },
    };
    return (
      badges[status as keyof typeof badges] || badges.active
    );
  };

  const getRoleBadge = (role?: UserRole) => {
    if (!role || role === UserRole.USER) return null;

    const badges = {
      owner: {
        label: "Owner",
        className: "bg-red-500 text-white",
      },
      admin: {
        label: "Admin",
        className: "bg-orange-500 text-white",
      },
      collaborator: {
        label: "Collaborator",
        className: "bg-blue-500 text-white",
      },
      user: null,
    };
    return badges[role];
  };

  const handleAddAdmin = () => {
    console.log("Adding admin:", newAdminEmail, newAdminRole);
    // TODO: Implement add admin logic
    setIsAddAdminModalOpen(false);
    setNewAdminEmail("");
    setNewAdminRole(UserRole.COLLABORATOR);
  };

  const handleDeleteUser = () => {
    console.log("Deleting user:", selectedUser?.email);
    // TODO: Implement delete user logic
    setIsDeleteConfirmOpen(false);
    setSelectedUser(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Admin Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground">
            Gerenciamento de Usuários
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {filteredUsers.length} de {users.length} usuários
          </p>
        </div>
        {canAddAdmins && (
          <Button
            onClick={() => setIsAddAdminModalOpen(true)}
            className="bg-[#030213] hover:bg-[#252525] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Adicionar Admin
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-black/[0.06] p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email ou nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter by Plan */}
          <Select
            value={filterPlan}
            onValueChange={setFilterPlan}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por plano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                Todos os planos
              </SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="professional">
                Professional
              </SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter by Status */}
          <Select
            value={filterStatus}
            onValueChange={setFilterStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                Todos os status
              </SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">
                Suspenso
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-black/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#FAFAFA] border-b border-black/[0.06]">
              <tr>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Usuário
                </th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Plano
                </th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Créditos
                </th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Cadastro
                </th>
                <th className="text-left px-6 py-4 text-sm text-muted-foreground">
                  Último Acesso
                </th>
                <th className="text-center px-6 py-4 text-sm text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.06]">
              {filteredUsers.map((user) => {
                const planBadge = getPlanBadge(user.plan);
                const statusBadge = getStatusBadge(user.status);
                const roleBadge = getRoleBadge(user.role);

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-[#FAFAFA] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#030213] to-[#252525] flex items-center justify-center text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm text-foreground">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Badge className={planBadge.className}>
                          {planBadge.label}
                        </Badge>
                        {roleBadge && (
                          <Badge
                            className={roleBadge.className}
                          >
                            {roleBadge.label}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-foreground">
                        {user.credits}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.lastAccess)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {canManage ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align="end"
                              className="w-56"
                            >
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsEditModalOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Editar usuário
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Alterar plano
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Adicionar créditos
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Activity className="w-4 h-4 mr-2" />
                                Ver histórico
                              </DropdownMenuItem>
                              {canAddAdmins && !user.role && (
                                <DropdownMenuItem>
                                  <Shield className="w-4 h-4 mr-2" />
                                  Tornar Admin
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspender conta
                              </DropdownMenuItem>
                              {canDelete && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setIsDeleteConfirmOpen(
                                      true,
                                    );
                                  }}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Deletar conta
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            -
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Admin Modal */}
      <Dialog
        open={isAddAdminModalOpen}
        onOpenChange={setIsAddAdminModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar Admin/Colaborador
            </DialogTitle>
            <DialogDescription>
              Conceda permissões administrativas para um usuário
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm text-foreground">
                Email do usuário
              </label>
              <Input
                type="email"
                placeholder="usuario@exemplo.com"
                value={newAdminEmail}
                onChange={(e) =>
                  setNewAdminEmail(e.target.value)
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-foreground">
                Permissão
              </label>
              <Select
                value={newAdminRole}
                onValueChange={(value) =>
                  setNewAdminRole(value as UserRole)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UserRole.ADMIN}>
                    Admin - Gerenciar tudo exceto outros admins
                  </SelectItem>
                  <SelectItem value={UserRole.COLLABORATOR}>
                    Colaborador - Apenas visualizar e criar
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddAdminModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddAdmin}
              className="bg-[#030213] hover:bg-[#252525]"
            >
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deletar Usuário</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar{" "}
              <strong>{selectedUser?.email}</strong>? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Deletar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}