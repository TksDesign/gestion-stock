import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../components/ui/button.component';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './order-success.component.html',
})
export class OrderSuccessComponent {}
