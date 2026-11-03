// Mobile menu toggle
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
});
mainNav?.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));

// Sticky topbar scroll shadow
const topbar = document.querySelector(".topbar");
const handleScrollHeader = () => {
  if (topbar) {
    topbar.classList.toggle("scrolled", window.scrollY > 30);
  }
};
window.addEventListener("scroll", handleScrollHeader, { passive: true });
handleScrollHeader();

// Scroll progress bar
const progress = document.getElementById("scrollProgress");
const updateProgress = () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  if (progress) {
    progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + "%";
  }
};
window.addEventListener("scroll", updateProgress, { passive: true });
updateProgress();

// Scroll reveal animations
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

// Active nav highlight on scroll
const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll(".main-nav a")];
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
    }
  });
}, { rootMargin: "-35% 0px -55% 0px" });
sections.forEach(s => sectionObserver.observe(s));

// Current footer year
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ==========================================
// A. Key Metrics Strip: Animated Count-up
// ==========================================
const counterElements = document.querySelectorAll(".count-up");
const countObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.getAttribute("data-target"), 10) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1300;
      const startTime = performance.now();

      const step = (now) => {
        const elapsed = now - startTime;
        const progressVal = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progressVal, 3);
        const current = Math.round(target * ease);
        el.textContent = current + suffix;
        if (progressVal < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target + suffix;
        }
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    }
  });
}, { threshold: 0.25 });
counterElements.forEach(el => countObserver.observe(el));

// ==========================================
// C. Journey / Experience: Interactive Pins
// ==========================================
const journeyStops = document.querySelectorAll(".journey-stop");
journeyStops.forEach(stop => {
  const activateStop = () => {
    journeyStops.forEach(s => s.classList.remove("active"));
    stop.classList.add("active");
  };

  stop.addEventListener("mouseenter", activateStop);
  stop.addEventListener("click", activateStop);
  stop.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activateStop();
    }
  });
});
const defaultStop = document.querySelector(".stop-2026");
if (defaultStop) defaultStop.classList.add("active");

// ==========================================
// D. Consolidated Publications & Scholarly Hub
// ==========================================
const list = document.getElementById("publicationList");
const count = document.getElementById("publicationCount");
const showMore = document.getElementById("showMore");
const search = document.getElementById("publicationSearch");
const filters = [...document.querySelectorAll(".filter-btn")];
let activeFilter = "all";
let expanded = false;

function renderPubs() {
  if (!list || !count) return;
  const q = (search?.value || "").trim().toLowerCase();

  const filtered = PUBLICATIONS.filter(p => {
    let matchesFilter = true;
    if (activeFilter === "all") matchesFilter = true;
    else if (activeFilter === "journal") matchesFilter = p.type === "journal";
    else if (activeFilter === "first-author") matchesFilter = Boolean(p.is_first_author);
    else if (activeFilter === "chapter") matchesFilter = p.type === "chapter";
    else if (activeFilter === "patent") matchesFilter = p.type === "patent";
    else if (activeFilter === "review") matchesFilter = p.status === "review" || p.status === "communication";
    else if (activeFilter === "published") matchesFilter = p.status === "published";

    const searchableText = [
      p.title,
      p.authors,
      p.journal,
      p.publisher || "",
      p.patent_number || "",
      p.status,
      p.label,
      String(p.year)
    ].join(" ").toLowerCase();

    return matchesFilter && searchableText.includes(q);
  });

  const visible = expanded ? filtered : filtered.slice(0, 6);

  list.innerHTML = visible.map((p, i) => {
    const isFirst = p.is_first_author;
    const isChapter = p.type === "chapter";
    const isPatent = p.type === "patent";

    let badgesHtml = `<span class="pub-year">${p.year}</span><span class="pub-status ${p.status}">${p.label}</span>`;
    if (isFirst) {
      badgesHtml += `<span class="author-badge first-author"><span class="badge-star">★</span> First Author</span>`;
    }
    if (isChapter) {
      badgesHtml += `<span class="author-badge chapter-badge">📖 Book Chapter</span>`;
    }
    if (isPatent) {
      badgesHtml += `<span class="author-badge patent-badge">✦ Patent Application</span>`;
    }

    const isUnpublished = p.status === "communication" || p.status === "review";

    // Action chips (DOI, Scholar, Details)
    let linksHtml = "";
    if (p.doi) {
      linksHtml += `<a class="pub-link-chip doi-chip" href="https://doi.org/${p.doi}" target="_blank" rel="noopener" title="Direct DOI to publisher"><span>DOI</span> ↗</a>`;
    }
    if (!isUnpublished && p.scholar_url) {
      linksHtml += `<a class="pub-link-chip scholar-chip" href="${p.scholar_url}" target="_blank" rel="noopener" title="View citation and record on Google Scholar"><span>Scholar</span> ↗</a>`;
    }
    if (!isUnpublished && p.slug) {
      linksHtml += `<a class="pub-link-chip detail-chip" href="publications/${p.slug}.html" title="View abstract, chemical concepts and citation details"><span>Details</span> ↗</a>`;
    }

    const titleMarkup = (!isUnpublished && p.slug)
      ? `<a href="publications/${p.slug}.html">${p.title}</a>`
      : ((!isUnpublished && p.scholar_url) ? `<a href="${p.scholar_url}" target="_blank" rel="noopener">${p.title}</a>` : p.title);

    return `
      <article class="pub-card ${isFirst ? 'first-author-card' : ''} ${isChapter ? 'chapter-card' : ''} ${isPatent ? 'patent-card' : ''}" style="animation-delay:${Math.min(i * 0.035, 0.25)}s">
        <div class="pub-number">${String(p.id).padStart(2, "0")}</div>
        <div class="pub-content">
          <div class="pub-meta">${badgesHtml}</div>
          <h3 class="pub-title">${titleMarkup}</h3>
          <p class="pub-authors">${p.authors}</p>
          <div class="pub-journal">${p.journal}</div>
          ${linksHtml ? `<div class="pub-links">${linksHtml}</div>` : ""}
        </div>
      </article>
    `;
  }).join("");

  count.textContent = `Showing ${visible.length} of ${filtered.length} scholarly outputs`;
  if (showMore) {
    showMore.hidden = filtered.length <= 6;
    showMore.innerHTML = expanded
      ? 'Show fewer outputs <span>↑</span>'
      : `Show all outputs (${filtered.length}) <span>↓</span>`;
  }

  if (!filtered.length) {
    list.innerHTML = '<div class="empty-state"><span class="empty-icon">⌕</span><p>No scholarly outputs match that query or filter. Try a broader search keyword or select "All Outputs".</p></div>';
  }

  attachCiteListeners();
}

// Cite modal integration
const citeModal = document.getElementById("citeModal");
const citeModalClose = document.getElementById("citeModalClose");
const citeModalBackdrop = document.getElementById("citeModalBackdrop");
const citeTitleEl = document.getElementById("citeModalTitle");
const citeApaText = document.getElementById("citeApaText");
const citeBibtexText = document.getElementById("citeBibtexText");
const copyApaBtn = document.getElementById("copyApaBtn");
const copyBibtexBtn = document.getElementById("copyBibtexBtn");
const citeCopyToast = document.getElementById("citeCopyToast");
const citeTabs = document.querySelectorAll(".cite-tab-btn");

function showCiteToast(msg = "✓ Copied to clipboard!") {
  if (citeCopyToast) {
    citeCopyToast.textContent = msg;
    citeCopyToast.classList.add("show");
    setTimeout(() => citeCopyToast.classList.remove("show"), 2200);
  }
}

function attachCiteListeners() {
  document.querySelectorAll(".cite-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      const pubId = parseInt(btn.dataset.id, 10);
      const pub = PUBLICATIONS.find(p => p.id === pubId);
      if (!pub || !citeModal) return;

      if (citeTitleEl) citeTitleEl.textContent = pub.title;

      // Generate APA citation
      const apa = `${pub.authors} (${pub.year}). ${pub.title}. ${pub.journal}${pub.doi ? `. https://doi.org/${pub.doi}` : ""}`;
      if (citeApaText) citeApaText.textContent = apa;

      // Generate BibTeX entry
      const cleanKey = "sood" + pub.year + "_" + pub.id;
      const authorsBib = pub.authors.split(", ").join(" and ");
      const bibtex = `@article{${cleanKey},\n  title = {${pub.title}},\n  author = {${authorsBib}},\n  journal = {${pub.journal}},\n  year = {${pub.year}}${pub.doi ? `,\n  doi = {${pub.doi}}` : ""}${pub.scholar_url ? `,\n  url = {${pub.scholar_url}}` : ""}\n}`;
      if (citeBibtexText) citeBibtexText.textContent = bibtex;

      // Open dialog
      if (typeof citeModal.showModal === "function") {
        citeModal.showModal();
      } else {
        citeModal.setAttribute("open", "");
      }
    });
  });
}

// Modal tab switching
citeTabs.forEach(tab => {
  tab.addEventListener("click", () => {
    citeTabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.querySelectorAll(".cite-tab-content").forEach(content => {
      content.classList.toggle("active", content.id === `citeContent${target.charAt(0).toUpperCase() + target.slice(1)}`);
    });
  });
});

// Copy APA
copyApaBtn?.addEventListener("click", async () => {
  const text = citeApaText?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    showCiteToast("✓ APA citation copied!");
  } catch (_) {
    window.prompt("Copy APA citation:", text);
  }
});

// Copy BibTeX
copyBibtexBtn?.addEventListener("click", async () => {
  const text = citeBibtexText?.textContent || "";
  try {
    await navigator.clipboard.writeText(text);
    showCiteToast("✓ BibTeX entry copied!");
  } catch (_) {
    window.prompt("Copy BibTeX:", text);
  }
});

// Close citation modal
const closeCiteDialog = () => {
  if (typeof citeModal?.close === "function") {
    citeModal.close();
  } else {
    citeModal?.removeAttribute("open");
  }
};
citeModalClose?.addEventListener("click", closeCiteDialog);
citeModalBackdrop?.addEventListener("click", closeCiteDialog);
citeModal?.addEventListener("cancel", (e) => {
  e.preventDefault();
  closeCiteDialog();
});

filters.forEach(btn => btn.addEventListener("click", () => {
  filters.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeFilter = btn.dataset.filter;
  expanded = false;
  renderPubs();
}));

search?.addEventListener("input", () => {
  expanded = false;
  renderPubs();
});

showMore?.addEventListener("click", () => {
  expanded = !expanded;
  renderPubs();
  if (!expanded) {
    document.getElementById("publications")?.scrollIntoView({ behavior: "smooth" });
  }
});

renderPubs();

// ==========================================
// E. Conferences: Expandable Interactive Timeline
// ==========================================
const confFilterBtns = document.querySelectorAll(".conf-btn");
const confYearArticles = document.querySelectorAll(".conference-year");

confFilterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    confFilterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const targetYear = btn.dataset.year;

    confYearArticles.forEach(article => {
      const year = article.dataset.year;
      if (targetYear === "all" || year === targetYear) {
        article.classList.remove("conf-hidden");
        const toggle = article.querySelector(".conf-accordion-toggle");
        if (toggle) toggle.setAttribute("aria-expanded", "true");
        article.classList.add("open");
      } else {
        article.classList.add("conf-hidden");
      }
    });
  });
});

document.querySelectorAll(".conf-accordion-toggle").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const article = toggle.closest(".conference-year");
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    article?.classList.toggle("open", !isExpanded);
  });
});

// ==========================================
// F. Patent Document 3D Parallax Tilt
// ==========================================
const patentVisual = document.querySelector(".patent-visual");
const patentDoc = document.querySelector(".patent-document");

if (patentVisual && patentDoc) {
  patentVisual.addEventListener("mousemove", (e) => {
    const rect = patentVisual.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rotX = -(y / rect.height) * 16;
    const rotY = (x / rect.width) * 16;
    patentDoc.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${(rotY + 4).toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
  });

  patentVisual.addEventListener("mouseleave", () => {
    patentDoc.style.transform = "perspective(1000px) rotate(5deg) scale3d(1, 1, 1)";
  });
}

// ==========================================
// G. Contact Section: Copy Email & Collaboration Form
// ==========================================
const copyEmailBtn = document.getElementById("copyEmailBtn");
const copyToast = document.getElementById("copyToast");

if (copyEmailBtn) {
  copyEmailBtn.addEventListener("click", async () => {
    const emailToCopy = "kskritikasood28@gmail.com";
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(emailToCopy);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = emailToCopy;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      if (copyToast) {
        copyToast.classList.add("show");
        const copyBtnText = copyEmailBtn.querySelector(".copy-btn-text");
        if (copyBtnText) copyBtnText.textContent = "Copied!";
        setTimeout(() => {
          copyToast.classList.remove("show");
          if (copyBtnText) copyBtnText.textContent = "Copy";
        }, 2500);
      }
    } catch (err) {
      window.prompt("Copy email address:", emailToCopy);
    }
  });
}

const collabForm = document.getElementById("collabForm");
if (collabForm) {
  collabForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("formName")?.value || "";
    const email = document.getElementById("formEmail")?.value || "";
    const topic = document.getElementById("formTopic")?.value || "Research Collaboration";
    const message = document.getElementById("formMessage")?.value || "";

    const subject = encodeURIComponent(`${topic} - Dr. Kritika Sood (${name})`);
    const body = encodeURIComponent(
      `Dear Dr. Kritika Sood,\n\n${message}\n\nFrom:\n${name}\nEmail: ${email}\nPurpose: ${topic}`
    );

    window.location.href = `mailto:kskritikasood28@gmail.com?subject=${subject}&body=${body}`;
  });
}
