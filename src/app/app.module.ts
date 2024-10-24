import { NgModule } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { FriendsService } from './layout/service/friendsService';
import { JwtModule } from '@auth0/angular-jwt';

const customComponent = [FriendsService];

@NgModule({
  declarations: [AppComponent],
  imports: [AppRoutingModule, AppLayoutModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('accessToken'),
      },
    }),
  ],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }, ...customComponent],
  bootstrap: [AppComponent],
})
export class AppModule { }
