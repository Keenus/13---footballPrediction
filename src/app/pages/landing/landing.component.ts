import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    afterNextRender,
    inject,
    signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { APP_LOGO_URL } from '../../branding';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-landing',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink, MatIconModule],
    host: { class: 'block' },
    styleUrl: './landing.component.scss',
    templateUrl: './landing.component.html',
})
export class LandingComponent {
    readonly logoSrc = APP_LOGO_URL;

    navScrolled = signal(false);
    openFaq = signal<number | null>(null);

    private el = inject(ElementRef);
    private destroyRef = inject(DestroyRef);

    constructor() {
        afterNextRender(() => {
            const scrollHandler = () => this.navScrolled.set(window.scrollY > 40);
            window.addEventListener('scroll', scrollHandler, { passive: true });
            this.destroyRef.onDestroy(() => window.removeEventListener('scroll', scrollHandler));

            const observer = new IntersectionObserver(
                entries => entries.forEach(e => {
                    if (e.isIntersecting) {
                        e.target.classList.add('visible');
                        observer.unobserve(e.target);
                    }
                }),
                { threshold: 0.1 }
            );
            this.el.nativeElement.querySelectorAll('.reveal').forEach((el: Element) => observer.observe(el));
            this.destroyRef.onDestroy(() => observer.disconnect());

            const track = this.el.nativeElement.querySelector('#screensTrack');
            if (track?.parentNode) {
                const clone = track.cloneNode(true) as HTMLElement;
                clone.setAttribute('aria-hidden', 'true');
                clone.removeAttribute('id');
                track.parentNode.appendChild(clone);
            }
        });
    }

    toggleFaq(index: number) {
        this.openFaq.update(v => v === index ? null : index);
    }
}
