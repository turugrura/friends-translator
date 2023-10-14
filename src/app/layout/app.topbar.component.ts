import { Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { LayoutService } from './service/app.layout.service';
import { Subscription, map } from 'rxjs';

@Component({
  selector: 'app-topbar',
  templateUrl: './app.topbar.component.html',
})
export class AppTopBarComponent implements OnDestroy {
  items!: MenuItem[];

  @ViewChild('menubutton') menuButton!: ElementRef;

  @ViewChild('topbarmenubutton') topbarMenuButton!: ElementRef;

  @ViewChild('topbarmenu') menu!: ElementRef;

  visible = false;
  visibleInfo = false;
  friendEp: string;
  friendEp$ = this.layoutService.configUpdate$.pipe(map((a) => a.friendEp));

  sub: Subscription;

  constructor(public layoutService: LayoutService) {
    this.sub = this.layoutService.configUpdate$.subscribe((a) => {
      this.friendEp = a.friendEp;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  showDialog() {
    this.visible = true;
  }

  showInfoDialog() {
    this.visibleInfo = true;
  }
}
