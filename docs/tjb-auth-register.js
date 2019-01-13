import WebComponent from "https://tjb-webcomponents.github.io/tjb-webcomponent/tjb-wc.min.js";
import html from "https://tjb-webcomponents.github.io/html-template-string/html-template-string.js";
import { bounce } from "https://tjb-webcomponents.github.io/tjb-gfx/tjb-gfx.min.js";
import "https://tjb-webcomponents.github.io/tjb-input/tjb-input.min.js";
import "https://tjb-webcomponents.github.io/tjb-statusbar/tjb-statusbar.min.js";
import "https://tjb-webcomponents.github.io/tjb-notify/tjb-notify.min.js";

class tjbAuthRegister extends WebComponent() {
  // Styles
  /////////////////////////////////////////////////////////////

  CSS() {
    return html`
      <style>
        :host {
          --register-color-info: grey;

          /* notify */
          --register-notify-background-error: #fa354c;
          --register-notify-background-success: limegreen;
          --register-notify-color-error: white;
          --register-notify-color-success: white;
          --register-notify-margin: -55px -40px 20px;
          --register-notify-padding: 15px 15px 15px 35px;

          /* input */
          --register-input-color-error: #fa354c;
          --register-input-color-success: limegreen;
          --register-input-padding: 10px;
          --register-input-margin: 0 0 30px 0;
          --register-input-width: 100%;
          --register-input-border: 1px solid transparent;
          --register-input-border-bottom: 1px solid lightgrey;
          --register-input-border-radius: 0;
          --register-input-font-size: 1rem;
          --register-input-info-color: grey;
          --register-input-info-font-size: 0.8rem;
          --register-input-label-margin: 0 0 5px 0;

          background: #fff;
          display: block;
          max-width: 350px;
          box-sizing: border-box;
          overflow: hidden;
          position: relative;
          padding: 55px 40px 10px;
          box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
        }

        tjb-input {
          --input-color-error: var(--register-input-color-error);
          --input-color-success: var(--register-input-color-success);
          --input-padding: var(--register-input-padding);
          --input-margin: var(--register-input-margin);
          --input-width: var(--register-input-width);
          --input-border: var(--register-input-border);
          --input-border-bottom: var(--register-input-border-bottom);
          --input-border-radius: var(--register-input-border-radius);
          --input-font-size: var(--register-input-font-size);
          --input-info-color: var(--register-input-info-color);
          --input-info-font-size: var(--register-input-info-font-size);
          --input-label-margin: var(--register-input-label-margin);
        }

        tjb-notify {
          --notify-background-error: var(--register-notify-background-error);
          --notify-background-success: var(
            --register-notify-background-success
          );
          --notify-color-error: var(--register-notify-color-error);
          --notify-color-success: var(--register-notify-color-success);
          --notify-margin: var(--register-notify-margin);
          --notify-padding: var(--register-notify-padding);
        }

        .alert {
          animation: shake 150ms linear 3;
        }

        .login__fieldset {
          margin-bottom: 30px;
        }

        .login__fieldset--center {
          text-align: center;
        }

        .login__info {
          text-align: center;
          margin-bottom: 10px;
          color: var(--register-color-info);
        }

        .login__footnote {
          text-align: center;
        }

        @keyframes blink {
          50% {
            background: transparent;
          }
        }

        @keyframes shake {
          25% {
            transform: translateX(-5%);
          }

          50% {
            transform: translateX(5%);
          }
        }
      </style>
    `;
  }

  // Markup
  ////////////////////////////////////////////////////////////

  HTML() {
    this.statusbar = html`
      <tjb-statusbar></tjb-statusbar>
    `;

    this.emailInput = html`
      <tjb-input
        label="Email"
        type="email"
        name="email"
        required="true"
        errormessage="Please check your email address"
      ></tjb-input>
    `;

    this.passwordInput = html`
      <tjb-input
        label="Password"
        type="password"
        name="password"
        info="minimum 8 digits"
        pattern=".{8,}"
        required="true"
        errormessage="Please check your password"
      ></tjb-input>
    `;

    this.messageNode = html`
      <tjb-notify></tjb-notify>
    `;

    return html`
      <form class="login__form" onsubmit="${e => this.registerHandler(e)}">
        ${this.messageNode}
        <div class="login__fieldset">
          <div class="login__info">Register using your email:</div>
        </div>
        <div class="login__fieldset">
          ${this.emailInput} ${this.passwordInput}
          <slot name="submit" onclick="${e => this.registerHandler(e)}"></slot>
          <div class="login__footnote">
            <a
              href="#login"
              class="link"
              onclick="${e => this.openHandler(e, "login")}"
              >Login Here</a
            >
          </div>
        </div>
        ${this.statusbar}
      </form>
    `;
  }

  // Attribute Handling
  ////////////////////////////////////////////////////////////

  static get observedAttributes() {
    return ["postbody", "posturl"];
  }

  // Logic
  ////////////////////////////////////////////////////////////

  registerHandler(event) {
    event.preventDefault();
    if (!this.checkValidity()) return false;

    this.statusbar.status = "loading";

    const postbody = this.postbody && this.postbody.replace(/\'/g, '"');
    const body = Object.assign({}, {
      email: this.emailInput.value,
      password: this.passwordInput.value
    }, JSON.parse(postbody || "{}"));

    this.dispatchEvent("register", body);
    if (!this.posturl) return false;

    return fetch(this.posturl, {
      method: "POST",
      redirect: "follow",
      credentials: "include",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify(body)
    }).then(resp => resp.json()).then(resp => {
      if (resp.error) throw resp;
      return this._loginSuccess(resp);
    }).catch(resp => this._loginError(resp));
  }

  _loginSuccess(resp) {
    this.success().then(this.dispatchEvent.bind(this, "success", resp));
  }

  _loginError(resp) {
    this.dispatchEvent("error", resp);
    this.error();
  }

  success() {
    return bounce(this.domNode);
  }

  error() {
    return this.errorHandler();
  }

  checkValidity() {
    return [this.emailInput.checkValidity(), this.passwordInput.checkValidity()].every(check => check);
  }

  openHandler(event, target) {
    event.preventDefault();
    bounce(event.target).then(this._location.bind(this, event.target.href, target));
  }

  _location(href, target) {
    this.dispatchEvent("redirect", {
      href,
      target
    });
  }

  errorHandler() {
    this.writeMessageError = this.writeMessageError.bind(this);
    this.statusbar.status = "alert";
    this.domNode.addEventListener("animationend", this.writeMessageError);
    this.domNode.classList.remove("alert");
    setTimeout(() => this.domNode.classList.add("alert"), 100);
  }

  writeMessageError() {
    this.domNode.removeEventListener("animationend", this.writeMessageError);

    this.messageNode.error = html`
      <ul>
        <li>
          <a
            onclick="${() => this.emailInput.inputNode.focus()}"
            href="#"
            class="message__link"
            >Wrong email</a
          >
          or
          <a
            onclick="${() => this.passwordInput.inputNode.focus()}"
            href="#"
            class="message__link"
            >password</a
          >
        </li>
        <li>
          Don’t have an account yet?
          <a
            onclick="${e => this.openHandler(e, "login")}"
            href="#login"
            class="message__link"
            >Login here</a
          >
        </li>
      </ul>
    `;

    this.emailInput.showMessage("error");
    this.passwordInput.showMessage("error");
  }
}

customElements.define("tjb-auth-register", tjbAuthRegister);
