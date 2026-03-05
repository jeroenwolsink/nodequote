const quoteContent = document.getElementById("quote-content");
const quoteAuthor = document.getElementById("quote-author");
const statusText = document.getElementById("status");
const button = document.getElementById("new-quote-btn");
const card = document.querySelector(".quote-card");

async function fetchRandomQuote() {
  button.disabled = true;
  statusText.textContent = "Loading a fresh quote...";

  try {
    const response = await fetch(`/?_ts=${Date.now()}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    quoteContent.textContent = `"${data.content}"`;
    quoteAuthor.textContent = `- ${data.author}`;
    statusText.textContent = `Quote #${data.id} loaded`;

    card.classList.remove("quote-refresh");
    void card.offsetWidth;
    card.classList.add("quote-refresh");
  } catch (error) {
    quoteContent.textContent = "Could not load a quote right now.";
    quoteAuthor.textContent = "";
    statusText.textContent = "Unable to reach API. Make sure the server is running, then try again.";
    console.error(error);
  } finally {
    button.disabled = false;
  }
}

button.addEventListener("click", fetchRandomQuote);
window.addEventListener("DOMContentLoaded", fetchRandomQuote);
