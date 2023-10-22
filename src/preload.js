document.addEventListener("DOMContentLoaded", () => {
  const pause = document.querySelector("#pause");
  const link = document.querySelector("#link");
  const resume = document.querySelector("#resume");
  const createPopUp = document.querySelector("#createPopup");

  createPopUp.addEventListener("click", () => {
    window.browserProxy = window.open(
      "popup.html",
      "_blank",
      "height=200, width=250, frame=false"
    );
  });

  window.addEventListener("message", (e) => {
    if (e.data === "cancel") {
      window.browserProxy.close();
    } else {
      link.setAttribute("href", e.data);

      window.browserProxy.close();
    }
  });

  pause.style.display = "none";
  resume.style.display = "none";

  const { port1, port2 } = new MessageChannel();

  link.addEventListener("click", () => {
    ipcRenderer.postMessage("download-started", null, [port2]);
    pause.style.display = "inline-block";
  });

  pause.addEventListener("click", () => {
    port1.postMessage("pause");
    pause.style.display = "none";
    resume.style.display = "inline-block";
  });

  resume.addEventListener("click", () => {
    port1.postMessage("resume");
    resume.style.display = "none";
    pause.style.display = "inline-block";
  });
});
