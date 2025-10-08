# Configuração do Domínio ktirio.com.br

✅ **Deploy Concluído com Sucesso!**

Seu app está atualmente disponível em: https://ktirio-ai-4540c.web.app

## Passo a Passo para Configurar o Domínio Customizado

### 1. Adicionar Domínio no Firebase Hosting

1. Acesse o Firebase Console: https://console.firebase.google.com/project/ktirio-ai-4540c/hosting
2. Clique em **"Adicionar domínio personalizado"** ou **"Add custom domain"**
3. Digite: `ktirio.com.br`
4. Clique em **"Continuar"**

### 2. Verificar Propriedade do Domínio

O Firebase vai solicitar que você verifique a propriedade do domínio. Você terá duas opções:

**Opção A: Verificação via TXT (Recomendado)**
- Adicione um registro TXT no seu provedor de DNS
- Nome: `@` ou deixe em branco
- Valor: O código fornecido pelo Firebase (exemplo: `firebase=ktirio-ai-4540c`)
- TTL: 3600 ou automático

**Opção B: Verificação via arquivo**
- Faça upload de um arquivo específico no seu servidor web atual

### 3. Configurar Registros DNS

Depois da verificação, o Firebase fornecerá registros DNS para configurar:

#### Para o domínio raiz (ktirio.com.br):
```
Tipo: A
Nome: @
Valor: Será fornecido pelo Firebase (geralmente IPs específicos)
TTL: 3600
```

#### Para www (www.ktirio.com.br):
```
Tipo: CNAME
Nome: www
Valor: Será fornecido pelo Firebase (exemplo: ktirio-ai-4540c.web.app.)
TTL: 3600
```

### 4. Onde Configurar os Registros DNS

Você precisa acessar o painel de controle do seu provedor de domínio (onde você registrou ktirio.com.br). Provedores comuns no Brasil:

- **Registro.br**: https://registro.br
- **GoDaddy**: https://dcc.godaddy.com/domains
- **HostGator**: Painel cPanel
- **Locaweb**: Painel de Controle
- **UOL Host**: Painel de Controle

### 5. Tempo de Propagação

⏱️ **Importante**: Após configurar os registros DNS, pode levar de **30 minutos a 48 horas** para a propagação DNS completa.

Você pode verificar o status em:
- Firebase Console → Hosting → Seu domínio
- https://dnschecker.org/ (para verificar propagação global)

### 6. Certificado SSL

✅ O Firebase Hosting **provisiona automaticamente** um certificado SSL gratuito para seu domínio customizado.

O processo leva alguns minutos após a propagação DNS estar completa.

## Resumo dos Próximos Passos

1. ✅ Build concluído
2. ✅ Deploy realizado em https://ktirio-ai-4540c.web.app
3. 🔄 **PRÓXIMO**: Adicione o domínio no Firebase Console
4. 🔄 **DEPOIS**: Configure os registros DNS no seu provedor
5. 🔄 **AGUARDE**: Propagação DNS (30min - 48h)
6. ✅ **PRONTO**: Seu app estará em https://ktirio.com.br

## Links Úteis

- **Firebase Console Hosting**: https://console.firebase.google.com/project/ktirio-ai-4540c/hosting
- **Site Atual**: https://ktirio-ai-4540c.web.app
- **Documentação Firebase**: https://firebase.google.com/docs/hosting/custom-domain

## Comandos Úteis

```bash
# Fazer novo deploy
npm run build && firebase deploy --only hosting

# Ver logs do hosting
firebase hosting:sites:list

# Testar localmente antes do deploy
npm run build && firebase serve
```

---

**Status Atual**: ✅ App deployado e funcionando em https://ktirio-ai-4540c.web.app

Próximo passo: Adicionar domínio customizado no Firebase Console!
