'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Loader2,
  Plus,
} from 'lucide-react';

import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface WalletTransaction {
  id: string;
  type?: 'credit' | 'debit';
  amount: number;
  description?: string;
  reference?: string;
  status?: string;
  created_at?: string;
}

export function WalletPanel() {
  const { accountRole } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Recharge modal
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>('1000');
  const [recharging, setRecharging] = useState(false);

  const isOwner = accountRole === 'owner';

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [balRes, txRes] = await Promise.all([
        apiFetch<{ data: { balance: number } }>('/api/wallet/balance'),
        apiFetch<{ transactions: WalletTransaction[] }>('/api/wallet').catch(() => ({ transactions: [] })),
      ]);

      if (balRes?.data?.balance !== undefined) {
        setBalance(balRes.data.balance);
      }
      if (Array.isArray(txRes?.transactions)) {
        setTransactions(txRes.transactions);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRecharge = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(rechargeAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setRecharging(true);
      await apiFetch('/api/wallet', {
        method: 'POST',
        json: {
          type: 'credit',
          amount: amountNum,
          description: 'WhatsApp conversation credits recharge',
          reference: `RCG-${Date.now().toString().slice(-6)}`,
          status: 'completed',
        },
      });

      setRechargeOpen(false);
      await fetchData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to process recharge');
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">My Wallet</h2>
          <p className="text-sm text-muted-foreground">
            WhatsApp conversation credits balance. Note: Conversation credits are managed separately
            from software subscriptions.
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setRechargeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Recharge Credits
          </Button>
        )}
      </div>

      {/* Balance Card */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-3">
          <CardDescription>Available WhatsApp Conversation Balance</CardDescription>
          <CardTitle className="flex items-baseline gap-2 text-3xl font-extrabold text-foreground sm:text-4xl">
            <span className="text-muted-foreground">₹</span>
            {balance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed">
            WhatsApp charges per 24-hour service or marketing conversation thread. Outbound marketing
            broadcasts and template messages deduct credits directly from this wallet balance.
          </div>
        </CardContent>
      </Card>

      {/* Transactions History */}
      <Card className="border-border/80 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Transaction Ledger</CardTitle>
          <CardDescription>
            Audit log of credit recharges and per-conversation deductions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <History className="h-6 w-6 text-muted-foreground" />
              </div>
              <h4 className="mt-3 font-semibold text-foreground">No transactions found</h4>
              <p className="mt-1 text-sm text-muted-foreground">
                Your wallet recharge and message deduction events will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => {
                    const isCredit = tx.type === 'credit' || tx.amount > 0;
                    return (
                      <TableRow key={tx.id}>
                        <TableCell className="text-xs text-muted-foreground">
                          {tx.created_at
                            ? new Date(tx.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Recent'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              isCredit
                                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600'
                                : 'border-amber-500/40 bg-amber-500/10 text-amber-600'
                            }
                          >
                            {isCredit ? (
                              <ArrowDownLeft className="mr-1 h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="mr-1 h-3 w-3" />
                            )}
                            {isCredit ? 'Credit' : 'Debit'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {tx.description || (isCredit ? 'Balance Recharge' : 'Message Usage')}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {tx.reference || '—'}
                        </TableCell>
                        <TableCell
                          className={`text-right font-semibold ${
                            isCredit ? 'text-emerald-600' : 'text-foreground'
                          }`}
                        >
                          {isCredit ? '+' : '-'}₹
                          {Math.abs(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECHARGE DIALOG */}
      <Dialog open={rechargeOpen} onOpenChange={setRechargeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Recharge WhatsApp Balance</DialogTitle>
            <DialogDescription>
              Add conversation credits to your WhatsApp balance.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecharge} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rechargeAmount">Amount (INR)</Label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="rechargeAmount"
                  type="number"
                  min="100"
                  step="100"
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                  className="pl-7"
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              {['500', '1000', '2500', '5000'].map((val) => (
                <Button
                  key={val}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRechargeAmount(val)}
                  className="flex-1 text-xs"
                >
                  ₹{val}
                </Button>
              ))}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setRechargeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={recharging}>
                {recharging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirm Recharge
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
