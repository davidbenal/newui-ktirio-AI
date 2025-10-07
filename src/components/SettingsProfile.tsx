import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { updateUserProfile } from '@/lib/firestore';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useToast } from './ToastProvider';
import { uploadImage, validateImageFile } from '@/lib/storage';

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

interface SettingsProfileProps {
  onSignOut?: () => void;
}

export default function SettingsProfile({ onSignOut }: SettingsProfileProps) {
  const { user, loading } = useFirebaseUser();
  const { showSuccess, showError } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<ProfileData>({
    fullName: '',
    username: '',
    email: '',
    bio: '',
    avatarUrl: '',
    language: 'pt-BR',
    theme: 'light',
    dateFormat: 'DD/MM/AAAA',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Carregar dados do usuário do Firebase
  // Prioriza dados do Firestore (name, avatar) sobre Firebase Auth (displayName, photoURL)
  useEffect(() => {
    if (user && !isInitialized) {
      console.log('📥 Loading user data (initial):', user);
      setFormData({
        fullName: user.name || user.displayName || '',
        username: user.email?.split('@')[0] || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatar || user.photoURL || '',
        language: user.preferences?.language || 'pt-BR',
        theme: user.preferences?.theme || 'light',
        dateFormat: user.preferences?.dateFormat || 'DD/MM/AAAA',
      });
      setIsInitialized(true);
    }
  }, [user, isInitialized]);

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        fullName: user.name || user.displayName || '',
        username: user.email?.split('@')[0] || '',
        email: user.email || '',
        bio: user.bio || '',
        avatarUrl: user.avatar || user.photoURL || '',
        language: user.preferences?.language || 'pt-BR',
        theme: user.preferences?.theme || 'light',
        dateFormat: user.preferences?.dateFormat || 'DD/MM/AAAA',
      });
    }
    setHasChanges(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      console.log('💾 Saving profile data:', formData);
      console.log('💾 Current user before save:', user);

      const dataToSave = {
        name: formData.fullName,
        displayName: formData.fullName,
        avatar: formData.avatarUrl,
        photoURL: formData.avatarUrl,
        bio: formData.bio,
        preferences: {
          language: formData.language,
          theme: formData.theme,
          dateFormat: formData.dateFormat,
        },
      };

      console.log('💾 Data being saved to Firestore:', dataToSave);

      // Atualizar Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: formData.fullName,
          photoURL: formData.avatarUrl,
        });
        console.log('✅ Firebase Auth updated');
      }

      // Atualizar Firestore
      await updateUserProfile(user.id, dataToSave);
      console.log('✅ Firestore updated successfully');

      showSuccess('Perfil atualizado com sucesso!');
      setHasChanges(false);
    } catch (error) {
      console.error('❌ Error saving profile:', error);
      showError('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      showError(validation.error || 'Arquivo inválido');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      // Upload para Storage
      const avatarUrl = await uploadImage(file, user.id, 'avatars');

      // Atualizar formData
      setFormData((prev) => ({ ...prev, avatarUrl }));
      setHasChanges(true);

      showSuccess('Foto carregada! Clique em "Salvar alterações" para confirmar.');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showError('Erro ao fazer upload da foto.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    setFormData((prev) => ({ ...prev, avatarUrl: '' }));
    setHasChanges(true);
    showSuccess('Foto removida! Clique em "Salvar alterações" para confirmar.');
  };

  const handleDeleteAccount = () => {
    // TODO: Implementar modal de confirmação
    showError('Funcionalidade em desenvolvimento');
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
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAvatar}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploadingAvatar ? 'Carregando...' : 'Alterar foto'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-destructive hover:text-destructive"
                onClick={handleRemoveAvatar}
                disabled={!formData.avatarUrl || isUploadingAvatar}
              >
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
            <Button variant="ghost" onClick={handleCancel} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar alterações'}
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
          {/* Sair da Conta */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-destructive/10">
            <div className="max-w-[480px]">
              <p className="text-sm text-foreground">Sair da conta</p>
              <p className="text-xs text-muted-foreground mt-1">
                Desconecte-se desta conta. Você pode fazer login novamente a qualquer momento.
              </p>
            </div>
            <Button variant="outline" onClick={onSignOut} className="border-destructive/20 text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>

          {/* Excluir Conta */}
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
