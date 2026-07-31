/**
 * Contact Section Module
 */

export async function renderContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("button[type='submit']");
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = "<span>Message Sent!</span>";
    btn.style.borderColor = "var(--accent)";
    btn.style.color = "var(--accent)";

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.innerHTML = originalText;
      btn.style.borderColor = "";
      btn.style.color = "";
    }, 3000);
  });
}
