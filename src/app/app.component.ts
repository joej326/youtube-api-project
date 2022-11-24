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
  quotaExceeded: boolean = false;

  hideForm: boolean = false;  
  channels: any = [];
  videos: any = [];
  form: FormGroup = new FormGroup({});
  finishedLoading: boolean = false;
  fetchedChannelId: string = '';
  uploadsPlaylistId: string = '';
  loading: boolean = false;
  totalVideos: number = 0;

  constructor(private api: ApiService) { }


  ngOnInit() {

    this.form = new FormGroup({
      channelSearchQuery: new FormControl('')
    });
  }


  searchForChannel() {
    this.hideForm = true;
    this.api.searchForChannel(this.form.get('channelSearchQuery')?.value).subscribe({
      next: (data: any) => {
        this.channels = [...data.items];
      },
      error: (err) => this.handleErr(err)
    });
  }

  onChannelSelect(channel: any) {
    this.channels = [];
    this.fetchedChannelId = channel.id.channelId;


    this.api.getChannelPlaylists(this.fetchedChannelId).pipe(mergeMap((data: any) => {
      this.uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
      this.loading = true;

      return this.api.getChannelVideos(this.uploadsPlaylistId, '').pipe(
        expand((data: any) => data.nextPageToken ? this.api.getChannelVideos(this.uploadsPlaylistId, data.nextPageToken) : of('last page'))
      )
    })).subscribe({
      next: (data: any) => {
        if (this.finishedLoading) {
          return;
        }
        if (data === 'last page') {
          this.finishedLoading = true;
          this.loading = false;
          this.videos = [...this.videos].reverse();
          return;
        }
        if (data.items) {
          this.videos = [...this.videos].concat(data.items);
          this.totalVideos = data.pageInfo.totalResults;
        }
      },
      error: (err) => this.handleErr(err)
   });
  }

  handleErr(err: any) {
    if (err.status === 403) {
      this.quotaExceeded = true;
    }
  }


}


