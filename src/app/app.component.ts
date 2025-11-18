import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, expand, mergeMap, of, takeWhile } from 'rxjs';
import { ApiService } from './services/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  quotaExceeded: boolean = false;
  is404 = false;

  hideForm: boolean = false;  
  channels: any = [];
  videos: any = [];
  videosToDisplay: any = [];
  form: FormGroup = new FormGroup({});
  finishedLoading: boolean = false;
  fetchedChannelId: string = '';
  uploadsPlaylistId: string = '';
  loading: boolean = false;
  totalVideos: number = 0;
  showingOldest: boolean = false;


  clientPageSize = 5000;     // number of videos per UI page
  currentClientPage = 1;     // UI page index starting at 1
  visibleVideos: any[] = []; // only the slice shown in the UI

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
          console.log('hit!');
          this.chatGptMethod();

          this.finishedLoading = true;
          this.loading = false;
          // this.reverseVideosArray();
          return;
        }
        if (data.items) {
          this.videos = [...this.videos].concat(data.items);
          this.totalVideos = data.pageInfo.totalResults;

          this.chatGptMethod();
        }
      },
      error: (err) => this.handleErr(err)
   });
  }

  chatGptMethod() {
    const startIndex = (this.currentClientPage - 1) * this.clientPageSize;
    const endIndex = startIndex + this.clientPageSize;

    // Only slice if large dataset
    if (this.videos.length > this.clientPageSize) {
      this.videosToDisplay = this.videos.slice(startIndex, endIndex);
    } else {
      this.videosToDisplay = this.videos;
    }
  }
  get totalClientPages(): number {
  return Math.ceil(this.videos.length / this.clientPageSize);
}

prevPage(): void {
  if (this.currentClientPage > 1) {
    this.currentClientPage--;
    this.chatGptMethod();
  }
}

nextPage(): void {
  if (this.currentClientPage < this.totalClientPages) {
    this.currentClientPage++;
    this.chatGptMethod();
  }
}

  reverseVideosArray() {
    this.videos = [...this.videos].reverse();
    this.showingOldest = !this.showingOldest;
  }

  handleErr(err: HttpErrorResponse) {
    if (err.status === 403) {
      this.quotaExceeded = true;
      this.loading = false;
    }
    if (err.status === 404) {
      this.is404 = true;
      this.loading = false;
    }
  }


}


