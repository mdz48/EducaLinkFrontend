import { Component, Input, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FollowingSideComponent } from '../following-side/following-side.component';
import { GroupComponent } from '../group/group.component';
import { GroupListComponent } from '../group-list/group-list.component';
import { GroupItemComponent } from '../group-item/group-item.component';
import { AuthService } from '../../auth/auth.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { IForum } from '../../models/iforum';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { IUserData } from '../../models/iuser-data';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-right-side-panel',
  standalone: true,
  imports: [GroupItemComponent, CommonModule, SkeletonModule],
  templateUrl: './right-side-panel.component.html',
  styleUrl: './right-side-panel.component.css'
})
export class RightSidePanelComponent implements OnInit {
  @Input() forums: IForum[] = []
  @Input() user: IUserData = {} as IUserData;
  @Input() loadingForums = false;
  following: IUserData[] = [];
  loadingFollowing = true;

  constructor(
    private router: Router,
    private userService: UserService,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.user = this.authService.getUser() as IUserData;
    this.loadFollowing();
  }

  loadFollowing() {
    this.loadingFollowing = true;
    this.userService.getFollowing(this.user.id_user).subscribe({
      next: (data: IUserData[]) => {
        this.following = data;
        this.loadingFollowing = false;
      },
      error: () => {
        this.loadingFollowing = false;
      },
    });
  }

  goGroups() {
    this.userService.getTempId();
    if (!this.userService.getTempId()) {
      this.userService.setTempId(this.authService.getUser()?.id_user as number)
      this.router.navigate(['/user-forums']);
    }
    this.router.navigate(['/user-forums']);
  }

  goProfile(id_user: number) {
    this.userService.setTempId(id_user);
    this.router.navigate(['/profile', id_user]);
  }

  goFollowing(id_user: number) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('userTemp', JSON.stringify(id_user));
    }
    this.router.navigate(['/user-following']);
  }
}
