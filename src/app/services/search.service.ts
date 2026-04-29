import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private url = environment.apiUrl;
  constructor(private http: HttpClient, private authService: AuthService) { }

  searchForumsByName(name: string) {
    return this.http.get(`${this.url}/forum/search/${name}`, this.authService.getHttpOptions());
  }

  searchUsersByName(name: string) {
    return this.http.get(`${this.url}/user/search/${name}`, this.authService.getHttpOptions());
  }

  searchPostsByTitle(title: string) {
    return this.http.get(`${this.url}/post/search/${title}`, this.authService.getHttpOptions());
  }

  searchSalesByTitle(name: string) {
    return this.http.get(`${this.url}/sale-post/search/${name}`, this.authService.getHttpOptions());
  }
}
