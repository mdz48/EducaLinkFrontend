import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IComment } from '../models/icomment';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private url = environment.apiUrl;
  
  constructor(private http: HttpClient, private authService: AuthService) { }

  createComment(comment_text: string, post_id: number): Observable<any> {
    console.log(comment_text, post_id);
    console.log(this.authService.getToken());
    return this.http.post<any>(`${this.url}/comment`, {comment_text, post_id}, {
      headers: {
        'Authorization': `Bearer ${this.authService.getToken()}`
      }
    });
  }

  deleteComment(id_comment: number): Observable<any> {
    return this.http.delete<any>(`${this.url}/comment/${id_comment}`);
  }
}
