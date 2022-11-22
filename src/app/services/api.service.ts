import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

 // @ts-ignore 
import { apiKey } from '../../../.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }
  

  searchForChannel(query: string) {
    return this.http.get(`https://www.googleapis.com/youtube/v3/search?type=channel&part=snippet,id&key=${apiKey}&q=${query}`);
  }

  getChannelVideos(channelId: string, nextPageToken: string) {
    return this.http.get(`https://www.googleapis.com/youtube/v3/search?channelId=${channelId}&part=snippet,id&order=date&maxResults=50&key=${apiKey}&pageToken=${nextPageToken}`);
  }

  
}
