const year = document.querySelector("#year");
const form = document.querySelector("#rfqForm");
const revealItems = document.querySelectorAll(".reveal");
const holoCards = document.querySelectorAll(".holo-card");
const hero = document.querySelector(".hero");
const heroPanel = document.querySelector(".hero-panel");
const localRfqKey = "metalcorex-local-rfqs";

if (year) {
  year.textContent = new Date().getFullYear();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => observer.observe(item));

holoCards.forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${x}%`);
    card.style.setProperty("--my", `${y}%`);
  });
});

if (hero) {
  hero.addEventListener("pointermove", (event) => {
    if (!heroPanel || window.matchMedia("(max-width: 860px)").matches) {
      return;
    }

    const x = (event.clientX / window.innerWidth - 0.5) * 12;
    const y = (event.clientY / window.innerHeight - 0.5) * 12;
    heroPanel.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  });

  hero.addEventListener("pointerleave", () => {
    if (heroPanel) {
      heroPanel.style.transform = "";
    }
  });
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const status = document.querySelector("#rfqStatus");
    const data = new FormData(form);

    if (status) {
      status.textContent = "Submitting RFQ and drawing files...";
    }

    try {
      const response = await fetch("/api/rfq", {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      form.reset();

      if (status) {
        status.textContent = "RFQ submitted successfully. We will review your drawings and contact you soon.";
      }
    } catch (error) {
      const files = data.getAll("drawings").filter((file) => file && file.name);
      const localRfqs = JSON.parse(localStorage.getItem(localRfqKey) || "[]");

      localRfqs.push({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        created_at: new Date().toISOString(),
        name: data.get("name"),
        company: data.get("company"),
        email: data.get("email"),
        country: data.get("country"),
        process: data.get("process"),
        material: data.get("material"),
        quantity: data.get("quantity"),
        details: data.get("details"),
        files: files.map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
        })),
      });

      localStorage.setItem(localRfqKey, JSON.stringify(localRfqs));
      form.reset();

      if (status) {
        status.textContent = "Local preview saved. After Cloudflare backend deployment, RFQs and drawing files will be stored online.";
      }
    }
  });
}
