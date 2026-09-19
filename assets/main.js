document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  var form = document.querySelector(".contact-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector("button[type=submit]");
      var name = form.querySelector("#name").value || "";
      var email = form.querySelector("#email").value || "";
      var message = form.querySelector("#message").value || "";
      var subject = encodeURIComponent("Anfrage über die Website von " + name);
      var body = encodeURIComponent(message + "\n\nE-Mail: " + email);
      window.location.href = "mailto:info@a-bbau.de?subject=" + subject + "&body=" + body;
    });
  }
});
