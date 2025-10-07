import { useState } from 'react';
import { Plus, MoreVertical, Copy, Edit, Eye, Trash2, Check } from 'lucide-react';
import { UserRole, canEditCoupons, Coupon } from '../../types/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

interface AdminCouponsManagerProps {
  userRole: UserRole;
  userEmail: string;
}

// Mock coupons data
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'LAUNCH50',
    type: 'percentage',
    value: 50,
    maxUses: 100,
    currentUses: 47,
    validUntil: new Date('2024-12-31'),
    isActive: true,
    applicablePlans: ['professional', 'business'],
    createdBy: 'admin@ktirio.ai',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    code: 'WELCOME20',
    type: 'fixed',
    value: 20,
    maxUses: -1, // unlimited
    currentUses: 234,
    validUntil: new Date('2024-12-31'),
    isActive: true,
    applicablePlans: ['professional'],
    createdBy: 'admin@ktirio.ai',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: '3',
    code: 'TRIAL30',
    type: 'trial_extension',
    value: 30,
    maxUses: 50,
    currentUses: 12,
    validUntil: new Date('2024-06-30'),
    isActive: true,
    applicablePlans: [],
    createdBy: 'admin@example.com',
    createdAt: new Date('2024-03-01'),
  },
  {
    id: '4',
    code: 'CREDITS100',
    type: 'credits',
    value: 100,
    maxUses: 200,
    currentUses: 89,
    validUntil: new Date('2024-12-31'),
    isActive: true,
    applicablePlans: [],
    createdBy: 'admin@ktirio.ai',
    createdAt: new Date('2024-03-15'),
  },
];

export default function AdminCouponsManager({ userRole, userEmail }: AdminCouponsManagerProps) {
  const [coupons] = useState<Coupon[]>(mockCoupons);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  // Form state
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed' | 'trial_extension' | 'credits',
    value: 0,
    maxUses: -1,
    validUntil: '',
    applicablePlans: [] as string[],
  });

  const canEdit = canEditCoupons(userRole);
  const canCreate = userRole !== UserRole.USER;

  const getCouponTypeBadge = (type: string) => {
    const badges = {
      percentage: { label: '% Desconto', className: 'bg-blue-100 text-blue-700' },
      fixed: { label: 'Valor Fixo', className: 'bg-green-100 text-green-700' },
      trial_extension: { label: 'Trial +', className: 'bg-purple-100 text-purple-700' },
      credits: { label: 'Créditos', className: 'bg-orange-100 text-orange-700' },
    };
    return badges[type as keyof typeof badges] || badges.percentage;
  };

  const getCouponValue = (coupon: Coupon) => {
    switch (coupon.type) {
      case 'percentage':
        return `${coupon.value}% OFF`;
      case 'fixed':
        return `R$ ${coupon.value} OFF`;
      case 'trial_extension':
        return `+${coupon.value} dias`;
      case 'credits':
        return `+${coupon.value} créditos`;
      default:
        return coupon.value;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleCreateCoupon = () => {
    console.log('Creating coupon:', newCoupon);
    // TODO: Implement create coupon logic
    setIsCreateModalOpen(false);
    setNewCoupon({
      code: '',
      type: 'percentage',
      value: 0,
      maxUses: -1,
      validUntil: '',
      applicablePlans: [],
    });
  };

  const isExpired = (date: Date) => {
    return date < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground">Gerenciamento de Cupons</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {coupons.length} cupons criados
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#030213] hover:bg-[#252525] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Cupom
          </Button>
        )}
      </div>

      {/* Coupons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {coupons.map((coupon) => {
          const typeBadge = getCouponTypeBadge(coupon.type);
          const expired = isExpired(coupon.validUntil);
          const usagePercent = coupon.maxUses > 0 
            ? (coupon.currentUses / coupon.maxUses) * 100 
            : 0;

          return (
            <div 
              key={coupon.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-foreground">{coupon.code}</h4>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Copiar código"
                    >
                      {copiedCode === coupon.code ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={typeBadge.className}>{typeBadge.label}</Badge>
                    {expired ? (
                      <Badge className="bg-red-100 text-red-700">Expirado</Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleCopyCoupon(coupon.code)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar código
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      Ver usos
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {canEdit && (
                      <DropdownMenuItem className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Value */}
              <div className="mb-4">
                <p className="text-2xl text-foreground">
                  {getCouponValue(coupon)}
                </p>
              </div>

              {/* Usage Stats */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Usos</span>
                  <span className="text-foreground">
                    {coupon.currentUses} {coupon.maxUses > 0 ? `/ ${coupon.maxUses}` : '(ilimitado)'}
                  </span>
                </div>
                {coupon.maxUses > 0 && (
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#030213] transition-all"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-black/[0.06]">
                <span>Válido até {formatDate(coupon.validUntil)}</span>
                {coupon.applicablePlans.length > 0 && (
                  <span>{coupon.applicablePlans.join(', ')}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Coupon Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Cupom</DialogTitle>
            <DialogDescription>
              Configure os detalhes do cupom de desconto
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Coupon Code */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Código do Cupom</label>
                <Input
                  placeholder="Ex: LAUNCH50"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-muted-foreground">Use letras maiúsculas e números</p>
              </div>

              {/* Type */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Tipo de Benefício</label>
                <Select 
                  value={newCoupon.type} 
                  onValueChange={(value) => setNewCoupon({ 
                    ...newCoupon, 
                    type: value as typeof newCoupon.type 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Desconto %</SelectItem>
                    <SelectItem value="fixed">Desconto Fixo (R$)</SelectItem>
                    <SelectItem value="trial_extension">Trial Estendido (dias)</SelectItem>
                    <SelectItem value="credits">Créditos Bônus</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Value */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Valor</label>
                <Input
                  type="number"
                  placeholder={newCoupon.type === 'percentage' ? '50' : '100'}
                  value={newCoupon.value || ''}
                  onChange={(e) => setNewCoupon({ ...newCoupon, value: parseInt(e.target.value) || 0 })}
                />
                <p className="text-xs text-muted-foreground">
                  {newCoupon.type === 'percentage' && 'Porcentagem de desconto (0-100)'}
                  {newCoupon.type === 'fixed' && 'Valor em R$ de desconto'}
                  {newCoupon.type === 'trial_extension' && 'Dias adicionais de trial'}
                  {newCoupon.type === 'credits' && 'Quantidade de créditos'}
                </p>
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Limite de Usos</label>
                <Input
                  type="number"
                  placeholder="-1 para ilimitado"
                  value={newCoupon.maxUses}
                  onChange={(e) => setNewCoupon({ ...newCoupon, maxUses: parseInt(e.target.value) || -1 })}
                />
                <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
              </div>

              {/* Valid Until */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-foreground">Válido Até</label>
                <Input
                  type="date"
                  value={newCoupon.validUntil}
                  onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                />
              </div>

              {/* Applicable Plans */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-foreground">Planos Aplicáveis (opcional)</label>
                <p className="text-xs text-muted-foreground">
                  Deixe vazio para aplicar a todos os planos
                </p>
                <div className="flex gap-2 flex-wrap">
                  {['professional', 'business'].map((plan) => (
                    <button
                      key={plan}
                      onClick={() => {
                        const plans = newCoupon.applicablePlans.includes(plan)
                          ? newCoupon.applicablePlans.filter(p => p !== plan)
                          : [...newCoupon.applicablePlans, plan];
                        setNewCoupon({ ...newCoupon, applicablePlans: plans });
                      }}
                      className={`px-3 py-1.5 rounded-lg border transition-colors ${
                        newCoupon.applicablePlans.includes(plan)
                          ? 'bg-[#030213] text-white border-[#030213]'
                          : 'bg-white text-foreground border-black/[0.06] hover:border-[#030213]'
                      }`}
                    >
                      {plan.charAt(0).toUpperCase() + plan.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateCoupon}
              className="bg-[#030213] hover:bg-[#252525]"
              disabled={!newCoupon.code || !newCoupon.value}
            >
              Criar Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
