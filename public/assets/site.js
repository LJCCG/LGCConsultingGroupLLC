// Mobile menu: toggle the nav links as a dropdown under the header.
document.querySelectorAll("[data-menu]").forEach((button) =>
  button.addEventListener("click", () => {
    const links = document.querySelector(".navlinks");
    links.style.display = links.style.display === "flex" ? "none" : "flex";
    links.style.flexDirection = "column";
    links.style.position = "absolute";
    links.style.top = "68px";
    links.style.left = "0";
    links.style.right = "0";
    links.style.background = "#fff";
    links.style.padding = "20px";
    links.style.borderBottom = "1px solid #dbe2e8";
  }),
);

// Contact form: open the visitor's email app with the inquiry pre-filled.
document.querySelectorAll("form[data-mail]").forEach((form) =>
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = "Consulting Inquiry - LJC Consulting Group";
    const body = [
      `Name: ${data.get("name")}`,
      `Organization: ${data.get("organization")}`,
      `Email: ${data.get("email")}`,
      `Phone: ${data.get("phone") || ""}`,
      `Area of Interest: ${data.get("interest")}`,
      "",
      "Message:",
      data.get("message"),
    ].join("\n");
    location.href = `mailto:info@LJCCG.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }),
);
