import { Component, signal } from '@angular/core';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  img: string;
}

const testimonials: Testimonial[] = [
  { id: 1, name: 'James K.', role: 'Software Engineer', text: "The quality is simply unmatched. I've taken this everywhere and it still looks brand new. The attention to detail in the craftsmanship is genuinely impressive.", img: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=150' },
  { id: 2, name: 'Sarah M.', role: 'Tech Reviewer', text: "Incredible style and unbelievable comfort. I've never felt more confident. The delivery was remarkably fast, and the unboxing experience felt truly premium.", img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=150' },
  { id: 3, name: 'David L.', role: 'Product Designer', text: "A truly luxurious experience from start to finish. The aesthetic is perfectly balanced. It's rare to find a brand that delivers on both form and function like this.", img: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=150' },
];

@Component({
  selector: 'app-testimonials-section',
  standalone: true,
  templateUrl: './testimonials-section.component.html',
})
export class TestimonialsSectionComponent {
  readonly testimonials = testimonials;
  readonly currentIndex = signal(1);
  readonly stars = [1, 2, 3, 4, 5];

  nextSlide() {
    this.currentIndex.update((prev) => (prev + 1) % testimonials.length);
  }

  prevSlide() {
    this.currentIndex.update((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }

  position(i: number): 'active' | 'prev' | 'next' | 'hidden' {
    const current = this.currentIndex();
    if (i === current) return 'active';
    if (i === (current - 1 + testimonials.length) % testimonials.length) return 'prev';
    if (i === (current + 1) % testimonials.length) return 'next';
    return 'hidden';
  }
}
