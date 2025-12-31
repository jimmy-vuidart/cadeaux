import { ChangeDetectionStrategy, Component, ElementRef, HostListener, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownMenuComponent {
  @Input() triggerText: string = '';
  @Input() menuItems: Array<{label: string; path: string; icon?: string; action?: () => void}> = [];
  
  isOpen = false;
  
  constructor(private elementRef: ElementRef) {}
  
  toggleMenu(): void {
    this.isOpen = !this.isOpen;
  }
  
  closeMenu(): void {
    this.isOpen = false;
  }
  
  handleItemClick(item: {label: string; path: string; icon?: string; action?: () => void}): void {
    if (item.action) {
      item.action();
    }
    this.closeMenu();
  }
  
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    if (this.isOpen && !this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }
}