const modal = document.getElementById("modal");
const balanceEl = document.getElementById("balance");
const activityPanel = document.getElementById("activityPanel");
const recent = [];

function setBalance(n) {
  balanceEl.textContent = Number(n).toLocaleString();
}

function addActivity(title, won, message) {
  recent.unshift({ title, won, message });
  recent.splice(5);
  activityPanel.innerHTML = recent.map(x => `
    <div class="activity-row">
      <div><strong>${x.title}</strong><div style="color:#77828d;margin-top:3px">${x.message}</div></div>
      <strong class="${x.won ? "win" : "loss"}">${x.won ? "WIN" : "LOSS"}</strong>
    </div>
  `).join("");
}

function openGame(name) {
  modal.classList.remove("hidden");
  document.querySelectorAll(".modal-content").forEach(x => x.classList.add("hidden"));
  document.getElementById(name + "Game").classList.remove("hidden");
}

document.querySelectorAll("[data-open]").forEach(btn => {
  btn.addEventListener("click", () => openGame(btn.dataset.open));
});

document.getElementById("closeModal").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.section).scrollIntoView({behavior:"smooth"});
  });
});

document.querySelectorAll(".filter").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const value = btn.textContent.trim();
    document.querySelectorAll(".game-card").forEach(card => {
      card.style.display = value === "All" || card.dataset.category === value ? "" : "none";
    });
  });
});

document.getElementById("resetBtn").addEventListener("click", async () => {
  const res = await fetch("/api/reset", {method:"POST"});
  const data = await res.json();
  setBalance(data.credits);
  recent.length = 0;
  activityPanel.innerHTML = '<div class="empty">Balance reset. No rounds yet.</div>';
});

async function play(endpoint, payload, resultId, title) {
  const result = document.getElementById(resultId);
  result.textContent = "Running...";
  const res = await fetch(endpoint, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(payload)
  });
  const data = await res.json();

  if (!data.ok) {
    result.textContent = data.error || "Something went wrong.";
    return;
  }
  setBalance(data.credits);
  result.textContent = data.message;
  addActivity(title, data.won, data.message);
}

document.getElementById("diceBtn").addEventListener("click", () => {
  play("/api/dice", {
    amount: Number(document.getElementById("diceAmount").value),
    guess: Number(document.getElementById("diceGuess").value)
  }, "diceResult", "Dice Dash");
});

let coinChoice = "heads";
document.querySelectorAll("[data-choice]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-choice]").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    coinChoice = btn.dataset.choice;
  });
});

document.getElementById("coinBtn").addEventListener("click", () => {
  play("/api/coinflip", {
    amount: Number(document.getElementById("coinAmount").value),
    choice: coinChoice
  }, "coinResult", "Chip Flip");
});

document.querySelectorAll("#tileGrid button").forEach((tile, index) => {
  tile.addEventListener("click", async () => {
    const amount = Number(document.getElementById("minesAmount").value);
    const result = document.getElementById("minesResult");
    result.textContent = "Revealing...";
    const res = await fetch("/api/mines", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({amount})
    });
    const data = await res.json();
    if (!data.ok) {
      result.textContent = data.error || "Something went wrong.";
      return;
    }
    setBalance(data.credits);
    document.querySelectorAll("#tileGrid button").forEach(x => x.classList.remove("safe","mine"));
    tile.classList.add(data.won ? "safe" : "mine");
    if (!data.won && document.querySelectorAll("#tileGrid button")[data.mine]) {
      document.querySelectorAll("#tileGrid button")[data.mine].classList.add("mine");
    }
    result.textContent = data.message;
    addActivity("Chip Mines", data.won, data.message);
  });
});
