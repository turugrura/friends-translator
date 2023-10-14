import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { PaginatorModule } from 'primeng/paginator';
import { ToastModule } from 'primeng/toast';
import { BlockUIModule } from 'primeng/blockui';
import { FriendsRoutingModule } from './friends-routing.module';
import { FriendsComponent } from './friends.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CustomPipeModule } from 'src/app/pipes/custom-pipe.module';

@NgModule({
  imports: [
    ButtonModule,
    CommonModule,
    ConfirmDialogModule,
    DropdownModule,
    InputTextModule,
    PaginatorModule,
    ProgressSpinnerModule,
    RippleModule,
    ToastModule,
    BlockUIModule,
    CustomPipeModule,
    AvatarModule,
    ChipModule,

    FriendsRoutingModule,
  ],
  declarations: [FriendsComponent],
})
export class FriendsModule {}
