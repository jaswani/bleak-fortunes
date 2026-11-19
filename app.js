(() => {
  const button = document.getElementById("reveal-fortune");
  const text = document.getElementById("fortune-text");
  const count = document.getElementById("fortune-count");
  const share = document.getElementById("share-fortune");

  // Phones get the native share sheet; desktops get copy-to-clipboard,
  // because desktop share sheets are inconsistent and often missing.
  const useNativeShare =
    typeof navigator.share === "function" &&
    window.matchMedia("(pointer: coarse)").matches;
  const shareLabel = useNativeShare ? "Share this fortune" : "Copy this fortune";

  // Shuffle bag: every fortune shows once before any repeats, so a curious
  // visitor never sees the same line twice in a row.
  let bag = [];
  let last = null;
  let revealed = 0;

  function refill() {
    bag = FORTUNES.slice();
    for (let i = bag.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [bag[i], bag[j]] = [bag[j], bag[i]];
    }
    if (bag.length > 1 && bag[bag.length - 1] === last) {
      [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
  }

  function next() {
    if (bag.length === 0) refill();
    last = bag.pop();
    return last;
  }

  button.addEventListener("click", () => {
    text.classList.remove("is-revealed");
    // Force a reflow so the reveal animation replays on every click.
    void text.offsetWidth;
    text.textContent = next();
    text.classList.add("is-revealed");

    revealed += 1;
    button.textContent = "Another, if you dare";
    count.textContent =
      revealed === 1
        ? "1 fortune revealed. It does not get better."
        : `${revealed} fortunes revealed. Still no better.`;
    share.hidden = false;
    share.textContent = shareLabel;
  });

  let resetTimer;

  function flash(label) {
    share.textContent = label;
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => { share.textContent = shareLabel; }, 2000);
  }

  share.addEventListener("click", async () => {
    const url = window.location.origin + "/";
    const message = `"${last}" (via Bleak Fortunes)`;
    if (useNativeShare) {
      try {
        await navigator.share({ title: "Bleak Fortunes", text: message, url });
      } catch (err) {
        // AbortError means the user closed the sheet; nothing to report.
        if (err.name !== "AbortError") flash("Could not share");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${message} ${url}`);
      flash("Copied");
    } catch {
      flash("Could not copy");
    }
  });
})();
