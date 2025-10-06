import { useState } from 'react';
import { Upload, Trash2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface ProfileData {
  fullName: string;
  username: string;
  email: string;
  bio: string;
  avatarUrl: string;
  language: string;
  theme: string;
  dateFormat: string;
}

const initialData: ProfileData = {
  fullName: 'João Silva',
  username: 'joaosilva',
  email: 'joao@email.com',
  bio: '',
  avatarUrl: '',
  language: 'pt-BR',
  theme: 'light',
  dateFormat: 'DD/MM/AAAA',
};

export default function SettingsProfile() {
  const [formData, setFormData] = useState<ProfileData>(initialData);
  const [hasChanges, setHasChanges] = useState(false);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    setFormData(initialData);
    setHasChanges(false);
  };

  const handleSave = () => {
    // Implementar lógica de salvar
    console.log('Saving profile data:', formData);
    setHasChanges(false);
  };

  const handleDeleteAccount = () => {
    // Implementar lógica de excluir conta
    console.log('Delete account');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: INFORMAÇÕES PESSOAIS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Informações Pessoais</h3>
          <p className="text-sm text-[#717182]">
            Gerencie suas informações de perfil e como você aparece no Ktírio.
          </p>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 border-2 border-accent">
              <AvatarImage src={formData.avatarUrl} />
              <AvatarFallback className="bg-accent text-foreground">
                {getInitials(formData.fullName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <Upload className="w-4 h-4 mr-2" />
                Alterar foto
              </Button>
              <Button variant="ghost" size="sm" className="h-8 text-destructive hover:text-destructive">
                Remover
              </Button>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Form Fields */}
          <div className="flex flex-col gap-5">
            {/* Nome completo */}
            <div>
              <Label htmlFor="fullName" className="mb-2 block">
                Nome completo
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder="João Silva"
                className="h-10"
              />
            </div>

            {/* Nome de usuário */}
            <div>
              <Label htmlFor="username" className="mb-2 block">
                Nome de usuário
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">ktirio.ai/</span>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  placeholder="joaosilva"
                  className="h-10 flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Este é o seu nome único no Ktírio
              </p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                value={formData.email}
                disabled
                className="h-10 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Para alterar o email, entre em contato com o suporte
              </p>
            </div>

            {/* Bio */}
            <div>
              <Label htmlFor="bio" className="mb-2 block">
                Bio
              </Label>
              <div className="relative">
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 160) {
                      handleInputChange('bio', e.target.value);
                    }
                  }}
                  placeholder="Conte um pouco sobre você..."
                  className="h-20 resize-none"
                  maxLength={160}
                />
                <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                  {formData.bio.length}/160
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Salvar alterações
            </Button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 2: PREFERÊNCIAS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Preferências</h3>
          <p className="text-sm text-[#717182]">
            Personalize sua experiência no Ktírio.
          </p>
        </div>

        <div 
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Idioma */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-foreground">Idioma</p>
              <p className="text-xs text-muted-foreground">Escolha o idioma da interface</p>
            </div>
            <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pt-BR">Português (BR)</SelectItem>
                <SelectItem value="en-US">English (US)</SelectItem>
                <SelectItem value="es-ES">Español</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Tema */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-foreground">Tema</p>
              <p className="text-xs text-muted-foreground">Escolha entre claro, escuro ou automático</p>
            </div>
            <Select value={formData.theme} onValueChange={(value) => handleInputChange('theme', value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Claro</SelectItem>
                <SelectItem value="dark">Escuro</SelectItem>
                <SelectItem value="system">Automático (sistema)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Formato de Data */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm text-foreground">Formato de data</p>
              <p className="text-xs text-muted-foreground">Como as datas são exibidas</p>
            </div>
            <Select value={formData.dateFormat} onValueChange={(value) => handleInputChange('dateFormat', value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DD/MM/AAAA">DD/MM/AAAA</SelectItem>
                <SelectItem value="MM/DD/AAAA">MM/DD/AAAA</SelectItem>
                <SelectItem value="AAAA-MM-DD">AAAA-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: ZONA DE PERIGO */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-destructive mb-2">Zona de Perigo</h3>
          <p className="text-sm text-[#717182]">
            Ações irreversíveis que afetam sua conta.
          </p>
        </div>

        <div 
          className="bg-destructive/5 rounded-2xl p-6 border border-destructive/20"
          style={{ boxShadow: '0 4px 12px rgba(212, 24, 61, 0.12)' }}
        >
          <div className="flex items-center justify-between">
            <div className="max-w-[480px]">
              <p className="text-sm text-foreground">Excluir conta</p>
              <p className="text-xs text-muted-foreground mt-1">
                Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir conta
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
