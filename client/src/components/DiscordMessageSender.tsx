import { useState } from "react";

export default function DiscordMessageSender() {
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const response = await fetch("/api/discord/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await response.json();
      setFeedback(data.status === "sent" ? "✅ Message sent!" : "❌ Failed to send");
      setMessage("");
    } catch (error) {
      setFeedback("❌ Error sending message");
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-4">Discord Message Sender</h1>
      <p className="text-muted-foreground mb-6">
        Send messages to the configured Discord webhook channel.
      </p>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-2">
            Message
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-3 border rounded-lg resize-none"
            rows={4}
            placeholder="Enter your message..."
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          disabled={!message.trim()}
        >
          Send Message
        </button>
        {feedback && (
          <p className={`text-sm ${feedback.includes("✅") ? "text-green-600" : "text-red-600"}`}>
            {feedback}
          </p>
        )}
      </form>
    </div>
  );
}
