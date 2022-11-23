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

  getChannelPlaylists(channelId: string) {
    return this.http.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`);
  }

  getChannelVideos(playlistId: string, nextPageToken: string) {
    return this.http.get(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=50&key=${apiKey}&pageToken=${nextPageToken}`);
  }

  
}
