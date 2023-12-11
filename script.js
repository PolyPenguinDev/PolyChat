const Model = "meta-llama/Llama-2-70b-chat-hf";
const apiUrl = "https://api.deepinfra.com/v1/openai/chat/completions";
const authToken = "";
const textarea = document.getElementById("textarea");
const TOKEN = "";
const chatContainer = document.getElementById("chat-container");
let history = [
  {
    role: 'system',
    content: 'you are a very helpful assistant named "PolyChat" answer every question to the best of your ability, if you don\' know the answer, just say "i don\'t know" use markdown for fun formatting'
  }
];
let start = true;

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function handleKeyPress(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
}

textarea.addEventListener('keydown', handleKeyPress);

const chat = async (msg) => {
  textarea.value = '';
  history.push({ role: 'user', content: msg });
  console.log(history);

  const initialPolyChatMessage = document.querySelector('.initial-poly-chat-message');
  
  try {
    // Display the AI response in the existing "PolyChat" message
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: Model,
        messages: history,
      }),
    });

    const jsonRes = await res.json();
    history.push(jsonRes.choices[0].message);
    const responseMessage = escapeHtml(jsonRes.choices[0].message.content);

    const responseHtml = `
      <div class="message" style="margin-left: 300px; margin-bottom: 50px;">
        <div class="label">
          <img class="image" src="polychat.png" width="24" height="24" style="margin: 0px; margin-right: 8px; margin-top: 4px;">
          <p style="margin: 4px; font-family: Soehne Halbfett; margin-bottom: 0;">PolyChat</p>
        </div>  
        <div style="margin-top: 0; margin-left: 33px; width: 700px; white-space: pre-wrap; color: #E3E3E8; font-family: 'Soehne Buch', sans-serif;">${responseMessage}</div>
      </div>
    `;

    // Replace the initial "PolyChat" message with the actual AI response
    initialPolyChatMessage.outerHTML = responseHtml;
    document.getElementById("send").disabled = true;
  } catch (error) {
    console.error("Error in chat:", error);
  }
};

async function sendMessage() {
  const message = textarea.value;
  const userMessageHtml = `
    <div class="message" style="margin-left: 300px; margin-bottom: 50px;">
      <div class="label">
        <img class="image" src="polyintrologo.png" width="24" height="24" style="margin: 0px; margin-right: 8px; margin-top: 4px;">
        <p style="margin: 4px; font-family: Soehne Halbfett; margin-bottom: 0;">You</p>
      </div>  
      <pre style="margin-top: 0; margin-left: 36px; width: 100px; color: #E3E3E8; font-family: 'Soehne Buch', sans-serif;">${message}</pre>
    </div>
  `;

  if (start) {
    start = false;
    chatContainer.innerHTML = '<br/><br/><br/><br/>';
    chatContainer.innerHTML += userMessageHtml; // Display user's message immediately
  } else {
    chatContainer.innerHTML += userMessageHtml;
  }

  document.getElementById("send").disabled = true;

  // Display initial "PolyChat" message while waiting for AI response
  const initialPolyChatMessageHtml = `
    <div class="message initial-poly-chat-message" style="margin-left: 300px; margin-bottom: 50px;">
      <div class="label">
        <img class="image" src="polychat.png" width="24" height="24" style="margin: 0px; margin-right: 8px; margin-top: 4px;">
        <p style="margin: 4px; font-family: Soehne Halbfett; margin-bottom: 0;">PolyChat</p>
      </div>  
      <div style="margin-top: 0; margin-left: 33px; width: 700px; white-space: pre-wrap; color: #E3E3E8; font-family: 'Soehne Buch', sans-serif;">Loading...</div>
    </div>
  `;

  chatContainer.innerHTML += initialPolyChatMessageHtml;

  // Make the AI call
  await chat(message);
}
