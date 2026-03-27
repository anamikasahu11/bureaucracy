import React, { useEffect, useRef, useState } from "react";

function buildAssistantReply(question) {
  const input = question.trim().toLowerCase();

  if (!input) {
    return [
      "I can help with document checks, eligibility, and next steps.",
      "Try asking: What can cause rejection?"
    ].join("\n");
  }

  if (input.includes("expiry") || input.includes("expire") || input.includes("validity")) {
    return [
      "Here is how expiry checks usually work:",
      "1. Confirm issue and expiry dates from trusted source (DigiLocker/API/OCR).",
      "2. Mark status as valid, expiring soon, expired, or unknown.",
      "3. Prioritize expired critical documents first.",
      "Suggested next step: Run Rejection Analysis after updating expired documents."
    ].join("\n");
  }

  if (input.includes("scheme") || input.includes("eligibility")) {
    return [
      "To decide scheme eligibility quickly:",
      "1. Verify identity and address documents.",
      "2. Validate income and category proofs.",
      "3. Check deadline and authority rules.",
      "I can help map required documents for a scheme name too."
    ].join("\n");
  }

  if (input.includes("document") || input.includes("upload") || input.includes("digilocker")) {
    return [
      "For document processing in this app:",
      "1. Fetch DigiLocker records first.",
      "2. Upload missing files manually.",
      "3. Run Rejection Analysis to see actionable fixes.",
      "Tip: Resolve critical missing documents before optional ones."
    ].join("\n");
  }

  return [
    "I can help with procedures, documents, and rejection prevention.",
    "Try asking:",
    "- Which documents are critical?",
    "- How do I reduce rejection risk?",
    "- How should expiry be validated?"
  ].join("\n");
}

function playOpenSound() {
  const AudioContextRef = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextRef) return;

  try {
    const ctx = new AudioContextRef();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.04, ctx.currentTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.15);
    oscillator.onended = () => ctx.close();
  } catch (error) {
    // Ignore sound errors and keep the assistant responsive.
  }
}

function parseApiReply(payload) {
  if (!payload || typeof payload !== "object") return "";
  if (typeof payload.reply === "string") return payload.reply;
  if (typeof payload.message === "string") return payload.message;

  const firstChoice = Array.isArray(payload.choices) ? payload.choices[0] : null;
  if (!firstChoice || typeof firstChoice !== "object") return "";
  if (typeof firstChoice.text === "string") return firstChoice.text;

  const nestedMessage = firstChoice.message;
  if (nestedMessage && typeof nestedMessage.content === "string") {
    return nestedMessage.content;
  }

  return "";
}

async function getAssistantReply(question, signal) {
  const apiUrl = import.meta.env.VITE_GOVGURU_API_URL;

  if (!apiUrl) {
    return buildAssistantReply(question);
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: question,
        assistant: "gov-guru"
      }),
      signal
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const reply = parseApiReply(data).trim();
    if (reply) return reply;

    throw new Error("API returned an empty reply");
  } catch (error) {
    return buildAssistantReply(question);
  }
}

export default function GovGuruAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      text: "Hello, I am Gov Guru Assistant. Ask about documents, schemes, procedures, or rejection risks."
    }
  ]);

  const messageIdRef = useRef(1);
  const abortRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const toggleAssistant = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) playOpenSound();
      return next;
    });
  };

  const sendMessage = async () => {
    const trimmed = draft.trim();
    if (!trimmed || isTyping) return;

    messageIdRef.current += 1;
    const userMessage = { id: messageIdRef.current, role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setDraft("");
    setIsTyping(true);

    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();

    const reply = await getAssistantReply(trimmed, abortRef.current.signal);

    if (abortRef.current.signal.aborted) {
      setIsTyping(false);
      return;
    }

    setTimeout(() => {
      messageIdRef.current += 1;
      const assistantMessage = { id: messageIdRef.current, role: "assistant", text: reply };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 350);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="govguru-root">
      <button
        type="button"
        className={`govguru-fab ${isOpen ? "open" : ""}`}
        onClick={toggleAssistant}
        aria-label={isOpen ? "Close Gov Guru Assistant" : "Open Gov Guru Assistant"}
      >
        <span className="bot-emoji" aria-hidden="true">
          🤖
        </span>
      </button>

      <section
        className={`govguru-window ${isOpen ? "open" : "closed"}`}
        aria-hidden={!isOpen}
        aria-label="Gov Guru Assistant chat"
      >
        <header className="govguru-header">
          <div className="govguru-avatar" aria-hidden="true">
            🤖
          </div>
          <div className="govguru-heading">
            <h3>Gov Guru Assistant</h3>
            <p>Ask about documents, schemes, or procedures</p>
          </div>
        </header>

        <div className="govguru-messages" role="log" aria-live="polite">
          {messages.map((message) => (
            <article
              key={message.id}
              className={`govguru-message ${message.role === "user" ? "user" : "assistant"}`}
            >
              <p>{message.text}</p>
            </article>
          ))}

          {isTyping && (
            <article className="govguru-message assistant typing">
              <p>
                Assistant is thinking
                <span className="dots" aria-hidden="true">
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </p>
            </article>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="govguru-input-row">
          <input
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Ask your question..."
            aria-label="Ask your question"
          />
          <button type="button" onClick={sendMessage} disabled={!draft.trim() || isTyping}>
            Send
          </button>
        </div>
      </section>
    </div>
  );
}