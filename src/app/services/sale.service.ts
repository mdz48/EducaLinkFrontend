import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISalePost } from '../models/isale-post';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = `${environment.apiUrl}/sale-post/`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  getSalePosts(): Observable<ISalePost[]> {
    return this.http.get<ISalePost[]>(this.apiUrl);
  }

  getSalePostsByUser(id_user: number): Observable<ISalePost[]> {
    return this.http.get<ISalePost[]>(`${this.apiUrl}user/${id_user}/`, this.authService.getHttpOptions());
  }

  createSalePost(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, formData, {
        headers: {
            'Authorization': `Bearer ${this.authService.getToken()}`
        }
    });
  }

  getSalePostById(id: number): Observable<ISalePost> {
    return this.http.get<ISalePost>(`${this.apiUrl}${id}/`);
  }

  updateSalePost(id: number, salePost: Partial<ISalePost>): Observable<ISalePost> {
    return this.http.put<ISalePost>(`${this.apiUrl}${id}/`, salePost);
  }

  deleteSalePost(id_sale_post: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}${id_sale_post}/`, this.authService.getHttpOptions());
  }

  getSalePostsByType(saleType: string): Observable<ISalePost[]> {
    return this.http.get<ISalePost[]>(`${this.apiUrl}type/${saleType}`);
  }
}
