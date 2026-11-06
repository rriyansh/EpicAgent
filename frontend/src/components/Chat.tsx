export default function Chat() {
  return (
    <section className="panel chat-panel">
      <h2>Chat</h2>
      <div className="chat-messages" />
      <form className="chat-input">
        <input type="text" placeholder="Type a message..." />
        <button type="submit">Send</button>
      </form>
    </section>
  );
}
