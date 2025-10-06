import { useState } from 'react';
import { CreditCard, MoreVertical, Plus, Download, FileText } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface PaymentMethod {
  id: string;
  brand: string;
  lastFour: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: 'paid' | 'pending' | 'overdue';
}

const mockPaymentMethods: PaymentMethod[] = [
  {
    id: '1',
    brand: 'Visa',
    lastFour: '4242',
    expiryMonth: '12',
    expiryYear: '2026',
    isDefault: true,
  },
  {
    id: '2',
    brand: 'Mastercard',
    lastFour: '8888',
    expiryMonth: '08',
    expiryYear: '2027',
    isDefault: false,
  },
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    date: '05 out 2025',
    description: 'Plano Professional • Mensal',
    amount: 'R$ 89,90',
    status: 'paid',
  },
  {
    id: '2',
    date: '05 set 2025',
    description: 'Plano Professional • Mensal',
    amount: 'R$ 89,90',
    status: 'paid',
  },
  {
    id: '3',
    date: '05 nov 2025',
    description: 'Plano Professional • Mensal',
    amount: 'R$ 89,90',
    status: 'pending',
  },
  {
    id: '4',
    date: '05 ago 2025',
    description: 'Plano Professional • Mensal',
    amount: 'R$ 89,90',
    status: 'paid',
  },
];

export default function SettingsBilling() {
  const [invoiceAutoEnabled, setInvoiceAutoEnabled] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState('2025');
  const [filterMonth, setFilterMonth] = useState('all');
  const [currency, setCurrency] = useState('BRL');

  const handleAddCard = () => {
    console.log('Adicionar novo cartão');
  };

  const handleEditCard = (id: string) => {
    console.log('Editar cartão:', id);
  };

  const handleRemoveCard = (id: string) => {
    console.log('Remover cartão:', id);
  };

  const handleSetDefaultCard = (id: string) => {
    console.log('Definir cartão padrão:', id);
  };

  const handleDownloadInvoice = (id: string) => {
    console.log('Baixar fatura:', id);
  };

  const handleChangeBillingEmail = () => {
    console.log('Alterar email de cobrança');
  };

  const handleEditBillingData = () => {
    console.log('Editar dados de faturamento');
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: {
        bg: 'rgba(16, 185, 129, 0.1)',
        border: 'rgba(16, 185, 129, 0.2)',
        color: '#10B981',
        text: 'Paga',
      },
      pending: {
        bg: 'rgba(245, 158, 11, 0.1)',
        border: 'rgba(245, 158, 11, 0.2)',
        color: '#F59E0B',
        text: 'Pendente',
      },
      overdue: {
        bg: 'rgba(212, 24, 61, 0.1)',
        border: 'rgba(212, 24, 61, 0.2)',
        color: '#D4183D',
        text: 'Vencida',
      },
    };

    const style = styles[status];

    return (
      <span
        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs"
        style={{
          backgroundColor: style.bg,
          border: `1px solid ${style.border}`,
          color: style.color,
        }}
      >
        {style.text}
      </span>
    );
  };

  return (
    <div className="flex flex-col">
      {/* SEÇÃO 1: MÉTODOS DE PAGAMENTO */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Métodos de Pagamento</h3>
          <p className="text-sm text-[#717182]">
            Gerencie seus cartões e formas de pagamento.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Cartões */}
          {mockPaymentMethods.map((card) => (
            <div
              key={card.id}
              className={`p-5 rounded-xl mb-4 ${
                card.isDefault
                  ? 'bg-gradient-to-br from-[#F3F3F5] to-[#E9EBEF]'
                  : 'bg-white border border-[#E9EBEF]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <CreditCard className="w-6 h-6 text-[#030213] flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-[#252525]">
                      {card.brand} •••• {card.lastFour}
                    </p>
                    <p className="text-xs text-[#717182] mt-1">
                      Expira em {card.expiryMonth}/{card.expiryYear}
                    </p>
                    {card.isDefault && (
                      <Badge className="bg-[#10B981] text-white hover:bg-[#10B981] px-2.5 py-1 text-[11px] rounded-md mt-2">
                        Padrão
                      </Badge>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 rounded-lg hover:bg-black/5 transition-colors">
                      <MoreVertical className="w-5 h-5 text-[#717182]" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditCard(card.id)}>
                      Editar
                    </DropdownMenuItem>
                    {!card.isDefault && (
                      <DropdownMenuItem onClick={() => handleSetDefaultCard(card.id)}>
                        Definir como padrão
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => handleRemoveCard(card.id)}
                      className="text-destructive"
                    >
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}

          <Separator className="my-2" />

          {/* Adicionar Novo Cartão */}
          <button
            onClick={handleAddCard}
            className="w-full flex items-center justify-center gap-3 p-5 border-2 border-dashed border-[#CBCED4] rounded-xl hover:border-[#030213] hover:bg-[#FAFAFA] transition-all"
          >
            <Plus className="w-5 h-5 text-[#030213]" />
            <span className="text-sm text-[#030213]">Adicionar novo cartão</span>
          </button>
        </div>
      </section>

      {/* SEÇÃO 2: HISTÓRICO DE FATURAS */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Histórico de Faturas</h3>
          <p className="text-sm text-[#717182]">
            Visualize e baixe suas faturas anteriores.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Área de Filtros */}
          <div className="flex items-end gap-3 pb-5 border-b border-black/[0.1] mb-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#717182]">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[160px] h-10 bg-[#F3F3F5] border-transparent rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Paga</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="overdue">Vencida</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#717182]">Ano</label>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-[120px] h-10 bg-[#F3F3F5] border-transparent rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2025">2025</SelectItem>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2023">2023</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-[#717182]">Mês</label>
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-[140px] h-10 bg-[#F3F3F5] border-transparent rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="01">Janeiro</SelectItem>
                  <SelectItem value="02">Fevereiro</SelectItem>
                  <SelectItem value="03">Março</SelectItem>
                  <SelectItem value="04">Abril</SelectItem>
                  <SelectItem value="05">Maio</SelectItem>
                  <SelectItem value="06">Junho</SelectItem>
                  <SelectItem value="07">Julho</SelectItem>
                  <SelectItem value="08">Agosto</SelectItem>
                  <SelectItem value="09">Setembro</SelectItem>
                  <SelectItem value="10">Outubro</SelectItem>
                  <SelectItem value="11">Novembro</SelectItem>
                  <SelectItem value="12">Dezembro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabela de Faturas */}
          <div>
            {/* Header da Tabela */}
            <div
              className="grid gap-4 py-3 border-b-2 border-[#E9EBEF] mb-2"
              style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 60px' }}
            >
              <span className="text-xs text-[#717182] uppercase">Data</span>
              <span className="text-xs text-[#717182] uppercase">Descrição</span>
              <span className="text-xs text-[#717182] uppercase">Valor</span>
              <span className="text-xs text-[#717182] uppercase">Status</span>
              <span></span>
            </div>

            {/* Rows de Fatura */}
            {mockInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="grid gap-4 py-4 border-b border-black/[0.05] hover:bg-[#FAFAFA] transition-colors duration-150 -mx-6 px-6"
                style={{ gridTemplateColumns: '1fr 2fr 1fr 1fr 60px' }}
              >
                <span className="text-sm text-[#252525]">{invoice.date}</span>
                <span className="text-sm text-[#252525]">{invoice.description}</span>
                <span className="text-sm text-[#252525]">{invoice.amount}</span>
                <div>{getStatusBadge(invoice.status)}</div>
                <div className="flex justify-end">
                  <button
                    onClick={() => handleDownloadInvoice(invoice.id)}
                    disabled={invoice.status === 'pending'}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#E9EBEF] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    title="Baixar fatura PDF"
                  >
                    <Download className="w-4 h-4 text-[#030213]" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-black/[0.1]">
            <p className="text-xs text-[#717182]">Mostrando 4 de 12 faturas</p>
            <button className="text-xs text-[#030213] hover:underline">Ver todas</button>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3: CONFIGURAÇÕES DE COBRANÇA */}
      <section className="mb-8">
        <div className="mb-3 px-1">
          <h3 className="text-[#252525] mb-2">Configurações de Cobrança</h3>
          <p className="text-sm text-[#717182]">
            Ajuste preferências de faturamento.
          </p>
        </div>

        <div
          className="bg-white rounded-2xl p-6 border border-black/[0.06]"
          style={{ boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' }}
        >
          {/* Email de Cobrança */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div>
              <p className="text-sm text-[#252525] mb-1">Email de cobrança</p>
              <p className="text-sm text-[#717182]">financeiro@empresa.com</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8" onClick={handleChangeBillingEmail}>
              Alterar
            </Button>
          </div>

          {/* Moeda Padrão */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div>
              <p className="text-sm text-[#252525]">Moeda padrão</p>
            </div>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-[200px] h-10 bg-[#F3F3F5] border-transparent rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BRL">BRL (R$)</SelectItem>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notas Fiscais */}
          <div className="flex items-center justify-between py-4 border-b border-black/[0.05]">
            <div className="flex-1">
              <p className="text-sm text-[#252525]">Emitir nota fiscal automática</p>
              <p className="text-xs text-[#717182] mt-1">Receber NF-e junto com cada fatura</p>
            </div>
            <Switch checked={invoiceAutoEnabled} onCheckedChange={setInvoiceAutoEnabled} />
          </div>

          {/* Dados de Faturamento */}
          <div className="pt-5">
            <Button
              variant="outline"
              className="w-full h-10 gap-2"
              onClick={handleEditBillingData}
            >
              <FileText className="w-4 h-4" />
              Editar dados de faturamento
            </Button>
            <p className="text-xs text-[#717182] mt-2 text-center">
              CPF/CNPJ, endereço e informações fiscais
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
