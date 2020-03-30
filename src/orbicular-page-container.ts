import { html, css, customElement, LitElement, property, PropertyValues } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { Slide } from './slide';

@customElement('orbicular-page-container')
export class OrbicularPageContainer extends LitElement {

  @property({type: Array})
  slides: Array<Slide> = [];

  @property({type: Boolean, attribute: "show-indicator"})
  showIndicator: boolean = true;

  @property({type: Array})
  private visibleSlides: Array<any> = [];

  static get styles() {
    return [
      css`
        :host {
          width: 100vw;
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #222;
        }
        #container {
          flex: 1;
          height: 100%;
          position: relative;
        }
        #pages {
          display: block;
          height: 100%;
        }
        .page {
          position: absolute;
          left: 0;
          top: 0;
          right: 0;
          bottom: 0;
          opacity: 1;
          animation-duration: 0.1s;
          animation-fill-mode: forwards;
        }
        .center-all {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        #indicator {
          display: flex;
          justify-content: center;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
        }
        #indicator div {
          flex: 1 0 auto;
          height: 4px;
          background-color: rgba(120, 120, 120, 0.3);
          transition: 1s;
        }
        #indicator div[active] {
          background-color: rgba(0, 200, 0, 0.6);
        }
        iframe {
          border: 0;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        @keyframes fadeIn {
          0% {opacity: 0;}
          100% {opacity: 1;}
        }
        .fadeIn {
          animation-duration: 0.5s;
          animation-name: fadeIn;
        }

        @keyframes fadeOut {
          0% {opacity: 1;}
          100% {opacity: 0;}
        }
        .fadeOut {
          animation-name: fadeOut;
        }
      `
    ];
  }

  protected render() {
    return html`
      <div id="container">
        <div id="pages">
          ${this.visibleSlides.map(item => {
            return html`
              <div id="page_${item.id}" class="page center-all ${classMap(item.classes)}">
              ${item.webpageUrl
                ? html`<iframe seamless src="${item.webpageUrl}"></iframe>`
                : html`<img width="${item.width}" height="${item.height}" src="${item.imageUrl}">`
              }
              </div>
            `;  
          })}
        </div>
        ${this.showIndicator
          ? html`
            <div id="indicator">
              ${this.visibleSlides.map((_ignore, index) => {
                return html`<div ?active="${this.visibleSlideIndex === index}"></div>`;
              })}
            </div>`
          : ''
        }
      </div>
    `;
  }

  private timeoutId: number = undefined;
  private visibleSlideIndex: number = 0;
  private hasNewItems: boolean = true;
  private windowWidth: number = this.offsetWidth;
  private windowHeight: number = this.offsetHeight;

  protected firstUpdated(): void {
    if ((<any>window).ResizeObserver) {
      const ro = new (<any>window).ResizeObserver(() => {
        this.windowWidth = this.offsetWidth;
        this.windowHeight = this.offsetHeight;
        this.visibleSlides = this.buildVisibleSlides(this.slidesInTimeRange(this.slides));
      });
      ro.observe(this);
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has('slides')) {
      this.slidesChanged();
    }
  }  

  nextSlide(): void {
    this.clearSlideTimeout();
    this.showNextSlide(+1);
  }

  previousSlide(): void {
    this.clearSlideTimeout();
    this.showNextSlide(-1);
  }

  private showNextSlide(direction: number): void {
    const lastIndex: number = this.visibleSlideIndex;
    if (this.hasNewItems) {
      this.mergeCurrentWithNewItems();
      this.hasNewItems = false;
    }

    let duration: number;
    if (this.visibleSlides && this.visibleSlides.length > 0) {
      this.visibleSlideIndex = (this.visibleSlideIndex + direction) % this.visibleSlides.length;
      if (this.visibleSlideIndex < 0) {
        this.visibleSlideIndex += this.visibleSlides.length;
      }
      duration = this.visibleSlides[this.visibleSlideIndex].duration;

      this.visibleSlides[lastIndex].classes.fadeOut = true;
      this.visibleSlides[lastIndex].classes.fadeIn = false;
      this.visibleSlides[this.visibleSlideIndex].classes.fadeOut = false;
      this.visibleSlides[this.visibleSlideIndex].classes.fadeIn = true;
    } else {
      this.visibleSlideIndex = 0;
      duration = 60;
    }
    this.performUpdate();
    this.setSlideTimeout(1000 * duration);
  }

  private slidesChanged(): void {
    this.hasNewItems = true;
    this.clearSlideTimeout();
    this.showNextSlide(0);
  }

  private mergeCurrentWithNewItems(): void {
    const currentSlideId: number = this.visibleSlides.length ? this.visibleSlides[this.visibleSlideIndex].id : -1;
    this.visibleSlides = this.buildVisibleSlides(this.slidesInTimeRange(this.slides));
    this.visibleSlideIndex = 0;
    this.visibleSlides.forEach((slide, index) => {
      if (slide.id === currentSlideId) {
        this.visibleSlideIndex = index;
      }
    });
  }

  private slidesInTimeRange(slides: Array<Slide>): Array<Slide> {
    return slides.filter(slide => {
      if (slide.startTime && Date.parse(slide.startTime) > Date.now()) {
        return false;
      }
      if (slide.endTime && Date.parse(slide.endTime) < Date.now()) {
        return false;
      }
      return true;
    });
  }

  private setSlideTimeout(timeout: number): void {
    this.clearSlideTimeout();
    this.timeoutId = setTimeout(() => this.showNextSlide(+1), timeout);
  }

  private clearSlideTimeout(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  private buildVisibleSlides(slides: Array<Slide>): Array<any> {
    return slides
      .sort((s1: Slide, s2: Slide) => s1.displayOrder > s2.displayOrder ? -1 : 1)
      .map(slide => {
        const widthF: number = slide.image.width / this.windowWidth;
        const heightF: number = slide.image.height / this.windowHeight;
        let widthP: number = 100;
        let heightP: number = 100;
        if (widthF >= heightF) {
          heightP = Math.floor(100 * heightF / widthF);
        } else {
          widthP = Math.floor(100 * widthF / heightF);
        }
        return {
          id: slide.id,
          displayOrder: slide.displayOrder,
          webpageUrl: slide.image.type == 'URL' ? slide.image.url : undefined,
          imageUrl: slide.image.type == 'FILE' ? slide.image.url : undefined,
          duration: slide.duration,
          imageWidth: slide.image.width,
          imageHeight: slide.image.width,
          width: `${widthP}%`,
          height: `${heightP}%`,
          classes: { fadeOut: true, fadeIn: false },
        };
    });
  }

}
