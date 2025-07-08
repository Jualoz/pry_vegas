import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { acompanamientos, corrientes, especiales, normales } from './menus.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  width = 0;
  scrollY = 0;
  normales = normales;
  corrientes = corrientes;
  especiales = especiales;
  acompanamientos = acompanamientos;
  hoy = new Date().getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

  @HostListener('window:scroll', [])
  onScroll() {
    this.scrollY = window.scrollY;
    this.width = window.innerWidth;
  }
  
  get especialesDelDia() {
    return this.especiales.filter((e) => e.dias.includes(this.hoy));
  }

  get logoStyles() {
    const maxScroll = 300;
    const ratio = Math.min(this.scrollY / maxScroll, 1);
    let scale = 1 - 0.6 * ratio; // de 1 a 0.4
    const translateY = 0 - 130 * ratio; // de 0 a -130px
    let translateX = -50 - 200 * ratio; // de -50% a -250%

    if (this.width >= 768) {
      // Pantallas grandes
      scale = 1 - 0.4 * ratio; // de 1 a 0.6
      translateX = -50 - 150 * ratio; // de -50% a -200%
    } else if (this.width >= 480) {
      // Pantallas medianas
      translateX = -50 - 70 * ratio; // de -50% a -120%
    } else {
      // Pantallas pequeñas
      translateX = -50 - 30 * ratio; // de -50% a -120%
    }
    return {
      transform: `translate(${translateX}%, ${translateY}px) scale(${scale})`,
    };
  }

  get bannerOpacity() {
    const maxScroll = 300;
    return 1 - Math.min(this.scrollY / maxScroll, 1);
  }
}