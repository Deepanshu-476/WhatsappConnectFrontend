"use client";

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/data/client";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Contact, Deal, ContactNote, Tag, Reminder } from "@/types";
import {
  Phone,
  Mail,
  Copy,
  Check,
  Tag as TagIcon,
  DollarSign,
  StickyNote,
  Plus,
  CalendarClock,
  CheckCircle2,
  Circle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { contactHandle } from "@/lib/whatsapp/wa-identity";

interface ContactSidebarProps {
  contact: Contact | null;
}

export function ContactSidebar({ contact }: ContactSidebarProps) {
  const tSidebar = useTranslations("Inbox.sidebar");
  const tThread = useTranslations("Inbox.messageThread");

  const { accountId } = useAuth();
  const [copied, setCopied] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tags, setTags] = useState<(Tag & { contact_tag_id: string })[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Follow-up reminders
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDue, setNewReminderDue] = useState("");
  const [addingReminder, setAddingReminder] = useState(false);
  const [showAddReminder, setShowAddReminder] = useState(false);
  const [mountedAt] = useState(() => Date.now());

  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const backend = createClient();

    // Fetch deals, notes, tags, and reminders in parallel
    const [dealsRes, notesRes, tagsRes, remindersRes] = await Promise.all([
      backend
        .from("deals")
        .select("*, stage:pipeline_stages(*)")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      backend
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      backend
        .from("contact_tags")
        .select("id, tag_id, tags(*)")
        .eq("contact_id", contact.id),
      backend
        .from("reminders")
        .select("*")
        .eq("contact_id", contact.id)
        .order("due_date", { ascending: true }),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (remindersRes.data) setReminders(remindersRes.data);
    if (tagsRes.data) {
      const mapped = tagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);
    }
  }, [contact]);

  // Load on contact change. setContactData/setTags run inside async
  // backend callbacks, not synchronously in the effect body.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContactData();
  }, [fetchContactData]);

  const handleCopyPhone = useCallback(async () => {
    // Copies whatever the row displays — a BSUID-only contact has no
    // phone number to copy, but its @username still identifies them.
    const handle = contact ? contactHandle(contact) : '';
    if (!handle) return;
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    // Dep is the whole `contact` object (not `contact?.phone`) so the
    // React Compiler's inference agrees with the manual dep list —
    // fixes the `preserve-manual-memoization` lint error.
  }, [contact]);

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim()) return;
    if (!accountId) return;
    setAddingNote(true);

    const backend = createClient();
    const {
      data: { session },
    } = await backend.auth.getSession();
    const user = session?.user;

    const { data, error } = await backend
      .from("contact_notes")
      .insert({
        contact_id: contact.id,
        account_id: accountId,
        user_id: user?.id,
        note_text: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }, [contact, newNote, accountId]);

  const handleAddReminder = useCallback(async () => {
    if (!contact || !newReminderTitle.trim()) return;
    setAddingReminder(true);
    const backend = createClient();
    const dueDate = newReminderDue || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await backend
      .from("reminders")
      .insert({
        contact_id: contact.id,
        account_id: accountId,
        title: newReminderTitle.trim(),
        due_date: dueDate,
        status: "pending",
      })
      .select()
      .single();

    if (!error && data) {
      setReminders((prev) => [...prev, data]);
      setNewReminderTitle("");
      setNewReminderDue("");
      setShowAddReminder(false);
    }
    setAddingReminder(false);
  }, [contact, newReminderTitle, newReminderDue, accountId]);

  const handleToggleReminder = useCallback(async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "completed" ? "pending" : "completed";
    const backend = createClient();
    const { error } = await backend
      .from("reminders")
      .update({ status: nextStatus })
      .eq("id", id);

    if (!error) {
      setReminders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
    }
  }, []);

  const handleDeleteReminder = useCallback(async (id: string) => {
    const backend = createClient();
    const { error } = await backend
      .from("reminders")
      .delete()
      .eq("id", id);

    if (!error) {
      setReminders((prev) => prev.filter((r) => r.id !== id));
    }
  }, []);

  if (!contact) {
    return (
      <div className="flex h-full w-70 items-center justify-center border-l border-border bg-card">
        <p className="text-sm text-muted-foreground">{tThread("selectConversation")}</p>
      </div>
    );
  }

  const displayName = contact.name || contactHandle(contact);
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="flex h-full w-70 flex-col border-l border-border bg-card">
      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Contact Info */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
              {contact.avatar_url ? (
                <Image
                  src={contact.avatar_url}
                  alt={displayName}
                  width={64}
                  height={64}
                  unoptimized
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              {displayName}
            </h3>
            {contact.company && (
              <p className="text-xs text-muted-foreground">{contact.company}</p>
            )}
          </div>

          {/* Phone */}
          <div className="mt-4 space-y-2">
            <button
              onClick={handleCopyPhone}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted"
            >
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1 text-left">
                {contactHandle(contact)}
              </span>
              {copied ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            {contact.email && (
              <div className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <TagIcon className="h-3 w-3" />
              {tSidebar("tags")}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{tSidebar("noTags")}</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.contact_tag_id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Active Deals */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              {tSidebar("deals")}
            </div>
            <div className="mt-2 space-y-2">
              {deals.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">{tSidebar("noDeals")}</p>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-lg bg-muted px-3 py-2"
                  >
                    <p className="text-sm font-medium text-foreground">
                      {deal.title}
                    </p>
                    <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {deal.currency ?? "$"}
                        {deal.value.toLocaleString()}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[10px]"
                          style={{
                            backgroundColor: `${deal.stage.color}20`,
                            color: deal.stage.color,
                          }}
                        >
                          {deal.stage.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Follow-up Reminders */}
          <div>
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 text-primary" />
                <span>Follow-ups & Reminders</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAddReminder((v) => !v)}
                className="text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                title="Add Reminder"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {showAddReminder && (
              <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-2.5">
                <input
                  type="text"
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="e.g. Call back about pricing"
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary"
                />
                <input
                  type="datetime-local"
                  value={newReminderDue}
                  onChange={(e) => setNewReminderDue(e.target.value)}
                  className="w-full rounded border border-border bg-background px-2.5 py-1 text-xs text-foreground outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs px-2"
                    onClick={() => setShowAddReminder(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs px-2.5 bg-primary text-primary-foreground"
                    onClick={handleAddReminder}
                    disabled={!newReminderTitle.trim() || addingReminder}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}

            <div className="mt-2 space-y-1.5">
              {reminders.length === 0 ? (
                <p className="px-1 text-xs text-muted-foreground">No pending reminders</p>
              ) : (
                reminders.map((r) => {
                  const isDone = r.status === "completed";
                  const isOverdue = !isDone && Boolean(r.due_date && new Date(r.due_date).getTime() < mountedAt);
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        "group flex items-start justify-between gap-2 rounded-lg border border-border/60 p-2 text-xs transition-colors",
                        isDone ? "bg-muted/30 opacity-60" : "bg-card hover:bg-muted/40"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleReminder(r.id, r.status)}
                        className="mt-0.5 shrink-0 text-muted-foreground hover:text-primary"
                      >
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Circle className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium text-foreground truncate", isDone && "line-through text-muted-foreground")}>
                          {r.title}
                        </p>
                        {r.due_date && (
                          <p className={cn("text-[10px] mt-0.5", isOverdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                            {format(new Date(r.due_date), "MMM d, yyyy HH:mm")}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteReminder(r.id)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                        title="Delete"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-border" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <StickyNote className="h-3 w-3" />
              {tSidebar("notes")}
            </div>
            <div className="mt-2">
              <div className="flex gap-2">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={tSidebar("addNotePlaceholder")}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-muted px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <Button
                  size="sm"
                  className="h-auto bg-primary px-2 hover:bg-primary/90"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              <div className="mt-2 space-y-2">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg bg-muted px-3 py-2"
                  >
                    <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {note.note_text}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
