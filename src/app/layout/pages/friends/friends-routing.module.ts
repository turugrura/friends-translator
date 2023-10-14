import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FriendsComponent } from './friends.component';

@NgModule({
  imports: [RouterModule.forChild([{ path: '', component: FriendsComponent }])],
  exports: [RouterModule],
})
export class FriendsRoutingModule {}
