function startCountdown(duration, display, resendButton,otpVerifyButton) {
    let timer = duration;
    const interval = setInterval(function () {
      const minutes = Math.floor(timer / 60);
      const seconds = timer % 60;
      display.textContent = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

      if (timer <= 0) {
        clearInterval(interval);
        display.style.display = "none";
        resendButton.removeAttribute("hidden");
        otpVerifyButton.setAttribute("hidden", "true");
      }
      else{
        otpVerifyButton.removeAttribute("hidden");
      }

      timer--;
    }, 1000);
  }

  window.onload = function () {
    const countdownDisplay = document.getElementById("countdown");
    const resendButton = document.getElementById("resendButton");
    const otpVerifyButton = document.getElementById("otpVerifyButton");
    const totalSeconds = 30;

    startCountdown(totalSeconds, countdownDisplay, resendButton,otpVerifyButton);
  };