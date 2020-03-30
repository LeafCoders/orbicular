import { LitElement, html, property, customElement } from 'lit-element';
import '@polymer/iron-ajax/iron-ajax.js';

@customElement('orbicular-slides-ajax')
export class OrbicularSlidesAjax extends LitElement {

  @property({type: String, attribute: 'rosette-base-url'})
  rosetteBaseUrl: String;

  @property({type: String, attribute: 'slide-show-id-alias'})
  slideShowIdAlias: String;

  protected render() {
    return html`
      <iron-ajax
          auto
          url="${this.rosetteBaseUrl}/api/slideShows/public/${this.slideShowIdAlias}"
          params="{}"
          handle-as="json"
          @response="${this.handleResponse}"
          debounce-duration="300">
      </iron-ajax>
    `;
  }

  constructor() {
    super();

    setInterval(() => {
      (<any>this.shadowRoot.querySelector('iron-ajax')).generateRequest();
    }, 5 * 60 * 1000); // Update every 5 minutes
  }

  private handleResponse(event: any): void {
    const slides: Array<any> = event.detail.response.slides;
    if (slides !== undefined) {
      this.dispatchEvent(new CustomEvent('slides', {detail: slides}));
    }
  }
}
