"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Bot, Loader2, Send, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  createConversation,
  streamCompletion,
  classifyConversationTopic,
} from "@/features/aquagpt/api"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

type AskAiDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AskAiDrawer({ open, onOpenChange }: AskAiDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<(() => void) | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight
      }
    }
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (open && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isStreaming) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsStreaming(true)

    try {
      let convId = conversationId
      if (!convId) {
        const conv = await createConversation(
          trimmed.slice(0, 60) || "Admin Chat"
        )
        convId = conv.id
        setConversationId(convId)
      }

      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "" },
      ])

      const abort = streamCompletion(
        convId,
        trimmed,
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          )
        },
        () => {
          setIsStreaming(false)
          // Fire-and-forget: classify the conversation topic
          classifyConversationTopic(convId, trimmed).catch(() => {})
        },
        (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: `Error: ${error}` }
                : m
            )
          )
          setIsStreaming(false)
        }
      )
      abortRef.current = abort
    } catch {
      setIsStreaming(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleNewChat = () => {
    if (abortRef.current) abortRef.current()
    setMessages([])
    setConversationId(null)
    setIsStreaming(false)
    setInput("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <SheetTitle className="text-base">Ask AquaGPT</SheetTitle>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="text-xs"
              >
                New chat
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 px-4">
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
                <Bot className="h-10 w-10" />
                <div>
                  <p className="font-medium">AquaGPT Assistant</p>
                  <p className="mt-1 text-sm">
                    Ask questions about aquaculture, farming data, or platform
                    analytics.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  )}
                >
                  {msg.content || (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Ask AquaGPT something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none"
              disabled={isStreaming}
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="shrink-0"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            AquaGPT may produce inaccurate information. Verify important data.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
