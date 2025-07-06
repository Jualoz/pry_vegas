import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
bannerOpacity = '1';

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollY = window.scrollY;
    const maxScroll = 200; // cuán rápido se desvanece
    const opacity = Math.max(0, 1 - scrollY / maxScroll);
    this.bannerOpacity = opacity.toString();
  }
}
