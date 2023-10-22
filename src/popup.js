const button = document.querySelector("#download");
const cancel = document.querySelector("#cancel");

cancel.addEventListener("click", () => {
  window.opener.postMessage("cancel", "*");
});

button.addEventListener("click", () => {
  const link = document.querySelector("input").value;
  window.opener.postMessage(link, "*");
});
