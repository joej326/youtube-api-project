import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, expand, mergeMap, of, takeWhile } from 'rxjs';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  hideForm: boolean = false;  
  channels: any = [];
  videos: any = [];
  nextPageToken: string = '';
  prevPageToken: string = '';
  form: FormGroup = new FormGroup({});
  isLastPage: boolean = false;
  fetchedChannelId: string = '';
  uploadsPlaylistId: string = '';

  constructor(private api: ApiService) { }

  
  ngOnInit() {

    this.form = new FormGroup({
      channelSearchQuery: new FormControl('')
    });
  }

  onPageChange(event: 'previous' | 'next') {
    this.api.getChannelVideos(this.uploadsPlaylistId, (event === 'next' ? this.nextPageToken : this.prevPageToken)).subscribe(
      (data: any) => {
        this.videos = [...data.items];
        this.nextPageToken = data.nextPageToken || '';
        this.prevPageToken = data.prevPageToken || '';
      }
    );
  }

  searchForChannel() {
    this.hideForm = true;
    this.api.searchForChannel(this.form.get('channelSearchQuery')?.value).subscribe(
      (data: any) => {
        this.channels = [...data.items];
      }
    );
  }

  onChannelSelect(channel: any) {
    this.channels = [];
    this.fetchedChannelId = channel.id.channelId;


    this.api.getChannelPlaylists(this.fetchedChannelId).pipe(mergeMap((data: any) => {
      this.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;

      return this.api.getChannelVideos(this.uploadsPlaylistId, '').pipe(
        expand((data: any) => data.nextPageToken ? this.api.getChannelVideos(this.uploadsPlaylistId, data.nextPageToken) : of('last page'))
      )
    })).subscribe(
      (data: any) => {
        if (data === 'last page') {
          this.isLastPage = true;
          return;
        }
        if (data.items) {
          this.videos = [...data.items];
        }
        this.nextPageToken = data.nextPageToken;
        this.prevPageToken = data.prevPageToken;
      }
    );
  }
}
