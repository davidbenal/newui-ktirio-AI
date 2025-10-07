import { useState } from 'react';
import { Plus, MoreVertical, Copy, Edit, BarChart3, Trash2, Check, ExternalLink } from 'lucide-react';
import { UserRole, canEditCoupons, TrialLink } from '../../types/roles';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';

interface AdminTrialLinksManagerProps {
  userRole: UserRole;
  userEmail: string;
}

// Mock trial links data
const mockTrialLinks: TrialLink[] = [
  {
    id: '1',
    linkId: 'partner-abc123',
    name: 'Parceria Imobiliária ABC',
    trialDays: 30,
    initialCredits: 100,
    maxUses: 50,
    currentUses: 23,
    isActive: true,
    utmParams: {
      source: 'partner-abc',
      medium: 'referral',
      campaign: 'imobiliaria-2024',
    },
    createdBy: 'admin@ktirio.ai',
    createdAt: new Date('2024-03-01'),
    conversions: 18,
  },
  {
    id: '2',
    linkId: 'event-launch',
    name: 'Evento de Lançamento',
    trialDays: 14,
    initialCredits: 50,
    maxUses: -1, // unlimited
    currentUses: 145,
    isActive: true,
    utmParams: {
      source: 'event',
      medium: 'qrcode',
      campaign: 'launch-event',
    },
    createdBy: 'admin@ktirio.ai',
    createdAt: new Date('2024-02-15'),
    conversions: 89,
  },
  {
    id: '3',
    linkId: 'influencer-design',
    name: 'Influencer Design Pro',
    trialDays: 60,
    initialCredits: 200,
    maxUses: 100,
    currentUses: 67,
    isActive: true,
    utmParams: {
      source: 'influencer',
      medium: 'social',
      campaign: 'design-pro-q1',
    },
    createdBy: 'admin@example.com',
    createdAt: new Date('2024-01-10'),
    conversions: 45,
  },
];

export default function AdminTrialLinksManager({ userRole, userEmail }: AdminTrialLinksManagerProps) {
  const [trialLinks] = useState<TrialLink[]>(mockTrialLinks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  
  // Form state
  const [newLink, setNewLink] = useState({
    name: '',
    trialDays: 14,
    initialCredits: 50,
    maxUses: -1,
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
  });

  const canEdit = canEditCoupons(userRole);
  const canCreate = userRole !== UserRole.USER;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const generateLinkUrl = (linkId: string) => {
    return `https://ktirio.ai/trial/${linkId}`;
  };

  const handleCopyLink = (linkId: string) => {
    const url = generateLinkUrl(linkId);
    navigator.clipboard.writeText(url);
    setCopiedLink(linkId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateLink = () => {
    console.log('Creating trial link:', newLink);
    // TODO: Implement create trial link logic
    setIsCreateModalOpen(false);
    setNewLink({
      name: '',
      trialDays: 14,
      initialCredits: 50,
      maxUses: -1,
      utmSource: '',
      utmMedium: '',
      utmCampaign: '',
    });
  };

  const getConversionRate = (link: TrialLink) => {
    if (link.currentUses === 0) return 0;
    return ((link.conversions / link.currentUses) * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground">Links de Trial Especiais</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {trialLinks.length} links criados
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-[#030213] hover:bg-[#252525] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Trial Link
          </Button>
        )}
      </div>

      {/* Trial Links Grid */}
      <div className="grid grid-cols-1 gap-4">
        {trialLinks.map((link) => {
          const usagePercent = link.maxUses > 0 
            ? (link.currentUses / link.maxUses) * 100 
            : 0;
          const conversionRate = getConversionRate(link);
          const fullUrl = generateLinkUrl(link.linkId);

          return (
            <div 
              key={link.id}
              className="bg-white rounded-2xl border border-black/[0.06] p-6 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-foreground">{link.name}</h4>
                    {link.isActive ? (
                      <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Inativo</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-[#FAFAFA] px-2 py-1 rounded text-muted-foreground">
                      {fullUrl}
                    </code>
                    <button
                      onClick={() => handleCopyLink(link.linkId)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Copiar link"
                    >
                      {copiedLink === link.linkId ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => window.open(fullUrl, '_blank')}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                      title="Abrir link"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleCopyLink(link.linkId)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar link
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Ver analytics
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Trial</p>
                  <p className="text-foreground">{link.trialDays} dias</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Créditos</p>
                  <p className="text-foreground">{link.initialCredits}</p>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Acessos</p>
                  <p className="text-foreground">
                    {link.currentUses} {link.maxUses > 0 ? `/ ${link.maxUses}` : ''}
                  </p>
                </div>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Conversão</p>
                  <p className="text-foreground">{conversionRate}%</p>
                </div>
              </div>

              {/* Usage Progress */}
              {link.maxUses > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground">Limite de usos</span>
                    <span className="text-foreground">
                      {link.currentUses} / {link.maxUses}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#030213] transition-all"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* UTM Parameters */}
              <div className="pt-4 border-t border-black/[0.06]">
                <p className="text-xs text-muted-foreground mb-2">UTM Parameters</p>
                <div className="flex gap-2 flex-wrap">
                  <code className="text-xs bg-[#FAFAFA] px-2 py-1 rounded">
                    source={link.utmParams.source}
                  </code>
                  <code className="text-xs bg-[#FAFAFA] px-2 py-1 rounded">
                    medium={link.utmParams.medium}
                  </code>
                  <code className="text-xs bg-[#FAFAFA] px-2 py-1 rounded">
                    campaign={link.utmParams.campaign}
                  </code>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-4">
                <span>Criado em {formatDate(link.createdAt)}</span>
                <span>por {link.createdBy}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Trial Link Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Link de Trial Especial</DialogTitle>
            <DialogDescription>
              Configure um link personalizado para oferecer trials com benefícios especiais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-foreground">Nome Identificador</label>
                <Input
                  placeholder="Ex: Parceria Imobiliária XYZ"
                  value={newLink.name}
                  onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Nome interno para identificar o link
                </p>
              </div>

              {/* Trial Days */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Duração do Trial</label>
                <Select 
                  value={newLink.trialDays.toString()} 
                  onValueChange={(value) => setNewLink({ ...newLink, trialDays: parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="14">14 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Initial Credits */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Créditos Iniciais</label>
                <Input
                  type="number"
                  placeholder="50"
                  value={newLink.initialCredits || ''}
                  onChange={(e) => setNewLink({ ...newLink, initialCredits: parseInt(e.target.value) || 0 })}
                />
              </div>

              {/* Max Uses */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">Limite de Usos</label>
                <Input
                  type="number"
                  placeholder="-1 para ilimitado"
                  value={newLink.maxUses}
                  onChange={(e) => setNewLink({ ...newLink, maxUses: parseInt(e.target.value) || -1 })}
                />
                <p className="text-xs text-muted-foreground">Use -1 para ilimitado</p>
              </div>

              {/* UTM Source */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">UTM Source</label>
                <Input
                  placeholder="partner-name"
                  value={newLink.utmSource}
                  onChange={(e) => setNewLink({ ...newLink, utmSource: e.target.value })}
                />
              </div>

              {/* UTM Medium */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">UTM Medium</label>
                <Input
                  placeholder="referral"
                  value={newLink.utmMedium}
                  onChange={(e) => setNewLink({ ...newLink, utmMedium: e.target.value })}
                />
              </div>

              {/* UTM Campaign */}
              <div className="space-y-2">
                <label className="text-sm text-foreground">UTM Campaign</label>
                <Input
                  placeholder="campaign-name"
                  value={newLink.utmCampaign}
                  onChange={(e) => setNewLink({ ...newLink, utmCampaign: e.target.value })}
                />
              </div>

              {/* Preview */}
              <div className="space-y-2 col-span-2">
                <label className="text-sm text-foreground">Preview do Link</label>
                <div className="bg-[#FAFAFA] rounded-lg p-3">
                  <code className="text-xs text-muted-foreground break-all">
                    https://ktirio.ai/trial/{newLink.name.toLowerCase().replace(/\s+/g, '-') || 'link-id'}
                    {newLink.utmSource && `?utm_source=${newLink.utmSource}`}
                    {newLink.utmMedium && `&utm_medium=${newLink.utmMedium}`}
                    {newLink.utmCampaign && `&utm_campaign=${newLink.utmCampaign}`}
                  </code>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateLink}
              className="bg-[#030213] hover:bg-[#252525]"
              disabled={!newLink.name}
            >
              Criar Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
