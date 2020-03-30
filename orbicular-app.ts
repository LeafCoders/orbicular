import { LitElement, html, css, property, customElement } from 'lit-element';
import { Slide } from './src/slide';
import { OrbicularPageContainer } from './src/orbicular-page-container';

import './src/orbicular-slides-ajax';
import './src/orbicular-page-container';

@customElement('orbicular-app')
export class OrbicularApp extends LitElement {
  @property({type: String, attribute: 'rosette-base-url'})
  rosetteBaseUrl: String = undefined;

  @property({type: String, attribute: 'slide-show-id-alias'})
  slideShowIdAlias: String = undefined;

  @property({type: Boolean})
  showIndicator: boolean = true;

  static get styles() {
    return [
      css`
        :host {
          display: block;
        }
      `
    ];
  }

  protected render() {
    return html`
      <orbicular-slides-ajax
        rosette-base-url="${this.rosetteBaseUrl}"
        slide-show-id-alias="${this.slideShowIdAlias}"
        @slides="${this.onSlidesEvent}">
      </orbicular-slides-ajax>
      <orbicular-page-container ?show-indicator="${this.showIndicator}"></orbicular-page-container>
    `;
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('keydown', this.onKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('readystatechange', this.onKeyDown);
    super.disconnectedCallback();
  }

  private onKeyDown = (event: any): void => {
    const container: OrbicularPageContainer = this.shadowRoot.querySelector('orbicular-page-container');
    if (event.code === 'ArrowRight' || event.code === 'Space') {
      container.nextSlide();
    }
    if (event.code === 'ArrowLeft') {
      container.previousSlide();
    }
  }

  private onSlidesEvent(slidesEvent: CustomEvent<Array<Slide>>): void {
    const container: OrbicularPageContainer = this.shadowRoot.querySelector('orbicular-page-container');
    container.slides = slidesEvent.detail;
  }
}
